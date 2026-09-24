import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginUser = async (username, password) => {
  const res = await api.post('/auth/login', { username, password });
  return res.data;
};

export const fetchSamples = async () => {
  const res = await api.get('/samples');
  return res.data;
};

export const fetchSampleContent = async (sampleId) => {
  const res = await api.get(`/samples/${sampleId}`);
  return res.data;
};

export const ingestConfig = async (rawConfig, vendorOverride = null) => {
  const res = await api.post('/ingest', {
    raw_config: rawConfig,
    vendor_override: vendorOverride,
  });
  return res.data;
};

export const uploadConfigFile = async (file, vendorOverride = null) => {
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
};

export const fetchHeuristics = async (vendor = null) => {
  const params = vendor ? { vendor } : {};
  const res = await api.get('/heuristics', { params });
  return res.data;
};

export const createHeuristic = async (payload) => {
  const res = await api.post('/heuristics', payload);
  return res.data;
};

export const deleteHeuristic = async (heuristicId) => {
  const res = await api.delete(`/heuristics/${heuristicId}`);
  return res.data;
};

export const fetchTrainingSuggestions = async (lines) => {
  const res = await api.post('/training/suggest', lines);
  return res.data;
};

export const downloadPdfReport = async (report, framework = 'CIS') => {
  const res = await api.post(
    `/reports/pdf?framework=${framework}`,
    report,
    { responseType: 'blob' }
  );
  
  // Trigger browser download
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
};

export const fetchDevices = async () => {
  const res = await api.get('/devices');
  return res.data;
};

export const createDevice = async (deviceData) => {
  const res = await api.post('/devices', deviceData);
  return res.data;
};

export const deleteDevice = async (deviceId) => {
  const res = await api.delete(`/devices/${deviceId}`);
  return res.data;
};

export const auditDevice = async (deviceId, score = null) => {
  const payload = score !== null ? { score } : {};
  const res = await api.post(`/devices/${deviceId}/audit`, payload);
  return res.data;
};

export const fetchUsers = async () => {
  const res = await api.get('/admin/users');
  return res.data;
};

export const createUser = async (userData) => {
  const res = await api.post('/admin/users', userData);
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await api.delete(`/admin/users/${userId}`);
  return res.data;
};

export const fetchAuditLogs = async () => {
  const res = await api.get('/admin/audit-logs');
  return res.data;
};

export const fetchAuditHistory = async () => {
  const res = await api.get('/audits/history');
  return res.data;
};

export const fetchVerifications = async () => {
  const res = await api.get('/audits/verifications');
  return res.data;
};

export const verifyFinding = async (payload) => {
  const res = await api.post('/audits/verify-finding', payload);
  return res.data;
};

export const fetchAIReviews = async () => {
  const res = await api.get('/audits/ai-reviews');
  return res.data;
};

export const submitAIReview = async (reviewId, payload) => {
  const res = await api.post(`/audits/ai-review/${reviewId}`, payload);
  return res.data;
};

export const fetchViewerOverview = async () => {
  const res = await api.get('/viewer/overview');
  return res.data;
};

export const fetchViewerReports = async () => {
  const res = await api.get('/viewer/reports');
  return res.data;
};

export const fetchViewerNotifications = async () => {
  const res = await api.get('/viewer/notifications');
  return res.data;
};

export default api;


