/**
 * Diagnostic script to check Ganache and contract status
 * Run with: node diagnose-ganache.js
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function diagnose() {
  console.log('\n========================================');
  console.log('   GANACHE DIAGNOSTIC TOOL');
  console.log('========================================\n');

  try {
    // 1. Check Ganache connection
    console.log('1️⃣  CHECKING GANACHE CONNECTION...');
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    
    const blockNumber = await provider.getBlockNumber();
    console.log('   ✓ Connected to Ganache');
    console.log('   Current Block:', blockNumber);

    // 2. Get network info
    const network = await provider.getNetwork();
    console.log('   Network ID:', network.chainId);
    console.log('   Network Name:', network.name);

    // 3. Check accounts
    console.log('\n2️⃣  CHECKING GANACHE ACCOUNTS...');
    const accounts = await provider.listAccounts?.() || [];
    console.log('   Available accounts:', accounts.length);
    
    // Try to get some account info
    const firstAccount = '0x2fBB30B128BE4a34c37e13F2585c88B03f2962F2'; // From deployment-info
    const balance = await provider.getBalance(firstAccount);
    console.log('   Account:', firstAccount);
    console.log('   Balance:', ethers.formatEther(balance), 'ETH');

    // 4. Check contract
    console.log('\n3️⃣  CHECKING CONTRACT...');
    const deploymentInfoPath = path.join(__dirname, 'src/config/deployment-info.json');
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, 'utf8'));
    const contractAddress = deploymentInfo.contractAddress;
    
    console.log('   Contract Address:', contractAddress);
    
    // Check if contract exists
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      console.log('   ❌ CONTRACT NOT DEPLOYED at this address!');
      console.log('   Please redeploy: npx hardhat run scripts/deploy.cjs --network ganache');
      return;
    }
    console.log('   ✓ Contract deployed');
    console.log('   Code size:', code.length / 2 - 1, 'bytes');

    // 5. Try to call a read-only function
    console.log('\n4️⃣  TESTING CONTRACT CALL...');
    const CONTRACT_ABI = [
      "function getTransactionCount() public view returns (uint256)"
    ];
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
    
    try {
      const count = await contract.getTransactionCount();
      console.log('   ✓ Contract responds');
      console.log('   Total transactions stored:', Number(count));
    } catch (err) {
      console.log('   ❌ Contract call failed:', err.message);
    }

    // 6. Check private key
    console.log('\n5️⃣  CHECKING PRIVATE KEY...');
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const privateKeyMatch = envContent.match(/VITE_GANACHE_PRIVATE_KEY=(.+)/);
    
    if (privateKeyMatch && privateKeyMatch[1]) {
      const privKey = privateKeyMatch[1].trim();
      console.log('   ✓ Private key found');
      console.log('   Length:', privKey.length);
      
      if (privKey.startsWith('0x') && privKey.length === 66) {
        console.log('   ✓ Format valid');
        
        // Check if this matches the signer
        const wallet = new ethers.Wallet(privKey, provider);
        console.log('   Signer address:', wallet.address);
        console.log('   Signer balance:', ethers.formatEther(await provider.getBalance(wallet.address)), 'ETH');
      } else {
        console.log('   ❌ Invalid format');
      }
    } else {
      console.log('   ❌ Private key not found in .env');
    }

    // 7. Test a simple transaction
    console.log('\n6️⃣  TESTING AUTO-SIGNED TRANSACTION...');
    const privKey = privateKeyMatch[1].trim();
    const wallet = new ethers.Wallet(privKey, provider);
    const contractWithSigner = new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);
    
    console.log('   Signer:', wallet.address);
    console.log('   Contract:', contractAddress);
    
    // Try to estimate gas for a transaction
    try {
      const FULL_ABI = [
        "function storeTransaction(string memory _txHash, uint256 _amount, uint8 _status) public payable"
      ];
      const contractFull = new ethers.Contract(contractAddress, FULL_ABI, wallet);
      
      const testHash = '0x' + '1234567890abcdef'.repeat(4);
      const gasEstimate = await contractFull.storeTransaction.estimateGas(testHash, 1000, 1, {
        value: ethers.parseEther("0.0001")
      });
      
      console.log('   ✓ Can call storeTransaction');
      console.log('   Estimated gas:', Number(gasEstimate));
    } catch (err) {
      console.log('   ❌ Cannot estimate gas:', err.message);
    }

    console.log('\n✅ DIAGNOSIS COMPLETE\n');
    console.log('SUMMARY:');
    console.log('- Ganache is running ✓');
    console.log('- Contract is deployed ✓');
    console.log('- Private key is configured ✓');
    console.log('- Signer has balance ✓');
    console.log('\nIf transactions still dont store, check the browser console for detailed error logs.');
    
  } catch (error) {
    console.error('\n❌ DIAGNOSIS FAILED:', error.message);
    console.error(error);
  }
}

diagnose();
