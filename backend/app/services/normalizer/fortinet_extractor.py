import re
from typing import List
from app.schemas.baseline import CanonicalSecurityBaseline

class FortinetExtractor:
    @staticmethod
    def extract(config_text: str, baseline: CanonicalSecurityBaseline) -> List[str]:
        recognized_lines = []
        baseline.vendor = "fortinet"
        baseline.model = "FortiGate Next-Gen Firewall"

        # Hostname
        m_host = re.search(r'set\s+hostname\s+"?([^"\s]+)"?', config_text, re.IGNORECASE)
        if m_host:
            baseline.hostname = m_host.group(1)
            recognized_lines.append(m_host.group(0))

        # Firmware
        m_ver = re.search(r'config-version=([A-Za-z0-9.-]+)', config_text, re.IGNORECASE)
        if m_ver:
            baseline.os_version = f"FortiOS {m_ver.group(1)}"

        # Admin timeout
        m_timeout = re.search(r'set\s+admintimeout\s+(\d+)', config_text, re.IGNORECASE)
        if m_timeout:
            mins = int(m_timeout.group(1))
            baseline.management.idle_timeout_seconds = mins * 60
            baseline.management.evidence["idle_timeout"] = f"Admin timeout set to {mins} minutes ({mins*60}s)"
            recognized_lines.append(m_timeout.group(0))

        # Telnet disabled
        m_telnet = re.search(r'set\s+admin-telnet\s+(enable|disable)', config_text, re.IGNORECASE)
        if m_telnet:
            state = m_telnet.group(1).lower()
            baseline.management.telnet_disabled = (state == "disable")
            baseline.management.evidence["telnet"] = f"admin-telnet is {state}"
            recognized_lines.append(m_telnet.group(0))
        else:
            baseline.management.telnet_disabled = True

        # SSH
        baseline.management.ssh_enabled = True
        baseline.management.ssh_version = 2
        baseline.management.evidence["ssh_version"] = "FortiOS enforces SSHv2 by default"

        # Banner
        if re.search(r'set\s+pre-login-banner\s+enable', config_text, re.IGNORECASE):
            baseline.management.login_banner_present = True
            baseline.management.evidence["banner"] = "Pre-login banner enabled in system global"

        # AAA & Password
        if "set password ENC" in config_text or "set accprofile" in config_text:
            baseline.aaa.aaa_enabled = True
            baseline.aaa.password_encryption_enabled = True
            baseline.aaa.password_encryption_type = 8
            baseline.aaa.evidence["password_encryption"] = "FortiOS AES password encryption active"

        # Logging / Syslog
        syslog_block = re.search(r'config\s+log\s+syslogd\s+setting[\s\S]*?end', config_text, re.IGNORECASE)
        if syslog_block:
            block_content = syslog_block.group(0)
            if re.search(r'set\s+status\s+enable', block_content, re.IGNORECASE):
                m_srv = re.search(r'set\s+server\s+"?([^"\s]+)"?', block_content, re.IGNORECASE)
                if m_srv and m_srv.group(1):
                    baseline.logging.remote_syslog_configured = True
                    baseline.logging.syslog_servers = [m_srv.group(1)]
                    baseline.logging.evidence["syslog"] = f"Syslog server: {m_srv.group(1)}"
            else:
                baseline.logging.remote_syslog_configured = False
                baseline.logging.evidence["syslog"] = "Remote syslog status is disabled"
        else:
            baseline.logging.remote_syslog_configured = False
            baseline.logging.evidence["syslog"] = "No syslogd setting found"

        # NTP
        ntp_block = re.search(r'config\s+system\s+ntp[\s\S]*?end', config_text, re.IGNORECASE)
        if ntp_block and "set server" in ntp_block.group(0):
            baseline.ntp.ntp_servers_configured = True
            srvs = re.findall(r'set\s+server\s+"?([^"\s]+)"?', ntp_block.group(0), re.IGNORECASE)
            baseline.ntp.ntp_servers = srvs
            baseline.ntp.evidence["ntp"] = f"NTP servers configured: {', '.join(srvs)}"

        # SNMP
        snmp_comms = re.findall(r'set\s+name\s+"?([^"\s]+)"?', config_text, re.IGNORECASE)
        for c in snmp_comms:
            if c.lower() in ["public", "private"]:
                baseline.snmp.snmp_insecure_communities_removed = False
                baseline.snmp.detected_communities.append(c)
                baseline.snmp.evidence["snmp_community"] = f"Insecure default community string: '{c}'"

        # Firewall Policy (Default Deny)
        if "config firewall policy" in config_text:
            baseline.interfaces.default_deny_firewall = True
            baseline.interfaces.evidence["firewall"] = "Stateful firewall policy engine active with implicit deny"

        return recognized_lines
