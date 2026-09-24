import io
import json
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.config import APP_NAME, API_V1_STR, SAMPLE_CONFIGS_DIR
from app.database import engine, Base, get_db
from app.models.device import DeviceConfig
from app.models.audit import ComplianceAudit
from app.models.heuristic import LearnedHeuristic
from app.schemas.baseline import CanonicalSecurityBaseline
from app.schemas.audit import IngestConfigRequest, DeviceAuditReport, FrameworkAuditSummary
from app.schemas.heuristic import CreateHeuristicRequest, HeuristicResponse, NLPSuggestion
from app.services.normalizer.normalizer_service import NormalizerService
from app.services.compliance.compliance_engine import ComplianceEngine
from app.services.remediation.remediation_engine import RemediationEngine
from app.services.training.learning_loop import LearningLoopService
from app.services.reporting.pdf_generator import PDFReportGenerator

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=APP_NAME,
    description="AI-Augmented, Vendor-Agnostic Network Device Compliance & Hardening Engine",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "app": APP_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get(f"{API_V1_STR}/health")
def health_check():
    return {"status": "healthy", "service": "NetArmor AI Engine"}

# -------------------------------------------------------------
# SAMPLE CONFIGURATIONS API
# -------------------------------------------------------------
@app.get(f"{API_V1_STR}/samples")
def get_sample_configs():
    samples = [
        {
            "id": "cisco_catalyst_3850",
            "name": "Cisco Catalyst 3850 (IOS-XE)",
            "vendor": "Cisco",
            "description": "Enterprise Core/Access Switch with legacy telnet and default SNMP strings.",
            "filename": "cisco_catalyst_3850.cfg"
        },
        {
            "id": "fortigate_fortios_7",
            "name": "Fortinet FortiGate 60E (FortiOS 7.0)",
            "vendor": "Fortinet",
            "description": "Next-Gen Firewall with permissive administration policies.",
            "filename": "fortigate_fortios_7.cfg"
        },
        {
            "id": "paloalto_panos_10",
            "name": "Palo Alto Networks (PAN-OS 10)",
            "vendor": "Palo Alto",
            "description": "Perimeter firewall configuration with strict security zones.",
            "filename": "paloalto_panos_10.cfg"
        },
        {
            "id": "juniper_srx_junos",
            "name": "Juniper Networks SRX (JunOS 21.4)",
            "vendor": "Juniper",
            "description": "Branch SRX gateway with hierarchical JunOS formatting.",
            "filename": "juniper_srx_junos.cfg"
        },
        {
            "id": "arista_eos_switch",
            "name": "Arista 7050SX (EOS 4.28)",
            "vendor": "Arista",
            "description": "Data center top-of-rack leaf switch with eAPI configuration.",
            "filename": "arista_eos_switch.cfg"
        },
        {
            "id": "sonic_whitebox_switch",
            "name": "SONiC Whitebox Disaggregated Switch",
            "vendor": "SONiC / Whitebox",
            "description": "Open networking Linux configuration database (config_db.json).",
            "filename": "sonic_whitebox_switch.json"
        },
        {
            "id": "unseen_nexthardware_v1",
            "name": "NexaEdge 9200 (Novel/Unseen Vendor)",
            "vendor": "Custom / Unseen",
            "description": "Proprietary CLI syntax used to test the interactive AI Training Loop.",
            "filename": "unseen_nexthardware_v1.cfg"
        }
    ]
    return samples

@app.get(f"{API_V1_STR}/samples/{{sample_id}}")
def get_sample_content(sample_id: str):
    file_map = {
        "cisco_catalyst_3850": "cisco_catalyst_3850.cfg",
        "fortigate_fortios_7": "fortigate_fortios_7.cfg",
        "paloalto_panos_10": "paloalto_panos_10.cfg",
        "juniper_srx_junos": "juniper_srx_junos.cfg",
        "arista_eos_switch": "arista_eos_switch.cfg",
        "sonic_whitebox_switch": "sonic_whitebox_switch.json",
        "unseen_nexthardware_v1": "unseen_nexthardware_v1.cfg"
    }
    filename = file_map.get(sample_id)
    if not filename:
        raise HTTPException(status_code=404, detail="Sample configuration not found")

    file_path = SAMPLE_CONFIGS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Sample configuration file missing on disk")

    return {
        "sample_id": sample_id,
        "filename": filename,
        "content": file_path.read_text(encoding="utf-8")
    }

