import React from 'react';
import { 
  Shield, FileText, Layers, Server, Clock, 
  Download, LogOut, ChevronRight
} from 'lucide-react';

export default function Navbar({ 
  currentUser,
  onLogout,
  activeTab, 
  setActiveTab, 
  currentReport,
  onDownloadPdf,
  isGeneratingPdf
}) {
  // Clean, uncluttered primary navigation (Only 4 core tabs)
  const primaryTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'devices', label: 'Devices', icon: Server },
    { id: 'compliance', label: 'Findings', icon: Shield, badge: currentReport?.framework_results?.CIS?.failed_count },
    { id: 'audit_history', label: 'History', icon: Clock },
  ];

  const secondaryViewLabels = {
    ingest: 'Config Ingestion Hub',
    remediation: 'Remediation Workbench',
    evidence_review: 'Evidence Verification',
    rules: 'Rules & Governance',
    frameworks: 'Rules & Governance',
    audit_logs: 'System Logs',
    users: 'User Management',
  };

  const isSecondaryActive = secondaryViewLabels[activeTab];

  // Helper for user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Left: Brand Logo & Optional Breadcrumb */}
          <div className="flex items-center space-x-3">
            <div 
              className="flex items-center space-x-2.5 cursor-pointer shrink-0"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900">NetArmor</span>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  AI
                </span>
              </div>
            </div>

            {/* Breadcrumb if inside a deep module */}
            {isSecondaryActive && (
              <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 pl-2 border-l border-slate-200">
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 text-[11px]">
                  {isSecondaryActive}
                </span>
              </div>
            )}
          </div>

          {/* Center: Breathable, Clean Primary Tabs */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Section: Export PDF, Authenticated User & Sign Out */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* Quick Export PDF Button */}
            {currentReport && onDownloadPdf && (
              <button
                onClick={onDownloadPdf}
                disabled={isGeneratingPdf}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                title="Download official compliance PDF dossier"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isGeneratingPdf ? 'Exporting...' : 'Export PDF'}</span>
              </button>
            )}

            {/* User Identity Info */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1">
              <div className="w-6 h-6 rounded-md bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                {getInitials(currentUser?.name)}
              </div>
              <div className="text-left leading-none hidden xl:block">
                <div className="text-xs font-semibold text-slate-800">
                  {currentUser?.name || 'Operator'}
                </div>
                <div className="text-[10px] text-blue-600 font-medium mt-0.5">
                  Unified Workspace
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Sign Out"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile/Tablet Nav Tabs (Horizontal scroll) */}
      <div className="md:hidden flex items-center space-x-1 border-t border-slate-200 bg-slate-50/80 px-2 py-1.5 overflow-x-auto">
        {primaryTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium transition-colors cursor-pointer ${
                isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
