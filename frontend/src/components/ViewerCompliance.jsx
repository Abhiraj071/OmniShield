import React, { useState } from 'react';
import { Shield, CheckSquare, AlertTriangle, CheckCircle2, ChevronRight, Lock, BookOpen } from 'lucide-react';

export default function ViewerCompliance() {
  const [selectedFw, setSelectedFw] = useState('CIS');

  const frameworks = {
    CIS: {
      name: 'CIS Benchmark',
      score: 91,
      total_controls: 120,
      passed: 109,
      failed: 11,
      needs_review: 0,
      description: 'Center for Internet Security prescriptive benchmarks for hardening enterprise network devices.',
      domains: [
        { name: 'Authentication & AAA', score: 95, pass: 20, fail: 1 },
        { name: 'Access Control', score: 88, pass: 22, fail: 3 },
        { name: 'Logging & Telemetry', score: 92, pass: 24, fail: 2 },
        { name: 'Encryption & Ciphers', score: 89, pass: 17, fail: 2 },
        { name: 'Network Security', score: 94, pass: 26, fail: 3 }
      ]
    },
    NIST: {
      name: 'NIST SP 800-53 Rev 5',
      score: 84,
      total_controls: 110,
      passed: 92,
      failed: 18,
      needs_review: 0,
      description: 'National Institute of Standards and Technology federal security baseline controls.',
      domains: [
        { name: 'Access Control (AC)', score: 88, pass: 28, fail: 4 },
        { name: 'Audit & Accountability (AU)', score: 92, pass: 25, fail: 2 },
        { name: 'Identification & Authentication (IA)', score: 82, pass: 19, fail: 4 },
        { name: 'System & Communications Protection (SC)', score: 76, pass: 20, fail: 8 }
      ]
    },
    STIG: {
      name: 'DoD DISA STIG',
      score: 79,
      total_controls: 95,
      passed: 75,
      failed: 20,
      needs_review: 0,
      description: 'Defense Information Systems Agency Security Technical Implementation Guide for military networks.',
      domains: [
        { name: 'CAT I (Critical High Risk)', score: 82, pass: 23, fail: 5 },
        { name: 'CAT II (Medium Risk Hardening)', score: 77, pass: 34, fail: 10 },
        { name: 'CAT III (Low Risk Best Practices)', score: 85, pass: 18, fail: 5 }
      ]
    },
    ISO27001: {
      name: 'ISO/IEC 27001:2022',
      score: 88,
      total_controls: 80,
      passed: 70,
      failed: 10,
      needs_review: 0,
      description: 'International Information Security Management Standard controls for telecom and networks.',
      domains: [
        { name: 'Configuration Management (A.8.9)', score: 90, pass: 18, fail: 2 },
        { name: 'Logging and Monitoring (A.8.15)', score: 92, pass: 23, fail: 2 },
        { name: 'Network Security (A.8.20)', score: 85, pass: 17, fail: 3 },
        { name: 'Use of Cryptography (A.8.24)', score: 86, pass: 12, fail: 3 }
      ]
    }
  };

  const current = frameworks[selectedFw];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Multi-Standard Posture
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">
            Compliance Overview (86% Aggregate Compliance)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit results mapped across global cybersecurity frameworks without technical rule editing.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Rules Managed by Platform Administrator</span>
        </div>
      </div>

      {/* Framework Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(frameworks).map(([key, fw]) => {
          const isSelected = selectedFw === key;
          const isHigh = fw.score >= 85;
          const isMed = fw.score >= 75 && fw.score < 85;

          return (
            <div
              key={key}
              onClick={() => setSelectedFw(key)}
              className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-400'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">{fw.name}</span>
                <span className="text-sm">
                  {isHigh ? '🟢' : isMed ? '🟢' : '🟡'}
                </span>
              </div>

              <div className="flex items-baseline space-x-1.5 my-2">
                <span className={`text-3xl font-black ${isHigh ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {fw.score}%
                </span>
                <span className="text-xs text-slate-400 font-semibold">Compliance</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                <div 
                  className={`h-1.5 rounded-full ${isHigh ? 'bg-emerald-500' : isMed ? 'bg-blue-500' : 'bg-amber-500'}`}
                  style={{ width: `${fw.score}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>{fw.passed} Pass</span>
                <span className="text-rose-600 font-semibold">{fw.failed} Deviations</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Framework Granular Domain Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">{current.name}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">{current.description}</p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              {current.passed} Controls Passed
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-bold">
              {current.failed} Non-Compliant
            </span>
          </div>
        </div>

        {/* Security Domains Progress Bars */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Control Domain Breakdown
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {current.domains.map((dom, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{dom.name}</span>
                  <span className="font-mono font-bold text-slate-900">{dom.score}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full ${dom.score >= 90 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${dom.score}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>{dom.pass} Passing controls</span>
                  <span className={dom.fail > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600'}>
                    {dom.fail} Failed
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
