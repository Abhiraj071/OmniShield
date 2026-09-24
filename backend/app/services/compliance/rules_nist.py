from typing import List
from app.schemas.baseline import CanonicalSecurityBaseline
from app.schemas.audit import FindingDetail

def evaluate_nist(b: CanonicalSecurityBaseline) -> List[FindingDetail]:
    findings = []

    # AC-17: Remote Access - Secure Cryptographic Protocols
    ac17_pass = (b.management.ssh_enabled and b.management.ssh_version >= 2 and b.management.telnet_disabled)
    findings.append(FindingDetail(
        benchmark_id="NIST-AC-17",
        title="Automated Remote Access via FIPS-Approved Cryptography",
        category="Access Control (AC)",
        status="PASS" if ac17_pass else "FAIL",
        severity="HIGH",
        current_value=f"SSH: {b.management.ssh_enabled} (v{b.management.ssh_version}), Telnet Disabled: {b.management.telnet_disabled}",
        expected_value="SSHv2 Enforced, Cleartext Remote Protocols Disabled",
        rationale="NIST AC-17 mandates encrypted channels for all remote management sessions.",
        evidence=f"{b.management.evidence.get('ssh_version', '')}; {b.management.evidence.get('telnet', '')}",
        remediation_command=""
    ))

    # AC-11: Device Lock / Inactivity Timeout
    ac11_pass = (0 < b.management.idle_timeout_seconds <= 900)
    findings.append(FindingDetail(
        benchmark_id="NIST-AC-11",
        title="Session Inactivity Lock and Administrative Disconnect",
        category="Access Control (AC)",
        status="PASS" if ac11_pass else "FAIL",
        severity="MEDIUM",
        current_value=f"{b.management.idle_timeout_seconds} seconds",
        expected_value="Inactivity termination within 15 minutes (900s)",
        rationale="NIST AC-11 requires termination of idle administrative sessions after designated timeframe.",
        evidence=b.management.evidence.get("idle_timeout", "Inactivity timeout not set"),
        remediation_command=""
    ))

    # AU-2: Event Logging & Central Audit Trail
    au2_pass = b.logging.remote_syslog_configured
    findings.append(FindingDetail(
        benchmark_id="NIST-AU-2",
        title="Centralized Security Audit Record Generation and Forwarding",
        category="Audit and Accountability (AU)",
        status="PASS" if au2_pass else "FAIL",
        severity="HIGH",
        current_value=f"Remote SIEM: {'Configured' if au2_pass else 'Missing'}",
        expected_value="Forward audit records to an independent SIEM/Syslog system",
        rationale="NIST AU-2 mandates offloading event logs to protect against insider alteration.",
        evidence=b.logging.evidence.get("syslog", "No remote syslog host found"),
        remediation_command=""
    ))

    # AU-8: Time Stamps / Clock Synchronization
    au8_pass = b.ntp.ntp_servers_configured
    findings.append(FindingDetail(
        benchmark_id="NIST-AU-8",
        title="Internal System Clock Synchronization with Authoritative Source",
        category="Audit and Accountability (AU)",
        status="PASS" if au8_pass else "FAIL",
        severity="MEDIUM",
        current_value=f"NTP: {'Configured' if au8_pass else 'Not Configured'}",
        expected_value="NTP synchronized with atomic/authoritative clock sources",
        rationale="NIST AU-8 requires system clocks to be synchronized within acceptable drift tolerances.",
        evidence=b.ntp.evidence.get("ntp", "NTP synchronization not configured"),
        remediation_command=""
    ))

    # IA-2: Identification and Authentication / Strong Credential Storage
    ia2_pass = (b.aaa.password_encryption_type >= 8)
    findings.append(FindingDetail(
        benchmark_id="NIST-IA-2",
        title="Cryptographic Protection of Authenticators and Passwords",
        category="Identification & Authentication (IA)",
        status="PASS" if ia2_pass else "FAIL",
        severity="CRITICAL",
        current_value=f"Hashing Strength: Type {b.aaa.password_encryption_type}",
        expected_value="PBKDF2, Scrypt, or SHA-512 crypt hashing",
        rationale="NIST IA-2 requires protection of authenticators against offline dictionary attacks.",
        evidence=b.aaa.evidence.get("hash_type", "No strong password encryption detected"),
        remediation_command=""
    ))

    # SC-8: Transmission Confidentiality and Integrity (HTTP & Telnet Cleartext)
    sc8_pass = (b.management.http_server_disabled and b.management.telnet_disabled)
    findings.append(FindingDetail(
        benchmark_id="NIST-SC-8",
        title="Prohibit Cleartext Transmission of Administrative Traffic",
        category="System and Communications Protection (SC)",
        status="PASS" if sc8_pass else "FAIL",
        severity="HIGH",
        current_value=f"HTTP Disabled: {b.management.http_server_disabled}, Telnet Disabled: {b.management.telnet_disabled}",
        expected_value="All unencrypted protocols disabled",
        rationale="NIST SC-8 prohibits cleartext communication for control plane administration.",
        evidence=f"{b.management.evidence.get('http_server', '')}; {b.management.evidence.get('telnet', '')}",
        remediation_command=""
    ))

    return findings
