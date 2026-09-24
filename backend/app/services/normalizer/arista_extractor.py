import re
from typing import List
from app.schemas.baseline import CanonicalSecurityBaseline

class AristaExtractor:
    @staticmethod
    def extract(config_text: str, baseline: CanonicalSecurityBaseline) -> List[str]:
        recognized_lines = []
        baseline.vendor = "arista"
        baseline.model = "Arista EOS Switch"

        # Hostname
        m_host = re.search(r'^hostname\s+([A-Za-z0-9_-]+)', config_text, re.MULTILINE | re.IGNORECASE)
        if m_host:
            baseline.hostname = m_host.group(1)
            recognized_lines.append(m_host.group(0))

        # Telnet
        baseline.management.telnet_disabled = True
        baseline.management.evidence["telnet"] = "Arista EOS does not enable telnet by default"

        # SSH
        if "management ssh" in config_text.lower():
            baseline.management.ssh_enabled = True
            baseline.management.ssh_version = 2
            baseline.management.evidence["ssh_version"] = "Arista management ssh active (SSHv2)"

        # Idle Timeout
        m_timeout = re.search(r'idle-timeout\s+(\d+)', config_text, re.IGNORECASE)
        if m_timeout:
            mins = int(m_timeout.group(1))
            baseline.management.idle_timeout_seconds = mins * 60
            baseline.management.evidence["idle_timeout"] = f"Arista idle-timeout set to {mins} minutes ({mins*60}s)"

        # HTTP/HTTPS Management
        if "protocol https" in config_text.lower() and "no protocol http" in config_text.lower():
            baseline.management.http_server_disabled = True
            baseline.management.https_server_enabled = True
            baseline.management.evidence["http_server"] = "HTTPS enabled, HTTP explicitly disabled"
        elif "protocol http" in config_text.lower() and "no protocol http" not in config_text.lower():
            baseline.management.http_server_disabled = False

        # Banner
        if "banner login" in config_text.lower() or "banner motd" in config_text.lower():
            baseline.management.login_banner_present = True
            baseline.management.evidence["banner"] = "Arista login/MOTD banner configured"

        # AAA & Password
        if "secret sha512" in config_text.lower() or "$6$" in config_text:
            baseline.aaa.password_encryption_type = 9
            baseline.aaa.password_encryption_enabled = True
            baseline.aaa.evidence["hash_type"] = "Arista SHA-512 password encryption active"

        # Logging
        m_log = re.findall(r'logging\s+host\s+([^\s]+)', config_text, re.IGNORECASE)
        if m_log:
            baseline.logging.remote_syslog_configured = True
            baseline.logging.syslog_servers = m_log
            baseline.logging.evidence["syslog"] = f"Syslog host configured: {', '.join(m_log)}"

        # NTP
        m_ntp = re.findall(r'ntp\s+server\s+([^\s]+)', config_text, re.IGNORECASE)
        if m_ntp:
            baseline.ntp.ntp_servers_configured = True
            baseline.ntp.ntp_servers = m_ntp
            baseline.ntp.evidence["ntp"] = f"NTP servers: {', '.join(m_ntp)}"

        # SNMP
        m_snmp = re.findall(r'snmp-server\s+community\s+([^\s]+)', config_text, re.IGNORECASE)
        if m_snmp:
            baseline.snmp.snmp_enabled = True
            baseline.snmp.detected_communities = m_snmp
            for comm in m_snmp:
                if comm.lower() in ["public", "private"]:
                    baseline.snmp.snmp_insecure_communities_removed = False
                    baseline.snmp.evidence["snmp_community"] = f"Insecure default community string: '{comm}'"

        # Shutdown unused ports
        if "shutdown" in config_text.lower():
            baseline.interfaces.unused_interfaces_shutdown = True

        return recognized_lines
