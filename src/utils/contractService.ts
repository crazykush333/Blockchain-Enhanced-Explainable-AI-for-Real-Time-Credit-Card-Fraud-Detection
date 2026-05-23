import { ethers } from 'ethers';
import { Transaction } from '@/types/fraud';

// Contract ABI (Application Binary Interface)
const CONTRACT_ABI = [
  "function storeTransaction(string memory _txHash, uint256 _amount, uint8 _status) public",
  "function storeBatchTransactions(string[] memory _txHashes, uint256[] memory _amounts, uint8[] memory _statuses) public",
  "function getTransaction(string memory _txHash) public view returns (string memory transactionHash, uint256 amount, uint8 status, uint256 timestamp, address submittedBy)",
  "function getTransactionCount() public view returns (uint256)",
  "event TransactionStored(string indexed transactionHash, uint256 amount, uint8 status, uint256 timestamp, address indexed submittedBy)"
];

// Default Hardhat contract address (your deployed contract)
import deploymentInfo from '@/config/deployment-info.json';
const DEFAULT_CONTRACT_ADDRESS = deploymentInfo.contractAddress || '0xdD2FD4581271e230360230F9337D5c0430Bf44C0';

// Get contract address from localStorage or use default
let CONTRACT_ADDRESS = (() => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('contractAddress');
    // If deployment info has a new address that differs from stored, favor the deployment info (dev convenience)
    if (deploymentInfo.contractAddress && deploymentInfo.contractAddress !== stored) {
      console.log('🔄 New deployment detected, updating address to:', deploymentInfo.contractAddress);
      localStorage.setItem('contractAddress', deploymentInfo.contractAddress);
      return deploymentInfo.contractAddress;
    }

    if (stored) {
      return stored;
    }

    if (deploymentInfo.contractAddress) {
      localStorage.setItem('contractAddress', deploymentInfo.contractAddress);
      return deploymentInfo.contractAddress;
    }
  }
  return DEFAULT_CONTRACT_ADDRESS;
})();

export const setContractAddress = (address: string) => {
  if (!address || !address.startsWith('0x')) {
    console.error('❌ Invalid contract address. Must start with 0x');
    return false;
  }
  CONTRACT_ADDRESS = address;
  localStorage.setItem('contractAddress', address);
  console.log('✅ Contract address updated to:', address);
  return true;
};

export const getContractAddress = () => {
  console.log('📋 Current contract address:', CONTRACT_ADDRESS);
  return CONTRACT_ADDRESS;
};


// Status mapping
const getStatusCode = (status: string): number => {
  switch (status) {
    case 'pending': return 0;
    case 'approved': return 1;
    case 'flagged': return 2;
    case 'blocked': return 3;
    default: return 0;
  }
};

/**
 * Store a single transaction on blockchain (non-blocking)
 */
export const storeTransactionOnChain = async (
  transaction: Transaction,
  provider: ethers.BrowserProvider | null
): Promise<string | null> => {
  try {
    const devPrivateKey = import.meta.env.VITE_GANACHE_PRIVATE_KEY;
    console.log("🔍 Debug: VITE_GANACHE_PRIVATE_KEY is", devPrivateKey ? "Preset (Length: " + devPrivateKey.length + ")" : "MISSING/UNDEFINED");

    if (!CONTRACT_ADDRESS) {
      console.error('❌ Contract address not available. Using: setContractAddress("0x...")');
      return null;
    }

    let contract;

    if (devPrivateKey) {
      // 🤖 Auto-Signer Mode
      // Connect directly to local Ganache RPC
      const rpcUrl = import.meta.env.VITE_GANACHE_RPC || "http://127.0.0.1:7545";
      const localProvider = new ethers.JsonRpcProvider(rpcUrl);
      const bgSigner = new ethers.Wallet(devPrivateKey, localProvider);
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, bgSigner);
      // console.log("🤖 Auto-signing transaction...");
    } else {
      if (!provider) {
        console.warn("⚠️ No provider and no Auto-Signer key. Cannot store transaction.");
        return null;
      }
      // 🦊 MetaMask Mode
      console.log("ℹ️ Auto-Signer NOT active. Add VITE_GANACHE_PRIVATE_KEY to .env to enable.");
      const signer = await provider.getSigner();
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }

    // Convert amount to paise (smallest unit)
    const amountInPaise = Math.floor(transaction.amount * 100);
    const statusCode = getStatusCode(transaction.status);

    // Send transaction (non-blocking - don't wait for confirmation)
    const tx = await contract.storeTransaction(
      transaction.hash,
      amountInPaise,
      statusCode,
      { value: ethers.parseEther("0.0001") } // Simulate payment (deducts from wallet)
    );

    // Log transaction hash but don't wait
    console.log('📝 Blockchain TX submitted:', tx.hash);

    // Optional: wait for confirmation in background
    tx.wait().then((receipt: any) => {
      console.log('✅ Transaction confirmed on blockchain:', receipt.transactionHash);
    }).catch((error: any) => {
      console.error('❌ Blockchain confirmation failed:', error);
    });

    return tx.hash;
  } catch (error) {
    console.error('Error storing transaction on chain:', error);
    return null;
  }
};

/**
 * Store multiple transactions in one call (gas efficient)
 */
export const storeBatchTransactionsOnChain = async (
  transactions: Transaction[],
  provider: ethers.BrowserProvider
): Promise<boolean> => {
  try {
    if (!CONTRACT_ADDRESS || transactions.length === 0) {
      return false;
    }

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const txHashes = transactions.map(t => t.hash);
    const amounts = transactions.map(t => Math.floor(t.amount * 100));
    const statuses = transactions.map(t => getStatusCode(t.status));

    const totalValue = ethers.parseEther((transactions.length * 0.0001).toString());
    const tx = await contract.storeBatchTransactions(txHashes, amounts, statuses, { value: totalValue });
    console.log('📦 Batch TX submitted:', tx.hash);

    tx.wait().then((receipt: any) => {
      console.log(`✅ Batch of ${transactions.length} transactions confirmed`);
    }).catch(console.error);

    return true;
  } catch (error) {
    console.error('Error storing batch on chain:', error);
    return false;
  }
};

/**
 * Get transaction from blockchain
 */
export const getTransactionFromChain = async (
  txHash: string,
  provider: ethers.BrowserProvider
): Promise<any> => {
  try {
    if (!CONTRACT_ADDRESS) return null;

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const result = await contract.getTransaction(txHash);

    return {
      transactionHash: result[0],
      amount: Number(result[1]) / 100, // Convert from paise to rupees
      status: ['pending', 'approved', 'flagged', 'blocked'][result[2]],
      timestamp: new Date(Number(result[3]) * 1000),
      submittedBy: result[4]
    };
  } catch (error) {
    console.error('Error fetching transaction from chain:', error);
    return null;
  }
};

/**
 * Get total transactions stored on blockchain
 */
export const getChainTransactionCount = async (
  provider: ethers.BrowserProvider
): Promise<number> => {
  try {
    if (!CONTRACT_ADDRESS) return 0;

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const count = await contract.getTransactionCount();
    return Number(count);
  } catch (error) {
    console.error('Error getting transaction count:', error);
    return 0;
  }
};
