import React, { useState } from 'react';
import { User, Shield, Key, Bell, Check, Lock } from 'lucide-react';

export default function ViewerProfile({ showToast }) {
  const [name, setName] = useState('Abhishek Vishwakarma');
  const [email, setEmail] = useState('user@example.com');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      if (showToast) showToast('Profile details updated successfully!');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Account Management
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">
            My Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal preferences, contact details, and notification subscriptions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Role Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 text-2xl font-bold flex items-center justify-center mx-auto shadow-2xs">
            AV
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{name}</h2>
            <span className="text-xs text-slate-500">{email}</span>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Assigned Role:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Viewer / Consumer
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Department:</span>
              <span className="text-slate-800 font-semibold">Security Operations</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Last Login:</span>
              <span className="text-slate-600 font-mono text-[11px]">24 Sep 2026</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 text-left flex items-start space-x-2">
            <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>Role elevation (e.g. Viewer → Security Admin) requires Platform Administrator authorization.</span>
          </div>
        </div>

        {/* Right Column: Editable Profile Details */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Personal Information & Preferences
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile Preferences'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
