import demoReport from './demoReport.json';
import sampleConfigs from './sampleConfigs.json';

export const fallbackReport = demoReport;

export const fallbackSamples = [
  {
    id: "cisco_catalyst_3850",
    name: "Cisco Catalyst 3850 (IOS-XE)",
    vendor: "Cisco",
    description: "Enterprise access switch with standard crypto and management controls.",
    filename: "cisco_catalyst_3850.cfg"
  },
  {
    id: "fortigate_fortios_7",
    name: "FortiGate 60F (FortiOS 7.2)",
    vendor: "Fortinet",
    description: "Next-gen firewall with policy enforcement and global admin settings.",
    filename: "fortigate_fortios_7.cfg"
  },
  {
    id: "paloalto_panos_10",
    name: "Palo Alto PA-440 (PAN-OS 10.2)",
    vendor: "Palo Alto",
    description: "Enterprise NGFW XML configuration baseline.",
    filename: "paloalto_panos_10.cfg"
  },
  {
    id: "juniper_srx_junos",
    name: "Juniper SRX300 (Junos OS 21.4)",
    vendor: "Juniper",
    description: "Hierarchical security gateway configuration.",
    filename: "juniper_srx_junos.cfg"
  },
  {
    id: "arista_eos_switch",
    name: "Arista 7050SX3 (EOS 4.28)",
    vendor: "Arista",
    description: "Data center leaf switch running EOS CLI.",
    filename: "arista_eos_switch.cfg"
  },
  {
    id: "sonic_whitebox_switch",
    name: "SONiC Disaggregated Switch (2022.05)",
    vendor: "SONiC / Linux",
    description: "Open networking Linux configuration database (config_db.json).",
    filename: "sonic_whitebox_switch.json"
  },
  {
    id: "unseen_nexthardware_v1",
    name: "NexaEdge 9200 (Novel/Unseen Vendor)",
    vendor: "Custom / Unseen",
    description: "Proprietary CLI syntax used to test the interactive AI Training Loop.",
    filename: "unseen_nexthardware_v1.cfg"
  }
];

export const fallbackSampleMap = sampleConfigs;

export const fallbackUsers = [
  { id: 1, name: "Rahul S.", username: "rahul_secadmin", role: "Security Admin", system_role: "security_admin", email: "rahul_secadmin@omnishield.io", status: "Active" },
  { id: 2, name: "Vikram M.", username: "vikram_admin", role: "Platform Admin", system_role: "platform_admin", email: "vikram_admin@omnishield.io", status: "Active" },
  { id: 3, name: "Priya P.", username: "priya_auditor", role: "Auditor", system_role: "auditor", email: "priya_auditor@omnishield.io", status: "Active" },
  { id: 4, name: "Abhishek V.", username: "abhishek_viewer", role: "Viewer", system_role: "viewer", email: "abhishek_viewer@omnishield.io", status: "Active" }
];

export const fallbackDevices = [
  { id: 1, name: "EDGE-SW-01", vendor: "Cisco", model: "WS-C3850-24T", ip_address: "192.168.10.1", status: "Audited", compliance_score: 83.3, last_audit: "2026-09-27" },
  { id: 2, name: "HQ-FW-01", vendor: "Fortinet", model: "FortiGate-60F", ip_address: "192.168.1.1", status: "Audited", compliance_score: 91.7, last_audit: "2026-09-26" },
  { id: 3, name: "DC-LEAF-01", vendor: "Arista", model: "DCS-7050SX3-48YC8", ip_address: "10.0.0.12", status: "Audited", compliance_score: 85.0, last_audit: "2026-09-25" },
  { id: 4, name: "BRANCH-SRX", vendor: "Juniper", model: "SRX300", ip_address: "172.16.1.1", status: "Audited", compliance_score: 88.5, last_audit: "2026-09-24" }
];

export const fallbackAuditLogs = [
  { id: 1, action: "Compliance Audit Completed", user: "rahul_secadmin", target: "EDGE-SW-01", timestamp: "2026-09-27 10:14:00", details: "CIS Benchmark evaluation finished. Score: 83.3%" },
  { id: 2, action: "Device Ingested", user: "rahul_secadmin", target: "HQ-FW-01", timestamp: "2026-09-26 14:30:10", details: "FortiOS 7.2 configuration parsed successfully." },
  { id: 3, action: "Heuristic Learned", user: "priya_auditor", target: "NexaEdge 9200", timestamp: "2026-09-25 11:15:22", details: "Learned command 'service crypto-engine scrypt' -> password_encryption" }
];
