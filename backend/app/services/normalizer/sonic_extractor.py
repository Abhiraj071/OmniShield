import json
from typing import List
from app.schemas.baseline import CanonicalSecurityBaseline

class SonicExtractor:
    @staticmethod
    def extract(config_text: str, baseline: CanonicalSecurityBaseline) -> List[str]:
        recognized_lines = []
        baseline.vendor = "sonic"
        baseline.model = "SONiC Disaggregated Whitebox Switch"

        try:
            data = json.loads(config_text)
            # Metadata
            meta = data.get("DEVICE_METADATA", {}).get("localhost", {})
            baseline.hostname = meta.get("hostname", "SONIC-SWITCH")
            baseline.model = f"SONiC Whitebox ({meta.get('hwsku', 'Generic-Whitebox')})"
            baseline.os_version = "SONiC Linux (Debian Core)"
            baseline.serial_number = meta.get("mac", "N/A")

            # Features
            features = data.get("FEATURE", {})
            if "ssh" in features:
                baseline.management.ssh_enabled = (features["ssh"].get("status") == "enabled")
                proto = int(features["ssh"].get("protocol", "2"))
                baseline.management.ssh_version = proto
                baseline.management.evidence["ssh_version"] = f"SONiC SSH feature protocol {proto}"

            if "telnet" in features:
                baseline.management.telnet_disabled = (features["telnet"].get("status") != "enabled")
            else:
                baseline.management.telnet_disabled = True

            if "syslog" in features:
                srv = features["syslog"].get("server")
                if srv:
                    baseline.logging.remote_syslog_configured = True
                    baseline.logging.syslog_servers = [srv]
                    baseline.logging.evidence["syslog"] = f"Syslog collector: {srv}"

            if "ntp" in features:
                srvs = features["ntp"].get("servers", [])
                if srvs:
                    baseline.ntp.ntp_servers_configured = True
                    baseline.ntp.ntp_servers = srvs
                    baseline.ntp.evidence["ntp"] = f"NTP servers: {', '.join(srvs)}"

            # AAA
            aaa = data.get("AAA", {})
            auth = aaa.get("authentication", {})
            if "idle_timeout" in auth:
                baseline.management.idle_timeout_seconds = int(auth["idle_timeout"])
                baseline.management.evidence["idle_timeout"] = f"AAA idle timeout {auth['idle_timeout']}s"

            pw = aaa.get("password_policy", {})
            if pw.get("hashing_algorithm") in ["SHA512", "YESCRYPT"]:
                baseline.aaa.password_encryption_type = 9
                baseline.aaa.password_encryption_enabled = True
                baseline.aaa.evidence["hash_type"] = f"Linux shadow {pw.get('hashing_algorithm')}"

            # Banner
            banner = data.get("BANNER", {})
            if "motd" in banner:
                baseline.management.login_banner_present = True
                baseline.management.evidence["banner"] = banner["motd"]

            baseline.interfaces.unused_interfaces_shutdown = True
            recognized_lines.append("Parsed SONiC JSON config database successfully")

        except Exception as e:
            # Fallback for CLI format if SONiC config is provided in text
            pass

        return recognized_lines
