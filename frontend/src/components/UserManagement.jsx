import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Trash2, Shield, Check, X, 
  Key, UserCheck, AlertCircle, Search, Info
} from 'lucide-react';
import { fetchUsers, createUser, deleteUser } from '../api/client';

export default function UserManagement({ showToast }) {
  const [users, setUsers] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Security Admin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) return;
    setIsSubmitting(true);
    try {
      await createUser({
        username,
        name,
        email,
        role,
        status: 'Active',
      });
      setIsAddModalOpen(false);
      setUsername('');
      setName('');
      setEmail('');
      loadUsers();
      if (showToast) showToast(`User ${name} created with role '${role}'`);
    } catch (err) {
      console.error('Failed to add user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id, userName) => {
    try {
      await deleteUser(id);
      loadUsers();
      if (showToast) showToast(`User ${userName} removed.`);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const roleBadgeColor = {
    'Admin': 'bg-purple-50 text-purple-700 border-purple-200',
    'Security Admin': 'bg-blue-50 text-blue-700 border-blue-200',
    'Auditor': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Viewer': 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
            <span>Administration</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-900 font-bold">User & Role Management</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure enterprise accounts, assign RBAC privileges, and control platform access permissions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Enterprise Accounts Directory ({users.length} Users)
          </span>
          <span className="text-xs text-slate-400">SIH26155 RBAC Model</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">User</th>
              <th className="p-3.5">Assigned Role</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Role Permissions Scope</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3.5">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {u.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{u.name}</span>
                      <span className="text-[11px] text-slate-400">{u.email}</span>
                    </div>
                  </div>
                </td>

                <td className="p-3.5">
                  <span className={`inline-block font-semibold px-2.5 py-0.5 rounded-full border text-[11px] ${
                    roleBadgeColor[u.role] || 'bg-slate-100 text-slate-700'
                  }`}>
                    {u.role}
                  </span>
                </td>

                <td className="p-3.5">
                  <span className="inline-flex items-center space-x-1 text-emerald-700 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{u.status}</span>
                  </span>
                </td>

                <td className="p-3.5 text-slate-600 text-[11px] max-w-xs truncate" title={u.permissions}>
                  {u.permissions}
                </td>

                <td className="p-3.5 text-right">
                  <button
                    onClick={() => handleDeleteUser(u.id, u.name)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete User"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Matrix Reference Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-800">
          <Key className="w-4 h-4 text-blue-600" />
          <span>Role Permission Matrix Reference</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 text-[11px]">
              <tr>
                <th className="p-3">Platform Capability</th>
                <th className="p-3 text-center">👑 Admin</th>
                <th className="p-3 text-center">🛡️ Security Admin</th>
                <th className="p-3 text-center">🔍 Auditor</th>
                <th className="p-3 text-center">👁️ Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-2.5 font-medium">Executive & Operational Dashboard</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">User & Role Management</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Full</td>
                <td className="p-2.5 text-center text-slate-300">✗</td>
                <td className="p-2.5 text-center text-slate-300">✗</td>
                <td className="p-2.5 text-center text-slate-300">✗</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Hardware Inventory (Add/Edit Devices)</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-2.5 text-center text-slate-300">✗</td>
                <td className="p-2.5 text-center text-slate-300">✗</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Configuration Ingestion & Live Scans</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Primary</td>
                <td className="p-2.5 text-center text-slate-500 font-medium">✓ (Sample)</td>
                <td className="p-2.5 text-center text-slate-300">✗</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Evidence Verification ⭐</td>
                <td className="p-2.5 text-center text-slate-300">✗</td>
                <td className="p-2.5 text-center text-slate-300">✗</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Primary</td>
                <td className="p-2.5 text-center text-slate-300">✗</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Remediation Scripting & Re-scan</td>
                <td className="p-2.5 text-center text-slate-500">Read-Only</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Primary</td>
                <td className="p-2.5 text-center text-slate-500">Read-Only</td>
                <td className="p-2.5 text-center text-slate-300">✗</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Human-in-the-Loop AI Review</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Approve</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Review</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Review</td>
                <td className="p-2.5 text-center text-slate-300">✗</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Compliance Report Generation</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓</td>
                <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Download</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Create New User Account</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rahul_secadmin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. rahul@netarmor.internal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Assigned RBAC Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Security Admin">🛡️ Security Admin (Network Operations)</option>
                  <option value="Auditor">🔍 Security Auditor (Compliance & Verification)</option>
                  <option value="Admin">👑 Platform Admin (Full Control)</option>
                  <option value="Viewer">👁️ Viewer (Read-Only Executive)</option>
                </select>
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
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
