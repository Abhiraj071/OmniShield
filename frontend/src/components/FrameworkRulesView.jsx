import React, { useState } from 'react';
import { Shield, BookOpen, Check, ToggleLeft, ToggleRight, Info, AlertTriangle, ExternalLink } from 'lucide-react';

export default function FrameworkRulesView({ showToast }) {
  const [activeFw, setActiveFw] = useState('CIS');
  const [frameworksState, setFrameworksState] = useState({
    CIS: {
      name: 'Center for Internet Security (CIS) Benchmarks',
      version: 'v1.0.0 (Level 1 & Level 2 Profiles)',
      description: 'Prescriptive, industry-standard consensus guidance for establishing a secure configuration baseline on network switches and routers.',
      rulesCount: 8,
      status: 'Active',
      rules: [
        { id: 'CIS-1.1', title: 'Disable Cleartext Telnet Service', category: 'Management Plane', baseline: 'Telnet service disabled (SSHv2 strictly enforced)', severity: 'CRITICAL', enabled: true },
        { id: 'CIS-1.2', title: 'Enforce SSH Protocol Version 2', category: 'Management Plane', baseline: 'SSH version 2 only; legacy v1 rejected', severity: 'CRITICAL', enabled: true },
        { id: 'CIS-1.3', title: 'Session Inactivity Idle Timeout', category: 'Management Plane', baseline: 'Exec timeout <= 900 seconds (15 min)', severity: 'MEDIUM', enabled: true },
        { id: 'CIS-1.4', title: 'Legal Warning Login Banner', category: 'Management Plane', baseline: 'Banner login / motd explicitly configured', severity: 'LOW', enabled: true },
        { id: 'CIS-1.5', title: 'Strong Password Encryption Standard', category: 'Authentication & AAA', baseline: 'service password-encryption or secret algorithm >= 8/9', severity: 'HIGH', enabled: true },
        { id: 'CIS-1.6', title: 'Remote SIEM / Syslog Forwarding', category: 'Telemetry & Logging', baseline: 'Central logging host configured with millisecond timestamps', severity: 'HIGH', enabled: true },
        { id: 'CIS-1.7', title: 'NTP Cryptographic Time Synchronization', category: 'Time Synchronization', baseline: 'Authoritative NTP server configured with authentication', severity: 'MEDIUM', enabled: true },
        { id: 'CIS-1.8', title: 'SNMPv3 Enforcement & Community Removal', category: 'Monitoring (SNMP)', baseline: 'Default strings (public/private) removed; SNMPv3 only', severity: 'CRITICAL', enabled: true }
      ]
    },
    NIST: {
      name: 'NIST SP 800-53 Rev 5',
      version: 'Security and Privacy Controls for Federal Information Systems',
      description: 'Federal compliance standard establishing baseline management, operational, and technical security controls.',
      rulesCount: 6,
      status: 'Active',
      rules: [
        { id: 'NIST-AC-17', title: 'Remote Access Session Confidentiality', category: 'Management Plane', baseline: 'SSHv2 cryptographically protected remote sessions', severity: 'CRITICAL', enabled: true },
        { id: 'NIST-AC-11', title: 'Device Lock / Session Termination', category: 'Management Plane', baseline: 'Session termination on inactivity timeout <= 900s', severity: 'MEDIUM', enabled: true },
        { id: 'NIST-AU-2', title: 'Event Logging & SIEM Buffering', category: 'Telemetry & Logging', baseline: 'Central syslog forwarding host active', severity: 'HIGH', enabled: true },
        { id: 'NIST-AU-8', title: 'Time Stamp Synchronization', category: 'Time Synchronization', baseline: 'Millisecond log timestamps and NTP sync', severity: 'MEDIUM', enabled: true },
        { id: 'NIST-IA-2', title: 'Identification and Authentication', category: 'Authentication & AAA', baseline: 'Centralized RADIUS/TACACS+ and password hashing', severity: 'CRITICAL', enabled: true },
        { id: 'NIST-SC-8', title: 'Transmission Confidentiality and Integrity', category: 'Management Plane', baseline: 'Cleartext HTTP server disabled (HTTPS only)', severity: 'HIGH', enabled: true }
      ]
    },
    DISA_STIG: {
      name: 'DoD DISA STIGs (Security Technical Implementation Guides)',
      version: 'Network Infrastructure Router & Switch STIG',
      description: 'Department of Defense technical baseline specifying mandatory security controls (CAT I, CAT II, CAT III) for military networks.',
      rulesCount: 6,
      status: 'Active',
      rules: [
        { id: 'STIG-NET-0001', title: 'CAT I: Disable Cleartext Telnet Access', category: 'Management Plane', baseline: 'Insecure Telnet daemon must be completely disabled', severity: 'CRITICAL', enabled: true },
        { id: 'STIG-NET-0002', title: 'CAT I: Remove Default SNMP Community Strings', category: 'Monitoring (SNMP)', baseline: 'Default public/private SNMP communities must be removed', severity: 'CRITICAL', enabled: true },
        { id: 'STIG-NET-0003', title: 'CAT II: SSH Protocol Version 2 Enforcement', category: 'Management Plane', baseline: 'SSH version 2 only with strong cipher suites', severity: 'HIGH', enabled: true },
        { id: 'STIG-NET-0004', title: 'CAT II: Encrypt All Passwords in Configuration', category: 'Authentication & AAA', baseline: 'Legacy plain-text passwords strictly prohibited', severity: 'HIGH', enabled: true },
        { id: 'STIG-NET-0005', title: 'CAT II: Forward Audit Logs to Central SIEM', category: 'Telemetry & Logging', baseline: 'Forward all security events to enterprise syslog', severity: 'HIGH', enabled: true },
        { id: 'STIG-NET-0006', title: 'CAT III: Enforce Standard Legal Notice Banner', category: 'Management Plane', baseline: 'Authorized DoD warning banner displayed prior to logon', severity: 'LOW', enabled: true }
      ]
    },
    ISO27001: {
      name: 'ISO/IEC 27001:2022 Controls',
      version: 'Information Security Management System (Annex A)',
      description: 'International standard for managing information security risks, telecommunications, and network segregation.',
      rulesCount: 4,
      status: 'Active',
      rules: [
        { id: 'ISO-A.8.9', title: 'Configuration Management (A.8.9)', category: 'Management Plane', baseline: 'Standard security baselines enforced and monitored', severity: 'HIGH', enabled: true },
        { id: 'ISO-A.8.15', title: 'Logging and Monitoring (A.8.15)', category: 'Telemetry & Logging', baseline: 'Logs recorded and protected from unauthorized alteration', severity: 'HIGH', enabled: true },
        { id: 'ISO-A.8.20', title: 'Network Security (A.8.20)', category: 'Management Plane', baseline: 'Secure communication channels used for all administrative access', severity: 'CRITICAL', enabled: true },
        { id: 'ISO-A.8.24', title: 'Use of Cryptography (A.8.24)', category: 'Authentication & AAA', baseline: 'Modern cryptographic algorithms used for credentials & sessions', severity: 'HIGH', enabled: true }
      ]
    }
  });

  const toggleRule = (fwKey, ruleId) => {
    setFrameworksState(prev => {
      const fw = prev[fwKey];
      const updatedRules = fw.rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
      return {
        ...prev,
        [fwKey]: {
          ...fw,
          rules: updatedRules
        }
      };
    });
    if (showToast) showToast(`Rule ${ruleId} updated.`);
  };

  const currentFw = frameworksState[activeFw];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
            <span>Platform Governance</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-900 font-bold">Framework & Compliance Rule Management</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure industry benchmarks, control parameters, and custom threshold policies for the compliance engine.
          </p>
        </div>

        <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
          ✓ All 4 Frameworks Synchronized
        </span>
      </div>

      {/* Framework Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(frameworksState).map(([key, fw]) => {
          const isSelected = activeFw === key;
          return (
            <button
              key={key}
              onClick={() => setActiveFw(key)}
              className={`p-4 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-400'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900">{key}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {fw.rulesCount} Rules
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">{fw.name}</p>
            </button>
          );
        })}
      </div>

      {/* Active Framework Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">{currentFw.name}</h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{currentFw.version}</p>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">{currentFw.description}</p>
        </div>

        {/* Rules Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3">Rule ID</th>
                <th className="p-3">Control Title</th>
                <th className="p-3">Security Domain</th>
                <th className="p-3">Required Policy Baseline</th>
                <th className="p-3">Severity</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentFw.rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900">{r.id}</td>
                  <td className="p-3 font-semibold text-slate-800">{r.title}</td>
                  <td className="p-3 text-slate-500 text-[11px]">{r.category}</td>
                  <td className="p-3 text-blue-700 font-medium text-[11px]">{r.baseline}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      r.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                      r.severity === 'HIGH' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      r.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => toggleRule(activeFw, r.id)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                        r.enabled
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <span>{r.enabled ? 'Enabled' : 'Disabled'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Data Sources & Regulatory Citations Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
              <BookOpen className="w-4 h-4" />
              <span>Authoritative Citations</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-900 font-bold">Data Provenance & Regulatory References</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Every compliance rule, AST normalization schema, and remediation command in this platform is directly mapped to official government, industry, and vendor consensus publications.
            </p>
          </div>
          <div className="flex items-center space-x-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 text-xs font-semibold shrink-0">
            <span>SIH26155 Compliant Engine</span>
          </div>
        </div>

        {/* 1. Regulatory Standards Citations Grid */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>1. Regulatory & Security Framework Consensus Sources</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">Center for Internet Security (CIS)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">CIS-CAT Pro Compatible</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-700">CIS Cisco IOS 15/16, PAN-OS, FortiGate & Junos Benchmarks</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Prescriptive consensus baselines for Level 1 & Level 2 profiles covering Telnet retirement, SSHv2 ciphers, AAA RADIUS/TACACS+, NTP time synchronization, and SNMPv3 string sanitization.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Source: cisecurity.org</span>
                <a
                  href="https://www.cisecurity.org/cis-benchmarks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
                >
                  <span>CIS Benchmarks Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">National Institute of Standards & Technology (NIST)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">SP 800-53 Rev 5</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-700">Security & Privacy Controls for Information Systems</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Controls AC-17 (Remote Access Confidentiality), AC-11 (Session Termination & Idle Timeout), AU-2 (Audit Events & SIEM Logging), AU-8 (Time Stamps), IA-2 (Identification & Authentication), and SC-8 (Transmission Confidentiality).
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Source: csrc.nist.gov</span>
                <a
                  href="https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
                >
                  <span>NIST CSRC Publication</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">DoD Defense Information Systems Agency (DISA)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">DoD STIGs (CAT I/II/III)</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-700">Network Infrastructure Router & Switch STIGs</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Mandatory Department of Defense severity classification: CAT I (immediate vulnerability, e.g. active Telnet, default SNMP community), CAT II (confidentiality degradation, password hashing), and CAT III (banners & notices).
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Source: public.cyber.mil</span>
                <a
                  href="https://public.cyber.mil/stigs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
                >
                  <span>DoD Cyber Exchange</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">International Organization for Standardization (ISO)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">ISO/IEC 27001:2022</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-700">Annex A Information Security Controls</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Audits A.8.9 (Configuration Management Baselines), A.8.15 (Logging and Monitoring Protection), A.8.20 (Network Security & Segregation), and A.8.24 (Modern Cryptography Enforcement).
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Source: iso.org</span>
                <a
                  href="https://www.iso.org/standard/27001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
                >
                  <span>ISO Standards Catalogue</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Vendor Hardening Guides & Configuration Architecture */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>2. Multi-Vendor Configuration & Syntax References</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] font-bold text-blue-600 uppercase">Cisco Systems</span>
              <p className="font-bold text-slate-900 mt-0.5 text-[11px]">IOS-XE 16.x / 17.x</p>
              <p className="text-[10px] text-slate-500 mt-1">Cisco Hardening Guide, Control Plane Policing (CoPP), Type-8/9 PBKDF2/scrypt secrets.</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] font-bold text-amber-600 uppercase">Palo Alto</span>
              <p className="font-bold text-slate-900 mt-0.5 text-[11px]">PAN-OS 10.x / 11.x</p>
              <p className="text-[10px] text-slate-500 mt-1">PAN-OS Best Practice Assessment (BPA), set-syntax and XML hierarchy security profiles.</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] font-bold text-rose-600 uppercase">Fortinet</span>
              <p className="font-bold text-slate-900 mt-0.5 text-[11px]">FortiOS 7.x</p>
              <p className="text-[10px] text-slate-500 mt-1">FortiGate CLI Reference, config system global, config system admin, syslog streaming.</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] font-bold text-cyan-600 uppercase">Juniper</span>
              <p className="font-bold text-slate-900 mt-0.5 text-[11px]">Junos OS</p>
              <p className="text-[10px] text-slate-500 mt-1">Juniper Day One: Securing Junos Devices, system login, system services ssh, root-authentication.</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] font-bold text-indigo-600 uppercase">Arista</span>
              <p className="font-bold text-slate-900 mt-0.5 text-[11px]">EOS 4.x</p>
              <p className="text-[10px] text-slate-500 mt-1">Arista EOS Configuration Guide, Management VRF, SHA-512 secrets, SSH cipher suite restriction.</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">SONiC / OCP</span>
              <p className="font-bold text-slate-900 mt-0.5 text-[11px]">ConfigDB JSON</p>
              <p className="text-[10px] text-slate-500 mt-1">Linux Foundation SONiC config_db.json schema, Redis DB, TACACS_SERVER, SYSLOG_SERVER.</p>
            </div>
          </div>
        </div>

        {/* 3. Problem Statement Mapping Banner */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 font-mono text-[10px] font-bold border border-blue-400/30">
                SIH26155 Specification
              </span>
              <span className="text-xs font-bold text-white">Smart India Hackathon Problem Statement 26155</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Multi-Vendor Network Configuration Hardening & Regulatory Compliance Verification via Canonical Abstract Syntax Trees (AST).
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 font-mono block">Consensus Baseline v2.4</span>
            <span className="text-xs font-semibold text-emerald-400">100% Deterministic Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
