from typing import Dict, List
from app.schemas.baseline import CanonicalSecurityBaseline
from app.schemas.audit import FrameworkAuditSummary, FindingDetail
from app.services.compliance.rules_cis import evaluate_cis
from app.services.compliance.rules_nist import evaluate_nist
from app.services.compliance.rules_stig import evaluate_stig
from app.services.compliance.rules_iso import evaluate_iso
from app.services.remediation.remediation_engine import RemediationEngine

class ComplianceEngine:
    FRAMEWORKS = ["CIS", "NIST", "DISA_STIG", "ISO27001"]

    @classmethod
    def audit_framework(cls, framework: str, baseline: CanonicalSecurityBaseline) -> FrameworkAuditSummary:
        fw = framework.upper()
        findings: List[FindingDetail] = []

        if fw == "CIS":
            findings = evaluate_cis(baseline)
        elif fw == "NIST":
            findings = evaluate_nist(baseline)
        elif fw == "DISA_STIG":
            findings = evaluate_stig(baseline)
        elif fw == "ISO27001":
            findings = evaluate_iso(baseline)
        else:
            findings = evaluate_cis(baseline)

        # Attach device-specific remediation CLI commands for each finding
        for f in findings:
            f.remediation_command = RemediationEngine.get_command_for_finding(
                vendor=baseline.vendor,
                finding_id=f.benchmark_id,
                title=f.title
            )

        passed = sum(1 for f in findings if f.status == "PASS")
        failed = sum(1 for f in findings if f.status == "FAIL")
        warning = sum(1 for f in findings if f.status == "WARNING")
        total = len(findings)

        # Weighting: PASS = 1.0, WARNING = 0.5, FAIL = 0.0
        score_val = (passed * 1.0 + warning * 0.5) / max(total, 1) * 100.0
        score = round(score_val, 1)

        return FrameworkAuditSummary(
            framework=fw,
            compliance_score=score,
            passed_count=passed,
            failed_count=failed,
            warning_count=warning,
            total_controls=total,
            findings=findings
        )

    @classmethod
    def audit_all_frameworks(cls, baseline: CanonicalSecurityBaseline) -> Dict[str, FrameworkAuditSummary]:
        results = {}
        for fw in cls.FRAMEWORKS:
            results[fw] = cls.audit_framework(fw, baseline)
        return results