# -------------------------------------------------------------
# UNIFIED INGESTION & COMPLIANCE AUDIT API
# -------------------------------------------------------------
def _process_audit(raw_config: str, vendor_override: Optional[str], db: Session) -> DeviceAuditReport:
    heuristics = LearningLoopService.list_heuristics(db)
    baseline: CanonicalSecurityBaseline = NormalizerService.normalize_config(
        config_text=raw_config,
        vendor_override=vendor_override,
        heuristics=heuristics
    )

    # Save Device record
    device = DeviceConfig(
        hostname=baseline.hostname,
        vendor=baseline.vendor,
        model=baseline.model,
        os_version=baseline.os_version,
        serial_number=baseline.serial_number,
        raw_config=raw_config
    )
    db.add(device)
    db.commit()
    db.refresh(device)

    # Run multi-framework compliance evaluation
    framework_results = ComplianceEngine.audit_all_frameworks(baseline)

    # Save primary CIS audit record
    cis_res = framework_results.get("CIS")
    if cis_res:
        audit_record = ComplianceAudit(
            device_id=device.id,
            framework="CIS",
            compliance_score=cis_res.compliance_score,
            passed_count=cis_res.passed_count,
            failed_count=cis_res.failed_count,
            warning_count=cis_res.warning_count,
            total_controls=cis_res.total_controls,
            findings_json=json.dumps([f.model_dump() for f in cis_res.findings])
        )
        db.add(audit_record)
        db.commit()

    # Generate full device-specific CLI remediation script for failed findings
    primary_failed = [f for f in cis_res.findings if f.status in ["FAIL", "WARNING"]] if cis_res else []
    full_remediation = RemediationEngine.generate_full_remediation_script(
        vendor=baseline.vendor,
        failed_findings=primary_failed
    )

    return DeviceAuditReport(
        device_id=device.id,
        hostname=baseline.hostname,
        vendor=baseline.vendor,
        model=baseline.model,
        os_version=baseline.os_version,
        serial_number=baseline.serial_number,
        baseline=baseline.model_dump(),
        active_framework="CIS",
        framework_results=framework_results,
        remediation_script=full_remediation,
        unparsed_lines=baseline.unparsed_lines,
        training_status={
            "total_lines": baseline.total_lines_analyzed,
            "recognized_lines": baseline.recognized_lines_count,
            "unparsed_count": len(baseline.unparsed_lines),
            "heuristic_matches": baseline.heuristic_matched_count
        }
    )

@app.post(f"{API_V1_STR}/ingest", response_model=DeviceAuditReport)
def ingest_config(req: IngestConfigRequest, db: Session = Depends(get_db)):
    if not req.raw_config.strip():
        raise HTTPException(status_code=400, detail="Configuration content cannot be empty")
    return _process_audit(req.raw_config, req.vendor_override, db)

