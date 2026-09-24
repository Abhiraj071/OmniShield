import re
from typing import List
from app.schemas.baseline import CanonicalSecurityBaseline

class JuniperExtractor:
    @staticmethod
    def extract(config_text: str, baseline: CanonicalSecurityBaseline) -> List[str]:
        recognized_lines = []
        baseline.vendor = "juniper"
        baseline.model = "Juniper SRX / MX / EX"

        # Hostname
        m_host = re.search(r'host-name\s+([^;\s]+);', config_text, re.IGNORECASE)
        if not m_host:
            m_host = re.search(r'set\s+system\s+host-name\s+([^\s]+)', config_text, re.IGNORECASE)
        if m_host:
            baseline.hostname = m_host.group(1)
            recognized_lines.append(m_host.group(0))

        # Version
        m_ver = re.search(r'version\s+([^;\s]+);', config_text, re.IGNORECASE)
        if m_ver:
            baseline.os_version = f"JunOS {m_ver.group(1)}"

        # SSH
        if re.search(r'protocol-version\s+v2', config_text, re.IGNORECASE) or re.search(r'ssh\s+{\s+protocol-version\s+v2', config_text, re.IGNORECASE):
            baseline.management.ssh_enabled = True
            baseline.management.ssh_version = 2
            baseline.management.evidence["ssh_version"] = "JunOS explicit SSH protocol-version v2"
        elif "ssh;" in config_text or "set system services ssh" in config_text:
            baseline.management.ssh_enabled = True
            baseline.management.ssh_version = 2
            baseline.management.evidence["ssh_version"] = "SSH service enabled"

        # Telnet
        if "telnet;" in config_text or "set system services telnet" in config_text:
            baseline.management.telnet_disabled = False
            baseline.management.evidence["telnet"] = "Telnet service is enabled"
        else:
            baseline.management.telnet_disabled = True
            baseline.management.evidence["telnet"] = "Telnet service not present (disabled)"

        # HTTP Server
        if re.search(r'web-management\s*{[\s\S]*?http\s*{', config_text, re.IGNORECASE):
            baseline.management.http_server_disabled = False
            baseline.management.evidence["http_server"] = "JunOS web-management HTTP port 80 enabled"
        else:
            baseline.management.http_server_disabled = True

        # Idle Timeout
        m_timeout = re.search(r'idle-timeout\s+(\d+);', config_text, re.IGNORECASE)
        if m_timeout:
            mins = int(m_timeout.group(1))
            baseline.management.idle_timeout_seconds = mins * 60
            baseline.management.evidence["idle_timeout"] = f"JunOS login idle-timeout is {mins} minutes ({mins*60}s)"
        else:
            baseline.management.idle_timeout_seconds = 0

        # Login Message / Banner
        if re.search(r'message\s+"([^"]+)";', config_text, re.IGNORECASE):
            baseline.management.login_banner_present = True
            baseline.management.evidence["banner"] = "JunOS system login message banner present"

        # AAA & Password
        if "$6$" in config_text:
            baseline.aaa.password_encryption_type = 9
            baseline.aaa.evidence["hash_type"] = "JunOS SHA-512 ($6$) shadow password"
        elif "$1$" in config_text:
            baseline.aaa.password_encryption_type = 5
            baseline.aaa.evidence["hash_type"] = "JunOS MD5 ($1$) password"

        # Logging
        if re.search(r'syslog\s*{', config_text, re.IGNORECASE):
            baseline.logging.log_timestamps_enabled = True
            m_remote = re.findall(r'host\s+([^\s{;]+)', config_text, re.IGNORECASE)
            if m_remote:
                baseline.logging.remote_syslog_configured = True
                baseline.logging.syslog_servers = m_remote
                baseline.logging.evidence["syslog"] = f"Remote syslog host: {', '.join(m_remote)}"
            else:
                baseline.logging.remote_syslog_configured = False
                baseline.logging.evidence["syslog"] = "Local file syslog configured, remote SIEM host missing"

        # NTP
        m_ntp = re.findall(r'ntp\s*{[\s\S]*?server\s+([^;\s]+);', config_text, re.IGNORECASE)
        if m_ntp:
            baseline.ntp.ntp_servers_configured = True
            baseline.ntp.ntp_servers = m_ntp
            baseline.ntp.evidence["ntp"] = f"NTP servers: {', '.join(m_ntp)}"

        # SNMP
        if "community public" in config_text.lower():
            baseline.snmp.snmp_insecure_communities_removed = False
            baseline.snmp.detected_communities.append("public")
            baseline.snmp.evidence["snmp_community"] = "Insecure SNMP community 'public' configured"

        return recognized_lines
