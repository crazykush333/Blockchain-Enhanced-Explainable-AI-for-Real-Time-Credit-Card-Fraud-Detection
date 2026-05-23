import React, { useState, useEffect } from 'react';
import { MachineStatus as MachineStatusType } from '@/types/fraud';

interface MachineStatusProps {
  machine: MachineStatusType;
  isProcessing?: boolean;
}

const MachineStatus: React.FC<MachineStatusProps> = ({ machine, isProcessing = false }) => {
  const [animatedLoad, setAnimatedLoad] = useState(machine.currentLoad);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedLoad(prev => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(10, Math.min(95, prev + change));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getMachineIcon = (id: MachineStatusType['id']) => {
    switch (id) {
      case 'payment':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'fraud-detection':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'gateway':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
    }
  };

  const getMachineColor = (id: MachineStatusType['id']) => {
    switch (id) {
      case 'payment':
        return {
          gradient: 'from-cyan-500 to-blue-500',
          bg: 'bg-cyan-500/20',
          text: 'text-cyan-400',
          border: 'border-cyan-500/30',
          glow: 'shadow-cyan-500/20',
        };
      case 'fraud-detection':
        return {
          gradient: 'from-purple-500 to-pink-500',
          bg: 'bg-purple-500/20',
          text: 'text-purple-400',
          border: 'border-purple-500/30',
          glow: 'shadow-purple-500/20',
        };
      case 'gateway':
        return {
          gradient: 'from-emerald-500 to-teal-500',
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          glow: 'shadow-emerald-500/20',
        };
    }
  };

  const getStatusIndicator = (status: MachineStatusType['status']) => {
    switch (status) {
      case 'online':
        return { color: 'bg-emerald-400', label: 'Online', animate: false };
      case 'processing':
        return { color: 'bg-amber-400', label: 'Processing', animate: true };
      case 'offline':
        return { color: 'bg-slate-400', label: 'Offline', animate: false };
      case 'error':
        return { color: 'bg-red-400', label: 'Error', animate: true };
    }
  };

  const colors = getMachineColor(machine.id);
  const statusIndicator = getStatusIndicator(isProcessing ? 'processing' : machine.status);

  return (
    <div className={`relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border ${colors.border} p-6 overflow-hidden group hover:shadow-xl ${colors.glow} transition-all duration-300`}>
      {/* Animated background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
      
      {/* Processing animation */}
      {isProcessing && (
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-20 animate-pulse`} />
          <div className="absolute top-0 left-0 w-full h-1">
            <div className={`h-full bg-gradient-to-r ${colors.gradient} animate-[loading_1s_ease-in-out_infinite]`} />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative flex items-start justify-between mb-6">
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <div className={colors.text}>{getMachineIcon(machine.id)}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusIndicator.color} ${statusIndicator.animate ? 'animate-pulse' : ''}`} />
          <span className="text-slate-400 text-sm">{statusIndicator.label}</span>
        </div>
      </div>

      {/* Machine Name */}
      <h3 className="text-white font-bold text-xl mb-1">{machine.name}</h3>
      <p className="text-slate-400 text-sm mb-6">
        {machine.id === 'payment' && 'Validates transaction amount & account'}
        {machine.id === 'fraud-detection' && 'XAI model with LIME/SHAP analysis'}
        {machine.id === 'gateway' && 'Blockchain recording & final approval'}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-900/50 rounded-xl p-3">
          <p className="text-slate-400 text-xs mb-1">Processed Today</p>
          <p className={`text-xl font-bold ${colors.text}`}>
            {machine.processedToday.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-3">
          <p className="text-slate-400 text-xs mb-1">Avg. Time</p>
          <p className="text-xl font-bold text-white">
            {machine.avgProcessingTime}ms
          </p>
        </div>
      </div>

      {/* Success Rate */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm">Success Rate</span>
          <span className="text-white font-semibold">{machine.successRate.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-500`}
            style={{ width: `${machine.successRate}%` }}
          />
        </div>
      </div>

      {/* Current Load */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm">Current Load</span>
          <span className={`font-semibold ${
            animatedLoad > 80 ? 'text-red-400' :
            animatedLoad > 60 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {animatedLoad.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              animatedLoad > 80 ? 'bg-red-500' :
              animatedLoad > 60 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${animatedLoad}%` }}
          />
        </div>
      </div>

      {/* Connection Lines (visual) */}
      <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
        <div className={`w-8 h-0.5 bg-gradient-to-r ${colors.gradient} ${isProcessing ? 'animate-pulse' : ''}`} />
      </div>
    </div>
  );
};

export default MachineStatus;
