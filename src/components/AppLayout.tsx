import React, { useState, useEffect, useCallback } from 'react';
import { User, Transaction, AnalyticsData, BlockchainBlock } from '@/types/fraud';
import { generateTransactions, generateHash } from '@/utils/transactionGenerator';
import { generateInitialAnalytics, generateAnalyticsFromTransactions } from '@/utils/analyticsGenerator';
import { ethers } from 'ethers';
import { storeTransactionOnChain } from '@/utils/contractService';

// Components
import Header from './fraud/Header';
import HeroSection from './fraud/HeroSection';
import ThreeMachineArchitecture from './fraud/ThreeMachineArchitecture';
import AuthModal from './fraud/AuthModal';
import TransactionDetailModal from './fraud/TransactionDetailModal';
import AdminDashboard from './fraud/AdminDashboard';
import CustomerPortal from './fraud/CustomerPortal';
import Footer from './fraud/Footer';

const AppLayout: React.FC = () => {
  // User state
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Wallet state
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  // Transaction state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Blockchain state
  // Blockchain disabled
  const [blocks, setBlocks] = useState<BlockchainBlock[]>([]);
  const [currentBlockNumber, setCurrentBlockNumber] = useState(1000000);

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData>(generateInitialAnalytics());

  // Initialize with sample transactions
  // REMOVED initial transactions per user request - feed starts only on login

  // Initialize Web3 provider when wallet connects
  useEffect(() => {
    if (walletAddress && window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
      console.log('🔗 Web3 provider initialized');
    } else {
      setProvider(null);
    }
  }, [walletAddress]);

  // Remove the double-counting effect by removing this useEffect

  const handleNewTransaction = useCallback(async (transaction: Transaction, skipBlockchain: boolean = false) => {
    try {
      // 1. Generate temp hash first (will be replaced by real chain hash locally)
      //    Note: The contract stores this temp hash as 'payload', but we want UI to show Real Chain Hash.
      //    Actually, better: Send it to chain, get Real Chain Hash, use THAT as the ID.
      let txHash = generateHash();
      let txWithHash = { ...transaction, hash: txHash };

      // 2. Store on blockchain immediately (only if not paused/skipped)
      const hasAutoSigner = !!import.meta.env.VITE_GANACHE_PRIVATE_KEY;

      if (!skipBlockchain && ((walletAddress && provider) || hasAutoSigner)) {
        try {
          // Await the real hash
          const realChainHash = await storeTransactionOnChain(txWithHash, provider);

          if (realChainHash) {
            console.log("🔗 Synced UI Hash with Blockchain Hash:", realChainHash);
            txHash = realChainHash;
            txWithHash = { ...transaction, hash: realChainHash };
          }
        } catch (err) {
          console.warn('⚠️ Blockchain storage skipped:', err);
        }
      }

      // 3. Update UI state with the final hash
      setTransactions(prev => [txWithHash, ...prev]);

      // Batch analytics updates (update every 3 transactions to reduce re-renders)
      if (Math.random() < 0.33) {
        setAnalytics(prev => ({
          ...prev,
          totalTransactions: prev.totalTransactions + 1,
          totalVolume: prev.totalVolume + transaction.amount,
          approvedCount: prev.approvedCount + (transaction.status === 'approved' ? 1 : 0),
          flaggedCount: prev.flaggedCount + (transaction.status === 'flagged' ? 1 : 0),
          blockedCount: prev.blockedCount + (transaction.status === 'blocked' ? 1 : 0),
        }));
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
    }
  }, [walletAddress, provider]);

  // Handle transaction click
  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  // Handle wallet connect and load cloud data
  const handleWalletConnect = async (address: string, balance: string) => {
    setWalletAddress(address);
    setWalletBalance(balance);

    // Cloud sync removed for performance - all data is generated in real-time
  };

  // Handle login
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setShowAuthModal(false);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
  };

  // Render based on user role
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header
          user={user}
          onLoginClick={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          walletAddress={walletAddress}
          walletBalance={walletBalance}
          onWalletConnect={handleWalletConnect}
        />
        <AdminDashboard
          user={user}
          transactions={transactions}
          analytics={analytics}
          blocks={blocks}
          onTransactionClick={handleTransactionClick}
          onNewTransaction={handleNewTransaction}
          walletAddress={walletAddress}
        />
        <TransactionDetailModal
          transaction={selectedTransaction}
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
        />
        <Footer />
      </div>
    );
  }

  if (user?.role === 'customer') {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header
          user={user}
          onLoginClick={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          walletAddress={walletAddress}
          walletBalance={walletBalance}
          onWalletConnect={handleWalletConnect}
        />
        <CustomerPortal
          user={user}
          transactions={transactions}
          onTransactionClick={handleTransactionClick}
          walletAddress={walletAddress}
          walletBalance={walletBalance}
        />
        <TransactionDetailModal
          transaction={selectedTransaction}
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
        />
        <Footer />
      </div>
    );
  }

  // Landing page for non-logged in users
  return (
    <div className="min-h-screen bg-slate-900">
      <Header
        user={user}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        walletAddress={walletAddress}
        walletBalance={walletBalance}
        onWalletConnect={handleWalletConnect}
      />

      {/* Hero Section */}
      <HeroSection
        totalTransactions={analytics.totalTransactions}
        fraudPrevented={analytics.flaggedCount + analytics.blockedCount}
        onGetStarted={() => setShowAuthModal(true)}
      />

      {/* Three Machine Architecture */}
      <ThreeMachineArchitecture />

      {/* Features Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Choose FraudGuard India?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with blockchain technology to provide
              unparalleled fraud protection for the Indian market.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-cyan-500/30 transition-colors">
              <div className="p-3 bg-cyan-500/20 rounded-xl w-fit mb-4">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Real-Time Detection</h3>
              <p className="text-slate-400">
                Process transactions in under 350ms with our optimized 3-machine pipeline.
                Instant fraud detection without compromising user experience.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-purple-500/30 transition-colors">
              <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Explainable AI</h3>
              <p className="text-slate-400">
                Understand every decision with LIME/SHAP-based explanations.
                Full transparency on why transactions are approved, flagged, or blocked.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-emerald-500/30 transition-colors">
              <div className="p-3 bg-emerald-500/20 rounded-xl w-fit mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Blockchain Verified</h3>
              <p className="text-slate-400">
                Every transaction is hashed and recorded on the blockchain via MetaMask.
                Immutable audit trails for complete regulatory compliance.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-orange-500/30 transition-colors">
              <div className="p-3 bg-orange-500/20 rounded-xl w-fit mb-4">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">India-Centric</h3>
              <p className="text-slate-400">
                Optimized for Indian payment patterns, merchants, and geographic data.
                Full RBI compliance and support for all major Indian card networks.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-pink-500/30 transition-colors">
              <div className="p-3 bg-pink-500/20 rounded-xl w-fit mb-4">
                <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Advanced Analytics</h3>
              <p className="text-slate-400">
                Real-time dashboards with geographic heat maps, hourly trends,
                and comprehensive fraud pattern analysis across all Indian states.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-amber-500/30 transition-colors">
              <div className="p-3 bg-amber-500/20 rounded-xl w-fit mb-4">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Enterprise Security</h3>
              <p className="text-slate-400">
                ISO 27001 certified with PCI DSS compliance. 256-bit encryption
                and secure MetaMask integration for all blockchain operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-900/50 to-purple-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Protect Your Transactions?
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            Join thousands of businesses across India using FraudGuard for real-time fraud protection.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/25"
          >
            Get Started Free
          </button>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />

      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
      />
    </div>
  );
};

export default AppLayout;
