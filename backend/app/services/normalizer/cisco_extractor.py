import re
from typing import Dict, Any, List
from app.schemas.baseline import CanonicalSecurityBaseline

class CiscoExtractor:
    @staticmethod
    def extract(config_text: str, baseline: CanonicalSecurityBaseline) -> List[str]:
        recognized_lines = []
        lines = [line.strip() for line in config_text.splitlines() if line.strip() and not line.strip().startswith("!")]

        baseline.vendor = "cisco"
        baseline.model = "Cisco Catalyst / IOS-XE"

        # Hostname
        m_host = re.search(r"^hostname\s+([A-Za-z0-9_-]+)", config_text, re.MULTILINE | re.IGNORECASE)
        if m_host:
            baseline.hostname = m_host.group(1)
            recognized_lines.append(m_host.group(0))

        # Version / OS
        m_ver = re.search(r"^version\s+([0-9.]+)", config_text, re.MULTILINE | re.IGNORECASE)
        if m_ver:
            baseline.os_version = f"IOS-XE {m_ver.group(1)}"
            recognized_lines.append(m_ver.group(0))

        # SSH Version
        m_ssh = re.search(r"^ip\s+ssh\s+version\s+([12])", config_text, re.MULTILINE | re.IGNORECASE)
        if m_ssh:
            baseline.management.ssh_enabled = True
            baseline.management.ssh_version = int(m_ssh.group(1))
            baseline.management.evidence["ssh_version"] = m_ssh.group(0)
            recognized_lines.append(m_ssh.group(0))
        elif re.search(r"^crypto\s+key\s+generate\s+rsa", config_text, re.MULTILINE | re.IGNORECASE):
            baseline.management.ssh_enabled = True
            baseline.management.ssh_version = 1
            baseline.management.evidence["ssh_version"] = "RSA Key generated without explicit v2"

        # Telnet Disabled check
        # In Cisco, "transport input ssh" on vty disables telnet; "transport input telnet" or "transport input all" enables telnet.
        vty_blocks = re.findall(r"line\s+vty\s+\d+\s+\d+[\s\S]*?(?=line|interface|banner|\Z)", config_text, re.IGNORECASE)
        telnet_found = False
        timeout_found = 0
        for block in vty_blocks:
            if re.search(r"transport\s+input\s+(telnet|all)", block, re.IGNORECASE):
                telnet_found = True
                baseline.management.evidence["telnet"] = "VTY configured with 'transport input telnet/all'"
            elif re.search(r"transport\s+input\s+ssh", block, re.IGNORECASE):
                if "telnet" not in baseline.management.evidence:
                    baseline.management.evidence["telnet"] = "VTY configured with 'transport input ssh'"

            m_timeout = re.search(r"exec-timeout\s+(\d+)(?:\s+(\d+))?", block, re.IGNORECASE)
            if m_timeout:
                minutes = int(m_timeout.group(1))
                seconds = int(m_timeout.group(2)) if m_timeout.group(2) else 0
                total_sec = minutes * 60 + seconds
                if timeout_found == 0 or total_sec < timeout_found:
                    timeout_found = total_sec
                baseline.management.evidence["idle_timeout"] = m_timeout.group(0)

        if telnet_found:
            baseline.management.telnet_disabled = False
        else:
            # Check if transport input is missing on any vty (defaults to telnet on older IOS)
            if vty_blocks and not any("transport input" in b for b in vty_blocks):
                baseline.management.telnet_disabled = False
                baseline.management.evidence["telnet"] = "VTY line missing explicit transport input ssh (defaults to telnet)"
            elif vty_blocks:
                baseline.management.telnet_disabled = True

        baseline.management.idle_timeout_seconds = timeout_found

        # HTTP Server
        m_http = re.search(r"^ip\s+http\s+server", config_text, re.MULTILINE | re.IGNORECASE)
        m_no_http = re.search(r"^no\s+ip\s+http\s+server", config_text, re.MULTILINE | re.IGNORECASE)
        if m_http and not m_no_http:
            baseline.management.http_server_disabled = False
            baseline.management.evidence["http_server"] = m_http.group(0)
            recognized_lines.append(m_http.group(0))
        else:
            baseline.management.http_server_disabled = True
            baseline.management.evidence["http_server"] = "HTTP server disabled or not configured"
            if m_no_http:
                recognized_lines.append(m_no_http.group(0))

        # HTTPS Server
        if re.search(r"^ip\s+http\s+secure-server", config_text, re.MULTILINE | re.IGNORECASE):
            baseline.management.https_server_enabled = True

        # Banner MOTD
        if re.search(r"banner\s+(motd|login|exec)", config_text, re.IGNORECASE):
            baseline.management.login_banner_present = True
            baseline.management.evidence["banner"] = "Security login/MOTD banner configured"

        # AAA & Password Encryption
        if re.search(r"^aaa\s+new-model", config_text, re.MULTILINE | re.IGNORECASE):
            baseline.aaa.aaa_enabled = True
            baseline.aaa.evidence["aaa"] = "aaa new-model active"

        if re.search(r"^service\s+password-encryption", config_text, re.MULTILINE | re.IGNORECASE):
            baseline.aaa.password_encryption_enabled = True
            baseline.aaa.evidence["password_encryption"] = "service password-encryption active"

        # Check password hash types
        if re.search(r"(secret\s+9|algorithm\s+scrypt)", config_text, re.IGNORECASE):
            baseline.aaa.password_encryption_type = 9
            baseline.aaa.evidence["hash_type"] = "Scrypt (Type 9) detected"
        elif re.search(r"(secret\s+8|algorithm\s+pbkdf2)", config_text, re.IGNORECASE):
            baseline.aaa.password_encryption_type = 8
            baseline.aaa.evidence["hash_type"] = "PBKDF2 (Type 8) detected"
        elif re.search(r"(secret\s+5|enable\s+secret\s+5)", config_text, re.IGNORECASE):
            baseline.aaa.password_encryption_type = 5
            baseline.aaa.evidence["hash_type"] = "MD5 (Type 5) detected"
        elif re.search(r"password\s+7", config_text, re.IGNORECASE):
            baseline.aaa.password_encryption_type = 7
            baseline.aaa.evidence["hash_type"] = "Weak Vigenere (Type 7) detected"

        # RADIUS / TACACS+
        if re.search(r"(radius-server|tacacs-server|aaa\s+group\s+server)", config_text, re.IGNORECASE):
            baseline.aaa.central_auth_configured = True
            baseline.aaa.evidence["central_auth"] = "External AAA server group configured"

        # Logging / Remote Syslog
        syslog_matches = re.findall(r"^logging\s+host\s+([0-9A-Za-z._-]+)|^logging\s+server\s+([0-9A-Za-z._-]+)", config_text, re.MULTILINE | re.IGNORECASE)
        syslog_servers = []
        for s1, s2 in syslog_matches:
            target = s1 or s2
            if target:
                syslog_servers.append(target)
        if syslog_servers:
            baseline.logging.remote_syslog_configured = True
            baseline.logging.syslog_servers = syslog_servers
            baseline.logging.evidence["syslog"] = f"Syslog servers configured: {', '.join(syslog_servers)}"
        else:
            baseline.logging.remote_syslog_configured = False
            baseline.logging.evidence["syslog"] = "No remote syslog host configured"

        if re.search(r"service\s+timestamps\s+log\s+datetime", config_text, re.IGNORECASE):
            baseline.logging.log_timestamps_enabled = True

        # NTP
        ntp_servers = re.findall(r"^ntp\s+server\s+([0-9A-Za-z._-]+)", config_text, re.MULTILINE | re.IGNORECASE)
        if ntp_servers:
            baseline.ntp.ntp_servers_configured = True
            baseline.ntp.ntp_servers = ntp_servers
            baseline.ntp.evidence["ntp"] = f"NTP servers: {', '.join(ntp_servers)}"
        if re.search(r"ntp\s+authenticate", config_text, re.IGNORECASE):
            baseline.ntp.ntp_auth_enabled = True

        # SNMP
        snmp_communities = re.findall(r"^snmp-server\s+community\s+([^\s]+)", config_text, re.MULTILINE | re.IGNORECASE)
        if snmp_communities:
            baseline.snmp.snmp_enabled = True
            baseline.snmp.detected_communities = snmp_communities
            for comm in snmp_communities:
                if comm.lower() in ["public", "private", "cisco"]:
                    baseline.snmp.snmp_insecure_communities_removed = False
                    baseline.snmp.evidence["snmp_community"] = f"Insecure default community string found: '{comm}'"
                    break
            if baseline.snmp.snmp_insecure_communities_removed:
                baseline.snmp.evidence["snmp_community"] = "Custom non-default SNMP communities used"
        else:
            baseline.snmp.snmp_enabled = False
            baseline.snmp.evidence["snmp_community"] = "No SNMP communities configured"

        # Check SNMPv3
        if re.search(r"^snmp-server\s+group\s+.*\s+v3", config_text, re.MULTILINE | re.IGNORECASE):
            baseline.snmp.snmpv3_only = not snmp_communities

        # Interfaces / Perimeter
        if re.search(r"interface[\s\S]*?shutdown", config_text, re.IGNORECASE):
            baseline.interfaces.unused_interfaces_shutdown = True

        return recognized_lines
