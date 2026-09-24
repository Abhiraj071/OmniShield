import pytest
from app.services.normalizer.normalizer_service import NormalizerService
from app.config import SAMPLE_CONFIGS_DIR

def test_cisco_normalization():
    p = SAMPLE_CONFIGS_DIR / "cisco_catalyst_3850.cfg"
    b = NormalizerService.normalize_config(p.read_text(encoding="utf-8"))
    assert b.hostname == "EDGE-SW-01"
    assert b.vendor == "cisco"
    assert b.management.telnet_disabled is False
    assert b.management.http_server_disabled is False
    assert b.snmp.snmp_insecure_communities_removed is False

def test_fortinet_normalization():
    p = SAMPLE_CONFIGS_DIR / "fortigate_fortios_7.cfg"
    b = NormalizerService.normalize_config(p.read_text(encoding="utf-8"))
    assert b.hostname == "CORP-FW-01"
    assert b.vendor == "fortinet"
    assert b.management.idle_timeout_seconds == 2700  # 45 mins
    assert b.management.telnet_disabled is False

def test_juniper_normalization():
    p = SAMPLE_CONFIGS_DIR / "juniper_srx_junos.cfg"
    b = NormalizerService.normalize_config(p.read_text(encoding="utf-8"))
    assert b.hostname == "BR-JUNIPER-SRX"
    assert b.vendor == "juniper"
    assert b.management.ssh_version == 2
    assert b.management.telnet_disabled is False

def test_paloalto_normalization():
    p = SAMPLE_CONFIGS_DIR / "paloalto_panos_10.cfg"
    b = NormalizerService.normalize_config(p.read_text(encoding="utf-8"))
    assert b.hostname == "DC-PAN-FW01"
    assert b.vendor == "paloalto"
    assert b.management.telnet_disabled is True
    assert b.management.http_server_disabled is True

def test_sonic_normalization():
    p = SAMPLE_CONFIGS_DIR / "sonic_whitebox_switch.json"
    b = NormalizerService.normalize_config(p.read_text(encoding="utf-8"))
    assert b.hostname == "SONIC-LEAF-TOR-01"
    assert b.vendor == "sonic"
    assert b.management.ssh_version == 2
    assert b.management.telnet_disabled is True
