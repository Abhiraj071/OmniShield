import pytest
from app.services.normalizer.normalizer_service import NormalizerService
from app.services.compliance.compliance_engine import ComplianceEngine
from app.config import SAMPLE_CONFIGS_DIR

def test_cis_compliance_evaluation():
    p = SAMPLE_CONFIGS_DIR / "cisco_catalyst_3850.cfg"
    b = NormalizerService.normalize_config(p.read_text(encoding="utf-8"))
    summary = ComplianceEngine.audit_framework("CIS", b)

    assert summary.framework == "CIS"
    assert summary.total_controls > 0
    assert summary.failed_count >= 1

    # Check for specific failed rules
    rule_ids = [f.benchmark_id for f in summary.findings if f.status == "FAIL"]
    assert "CIS-1.2" in rule_ids  # Telnet disabled
    assert "CIS-5.1" in rule_ids  # SNMP default communities

def test_multi_framework_evaluation():
    p = SAMPLE_CONFIGS_DIR / "fortigate_fortios_7.cfg"
    b = NormalizerService.normalize_config(p.read_text(encoding="utf-8"))
    all_fw = ComplianceEngine.audit_all_frameworks(b)

    assert set(all_fw.keys()) == {"CIS", "NIST", "DISA_STIG", "ISO27001"}
    for fw, sumry in all_fw.items():
        assert sumry.total_controls > 0
        assert 0.0 <= sumry.compliance_score <= 100.0
