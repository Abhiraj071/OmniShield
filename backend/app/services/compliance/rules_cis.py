from typing import List
from app.schemas.baseline import CanonicalSecurityBaseline
from app.schemas.audit import FindingDetail

def evaluate_cis(b: CanonicalSecurityBaseline) -> List[FindingDetail]:
    findings = []

    # CIS 1.1: Ensure SSH Version 2 is Enforced
    ssh_pass = (b.management.ssh_enabled and b.management.ssh_version >= 2)
    findings.append(FindingDetail(
        benchmark_id="CIS-1.1",
        title="Ensure SSH Version 2 is Enforced",
        category="Management Plane",
        status="PASS" if ssh_pass else "FAIL",
        severity="HIGH",
        current_value=f"SSH Enabled: {b.management.ssh_enabled}, Version: {b.management.ssh_version}",
        expected_value="SSH Enabled = True, Protocol Version = 2",
        rationale="SSHv1 is vulnerable to MITM and insertion attacks; SSHv2 provides strong cryptographic integrity.",
        evidence=b.management.evidence.get("ssh_version", "SSH configuration not identified"),
        remediation_command=""
    ))

    # CIS 1.2: Ensure Insecure Telnet Service is Disabled
    telnet_pass = b.management.telnet_disabled
    findings.append(FindingDetail(
        benchmark_id="CIS-1.2",
        title="Ensure Insecure Telnet Service is Disabled",
        category="Management Plane",
        status="PASS" if telnet_pass else "FAIL",
        severity="CRITICAL",
        current_value="Telnet Disabled" if telnet_pass else "Telnet is Enabled/Allowed",
        expected_value="Telnet Disabled = True",
        rationale="Telnet transmits authentication credentials and commands in cleartext, exposing the device to credential sniffing.",
        evidence=b.management.evidence.get("telnet", "Telnet configuration not identified"),
        remediation_command=""
    ))

    # CIS 1.3: Ensure Insecure HTTP Server is Disabled
    http_pass = b.management.http_server_disabled
    findings.append(FindingDetail(
        benchmark_id="CIS-1.3",
        title="Ensure Cleartext HTTP Management Server is Disabled",
        category="Management Plane",
        status="PASS" if http_pass else "FAIL",
        severity="HIGH",
        current_value="HTTP Server Disabled" if http_pass else "HTTP Server Active",
        expected_value="HTTP Server Disabled = True (Use HTTPS only)",
        rationale="HTTP lacks encryption and allows attackers to hijack administrative web sessions.",
        evidence=b.management.evidence.get("http_server", "HTTP server state not identified"),
        remediation_command=""
    ))

    # CIS 1.4: Ensure Administrative Session Idle Timeout <= 15 Minutes (900s)
    # If 0 (disabled) or > 900s -> FAIL
    timeout_pass = (0 < b.management.idle_timeout_seconds <= 900)
    timeout_str = f"{b.management.idle_timeout_seconds} seconds" if b.management.idle_timeout_seconds > 0 else "Disabled / Indefinite"
    findings.append(FindingDetail(
        benchmark_id="CIS-1.4",
        title="Ensure CLI and Web Session Idle Timeout <= 15 Minutes",
        category="Management Plane",
        status="PASS" if timeout_pass else "FAIL",
        severity="MEDIUM",
        current_value=timeout_str,
        expected_value="Idle Timeout between 1s and 900s (<= 15 minutes)",
        rationale="Unattended sessions remain open for unauthorized physical or remote hijack if not timed out promptly.",
        evidence=b.management.evidence.get("idle_timeout", "Session timeout not configured"),
        remediation_command=""
    ))

    # CIS 1.5: Ensure Legal Warning / Login Banner is Configured
    banner_pass = b.management.login_banner_present
    findings.append(FindingDetail(
        benchmark_id="CIS-1.5",
        title="Ensure Legal Login / MOTD Warning Banner is Configured",
        category="Legal & Governance",
        status="PASS" if banner_pass else "FAIL",
        severity="LOW",
        current_value="Banner Configured" if banner_pass else "No Warning Banner Detected",
        expected_value="Authorized Access Only Legal Warning Banner Present",
        rationale="A legal banner is required to establish unauthorized access as trespassing in legal proceedings.",
        evidence=b.management.evidence.get("banner", "No login banner detected"),
        remediation_command=""
    ))

    # CIS 2.1: Ensure Strong Password Encryption / Hashing (Type 8/9, SHA-512, Scrypt)
    # type 5: MD5 (Warning/Medium), type 7: Reversible (Fail/Critical), type 8/9: Pass
    hash_type = b.aaa.password_encryption_type
    if hash_type in [8, 9]:
        pw_status = "PASS"
        pw_sev = "LOW"
    elif hash_type == 5:
        pw_status = "WARNING"
        pw_sev = "MEDIUM"
    else:
        pw_status = "FAIL"
        pw_sev = "CRITICAL"
    findings.append(FindingDetail(
        benchmark_id="CIS-2.1",
        title="Ensure Modern Password Hashing Algorithm is Enforced",
        category="Authentication & AAA",
        status=pw_status,
        severity=pw_sev,
        current_value=f"Password Hashing Type: {hash_type}",
        expected_value="Type 8 (PBKDF2) or Type 9 (Scrypt / SHA-512)",
        rationale="Legacy password hashing (Type 7 reversible, Type 5 MD5) can be cracked in seconds with modern GPUs.",
        evidence=b.aaa.evidence.get("hash_type", b.aaa.evidence.get("password_encryption", "Password hash not detected")),
        remediation_command=""
    ))

    # CIS 3.1: Ensure Centralized Logging / Remote Syslog Host is Configured
    syslog_pass = b.logging.remote_syslog_configured
    findings.append(FindingDetail(
        benchmark_id="CIS-3.1",
        title="Ensure Remote Centralized Syslog Server is Configured",
        category="Telemetry & Logging",
        status="PASS" if syslog_pass else "FAIL",
        severity="HIGH",
        current_value=f"Syslog Servers: {', '.join(b.logging.syslog_servers) if b.logging.syslog_servers else 'None'}",
        expected_value="At least one secure remote SIEM/Syslog server configured",
        rationale="Local buffers can be cleared by attackers; remote forwarding ensures tamper-proof audit trails.",
        evidence=b.logging.evidence.get("syslog", "Remote syslog server not configured"),
        remediation_command=""
    ))

    # CIS 4.1: Ensure Network Time Protocol (NTP) Synchronization is Configured
    ntp_pass = b.ntp.ntp_servers_configured
    findings.append(FindingDetail(
        benchmark_id="CIS-4.1",
        title="Ensure Network Time Protocol (NTP) is Configured",
        category="Time Synchronization",
        status="PASS" if ntp_pass else "FAIL",
        severity="MEDIUM",
        current_value=f"NTP Servers: {', '.join(b.ntp.ntp_servers) if b.ntp.ntp_servers else 'None'}",
        expected_value="Synchronized with authorized NTP servers",
        rationale="Accurate time stamping is critical for cross-device forensic timeline reconstruction.",
        evidence=b.ntp.evidence.get("ntp", "NTP servers not configured"),
        remediation_command=""
    ))

    # CIS 5.1: Ensure Insecure Default SNMP Community Strings are Removed
    snmp_pass = b.snmp.snmp_insecure_communities_removed
    findings.append(FindingDetail(
        benchmark_id="CIS-5.1",
        title="Ensure Default SNMP Communities (public/private) are Removed",
        category="Monitoring & SNMP",
        status="PASS" if snmp_pass else "FAIL",
        severity="CRITICAL",
        current_value=f"Communities: {', '.join(b.snmp.detected_communities) if b.snmp.detected_communities else 'None detected'}",
        expected_value="No 'public', 'private', or default guessable community strings",
        rationale="Default SNMP strings grant attackers unauthorized read/write access to internal device state.",
        evidence=b.snmp.evidence.get("snmp_community", "Default community strings checked"),
        remediation_command=""
    ))

    return findings
