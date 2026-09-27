import axios from 'axios';
import { 
  fallbackReport, 
  fallbackSamples, 
  fallbackSampleMap, 
  fallbackUsers, 
  fallbackDevices, 
  fallbackAuditLogs 
} from './demoData';

const API_BASE = import.meta.env.VITE_API_URL || '';
const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

export const loginUser = async (username, password) => {
  try {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using static fallback authentication:', err.message);
    const user = fallbackUsers.find(u => u.username === username);
    if (user && password === 'password123') {
      return { success: true, user };
    }
    throw new Error('Invalid credentials or offline demo mode');
  }
};

export const fetchSamples = async () => {
  try {
    const res = await api.get('/samples');
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using fallback samples list');
    return fallbackSamples;
  }
};

export const fetchSampleContent = async (sampleId) => {
  try {
    const res = await api.get(`/samples/${sampleId}`);
    return res.data;
  } catch (err) {
    console.warn(`Backend unavailable, using fallback sample content for ${sampleId}`);
    return fallbackSampleMap[sampleId] || { sample_id: sampleId, content: `# Configuration for ${sampleId}` };
  }
};

export const ingestConfig = async (rawConfig, vendorOverride = null) => {
  try {
    const res = await api.post('/ingest', {
      raw_config: rawConfig,
      vendor_override: vendorOverride,
    });
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using simulated audit fallback report');
    // Return a clone of fallback report with custom vendor if specified
    const simulated = JSON.parse(JSON.stringify(fallbackReport));
    if (vendorOverride) {
      simulated.vendor = vendorOverride.toUpperCase();
    }
    return simulated;
  }
};

export const uploadConfigFile = async (file, vendorOverride = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (vendorOverride) {
      formData.append('vendor_override', vendorOverride);
    }
    const res = await api.post('/upload-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, returning fallback report for uploaded file');
    const simulated = JSON.parse(JSON.stringify(fallbackReport));
    simulated.hostname = file.name.replace(/\.[^/.]+$/, "").toUpperCase();
    return simulated;
  }
};

export const fetchHeuristics = async (vendor = null) => {
  try {
    const params = vendor ? { vendor } : {};
    const res = await api.get('/heuristics', { params });
    return res.data;
  } catch (err) {
    return [];
  }
};

export const createHeuristic = async (payload) => {
  try {
    const res = await api.post('/heuristics', payload);
    return res.data;
  } catch (err) {
    return { id: Date.now(), ...payload };
  }
};

export const deleteHeuristic = async (heuristicId) => {
  try {
    const res = await api.delete(`/heuristics/${heuristicId}`);
    return res.data;
  } catch (err) {
    return { success: true };
  }
};

export const fetchTrainingSuggestions = async (lines) => {
  try {
    const res = await api.post('/training/suggest', lines);
    return res.data;
  } catch (err) {
    return [
      { raw_line: lines[0] || 'service crypto-engine scrypt', predicted_parameter: 'password_encryption', confidence: 0.94 }
    ];
  }
};

export const downloadPdfReport = async (report, framework = 'CIS') => {
  try {
    const res = await api.post(
      `/reports/pdf?framework=${framework}`,
      report,
      { responseType: 'blob' }
    );
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    const safeHost = (report.hostname || 'Device').replace(/\s+/g, '_');
    link.setAttribute('download', `NetArmor_Audit_${safeHost}_${framework}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    alert('Live PDF generation requires the local/cloud FastAPI backend.');
  }
};

export const fetchDevices = async () => {
  try {
    const res = await api.get('/devices');
    return res.data;
  } catch (err) {
    return fallbackDevices;
  }
};

export const createDevice = async (deviceData) => {
  try {
    const res = await api.post('/devices', deviceData);
    return res.data;
  } catch (err) {
    return { id: Date.now(), ...deviceData, status: 'Ingested', compliance_score: 0.0 };
  }
};

export const deleteDevice = async (deviceId) => {
  try {
    const res = await api.delete(`/devices/${deviceId}`);
    return res.data;
  } catch (err) {
    return { success: true };
  }
};

export const auditDevice = async (deviceId, score = null) => {
  try {
    const payload = score !== null ? { score } : {};
    const res = await api.post(`/devices/${deviceId}/audit`, payload);
    return res.data;
  } catch (err) {
    return { success: true };
  }
};

export const fetchUsers = async () => {
  try {
    const res = await api.get('/admin/users');
    return res.data;
  } catch (err) {
    return fallbackUsers;
  }
};

export const createUser = async (userData) => {
  try {
    const res = await api.post('/admin/users', userData);
    return res.data;
  } catch (err) {
    return { id: Date.now(), ...userData };
  }
};

export const deleteUser = async (userId) => {
  try {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  } catch (err) {
    return { success: true };
  }
};

export const fetchAuditLogs = async () => {
  try {
    const res = await api.get('/admin/audit-logs');
    return res.data;
  } catch (err) {
    return fallbackAuditLogs;
  }
};

export const fetchAuditHistory = async () => {
  try {
    const res = await api.get('/audits/history');
    return res.data;
  } catch (err) {
    return [];
  }
};

export const fetchVerifications = async () => {
  try {
    const res = await api.get('/audits/verifications');
    return res.data;
  } catch (err) {
    return [];
  }
};

export const verifyFinding = async (payload) => {
  try {
    const res = await api.post('/audits/verify-finding', payload);
    return res.data;
  } catch (err) {
    return { success: true };
  }
};

export const fetchAIReviews = async () => {
  try {
    const res = await api.get('/audits/ai-reviews');
    return res.data;
  } catch (err) {
    return [];
  }
};

export const submitAIReview = async (reviewId, payload) => {
  try {
    const res = await api.post(`/audits/ai-review/${reviewId}`, payload);
    return res.data;
  } catch (err) {
    return { success: true };
  }
};

export const fetchViewerOverview = async () => {
  try {
    const res = await api.get('/viewer/overview');
    return res.data;
  } catch (err) {
    return {
      total_devices: fallbackDevices.length,
      audited_devices: fallbackDevices.filter(d => d.status === 'Audited').length,
      avg_compliance: 87.1,
      critical_risks: 3
    };
  }
};

export const fetchViewerReports = async () => {
  try {
    const res = await api.get('/viewer/reports');
    return res.data;
  } catch (err) {
    return [];
  }
};

export const fetchViewerNotifications = async () => {
  try {
    const res = await api.get('/viewer/notifications');
    return res.data;
  } catch (err) {
    return [];
  }
};

export default api;
