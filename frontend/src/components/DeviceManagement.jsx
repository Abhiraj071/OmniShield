import React, { useState, useEffect } from 'react';
import { 
  Server, Plus, Trash2, Search, Filter, ShieldCheck, 
  CheckCircle2, Clock, AlertTriangle, ArrowRight, Play, X, Download,
  Upload, FileCode, RefreshCw, FileText
} from 'lucide-react';
import { fetchDevices, createDevice, deleteDevice, fetchSampleContent } from '../api/client';

export default function DeviceManagement({ 
  currentRole, 
  onSelectDeviceForAudit, 
  onDownloadDevicePdf,
  showToast 
}) {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Ingestion & Audit Modal State
  const [auditModalDevice, setAuditModalDevice] = useState(null);
  const [auditConfigText, setAuditConfigText] = useState('');
  const [isSubmittingAudit, setIsSubmittingAudit] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [vendor, setVendor] = useState('Cisco');
  const [deviceType, setDeviceType] = useState('Router');
  const [ip, setIp] = useState('192.168.1.1');
  const [osVersion, setOsVersion] = useState('IOS-XE');
  const [location, setLocation] = useState('Server Room');
  const [group, setGroup] = useState('Core Network');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auditingDeviceId, setAuditingDeviceId] = useState(null);

  const handleOpenAuditModal = async (dev) => {
    setAuditModalDevice(dev);
    const sampleMap = {
      'cisco': 'cisco_catalyst_3850',
      'fortinet': 'fortigate_fortios_7',
      'palo alto': 'paloalto_panos_10',
      'juniper': 'juniper_srx_junos',
      'arista': 'arista_eos_switch',
      'sonic': 'sonic_whitebox_switch'
    };
    const vKey = (dev.vendor || 'cisco').toLowerCase().trim();
    const sampleId = sampleMap[vKey] || 'cisco_catalyst_3850';
    try {
      const data = await fetchSampleContent(sampleId);
      setAuditConfigText(data.content);
    } catch {
      setAuditConfigText('! Enter running configuration below\n');
    }
  };

  const handleExecuteAuditFromModal = async () => {
    if (!auditModalDevice || !onSelectDeviceForAudit) return;
    setIsSubmittingAudit(true);
    try {
      await onSelectDeviceForAudit(auditModalDevice, auditConfigText);
      setAuditModalDevice(null);
      await loadDevices();
    } catch (err) {
      console.error('Audit execution failed:', err);
    } finally {
      setIsSubmittingAudit(false);
    }
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setAuditConfigText(e.target.result);
      if (showToast) showToast(`Loaded configuration from ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleDropFile = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleReloadDefaultSample = async () => {
    if (!auditModalDevice) return;
    const sampleMap = {
      'cisco': 'cisco_catalyst_3850',
      'fortinet': 'fortigate_fortios_7',
      'palo alto': 'paloalto_panos_10',
      'juniper': 'juniper_srx_junos',
      'arista': 'arista_eos_switch',
      'sonic': 'sonic_whitebox_switch'
    };
    const vKey = (auditModalDevice.vendor || 'cisco').toLowerCase().trim();
    const sampleId = sampleMap[vKey] || 'cisco_catalyst_3850';
    try {
      const data = await fetchSampleContent(sampleId);
      setAuditConfigText(data.content);
      if (showToast) showToast('Reset to clean vendor baseline configuration');
    } catch {}
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const data = await fetchDevices();
      setDevices(data);
    } catch (err) {
      console.error('Failed to load devices:', err);
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await createDevice({
        name,
        vendor,
        device_type: deviceType,
        ip,
        os_version: osVersion,
        location,
        group,
      });
      setIsAddModalOpen(false);
      setName('');
      loadDevices();
      if (showToast) showToast(`Device ${name} registered successfully!`);
    } catch (err) {
      console.error('Failed to add device:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDevice = async (id, devName) => {
    if (currentRole === 'viewer') return;
    try {
      await deleteDevice(id);
      loadDevices();
      if (showToast) showToast(`Device ${devName} removed from inventory.`);
    } catch (err) {
      console.error('Failed to delete device:', err);
    }
  };

  const isReadOnly = currentRole === 'viewer';

  const filteredDevices = devices.filter((d) => {
    if (vendorFilter !== 'ALL' && d.vendor.toLowerCase() !== vendorFilter.toLowerCase()) return false;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
            <span>Hardware Inventory</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-900 font-bold">Network Asset Management</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage enterprise routers, switches, next-gen firewalls, and disaggregated whitebox hardware.
          </p>
        </div>

        {/* Add Device Button */}
        {!isReadOnly && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Device</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by device name, IP, location..."
            value={search}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wide">Vendor:</span>
          {['ALL', 'Cisco', 'Fortinet', 'Palo Alto', 'Juniper', 'Arista', 'SONiC'].map((v) => (
            <button
              key={v}
              onClick={() => setVendorFilter(v)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                vendorFilter === v
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">Device Name</th>
              <th className="p-3.5">Vendor & Model</th>
              <th className="p-3.5">IP Address</th>
              <th className="p-3.5">Location / Group</th>
              <th className="p-3.5">Audit Status</th>
              <th className="p-3.5">Compliance Score</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDevices.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-400">
                  No devices found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredDevices.map((dev) => (
                <tr key={dev.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{dev.name}</span>
                        <span className="text-[11px] text-slate-400">{dev.device_type}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className="font-semibold text-slate-800 uppercase block">{dev.vendor}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{dev.os_version}</span>
                  </td>

                  <td className="p-3.5 font-mono text-slate-700 font-medium">
                    {dev.ip}
                  </td>

                  <td className="p-3.5">
                    <span className="text-slate-800 font-medium block">{dev.location}</span>
                    <span className="text-[11px] text-slate-400">{dev.group}</span>
                  </td>

                  <td className="p-3.5">
                    <span className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      dev.status === 'Audited'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dev.status === 'Audited' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <span>{dev.status}</span>
                    </span>
                  </td>

                  <td className="p-3.5">
                    {dev.last_audit_score !== null ? (
                      <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        dev.last_audit_score >= 80 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : dev.last_audit_score >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {dev.last_audit_score}%
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">Unscanned</span>
                    )}
                  </td>

                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                    {dev.status === 'Audited' && onDownloadDevicePdf && (
                      <button
                        onClick={() => onDownloadDevicePdf(dev)}
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs border border-emerald-200 transition-colors"
                        title="Download compliance PDF report for this device"
                      >
                        <Download className="w-3 h-3 text-emerald-600" />
                        <span>PDF</span>
                      </button>
                    )}

                    {onSelectDeviceForAudit && !isReadOnly && (
                      <button
                        onClick={() => handleOpenAuditModal(dev)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs border border-blue-200 transition-colors cursor-pointer"
                        title="Review configuration and audit this device"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Audit</span>
                      </button>
                    )}

                    {!isReadOnly && (
                      <button
                        onClick={() => handleDeleteDevice(dev.id, dev.name)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Remove device"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Device Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Server className="w-4 h-4 text-blue-600" />
                <span>Register New Network Asset</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDevice} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Device Hostname *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Core-Router-01"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Vendor Family
                  </label>
                  <select
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Cisco">Cisco IOS / IOS-XE</option>
                    <option value="Fortinet">Fortinet FortiOS</option>
                    <option value="Palo Alto">Palo Alto PAN-OS</option>
                    <option value="Juniper">Juniper JunOS</option>
                    <option value="Arista">Arista EOS</option>
                    <option value="SONiC">SONiC Whitebox</option>
                    <option value="Custom">Custom / Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Device Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Core Router"
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    IP Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 192.168.1.1"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Firmware / OS Version
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IOS-XE 17.3"
                    value={osVersion}
                    onChange={(e) => setOsVersion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Physical Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Server Room Rack 02"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Device Group / Security Zone
                </label>
                <input
                  type="text"
                  placeholder="e.g. Core Network"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  {isSubmitting ? 'Registering...' : 'Save & Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Device-Specific Ingestion & Audit Modal */}
      {auditModalDevice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <span>Audit Configuration for</span>
                    <span className="text-blue-600 font-mono">{auditModalDevice.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {auditModalDevice.vendor.toUpperCase()} • {auditModalDevice.device_type} • {auditModalDevice.ip} ({auditModalDevice.location})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuditModalDevice(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Instructions banner */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start space-x-2.5 text-blue-900">
                <FileCode className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-semibold">Confirm or Update Running Configuration:</strong>
                  <span className="text-blue-700 block text-[11px] mt-0.5">
                    Review the configuration below before running the multi-framework audit. You can paste changes, add newly hardened rules, or drop a new <code className="font-mono bg-blue-100/80 px-1 rounded">.cfg</code> file.
                  </span>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDropFile}
                className={`border-2 border-dashed rounded-xl p-3 text-center transition-all ${
                  isDragOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 font-medium text-xs">
                    Drop updated <code className="font-mono text-slate-800">.cfg / .conf / .json</code> file here, or
                  </span>
                  <label className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer underline">
                    browse
                    <input
                      type="file"
                      accept=".cfg,.conf,.txt,.json"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>

              {/* Config Text Editor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 text-xs flex items-center space-x-1.5">
                    <span>Active Configuration Payload</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({auditConfigText.split('\n').filter(Boolean).length} lines)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleReloadDefaultSample}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset to Vendor Default Config</span>
                  </button>
                </div>
                <textarea
                  value={auditConfigText}
                  onChange={(e) => setAuditConfigText(e.target.value)}
                  rows={13}
                  placeholder="Paste router/switch running configuration here..."
                  className="w-full p-3 font-mono text-[11px] text-emerald-400 bg-slate-900 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed shadow-inner"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAuditModalDevice(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmittingAudit || !auditConfigText.trim()}
                onClick={handleExecuteAuditFromModal}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingAudit ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Auditing {auditModalDevice.name}...</span>
                  </>
                ) : (
                  <>
                    <span>Run Multi-Framework Audit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
