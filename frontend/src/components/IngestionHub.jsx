import React, { useState, useEffect } from 'react';
import { Upload, FileCode, Play, AlertCircle, RefreshCw, Check, ArrowRight, Server, FileText } from 'lucide-react';
import { fetchSamples, fetchSampleContent } from '../api/client';

export default function IngestionHub({ onAuditConfig, isAuditing }) {
  const [samples, setSamples] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState('cisco_catalyst_3850');
  const [rawConfig, setRawConfig] = useState('');
  const [vendorOverride, setVendorOverride] = useState('auto');
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load sample list on mount
  useEffect(() => {
    async function loadSamples() {
      try {
        const data = await fetchSamples();
        setSamples(data);
        if (data.length > 0) {
          loadSampleContent(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load sample configs:', err);
      }
    }
    loadSamples();
  }, []);

  const loadSampleContent = async (sampleId) => {
    setLoadingSample(true);
    setSelectedSampleId(sampleId);
    setErrorMsg('');
    try {
      const data = await fetchSampleContent(sampleId);
      setRawConfig(data.content);
    } catch (err) {
      setErrorMsg('Failed to load sample content from backend');
    } finally {
      setLoadingSample(false);
    }
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setRawConfig(e.target.result);
      setSelectedSampleId('');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rawConfig.trim()) {
      setErrorMsg('Please paste or upload a configuration file first');
      return;
    }
    setErrorMsg('');
    onAuditConfig(rawConfig, vendorOverride === 'auto' ? null : vendorOverride);
  };

  const lineCount = rawConfig ? rawConfig.split('\n').length : 0;

  const vendorBadges = {
    cisco: 'bg-blue-50 text-blue-700 border-blue-200',
    fortinet: 'bg-red-50 text-red-700 border-red-200',
    paloalto: 'bg-orange-50 text-orange-700 border-orange-200',
    juniper: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    arista: 'bg-sky-50 text-sky-700 border-sky-200',
    sonic: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className="space-y-6">
      {/* Procedural Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
            <span>Step 1 of 4</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-900 font-bold">Device Configuration Ingestion</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a multi-vendor enterprise template below, or upload/paste your own network hardware configuration.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleSubmit}
          disabled={isAuditing || !rawConfig.trim()}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
            isAuditing || !rawConfig.trim()
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95'
          }`}
        >
          {isAuditing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing & Auditing Controls...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Multi-Framework Audit →</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preset Enterprise Samples Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider text-slate-700 font-bold flex items-center space-x-2">
            <Server className="w-4 h-4 text-blue-600" />
            <span>Select Ready-to-Audit Enterprise Benchmark</span>
          </span>
          <span className="text-xs text-slate-400">Click any hardware model to load</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {samples.map((s) => {
            const isSelected = selectedSampleId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => loadSampleContent(s.id)}
                className={`p-3 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-400'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <span className={`text-[10px] font-bold block uppercase tracking-wide ${
                  isSelected ? 'text-blue-700' : 'text-slate-500'
                }`}>
                  {s.vendor}
                </span>
                <span className="text-xs font-semibold text-slate-800 truncate block mt-0.5" title={s.name}>
                  {s.name.split('(')[0].trim()}
                </span>
                <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                  {s.name.includes('(') ? `(${s.name.split('(')[1]}` : s.filename}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Ingestion & Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Upload & Config Controls */}
        <div className="space-y-4">
          {/* Drag & Drop Card */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all bg-white ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-3 text-blue-600">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-900 mb-1">Drag & Drop Config File</p>
            <p className="text-[11px] text-slate-500 mb-3">Accepts .cfg, .conf, .txt, .json</p>
            <label className="inline-block px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-200 transition-all">
              Browse Local File
              <input
                type="file"
                className="hidden"
                accept=".cfg,.conf,.txt,.json,.xml"
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
            </label>
          </div>

          {/* Vendor Syntax Parser Selection */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <label className="text-xs uppercase tracking-wider text-slate-700 font-bold block">
              Device Syntax Parser
            </label>
            <select
              value={vendorOverride}
              onChange={(e) => setVendorOverride(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="auto">Auto-Detect (Automatic Fingerprint)</option>
              <option value="cisco">Cisco IOS / IOS-XE</option>
              <option value="fortinet">Fortinet FortiOS</option>
              <option value="paloalto">Palo Alto PAN-OS</option>
              <option value="juniper">Juniper JunOS</option>
              <option value="arista">Arista EOS</option>
              <option value="sonic">SONiC Whitebox Linux</option>
              <option value="custom_vendor">Generic / Custom Hardware</option>
            </select>
            <p className="text-[11px] text-slate-400 leading-tight">
              Auto-detect inspects headers and syntax signatures automatically.
            </p>
          </div>

          {/* Configuration Metrics */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Lines of Configuration:</span>
              <span className="text-slate-900 font-bold font-mono">{lineCount}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Characters:</span>
              <span className="text-slate-900 font-bold font-mono">{rawConfig.length}</span>
            </div>
            <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-100">
              <span>Status:</span>
              <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>{loadingSample ? 'Loading sample...' : 'Ready for audit'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Syntax Configuration Editor */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[520px]">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
              <FileCode className="w-4 h-4 text-blue-600" />
              <span>Configuration Source View</span>
            </div>
            <button
              onClick={() => setRawConfig('')}
              className="text-xs text-slate-500 hover:text-rose-600 font-medium transition-colors"
            >
              Clear Editor
            </button>
          </div>

          <textarea
            value={rawConfig}
            onChange={(e) => setRawConfig(e.target.value)}
            placeholder="Paste raw running-config or show configuration output here..."
            className="flex-1 w-full bg-slate-50/50 p-4 font-mono text-xs text-slate-800 resize-none focus:outline-none focus:ring-0 leading-relaxed"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
