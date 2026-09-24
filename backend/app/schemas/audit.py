from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class IngestConfigRequest(BaseModel):
    raw_config: str
    vendor_override: Optional[str] = None
    filename: Optional[str] = "uploaded_config.cfg"

class FindingDetail(BaseModel):
    benchmark_id: str          # e.g., CIS 1.1.2 or NIST AC-17
    title: str                 # e.g., Ensure SSH Version 2 is Enforced
    category: str              # Management, AAA, Logging, SNMP, NTP, Perimeter
    status: str                # PASS, FAIL, WARNING
    severity: str              # CRITICAL, HIGH, MEDIUM, LOW
    current_value: str         # e.g., "SSH Version 1"
    expected_value: str        # e.g., "SSH Version 2"
    rationale: str             # Why this is necessary
    evidence: str              # Line in config or "Not Found"
    remediation_command: str   # Exact CLI command for this device

class FrameworkAuditSummary(BaseModel):
    framework: str             # CIS, NIST, DISA_STIG, ISO27001
    compliance_score: float
    passed_count: int
    failed_count: int
    warning_count: int
    total_controls: int
    findings: List[FindingDetail]

class DeviceAuditReport(BaseModel):
    device_id: Optional[int] = None
    hostname: str
    vendor: str
    model: str
    os_version: str
    serial_number: str
    baseline: Dict[str, Any]
    active_framework: str
    framework_results: Dict[str, FrameworkAuditSummary]
    remediation_script: str
    unparsed_lines: List[str]
    training_status: Dict[str, Any]
