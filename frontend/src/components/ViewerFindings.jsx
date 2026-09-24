import React, { useState } from 'react';
import { 
  AlertTriangle, Search, Filter, ShieldAlert, CheckCircle2, 
  XCircle, ChevronRight, X, Terminal, Lock, Info, Check
} from 'lucide-react';

export default function ViewerFindings({ report }) {
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedFinding, setSelectedFinding] = useState(null);

  // 42 simulated enterprise findings across devices with rich details
  const allFindings = [
    {
      id: 'FIND-01',
      title: 'Telnet Service Enabled on VTY Lines',
      device: 'Cisco-Router-01',
      vendor: 'Cisco',
      severity: 'CRITICAL',
      status: 'OPEN',
      framework: 'CIS Benchmark',
      control: 'Management Plane Security',
      evidence: 'line 48: transport input telnet ssh\nline 49: ip telnet server',
      why_it_matters: 'Telnet transmits authentication credentials and administrative sessions in cleartext, enabling packet sniffing and credential harvesting on local or transit network segments.',
      remediation_guidance: 'Disable Telnet server completely and enforce SSH version 2 only on lines vty 0 through 15.'
    },
    {
      id: 'FIND-02',
      title: 'Weak Password Policy (Type 7 Encryption)',
      device: 'Fortigate-FW-02',
      vendor: 'Fortinet',
      severity: 'HIGH',
      status: 'OPEN',
      framework: 'NIST SP 800-53',
      control: 'Identification & Auth (IA-2)',
      evidence: 'config system admin\n  set password-hash type-7-reversible\nend',
      why_it_matters: 'Reversible password hashing algorithms can be easily decrypted using offline lookup tables and weak XOR deciphering tools.',
      remediation_guidance: 'Enable PBKDF2 or SHA-512 password secret hashing across all administrator accounts.'
    },
    {
      id: 'FIND-03',
      title: 'Cleartext HTTP Web Management Interface Active',
      device: 'Core-Switch-04',
      vendor: 'Cisco',
      severity: 'HIGH',
      status: 'OPEN',
      framework: 'CIS Benchmark',
      control: 'System Confidentiality (SC-8)',
      evidence: 'ip http server\nno ip http secure-server',
      why_it_matters: 'Web GUI login cookies and session tokens are transmitted over unencrypted HTTP port 80.',
      remediation_guidance: 'Issue "no ip http server" and mandate HTTPS via "ip http secure-server" with TLS 1.3.'
    },
    {
      id: 'FIND-04',
      title: 'Centralized SIEM Logging Host Not Configured',
      device: 'Edge-Router-02',
      vendor: 'Juniper',
      severity: 'MEDIUM',
      status: 'OPEN',
      framework: 'ISO 27001',
      control: 'Logging & Monitoring (A.8.15)',
      evidence: 'system { syslog { file messages { any notice; } } }',
      why_it_matters: 'Security event logs stored only locally on device flash are vulnerable to overwriting during high traffic or evasion by intruders.',
      remediation_guidance: 'Configure remote syslog host forwarding to enterprise SOC collector over secure transport.'
    },
    {
      id: 'FIND-05',
      title: 'Default SNMP Community String (public)',
      device: 'DC-PAN-FW01',
      vendor: 'Palo Alto',
      severity: 'CRITICAL',
      status: 'RESOLVED',
      framework: 'CIS Benchmark',
      control: 'Monitoring Security',
      evidence: 'snmp-server community public ro',
      why_it_matters: 'Default read-only communities enable unauthenticated network topology discovery and device fingerprinting.',
      remediation_guidance: 'Remove default strings and migrate all telemetry to authenticated SNMPv3 with AES encryption.'
    },
    {
      id: 'FIND-06',
      title: 'Session Inactivity Idle Timeout Exceeds Policy',
      device: 'BR-JUNIPER-SRX',
      vendor: 'Juniper',
      severity: 'MEDIUM',
      status: 'OPEN',
      framework: 'NIST SP 800-53',
      control: 'Device Lock (AC-11)',
      evidence: 'system { login { idle-timeout 60; } }',
      why_it_matters: 'Unattended administrative terminals remaining logged in for an hour risk unauthorized physical or remote takeover.',
      remediation_guidance: 'Set exec idle timeout to 15 minutes (900 seconds) or less.'
    }
  ];

  const filteredFindings = allFindings.filter((f) => {
    if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.device.toLowerCase().includes(q) ||
        f.framework.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Security Findings Register
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">
            Findings (42 Total Active Observations)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review security deviations, evidence lines, and why each finding matters to enterprise risk.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Fix Execution Handled by Operations</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search findings, device name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wide">Severity:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                severityFilter === sev
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">Security Finding</th>
              <th className="p-3.5">Device Asset</th>
              <th className="p-3.5">Severity</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Framework Standard</th>
              <th className="p-3.5 text-right">Inspection</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredFindings.map((f) => (
              <tr 
                key={f.id}
                onClick={() => setSelectedFinding(f)}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                <td className="p-3.5 font-bold text-slate-900">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full" style={{
                      backgroundColor: f.severity === 'CRITICAL' ? '#e11d48' : f.severity === 'HIGH' ? '#f43f5e' : '#f59e0b'
                    }}></span>
                    <span>{f.title}</span>
                  </div>
                </td>

                <td className="p-3.5">
                  <span className="font-semibold text-slate-800">{f.device}</span>
                  <span className="text-[11px] text-slate-400 block">{f.vendor}</span>
                </td>

                <td className="p-3.5">
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    f.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                    f.severity === 'HIGH' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {f.severity}
                  </span>
                </td>

                <td className="p-3.5">
                  <span className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    f.status === 'OPEN'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    <span>{f.status === 'OPEN' ? 'Open Finding' : 'Resolved ✓'}</span>
                  </span>
                </td>

                <td className="p-3.5 text-slate-600 font-medium">
                  {f.framework}
                </td>

                <td className="p-3.5 text-right">
                  <span className="text-xs text-blue-600 font-semibold hover:underline flex items-center justify-end space-x-1">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Finding Detail Modal */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    selectedFinding.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {selectedFinding.severity} RISK
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Status: {selectedFinding.status}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedFinding.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Asset: {selectedFinding.device} • {selectedFinding.framework}</p>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Evidence */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Configuration Evidence
                </span>
                <pre className="p-3 bg-slate-900 text-rose-300 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed">
                  {selectedFinding.evidence}
                </pre>
              </div>

              {/* Why it Matters */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Why It Matters (Risk Assessment)
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedFinding.why_it_matters}
                </p>
              </div>

              {/* Recommended Remediation Guidance (Notice: No apply button) */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Recommended Remediation
                </span>
                <p className="text-xs text-blue-900 bg-blue-50/70 p-3 rounded-xl border border-blue-200 font-medium leading-relaxed">
                  {selectedFinding.remediation_guidance}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 italic">
                Execution restricted to Security Admin role.
              </span>
              <button
                onClick={() => setSelectedFinding(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
