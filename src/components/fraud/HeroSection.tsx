import React, { useState, useEffect } from 'react';

interface HeroSectionProps {
  totalTransactions: number;
  fraudPrevented: number;
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  totalTransactions,
  fraudPrevented,
  onGetStarted,
}) => {
  const [animatedTxns, setAnimatedTxns] = useState(totalTransactions);
  const [animatedFraud, setAnimatedFraud] = useState(fraudPrevented);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedTxns(prev => prev + Math.floor(Math.random() * 5) + 1);
      setAnimatedFraud(prev => prev + (Math.random() < 0.15 ? 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-16 lg:py-24">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Animated nodes */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-indigo-500/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
        
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0" />
              <stop offset="50%" stopColor="#6366F1" stopOpacity="1" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[...Array(8)].map((_, i) => (
            <line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </svg>

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-indigo-300 text-sm font-medium">Blockchain-Enhanced XAI Platform</span>
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              Real-Time{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Fraud Detection
              </span>{' '}
              for India
            </h1>

            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Protect your transactions with our cutting-edge Explainable AI system. 
              Every decision is transparent, every transaction is recorded on blockchain, 
              and fraud is detected in milliseconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"
              >
                Get Started
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-slate-400 text-sm">RBI Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-slate-400 text-sm">ISO 27001</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <span className="text-slate-400 text-sm">Blockchain Verified</span>
              </div>
            </div>
          </div>

          {/* Right - Stats & Visualization */}
          <div className="relative">
            {/* Main Stats Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
              <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Real-Time Protection</h3>
                <p className="text-slate-400">Advanced XAI-powered fraud detection with blockchain verification</p>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -right-4 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-3 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-400 text-sm font-medium">Approved</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 rounded-xl p-3 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-400" viewBox="0 0 35 33" fill="currentColor">
                  <path d="M32.9582 1L19.8241 10.7183L22.2665 4.99099L32.9582 1Z"/>
                  <path d="M2.66296 1L15.6886 10.809L13.3541 4.99098L2.66296 1Z"/>
                </svg>
                <span className="text-orange-400 text-sm font-medium">On-Chain</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
