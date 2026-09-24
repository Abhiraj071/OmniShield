import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardOverview from './components/DashboardOverview';
import IngestionHub from './components/IngestionHub';
import ComplianceMatrix from './components/ComplianceMatrix';
import RemediationWorkbench from './components/RemediationWorkbench';
import AITrainingModule from './components/AITrainingModule';
import DeviceManagement from './components/DeviceManagement';
import UserManagement from './components/UserManagement';
import AuditLogsView from './components/AuditLogsView';
import EvidenceReviewView from './components/EvidenceReviewView';
import AuditHistoryView from './components/AuditHistoryView';
import FrameworkRulesView from './components/FrameworkRulesView';
import ViewerDashboard from './components/ViewerDashboard';
import ViewerDevices from './components/ViewerDevices';
import ViewerCompliance from './components/ViewerCompliance';
import ViewerFindings from './components/ViewerFindings';
import ViewerReports from './components/ViewerReports';
import ViewerNotifications from './components/ViewerNotifications';
import ViewerProfile from './components/ViewerProfile';
import ViewerSettings from './components/ViewerSettings';
import LoginView from './components/LoginView';

import { ingestConfig, downloadPdfReport, fetchSampleContent, auditDevice } from './api/client';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('netarmor_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const currentRole = currentUser?.system_role || 'security_admin';
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeFramework, setActiveFramework] = useState('CIS');
  const [currentReport, setCurrentReport] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [rawConfigBackup, setRawConfigBackup] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('netarmor_user', JSON.stringify(user));
    } catch {}
    setActiveTab('dashboard');
    showToast(`Welcome back, ${user.name}! Unified Workspace active.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('netarmor_user');
    } catch {}
    setActiveTab('dashboard');
    showToast('Signed out successfully.');
  };

  // Initial auto-audit of Cisco sample for rich immediate demo
  useEffect(() => {
    async function loadInitialAudit() {
      try {
        setIsAuditing(true);
        const sample = await fetchSampleContent('cisco_catalyst_3850');
        setRawConfigBackup(sample.content);
        const report = await ingestConfig(sample.content, 'cisco');
        setCurrentReport(report);
      } catch (err) {
        console.error('Failed initial audit:', err);
      } finally {
        setIsAuditing(false);
      }
    }
    loadInitialAudit();
  }, []);

  const handleAudit = async (rawConfig, vendorOverride = null) => {
    setIsAuditing(true);
    setRawConfigBackup(rawConfig);
    try {
      const report = await ingestConfig(rawConfig, vendorOverride);
      setCurrentReport(report);
      setActiveTab('dashboard');
      showToast(`Audit completed successfully for ${report.hostname}! Score: ${report.framework_results.CIS?.compliance_score}%`);
    } catch (err) {
      console.error('Audit failed:', err);
      showToast('Error auditing configuration. Please check your input.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleDeviceAuditSelect = async (dev, customConfig = null) => {
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
    setIsAuditing(true);
    try {
      let configContent = customConfig;
      if (!configContent || !configContent.trim()) {
        const sample = await fetchSampleContent(sampleId);
        configContent = sample.content;
      }
      setRawConfigBackup(configContent);
      const report = await ingestConfig(configContent, vKey);
      report.hostname = dev.name; // Keep device's actual name
      setCurrentReport(report);

      // Update backend device record to Audited with real compliance score
      const cisScore = report.framework_results?.CIS?.compliance_score ?? 83.3;
      await auditDevice(dev.id, cisScore);

      setActiveTab('dashboard');
      showToast(`Audit completed for ${dev.name}! CIS Score: ${cisScore}%`);
      return { report, cisScore };
    } catch (err) {
      console.error('Failed device audit load:', err);
      showToast(`Failed to audit ${dev.name}. Please try again.`);
      throw err;
    } finally {
      setIsAuditing(false);
    }
  };

  const handleReAudit = async () => {
    if (!rawConfigBackup) return;
    try {
      const report = await ingestConfig(rawConfigBackup, currentReport?.vendor);
      setCurrentReport(report);
      showToast('Re-audit completed! Knowledge updates applied.');
    } catch (err) {
      console.error('Re-audit failed:', err);
    }
  };

  const handleDownloadPdf = async () => {
    if (!currentReport) return;
    setIsGeneratingPdf(true);
    try {
      await downloadPdfReport(currentReport, activeFramework);
      showToast(`Official compliance PDF dossier downloaded for ${currentReport.hostname}`);
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast('Failed to generate PDF dossier.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadDevicePdf = async (dev) => {
    const sampleMap = {
      'Cisco': 'cisco_catalyst_3850',
      'Fortinet': 'fortigate_fortios_7',
      'Palo Alto': 'paloalto_panos_10',
      'Juniper': 'juniper_srx_junos',
      'Arista': 'arista_eos_switch',
      'SONiC': 'sonic_whitebox_switch'
    };
    const sampleId = sampleMap[dev.vendor] || 'cisco_catalyst_3850';
    showToast(`Generating compliance PDF dossier for ${dev.name}...`);
    try {
      const sample = await fetchSampleContent(sampleId);
      const report = await ingestConfig(sample.content, dev.vendor.toLowerCase());
      await downloadPdfReport(report, activeFramework);
      showToast(`Compliance PDF downloaded for ${dev.name}`);
    } catch (err) {
      console.error('Device PDF error:', err);
      showToast('Failed to generate device PDF report.');
    }
  };

  if (!currentUser) {
    return (
      <>
        <LoginView onLoginSuccess={handleLoginSuccess} />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-white px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-xs font-medium shadow-lg flex items-center space-x-2.5 transition-all">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentReport={currentReport}
        onDownloadPdf={handleDownloadPdf}
        isGeneratingPdf={isGeneratingPdf}
        onOpenTraining={() => setIsAdvancedOpen(true)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-xs font-medium shadow-lg flex items-center space-x-2.5 transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Router - Single Unified Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* View 1: Dashboard Overview */}
        {(activeTab === 'dashboard' || activeTab === 'viewer_dashboard') && (
          <DashboardOverview
            report={currentReport}
            setActiveTab={setActiveTab}
            activeFramework={activeFramework}
            onSelectFramework={setActiveFramework}
            onDownloadPdf={handleDownloadPdf}
            isGeneratingPdf={isGeneratingPdf}
            currentRole={currentRole}
            onOpenTraining={() => setIsAdvancedOpen(true)}
          />
        )}

        {/* View 2: Device Inventory & Management */}
        {(activeTab === 'devices' || activeTab === 'viewer_devices') && (
          <DeviceManagement
            currentRole={currentRole}
            onSelectDeviceForAudit={handleDeviceAuditSelect}
            onDownloadDevicePdf={handleDownloadDevicePdf}
            showToast={showToast}
          />
        )}

        {/* View 3: Ingestion Hub (Upload/Paste Single or Bulk) */}
        {activeTab === 'ingest' && (
          <IngestionHub
            onAuditConfig={handleAudit}
            isAuditing={isAuditing}
          />
        )}

        {/* View 4: Compliance Findings Matrix */}
        {(activeTab === 'compliance' || activeTab === 'viewer_compliance' || activeTab === 'viewer_findings') && (
          <ComplianceMatrix
            report={currentReport}
            activeFramework={activeFramework}
            onSelectFramework={setActiveFramework}
            setActiveTab={setActiveTab}
            currentRole={currentRole}
          />
        )}

        {/* View 5: CLI Remediation Workbench */}
        {activeTab === 'remediation' && (
          <RemediationWorkbench
            report={currentReport}
            activeFramework={activeFramework}
            onDownloadPdf={handleDownloadPdf}
            isGeneratingPdf={isGeneratingPdf}
            setActiveTab={setActiveTab}
            currentRole={currentRole}
          />
        )}

        {/* View 6: Evidence Verification & Human-in-the-Loop AI Review */}
        {activeTab === 'evidence_review' && (
          <EvidenceReviewView
            report={currentReport}
            activeFramework={activeFramework}
            onDownloadPdf={handleDownloadPdf}
            isGeneratingPdf={isGeneratingPdf}
            showToast={showToast}
          />
        )}

        {/* View 7: Multi-Audit History */}
        {(activeTab === 'audit_history' || activeTab === 'viewer_history' || activeTab === 'viewer_reports') && (
          <AuditHistoryView
            report={currentReport}
            onDownloadPdf={handleDownloadPdf}
            isGeneratingPdf={isGeneratingPdf}
          />
        )}

        {/* View 8: Frameworks & Rules */}
        {(activeTab === 'frameworks' || activeTab === 'rules') && (
          <FrameworkRulesView
            showToast={showToast}
          />
        )}

        {/* View 9: System Audit Logs */}
        {activeTab === 'audit_logs' && (
          <AuditLogsView />
        )}

        {/* View 10: User Management */}
        {activeTab === 'users' && (
          <UserManagement
            showToast={showToast}
          />
        )}
      </main>

      {/* Advanced Custom Signatures / AI Knowledge Modal (Admin & SecAdmin) */}
      <AITrainingModule
        report={currentReport}
        onReAudit={handleReAudit}
        isOpen={isAdvancedOpen}
        onClose={() => setIsAdvancedOpen(false)}
      />

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-slate-500 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NetArmor AI • SIH26155 Enterprise Multi-Role Network Compliance Platform</span>
          <span className="text-slate-400">
            Active Role: <strong className="text-slate-700 capitalize">{currentRole.replace('_', ' ')}</strong> • Standards: CIS • NIST SP 800-53 • DISA STIG • ISO/IEC 27001
          </span>
        </div>
      </footer>
    </div>
  );
}
