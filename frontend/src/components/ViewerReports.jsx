import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Search, CheckCircle2, Clock, X } from 'lucide-react';
import { fetchViewerReports } from '../api/client';

export default function ViewerReports({ onDownloadPdf, isGeneratingPdf }) {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchViewerReports();
        setReports(data);
      } catch (e) {
        console.error('Failed to load reports:', e);
      }
    }
    load();
  }, []);

  const filteredReports = reports.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.framework.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Audit Documentation
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">
            Executive Compliance Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal audit dossiers, monthly compliance summaries, and perimeter security assessments ready for download.
          </p>
        </div>

        <button
          onClick={onDownloadPdf}
          disabled={isGeneratingPdf}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Latest Dossier'}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports by title or standard..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          {filteredReports.length} Reports Archived
        </span>
      </div>

      {/* Reports Directory List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">Report Title</th>
              <th className="p-3.5">Audit Framework</th>
              <th className="p-3.5">Date Period</th>
              <th className="p-3.5">Format & Size</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReports.map((rep) => (
              <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3.5">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{rep.name}</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-sm block">{rep.description}</span>
                    </div>
                  </div>
                </td>

                <td className="p-3.5 font-medium text-slate-700">
                  {rep.framework}
                </td>

                <td className="p-3.5 text-slate-600 font-mono">
                  {rep.date}
                </td>

                <td className="p-3.5">
                  <span className="inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {rep.type} • {rep.size}
                  </span>
                </td>

                <td className="p-3.5 text-right space-x-2">
                  <button
                    onClick={() => setSelectedReport(rep)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={onDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                  {selectedReport.type} Document
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">{selectedReport.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Audit Scope: {selectedReport.framework}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-700 leading-relaxed">
                {selectedReport.description}
              </p>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Date Issued</span>
                  <span className="font-semibold text-slate-800">{selectedReport.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Archive Size</span>
                  <span className="font-semibold text-slate-800">{selectedReport.size}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified by Automated Compliance Engine with Lead Auditor Sign-off.</span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedReport(null);
                  onDownloadPdf();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Download PDF Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
