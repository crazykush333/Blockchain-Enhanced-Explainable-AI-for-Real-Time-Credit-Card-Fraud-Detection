import React, { useState, useEffect } from 'react';
import { MachineStatus as MachineStatusType, Transaction } from '@/types/fraud';
import MachineStatus from './MachineStatus';

interface ThreeMachineArchitectureProps {
  currentTransaction?: Transaction | null;
  onProcessComplete?: (transaction: Transaction) => void;
}

const ThreeMachineArchitecture: React.FC<ThreeMachineArchitectureProps> = ({
  currentTransaction,
  onProcessComplete,
}) => {
  const [processingStage, setProcessingStage] = useState<0 | 1 | 2 | 3>(0);
  const [machines, setMachines] = useState<MachineStatusType[]>([
    {
      id: 'payment',
      name: 'Payment Machine',
      status: 'online',
      processedToday: 15234,
      avgProcessingTime: 180,
      successRate: 99.8,
      lastActive: new Date(),
      currentLoad: 45,
    },
    {
      id: 'fraud-detection',
      name: 'Fraud Detection Engine',
      status: 'online',
      processedToday: 15234,
      avgProcessingTime: 220,
      successRate: 97.2,
      lastActive: new Date(),
      currentLoad: 62,
    },
    {
      id: 'gateway',
      name: 'Blockchain Gateway',
      status: 'online',
      processedToday: 14892,
      avgProcessingTime: 95,
      successRate: 99.9,
      lastActive: new Date(),
      currentLoad: 38,
    },
  ]);

  // Simulate processing stages when a transaction comes in
  useEffect(() => {
    if (currentTransaction && processingStage === 0) {
      // Stage 1: Payment Machine
      setProcessingStage(1);
      setTimeout(() => {
        // Stage 2: Fraud Detection
        setProcessingStage(2);
        setTimeout(() => {
          // Stage 3: Gateway
          setProcessingStage(3);
          setTimeout(() => {
            // Complete
            setProcessingStage(0);
            onProcessComplete?.(currentTransaction);
          }, currentTransaction.processingTime.gateway);
        }, currentTransaction.processingTime.fraudDetection);
      }, currentTransaction.processingTime.payment);
    }
  }, [currentTransaction]);

  // Update machine stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMachines(prev => prev.map(machine => ({
        ...machine,
        processedToday: machine.processedToday + Math.floor(Math.random() * 3),
        currentLoad: Math.max(20, Math.min(85, machine.currentLoad + (Math.random() - 0.5) * 10)),
        lastActive: new Date(),
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-16 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-4">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="text-purple-400 text-sm font-medium">3-Machine Architecture</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Real-Time Processing Pipeline
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Every transaction flows through our three specialized machines for validation, 
            AI-powered fraud detection, and blockchain recording.
          </p>
        </div>

        {/* Processing Status Bar */}
        {processingStage > 0 && (
          <div className="mb-8 bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">Processing Transaction</span>
              <span className="text-cyan-400 text-sm font-mono">
                {currentTransaction?.id}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                processingStage >= 1 ? 'bg-cyan-500' : 'bg-slate-700'
              }`} />
              <div className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                processingStage >= 2 ? 'bg-purple-500' : 'bg-slate-700'
              }`} />
              <div className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                processingStage >= 3 ? 'bg-emerald-500' : 'bg-slate-700'
              }`} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span className={processingStage >= 1 ? 'text-cyan-400' : ''}>Payment</span>
              <span className={processingStage >= 2 ? 'text-purple-400' : ''}>Fraud Detection</span>
              <span className={processingStage >= 3 ? 'text-emerald-400' : ''}>Gateway</span>
            </div>
          </div>
        )}

        {/* Machine Cards */}
        <div className="grid lg:grid-cols-3 gap-6 relative">
          {/* Connection Lines (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-1/3 right-1/3 h-0.5 -translate-y-1/2">
            <div className={`h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 ${
              processingStage > 0 ? 'animate-pulse' : 'opacity-30'
            }`} />
          </div>

          {machines.map((machine, index) => (
            <MachineStatus
              key={machine.id}
              machine={machine}
              isProcessing={processingStage === index + 1}
            />
          ))}
        </div>

        {/* Technical Details */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-white font-semibold">Payment Validation</h3>
            </div>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                Card number verification
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                Account balance check
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                Merchant validation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                Amount limit verification
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold">XAI Fraud Analysis</h3>
            </div>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                LIME/SHAP interpretability
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                Real-time risk scoring
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                Feature importance analysis
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                Transparent decision making
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-white font-semibold">Blockchain Recording</h3>
            </div>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Transaction hashing (SHA-256)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                MetaMask integration
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Polygon network recording
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Immutable audit trail
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeMachineArchitecture;
