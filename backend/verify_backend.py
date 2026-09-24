import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database import SessionLocal, Base, engine
from app.models.heuristic import LearnedHeuristic
from app.schemas.heuristic import CreateHeuristicRequest
from app.services.normalizer.normalizer_service import NormalizerService
from app.services.compliance.compliance_engine import ComplianceEngine
from app.services.remediation.remediation_engine import RemediationEngine
from app.services.training.learning_loop import LearningLoopService
from app.services.reporting.pdf_generator import PDFReportGenerator
from app.schemas.audit import DeviceAuditReport
from app.config import SAMPLE_CONFIGS_DIR, REPORTS_DIR

def run_verification():
    print("=== STARTING NETARMOR AI BACKEND VERIFICATION ===")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Test Cisco Catalyst Config
    cisco_path = SAMPLE_CONFIGS_DIR / "cisco_catalyst_3850.cfg"
    assert cisco_path.exists(), "Cisco sample config must exist"
    cisco_text = cisco_path.read_text(encoding="utf-8")
    
    baseline_cisco = NormalizerService.normalize_config(cisco_text)
    print(f"[OK] Cisco Normalization: Hostname={baseline_cisco.hostname}, Vendor={baseline_cisco.vendor}")
    assert baseline_cisco.hostname == "EDGE-SW-01", f"Expected EDGE-SW-01, got {baseline_cisco.hostname}"
    assert baseline_cisco.management.telnet_disabled is False, "Expected Telnet to be flagged as enabled"
    assert baseline_cisco.snmp.snmp_insecure_communities_removed is False, "Expected insecure SNMP to be flagged"

    # 2. Test Multi-Framework Compliance Engine on Cisco
    results = ComplianceEngine.audit_all_frameworks(baseline_cisco)
    for fw, summary in results.items():
        print(f"[OK] Framework {fw}: Score={summary.compliance_score}%, Passed={summary.passed_count}, Failed={summary.failed_count}")
        assert summary.total_controls > 0, f"Framework {fw} must have controls"

    # 3. Test Fortinet, Palo Alto, Juniper, Arista, SONiC
    for sample_name in ["fortigate_fortios_7.cfg", "paloalto_panos_10.cfg", "juniper_srx_junos.cfg", "arista_eos_switch.cfg", "sonic_whitebox_switch.json"]:
        p = SAMPLE_CONFIGS_DIR / sample_name
        b = NormalizerService.normalize_config(p.read_text(encoding="utf-8"))
        print(f"[OK] {sample_name}: Hostname={b.hostname}, Vendor={b.vendor}, OS={b.os_version}")

    # 4. Test Remediation CLI Generator
    cis_summary = results["CIS"]
    failed = [f for f in cis_summary.findings if f.status != "PASS"]
    rem_script = RemediationEngine.generate_full_remediation_script("cisco", failed)
    print(f"[OK] Remediation script generated ({len(rem_script.splitlines())} lines)")
    assert "configure terminal" in rem_script, "Remediation script should contain Cisco CLI syntax"

    # 5. Test AI Training Loop with Unseen Hardware Config
    unseen_path = SAMPLE_CONFIGS_DIR / "unseen_nexthardware_v1.cfg"
    unseen_text = unseen_path.read_text(encoding="utf-8")
    baseline_unseen_before = NormalizerService.normalize_config(unseen_text)
    print(f"[OK] Unseen Config Before Training: Unparsed Lines={len(baseline_unseen_before.unparsed_lines)}, Telnet={baseline_unseen_before.management.telnet_disabled}")

    # NLP Suggestions test
    suggestions = LearningLoopService.get_unparsed_line_suggestions(baseline_unseen_before.unparsed_lines)
    print(f"[OK] NLP Suggestions generated for {len(suggestions)} unparsed commands")
    for s in suggestions[:3]:
        print(f"     -> Matched '{s.raw_line}' -> {s.suggested_category}.{s.suggested_parameter} ({int(s.confidence*100)}%)")

    # Train a new dynamic heuristic for telnet on this unseen vendor
    req = CreateHeuristicRequest(
        vendor="custom_vendor",
        raw_line="legacy-cleartext-telnet state active",
        canonical_category="management",
        canonical_parameter="telnet_disabled",
        parameter_type="boolean",
        target_value="false",
        description="Maps NexaEdge legacy telnet command"
    )
    learned_rule = LearningLoopService.create_heuristic(db, req)
    print(f"[OK] Dynamically trained new heuristic rule ID={learned_rule.id}")

    # Re-normalize with the newly learned heuristic
    active_heuristics = LearningLoopService.list_heuristics(db)
    baseline_unseen_after = NormalizerService.normalize_config(
        unseen_text,
        heuristics=active_heuristics
    )
    print(f"[OK] Unseen Config After Training: Heuristic Matches={baseline_unseen_after.heuristic_matched_count}, Telnet Disabled={baseline_unseen_after.management.telnet_disabled}")
    assert baseline_unseen_after.heuristic_matched_count >= 1, "Learned heuristic should match"
    assert baseline_unseen_after.management.telnet_disabled is False, "Learned rule should update canonical model"

    # 6. Test PDF Report Generation
    report = DeviceAuditReport(
        device_id=1,
        hostname=baseline_cisco.hostname,
        vendor=baseline_cisco.vendor,
        model=baseline_cisco.model,
        os_version=baseline_cisco.os_version,
        serial_number=baseline_cisco.serial_number,
        baseline=baseline_cisco.model_dump(),
        active_framework="CIS",
        framework_results=results,
        remediation_script=rem_script,
        unparsed_lines=baseline_cisco.unparsed_lines,
        training_status={"total": 10, "recognized": 8}
    )
    pdf_buf = PDFReportGenerator.generate_audit_pdf(report, "CIS")
    pdf_bytes = pdf_buf.read()
    test_pdf_path = REPORTS_DIR / "verification_audit_report.pdf"
    test_pdf_path.write_bytes(pdf_bytes)
    print(f"[OK] ReportLab PDF generated successfully ({len(pdf_bytes)} bytes) -> {test_pdf_path}")
    assert len(pdf_bytes) > 2000, "PDF should be non-trivial size"

    db.close()
    print("=== ALL BACKEND VERIFICATIONS PASSED! ===")

if __name__ == "__main__":
    run_verification()
