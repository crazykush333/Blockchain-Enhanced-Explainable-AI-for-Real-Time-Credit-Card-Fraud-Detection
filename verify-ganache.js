/**
 * Script to verify transactions stored in Ganache
 * Run with: node verify-ganache.js <transaction_hash>
 */

const { ethers } = require('ethers');

// Your contract details
const CONTRACT_ADDRESS = '0xdD2FD4581271e230360230F9337D5c0430Bf44C0'; // Replace if needed
const CONTRACT_ABI = [
  "function getTransaction(string memory _txHash) public view returns (string memory transactionHash, uint256 amount, uint8 status, uint256 timestamp, address submittedBy)",
  "function getTransactionCount() public view returns (uint256)"
];

async function verifyTransaction(txHash) {
  try {
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    console.log('\n🔍 Checking Ganache for transaction:', txHash);
    console.log('📍 Contract address:', CONTRACT_ADDRESS);

    const result = await contract.getTransaction(txHash);
    
    if (result.transactionHash === '') {
      console.log('❌ Transaction NOT found in Ganache');
      return;
    }

    console.log('\n✅ Transaction FOUND in Ganache!\n');
    console.log('   Hash:', result.transactionHash);
    console.log('   Amount:', ethers.toBeHex(result.amount), 'wei =', Number(result.amount) / 100, 'rupees');
    console.log('   Status:', ['pending', 'approved', 'flagged', 'blocked'][result.status]);
    console.log('   Timestamp:', new Date(Number(result.timestamp) * 1000).toLocaleString());
    console.log('   Submitted by:', result.submittedBy);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function getTotalCount() {
  try {
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    const count = await contract.getTransactionCount();
    console.log('\n📊 Total transactions in Ganache:', Number(count));
  } catch (error) {
    console.error('Error getting count:', error.message);
  }
}

// Main
const txHash = process.argv[2];

if (!txHash) {
  console.log('Usage: node verify-ganache.js <transaction_hash>');
  console.log('Example: node verify-ganache.js 0x1234567890abcdef...');
  getTotalCount();
} else {
  verifyTransaction(txHash);
}
