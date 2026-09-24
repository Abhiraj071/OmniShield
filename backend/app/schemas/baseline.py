from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ManagementSecurity(BaseModel):
    ssh_enabled: bool = False
    ssh_version: int = 1
    telnet_disabled: bool = True
    http_server_disabled: bool = True
    https_server_enabled: bool = False
    idle_timeout_seconds: int = 0
    login_banner_present: bool = False
    evidence: Dict[str, str] = Field(default_factory=dict)

class AAASecurity(BaseModel):
    aaa_enabled: bool = False
    password_encryption_enabled: bool = False
    password_encryption_type: int = 0  # 0: plaintext, 7: weak reversible, 5: md5, 8: pbkdf2, 9: scrypt/sha512
    central_auth_configured: bool = False  # RADIUS/TACACS+
    failed_login_lockout_enabled: bool = False
    evidence: Dict[str, str] = Field(default_factory=dict)

class LoggingSecurity(BaseModel):
    remote_syslog_configured: bool = False
    syslog_servers: List[str] = Field(default_factory=list)
    log_timestamps_enabled: bool = False
    logging_buffered_enabled: bool = False
    evidence: Dict[str, str] = Field(default_factory=dict)

class NTPSecurity(BaseModel):
    ntp_servers_configured: bool = False
    ntp_servers: List[str] = Field(default_factory=list)
    ntp_auth_enabled: bool = False
    evidence: Dict[str, str] = Field(default_factory=dict)

class SNMPSecurity(BaseModel):
    snmp_enabled: bool = False
    snmpv3_only: bool = False
    snmp_insecure_communities_removed: bool = True
    detected_communities: List[str] = Field(default_factory=list)
    evidence: Dict[str, str] = Field(default_factory=dict)

class InterfacePerimeterSecurity(BaseModel):
    unused_interfaces_shutdown: bool = False
    cdp_lldp_disabled: bool = False
    proxy_arp_disabled: bool = True
    default_deny_firewall: bool = False
    evidence: Dict[str, str] = Field(default_factory=dict)

class CanonicalSecurityBaseline(BaseModel):
    hostname: str = "UNKNOWN-DEVICE"
    vendor: str = "generic"
    model: str = "Generic Network Device"
    os_version: str = "Unknown"
    serial_number: str = "N/A"
    management: ManagementSecurity = Field(default_factory=ManagementSecurity)
    aaa: AAASecurity = Field(default_factory=AAASecurity)
    logging: LoggingSecurity = Field(default_factory=LoggingSecurity)
    ntp: NTPSecurity = Field(default_factory=NTPSecurity)
    snmp: SNMPSecurity = Field(default_factory=SNMPSecurity)
    interfaces: InterfacePerimeterSecurity = Field(default_factory=InterfacePerimeterSecurity)
    
    # Metadata for AI Training Loop
    total_lines_analyzed: int = 0
    recognized_lines_count: int = 0
    unparsed_lines: List[str] = Field(default_factory=list)
    heuristic_matched_count: int = 0
