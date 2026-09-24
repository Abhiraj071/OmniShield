import re
import json
from typing import List, Optional
from app.schemas.baseline import CanonicalSecurityBaseline
from app.services.normalizer.cisco_extractor import CiscoExtractor
from app.services.normalizer.fortinet_extractor import FortinetExtractor
from app.services.normalizer.paloalto_extractor import PaloAltoExtractor
from app.services.normalizer.juniper_extractor import JuniperExtractor
from app.services.normalizer.arista_extractor import AristaExtractor
from app.services.normalizer.sonic_extractor import SonicExtractor
from app.services.normalizer.nlp_engine import NLPEngine
from app.models.heuristic import LearnedHeuristic

class NormalizerService:
    @staticmethod
    def detect_vendor(config_text: str, override: Optional[str] = None) -> str:
        if override and override.lower() != "auto":
            return override.lower()

        lower = config_text.lower()
        if "cisco ios" in lower or "line vty" in lower or "service password-encryption" in lower:
            return "cisco"
        if "config system global" in lower or "config-version=fg" in lower or "set admintimeout" in lower:
            return "fortinet"
        if "set deviceconfig system" in lower or "palo alto" in lower or "pan-os" in lower:
            return "paloalto"
        if "host-name" in lower and ("junos" in lower or "system {" in lower or "set system services" in lower):
            return "juniper"
        if "arista eos" in lower or "management api http-commands" in lower or "transceiver qsfp" in lower:
            return "arista"
        if "device_metadata" in lower and "sonic" in lower:
            return "sonic"
        
        # Check if JSON
        if config_text.strip().startswith("{") and "FEATURE" in config_text:
            return "sonic"

        return "generic"

    @classmethod
    def normalize_config(
        cls,
        config_text: str,
        vendor_override: Optional[str] = None,
        heuristics: Optional[List[LearnedHeuristic]] = None
    ) -> CanonicalSecurityBaseline:
        baseline = CanonicalSecurityBaseline()
        raw_lines = [line.strip() for line in config_text.splitlines() if line.strip()]
        baseline.total_lines_analyzed = len(raw_lines)

        vendor = cls.detect_vendor(config_text, vendor_override)
        baseline.vendor = vendor

        recognized: List[str] = []

        if vendor == "cisco":
            recognized = CiscoExtractor.extract(config_text, baseline)
        elif vendor == "fortinet":
            recognized = FortinetExtractor.extract(config_text, baseline)
        elif vendor == "paloalto":
            recognized = PaloAltoExtractor.extract(config_text, baseline)
        elif vendor == "juniper":
            recognized = JuniperExtractor.extract(config_text, baseline)
        elif vendor == "arista":
            recognized = AristaExtractor.extract(config_text, baseline)
        elif vendor == "sonic":
            recognized = SonicExtractor.extract(config_text, baseline)
        else:
            # Generic or novel proprietary hardware
            baseline.vendor = "custom_vendor"
            baseline.model = "Proprietary / Disaggregated Hardware"
            # Generic hostname hunt
            m_h = re.search(r"(?:hostname|core-host-label|host-name|sys-name)[\s:=]+[\"']?([A-Za-z0-9_-]+)[\"']?", config_text, re.IGNORECASE)
            if m_h:
                baseline.hostname = m_h.group(1)
            # Generic serial number hunt
            m_sn = re.search(r"(?:serial-number|sys-serial-number|serial)[\s:=]+[\"']?([A-Za-z0-9_-]+)[\"']?", config_text, re.IGNORECASE)
            if m_sn:
                baseline.serial_number = m_sn.group(1)

        # Apply Learned Heuristics from the database (The AI Training Loop integration)
        if heuristics:
            matched_count = NLPEngine.apply_learned_heuristics(config_text, baseline, heuristics)
            baseline.heuristic_matched_count = matched_count

        # Extract unparsed / unrecognized lines for the training loop
        unparsed = []
        for line in raw_lines:
            clean = line.strip()
            # Ignore comments, delimiters, simple closures
            if clean.startswith(("#", "!", ";", "//")) or clean in ["exit", "end", "{", "}", "next", ""]:
                continue
            
            # Check if this line is recognized in standard evidence or recognized lines
            is_recognized = False
            for cat in [baseline.management, baseline.aaa, baseline.logging, baseline.ntp, baseline.snmp, baseline.interfaces]:
                for ev in cat.evidence.values():
                    if clean in ev or ev in clean:
                        is_recognized = True
                        break
                if is_recognized:
                    break

            if not is_recognized:
                unparsed.append(clean)

        baseline.unparsed_lines = unparsed
        baseline.recognized_lines_count = max(0, len(raw_lines) - len(unparsed))

        return baseline
