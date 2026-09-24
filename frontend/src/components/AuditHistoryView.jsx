import React, { useState, useEffect } from 'react';
import { 
  Clock, TrendingUp, ShieldCheck, AlertTriangle, CheckCircle2, 
  ArrowRight, Download, FileText, ChevronRight
} from 'lucide-react';
import { fetchAuditHistory, downloadPdfReport } from '../api/client';

export default function AuditHistoryView({ report, onDownloadPdf, isGeneratingPdf }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await fetchAuditHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load audit history:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
            <span>Historical Compliance Tracking</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-900 font-bold">Multi-Scan Remediation Progression</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare past audit cycles to verify how compliance improved following CLI remediation.
          </p>
        </div>

        <button
          onClick={onDownloadPdf}
          disabled={!report || isGeneratingPdf}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Historical Dossier</span>
        </button>
      </div>

      {/* High-Level Progression Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {history.map((aud, idx) => {
          const isLatest = idx === history.length - 1;
          const score = aud.compliance_score;
          const badgeClass = score >= 85 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : score >= 70 ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-amber-700 bg-amber-50 border-amber-200';
          const barClass = score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-blue-500' : 'bg-amber-500';

          return (
            <div 
              key={aud.audit_id}
              className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between ${
                isLatest ? 'border-blue-400 ring-1 ring-blue-300' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-500">{aud.audit_id}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${badgeClass}`}>
                    {score}% Compliant
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">{aud.name}</h3>
                <span className="text-[11px] text-slate-400 block mb-3">Audited on: {aud.date}</span>

                <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${barClass}`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-50 rounded-xl border border-slate-100 mb-3">
                  <div>
                    <span className="text-emerald-600 font-bold block">{aud.passed_count}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Pass</span>
                  </div>
                  <div>
                    <span className="text-rose-600 font-bold block">{aud.failed_count}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Fail</span>
                  </div>
                  <div>
                    <span className="text-rose-700 font-bold block">{aud.critical_count}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Critical</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {aud.notes}
                </p>
              </div>

              {isLatest && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-bold">
                  <span className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>+27% Total Security Gain</span>
                  </span>
                  <span className="text-slate-400 font-normal">Zero Criticals</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Timeline Progression Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Remediation Lifecycle Progression</span>
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          <div className="relative">
            <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-white"></span>
            <span className="text-xs font-bold text-slate-900">Audit 01 — Baseline Discovered (64% Compliant)</span>
            <p className="text-xs text-slate-500 mt-0.5">
              Initial hardware audit identified 5 critical issues: Insecure cleartext Telnet active on VTY lines 0-4, SNMP default community 'public' configured, and session idle timeout set to 0.
            </p>
          </div>

          <div className="relative">
            <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white"></span>
            <span className="text-xs font-bold text-slate-900">Audit 02 — Credentials & Access Hardened (78% Compliant)</span>
            <p className="text-xs text-slate-500 mt-0.5">
              Security Admin applied Cisco CLI hardening patch (`no ip telnet server`, `transport input ssh`, `service password-encryption`). Re-scan verified critical vulnerabilities reduced from 5 to 2.
            </p>
          </div>

          <div className="relative">
            <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white"></span>
            <span className="text-xs font-bold text-slate-900">Audit 03 — Full Hardening Verification (91% Compliant)</span>
            <p className="text-xs text-slate-500 mt-0.5">
              Configured centralized SIEM forwarding (`logging host 10.0.100.50`), millisecond timestamps, and authoritative NTP synchronization. Auditor verified and signed off on compliance dossier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
