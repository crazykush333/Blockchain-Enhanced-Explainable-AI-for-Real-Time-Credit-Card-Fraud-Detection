import React, { useState } from 'react';
import { User, Transaction } from '@/types/fraud';
import { formatINR, formatTimeAgo } from '@/utils/transactionGenerator';
import TransactionCard from './TransactionCard';

interface CreditCard {
  id: string;
  last4: string;
  network: 'visa' | 'mastercard' | 'rupay' | 'amex';
  holderName: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  createdAt: Date;
  cardLimit: number;
  usedLimit: number;
}

interface CustomerPortalProps {
  user: User;
  transactions: Transaction[];
  onTransactionClick: (transaction: Transaction) => void;
  walletAddress?: string;
  walletBalance?: string;
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({
  user,
  transactions,
  onTransactionClick,
  walletAddress,
  walletBalance,
}) => {
  const isNewCustomer = user.role === 'customer' && user.isNewCustomer;
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'cards' | 'expenditure' | 'appeals'>('overview');
  const [appealText, setAppealText] = useState('');
  const [selectedTxnForAppeal, setSelectedTxnForAppeal] = useState<string>('');
  const [selectedTxnDetails, setSelectedTxnDetails] = useState<Transaction | null>(null);
  const [showXAIModal, setShowXAIModal] = useState(false);

  const sampleCards: CreditCard[] = [
    {
      id: '1',
      last4: '4532',
      network: 'visa',
      holderName: 'John Doe',
      expiryMonth: 12,
      expiryYear: 2026,
      isDefault: true,
      createdAt: new Date('2023-01-15'),
      cardLimit: 500000,
      usedLimit: 125000,
    },
    {
      id: '2',
      last4: '5425',
      network: 'mastercard',
      holderName: 'John Doe',
      expiryMonth: 8,
      expiryYear: 2027,
      isDefault: false,
      createdAt: new Date('2023-06-20'),
      cardLimit: 300000,
      usedLimit: 85000,
    },
    {
      id: '3',
      last4: '3764',
      network: 'amex',
      holderName: 'John Doe',
      expiryMonth: 5,
      expiryYear: 2026,
      isDefault: false,
      createdAt: new Date('2024-02-10'),
      cardLimit: 750000,
      usedLimit: 200000,
    },
  ];

  const [creditCards, setCreditCards] = useState<CreditCard[]>(isNewCustomer ? [] : sampleCards);
  const [hasActivatedFeed, setHasActivatedFeed] = useState(!isNewCustomer);

  const [newCardNetwork, setNewCardNetwork] = useState<CreditCard['network']>('visa');
  const [newCardLast4, setNewCardLast4] = useState('8742');
  const [newExpiryMonth, setNewExpiryMonth] = useState<number>(12);
  const [newExpiryYear, setNewExpiryYear] = useState<number>(new Date().getFullYear() + 4);
  const [newCardLimit, setNewCardLimit] = useState<number>(300000);

  const feedReady = !isNewCustomer || (creditCards.length > 0 && hasActivatedFeed);

  // Filter transactions for this customer
  const customerTransactions = feedReady ? transactions.slice(0, 50) : [];
  const flaggedTransactions = customerTransactions.filter(t => t.status === 'flagged' || t.status === 'blocked');
  const blockedTransactions = customerTransactions.filter(t => t.status === 'blocked');
  const approvedTransactions = customerTransactions.filter(t => t.status === 'approved');

  // Calculate expenditure stats
  const totalSpent = approvedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const thisMonth = approvedTransactions.filter(t => {
    const txnDate = new Date(t.timestamp);
    const now = new Date();
    return txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear();
  }).reduce((sum, t) => sum + t.amount, 0);

  const thisWeek = approvedTransactions.filter(t => {
    const txnDate = new Date(t.timestamp);
    const now = new Date();
    const diff = now.getTime() - txnDate.getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).reduce((sum, t) => sum + t.amount, 0);

  const safeTotalSpent = totalSpent || 1;
  const thisMonthShare = totalSpent ? Math.round((thisMonth / totalSpent) * 100) : 0;
  const thisWeekShare = totalSpent ? Math.round((thisWeek / totalSpent) * 100) : 0;

  // Category-wise expenditure
  const categoryExpenditure = approvedTransactions.reduce((acc, txn) => {
    const cat = txn.merchantCategory;
    acc[cat] = (acc[cat] || 0) + txn.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryExpenditure)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get card network icon
  const getCardIcon = (network: string) => {
    switch (network) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '🔴';
      case 'rupay':
        return '🇮🇳';
      case 'amex':
        return '💎';
      default:
        return '💳';
    }
  };

  const getCardColor = (network: string) => {
    switch (network) {
      case 'visa':
        return 'from-blue-600 to-blue-700';
      case 'mastercard':
        return 'from-red-600 to-orange-600';
      case 'rupay':
        return 'from-orange-600 to-yellow-600';
      case 'amex':
        return 'from-green-600 to-emerald-600';
      default:
        return 'from-slate-600 to-slate-700';
    }
  };

  const handleAppealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Appeal submitted for transaction ${selectedTxnForAppeal}. Our team will review within 24-48 hours.`);
    setAppealText('');
    setSelectedTxnForAppeal('');
  };

  const addCreditCard = () => {
    if (creditCards.length >= 10) {
      alert('You have reached the maximum limit of 10 credit cards.');
      return;
    }

    if (!/^\d{4}$/.test(newCardLast4)) {
      alert('Please enter the last 4 digits of your card number.');
      return;
    }

    if (newExpiryMonth < 1 || newExpiryMonth > 12) {
      alert('Please enter a valid expiry month (1-12).');
      return;
    }

    const currentYear = new Date().getFullYear();
    if (newExpiryYear < currentYear) {
      alert('Expiry year cannot be in the past.');
      return;
    }

    const newCard: CreditCard = {
      id: `CARD-${Date.now()}`,
      last4: newCardLast4,
      network: newCardNetwork,
      holderName: user.name,
      expiryMonth: newExpiryMonth,
      expiryYear: newExpiryYear,
      isDefault: creditCards.length === 0,
      createdAt: new Date(),
      cardLimit: newCardLimit,
      usedLimit: 0,
    };

    setCreditCards(prev => [...prev, newCard]);
    setHasActivatedFeed(true);
    setActiveTab('cards');
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Welcome back, {user.name}</h1>
                <p className="text-slate-400">{user.email}</p>
              </div>
            </div>
            {walletAddress && (
              <div className="hidden md:block bg-slate-800/50 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">Connected Wallet</p>
                <p className="text-white font-mono text-sm">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
                <p className="text-cyan-400 font-semibold">{walletBalance} ETH</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['overview', 'transactions', 'cards', 'expenditure', 'appeals'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-medium transition-all capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
              }`}
            >
              {tab === 'cards' ? '💳 Cards' : tab === 'expenditure' ? '📊 Expenditure' : tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {!feedReady && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-amber-100 font-semibold">Add your first card to start real-time transactions.</p>
                  <p className="text-amber-200 text-sm">We pause feeds for brand-new customers until a card is on file.</p>
                </div>
                <button
                  onClick={() => setActiveTab('cards')}
                  className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg font-semibold text-sm hover:bg-amber-400 transition-colors"
                >
                  Add Card
                </button>
              </div>
            )}
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-slate-400 text-sm">Total Spent</span>
                </div>
                <p className="text-white font-bold text-xl">{formatINR(totalSpent)}</p>
                <p className="text-emerald-400 text-xs mt-2">This month: {formatINR(thisMonth)}</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-slate-400 text-sm">Transactions</span>
                </div>
                <p className="text-white font-bold text-xl">{customerTransactions.length}</p>
                <p className="text-cyan-400 text-xs mt-2">Approved: {approvedTransactions.length}</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span className="text-slate-400 text-sm">Alerts</span>
                </div>
                <p className="text-amber-400 font-bold text-xl">{flaggedTransactions.length}</p>
                {blockedTransactions.length > 0 && (
                  <p className="text-red-400 text-xs mt-2">{blockedTransactions.length} blocked</p>
                )}
                <p className="text-amber-400 text-xs mt-2">Review needed</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-slate-400 text-sm">Security Score</span>
                </div>
                <p className="text-purple-400 font-bold text-xl">92/100</p>
                <p className="text-purple-400 text-xs mt-2">Safe & Secure</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* This Week */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-white font-bold mb-4">📅 This Week</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Spend</p>
                    <p className="text-white text-3xl font-bold mt-1">{formatINR(thisWeek)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 text-sm">+{thisWeekShare}% of total</p>
                  </div>
                </div>
              </div>

              {/* Top Categories */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-white font-bold mb-4">🏪 Top Categories</h3>
                <div className="space-y-2">
                  {topCategories.slice(0, 3).map(([cat, amount]) => (
                    <div key={cat} className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">{cat}</span>
                      <span className="text-white font-semibold">{formatINR(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-white font-bold text-lg mb-4">Recent Transactions</h2>
              <div className="space-y-3">
                {customerTransactions.slice(0, 5).map((txn) => (
                  <TransactionCard
                    key={txn.id}
                    transaction={txn}
                    onClick={() => {
                      setSelectedTxnDetails(txn);
                      onTransactionClick(txn);
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveTab('transactions')}
                className="w-full mt-4 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
              >
                View All Transactions
              </button>
            </div>
          </div>
        )}

        {/* Transactions Tab - With XAI Details */}
        {activeTab === 'transactions' && (
          feedReady ? (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-white font-bold text-lg mb-4">Transaction History</h2>
              <div className="space-y-3 max-h-[700px] overflow-y-auto">
                {customerTransactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 hover:border-slate-600/50 transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedTxnDetails(txn);
                      setShowXAIModal(true);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg ${
                          txn.status === 'approved' ? 'bg-emerald-500/20' :
                          txn.status === 'flagged' ? 'bg-amber-500/20' : 'bg-red-500/20'
                        }`}>
                          {txn.status === 'approved' ? '✅' : txn.status === 'flagged' ? '⚠️' : '🚫'}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{txn.merchantName}</h3>
                          <p className="text-slate-400 text-sm">{txn.location.city}, {txn.location.state}</p>
                          <p className="text-slate-500 text-xs mt-1">{formatTimeAgo(txn.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{formatINR(txn.amount)}</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                          txn.status === 'approved' ? 'bg-emerald-500/30 text-emerald-300' :
                          txn.status === 'flagged' ? 'bg-amber-500/30 text-amber-300' :
                          'bg-red-500/30 text-red-300'
                        }`}>
                          {txn.status.toUpperCase()}
                        </span>
                        {(txn.status === 'flagged' || txn.status === 'blocked') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTxnDetails(txn);
                              setShowXAIModal(true);
                            }}
                            className="block ml-auto mt-2 text-blue-400 hover:text-blue-300 text-xs font-semibold"
                          >
                            View Reason →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-10 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/20 text-amber-200 flex items-center justify-center text-xl">⏸️</div>
              <h3 className="text-white font-semibold text-lg">Live feed paused</h3>
              <p className="text-slate-400 text-sm">Add a card to start your real-time transactions and XAI analysis.</p>
              <button
                onClick={() => setActiveTab('cards')}
                className="mt-2 px-4 py-2 bg-amber-500 text-slate-900 rounded-lg font-semibold text-sm hover:bg-amber-400 transition-colors"
              >
                Add Card to Start Feed
              </button>
            </div>
          )
        )}

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">Your Credit Cards ({creditCards.length}/10)</h2>
              {isNewCustomer && creditCards.length === 0 && (
                <span className="text-amber-200 text-sm">Add a card to unlock live transactions</span>
              )}
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 space-y-4">
              <div className="flex justify-between items-start gap-3 flex-wrap">
                <div>
                  <p className="text-white font-semibold">Add a new card</p>
                  <p className="text-slate-400 text-sm">Card holder name is auto-set to {user.name}. We just need a few details.</p>
                </div>
                <p className="text-slate-500 text-xs">Holder: {user.name}</p>
              </div>

              <div className="grid md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Last 4 digits</label>
                  <input
                    value={newCardLast4}
                    onChange={(e) => setNewCardLast4(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700/60 text-white"
                    placeholder="1234"
                    inputMode="numeric"
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Network</label>
                  <select
                    value={newCardNetwork}
                    onChange={(e) => setNewCardNetwork(e.target.value as CreditCard['network'])}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700/60 text-white"
                  >
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="rupay">RuPay</option>
                    <option value="amex">Amex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Expiry Month</label>
                  <input
                    type="number"
                    value={newExpiryMonth}
                    onChange={(e) => setNewExpiryMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700/60 text-white"
                    min={1}
                    max={12}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Expiry Year</label>
                  <input
                    type="number"
                    value={newExpiryYear}
                    onChange={(e) => setNewExpiryYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700/60 text-white"
                    min={new Date().getFullYear()}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Card Limit (₹)</label>
                  <input
                    type="number"
                    value={newCardLimit}
                    onChange={(e) => setNewCardLimit(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700/60 text-white"
                    min={50000}
                    step={50000}
                  />
                </div>
              </div>
              <button
                onClick={addCreditCard}
                className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
              >
                Save Card & Start Feed
              </button>
            </div>

            {creditCards.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-700/50 text-slate-200 flex items-center justify-center text-xl">💳</div>
                <p className="text-white font-semibold">No cards yet</p>
                <p className="text-slate-400 text-sm">Add your first card to start seeing transactions in real time.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {creditCards.map((card) => (
                  <div
                    key={card.id}
                    className={`bg-gradient-to-br ${getCardColor(card.network)} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden h-64 flex flex-col justify-between`}
                  >
                    {/* Card Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 right-4 text-5xl">💳</div>
                    </div>

                    {/* Card Content */}
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-12">
                        <div>
                          <p className="text-white/70 text-xs uppercase tracking-wider">Card Number</p>
                          <p className="text-white text-2xl font-bold tracking-widest">•••• •••• •••• {card.last4}</p>
                        </div>
                        <div className="text-4xl">{getCardIcon(card.network)}</div>
                      </div>

                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-white/70 text-xs uppercase">Card Holder</p>
                          <p className="text-white font-semibold">{card.holderName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/70 text-xs uppercase">Expires</p>
                          <p className="text-white font-semibold">{String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}</p>
                        </div>
                      </div>

                      {/* Credit Limit Bar */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-white/70 text-xs">Credit Limit Used</p>
                          <p className="text-white text-xs font-semibold">{Math.round((card.usedLimit / card.cardLimit) * 100)}%</p>
                        </div>
                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full"
                            style={{ width: `${(card.usedLimit / card.cardLimit) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Default Badge */}
                    {card.isDefault && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                        Default
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {creditCards.length === 10 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-amber-200 text-sm">⚠️ You have reached the maximum limit of 10 credit cards. Delete a card to add a new one.</p>
              </div>
            )}
          </div>
        )}

        {/* Expenditure Tab */}
        {activeTab === 'expenditure' && (
          <div className="space-y-6">
            {/* Spending Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-emerald-200 font-bold">All Time</h3>
                  <span className="text-3xl">📊</span>
                </div>
                <p className="text-white text-3xl font-bold">{formatINR(totalSpent)}</p>
                <p className="text-emerald-300 text-sm mt-2">Total spending since joining</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-blue-200 font-bold">This Month</h3>
                  <span className="text-3xl">📅</span>
                </div>
                <p className="text-white text-3xl font-bold">{formatINR(thisMonth)}</p>
                <p className="text-blue-300 text-sm mt-2">{thisMonthShare}% of total spending</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-purple-200 font-bold">This Week</h3>
                  <span className="text-3xl">📈</span>
                </div>
                <p className="text-white text-3xl font-bold">{formatINR(thisWeek)}</p>
                <p className="text-purple-300 text-sm mt-2">{approvedTransactions.filter(t => {
                  const txnDate = new Date(t.timestamp);
                  const now = new Date();
                  return now.getTime() - txnDate.getTime() < 7 * 24 * 60 * 60 * 1000;
                }).length} transactions</p>
              </div>
            </div>

            {/* Top Categories Breakdown */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-white font-bold text-lg mb-4">📊 Category-wise Breakdown</h3>
              <div className="space-y-4">
                {topCategories.map(([category, amount], idx) => {
                  const percentage = totalSpent ? (amount / totalSpent) * 100 : 0;
                  return (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400">{idx + 1}. {category}</span>
                        <div className="text-right">
                          <span className="text-white font-semibold">{formatINR(amount)}</span>
                          <span className="text-slate-400 text-sm ml-2">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-white font-bold text-lg mb-4">📈 Monthly Trends</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Jan', 'Feb', 'Mar', 'Apr'].map((month, idx) => {
                  const amount = (totalSpent * (0.8 + Math.random() * 0.4));
                  return (
                    <div key={month} className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <p className="text-slate-400 text-xs mb-1">{month}</p>
                      <p className="text-white font-bold text-sm">{formatINR(amount)}</p>
                      <div className="h-1.5 bg-slate-700 rounded mt-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                          style={{ width: `${Math.random() * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Appeals Tab */}
        {activeTab === 'appeals' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Flagged Transactions */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-white font-bold text-lg mb-4">Flagged Transactions ({flaggedTransactions.length})</h2>
              {flaggedTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-emerald-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-slate-400">No flagged transactions</p>
                  <p className="text-slate-500 text-sm">All your transactions are clear!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {flaggedTransactions.map((txn) => (
                    <div
                      key={txn.id}
                      onClick={() => {
                        setSelectedTxnForAppeal(txn.id);
                        setSelectedTxnDetails(txn);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedTxnForAppeal === txn.id
                          ? 'bg-amber-500/20 border-amber-500/50'
                          : 'bg-slate-900/50 border-slate-700/30 hover:border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-white font-medium">{txn.merchantName}</span>
                          <p className="text-slate-400 text-xs mt-1">{txn.location.city}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          txn.status === 'flagged'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {txn.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-emerald-400 font-semibold">{formatINR(txn.amount)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTxnDetails(txn);
                            setShowXAIModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 text-xs font-semibold"
                        >
                          Why flagged?
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Appeal Form */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-white font-bold text-lg mb-4">Submit Appeal</h2>
              <form onSubmit={handleAppealSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Select Transaction</label>
                  <select
                    value={selectedTxnForAppeal}
                    onChange={(e) => setSelectedTxnForAppeal(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">Choose a flagged transaction...</option>
                    {flaggedTransactions.map((txn) => (
                      <option key={txn.id} value={txn.id}>
                        {txn.merchantName} - {formatINR(txn.amount)} ({formatTimeAgo(txn.timestamp)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Appeal Reason</label>
                  <textarea
                    value={appealText}
                    onChange={(e) => setAppealText(e.target.value)}
                    placeholder="Explain why you believe this transaction was incorrectly flagged..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!selectedTxnForAppeal || !appealText}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Appeal
                </button>
              </form>
              <p className="text-slate-500 text-xs mt-4">
                Appeals are typically reviewed within 24-48 hours. You will receive an email notification once a decision is made.
              </p>
            </div>
          </div>
        )}

        {/* XAI Explanation Modal */}
        {showXAIModal && selectedTxnDetails && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-xl">🔍 Transaction Analysis</h2>
                <button
                  onClick={() => setShowXAIModal(false)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Transaction Details */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Merchant</p>
                      <p className="text-white font-semibold mt-1">{selectedTxnDetails.merchantName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Amount</p>
                      <p className="text-emerald-400 font-bold mt-1">{formatINR(selectedTxnDetails.amount)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Location</p>
                      <p className="text-white font-semibold mt-1">{selectedTxnDetails.location.city}, {selectedTxnDetails.location.state}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Card Type</p>
                      <p className="text-white font-semibold mt-1 capitalize">{selectedTxnDetails.cardType}</p>
                    </div>
                  </div>
                </div>

                {/* Decision & Score */}
                <div className={`rounded-xl p-4 border ${
                  selectedTxnDetails.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30' :
                  selectedTxnDetails.status === 'flagged' ? 'bg-amber-500/10 border-amber-500/30' :
                  'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-bold ${
                      selectedTxnDetails.status === 'approved' ? 'text-emerald-300' :
                      selectedTxnDetails.status === 'flagged' ? 'text-amber-300' :
                      'text-red-300'
                    }`}>
                      Decision: {selectedTxnDetails.status.toUpperCase()}
                    </h3>
                    <p className={`text-2xl font-bold ${
                      selectedTxnDetails.status === 'approved' ? 'text-emerald-400' :
                      selectedTxnDetails.status === 'flagged' ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                      Risk Score: {selectedTxnDetails.riskScore}%
                    </p>
                  </div>
                </div>

                {/* XAI Explanation */}
                {selectedTxnDetails.xaiExplanation && (
                  <div className="space-y-3">
                    <h3 className="text-white font-bold">Why was this transaction {selectedTxnDetails.status}?</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{selectedTxnDetails.xaiExplanation.summary}</p>

                    {/* Contributing Factors */}
                    <div>
                      <h4 className="text-slate-400 font-semibold text-sm mb-2">Contributing Factors:</h4>
                      <div className="space-y-2">
                        {selectedTxnDetails.xaiExplanation.factors.slice(0, 5).map((factor, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{factor.name}</span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  factor.impact === 'negative' ? 'bg-red-500/20 text-red-300' :
                                  factor.impact === 'positive' ? 'bg-emerald-500/20 text-emerald-300' :
                                  'bg-slate-500/20 text-slate-300'
                                }`}>
                                  {factor.impact.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-slate-400 text-xs mt-1">{factor.description}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-white font-semibold">{(factor.weight * 100).toFixed(1)}%</p>
                              <p className="text-slate-400 text-xs">Weight</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Model Info */}
                    <div className="bg-slate-900/50 p-3 rounded-lg text-xs text-slate-400">
                      <p>🤖 Model: {selectedTxnDetails.xaiExplanation.modelVersion}</p>
                      <p>📊 Confidence: {(selectedTxnDetails.xaiExplanation.confidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPortal;
