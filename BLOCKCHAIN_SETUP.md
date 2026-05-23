# Blockchain Setup & Deployment Guide

## 🎯 Overview

This guide will help you deploy the TransactionRegistry smart contract and connect it to your fraud detection platform. Transactions will be stored on-chain with their hashes, amounts, and statuses.

## 📋 Prerequisites

- Node.js v16+ installed
- MetaMask browser extension installed
- Basic understanding of blockchain concepts

## 🚀 Quick Start (Recommended: Hardhat)

### Option 1: Hardhat Network (Easiest - No external tools)

1. **Install Hardhat dependencies:**
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```

2. **Start a local Hardhat node:**
   ```bash
   npx hardhat node
   ```
   This will:
   - Start a local blockchain at `http://127.0.0.1:8545`
   - Display 20 test accounts with private keys
   - Show real-time transaction logs

3. **Deploy the smart contract** (in a new terminal):
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
   
4. **Copy the contract address** from the output:
   ```
   ✅ TransactionRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
   ```

5. **Configure MetaMask:**
   - Open MetaMask → Networks → Add Network
   - **Network Name:** Hardhat Local
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** ETH
   - Click "Save"

6. **Import a test account to MetaMask:**
   - Copy one of the private keys shown when you started `npx hardhat node`
   - MetaMask → Account Menu → Import Account
   - Paste the private key
   - You'll have ~10,000 ETH for testing

7. **Set contract address in your app:**
   - Open browser console on your app
   - Run: `setContractAddress('YOUR_CONTRACT_ADDRESS_HERE')`
   - Or check `deployment-info.json` file for the address

8. **Start using the app:**
   - Connect MetaMask wallet (should connect to Hardhat Local network)
   - Sign in after wallet is connected
   - Transactions will automatically be stored on-chain!

---

### Option 2: Ganache (GUI Option)

1. **Download Ganache:**
   - Visit: https://trufflesuite.com/ganache/
   - Download and install Ganache GUI

2. **Start Ganache:**
   - Open Ganache
   - Click "Quickstart Ethereum"
   - Note the RPC Server URL (usually `http://127.0.0.1:7545`)
   - Note the Network ID (usually `5777` or `1337`)

3. **Deploy the contract:**
   ```bash
   npx hardhat run scripts/deploy.js --network ganache
   ```
   
   If you get an error, update `hardhat.config.cjs` with your Ganache port:
   ```javascript
   ganache: {
     url: "http://127.0.0.1:7545",  // Your Ganache RPC port
     chainId: 1337                   // Your Ganache Network ID
   }
   ```

4. **Configure MetaMask:**
   - Add Network with Ganache RPC URL
   - Chain ID: 1337 (or your Ganache Network ID)

5. **Import Ganache account:**
   - In Ganache, click the key icon next to any account
   - Copy the private key
   - Import it to MetaMask

6. **Set contract address** (see step 7 in Hardhat instructions)

---

## 🔧 Advanced: Deploy to a Testnet (Sepolia, Goerli, etc.)

**Warning:** Requires test ETH from faucets. Not recommended for beginners.

1. **Get test ETH:**
   - Sepolia Faucet: https://sepoliafaucet.com/
   - Goerli Faucet: https://goerlifaucet.com/

2. **Update hardhat.config.js:**
   ```javascript
   sepolia: {
     url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
     accounts: ["YOUR_PRIVATE_KEY_HERE"]
   }
   ```

3. **Deploy:**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

---

## 🧪 Testing the Integration

### 1. Check Contract Deployment
```bash
# In your project directory
npx hardhat console --network localhost
```

Then in the console:
```javascript
const contract = await ethers.getContractAt("TransactionRegistry", "YOUR_CONTRACT_ADDRESS");
const count = await contract.getTransactionCount();
console.log("Transactions stored:", count.toString());
```

### 2. Monitor Blockchain Activity

