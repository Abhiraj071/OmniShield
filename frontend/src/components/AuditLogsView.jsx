import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, ShieldCheck, CheckCircle2, 
  Clock, User, Terminal, Sparkles
} from 'lucide-react';
import { fetchAuditLogs } from '../api/client';

export default function AuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  const actionBadge = (action) => {
    if (action.includes('UPLOAD')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('AUDIT')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (action.includes('VERIFICATION')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('REMEDIATION')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (action.includes('AI') || action.includes('KNOWLEDGE')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const filteredLogs = logs.filter((log) => {
    if (roleFilter !== 'ALL' && log.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.actor.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
            <span>Governance & Compliance</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-900 font-bold">System Activity Audit Trail</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all user activities, configuration ingestion, verification decisions, and policy updates.
          </p>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Total Recorded Actions: <strong className="text-slate-700">{logs.length}</strong>
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by actor, action, target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wide">Actor Role:</span>
          {['ALL', 'Admin', 'Security Admin', 'Auditor', 'System'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                roleFilter === r
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">Actor & Role</th>
              <th className="p-3.5">Action Type</th>
              <th className="p-3.5">Target / Detail</th>
              <th className="p-3.5 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                  {log.timestamp}
                </td>

                <td className="p-3.5">
                  <span className="font-bold text-slate-900 block">{log.actor}</span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">{log.role}</span>
                </td>

                <td className="p-3.5">
                  <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${actionBadge(log.action)}`}>
                    {log.action}
                  </span>
                </td>

                <td className="p-3.5 text-slate-700 font-medium text-xs">
                  {log.target}
                </td>

                <td className="p-3.5 text-right">
                  <span className="inline-flex items-center space-x-1 text-emerald-700 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{log.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
