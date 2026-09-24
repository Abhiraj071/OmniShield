import React, { useState, useEffect } from 'react';
import { 
  Shield, Server, AlertTriangle, CheckCircle2, TrendingUp, 
  ArrowRight, Clock, FileText, Bell, Check, ChevronRight,
  Flame, Lock, ShieldAlert, Cpu
} from 'lucide-react';
import { fetchViewerOverview } from '../api/client';

export default function ViewerDashboard({ setActiveTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchViewerOverview();
        setData(res);
      } catch (err) {
        console.error('Failed to load viewer overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs">Loading Executive Compliance Overview...</p>
      </div>
    );
  }

  const { metrics, frameworks, compliance_trend_history, top_security_issues, recent_audits, device_distribution } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Security Compliance Consumer
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
            Good Morning, Abhishek
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Here's the current security and compliance posture of your network fleet.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Last updated: <strong>24 Sep 2026, 10:05 AM</strong></span>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Devices */}
        <div 
          onClick={() => setActiveTab('viewer_devices')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Devices</span>
            <Server className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{metrics.total_devices}</span>
            <span className="text-[11px] font-bold text-emerald-600">{metrics.devices_trend}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Monitored hardware assets</span>
        </div>

        {/* Card 2: Compliance */}
        <div 
          onClick={() => setActiveTab('viewer_compliance')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fleet Compliance</span>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-600">{metrics.compliance_score}%</span>
            <span className="text-[11px] font-bold text-emerald-600">{metrics.compliance_trend}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Multi-standard baseline</span>
        </div>

        {/* Card 3: Findings */}
        <div 
          onClick={() => setActiveTab('viewer_findings')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Findings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{metrics.total_findings}</span>
            <span className="text-[11px] font-bold text-emerald-600">{metrics.findings_trend}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Total security deviations</span>
        </div>

        {/* Card 4: Critical */}
        <div 
          onClick={() => setActiveTab('viewer_findings')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-rose-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Risk</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-rose-600">{metrics.critical_findings}</span>
            <span className="text-[11px] font-bold text-emerald-600">{metrics.critical_trend}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Urgent exposures</span>
        </div>
      </div>

      {/* Row 2: Security Posture & Compliance Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1: Security Posture Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Security Posture
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ● Status: {metrics.status}
              </span>
            </div>

            <div className="my-6 text-center">
              <span className="text-6xl font-black text-slate-900 tracking-tight">
                {metrics.compliance_score}%
              </span>
              <span className="text-xs font-semibold text-slate-500 block mt-1 uppercase tracking-wider">
                Overall Compliance
              </span>
            </div>

            {/* Posture Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden">
              <div 
                className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-700"
                style={{ width: `${metrics.compliance_score}%` }}
              ></div>
            </div>

            <p className="text-xs text-slate-500 text-center font-medium">
              Network operating at high assurance level across CIS and NIST standards.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Last audit executed: {metrics.last_audit_time}</span>
            <button 
              onClick={() => setActiveTab('viewer_compliance')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Details →
            </button>
          </div>
        </div>

        {/* Section 2: Compliance Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Compliance Trend (Last 7 Days)
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Continuous Improvement Trajectory
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>↑ {data.improvement_pct}% improvement</span>
              </span>
            </div>

            {/* Custom SVG Line Trend Chart */}
            <div className="h-44 flex items-end justify-between px-4 pt-6 pb-2 border-b border-slate-100 gap-4">
              {compliance_trend_history.map((pt, i) => {
                const heightPercent = ((pt.score - 50) / 50) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[11px] font-mono font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                      {pt.score}%
                    </span>
                    <div className="w-full bg-slate-100 rounded-t-lg h-32 flex items-end overflow-hidden">
                      <div 
                        className="w-full bg-blue-600 hover:bg-blue-700 rounded-t-lg transition-all duration-500 shadow-xs"
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-800">
                      {pt.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Remediation patches applied by Security Admin on Tuesday & Thursday.</span>
            <span className="text-emerald-600 font-semibold">Healthy Security Trajectory</span>
          </div>
        </div>
      </div>

      {/* Row 3: Security Findings Breakdown & Framework Posture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 3: Security Findings Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Security Findings Breakdown
            </h3>
            <button 
              onClick={() => setActiveTab('viewer_findings')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center space-x-1"
            >
              <span>View All 42 Findings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div 
              onClick={() => setActiveTab('viewer_findings')}
              className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-center cursor-pointer hover:bg-rose-100/70 transition-all"
            >
              <span className="text-2xl font-bold text-rose-700 block">{metrics.critical_findings}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Critical</span>
            </div>
            <div 
              onClick={() => setActiveTab('viewer_findings')}
              className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-center cursor-pointer hover:bg-rose-100/70 transition-all"
            >
              <span className="text-2xl font-bold text-rose-600 block">{metrics.high_findings}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">High Risk</span>
            </div>
            <div 
              onClick={() => setActiveTab('viewer_findings')}
              className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center cursor-pointer hover:bg-amber-100/70 transition-all"
            >
              <span className="text-2xl font-bold text-amber-700 block">{metrics.medium_findings}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Medium</span>
            </div>
            <div 
              onClick={() => setActiveTab('viewer_findings')}
              className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center cursor-pointer hover:bg-blue-100/70 transition-all"
            >
              <span className="text-2xl font-bold text-blue-700 block">{metrics.low_findings}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Low Risk</span>
            </div>
          </div>

          {/* Section 5: Device Distribution Breakdown */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 block mb-2">Fleet Composition by Vendor</span>
            <div className="flex flex-wrap gap-2">
              {device_distribution.map((d, i) => (
                <div key={i} className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="font-semibold text-slate-800">{d.vendor}:</span>
                  <span className="text-slate-500 font-mono">{d.count} devices</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Framework Compliance Posture */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Framework Compliance Alignment
            </h3>
            <button 
              onClick={() => setActiveTab('viewer_compliance')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center space-x-1"
            >
              <span>Inspect Controls</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {Object.entries(frameworks).map(([key, fw]) => {
              const barColor = fw.score >= 85 ? 'bg-emerald-500' : fw.score >= 75 ? 'bg-blue-500' : 'bg-amber-500';
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{fw.name}</span>
                    <span className="font-mono font-bold text-slate-700">{fw.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${fw.score}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{fw.passed} Passed</span>
                    <span className="text-rose-600">{fw.failed} Deviations</span>
                    <span>{fw.total_controls} Total Controls</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 4: Top Security Issues & Recent Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 6: Top Security Issues */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Top Priority Security Issues
              </h3>
            </div>
            <span className="text-xs text-slate-400">Affecting Fleet</span>
          </div>

          <div className="space-y-3">
            {top_security_issues.map((issue) => (
              <div 
                key={issue.id}
                onClick={() => setActiveTab('viewer_findings')}
                className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">{issue.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    issue.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                    issue.severity === 'HIGH' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {issue.severity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="text-rose-600 font-semibold">{issue.devices_affected} devices affected</span>
                  <span className="text-[11px] text-blue-600 font-medium">View Recommended Fix →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Recent Audits */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recent Network Audits
              </h3>
            </div>
            <button 
              onClick={() => setActiveTab('viewer_history')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Full History →
            </button>
          </div>

          <div className="space-y-3">
            {recent_audits.map((aud, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">{aud.device}</span>
                    <span className="text-[10px] font-mono uppercase bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded">
                      {aud.vendor}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {aud.framework} • {aud.timestamp}
                  </span>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border block ${
                    aud.score >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {aud.score}%
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
                    ✓ {aud.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