When running Hardhat node, you'll see real-time logs like:
```
eth_sendTransaction
  Contract deployment: TransactionRegistry
  From: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
  Value: 0 ETH
  Gas: 2000000

Transaction: 0x123abc...
Block: #1
Gas used: 645321
```

### 3. Verify in Browser Console

Open your app and check the console:
```
🔗 Web3 provider initialized
📝 Blockchain TX submitted: 0x123abc...
✅ Transaction confirmed on chain
```

---

## 📊 Contract Functions

Your `TransactionRegistry.sol` supports:

### Store Single Transaction
```solidity
storeTransaction(
  string memory _txHash,      // "tx_abc123..."
  uint256 _amount,            // Amount in paise (₹100.50 = 10050)
  uint8 _status               // 0=pending, 1=approved, 2=flagged, 3=blocked
)
```

### Store Batch (Gas Efficient)
```solidity
storeBatchTransactions(
  string[] memory _txHashes,
  uint256[] memory _amounts,
  uint8[] memory _statuses
)
```

### Read Transaction
```solidity
getTransaction(uint256 _index) returns (
  string memory txHash,
  uint256 amount,
  uint8 status,
  uint256 timestamp,
  address submittedBy
)
```

### Get Total Count
```solidity
getTransactionCount() returns (uint256)
```

---

## 🐛 Troubleshooting

### "Nonce too high" error
- Reset MetaMask: Settings → Advanced → Reset Account

### "Insufficient funds" error
- Make sure you imported a Hardhat/Ganache account with test ETH

### "Contract not deployed" error
- Verify contract address with: `cat deployment-info.json`
- Redeploy if needed: `npx hardhat run scripts/deploy.js --network localhost`

### MetaMask not connecting
- Check network matches (localhost:8545 for Hardhat)
- Refresh page after switching networks

### Transactions not storing
- Open browser console and check for errors
- Verify contract address is set: Check localStorage in DevTools
- Make sure wallet is connected before generating transactions

---

## 📝 Useful Commands

```bash
# Start local blockchain
npx hardhat node

# Deploy contract
npx hardhat run scripts/deploy.js --network localhost

# Compile contracts (if you make changes)
npx hardhat compile

# Clean and recompile
npx hardhat clean && npx hardhat compile

# Open Hardhat console
npx hardhat console --network localhost

# Run tests (if you create test files)
npx hardhat test
```

---

## 🎉 Success Checklist

- [ ] Hardhat node running at localhost:8545
- [ ] Contract deployed (address in `deployment-info.json`)
- [ ] MetaMask connected to Hardhat network
- [ ] Test account imported with ETH balance
- [ ] Contract address set in app
- [ ] Wallet connected in app
- [ ] Can sign in after wallet connection
- [ ] Transactions appear in feed
- [ ] Console shows "Transaction confirmed on chain"
- [ ] Hardhat node shows transaction logs

---

## 💡 Tips

1. **Keep Hardhat node running** - If you close it, you'll need to redeploy the contract
2. **Use the same account** - Import one Hardhat account and stick with it
3. **Check console logs** - Most issues are visible in browser console
4. **Reset MetaMask** if you restart Hardhat node (accounts reset)
5. **Fire-and-forget** - Blockchain writes are async and won't slow down UI

---

## 📚 Additional Resources

- Hardhat Documentation: https://hardhat.org/docs
- Ganache Documentation: https://trufflesuite.com/docs/ganache/
- MetaMask Guide: https://metamask.io/faqs/
- Ethers.js Documentation: https://docs.ethers.org/

---

## 🔒 Security Notes

**For Development Only:**
- Never use development private keys in production
- Never commit private keys to Git
- These are test networks with no real value
- Contract is unaudited - for educational purposes

**For Production:**
- Use proper key management (hardware wallets, Vault, etc.)
- Get smart contract audited
- Use testnet first, then mainnet
- Implement proper access controls
- Add rate limiting and gas optimization