@app.post(f"{API_V1_STR}/upload-file", response_model=DeviceAuditReport)
async def upload_file(
    file: UploadFile = File(...),
    vendor_override: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    raw_config = contents.decode("utf-8", errors="ignore")
    if not raw_config.strip():
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    return _process_audit(raw_config, vendor_override, db)

# -------------------------------------------------------------
# AI TRAINING MODULE & HEURISTICS API
# -------------------------------------------------------------
@app.get(f"{API_V1_STR}/heuristics", response_model=List[HeuristicResponse])
def get_heuristics(vendor: Optional[str] = None, db: Session = Depends(get_db)):
    return LearningLoopService.list_heuristics(db, vendor)

@app.post(f"{API_V1_STR}/heuristics", response_model=HeuristicResponse)
def create_heuristic(req: CreateHeuristicRequest, db: Session = Depends(get_db)):
    return LearningLoopService.create_heuristic(db, req)

@app.delete(f"{API_V1_STR}/heuristics/{{heuristic_id}}")
def delete_heuristic(heuristic_id: int, db: Session = Depends(get_db)):
    ok = LearningLoopService.delete_heuristic(db, heuristic_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Heuristic not found")
    return {"message": "Heuristic deactivated successfully"}

@app.post(f"{API_V1_STR}/training/suggest", response_model=List[NLPSuggestion])
def get_training_suggestions(lines: List[str]):
    return LearningLoopService.get_unparsed_line_suggestions(lines)

# -------------------------------------------------------------
# DYNAMIC PDF AUDIT REPORT EXPORT
# -------------------------------------------------------------
@app.post(f"{API_V1_STR}/reports/pdf")
def generate_pdf_report(report: DeviceAuditReport, framework: str = "CIS"):
    pdf_buffer = PDFReportGenerator.generate_audit_pdf(report, framework)
    safe_host = report.hostname.replace(" ", "_")
    filename = f"NetArmor_Audit_{safe_host}_{framework}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# -------------------------------------------------------------
# RBAC & ROLE-BASED WORKFLOW ENDPOINTS (SIH26155)
# -------------------------------------------------------------
from pydantic import BaseModel, Field

class LoginRequest(BaseModel):
    username: str
    password: str

class DeviceCreate(BaseModel):
    name: str
    vendor: str
    device_type: str = "Router"
    ip: str = "192.168.1.1"
    os_version: str = "IOS-XE"
    location: str = "Server Room"
    group: str = "Core Network"

class UserCreate(BaseModel):
    username: str
    name: str
    email: str
    role: str  # Admin, Security Admin, Auditor, Viewer
    status: str = "Active"

class VerificationCreate(BaseModel):
    device_id: Optional[str] = "EDGE-SW-01"
    benchmark_id: str
    status: str  # VALID or FALSE_POSITIVE
    auditor_notes: str = ""
    auditor_name: str = "Priya Patel (Auditor)"

class AIReviewAction(BaseModel):
    command: str
    assigned_category: str
    decision: str  # ACCEPT or REJECT
    notes: Optional[str] = ""

# In-memory operational stores for full prototype realism
_devices_store = [
    {
        "id": "dev-01",
        "name": "Core-Router-01",
        "vendor": "Cisco",
        "device_type": "Router",
        "ip": "192.168.1.1",
        "os_version": "IOS-XE 17.3",
        "location": "Server Room Rack 02",
        "group": "Core Network",
        "status": "Audited",
        "last_audit_score": 83,
        "last_audited_at": "Today, 09:30 AM"
    },
    {
        "id": "dev-02",
        "name": "Edge-Firewall-01",
        "vendor": "Fortinet",
        "device_type": "Next-Gen Firewall",
        "ip": "192.168.1.254",
        "os_version": "FortiOS 7.0.5",
        "location": "Perimeter Rack",
        "group": "Security Perimeter",
        "status": "Audited",
        "last_audit_score": 75,
        "last_audited_at": "Today, 08:45 AM"
    },
    {
        "id": "dev-03",
        "name": "DC-PAN-FW01",
        "vendor": "Palo Alto",
        "device_type": "Data Center Firewall",
        "ip": "10.0.10.1",
        "os_version": "PAN-OS 10.1",
        "location": "Data Center A",
        "group": "Security Perimeter",
        "status": "Audited",
        "last_audit_score": 88,
        "last_audited_at": "Yesterday"
    },
    {
        "id": "dev-04",
        "name": "BR-JUNIPER-SRX",
        "vendor": "Juniper",
        "device_type": "Branch Gateway",
        "ip": "172.16.5.1",
        "os_version": "JunOS 21.4R1",
        "location": "Branch Office (Mumbai)",
        "group": "Branch Network",
        "status": "Audited",
        "last_audit_score": 67,
        "last_audited_at": "Yesterday"
    },
    {
        "id": "dev-05",
        "name": "DC2-LEAF-01",
        "vendor": "Arista",
        "device_type": "TOR Leaf Switch",
        "ip": "10.0.20.11",
        "os_version": "EOS 4.28",
        "location": "Data Center B",
        "group": "Switching Fabric",
        "status": "Pending Audit",
        "last_audit_score": None,
        "last_audited_at": "Not Yet Audited"
    },
    {
        "id": "dev-06",
        "name": "SONIC-LEAF-TOR-01",
        "vendor": "SONiC",
        "device_type": "Whitebox Disaggregated",
        "ip": "10.0.30.1",
        "os_version": "SONiC Linux 202111",
        "location": "Cloud Colo",
        "group": "Open Networking",
        "status": "Audited",
        "last_audit_score": 60,
        "last_audited_at": "2 days ago"
    }
]

_users_store = [
    {
        "id": "usr-01",
        "username": "vikram_admin",
        "name": "Vikram Malhotra",
        "email": "vikram@netarmor.internal",
        "role": "Admin",
        "status": "Active",
        "last_login": "Today, 09:12 AM",
        "permissions": "Full Platform Control (Users, Roles, Frameworks, Rules, System Settings)"
    },
    {
        "id": "usr-02",
        "username": "rahul_secadmin",
        "name": "Rahul Sharma",
        "email": "rahul@netarmor.internal",
        "role": "Security Admin",
        "status": "Active",
        "last_login": "Today, 09:40 AM",
        "permissions": "Operational (Device Management, Upload Configs, Run Audits, Apply Remediation, Re-scan)"
    },
    {
        "id": "usr-03",
        "username": "priya_auditor",
        "name": "Priya Patel",
        "email": "priya@netarmor.internal",
        "role": "Auditor",
        "status": "Active",
        "last_login": "Today, 09:25 AM",
        "permissions": "Compliance & Audit (Evidence Verification, AI Review, Generate Reports, Audit History)"
    },
    {
        "id": "usr-04",
        "username": "abhishek_viewer",
        "name": "Abhishek Vishwakarma",
        "email": "user@example.com",
        "role": "Viewer",
        "status": "Active",
        "last_login": "Today, 10:05 AM",
        "permissions": "Security Compliance Consumer & Executive Reporting (View Dashboards, Risk Analysis, Posture, Reports)"
    }
]

_audit_logs_store = [
    {
        "id": "log-01",
        "timestamp": "Today, 09:42 AM",
        "actor": "Rahul Sharma",
        "role": "Security Admin",
        "action": "UPLOAD_CONFIGURATION",
        "target": "cisco_catalyst_3850.cfg (Core-Router-01)",
        "status": "Success"
    },
    {
        "id": "log-02",
        "timestamp": "Today, 09:43 AM",
        "actor": "Compliance Engine",
        "role": "System",
        "action": "RUN_AUDIT_CIS",
        "target": "CIS Benchmark v1.0 • Score: 83%",
        "status": "Success"
    },
    {
        "id": "log-03",
        "timestamp": "Today, 09:48 AM",
        "actor": "Priya Patel",
        "role": "Auditor",
        "action": "EVIDENCE_VERIFICATION",
        "target": "CIS-1.1: Telnet Service Disabled -> Marked as VALID FINDING",
        "status": "Verified"
    },
    {
        "id": "log-04",
        "timestamp": "Today, 09:50 AM",
        "actor": "Rahul Sharma",
        "role": "Security Admin",
        "action": "REMEDIATION_GENERATE",
        "target": "Synthesized Cisco CLI patch (no ip telnet server)",
        "status": "Generated"
    },
    {
        "id": "log-05",
        "timestamp": "Today, 09:55 AM",
        "actor": "Vikram Malhotra",
        "role": "Admin",
        "action": "AI_KNOWLEDGE_APPROVE",
        "target": "Learned Heuristic rule: idle_timeout_seconds -> 900s",
        "status": "Approved"
    },
    {
        "id": "log-06",
        "timestamp": "Today, 10:02 AM",
        "actor": "Priya Patel",
        "role": "Auditor",
        "action": "EXPORT_DOSSIER_PDF",
        "target": "Executive Compliance Report for Core-Router-01",
        "status": "Downloaded"
    }
]

_audit_history_store = [
    {
        "audit_id": "AUD-2026-001",
        "name": "Audit 01 (Initial Baseline Scan)",
        "date": "2026-09-10",
        "compliance_score": 64,
        "passed_count": 5,
        "failed_count": 9,
        "critical_count": 5,
        "high_count": 8,
        "medium_count": 6,
        "notes": "Initial inventory audit. Critical exposures: Insecure Telnet active, default SNMP public community."
    },
    {
        "audit_id": "AUD-2026-002",
        "name": "Audit 02 (Post-Credentials Remediation)",
        "date": "2026-09-17",
        "compliance_score": 78,
        "passed_count": 9,
        "failed_count": 5,
        "critical_count": 2,
        "high_count": 4,
        "medium_count": 4,
        "notes": "Telnet disabled, password encryption standard enabled across VTY lines. Re-scan verified."
    },
    {
        "audit_id": "AUD-2026-003",
        "name": "Audit 03 (Hardening Verification)",
        "date": "2026-09-24",
        "compliance_score": 91,
        "passed_count": 13,
        "failed_count": 1,
        "critical_count": 0,
        "high_count": 1,
        "medium_count": 2,
        "notes": "Syslog server forwarding configured and NTP auth enabled. Zero critical vulnerabilities remaining."
    }
]

_verifications_store = {}

_ai_reviews_store = [
    {
        "id": "air-01",
        "command": "set security-session-timeout 15",
        "vendor": "Custom / Unseen Vendor",
        "ai_prediction": "Session Management (idle_timeout_seconds)",
        "confidence": 68,
        "status": "NEEDS REVIEW",
        "suggested_categories": ["Session Management", "Authentication", "Encryption", "Logging", "Access Control"],
        "human_decision": None
    },
    {
        "id": "air-02",
        "command": "enforce-aaa-server-group radius-corp-01",
        "vendor": "Generic Hardware",
        "ai_prediction": "Central RADIUS/TACACS+ Integration",
        "confidence": 88,
        "status": "APPROVED",
        "suggested_categories": ["Authentication", "Session Management", "Access Control"],
        "human_decision": "Accepted"
    },
    {
        "id": "air-03",
        "command": "audit-stream target 10.10.50.25 port 514 udp",
        "vendor": "Custom / Whitebox",
        "ai_prediction": "Remote SIEM/Syslog Server Forwarding",
        "confidence": 74,
        "status": "NEEDS REVIEW",
        "suggested_categories": ["Logging", "Telemetry", "Network Flow", "Management Plane"],
        "human_decision": None
    }
]

# Authentication endpoint
@app.post(f"{API_V1_STR}/auth/login")
def login(req: LoginRequest):
    uname = req.username.strip().lower()
    user = next((u for u in _users_store if u["username"].lower() == uname or u["email"].lower() == uname), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    valid_passwords = ["password123", "netarmor123", "admin123"]
    if req.password not in valid_passwords and req.password != user.get("password", "password123"):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    role_map = {
        "Admin": "admin",
        "Security Admin": "security_admin",
        "Auditor": "auditor",
        "Viewer": "viewer"
    }
    system_role = role_map.get(user["role"], "security_admin")
    user["last_login"] = "Just Now"
    
    return {
        "success": True,
        "token": f"token-{user['id']}-secure",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "system_role": system_role,
            "permissions": user.get("permissions", "")
        }
    }

# Devices endpoints
@app.get(f"{API_V1_STR}/devices")
def get_devices():
    return _devices_store

@app.post(f"{API_V1_STR}/devices")
def add_device(dev: DeviceCreate):
    new_dev = {
        "id": f"dev-{len(_devices_store) + 1:02d}",
        "name": dev.name,
        "vendor": dev.vendor,
        "device_type": dev.device_type,
        "ip": dev.ip,
        "os_version": dev.os_version,
        "location": dev.location,
        "group": dev.group,
        "status": "Pending Audit",
        "last_audit_score": None,
        "last_audited_at": "Just Added"
    }
    _devices_store.append(new_dev)
    _audit_logs_store.insert(0, {
        "id": f"log-{len(_audit_logs_store) + 1:02d}",
        "timestamp": "Just Now",
        "actor": "Security Admin",
        "role": "Security Admin",
        "action": "ADD_DEVICE",
        "target": f"{dev.name} ({dev.vendor})",
        "status": "Success"
    })
    return new_dev

@app.delete(f"{API_V1_STR}/devices/{{device_id}}")
def delete_device(device_id: str):
    global _devices_store
    _devices_store = [d for d in _devices_store if d["id"] != device_id]
    return {"message": "Device deleted successfully"}

class DeviceAuditRequest(BaseModel):
    score: Optional[float] = None

@app.post(f"{API_V1_STR}/devices/{{device_id}}/audit")
def audit_device_record(device_id: str, payload: Optional[DeviceAuditRequest] = None):
    global _devices_store
    dev = next((d for d in _devices_store if d["id"] == device_id), None)
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found")
    
    score = payload.score if (payload and payload.score is not None) else 83.3
    dev["status"] = "Audited"
    dev["last_audit_score"] = round(score, 1)
    dev["last_audited_at"] = "Just Now"

    _audit_logs_store.insert(0, {
        "id": f"log-{len(_audit_logs_store) + 1:02d}",
        "timestamp": "Just Now",
        "actor": "Security Admin",
        "role": "Security Admin",
        "action": "RUN_AUDIT",
        "target": f"{dev['name']} ({dev['vendor']}) - Score: {dev['last_audit_score']}%",
        "status": "Success"
    })
    return dev

# Users endpoints
@app.get(f"{API_V1_STR}/admin/users")
def get_users():
    return _users_store

@app.post(f"{API_V1_STR}/admin/users")
def create_user(u: UserCreate):
    perm_map = {
        "Admin": "Full Platform Control (Users, Roles, Frameworks, Rules, System Settings)",
        "Security Admin": "Operational (Device Management, Upload Configs, Run Audits, Apply Remediation, Re-scan)",
        "Auditor": "Compliance & Audit (Evidence Verification, AI Review, Generate Reports, Audit History)",
        "Viewer": "Read-Only Access (View Dashboards, Device Posture, Findings, Reports)"
    }
    new_user = {
        "id": f"usr-{len(_users_store) + 1:02d}",
        "username": u.username,
        "name": u.name,
        "email": u.email,
        "role": u.role,
        "status": u.status,
        "last_login": "Never",
        "permissions": perm_map.get(u.role, "Standard User")
    }
    _users_store.append(new_user)
    _audit_logs_store.insert(0, {
        "id": f"log-{len(_audit_logs_store) + 1:02d}",
        "timestamp": "Just Now",
        "actor": "Admin",
        "role": "Admin",
        "action": "CREATE_USER",
        "target": f"{u.name} (Role: {u.role})",
        "status": "Success"
    })
    return new_user

@app.delete(f"{API_V1_STR}/admin/users/{{user_id}}")
def delete_user(user_id: str):
    global _users_store
    _users_store = [u for u in _users_store if u["id"] != user_id]
    return {"message": "User deleted successfully"}

# Audit logs
@app.get(f"{API_V1_STR}/admin/audit-logs")
def get_audit_logs():
    return _audit_logs_store

# Multi-Audit History
@app.get(f"{API_V1_STR}/audits/history")
def get_audit_history():
    return _audit_history_store

# Evidence Verification ⭐
@app.get(f"{API_V1_STR}/audits/verifications")
def get_verifications():
    return _verifications_store

@app.post(f"{API_V1_STR}/audits/verify-finding")
def verify_finding(req: VerificationCreate):
    _verifications_store[req.benchmark_id] = {
        "status": req.status,
        "notes": req.auditor_notes,
        "auditor": req.auditor_name,
        "timestamp": "Today"
    }
    _audit_logs_store.insert(0, {
        "id": f"log-{len(_audit_logs_store) + 1:02d}",
        "timestamp": "Just Now",
        "actor": req.auditor_name,
        "role": "Auditor",
        "action": "EVIDENCE_VERIFICATION",
        "target": f"{req.benchmark_id} -> {req.status}",
        "status": "Verified"
    })
    return {"message": "Verification recorded", "data": _verifications_store[req.benchmark_id]}

# AI Human-in-the-Loop Reviews
@app.get(f"{API_V1_STR}/audits/ai-reviews")
def get_ai_reviews():
    return _ai_reviews_store

@app.post(f"{API_V1_STR}/audits/ai-review/{{review_id}}")
def submit_ai_review(review_id: str, action: AIReviewAction):
    for r in _ai_reviews_store:
        if r["id"] == review_id:
            r["status"] = "RESOLVED" if action.decision == "ACCEPT" else "REJECTED"
            r["human_decision"] = f"{action.decision}ed as '{action.assigned_category}'"
            _audit_logs_store.insert(0, {
                "id": f"log-{len(_audit_logs_store) + 1:02d}",
                "timestamp": "Just Now",
                "actor": "Auditor / Security Admin",
                "role": "Human-in-the-Loop",
                "action": "AI_SYNTAX_REVIEW",
                "target": f"Command: '{r['command']}' -> {action.assigned_category}",
                "status": "Resolved"
            })
            return {"message": "Human review recorded successfully", "review": r}
    raise HTTPException(status_code=404, detail="Review item not found")

# -------------------------------------------------------------
# VIEWER / MANAGEMENT COMPLIANCE CONSUMER ENDPOINTS
# -------------------------------------------------------------
@app.get(f"{API_V1_STR}/viewer/overview")
def get_viewer_overview():
    return {
        "user": {
            "name": "Abhishek Vishwakarma",
            "role": "Viewer / Security Compliance Consumer",
            "department": "Security Operations & Compliance",
            "last_login": "24 Sep 2026, 10:05 AM"
        },
        "metrics": {
            "total_devices": 128,
            "devices_trend": "+4 this wk",
            "compliance_score": 86,
            "compliance_trend": "+7% this wk",
            "total_findings": 42,
            "findings_trend": "-8 this wk",
            "critical_findings": 5,
            "critical_trend": "-2 this wk",
            "high_findings": 12,
            "medium_findings": 18,
            "low_findings": 7,
            "last_audit_time": "2 hours ago",
            "status": "Monitoring"
        },
        "compliance_trend_history": [
            {"day": "Mon", "score": 78},
            {"day": "Tue", "score": 80},
            {"day": "Wed", "score": 82},
            {"day": "Thu", "score": 84},
            {"day": "Fri", "score": 85},
            {"day": "Sat", "score": 86}
        ],
        "improvement_pct": 8.4,
        "frameworks": {
            "CIS": {
                "name": "CIS Benchmark",
                "score": 91,
                "total_controls": 120,
                "passed": 109,
                "failed": 11,
                "needs_review": 0,
                "domains": {
                    "Authentication": 95,
                    "Access Control": 88,
                    "Logging": 92,
                    "Encryption": 89,
                    "Network Security": 94
                }
            },
            "NIST": {
                "name": "NIST SP 800-53",
                "score": 84,
                "total_controls": 110,
                "passed": 92,
                "failed": 18,
                "needs_review": 0,
                "domains": {
                    "Access Control (AC)": 88,
                    "Audit & Accountability (AU)": 92,
                    "Identification & Auth (IA)": 82,
                    "System & Comm Protection (SC)": 76
                }
            },
            "STIG": {
                "name": "DoD DISA STIG",
                "score": 79,
                "total_controls": 95,
                "passed": 75,
                "failed": 20,
                "needs_review": 0,
                "domains": {
                    "CAT I (Critical)": 82,
                    "CAT II (High)": 77,
                    "CAT III (Medium)": 85
                }
            },
            "ISO27001": {
                "name": "ISO/IEC 27001",
                "score": 88,
                "total_controls": 80,
                "passed": 70,
                "failed": 10,
                "needs_review": 0,
                "domains": {
                    "Configuration (A.8.9)": 90,
                    "Logging (A.8.15)": 92,
                    "Network Security (A.8.20)": 85,
                    "Cryptography (A.8.24)": 86
                }
            }
        },
        "device_distribution": [
            {"vendor": "Cisco", "count": 42, "color": "#2563eb"},
            {"vendor": "Fortinet", "count": 31, "color": "#e11d48"},
            {"vendor": "Juniper", "count": 18, "color": "#059669"},
            {"vendor": "Palo Alto", "count": 14, "color": "#ea580c"},
            {"vendor": "Others / Whitebox", "count": 23, "color": "#7c3aed"}
        ],
        "top_security_issues": [
            {
                "id": "ISSUE-01",
                "title": "Telnet Enabled on Management Plane",
                "severity": "CRITICAL",
                "devices_affected": 8,
                "impact": "Transmits cleartext authentication credentials over network segments.",
                "recommendation": "Disable Telnet and enforce SSHv2 on all administrative lines."
            },
            {
                "id": "ISSUE-02",
                "title": "Weak Password Policy & Reversible Hashing",
                "severity": "HIGH",
                "devices_affected": 6,
                "impact": "Type 7 reversible passwords susceptible to trivial rainbow table cracking.",
                "recommendation": "Enforce PBKDF2/SHA-512 cryptographic password hashing."
            },
            {
                "id": "ISSUE-03",
                "title": "Outdated SSH Protocol Configuration",
                "severity": "HIGH",
                "devices_affected": 12,
                "impact": "Legacy cipher suites allow man-in-the-middle decryption.",
                "recommendation": "Enforce strict SSH version 2 with modern cipher suites."
            },
            {
                "id": "ISSUE-04",
                "title": "Centralized Syslog SIEM Not Configured",
                "severity": "MEDIUM",
                "devices_affected": 9,
                "impact": "Audit logs stored only locally risk buffer overwrite and tampering.",
                "recommendation": "Forward security event streams to centralized SIEM hosts."
            }
        ],
        "recent_audits": [
            {
                "device": "Cisco-Router-01",
                "vendor": "Cisco",
                "framework": "CIS Benchmark",
                "timestamp": "Today, 09:42",
                "status": "Completed",
                "score": 91
            },
            {
                "device": "Fortigate-FW-02",
                "vendor": "Fortinet",
                "framework": "NIST SP 800-53",
                "timestamp": "Today, 08:15",
                "status": "Issues Found",
                "score": 84
            },
            {
                "device": "Core-Switch-04",
                "vendor": "Cisco",
                "framework": "CIS Benchmark",
                "timestamp": "Yesterday",
                "status": "Completed",
                "score": 93
            }
        ]
    }

@app.get(f"{API_V1_STR}/viewer/reports")
def get_viewer_reports():
    return [
        {
            "id": "rep-01",
            "name": "Monthly Executive Compliance Report",
            "date": "Sep 2026",
            "type": "PDF",
            "size": "4.2 MB",
            "status": "Ready",
            "framework": "CIS / NIST Multi-Standard",
            "description": "Comprehensive monthly audit summary of all 128 enterprise devices for executive leadership."
        },
        {
            "id": "rep-02",
            "name": "CIS Benchmark Technical Audit Dossier",
            "date": "Sep 2026",
            "type": "PDF",
            "size": "2.8 MB",
            "status": "Ready",
            "framework": "CIS Level 1 & 2",
            "description": "Granular rule-by-rule evaluation results across routers, switches, and security gateways."
        },
        {
            "id": "rep-03",
            "name": "Perimeter Firewall Security Assessment",
            "date": "Sep 2026",
            "type": "PDF",
            "size": "3.1 MB",
            "status": "Ready",
            "framework": "NIST SP 800-53",
            "description": "Security posture evaluation of edge Fortinet and Palo Alto next-generation firewalls."
        },
        {
            "id": "rep-04",
            "name": "Device Hardening & Remediation Progress Report",
            "date": "Sep 2026",
            "type": "PDF",
            "size": "1.9 MB",
            "status": "Ready",
            "framework": "Multi-Vendor Hardening",
            "description": "Verification audit showing security score improvement from 64% to 91% post-remediation."
        }
    ]

@app.get(f"{API_V1_STR}/viewer/notifications")
def get_viewer_notifications():
    return [
        {
            "id": "notif-01",
            "title": "Critical Security Finding Detected",
            "message": "A critical compliance deviation (Telnet active on VTY lines) was discovered on Cisco-Router-01 during baseline scan.",
            "timestamp": "10 minutes ago",
            "type": "critical",
            "category": "Critical",
            "read": false
        },
        {
            "id": "notif-02",
            "title": "Compliance Threshold Alert",
            "message": "Aggregate CIS compliance posture in Network Group A dropped below the 80% SLA threshold.",
            "timestamp": "1 hour ago",
            "type": "warning",
            "category": "Compliance",
            "read": false
        },
        {
            "id": "notif-03",
            "title": "Security Remediation Verified",
            "message": "Insecure management access on Fortigate-FW-02 has been successfully remediated and verified by lead auditor.",
            "timestamp": "3 hours ago",
            "type": "success",
            "category": "Findings",
            "read": true
        },
        {
            "id": "notif-04",
            "title": "Monthly Audit Dossier Generated",
            "message": "The official Monthly Executive Compliance PDF report for September 2026 is now available for download.",
            "timestamp": "Yesterday",
            "type": "info",
            "category": "System",
            "read": true
        }
    ]


