import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, 
  HelpCircle, Search, Filter, Sparkles, FileText, Download,
  Check, ArrowRight, UserCheck, Eye, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { 
  fetchVerifications, verifyFinding, fetchAIReviews, submitAIReview, downloadPdfReport 
} from '../api/client';

export default function EvidenceReviewView({ report, activeFramework, onDownloadPdf, isGeneratingPdf, showToast }) {
  const [verifications, setVerifications] = useState({});
  const [aiReviews, setAiReviews] = useState([]);
  const [activeTabSub, setActiveTabSub] = useState('evidence'); // 'evidence' or 'ai_review'
  const [auditorNotes, setAuditorNotes] = useState({});
  const [selectedCategories, setSelectedCategories] = useState({});

  useEffect(() => {
    loadVerificationsData();
    loadAIReviewsData();
  }, []);

  const loadVerificationsData = async () => {
    try {
      const data = await fetchVerifications();
      setVerifications(data);
    } catch (err) {
      console.error('Failed to load verifications:', err);
    }
  };

  const loadAIReviewsData = async () => {
    try {
      const data = await fetchAIReviews();
      setAiReviews(data);
    } catch (err) {
      console.error('Failed to load AI reviews:', err);
    }
  };

  const handleVerify = async (benchmarkId, status) => {
    const notes = auditorNotes[benchmarkId] || (status === 'VALID' ? 'Verified against device running config.' : 'Deemed acceptable under local exception policy.');
    try {
      await verifyFinding({
        benchmark_id: benchmarkId,
        status: status,
        auditor_notes: notes,
        auditor_name: 'Priya Patel (Lead Auditor)',
      });
      loadVerificationsData();
      if (showToast) {
        showToast(`Finding ${benchmarkId} marked as ${status === 'VALID' ? 'Valid Finding ✓' : 'False Positive ✗'}`);
      }
    } catch (err) {
      console.error('Failed to record verification:', err);
    }
  };

  const handleAIReviewAction = async (reviewId, decision) => {
    const cat = selectedCategories[reviewId] || 'Session Management';
    try {
      await submitAIReview(reviewId, {
        command: reviewId,
        assigned_category: cat,
        decision: decision,
        notes: `Auditor feedback recorded for ${decision} action`,
      });
      loadAIReviewsData();
      if (showToast) {
        showToast(`AI syntax review submitted: ${decision}ed as ${cat}`);
      }
    } catch (err) {
      console.error('Failed to submit AI review:', err);
    }
  };

  const currentSummary = report?.framework_results?.[activeFramework] || (report ? Object.values(report.framework_results)[0] : null);
  const findings = currentSummary ? currentSummary.findings : [];

  return (
    <div className="space-y-6">
      {/* Auditor Executive Metrics (Function 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Total Devices</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">120</span>
          <span className="text-[10px] text-slate-400">Enterprise fleet</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Audited Assets</span>
          <span className="text-xl font-bold text-blue-600 mt-1 block">100</span>
          <span className="text-[10px] text-emerald-600 font-medium">83.3% Complete</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Pending Audit</span>
          <span className="text-xl font-bold text-amber-600 mt-1 block">20</span>
          <span className="text-[10px] text-slate-400">Queued for scan</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Controls Passed</span>
          <span className="text-xl font-bold text-emerald-600 mt-1 block">76</span>
          <span className="text-[10px] text-slate-400">Compliant</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Failed Deviations</span>
          <span className="text-xl font-bold text-rose-600 mt-1 block">24</span>
          <span className="text-[10px] text-rose-600 font-medium">Require review</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Critical Risk</span>
          <span className="text-xl font-bold text-rose-700 mt-1 block">5</span>
          <span className="text-[10px] text-rose-600 font-medium">Immediate fix</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">High Risk</span>
          <span className="text-xl font-bold text-rose-500 mt-1 block">12</span>
          <span className="text-[10px] text-slate-400">Elevation risks</span>
        </div>
      </div>

      {/* Subtabs for Auditor Verification & AI Review */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTabSub('evidence')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeTabSub === 'evidence'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Evidence Verification ⭐</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-mono">
              {findings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTabSub('ai_review')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeTabSub === 'ai_review'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Human-in-the-Loop AI Review</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono">
              {aiReviews.filter(r => r.status === 'NEEDS REVIEW').length}
            </span>
          </button>
        </div>

        {/* Generate Report Action */}
        <button
          onClick={onDownloadPdf}
          disabled={!report || isGeneratingPdf}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isGeneratingPdf ? 'Generating PDF...' : 'Generate Official Audit Dossier'}</span>
        </button>
      </div>

      {/* View 1: Evidence Verification ⭐ */}
      {activeTabSub === 'evidence' && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start space-x-2.5">
            <UserCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Auditor Verification Responsibility:</span>
              <p className="text-slate-600 mt-0.5">
                Inspect raw configuration lines discovered by the compliance engine. Verify findings as <strong>✓ Valid Finding</strong> or mark as <strong>✗ False Positive</strong> with formal auditor rationale.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {findings.map((f, idx) => {
              const verified = verifications[f.benchmark_id];
              const isFail = f.status === 'FAIL';

              return (
                <div 
                  key={idx} 
                  className={`bg-white rounded-2xl p-5 border transition-all shadow-sm ${
                    verified?.status === 'VALID' 
                      ? 'border-rose-300 ring-1 ring-rose-200' 
                      : verified?.status === 'FALSE_POSITIVE'
                      ? 'border-emerald-300 ring-1 ring-emerald-200'
                      : isFail ? 'border-rose-200' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {f.benchmark_id}
                        </span>
                        <span className="text-[11px] font-semibold uppercase text-slate-500">{f.category}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          f.status === 'PASS' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          Engine Result: {f.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5">{f.title}</h3>
                    </div>

                    {/* Verification Status Badge */}
                    {verified && (
                      <div className="shrink-0 text-right">
                        <span className={`inline-flex items-center space-x-1 text-xs font-bold px-3 py-1 rounded-full border ${
                          verified.status === 'VALID'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          <span>{verified.status === 'VALID' ? '✓ Valid Finding Confirmed' : '✗ Deemed False Positive'}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                          Signed by: {verified.auditor}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Evidence Comparison Box */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-mono my-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-sans font-bold uppercase tracking-wider">
                          Actual Discovered Evidence
                        </span>
                        <span className="text-rose-700 font-bold text-xs mt-0.5 block">
                          {f.evidence || f.current_value}
                        </span>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-slate-400 block text-[10px] font-sans font-bold uppercase tracking-wider">
                          Required Policy Baseline
                        </span>
                        <span className="text-blue-700 font-bold text-xs mt-0.5 block">
                          {f.expected_value}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-3">
                    <strong className="text-slate-800 font-semibold">Security Rationale:</strong> {f.rationale}
                  </p>

                  {/* Auditor Verification Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 max-w-md">
                      <input
                        type="text"
                        placeholder="Optional auditor notes or policy exception ID..."
                        value={auditorNotes[f.benchmark_id] || ''}
                        onChange={(e) => setAuditorNotes({ ...auditorNotes, [f.benchmark_id]: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVerify(f.benchmark_id, 'VALID')}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>✓ Finding Valid</span>
                      </button>

                      <button
                        onClick={() => handleVerify(f.benchmark_id, 'FALSE_POSITIVE')}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>✗ False Positive</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 2: Human-in-the-Loop AI Review */}
      {activeTabSub === 'ai_review' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Human-in-the-Loop AI Feedback:</span>
              <p className="text-slate-600 mt-0.5">
                When the NLP engine encounters novel vendor CLI syntax with confidence &lt; 90%, it requests human expert verification to map commands to canonical security parameters.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {aiReviews.map((rev) => (
              <div 
                key={rev.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                      {rev.vendor}
                    </span>
                    <div className="font-mono text-xs font-bold text-slate-900 bg-slate-100 p-2.5 rounded-xl border border-slate-200 mt-1">
                      {rev.command}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      rev.status === 'NEEDS REVIEW'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {rev.status}
                    </span>
                    <span className="text-xs text-slate-500 font-mono block mt-1">
                      AI Confidence: <strong className="text-slate-800">{rev.confidence}%</strong>
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">
                    AI Suggested Meaning
                  </span>
                  <span className="font-semibold text-blue-700 block mt-0.5">
                    {rev.ai_prediction}
                  </span>
                </div>

                {rev.status === 'NEEDS REVIEW' ? (
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-600 font-semibold">Confirm Domain:</span>
                      <select
                        value={selectedCategories[rev.id] || rev.suggested_categories[0]}
                        onChange={(e) => setSelectedCategories({ ...selectedCategories, [rev.id]: e.target.value })}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                      >
                        {rev.suggested_categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAIReviewAction(rev.id, 'ACCEPT')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        ✓ Accept AI Mapping
                      </button>
                      <button
                        onClick={() => handleAIReviewAction(rev.id, 'REJECT')}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
                      >
                        ✗ Reject Mapping
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-700 font-medium flex items-center space-x-1.5 pt-2 border-t border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Human review recorded: {rev.human_decision}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
