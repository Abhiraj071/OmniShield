import React from 'react';
import { 
  Shield, LayoutDashboard, Server, CheckSquare, AlertTriangle, 
  FileText, Clock, Bell, User, Settings, LogOut, ChevronRight
} from 'lucide-react';

export default function ViewerSidebar({ 
  activeTab, 
  setActiveTab, 
  unreadNotificationsCount = 3,
  currentRole,
  setRole
}) {
  const mainNav = [
    { id: 'viewer_dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'viewer_devices', label: 'Devices', icon: Server, badge: '128' },
    { id: 'viewer_compliance', label: 'Compliance', icon: CheckSquare },
    { id: 'viewer_findings', label: 'Findings', icon: AlertTriangle, badge: '42' },
  ];

  const reportingNav = [
    { id: 'viewer_reports', label: 'Reports', icon: FileText, badge: 'PDF' },
    { id: 'viewer_history', label: 'Audit History', icon: Clock },
  ];

  const systemNav = [
    { id: 'viewer_notifications', label: 'Notifications', icon: Bell, badgeCount: unreadNotificationsCount },
    { id: 'viewer_profile', label: 'My Profile', icon: User },
    { id: 'viewer_settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 shadow-2xs">
      {/* Scrollable Nav Content */}
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Brand Badge */}
        <div className="flex items-center space-x-2.5 px-2 py-1 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs text-slate-900 block leading-tight">ScanSecure</span>
            <span className="text-[10px] text-slate-500 font-medium">Compliance Portal</span>
          </div>
        </div>

        {/* Section: MAIN */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Main
          </span>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section: REPORTING */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Reporting
          </span>
          {reportingNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section: SYSTEM */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            System
          </span>
          {systemNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono animate-pulse">
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Footer Profile & Role Switcher */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs mb-2">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
              AV
            </div>
            <div className="truncate">
              <span className="font-bold text-xs text-slate-900 block truncate">Abhishek</span>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 inline-block">
                Viewer / Consumer
              </span>
            </div>
          </div>
        </div>

        {/* Quick Role Switcher */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>Switch Role:</span>
          <button
            onClick={() => setRole('security_admin')}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Go to Admin →
          </button>
        </div>
      </div>
    </aside>
  );
}
