import re
import difflib
from typing import List, Dict, Any, Optional
from app.schemas.heuristic import NLPSuggestion
from app.models.heuristic import LearnedHeuristic
from app.schemas.baseline import CanonicalSecurityBaseline

# Keyword ontology for semantic scoring
ONTOLOGY = {
    "management.idle_timeout_seconds": {
        "keywords": ["idle", "timeout", "inactivity", "grace-timer", "admintimeout", "session-timer", "exec-timeout"],
        "category": "management",
        "type": "integer",
        "desc": "Administrative CLI / Web session idle timeout limit"
    },
    "management.telnet_disabled": {
        "keywords": ["telnet", "cleartext", "legacy-cleartext-telnet", "admin-telnet", "vty"],
        "category": "management",
        "type": "boolean",
        "desc": "Disable insecure unencrypted Telnet management"
    },
    "management.ssh_version": {
        "keywords": ["ssh", "crypto", "secure-shell", "cipher", "version-2", "protocol-version"],
        "category": "management",
        "type": "integer",
        "desc": "Enforce modern SSH version 2 protocol"
    },
    "management.login_banner_present": {
        "keywords": ["banner", "motd", "legal", "disclaimer", "warning-banner", "message", "pre-login-banner"],
        "category": "management",
        "type": "boolean",
        "desc": "Display mandatory legal warning/login banner"
    },
    "logging.remote_syslog_configured": {
        "keywords": ["syslog", "siem", "collector", "audit-target", "remote-collector", "logging", "collector-endpoint"],
        "category": "logging",
        "type": "boolean",
        "desc": "Forward security audit logs to central SIEM/Syslog server"
    },
    "ntp.ntp_servers_configured": {
        "keywords": ["ntp", "clock", "time", "synchronization", "timeserver", "clock-sync"],
        "category": "ntp",
        "type": "boolean",
        "desc": "Synchronize device clock with authorized network time sources"
    },
    "snmp.snmpv3_only": {
        "keywords": ["snmp", "snmpv3", "snmp-v3", "community", "v1-v2", "agent-v1-v2c"],
        "category": "snmp",
        "type": "boolean",
        "desc": "Enforce authenticated SNMPv3 and disable legacy SNMPv1/v2c"
    },
    "aaa.password_encryption_enabled": {
        "keywords": ["password", "encryption", "hashing", "credential", "argon2id", "sha512", "scrypt", "secret"],
        "category": "aaa",
        "type": "boolean",
        "desc": "Enforce strong one-way password hashing algorithms"
    },
    "interfaces.unused_interfaces_shutdown": {
        "keywords": ["shutdown", "admin-state", "unallocated", "disable", "down", "port"],
        "category": "interfaces",
        "type": "boolean",
        "desc": "Administratively shutdown unused interfaces"
    }
}

class NLPEngine:
    @staticmethod
    def calculate_similarity(text: str, target_keywords: List[str]) -> float:
        text_lower = text.lower()
        score = 0.0
        # Check direct keyword occurrences
        for kw in target_keywords:
            if kw in text_lower:
                score += 0.4
        
        # Check token fuzzy similarity
        tokens = re.findall(r'[a-zA-Z0-9]+', text_lower)
        for token in tokens:
            for kw in target_keywords:
                ratio = difflib.SequenceMatcher(None, token, kw).ratio()
                if ratio > 0.8:
                    score += 0.25
        return min(round(score, 2), 0.99)

    @staticmethod
    def analyze_unparsed_line(line: str) -> Optional[NLPSuggestion]:
        clean = line.strip()
        if not clean or clean.startswith("#") or clean.startswith("!") or clean in ["exit", "end"]:
            return None

        best_match = None
        highest_score = 0.0
        best_param = ""

        for param_key, meta in ONTOLOGY.items():
            sim = NLPEngine.calculate_similarity(clean, meta["keywords"])
            if sim > highest_score and sim >= 0.4:
                highest_score = sim
                best_match = meta
                best_param = param_key

        if not best_match:
            return None

        # Predict target value
        cat, param = best_param.split(".")
        param_type = best_match["type"]
        suggested_val = "true"
        
        # Numeric extraction for timers
        if param_type == "integer":
            m_num = re.search(r'\b(\d+)\b', clean)
            if m_num:
                num = int(m_num.group(1))
                if "minute" in clean.lower():
                    suggested_val = str(num * 60)
                else:
                    suggested_val = str(num)
            else:
                suggested_val = "2" if "ssh" in param else "900"
        elif param_type == "boolean":
            if any(neg in clean.lower() for neg in ["disable", "inactive", "state active", "enable"]) and "telnet" in clean.lower():
                # If telnet is active, telnet_disabled = False
                suggested_val = "false" if "active" in clean.lower() or "enable" in clean.lower() else "true"
            elif any(neg in clean.lower() for neg in ["disable", "shutdown", "down"]):
                suggested_val = "true"
            else:
                suggested_val = "true"

        return NLPSuggestion(
            raw_line=clean,
            suggested_category=cat,
            suggested_parameter=param,
            suggested_type=param_type,
            suggested_value=suggested_val,
            confidence=highest_score,
            explanation=f"NLP matched keywords with {int(highest_score * 100)}% confidence for '{best_match['desc']}'"
        )

    @staticmethod
    def apply_learned_heuristics(
        config_text: str,
        baseline: CanonicalSecurityBaseline,
        heuristics: List[LearnedHeuristic]
    ) -> int:
        matched_count = 0
        for h in heuristics:
            if not h.is_active:
                continue
            
            try:
                matches = re.finditer(h.regex_pattern, config_text, re.IGNORECASE | re.MULTILINE)
                for m in matches:
                    matched_count += 1
                    target_val = h.target_value
                    # If target value has capture groups like \1
                    if r"\1" in target_val and m.groups():
                        target_val = m.group(1)

                    # Apply to canonical baseline model
                    NLPEngine._set_canonical_value(
                        baseline=baseline,
                        category=h.canonical_category,
                        param=h.canonical_parameter,
                        param_type=h.parameter_type,
                        val=target_val,
                        evidence=m.group(0)
                    )
            except Exception as e:
                continue

        return matched_count

    @staticmethod
    def _set_canonical_value(
        baseline: CanonicalSecurityBaseline,
        category: str,
        param: str,
        param_type: str,
        val: str,
        evidence: str
    ):
        target_obj = getattr(baseline, category, None)
        if not target_obj:
            return

        parsed_val: Any = val
        if param_type == "boolean":
            parsed_val = (val.lower() in ["true", "1", "yes", "enable", "enabled", "strict", "v2"])
        elif param_type == "integer":
            try:
                parsed_val = int(val)
            except ValueError:
                parsed_val = 0

        if hasattr(target_obj, param):
            setattr(target_obj, param, parsed_val)
            target_obj.evidence[param] = f"Learned AI Heuristic match: '{evidence}' -> {param}={parsed_val}"
