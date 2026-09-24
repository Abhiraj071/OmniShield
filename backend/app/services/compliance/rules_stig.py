from typing import List
from app.schemas.baseline import CanonicalSecurityBaseline
from app.schemas.audit import FindingDetail

def evaluate_stig(b: CanonicalSecurityBaseline) -> List[FindingDetail]:
    findings = []

    # NET1620: CAT I - The network device must not utilize Telnet.
    telnet_pass = b.management.telnet_disabled
    findings.append(FindingDetail(
        benchmark_id="STIG-NET1620",
        title="Prohibit Insecure Management Protocol (Telnet)",
        category="CAT I (High Severity)",
        status="PASS" if telnet_pass else "FAIL",
        severity="CRITICAL",
        current_value="Telnet Disabled" if telnet_pass else "Telnet Service Active",
        expected_value="Telnet Disabled = True",
        rationale="DISA STIG CAT I: Telnet exposes passwords in cleartext over the network.",
        evidence=b.management.evidence.get("telnet", "Telnet checked"),
        remediation_command=""
    ))

    # NET1621: CAT I - The network device must utilize SSHv2.
    ssh_pass = (b.management.ssh_enabled and b.management.ssh_version >= 2)
    findings.append(FindingDetail(
        benchmark_id="STIG-NET1621",
        title="Enforce Secure Shell Version 2 Protocol",
        category="CAT I (High Severity)",
        status="PASS" if ssh_pass else "FAIL",
        severity="CRITICAL",
        current_value=f"SSH Enabled: {b.management.ssh_enabled}, Version: {b.management.ssh_version}",
        expected_value="SSHv2 Enforced",
        rationale="DISA STIG CAT I: SSHv1 has known protocol vulnerabilities enabling session hijack.",
        evidence=b.management.evidence.get("ssh_version", "SSH checked"),
        remediation_command=""
    ))

    # NET1630: CAT I - Default community strings must be disabled.
    snmp_pass = b.snmp.snmp_insecure_communities_removed
    findings.append(FindingDetail(
        benchmark_id="STIG-NET1630",
        title="Remove Default and Guessable SNMP Community Strings",
        category="CAT I (High Severity)",
        status="PASS" if snmp_pass else "FAIL",
        severity="CRITICAL",
        current_value=f"Communities: {', '.join(b.snmp.detected_communities) if b.snmp.detected_communities else 'None'}",
        expected_value="No 'public' or 'private' communities",
        rationale="DISA STIG CAT I: Default communities provide unauthorized access to configuration data.",
        evidence=b.snmp.evidence.get("snmp_community", "SNMP community strings checked"),
        remediation_command=""
    ))

    # NET1640: CAT II - The network device must display a DoD notice and consent banner.
    banner_pass = b.management.login_banner_present
    findings.append(FindingDetail(
        benchmark_id="STIG-NET1640",
        title="Display Standard DoD Notice and Consent Warning Banner",
        category="CAT II (Medium Severity)",
        status="PASS" if banner_pass else "FAIL",
        severity="MEDIUM",
        current_value="Banner Configured" if banner_pass else "No Warning Banner Found",
        expected_value="DoD / Government warning banner present",
        rationale="DISA STIG CAT II: Users must receive warning of monitoring and consent upon connection.",
        evidence=b.management.evidence.get("banner", "Banner not found"),
        remediation_command=""
    ))

    # NET1650: CAT II - Inactivity timeout limit.
    timeout_pass = (0 < b.management.idle_timeout_seconds <= 600)  # STIG strictly requires <= 10 min
    findings.append(FindingDetail(
        benchmark_id="STIG-NET1650",
        title="Enforce Session Inactivity Disconnect <= 10 Minutes (600s)",
        category="CAT II (Medium Severity)",
        status="PASS" if timeout_pass else "FAIL",
        severity="MEDIUM",
        current_value=f"{b.management.idle_timeout_seconds} seconds",
        expected_value="Idle timeout <= 600 seconds",
        rationale="DISA STIG CAT II: Administrative sessions left unattended must be closed promptly.",
        evidence=b.management.evidence.get("idle_timeout", "Idle timeout not configured"),
        remediation_command=""
    ))

    # NET1660: CAT II - Centralized Syslog Logging.
    syslog_pass = b.logging.remote_syslog_configured
    findings.append(FindingDetail(
        benchmark_id="STIG-NET1660",
        title="Send Audit Records to Centralized Syslog Repository",
        category="CAT II (Medium Severity)",
        status="PASS" if syslog_pass else "FAIL",
        severity="HIGH",
        current_value=f"Syslog: {'Configured' if syslog_pass else 'Missing'}",
        expected_value="Remote syslog server configured",
        rationale="DISA STIG CAT II: Forwarding logs prevents tampering by unauthorized administrators.",
        evidence=b.logging.evidence.get("syslog", "No remote syslog host found"),
        remediation_command=""
    ))

    return findings
