import React, { useState, useEffect } from 'react';

interface MetaMaskConnectProps {
  onConnect?: (address: string, balance: string) => void;
  compact?: boolean;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

const MetaMaskConnect: React.FC<MetaMaskConnectProps> = ({ onConnect, compact = false }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const [chainId, setChainId] = useState<string>('');

  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAddress('');
      setBalance('0');
    } else {
      setAddress(accounts[0]);
      getBalance(accounts[0]);
    }
  };

  const handleChainChanged = (chainId: string) => {
    setChainId(chainId);
    window.location.reload();
  };

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          await getBalance(accounts[0]);
          await getChainId();
          onConnect?.(accounts[0], balance);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    }
  };

  const getBalance = async (addr: string) => {
    if (window.ethereum) {
      try {
        const balanceHex = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [addr, 'latest'],
        });
        const balanceWei = parseInt(balanceHex, 16);
        const balanceEth = (balanceWei / 1e18).toFixed(4);
        setBalance(balanceEth);
      } catch (err) {
        console.error('Error getting balance:', err);
      }
    }
  };

  const getChainId = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(chainId);
      } catch (err) {
        console.error('Error getting chain ID:', err);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        await getBalance(accounts[0]);
        await getChainId();
        onConnect?.(accounts[0], balance);
      }
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Connection rejected. Please approve the connection request.');
      } else {
        setError('Failed to connect. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
    setBalance('0');
  };

  const getNetworkName = (chainId: string): string => {
    const networks: Record<string, string> = {
      '0x1': 'Ethereum Mainnet',
      '0x89': 'Polygon',
      '0x13881': 'Mumbai Testnet',
      '0x5': 'Goerli Testnet',
      '0xaa36a7': 'Sepolia Testnet',
    };
    return networks[chainId] || 'Unknown Network';
  };

  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isConnected ? (
          <button
            onClick={disconnectWallet}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg text-white text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>{formatAddress(address)}</span>
            <span className="text-orange-200">|</span>
            <span>{balance} ETH</span>
          </button>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg text-white text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 35 33" fill="none">
                  <path d="M32.9582 1L19.8241 10.7183L22.2665 4.99099L32.9582 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25"/>
                  <path d="M2.66296 1L15.6886 10.809L13.3541 4.99098L2.66296 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
                  <path d="M28.2295 23.5334L24.7346 28.872L32.2175 30.9323L34.3611 23.6501L28.2295 23.5334Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
                  <path d="M1.27271 23.6501L3.40325 30.9323L10.8732 28.872L7.39123 23.5334L1.27271 23.6501Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
                </svg>
                <span>Connect Wallet</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/20 rounded-xl">
          <svg className="w-6 h-6 text-orange-400" viewBox="0 0 35 33" fill="currentColor">
            <path d="M32.9582 1L19.8241 10.7183L22.2665 4.99099L32.9582 1Z"/>
            <path d="M2.66296 1L15.6886 10.809L13.3541 4.99098L2.66296 1Z"/>
            <path d="M28.2295 23.5334L24.7346 28.872L32.2175 30.9323L34.3611 23.6501L28.2295 23.5334Z"/>
            <path d="M1.27271 23.6501L3.40325 30.9323L10.8732 28.872L7.39123 23.5334L1.27271 23.6501Z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold">MetaMask Wallet</h3>
          <p className="text-slate-400 text-sm">Blockchain Transaction Recording</p>
        </div>
      </div>

      {isConnected ? (
        <div className="space-y-4">
          <div className="bg-slate-900/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Connected</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Network</span>
              <span className="text-white text-sm font-medium">{getNetworkName(chainId)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Address</span>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-mono">{formatAddress(address)}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(address)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Balance</span>
              <span className="text-white text-sm font-semibold">{balance} ETH</span>
            </div>
          </div>

          <button
            onClick={disconnectWallet}
            className="w-full py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            Connect your MetaMask wallet to record transactions on the blockchain and enable immutable audit trails.
          </p>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 35 33" fill="currentColor">
                  <path d="M32.9582 1L19.8241 10.7183L22.2665 4.99099L32.9582 1Z"/>
                  <path d="M2.66296 1L15.6886 10.809L13.3541 4.99098L2.66296 1Z"/>
                </svg>
                <span>Connect MetaMask</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Recommended: Use Polygon Mumbai Testnet for testing</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaMaskConnect;
