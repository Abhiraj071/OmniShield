import React, { useState } from 'react';
import { Settings, Moon, Sun, Bell, Shield, Key, Check } from 'lucide-react';

export default function ViewerSettings({ showToast }) {
  const [theme, setTheme] = useState('light');
  const [critNotif, setCritNotif] = useState(true);
  const [compNotif, setCompNotif] = useState(true);
  const [lowNotif, setLowNotif] = useState(false);
  const [repNotif, setRepNotif] = useState(true);

  const handleSave = () => {
    if (showToast) showToast('Settings preferences saved.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Platform Configuration
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">
            Viewer Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure visual appearance, alert subscriptions, and security session controls.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section: Appearance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <Sun className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Interface Appearance
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              { id: 'light', label: 'Light Mode', desc: 'Enterprise Clean' },
              { id: 'dark', label: 'Dark Mode', desc: 'Cyber Theme' },
              { id: 'system', label: 'System Match', desc: 'OS Default' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  handleSave();
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  theme === t.id
                    ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-400'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="font-bold text-xs text-slate-900 block">{t.label}</span>
                <span className="text-[10px] text-slate-400">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section: Notification Subscriptions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Notification Preferences
            </h3>
          </div>

          <div className="space-y-3 max-w-lg text-xs">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Critical Findings Alerts</span>
                <span className="text-slate-500 text-[11px]">Instant notifications when High/Critical exposures are found.</span>
              </div>
              <input
                type="checkbox"
                checked={critNotif}
                onChange={(e) => { setCritNotif(e.target.checked); handleSave(); }}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Compliance Threshold Drops</span>
                <span className="text-slate-500 text-[11px]">Alert when fleet compliance drops below 80% baseline.</span>
              </div>
              <input
                type="checkbox"
                checked={compNotif}
                onChange={(e) => { setCompNotif(e.target.checked); handleSave(); }}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Low Severity Findings</span>
                <span className="text-slate-500 text-[11px]">Best-practice advisory notices and minor cosmetic deviations.</span>
              </div>
              <input
                type="checkbox"
                checked={lowNotif}
                onChange={(e) => { setLowNotif(e.target.checked); handleSave(); }}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Report Generation Ready</span>
                <span className="text-slate-500 text-[11px]">Notify when monthly and quarterly audit dossiers are published.</span>
              </div>
              <input
                type="checkbox"
                checked={repNotif}
                onChange={(e) => { setRepNotif(e.target.checked); handleSave(); }}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Section: Security & Active Sessions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Active Security Sessions
            </h3>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between max-w-lg">
            <div>
              <span className="font-bold text-slate-900 block">Current Web Browser Session</span>
              <span className="text-[11px] text-slate-400 font-mono">192.168.1.102 • Windows Chrome • Active Now</span>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
