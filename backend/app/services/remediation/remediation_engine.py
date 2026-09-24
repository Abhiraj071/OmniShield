from typing import List, Dict
from app.schemas.audit import FindingDetail

class RemediationEngine:
    @staticmethod
    def get_command_for_finding(vendor: str, finding_id: str, title: str) -> str:
        v = vendor.lower()
        t = title.lower()

        # SSH Version 2
        if "ssh" in t:
            if v == "cisco":
                return "configure terminal\nip ssh version 2\nend\nwrite memory"
            elif v == "juniper":
                return "set system services ssh protocol-version v2\ncommit and-quit"
            elif v == "fortinet":
                return "config system global\n    set admin-ssh-port 22\nend"
            elif v == "paloalto":
                return "set deviceconfig system service disable-telnet yes\ncommit"
            elif v == "arista":
                return "configure\nmanagement ssh\n   no shutdown\nexit"
            elif v == "sonic":
                return "sudo config feature state ssh enabled"
            else:
                return "set management ssh-version 2"

        # Telnet Disabled
        if "telnet" in t:
            if v == "cisco":
                return "configure terminal\nline vty 0 15\n transport input ssh\nend\nwrite memory"
            elif v == "juniper":
                return "delete system services telnet\ncommit and-quit"
            elif v == "fortinet":
                return "config system global\n    set admin-telnet disable\nend"
            elif v == "paloalto":
                return "set deviceconfig system service disable-telnet yes\ncommit"
            elif v == "arista":
                return "configure\nno management telnet\nexit"
            elif v == "sonic":
                return "sudo config feature state telnet disabled"
            else:
                return "set remote-management telnet disable"

        # HTTP Server Disabled
        if "http" in t:
            if v == "cisco":
                return "configure terminal\nno ip http server\nip http secure-server\nend\nwrite memory"
            elif v == "juniper":
                return "delete system services web-management http\ncommit and-quit"
            elif v == "fortinet":
                return "config system global\n    set admin-sport 8443\nend"
            elif v == "paloalto":
                return "set deviceconfig system service disable-http yes\ncommit"
            elif v == "arista":
                return "configure\nmanagement api http-commands\n   no protocol http\n   protocol https\nexit"
            elif v == "sonic":
                return "sudo systemctl disable nginx-http"
            else:
                return "set web-management http disable"

        # Idle Timeout
        if "idle" in t or "timeout" in t or "inactivity" in t:
            if v == "cisco":
                return "configure terminal\nline con 0\n exec-timeout 10 0\nline vty 0 15\n exec-timeout 10 0\nend\nwrite memory"
            elif v == "juniper":
                return "set system login idle-timeout 10\ncommit and-quit"
            elif v == "fortinet":
                return "config system global\n    set admintimeout 10\nend"
            elif v == "paloalto":
                return "set deviceconfig system idle-timeout 10\ncommit"
            elif v == "arista":
                return "configure\nmanagement ssh\n   idle-timeout 10\nexit"
            elif v == "sonic":
                return "sudo config aaa authentication idle_timeout 600"
            else:
                return "set system session-idle-timeout 600"

        # Warning / Legal Banner
        if "banner" in t or "motd" in t or "consent" in t:
            if v == "cisco":
                return 'configure terminal\nbanner motd ^C\nAUTHORIZED ACCESS ONLY. ALL ACTIVITIES MONITORED AND LOGGED.\n^C\nend\nwrite memory'
            elif v == "juniper":
                return 'set system login message "AUTHORIZED ACCESS ONLY. ALL ACTIVITIES MONITORED."\ncommit and-quit'
            elif v == "fortinet":
                return "config system global\n    set pre-login-banner enable\nend"
            elif v == "paloalto":
                return 'set deviceconfig system login-banner "AUTHORIZED ACCESS ONLY."\ncommit'
            elif v == "arista":
                return "configure\nbanner login\nAUTHORIZED ACCESS ONLY.\nEOF\nexit"
            elif v == "sonic":
                return 'echo "AUTHORIZED ACCESS ONLY" | sudo tee /etc/issue.net'
            else:
                return 'set system legal-banner "AUTHORIZED ACCESS ONLY."'

        # Password Encryption
        if "password" in t or "crypto" in t or "authenticator" in t:
            if v == "cisco":
                return "configure terminal\nservice password-encryption\nusername admin algorithm-type scrypt secret <StrongPassword!>\nend\nwrite memory"
            elif v == "juniper":
                return "set system root-authentication plain-text-password\ncommit and-quit"
            elif v == "fortinet":
                return "config system admin\n    edit admin\n        set password <StrongPassword!>\n    next\nend"
            elif v == "paloalto":
                return "set mgt-config users admin password\ncommit"
            elif v == "arista":
                return "configure\nusername admin secret sha512 <StrongPassword!>\nexit"
            elif v == "sonic":
                return "sudo passwd admin"
            else:
                return "set security password-encryption enable"

        # Central Syslog
        if "syslog" in t or "audit" in t or "logging" in t:
            if v == "cisco":
                return "configure terminal\nlogging host 10.10.100.50\nlogging trap informational\nservice timestamps log datetime msec\nend\nwrite memory"
            elif v == "juniper":
                return "set system syslog host 10.10.100.50 any notice\ncommit and-quit"
            elif v == "fortinet":
                return 'config log syslogd setting\n    set status enable\n    set server "10.10.100.50"\nend'
            elif v == "paloalto":
                return 'set shared log-settings syslog "CORP-SIEM" server 10.10.100.50 transport UDP port 514 facility LOG_USER\ncommit'
            elif v == "arista":
                return "configure\nlogging host 10.10.100.50\nlogging level notifications\nexit"
            elif v == "sonic":
                return "sudo config syslog add 10.10.100.50"
            else:
                return "set telemetry remote-syslog-server 10.10.100.50"

        # NTP Time Sync
        if "ntp" in t or "clock" in t or "time" in t:
            if v == "cisco":
                return "configure terminal\nntp server 10.10.1.1 prefer\nntp authenticate\nend\nwrite memory"
            elif v == "juniper":
                return "set system ntp server 10.10.1.1 prefer\ncommit and-quit"
            elif v == "fortinet":
                return 'config system ntp\n    set ntpsync enable\n    set type custom\n    config ntpserver\n        edit 1\n            set server "10.10.1.1"\n        next\n    end\nend'
            elif v == "paloalto":
                return "set deviceconfig system ntp-servers primary-ntp-server ntp-server-address 10.10.1.1\ncommit"
            elif v == "arista":
                return "configure\nntp server 10.10.1.1 prefer\nexit"
            elif v == "sonic":
                return "sudo config ntp add 10.10.1.1"
            else:
                return "set system ntp-server 10.10.1.1"

        # SNMP Community Strings
        if "snmp" in t or "community" in t:
            if v == "cisco":
                return "configure terminal\nno snmp-server community public\nno snmp-server community private\nsnmp-server group SECURE_GRP v3 priv\nend\nwrite memory"
            elif v == "juniper":
                return "delete snmp community public\ndelete snmp community private\ncommit and-quit"
            elif v == "fortinet":
                return "config system snmp community\n    delete 1\nend"
            elif v == "paloalto":
                return "delete deviceconfig system snmp-setting\ncommit"
            elif v == "arista":
                return "configure\nno snmp-server community public\nno snmp-server community private\nexit"
            elif v == "sonic":
                return "sudo config snmp community remove public"
            else:
                return "delete snmp-community default"

        return "# Custom remediation required based on organizational baseline"

    @classmethod
    def generate_full_remediation_script(cls, vendor: str, failed_findings: List[FindingDetail]) -> str:
        v = vendor.lower()
        commands = []
        for f in failed_findings:
            cmd = cls.get_command_for_finding(v, f.benchmark_id, f.title)
            if cmd and not cmd.startswith("#"):
                commands.append(f"# [{f.benchmark_id}] {f.title}\n{cmd}")

        if not commands:
            return f"# Device {vendor.upper()} is compliant with evaluated baseline controls. No remediation needed."

        header = f"# ========================================================\n"
        header += f"# Automated Remediation Script for {vendor.upper()}\n"
        header += f"# Generated by NetArmor AI Compliance Engine\n"
        header += f"# Total Remediation Actions: {len(commands)}\n"
        header += f"# ========================================================\n\n"

        return header + "\n\n".join(commands)
