import re
from typing import List
from app.schemas.baseline import CanonicalSecurityBaseline

class PaloAltoExtractor:
    @staticmethod
    def extract(config_text: str, baseline: CanonicalSecurityBaseline) -> List[str]:
        recognized_lines = []
        baseline.vendor = "paloalto"
        baseline.model = "Palo Alto Next-Generation Firewall (PAN-OS)"

        # Hostname
        m_host = re.search(r'set\s+deviceconfig\s+system\s+hostname\s+"?([^"\s]+)"?', config_text, re.IGNORECASE)
        if m_host:
            baseline.hostname = m_host.group(1)
            recognized_lines.append(m_host.group(0))

        # Telnet disabled
        if re.search(r'set\s+deviceconfig\s+system\s+service\s+disable-telnet\s+yes', config_text, re.IGNORECASE):
            baseline.management.telnet_disabled = True
            baseline.management.evidence["telnet"] = "disable-telnet is set to yes"
        else:
            baseline.management.telnet_disabled = False

        # HTTP disabled
        if re.search(r'set\s+deviceconfig\s+system\s+service\s+disable-http\s+yes', config_text, re.IGNORECASE):
            baseline.management.http_server_disabled = True
            baseline.management.evidence["http_server"] = "disable-http is set to yes"
        else:
            baseline.management.http_server_disabled = False

        # Idle Timeout
        m_timeout = re.search(r'set\s+deviceconfig\s+system\s+idle-timeout\s+(\d+)', config_text, re.IGNORECASE)
        if m_timeout:
            mins = int(m_timeout.group(1))
            baseline.management.idle_timeout_seconds = mins * 60
            baseline.management.evidence["idle_timeout"] = f"Idle timeout is {mins} minutes ({mins*60}s)"
            recognized_lines.append(m_timeout.group(0))

        # Banner
        if re.search(r'set\s+deviceconfig\s+system\s+login-banner', config_text, re.IGNORECASE):
            baseline.management.login_banner_present = True
            baseline.management.evidence["banner"] = "System login banner configured"

        # SSH
        baseline.management.ssh_enabled = True
        baseline.management.ssh_version = 2
        baseline.management.evidence["ssh_version"] = "PAN-OS enforces SSHv2 only"

        # AAA & Password
        if re.search(r'password-hash\s+"?\$1\$', config_text):
            baseline.aaa.password_encryption_type = 5
            baseline.aaa.evidence["hash_type"] = "Legacy MD5 hash in use"
        elif re.search(r'password-hash\s+"?\$6\$', config_text):
            baseline.aaa.password_encryption_type = 9
            baseline.aaa.evidence["hash_type"] = "SHA-512 crypt hash in use"
        baseline.aaa.aaa_enabled = True
        baseline.aaa.password_encryption_enabled = True

        # Syslog
        if re.search(r'syslog.*server\s+([0-9.]+)', config_text, re.IGNORECASE):
            m_s = re.search(r'syslog.*server\s+([0-9.]+)', config_text, re.IGNORECASE)
            baseline.logging.remote_syslog_configured = True
            baseline.logging.syslog_servers = [m_s.group(1)]
            baseline.logging.evidence["syslog"] = f"PAN-OS remote syslog server: {m_s.group(1)}"
        else:
            baseline.logging.remote_syslog_configured = False

        # NTP
        m_ntp = re.findall(r'ntp-servers.*ntp-server-address\s+([^\s]+)', config_text, re.IGNORECASE)
        if m_ntp:
            baseline.ntp.ntp_servers_configured = True
            baseline.ntp.ntp_servers = m_ntp
            baseline.ntp.evidence["ntp"] = f"NTP servers: {', '.join(m_ntp)}"

        # Default Deny Rule
        if re.search(r'action\s+deny', config_text, re.IGNORECASE):
            baseline.interfaces.default_deny_firewall = True
            baseline.interfaces.evidence["firewall"] = "Security rule with action deny configured"

        return recognized_lines
