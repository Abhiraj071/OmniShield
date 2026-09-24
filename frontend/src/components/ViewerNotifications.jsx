import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle2, Info, Flame, Check } from 'lucide-react';
import { fetchViewerNotifications } from '../api/client';

export default function ViewerNotifications({ onUpdateUnreadCount }) {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchViewerNotifications();
        setNotifications(data);
      } catch (e) {
        console.error('Failed to load notifications:', e);
      }
    }
    load();
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (onUpdateUnreadCount) onUpdateUnreadCount(0);
  };

  const filtered = notifications.filter(n => {
    if (filter !== 'ALL' && n.category.toLowerCase() !== filter.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Audit Alerts & Events
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">
            Notification Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time notifications regarding critical findings, compliance thresholds, and remediation verifications.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-2 text-xs overflow-x-auto">
        <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wide px-2">Category:</span>
        {['ALL', 'Critical', 'Compliance', 'Findings', 'System'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filter === cat
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((n) => {
          const isCritical = n.type === 'critical';
          const isWarning = n.type === 'warning';
          const isSuccess = n.type === 'success';

          return (
            <div 
              key={n.id}
              className={`p-4 bg-white rounded-2xl border shadow-xs transition-all flex items-start space-x-3.5 ${
                !n.read ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'
              }`}
            >
              <div className="mt-0.5">
                {isCritical && <Flame className="w-5 h-5 text-rose-600" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {!isCritical && !isWarning && !isSuccess && <Info className="w-5 h-5 text-blue-600" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                    <span>{n.title}</span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                    )}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {n.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
