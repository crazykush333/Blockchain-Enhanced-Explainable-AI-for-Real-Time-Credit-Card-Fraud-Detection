import React from 'react';
import { Transaction } from '@/types/fraud';
import { formatINR, formatTimeAgo } from '@/utils/transactionGenerator';

interface TransactionCardProps {
  transaction: Transaction;
  onClick?: () => void;
  showDetails?: boolean;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ 
  transaction, 
  onClick,
  showDetails = false 
}) => {
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

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'approved':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'flagged':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'blocked':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
    }
  };

  const getCardTypeIcon = (cardType: Transaction['cardType']) => {
    switch (cardType) {
      case 'visa':
        return (
          <div className="text-blue-400 font-bold text-xs">VISA</div>
        );
      case 'mastercard':
        return (
          <div className="flex">
            <div className="w-4 h-4 bg-red-500 rounded-full -mr-1" />
            <div className="w-4 h-4 bg-amber-500 rounded-full opacity-80" />
          </div>
        );
      case 'rupay':
        return (
          <div className="text-green-400 font-bold text-xs">RuPay</div>
        );
      case 'amex':
        return (
          <div className="text-blue-300 font-bold text-xs">AMEX</div>
        );
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div
      onClick={onClick}
      className={`bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 hover:bg-slate-800/80 transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700/50 rounded-lg">
            {getCardTypeIcon(transaction.cardType)}
          </div>
          <div>
            <h4 className="text-white font-medium text-sm">{transaction.merchantName}</h4>
            <p className="text-slate-400 text-xs">{transaction.merchantCategory}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${getStatusColor(transaction.status)}`}>
          {getStatusIcon(transaction.status)}
          <span className="text-xs font-medium capitalize">{transaction.status}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-white font-semibold text-lg">{formatINR(transaction.amount)}</p>
          <p className="text-slate-400 text-xs">Card ending {transaction.cardLast4}</p>
        </div>
        <div className="text-right">
          <p className={`font-semibold ${getRiskColor(transaction.riskScore)}`}>
            Risk: {transaction.riskScore}%
          </p>
          <p className="text-slate-400 text-xs">{formatTimeAgo(transaction.timestamp)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{transaction.location.city}, {transaction.location.state}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{transaction.processingTime.total}ms</span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900/50 rounded-lg p-2">
              <p className="text-slate-400 mb-1">Payment</p>
              <p className="text-cyan-400 font-medium">{transaction.processingTime.payment}ms</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-2">
              <p className="text-slate-400 mb-1">Fraud Check</p>
              <p className="text-purple-400 font-medium">{transaction.processingTime.fraudDetection}ms</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-2">
              <p className="text-slate-400 mb-1">Gateway</p>
              <p className="text-emerald-400 font-medium">{transaction.processingTime.gateway}ms</p>
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p className="text-slate-400 text-xs font-mono truncate">{transaction.hash}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;
