import React, { useState } from 'react';
import { User } from '@/types/fraud';
import MetaMaskConnect from './MetaMaskConnect';

interface HeaderProps {
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  walletAddress?: string;
  walletBalance?: string;
  onWalletConnect?: (address: string, balance: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  onLoginClick,
  onLogout,
  walletAddress,
  walletBalance,
  onWalletConnect,
}) => {
  const [showWalletWarning, setShowWalletWarning] = useState(false);

  const handleLoginClick = () => {
    if (!walletAddress) {
      setShowWalletWarning(true);
      setTimeout(() => setShowWalletWarning(false), 3000);
      return;
    }
    onLoginClick();
  };
  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">FraudGuard</h1>
              <p className="text-slate-400 text-xs -mt-0.5">India XAI Platform</p>
            </div>
          </div>

          {/* Center - Live Status */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">Live Monitoring</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-slate-400">Processing</span>
                <span className="text-white font-semibold">~350ms</span>
              </div>
              <div className="w-px h-4 bg-slate-700" />
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-slate-400">Accuracy</span>
                <span className="text-white font-semibold">97.2%</span>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* MetaMask Wallet */}
            <MetaMaskConnect 
              compact 
              onConnect={onWalletConnect}
            />

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-white text-sm font-medium">{user.name}</p>
                  <p className={`text-xs ${user.role === 'admin' ? 'text-purple-400' : 'text-cyan-400'}`}>
                    {user.role === 'admin' ? 'Administrator' : 'Customer'}
                  </p>
                </div>
                <div className="relative group">
                  <button className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                    user.role === 'admin'
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-gradient-to-br from-cyan-500 to-blue-500'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700/50 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="p-3 border-b border-slate-700/50">
                      <p className="text-white font-medium text-sm">{user.name}</p>
                      <p className="text-slate-400 text-xs">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={onLogout}
                        className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={handleLoginClick}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all text-sm"
                >
                  Sign In
                </button>
                
                {/* Wallet Warning Tooltip */}
                {showWalletWarning && !walletAddress && (
                  <div className="absolute top-full mt-2 right-0 bg-yellow-500/10 border border-yellow-500/50 rounded-lg px-3 py-2 text-sm text-yellow-400 whitespace-nowrap animate-pulse">
                    🔒 Connect wallet first to sign in
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
