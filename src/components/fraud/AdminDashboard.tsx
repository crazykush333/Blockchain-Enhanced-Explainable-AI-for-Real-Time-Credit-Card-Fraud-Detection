import React, { useState } from 'react';
import { User, Transaction, AnalyticsData, BlockchainBlock } from '@/types/fraud';
import { generateStateRiskData } from '@/utils/analyticsGenerator';
import { INDIAN_STATES } from '@/types/fraud';
import LiveTransactionFeed from './LiveTransactionFeed';
import AnalyticsCharts from './AnalyticsCharts';
import DetailedAnalytics from './DetailedAnalytics';
import GeographicAnalytics from './GeographicAnalytics';
import IndiaHeatMap from './IndiaHeatMap';
import BlockchainExplorer from './BlockchainExplorer';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminDashboardProps {
  user: User;
  transactions: Transaction[];
  analytics: AnalyticsData;
  blocks: BlockchainBlock[];
  onTransactionClick: (transaction: Transaction) => void;
  onNewTransaction: (transaction: Transaction) => void;
  walletAddress?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  transactions,
  analytics,
  blocks,
  onTransactionClick,
  onNewTransaction,
  walletAddress,
}) => {
  const [activeView, setActiveView] = useState<'live' | 'analytics' | 'detailed' | 'geographic'>('live');
  const [blockedTransactions, setBlockedTransactions] = useState<Set<string>>(new Set());
  const [blockedHashes, setBlockedHashes] = useState<string[]>([]);
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);
  const [isMonitoringPaused, setIsMonitoringPaused] = useState(false);

  // Filter out manually blocked transactions from all views
  let visibleTransactions = transactions.filter(txn => !blockedTransactions.has(txn.id));

  // Further filter to show only flagged transactions if that mode is active
  if (showOnlyFlagged) {
    visibleTransactions = visibleTransactions.filter(txn => txn.status === 'flagged');
  }

  const stateRiskData = generateStateRiskData(visibleTransactions);

  const handleBlockedTransactionsChange = (blocked: Set<string>, hashes: string[]) => {
    setBlockedTransactions(blocked);
    setBlockedHashes(hashes);
  };

  // Recalculate analytics based on visible transactions
  const visibleAnalytics: AnalyticsData = {
    ...analytics,
    totalTransactions: visibleTransactions.length,
    approvedCount: visibleTransactions.filter(t => t.status === 'approved').length,
    flaggedCount: visibleTransactions.filter(t => t.status === 'flagged').length,
    blockedCount: visibleTransactions.filter(t => t.status === 'blocked').length,
  };

  const handleReviewFlagged = () => {
    setShowOnlyFlagged(!showOnlyFlagged);
    if (!showOnlyFlagged) {
      // Switching to flagged view
      setActiveView('live');
    }
  };

  const handleExportReport = () => {
    const flaggedTransactions = transactions.filter(txn =>
      txn.status === 'flagged' && !blockedTransactions.has(txn.id)
    );

    if (flaggedTransactions.length === 0) {
      alert('No flagged transactions to export');
      return;
    }

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Flagged Transactions Report', 14, 20);

    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Flagged Transactions: ${flaggedTransactions.length}`, 14, 34);

    // Prepare table data
    const tableData = flaggedTransactions.map(txn => [
      txn.id.slice(0, 8) + '...',
      new Date(txn.timestamp).toLocaleString(),
      `Rs. ${txn.amount.toFixed(2)}`,
      txn.merchantName,
      txn.location.city + ', ' + txn.location.state,
      txn.riskScore.toFixed(1) + '%',
      txn.xaiExplanation?.summary || 'N/A'
    ]);

    // Add table
    autoTable(doc, {
      head: [['ID', 'Timestamp', 'Amount', 'Merchant', 'Location', 'Risk Score', 'Reason']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [251, 191, 36] }, // amber color
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 18 },
        6: { cellWidth: 'auto' }
      }
    });

    // Save the PDF
    doc.save(`flagged-transactions-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-slate-400 text-sm">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {walletAddress && (
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg">
                  <svg className="w-4 h-4 text-orange-400" viewBox="0 0 35 33" fill="currentColor">
                    <path d="M32.9582 1L19.8241 10.7183L22.2665 4.99099L32.9582 1Z" />
                    <path d="M2.66296 1L15.6886 10.809L13.3541 4.99098L2.66296 1Z" />
                  </svg>
                  <span className="text-slate-400 text-sm font-mono">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-sm font-medium">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap gap-2">
          {[
            {
              id: 'live', label: 'Live Monitoring', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )
            },
            {
              id: 'analytics', label: 'Analytics', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )
            },
            {
              id: 'detailed', label: 'Deep Insights', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              )
            },
            {
              id: 'geographic', label: 'Geographic', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              )
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${activeView === tab.id
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Live Monitoring View */}
        {activeView === 'live' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Live Feed - Takes 2 columns */}
            <div className="lg:col-span-2">
              <LiveTransactionFeed
                transactions={visibleTransactions}
                onTransactionClick={onTransactionClick}
                onNewTransaction={isMonitoringPaused ? undefined : onNewTransaction}
                isLive={!isMonitoringPaused}
                maxDisplay={15}
              />
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              {/* Controls */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
                <h3 className="text-white font-semibold mb-4">Live Controls</h3>
                <button
                  onClick={() => setIsMonitoringPaused(!isMonitoringPaused)}
                  className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isMonitoringPaused
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30'
                    }`}
                >
                  {isMonitoringPaused ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Resume Monitoring
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pause Monitoring
                    </>
                  )}
                </button>
              </div>
              {/* Today's Summary */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
                <h3 className="text-white font-semibold mb-4">Today's Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Transactions</span>
                    <span className="text-white font-bold">{visibleAnalytics.totalTransactions.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Approved</span>
                    <span className="text-emerald-400 font-bold">{visibleAnalytics.approvedCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Flagged</span>
                    <span className="text-amber-400 font-bold">{visibleAnalytics.flaggedCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Blocked</span>
                    <span className="text-red-400 font-bold">{visibleAnalytics.blockedCount.toLocaleString()}</span>
                  </div>
                  {blockedTransactions.size > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                      <span className="text-slate-400">Hidden by Admin</span>
                      <span className="text-purple-400 font-bold">{blockedTransactions.size}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Model Performance */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
                <h3 className="text-white font-semibold mb-4">XAI Model Performance</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400 text-sm">Precision</span>
                      <span className="text-emerald-400 text-sm">{analytics.modelMetrics.precision.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analytics.modelMetrics.precision}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400 text-sm">Recall</span>
                      <span className="text-cyan-400 text-sm">{analytics.modelMetrics.recall.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${analytics.modelMetrics.recall}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400 text-sm">F1 Score</span>
                      <span className="text-purple-400 text-sm">{analytics.modelMetrics.f1Score.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${analytics.modelMetrics.f1Score}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
                <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleReviewFlagged}
                    className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${showOnlyFlagged
                      ? 'bg-amber-500/40 text-amber-300 hover:bg-amber-500/50'
                      : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {showOnlyFlagged ? 'Show All Transactions' : `Review Flagged (${visibleAnalytics.flaggedCount})`}
                  </button>
                  <button
                    onClick={handleExportReport}
                    className="w-full py-2 px-3 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Report
                  </button>
                  <button className="w-full py-2 px-3 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    System Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics View with Live Feed */}
        {activeView === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AnalyticsCharts data={visibleAnalytics} transactions={visibleTransactions} />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <LiveTransactionFeed
                  isLive={!isMonitoringPaused}
                  transactions={visibleTransactions}
                  onTransactionClick={onTransactionClick}
                  onNewTransaction={isMonitoringPaused ? undefined : onNewTransaction}
                />
              </div>
            </div>
          </div>
        )}

        {/* Detailed Analytics View with Live Feed */}
        {activeView === 'detailed' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DetailedAnalytics data={visibleAnalytics} transactions={visibleTransactions} />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <LiveTransactionFeed
                  isLive={!isMonitoringPaused}
                  transactions={visibleTransactions}
                  onTransactionClick={onTransactionClick}
                  onNewTransaction={isMonitoringPaused ? undefined : onNewTransaction}
                />
              </div>
            </div>
          </div>
        )}

        {/* Blockchain View removed per request */}

        {/* Geographic View with Live Feed */}
        {activeView === 'geographic' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GeographicAnalytics
                stateData={stateRiskData}
                transactions={visibleTransactions}
                onStateClick={(state) => console.log('State clicked:', state)}
              />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <LiveTransactionFeed
                  isLive={!isMonitoringPaused}
                  transactions={visibleTransactions}
                  onTransactionClick={onTransactionClick}
                  onNewTransaction={isMonitoringPaused ? undefined : onNewTransaction}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
