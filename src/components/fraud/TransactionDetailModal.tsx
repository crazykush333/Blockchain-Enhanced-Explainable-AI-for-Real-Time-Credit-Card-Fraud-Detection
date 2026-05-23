import React from 'react';
import { Transaction } from '@/types/fraud';
import { formatINR, formatTimeAgo } from '@/utils/transactionGenerator';
import XAIExplanation from './XAIExplanation';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !transaction) return null;

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'flagged':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'blocked':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl my-8">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-800/95 backdrop-blur-sm rounded-t-2xl border-b border-slate-700/50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-white font-bold text-xl">Transaction Details</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(transaction.status)}`}>
                  {transaction.status.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-400 font-mono text-sm">{transaction.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Transaction Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left - Transaction Info */}
            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Payment Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount</span>
                    <span className="text-white font-semibold text-lg">{formatINR(transaction.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Merchant</span>
                    <span className="text-white">{transaction.merchantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category</span>
                    <span className="text-white">{transaction.merchantCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Card</span>
                    <span className="text-white uppercase">{transaction.cardType} ****{transaction.cardLast4}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time</span>
                    <span className="text-white">{formatTimeAgo(transaction.timestamp)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">City</span>
                    <span className="text-white">{transaction.location.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">State</span>
                    <span className="text-white">{transaction.location.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Country</span>
                    <span className="text-white">{transaction.location.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Coordinates</span>
                    <span className="text-white font-mono text-sm">
                      {transaction.location.coordinates.lat.toFixed(4)}, {transaction.location.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Processing Time
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Payment Machine</span>
                      <span className="text-cyan-400">{transaction.processingTime.payment}ms</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(transaction.processingTime.payment / 300) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Fraud Detection</span>
                      <span className="text-purple-400">{transaction.processingTime.fraudDetection}ms</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(transaction.processingTime.fraudDetection / 400) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Gateway</span>
                      <span className="text-emerald-400">{transaction.processingTime.gateway}ms</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(transaction.processingTime.gateway / 200) * 100}%` }} />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-700/50">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">Total</span>
                      <span className="text-white font-bold">{transaction.processingTime.total}ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - XAI Explanation */}
            <div>
              {transaction.xaiExplanation && (
                <XAIExplanation
                  explanation={transaction.xaiExplanation}
                  transactionId={transaction.id}
                />
              )}
            </div>
          </div>

          {/* Blockchain Info */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Blockchain Record
            </h3>
            <div className="grid md:grid-cols-1 gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Transaction Hash</p>
                <p className="text-white font-mono text-sm bg-slate-800 rounded-lg p-2 break-all">
                  {transaction.hash}
                </p>
              </div>

            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-orange-400" viewBox="0 0 35 33" fill="currentColor">
                  <path d="M32.9582 1L19.8241 10.7183L22.2665 4.99099L32.9582 1Z" />
                  <path d="M2.66296 1L15.6886 10.809L13.3541 4.99098L2.66296 1Z" />
                </svg>
                <span className="text-slate-400 text-sm">Verified on Ganache Local</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
