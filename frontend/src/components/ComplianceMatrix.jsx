import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, 
  Copy, Check, Terminal, Search, Filter, ArrowRight, ChevronRight,
  Shield, Layers, ChevronDown, ChevronUp
} from 'lucide-react';

export default function ComplianceMatrix({ report, activeFramework, onSelectFramework, setActiveTab }) {
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!report || !report.framework_results) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-sm my-8">
        <p className="text-sm text-slate-500 mb-4">Please ingest a device configuration first to review compliance findings.</p>
        <button
          onClick={() => setActiveTab('ingest')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
        >
          Go to Configuration Ingestion
        </button>
      </div>
    );
  }

  const currentSummary = report.framework_results[activeFramework] || Object.values(report.framework_results)[0];
  const findings = currentSummary ? currentSummary.findings : [];

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(findings.map(f => f.category)))];

  // Filter logic
  const filteredFindings = findings.filter((f) => {
    if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && f.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.benchmark_id.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.rationale.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyCommand = (cmd, idx) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const failedCount = findings.filter(f => f.status === 'FAIL').length;
  const passedCount = findings.filter(f => f.status === 'PASS').length;

  return (
    <div className="space-y-6">
      {/* Procedural Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
            <span>Step 3 of 4</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-900 font-bold">Compliance Findings & Audit Rules</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed control-by-control verification for <strong className="text-slate-800">{report.hostname}</strong> ({report.vendor.toUpperCase()}).
          </p>
        </div>

        {/* Quick jump to Step 4 */}
        <button
          onClick={() => setActiveTab('remediation')}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <span>Step 4: Remediation Plan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Framework Selector Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            {Object.keys(report.framework_results).map((fw) => {
              const isSelected = activeFramework === fw;
              const res = report.framework_results[fw];
              return (
                <button
                  key={fw}
                  onClick={() => onSelectFramework(fw)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{fw}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : res.compliance_score >= 80 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {res.compliance_score}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search benchmark ID, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium text-[11px] mr-1 uppercase tracking-wide">Status:</span>
            {['ALL', 'FAIL', 'PASS', 'WARNING'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st === 'FAIL' ? `Failed (${failedCount})` : st === 'PASS' ? `Passed (${passedCount})` : st}
              </button>
            ))}
          </div>

          {/* Severity Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium text-[11px] mr-1 uppercase tracking-wide">Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  severityFilter === sev
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-400 font-medium text-[11px] mr-1 uppercase tracking-wide">Domain:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-blue-100 text-blue-800 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {cat === 'ALL' ? 'All Domains' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center text-slate-400 border border-slate-200 shadow-sm">
            <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No findings matched your filter criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the status, severity, or search filters above.</p>
          </div>
        ) : (
          filteredFindings.map((finding, idx) => {
            const isPass = finding.status === 'PASS';
            const isFail = finding.status === 'FAIL';
            const isWarning = finding.status === 'WARNING';

            const statusClass = isPass
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isFail
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-amber-50 text-amber-700 border-amber-200';

            const sevClass =
              finding.severity === 'CRITICAL'
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : finding.severity === 'HIGH'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : finding.severity === 'MEDIUM'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-blue-50 text-blue-700 border-blue-200';

            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl p-5 border transition-all shadow-sm ${
                  isFail ? 'border-rose-200/80 hover:border-rose-300' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {isPass && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                      {isFail && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                      {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {finding.benchmark_id}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                          {finding.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5">{finding.title}</h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${sevClass}`}>
                      {finding.severity}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusClass}`}>
                      {finding.status === 'PASS' ? 'COMPLIANT' : finding.status === 'FAIL' ? 'NON-COMPLIANT' : 'REVIEW'}
                    </span>
                  </div>
                </div>

                {/* Discovered Setting vs Required Baseline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                      Current Discovered Setting
                    </span>
                    <span className={`font-mono font-semibold text-xs mt-0.5 block ${
                      isFail ? 'text-rose-700' : 'text-slate-800'
                    }`}>
                      {finding.current_value}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                      Required Security Baseline
                    </span>
                    <span className="font-mono font-semibold text-xs text-blue-700 mt-0.5 block">
                      {finding.expected_value}
                    </span>
                  </div>
                </div>

                {/* Rationale & Evidence */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                  <p>
                    <strong className="text-slate-800 font-semibold">Security Rationale:</strong> {finding.rationale}
                  </p>
                  {finding.evidence && (
                    <p className="font-mono text-[11px] text-slate-500 bg-slate-100/60 p-2 rounded-lg border border-slate-200 mt-1">
                      <span className="text-slate-400 font-sans font-medium">Observed Line: </span>
                      {finding.evidence}
                    </p>
                  )}
                </div>

                {/* Direct Remediation Snippet */}
                {finding.remediation_command && !finding.remediation_command.startsWith('#') && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span className="flex items-center space-x-1.5 text-blue-700 font-semibold">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Remediation CLI Command ({report.vendor.toUpperCase()}):</span>
                      </span>
                      <button
                        onClick={() => handleCopyCommand(finding.remediation_command, idx)}
                        className="flex items-center space-x-1 text-slate-600 hover:text-blue-600 font-medium transition-colors text-xs"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Command</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto selection:bg-blue-600">
                      {finding.remediation_command}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Procedural Footer Action */}
      <div className="flex justify-end pt-4">
        <button
          onClick={() => setActiveTab('remediation')}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <span>Proceed to Step 4: Remediation Plan →</span>
        </button>
      </div>
    </div>
  );
}
