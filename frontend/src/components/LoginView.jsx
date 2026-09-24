import React, { useState } from 'react';
import { Shield, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { loginUser } from '../api/client';

export default function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState('rahul_secadmin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { title: 'Security Admin', name: 'Rahul S.', username: 'rahul_secadmin' },
    { title: 'Platform Admin', name: 'Vikram M.', username: 'vikram_admin' },
    { title: 'Auditor', name: 'Priya P.', username: 'priya_auditor' },
    { title: 'Viewer', name: 'Abhishek V.', username: 'abhishek_viewer' },
  ];

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await loginUser(username.trim(), password.trim());
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError('Login failed. Please verify credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demo) => {
    setUsername(demo.username);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex items-center justify-center p-3 font-sans">
      <div className="w-full max-w-sm bg-white p-5 sm:p-6 shadow-sm border border-slate-200 rounded-2xl">
        
        {/* Compact Header */}
        <div className="flex items-center space-x-2.5 mb-3.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">NetArmor AI</h1>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Sign in with authorized credentials</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-2.5 p-2 rounded-lg bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Username or Email
            </label>
            <div className="relative rounded-lg shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <User className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. rahul_secadmin"
                className="block w-full pl-8 pr-3 py-1.5 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative rounded-lg shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="block w-full pl-8 pr-8 py-1.5 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span>Verifying...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Autofill Demo Accounts */}
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mb-1.5">
            <span>Autofill demo user:</span>
            <span className="font-mono text-slate-500">pwd: password123</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {demoAccounts.map((acc) => {
              const isSelected = username === acc.username;
              return (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  className={`text-left p-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-300 bg-blue-50/60 ring-1 ring-blue-400/30'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-800 truncate">{acc.title}</span>
                    {isSelected && <CheckCircle2 className="w-2.5 h-2.5 text-blue-600 shrink-0 ml-1" />}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">{acc.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-2.5 text-[9px] text-slate-400">
          Protected by Role-Based Access Control (RBAC)
        </div>

      </div>
    </div>
  );
}
