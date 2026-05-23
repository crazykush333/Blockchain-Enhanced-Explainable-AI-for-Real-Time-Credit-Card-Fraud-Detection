import React, { useEffect, useState } from 'react';
import { User } from '@/types/fraud';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const demoCreds = {
    admin: { email: 'admin@fraudguard.in', password: 'admin123' },
    customer: { email: 'customer@fraudguard.in', password: 'customer123' },
  } as const;

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'admin' | 'customer'>('admin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(demoCreds.admin.email);
  const [password, setPassword] = useState(demoCreds.admin.password);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync demo creds when role or mode changes (signup starts blank for customer)
  useEffect(() => {
    if (authMode === 'signup') {
      setRole('customer');
      setEmail('');
      setPassword('');
      setName('');
    } else {
      setEmail(demoCreds[role].email);
      setPassword(demoCreds[role].password);
    }
    setError('');
  }, [role, authMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!email || !password || (authMode === 'signup' && !name)) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (authMode === 'signup') {
      // Customer signup
      const user: User = {
        id: `USER${Date.now()}`,
        email,
        name,
        role: 'customer',
        createdAt: new Date(),
        lastLogin: new Date(),
        isNewCustomer: true,
      };
      onLogin(user);
      onClose();
    } else {
      // Login flow with demo creds
      if (role === 'admin' && email === demoCreds.admin.email && password === demoCreds.admin.password) {
        const user: User = {
          id: `USER${Date.now()}`,
          email,
          name: 'Admin User',
          role: 'admin',
          createdAt: new Date(),
          lastLogin: new Date(),
        };
        onLogin(user);
        onClose();
      } else if (role === 'customer' && email === demoCreds.customer.email && password === demoCreds.customer.password) {
        const user: User = {
          id: `USER${Date.now()}`,
          email,
          name: 'Customer User',
          role: 'customer',
          createdAt: new Date(),
          lastLogin: new Date(),
        };
        onLogin(user);
        onClose();
      } else {
        setError(`Invalid credentials. Demo (${role}): ${demoCreds[role].email} / ${demoCreds[role].password}`);
      }
    }
    
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-slate-700/50 px-6 py-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">FraudGuard India</h1>
                <p className="text-slate-400 text-sm">Real-time Fraud Detection</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                    authMode === 'login'
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-100'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-slate-500/50'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                    authMode === 'signup'
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-100'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-slate-500/50'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Role Selector (login only) */}
              {authMode === 'login' && (
                <div className="grid grid-cols-2 gap-2">
                  {(['admin', 'customer'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        role === r
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-100'
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-slate-500/50'
                      }`}
                    >
                      {r === 'admin' ? 'Admin' : 'Customer'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Name Input (signup) */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                />
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fraudguard.in"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
                <p className="text-red-300 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            {/* Demo Credentials (login only) */}
            {authMode === 'login' && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                <p className="text-indigo-300 text-xs font-medium mb-2">📧 Demo Credentials ({role === 'admin' ? 'Admin' : 'Customer'}):</p>
                <div className="space-y-1 text-xs text-indigo-200">
                  <p><span className="font-mono">Email:</span> {demoCreds[role].email}</p>
                  <p><span className="font-mono">Password:</span> {demoCreds[role].password}</p>
                </div>
                <p className="text-indigo-200 text-[11px] mt-2">Customer portal includes cards, expenditure tracking, real-time transactions, appeals, and XAI explanations.</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {authMode === 'signup' ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {authMode === 'signup' ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700/50 text-center text-xs text-slate-400">
            🛡️ Enterprise-Grade Fraud Detection | Powered by XAI + Blockchain
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
