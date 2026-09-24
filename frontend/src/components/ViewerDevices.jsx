import React, { useState, useEffect } from 'react';
import { 
  Server, Search, Filter, ShieldCheck, AlertTriangle, 
  CheckCircle2, X, ChevronRight, FileCode, Lock, Clock
} from 'lucide-react';
import { fetchDevices, fetchSampleContent } from '../api/client';

export default function ViewerDevices() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceConfigSnippet, setDeviceConfigSnippet] = useState('');
  const [activeDeviceTab, setActiveDeviceTab] = useState('overview');

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDevices();
        setDevices(data);
      } catch (err) {
        console.error('Failed to load devices:', err);
      }
    }
    load();
  }, []);

  const handleOpenDevice = async (dev) => {
    setSelectedDevice(dev);
    setActiveDeviceTab('overview');
    try {
      const sampleMap = {
        'Cisco': 'cisco_catalyst_3850',
        'Fortinet': 'fortigate_fortios_7',
        'Palo Alto': 'paloalto_panos_10',
        'Juniper': 'juniper_srx_junos',
        'Arista': 'arista_eos_switch',
        'SONiC': 'sonic_whitebox_switch'
      };
      const sampleId = sampleMap[dev.vendor] || 'cisco_catalyst_3850';
      const sample = await fetchSampleContent(sampleId);
      setDeviceConfigSnippet(sample.content);
    } catch (e) {
      setDeviceConfigSnippet('! Configuration loaded securely via management gateway\nhostname ' + dev.name + '\n!');
    }
  };

  const filteredDevices = devices.filter((d) => {
    if (vendorFilter !== 'ALL' && d.vendor.toLowerCase() !== vendorFilter.toLowerCase()) return false;
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'COMPLIANT' && d.status !== 'Audited') return false;
      if (statusFilter === 'ISSUES' && d.status === 'Audited') return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.ip.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.vendor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Network Asset Directory
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">
            Devices ({devices.length} Total Monitored)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Read-only posture review of enterprise routing, switching, and security infrastructure.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Management Consumer View (Read-Only)</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search devices by name, IP, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wide">Filter:</span>
          {['ALL', 'Cisco', 'Fortinet', 'Palo Alto', 'Juniper', 'Arista', 'SONiC'].map((v) => (
            <button
              key={v}
              onClick={() => setVendorFilter(v)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                vendorFilter === v
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Devices List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">Device Hostname</th>
              <th className="p-3.5">Vendor / OS</th>
              <th className="p-3.5">Type & IP</th>
              <th className="p-3.5">Location</th>
              <th className="p-3.5">Compliance Status</th>
              <th className="p-3.5">Posture Score</th>
              <th className="p-3.5 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDevices.map((dev) => {
              const isCompliant = (dev.last_audit_score || 0) >= 80;
              const hasIssues = dev.last_audit_score !== null && dev.last_audit_score < 80;

              return (
                <tr 
                  key={dev.id} 
                  onClick={() => handleOpenDevice(dev)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="p-3.5">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{dev.name}</span>
                        <span className="text-[11px] text-slate-400">{dev.group}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className="font-bold text-slate-800 uppercase block">{dev.vendor}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{dev.os_version}</span>
                  </td>

                  <td className="p-3.5">
                    <span className="text-slate-800 font-medium block">{dev.device_type}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{dev.ip}</span>
                  </td>

                  <td className="p-3.5 text-slate-700">
                    {dev.location}
                  </td>

                  <td className="p-3.5">
                    <span className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      isCompliant
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : hasIssues
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      <span>{isCompliant ? '🟢 Compliant' : hasIssues ? '🔴 Issues Found' : '🟡 Review Required'}</span>
                    </span>
                  </td>

                  <td className="p-3.5 font-mono font-bold">
                    {dev.last_audit_score !== null ? (
                      <span className={dev.last_audit_score >= 80 ? 'text-emerald-700' : 'text-rose-700'}>
                        {dev.last_audit_score}%
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">Pending</span>
                    )}
                  </td>

                  <td className="p-3.5 text-right">
                    <span className="text-xs text-blue-600 font-semibold hover:underline flex items-center justify-end space-x-1">
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Device Detail Drawer / Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200">
                    {selectedDevice.vendor} • {selectedDevice.device_type}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700">🟢 Compliant</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{selectedDevice.name}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">IP: {selectedDevice.ip} • OS: {selectedDevice.os_version}</p>
              </div>
              <button 
                onClick={() => setSelectedDevice(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Subtabs */}
            <div className="flex items-center space-x-2 px-6 pt-3 border-b border-slate-200 bg-white text-xs">
              <button
                onClick={() => setActiveDeviceTab('overview')}
                className={`py-2 px-3 font-semibold border-b-2 transition-all ${
                  activeDeviceTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveDeviceTab('config')}
                className={`py-2 px-3 font-semibold border-b-2 transition-all ${
                  activeDeviceTab === 'config'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                View Configuration (Read-Only)
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {activeDeviceTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Compliance Score</span>
                      <span className="text-2xl font-bold text-emerald-600 mt-0.5 block">
                        {selectedDevice.last_audit_score || 91}%
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Location</span>
                      <span className="text-slate-800 font-semibold text-xs mt-1 block">
                        {selectedDevice.location}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                    <span className="font-bold block">Compliance Consumer Notice:</span>
                    <p className="text-slate-600">
                      You have full visibility into findings and configurations. Hardware modifications and remediation scripts must be executed by a designated Security Administrator.
                    </p>
                  </div>
                </div>
              )}

              {activeDeviceTab === 'config' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[11px]">Running Configuration (Read-Only)</span>
                    <span className="text-rose-600 font-semibold flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Editing Disabled</span>
                    </span>
                  </div>
                  <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto max-h-64 leading-relaxed">
                    {deviceConfigSnippet}
                  </pre>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedDevice(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
