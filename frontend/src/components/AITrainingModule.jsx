import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Trash2, Cpu, AlertTriangle, X, 
  Plus, Terminal, Sparkles, BookOpen, Layers
} from 'lucide-react';
import { 
  fetchHeuristics, createHeuristic, deleteHeuristic, fetchTrainingSuggestions 
} from '../api/client';

const CANONICAL_MAP = {
  management: [
    { id: 'idle_timeout_seconds', label: 'Session Idle Timeout (seconds)', type: 'integer', defaultVal: '900' },
    { id: 'telnet_disabled', label: 'Disable Cleartext Telnet', type: 'boolean', defaultVal: 'true' },
    { id: 'ssh_version', label: 'SSH Protocol Version', type: 'integer', defaultVal: '2' },
    { id: 'http_server_disabled', label: 'Disable Cleartext HTTP Web Server', type: 'boolean', defaultVal: 'true' },
    { id: 'login_banner_present', label: 'Legal Warning Banner Present', type: 'boolean', defaultVal: 'true' },
  ],
  aaa: [
    { id: 'password_encryption_enabled', label: 'Strong Password Encryption', type: 'boolean', defaultVal: 'true' },
    { id: 'central_auth_configured', label: 'Central RADIUS/TACACS+ Integration', type: 'boolean', defaultVal: 'true' },
    { id: 'failed_login_lockout_enabled', label: 'Account Lockout Policy', type: 'boolean', defaultVal: 'true' },
  ],
  logging: [
    { id: 'remote_syslog_configured', label: 'Remote SIEM/Syslog Server Forwarding', type: 'boolean', defaultVal: 'true' },
    { id: 'log_timestamps_enabled', label: 'Millisecond Log Timestamps', type: 'boolean', defaultVal: 'true' },
  ],
  ntp: [
    { id: 'ntp_servers_configured', label: 'NTP Time Server Configured', type: 'boolean', defaultVal: 'true' },
    { id: 'ntp_auth_enabled', label: 'Cryptographically Authenticated NTP', type: 'boolean', defaultVal: 'true' },
  ],
  snmp: [
    { id: 'snmpv3_only', label: 'Enforce SNMPv3 Only', type: 'boolean', defaultVal: 'true' },
    { id: 'snmp_insecure_communities_removed', label: 'Remove Default Communities (public/private)', type: 'boolean', defaultVal: 'true' },
  ],
  interfaces: [
    { id: 'unused_interfaces_shutdown', label: 'Shutdown Unallocated Interfaces', type: 'boolean', defaultVal: 'true' },
    { id: 'default_deny_firewall', label: 'Default Deny Perimeter Policy', type: 'boolean', defaultVal: 'true' },
  ]
};

export default function AITrainingModule({ report, onReAudit, isOpen, onClose }) {
  const [heuristics, setHeuristics] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [trainingSuccessMsg, setTrainingSuccessMsg] = useState('');
  
  // Mapping Studio Form State
  const [selectedRawLine, setSelectedRawLine] = useState('');
  const [vendor, setVendor] = useState('custom_vendor');
  const [category, setCategory] = useState('management');
  const [parameter, setParameter] = useState('idle_timeout_seconds');
  const [paramType, setParamType] = useState('integer');
  const [targetValue, setTargetValue] = useState('900');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHeuristics();
      if (report?.unparsed_lines && report.unparsed_lines.length > 0) {
        loadSuggestions(report.unparsed_lines);
      }
    }
  }, [isOpen, report]);

  useEffect(() => {
    const list = CANONICAL_MAP[category] || [];
    const found = list.find(p => p.id === parameter);
    if (found) {
      setParamType(found.type);
      setTargetValue(found.defaultVal);
    }
  }, [category, parameter]);

  const loadHeuristics = async () => {
    try {
      const data = await fetchHeuristics();
      setHeuristics(data);
    } catch (err) {
      console.error('Failed to load heuristics:', err);
    }
  };

  const loadSuggestions = async (lines) => {
    setLoadingSuggestions(true);
    try {
      const data = await fetchTrainingSuggestions(lines);
      const map = {};
      data.forEach(s => {
        map[s.raw_line] = s;
      });
      setSuggestions(map);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleApplySuggestion = (sug) => {
    setSelectedRawLine(sug.raw_line);
    setCategory(sug.suggested_category);
    setParameter(sug.suggested_parameter);
    setParamType(sug.suggested_type);
    setTargetValue(sug.suggested_value);
    setDescription(`Automated rule: ${sug.explanation}`);
  };

  const handleTrainSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRawLine.trim()) return;

    setIsSubmitting(true);
    setTrainingSuccessMsg('');

    try {
      await createHeuristic({
        vendor: report?.vendor || vendor,
        raw_line: selectedRawLine,
        canonical_category: category,
        canonical_parameter: parameter,
        parameter_type: paramType,
        target_value: targetValue,
        description: description || `Rule for ${parameter}`,
      });

      setTrainingSuccessMsg(`Custom rule created for '${parameter}'!`);
      setSelectedRawLine('');
      await loadHeuristics();
      if (onReAudit) onReAudit();
    } catch (err) {
      console.error('Failed to save heuristic:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHeuristic(id);
      await loadHeuristics();
      if (onReAudit) onReAudit();
    } catch (err) {
      console.error('Failed to delete heuristic:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <span>Advanced Settings: Custom Hardware Parsing Rules</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage custom syntax definitions and vendor command mappings.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {trainingSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{trainingSuccessMsg}</span>
            </div>
          )}

          {/* Active Heuristics Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Active Custom Rules ({heuristics.length})
              </h3>
              <span className="text-[11px] text-slate-400">Saved in system database</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-2.5">Vendor</th>
                    <th className="p-2.5">CLI Syntax Pattern</th>
                    <th className="p-2.5">Mapped Security Parameter</th>
                    <th className="p-2.5">Target Value</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {heuristics.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-slate-400 text-xs">
                        No custom rules registered yet.
                      </td>
                    </tr>
                  ) : (
                    heuristics.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold uppercase text-slate-700">{h.vendor}</td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-800 max-w-[200px] truncate" title={h.raw_line}>
                          {h.raw_line}
                        </td>
                        <td className="p-2.5 text-blue-700 font-medium">
                          {h.canonical_category}.{h.canonical_parameter}
                        </td>
                        <td className="p-2.5 font-mono text-slate-600">{h.target_value}</td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => handleDelete(h.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add New Custom Rule Form */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Define New Syntax Mapping</span>
            </h3>

            <form onSubmit={handleTrainSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Device CLI Command Line
                </label>
                <input
                  type="text"
                  placeholder="e.g. exec-timeout 15 0 or service password-encryption"
                  value={selectedRawLine}
                  onChange={(e) => setSelectedRawLine(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Domain</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      const list = CANONICAL_MAP[e.target.value] || [];
                      if (list.length > 0) setParameter(list[0].id);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="management">Management Plane</option>
                    <option value="aaa">AAA / Authentication</option>
                    <option value="logging">Telemetry & Logging</option>
                    <option value="ntp">NTP Time Sync</option>
                    <option value="snmp">SNMP Monitoring</option>
                    <option value="interfaces">Perimeter & Interfaces</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Security Parameter</label>
                  <select
                    value={parameter}
                    onChange={(e) => setParameter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {(CANONICAL_MAP[category] || []).map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Normalized Value</label>
                  <input
                    type="text"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedRawLine.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Rule...' : 'Save & Persist Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
