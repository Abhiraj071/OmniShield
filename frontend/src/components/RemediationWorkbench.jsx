import React, { useState } from 'react';
import { 
  Terminal, Copy, Check, Download, ShieldCheck, AlertCircle, 
  ArrowRight, FileText, CheckCircle2, ChevronRight, Info
} from 'lucide-react';

export default function RemediationWorkbench({ report, activeFramework, onDownloadPdf, isGeneratingPdf, setActiveTab }) {
  const [copied, setCopied] = useState(false);

  if (!report) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-sm my-8">
        <p className="text-sm text-slate-500 mb-4">Please ingest a device configuration first to generate CLI remediation scripts.</p>
        <button
          onClick={() => setActiveTab('ingest')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
        >
          Go to Step 1: Configuration Ingestion
        </button>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(report.remediation_script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([report.remediation_script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeHost = (report.hostname || 'device').replace(/\s+/g, '_');
    a.download = `remediation_${safeHost}_${report.vendor}.cfg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const scriptLines = report.remediation_script ? report.remediation_script.split('\n') : [];
  const fwData = report.framework_results[activeFramework] || Object.values(report.framework_results)[0];
  const failedFindings = fwData?.findings?.filter(f => f.status === 'FAIL') || [];

  return (
    <div className="space-y-6">
      {/* Procedural Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
            <span>Step 4 of 4</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-900 font-bold">Actionable Hardening Remediation</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated CLI hardening script tailored for <strong className="text-slate-800">{report.hostname}</strong> ({report.vendor.toUpperCase()} {report.model}).
          </p>
        </div>

        {/* Action Buttons: Copy Script & Download .cfg Patch */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Script</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .cfg Patch</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Summary of Resolved Vulnerabilities */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-slate-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Target Deviations to Resolve</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Applying this script will mitigate <strong className="text-rose-700 font-semibold">{failedFindings.length} non-compliant findings</strong> on this device:
            </p>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {failedFindings.length === 0 ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-700 font-medium flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All controls compliant! No remediation needed.</span>
                </div>
              ) : (
                failedFindings.map((f, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-mono mb-1">
                      <span className="font-bold text-rose-700">{f.benchmark_id}</span>
                      <span className="text-[10px] text-slate-400 font-sans uppercase font-medium">{f.category}</span>
                    </div>
                    <p className="text-slate-800 font-medium text-xs truncate">{f.title}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Operational Guidance Card */}
          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200/80 text-xs text-slate-700 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Change Management Notice</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Always backup running configuration and test hardening scripts in a staging lab or scheduled maintenance window prior to production rollout.
            </p>
          </div>

          {/* Export Dossier Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-900 block">Executive Compliance Dossier</span>
            <p className="text-[11px] text-slate-500">
              Ready to present findings to leadership or auditors? Export the high-fidelity PDF report.
            </p>
            <button
              onClick={onDownloadPdf}
              disabled={isGeneratingPdf}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Official PDF Report'}</span>
            </button>
          </div>
        </div>

        {/* Right: Terminal CLI Script Viewer */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[540px]">
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="ml-2 font-mono text-xs font-semibold text-white">
                Hardening CLI Commands — {report.vendor.toUpperCase()}
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">{scriptLines.length} lines</span>
          </div>

          <div className="flex-1 bg-slate-950 p-4 font-mono text-xs overflow-y-auto leading-relaxed text-slate-200 select-text">
            {scriptLines.map((line, idx) => {
              const isComment = line.trim().startsWith('#') || line.trim().startsWith('!');
              const isBlockHeader = line.includes('===');
              return (
                <div key={idx} className="flex space-x-4">
                  <span className="text-slate-600 select-none text-[11px] w-6 text-right shrink-0">{idx + 1}</span>
                  <span className={
                    isBlockHeader 
                      ? 'text-cyan-400 font-bold' 
                      : isComment 
                      ? 'text-slate-400 italic' 
                      : 'text-emerald-400 font-semibold'
                  }>
                    {line || '\u00A0'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
