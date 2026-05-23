import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Transaction } from '@/types/fraud';
import TransactionCard from './TransactionCard';
import { generateTransaction } from '@/utils/transactionGenerator';

interface LiveTransactionFeedProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
  onNewTransaction?: (transaction: Transaction) => void;
  isLive?: boolean;
  maxDisplay?: number;
}

const LiveTransactionFeed: React.FC<LiveTransactionFeedProps> = ({
  transactions,
  onTransactionClick,
  onNewTransaction,
  isLive = true,
  maxDisplay = 15,
}) => {
  const [filter, setFilter] = useState<'all' | 'approved' | 'flagged' | 'blocked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  // Auto-generate new transactions when live
  useEffect(() => {
    if (!isLive || !onNewTransaction) return;

    const interval = setInterval(() => {
      const latestBlock = transactions[0]?.blockNumber || 1000000;
      const newTxn = generateTransaction(latestBlock + 1);
      onNewTransaction(newTxn);
    }, 5000); // Every 5 seconds for real-time feel

    return () => clearInterval(interval);
  }, [isLive, onNewTransaction, transactions]);

  // Auto-scroll to top when new transaction arrives
  useEffect(() => {
    if (isAutoScroll && feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [transactions.length, isAutoScroll]);

  // Memoize expensive filtering operations
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(txn => filter === 'all' || txn.status === filter)
      .filter(txn => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          txn.merchantName.toLowerCase().includes(query) ||
          txn.id.toLowerCase().includes(query) ||
          txn.location.city.toLowerCase().includes(query) ||
          txn.cardLast4.includes(query)
        );
      })
      .slice(0, maxDisplay);
  }, [transactions, filter, searchQuery, maxDisplay]);

  // Memoize counts to avoid recalculating on every render
  const counts = useMemo(() => ({
    all: transactions.length,
    approved: transactions.filter(t => t.status === 'approved').length,
    flagged: transactions.filter(t => t.status === 'flagged').length,
    blocked: transactions.filter(t => t.status === 'blocked').length,
  }), [transactions]);

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 bg-cyan-500/20 rounded-xl">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              {isLive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="text-white font-bold">Live Transaction Feed</h3>
              <p className="text-slate-400 text-sm">
                {isLive ? 'Real-time monitoring active' : 'Monitoring paused'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isAutoScroll
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
              }`}
          >
            {isAutoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by merchant, ID, city, or card..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'approved', 'flagged', 'blocked'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === status
                  ? status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    status === 'flagged' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      status === 'blocked' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-700/30 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
                }`}
            >
              <span className="capitalize">{status}</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${filter === status ? 'bg-white/10' : 'bg-slate-600/50'
                }`}>
                {counts[status]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div
        ref={feedRef}
        className="p-4 space-y-3 max-h-[600px] overflow-y-auto"
        onScroll={() => {
          if (feedRef.current && feedRef.current.scrollTop > 50) {
            setIsAutoScroll(false);
          }
        }}
      >
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-400">No transactions found</p>
            <p className="text-slate-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          filteredTransactions.map((txn, index) => (
            <div
              key={txn.id}
              className={`transition-all duration-300 ${index === 0 && isLive ? 'animate-pulse-once' : ''
                }`}
            >
              <TransactionCard
                transaction={txn}
                onClick={() => onTransactionClick?.(txn)}
                showDetails={false}
              />
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-slate-400">Approved: {counts.approved}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
              <span className="text-slate-400">Flagged: {counts.flagged}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span className="text-slate-400">Blocked: {counts.blocked}</span>
            </div>
          </div>
          <span className="text-slate-500 text-xs">
            Showing {filteredTransactions.length} of {transactions.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveTransactionFeed;
