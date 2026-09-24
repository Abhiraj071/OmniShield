import React from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, 
  Terminal, Server, Clock, Cpu, ArrowRight, Shield, Download,
  Check, FileText, ChevronRight, Layers, AlertCircle,
  Sparkles, UserCheck, BookOpen
} from 'lucide-react';

export default function DashboardOverview({ 
  report, 
  setActiveTab, 
  onSelectFramework, 
  activeFramework,
  onDownloadPdf,
  isGeneratingPdf,
  onOpenTraining
}) {
  if (!report) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-2xl mx-auto shadow-sm my-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 text-blue-600">
          <Server className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Device Configuration Loaded</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Please select an enterprise sample configuration or upload your device configuration file to initiate a comprehensive multi-framework compliance evaluation.
        </p>
        <button
          onClick={() => setActiveTab('ingest')}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all"
        >
          <span>Go to Step 1: Upload & Select Device</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const currentFw = report.framework_results[activeFramework] || Object.values(report.framework_results)[0];
  const score = currentFw ? currentFw.compliance_score : 0;

  // Severity counts
  const criticalCount = currentFw?.findings?.filter(f => f.status === 'FAIL' && f.severity === 'CRITICAL').length || 0;
  const highCount = currentFw?.findings?.filter(f => f.status === 'FAIL' && f.severity === 'HIGH').length || 0;
  const mediumCount = currentFw?.findings?.filter(f => f.status === 'FAIL' && f.severity === 'MEDIUM').length || 0;
  const lowCount = currentFw?.findings?.filter(f => f.status === 'FAIL' && f.severity === 'LOW').length || 0;
  const totalFailed = currentFw?.failed_count || 0;
  const totalPassed = currentFw?.passed_count || 0;

  // Status styling
  const isHealthy = score >= 80;
  const isModerate = score >= 50 && score < 80;

  const scoreBadgeBg = isHealthy ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isModerate ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200';
  const scoreTextColor = isHealthy ? 'text-emerald-600' : isModerate ? 'text-amber-600' : 'text-rose-600';
  const scoreBarColor = isHealthy ? 'bg-emerald-500' : isModerate ? 'bg-amber-500' : 'bg-rose-500';

  const frameworkDescriptions = {
    CIS: 'Center for Internet Security Benchmark profile',
    NIST: 'NIST SP 800-53 Rev 5 Federal Security Controls',
    DISA_STIG: 'DoD DISA Security Technical Implementation Guide',
    ISO27001: 'ISO/IEC 27001:2022 Information Security'
  };

  return (
    <div className="space-y-6">
      {/* Procedural Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
          <span className="font-semibold text-blue-600">Step 2 of 4</span>
          <span>•</span>
          <span className="text-slate-900 font-semibold">Executive Audit Dashboard</span>
          <span>•</span>
          <span>Target Asset: <strong className="text-slate-800">{report.hostname}</strong> ({report.vendor.toUpperCase()})</span>
        </div>
        <div className="flex items-center space-x-2">
          {onDownloadPdf && (
            <button
              onClick={onDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center space-x-1.5 text-xs text-slate-700 bg-white hover:bg-slate-50 font-semibold px-3 py-1.5 rounded-lg border border-slate-300 shadow-xs transition-all disabled:opacity-60 cursor-pointer"
              title="Download executive PDF compliance dossier"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('ingest')}
            className="text-xs text-slate-600 hover:text-blue-600 font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            ← Change Config
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className="flex items-center space-x-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
          >
            <span>Inspect Findings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Section: Device Summary & Primary Compliance Index */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Information Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  Audited Device Profile
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-3 tracking-tight">{report.hostname}</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{report.model || 'Standard Enterprise Hardware'}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Vendor Platform</span>
                <p className="text-base font-bold text-slate-900 uppercase tracking-wide mt-0.5">{report.vendor}</p>
              </div>
            </div>

            {/* Spec grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium">Firmware / OS</span>
                <span className="text-slate-800 font-semibold text-xs mt-0.5 block truncate" title={report.os_version}>
                  {report.os_version || 'Detected from Config'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium">Serial Number</span>
                <span className="text-slate-800 font-semibold text-xs mt-0.5 block">
                  {report.serial_number || 'N/A'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium">Baseline Controls</span>
                <span className="text-slate-800 font-semibold text-xs mt-0.5 block">
                  {currentFw?.total_controls || 8} Standard Rules
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium">Audit Status</span>
                <span className="text-emerald-700 font-semibold text-xs mt-0.5 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Audit Complete</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Automated AI Normalization active across management, AAA, telemetry, and perimeter planes.</span>
          </div>
        </div>

        {/* Primary Scorecard Gauge Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Posture Score</span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                {activeFramework}
              </span>
            </div>

            <div className="flex items-baseline justify-center my-6 space-x-1">
              <span className={`text-6xl font-black tracking-tight ${scoreTextColor}`}>{score}</span>
              <span className="text-2xl text-slate-400 font-bold">%</span>
            </div>

            {/* Score progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${scoreBarColor}`}
                style={{ width: `${Math.max(score, 5)}%` }}
              ></div>
            </div>
            
            <p className="text-center text-xs text-slate-500 font-medium">
              {score >= 80 ? 'Compliant with security baseline' : score >= 50 ? 'Moderate compliance posture - remediation suggested' : 'Action required: Significant security deviations found'}
            </p>
          </div>

          {/* Quick Stats Triple */}
          <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-slate-100 mt-4">
            <div className="bg-emerald-50 py-2 rounded-xl border border-emerald-100">
              <span className="text-emerald-700 font-bold block text-lg">{totalPassed}</span>
              <span className="text-emerald-600 text-[10px] font-semibold uppercase tracking-wider">Passed</span>
            </div>
            <div className="bg-rose-50 py-2 rounded-xl border border-rose-100">
              <span className="text-rose-700 font-bold block text-lg">{totalFailed}</span>
              <span className="text-rose-600 text-[10px] font-semibold uppercase tracking-wider">Failed</span>
            </div>
            <div className="bg-amber-50 py-2 rounded-xl border border-amber-100">
              <span className="text-amber-700 font-bold block text-lg">{currentFw?.warning_count || 0}</span>
              <span className="text-amber-600 text-[10px] font-semibold uppercase tracking-wider">Warnings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Framework Compliance Overview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Multi-Framework Security Benchmarks</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Select a security framework to review controls and detailed alignment.</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Click any card to switch framework</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(report.framework_results).map(([fwName, sumry]) => {
            const isSelected = activeFramework === fwName;
            const fwScore = sumry.compliance_score;
            const badgeClass = fwScore >= 80 
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
              : fwScore >= 50 
              ? 'text-amber-700 bg-amber-50 border-amber-200' 
              : 'text-rose-700 bg-rose-50 border-rose-200';
            
            const barClass = fwScore >= 80 ? 'bg-emerald-500' : fwScore >= 50 ? 'bg-amber-500' : 'bg-rose-500';

            return (
              <div
                key={fwName}
                onClick={() => {
                  onSelectFramework(fwName);
                }}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-400' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">{fwName}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${badgeClass}`}>
                    {fwScore}%
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mb-3 truncate">
                  {frameworkDescriptions[fwName] || 'Security framework standards'}
                </p>
                
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${barClass}`}
                    style={{ width: `${Math.max(fwScore, 5)}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span className="text-emerald-600 font-semibold">{sumry.passed_count} Pass</span>
                  <span className="text-rose-600 font-semibold">{sumry.failed_count} Fail</span>
                  <span className="text-slate-400">{sumry.total_controls} Total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Procedural Next Steps & Risk Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-700 font-bold mb-3 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Risk Severity Breakdown ({activeFramework})</span>
            </h3>

            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="flex items-center space-x-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  <span className="font-semibold">Critical Risk</span>
                </span>
                <span className={`font-bold px-2 py-0.5 rounded ${criticalCount > 0 ? 'bg-rose-100 text-rose-800' : 'text-slate-400'}`}>
                  {criticalCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="flex items-center space-x-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                  <span className="font-semibold">High Risk</span>
                </span>
                <span className={`font-bold px-2 py-0.5 rounded ${highCount > 0 ? 'bg-rose-100 text-rose-800' : 'text-slate-400'}`}>
                  {highCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="flex items-center space-x-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="font-semibold">Medium Risk</span>
                </span>
                <span className={`font-bold px-2 py-0.5 rounded ${mediumCount > 0 ? 'bg-amber-100 text-amber-800' : 'text-slate-400'}`}>
                  {mediumCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="flex items-center space-x-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                  <span className="font-semibold">Low Risk</span>
                </span>
                <span className={`font-bold px-2 py-0.5 rounded ${lowCount > 0 ? 'bg-blue-100 text-blue-800' : 'text-slate-400'}`}>
                  {lowCount}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Categorized automatically according to {activeFramework} severity standards.
          </div>
        </div>

        {/* Step 3 Action Card: Review Findings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-blue-600 font-bold mb-2">
              <Shield className="w-4 h-4" />
              <span>Step 3: Review Findings</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              {totalFailed} Non-Compliant Items Found
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Examine the detailed security rationale, discovered device configurations, and required benchmark thresholds for each failed control.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setActiveTab('compliance')}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-all"
            >
              <span>Inspect Detailed Findings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step 4 Action Card: CLI Remediation */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-emerald-600 font-bold mb-2">
              <Terminal className="w-4 h-4" />
              <span>Step 4: Hardening Remediation</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Hardening Script Ready
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Targeted CLI remediation script generated for {report.vendor.toUpperCase()} {report.model}. Ready to copy, test, or download as a configuration patch.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setActiveTab('remediation')}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>Open Remediation Workbench</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Operations & AI Modules Hub */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Platform Workspaces & AI Operations Hub</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Launch dedicated compliance modules, AI training studio, remediation workbench, and audit tools.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 self-start sm:self-auto">
            Interactive Command Center
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {/* Card 1: Ingestion Hub */}
          <div 
            onClick={() => setActiveTab('ingest')}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md bg-slate-50/50 hover:bg-white transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Config Ingestion Hub
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Drag-and-drop or paste raw CLI configs from Cisco, Fortinet, Palo Alto, Juniper, or Whitebox hardware.
              </p>
            </div>
            <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-blue-600">
              <span>Open Ingestion</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Compliance Findings */}
          <div 
            onClick={() => setActiveTab('compliance')}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md bg-slate-50/50 hover:bg-white transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Compliance Findings Matrix
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Line-by-line verification across CIS Benchmarks, NIST SP 800-53, DISA STIG, and ISO 27001.
              </p>
            </div>
            <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-indigo-600">
              <span>Inspect Controls</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: CLI Remediation Workbench */}
          <div 
            onClick={() => setActiveTab('remediation')}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md bg-slate-50/50 hover:bg-white transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Terminal className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                CLI Remediation Workbench
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Generate device-specific hardening commands, 1-click execution scripts, and rollback patches.
              </p>
            </div>
            <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-emerald-600">
              <span>Open Workbench</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 4: AI Training Studio */}
          <div 
            onClick={onOpenTraining}
            className="p-4 rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-md bg-purple-50/30 hover:bg-white transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                AI Training Studio (NLP Learning Loop)
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Train AI to parse unseen vendor command syntax with low-code GUI mapping. Zero code redeployment!
              </p>
            </div>
            <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-purple-600">
              <span>Launch AI Studio</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 5: Evidence Verification */}
          <div 
            onClick={() => setActiveTab('evidence_review')}
            className="p-4 rounded-xl border border-slate-200 hover:border-teal-400 hover:shadow-md bg-slate-50/50 hover:bg-white transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <UserCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                Evidence Verification & Review
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Human-in-the-loop validation: stamp findings as Valid or False Positive with auditor rationale notes.
              </p>
            </div>
            <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-teal-600">
              <span>Start Verification</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 6: Rules & Governance */}
          <div 
            onClick={() => setActiveTab('rules')}
            className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md bg-slate-50/50 hover:bg-white transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                Rules & Governance
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Turn security rules ON/OFF, adjust idle-timeout thresholds, and manage organizational audit policies.
              </p>
            </div>
            <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-amber-700">
              <span>Configure Rules</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
