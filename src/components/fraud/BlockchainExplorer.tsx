import React, { useState } from 'react';
import { BlockchainBlock, Transaction } from '@/types/fraud';
import { formatTimeAgo, formatINR } from '@/utils/transactionGenerator';
import { toast } from 'sonner';

interface BlockchainExplorerProps {
  blocks: BlockchainBlock[];
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
  onBlockedTransactionsChange?: (blockedTxns: Set<string>, blockedHashes: string[]) => void;
}

const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({ 
  blocks, 
  transactions,
  onTransactionClick,
  onBlockedTransactionsChange
}) => {
  const [blockedTransactions, setBlockedTransactions] = useState<Set<string>>(new Set());
  const [expandedBlock, setExpandedBlock] = useState<number | null>(blocks[0]?.number);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const formatHash = (hash: string): string => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const toggleBlockTransaction = (txnId: string, txnHash: string) => {
    const newBlocked = new Set(blockedTransactions);
    if (newBlocked.has(txnId)) {
      newBlocked.delete(txnId);
    } else {
      newBlocked.add(txnId);
    }
    setBlockedTransactions(newBlocked);
    
    // Notify parent component of changes
    const blockedHashes = Array.from(newBlocked).map(id => {
      const txn = transactions.find(t => t.id === id);
      return txn?.hash || '';
    }).filter(Boolean);
    
    onBlockedTransactionsChange?.(newBlocked, blockedHashes);
  };

  const copyHashToClipboard = (hash: string, label: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    toast.success(`Hash copied! ${formatHash(hash)}`);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Calculate network stats
  const totalGasUsed = blocks.reduce((sum, b) => sum + b.gasUsed, 0);
  const totalGasLimit = blocks.reduce((sum, b) => sum + b.gasLimit, 0);
  const gasUtilization = ((totalGasUsed / totalGasLimit) * 100).toFixed(1);
  const avgGasPerBlock = Math.round(totalGasUsed / (blocks.length || 1));
  const avgGasPrice = 25;

  // Stats cards for MetaMask network
  const metaMaskStats = [
    { label: 'Latest Block', value: `#${blocks[0]?.number || 0}`, icon: '⛓️', color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Transactions', value: transactions.length, icon: '📦', color: 'from-purple-500 to-pink-500' },
    { label: 'Blocked Transactions', value: blockedTransactions.size, icon: '🚫', color: 'from-red-500 to-orange-500' },
    { label: 'MetaMask Connected', value: 'Active', icon: '🦊', color: 'from-orange-500 to-yellow-500' },
  ];

  const gasStats = [
    {
      label: 'Gas Utilization',
      value: `${gasUtilization}%`,
      change: '+5% from last hour',
      trend: 'up',
    },
    {
      label: 'Avg Gas per Block',
      value: `${avgGasPerBlock.toLocaleString()}`,
      change: '+2% from last hour',
      trend: 'up',
    },
    {
      label: 'Avg Gas Price',
      value: `${avgGasPrice} Gwei`,
      change: '-3% from last hour',
      trend: 'down',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* MetaMask Connected Banner */}
      <div className="bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 border border-orange-500/40 rounded-xl p-5 flex items-center gap-4 hover:border-orange-500/60 transition-all">
        <div className="text-3xl animate-bounce">🦊</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-orange-200 font-bold text-lg">MetaMask Network Connected</h3>
          <p className="text-orange-100/70 text-sm">All transactions are hashed with SHA-256 and stored securely on cloud</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-cyan-500/30 text-cyan-300 text-xs rounded-full font-bold whitespace-nowrap">
            ☁️ CLOUD SYNC
          </div>
          <div className="px-3 py-1.5 bg-emerald-500/30 text-emerald-300 text-xs rounded-full font-bold whitespace-nowrap animate-pulse">
            🟢 LIVE
          </div>
        </div>
      </div>

      {/* MetaMask Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metaMaskStats.map((stat, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${stat.color} rounded-xl p-5 text-white shadow-xl transform hover:scale-105 transition-all duration-200 border border-white/10`}
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-sm font-medium opacity-90">{stat.label}</h4>
              <span className="text-3xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
            {idx === 0 && <p className="text-xs opacity-75 mt-2">Latest confirmed on-chain</p>}
          </div>
        ))}
      </div>

      {/* Gas Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gasStats.map((gas, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-5 hover:border-slate-600/50 transition-colors"
          >
            <h4 className="text-slate-400 text-sm font-medium mb-3">{gas.label}</h4>
            <p className="text-white text-3xl font-bold mb-3">{gas.value}</p>
            <p className={`text-xs font-medium flex items-center gap-1 ${gas.trend === 'up' ? 'text-amber-400' : 'text-emerald-400'}`}>
              <span>{gas.trend === 'up' ? '📈' : '📉'}</span>
              {gas.change}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Blocks - Enhanced Visualization */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h18v18H3z" opacity="0.2" />
              <path d="M5 5v14h14V5H5m2 2h10v10H7V7z" />
            </svg>
            Recent Blocks
          </h3>
          <span className="text-xs bg-blue-500/30 text-blue-200 px-4 py-2 rounded-full font-bold">
            {blocks.length} blocks on chain
          </span>
        </div>

        <div className="space-y-3">
          {blocks.slice(0, 6).map((block, idx) => (
            <div
              key={block.number}
              className="bg-gradient-to-r from-slate-800/60 via-slate-800/80 to-slate-900/60 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-500/20 group"
            >
              <button
                onClick={() => setExpandedBlock(expandedBlock === block.number ? null : block.number)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Block Number Badge */}
                  <div className="flex-shrink-0 relative">
                    <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500/40 to-cyan-500/40 text-blue-300 font-bold text-lg border-2 border-blue-500/60 shadow-lg">
                      #{block.number}
                    </div>
                    {idx === 0 && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-400 rounded-full animate-pulse shadow-lg" />
                    )}
                  </div>

                  {/* Block Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-white font-mono text-sm truncate cursor-pointer hover:text-blue-300 transition-colors group-hover:underline" title={block.hash} onClick={(e) => { e.stopPropagation(); copyHashToClipboard(block.hash, 'block'); }}>
                        {formatHash(block.hash)}
                      </p>
                      <svg
                        className="w-4 h-4 text-slate-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-blue-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        onClick={(e) => { e.stopPropagation(); copyHashToClipboard(block.hash, 'block'); }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 bg-slate-700/50 px-3 py-1 rounded-full">📦 {block.transactions.length} txns</span>
                      <span className="inline-flex items-center gap-1 bg-slate-700/50 px-3 py-1 rounded-full">⛽ {block.gasUsed}/{block.gasLimit}</span>
                      <span className="inline-flex items-center gap-1 bg-slate-700/50 px-3 py-1 rounded-full">🔢 Nonce: {block.nonce}</span>
                    </div>
                  </div>
                </div>

                {/* Expand Icon */}
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                    expandedBlock === block.number ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Expanded Block Details */}
              {expandedBlock === block.number && (
                <div className="bg-slate-900/60 border-t border-slate-700/50 p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Block Hash */}
                    <div className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-lg border border-slate-700/50 transition-colors cursor-pointer group/hash" onClick={() => copyHashToClipboard(block.hash, 'block-hash')}>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Block Hash</p>
                      <p className="text-white font-mono text-xs break-all group-hover/hash:text-blue-300 transition-colors">{block.hash}</p>
                      <p className="text-blue-300/50 text-xs mt-2 group-hover/hash:text-blue-300 transition-colors">Click to copy</p>
                    </div>

                    {/* Previous Hash */}
                    <div className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-lg border border-slate-700/50 transition-colors cursor-pointer group/prev" onClick={() => copyHashToClipboard(block.previousHash, 'prev-hash')}>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Previous Hash</p>
                      <p className="text-white font-mono text-xs break-all group-hover/prev:text-blue-300 transition-colors">{block.previousHash}</p>
                      <p className="text-blue-300/50 text-xs mt-2 group-hover/prev:text-blue-300 transition-colors">Click to copy</p>
                    </div>

                    {/* Timestamp */}
                    <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700/50">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">📅 Timestamp</p>
                      <p className="text-white text-sm">{new Date(block.timestamp).toLocaleString()}</p>
                    </div>

                    {/* Gas Details */}
                    <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700/50">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">⛽ Gas Details</p>
                      <p className="text-white text-sm">
                        Used: {block.gasUsed.toLocaleString()} / Limit: {block.gasLimit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions with Blocking */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-3">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Transactions & Block Control
          </h3>
          <div className="text-xs bg-purple-500/30 text-purple-300 px-4 py-2 rounded-full font-bold flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${blockedTransactions.size > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
            Blocked: {blockedTransactions.size} / {transactions.length}
          </div>
        </div>
        <div className="divide-y divide-slate-700/50 max-h-96 overflow-y-auto">
          {transactions.slice(0, 12).map((txn) => (
            <div
              key={txn.id}
              className={`p-4 hover:bg-slate-900/50 transition-all ${
                blockedTransactions.has(txn.id) ? 'bg-red-500/10 border-l-4 border-red-500' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 cursor-pointer" onClick={() => onTransactionClick?.(txn)}>
                  {/* Status Indicator */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg ${
                      txn.status === 'approved'
                        ? 'bg-emerald-500/20 border border-emerald-500/50'
                        : txn.status === 'flagged'
                        ? 'bg-amber-500/20 border border-amber-500/50'
                        : 'bg-red-500/20 border border-red-500/50'
                    }`}
                  >
                    {txn.status === 'approved' ? '✅' : txn.status === 'flagged' ? '⚠️' : '🚫'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-mono text-sm truncate hover:text-blue-300 transition-colors" title={txn.hash} onClick={(e) => { e.stopPropagation(); copyHashToClipboard(txn.hash, 'txn'); }}>
                        {formatHash(txn.hash)}
                      </p>
                      <svg
                        className="w-3 h-3 text-slate-400 flex-shrink-0 opacity-0 hover:opacity-100 transition-opacity cursor-pointer hover:text-blue-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        onClick={(e) => { e.stopPropagation(); copyHashToClipboard(txn.hash, 'txn'); }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="inline-block bg-slate-700/50 px-2 py-1 rounded">Block #{txn.blockNumber}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(txn.timestamp)}</span>
                      <span>•</span>
                      <span
                        className={`font-bold px-2 py-1 rounded ${
                          txn.status === 'approved'
                            ? 'bg-emerald-500/30 text-emerald-300'
                            : txn.status === 'flagged'
                            ? 'bg-amber-500/30 text-amber-300'
                            : 'bg-red-500/30 text-red-300'
                        }`}
                      >
                        {txn.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount & Block Button */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-white font-bold">{formatINR(txn.amount)}</p>
                    <p className={`text-xs font-bold ${txn.riskScore > 60 ? 'text-red-400' : txn.riskScore > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      Risk: {txn.riskScore}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleBlockTransaction(txn.id, txn.hash)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                      blockedTransactions.has(txn.id)
                        ? 'bg-red-500/40 text-red-200 border-red-500/50 hover:bg-red-500/50'
                        : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
                    }`}
                  >
                    {blockedTransactions.has(txn.id) ? '🚫 Blocked' : 'Block'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blocked Transactions Summary */}
      {blockedTransactions.size > 0 && (
        <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border border-red-500/30 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">🚫</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-red-200 font-bold mb-2">Blocked Transactions ({blockedTransactions.size})</h4>
              <div className="space-y-2 text-xs">
                {Array.from(blockedTransactions).slice(0, 5).map((txnId) => {
                  const txn = transactions.find(t => t.id === txnId);
                  return (
                    <div
                      key={txnId}
                      className="bg-slate-800/60 p-2 rounded flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors group"
                      onClick={() => txn && copyHashToClipboard(txn.hash, 'blocked')}
                    >
                      <span className="text-slate-300 font-mono truncate group-hover:text-blue-300">{txn ? formatHash(txn.hash) : 'Unknown'}</span>
                      <span className="text-slate-400 ml-2">📋 Copy</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainExplorer;
