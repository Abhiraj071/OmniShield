from typing import List
from app.schemas.baseline import CanonicalSecurityBaseline
from app.schemas.audit import FindingDetail

def evaluate_iso(b: CanonicalSecurityBaseline) -> List[FindingDetail]:
    findings = []

    # A.8.9: Configuration Management
    a89_pass = (b.management.login_banner_present and b.management.idle_timeout_seconds > 0)
    findings.append(FindingDetail(
        benchmark_id="ISO27001-A.8.9",
        title="Configuration Management & Standard Security Baselines",
        category="Technological Controls",
        status="PASS" if a89_pass else "FAIL",
        severity="MEDIUM",
        current_value=f"Banner: {b.management.login_banner_present}, Timeout: {b.management.idle_timeout_seconds}s",
        expected_value="Standard baseline configurations including timeout and warning notices applied",
        rationale="Configurations must be established, documented, implemented, monitored and reviewed.",
        evidence="Configuration baseline verification",
        remediation_command=""
    ))

    # A.8.20: Network Security - Insecure Protocols
    a820_pass = (b.management.telnet_disabled and b.management.http_server_disabled and b.snmp.snmp_insecure_communities_removed)
    findings.append(FindingDetail(
        benchmark_id="ISO27001-A.8.20",
        title="Network Security - Separation and Insecure Protocol Mitigation",
        category="Technological Controls",
        status="PASS" if a820_pass else "FAIL",
        severity="HIGH",
        current_value=f"Telnet Disabled: {b.management.telnet_disabled}, HTTP Disabled: {b.management.http_server_disabled}, Default SNMP Removed: {b.snmp.snmp_insecure_communities_removed}",
        expected_value="Insecure protocols disabled across all management channels",
        rationale="Networks and network services must be secured, managed, and controlled to protect information.",
        evidence=f"{b.management.evidence.get('telnet', '')}; {b.management.evidence.get('http_server', '')}",
        remediation_command=""
    ))

    # A.8.24: Use of Cryptography
    a824_pass = (b.management.ssh_version >= 2 and b.aaa.password_encryption_type >= 8)
    findings.append(FindingDetail(
        benchmark_id="ISO27001-A.8.24",
        title="Use of Strong Cryptography for Management & Secrets",
        category="Technological Controls",
        status="PASS" if a824_pass else "FAIL",
        severity="HIGH",
        current_value=f"SSH Version: {b.management.ssh_version}, Password Hash Type: {b.aaa.password_encryption_type}",
        expected_value="Modern cryptographic algorithms (SSHv2, PBKDF2/SHA-512)",
        rationale="Rules for the effective use of cryptography, including cryptographic key management, must be defined.",
        evidence=f"{b.management.evidence.get('ssh_version', '')}; {b.aaa.evidence.get('hash_type', '')}",
        remediation_command=""
    ))

    # A.8.15: Logging & Monitoring
    a815_pass = b.logging.remote_syslog_configured
    findings.append(FindingDetail(
        benchmark_id="ISO27001-A.8.15",
        title="Logging and Monitoring of Network Events",
        category="Technological Controls",
        status="PASS" if a815_pass else "FAIL",
        severity="HIGH",
        current_value=f"Remote Logging: {'Active' if a815_pass else 'Not Configured'}",
        expected_value="Logs that record activities, exceptions, faults, and other relevant events must be produced and protected",
        rationale="Event logs recording administrator activity must be forwarded to a centralized system.",
        evidence=b.logging.evidence.get("syslog", "No remote syslog host found"),
        remediation_command=""
    ))

    return findings
