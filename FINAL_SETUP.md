# Final Setup & Testing Guide

## What's Fixed ✅
- **Auto-initialize contract address**: No longer need to manually run `setContractAddress()` in console
- **Default Hardhat address**: Uses `0x5FbDB2315678afecb367f032d93F642f64180aa3` automatically
- **Better error messages**: Console shows clear status about contract address

## Complete Workflow

### Step 1: Start Hardhat Local Blockchain
```bash
# Terminal 1 - Start Hardhat node
npx hardhat node
```
Expected output:
```
started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

### Step 2: Deploy Smart Contract
```bash
# Terminal 2 - Deploy contract
npx hardhat run scripts/deploy.js --network localhost
```
Expected output:
```
TransactionRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Step 3: Start React App
```bash
# Terminal 3 - Start React app
npm run dev
```

### Step 4: Connect MetaMask to Hardhat
1. **Open MetaMask browser extension**
2. **Switch to "Hardhat Local" network** (or add if not present)
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
3. **Import Test Account** with this private key:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb476c6b8d6c1f02960247590a93
   ```
   - This account has 10,000 ETH (Hardhat default)
   - MetaMask shows: `Account 1` with balance

### Step 5: Complete App Workflow
1. **Click "Connect MetaMask"** button in header
   - Wait for wallet to connect
   - Should show your wallet address and balance
2. **Click "Sign In"** button
   - Should allow sign-in (now that wallet is connected)
   - No warning about missing wallet anymore
3. **Watch live transaction feed**
   - New transactions appear every 3-5 seconds
   - Each shows: hash, amount (₹), status, timestamp

### Step 6: Verify Blockchain Storage

#### Method 1: Browser Console (Easiest)
```javascript
// Check current contract address
getContractAddress()
// Output: 📋 Current contract address: 0x5FbDB2315678afecb367f032d93F642f64180aa3

// If you need to update address to different one:
setContractAddress('0xNEW_ADDRESS_HERE')
// Output: ✅ Contract address updated to: 0x...
```

#### Method 2: Hardhat Terminal
Look at Terminal 1 (Hardhat node) and you should see:
```
eth_call (from your wallet address)
eth_blockNumber
eth_sendTransaction
  ✓ Block #1234 mined
  ✓ Miner reward: 10 ETH
```

#### Method 3: Check LocalStorage
```javascript
// In browser console
localStorage.getItem('contractAddress')
// Output: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
```

## Troubleshooting

### ❌ "Contract not deployed yet" still appears
**Solution**: The contract address defaults to Hardhat's standard address. If you deployed to a different address:
1. Copy the new address from deployment output
2. Run in browser console: `setContractAddress('0xYOUR_ADDRESS')`
3. Hard refresh the page (Ctrl+F5)

### ❌ MetaMask shows wrong balance
**Solution**: 
1. Make sure you're on "Hardhat Local" network
2. Imported the correct private key (ending in a93)
3. Clear MetaMask cache: Settings → Advanced → Clear Activity Tab Data

### ❌ Transactions not appearing
**Solution**:
1. Check that wallet is connected (shows address and balance in header)
2. Check browser console for errors (F12 → Console tab)
3. Make sure Hardhat node is running (Terminal 1 still active)

### ❌ Hardhat "port already in use"
**Solution**:
```bash
# Kill process on port 8545
# Windows:
netstat -ano | findstr :8545
taskkill /PID <PID> /F

# Then restart: npx hardhat node
```

## Console Log Examples

### When app loads successfully:
```
✅ Contract address auto-set to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### When you connect wallet:
```
🔗 Wallet connected: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
💰 Balance: 10000 ETH
```

### When transactions store on chain:
```
💾 Storing transaction on chain: HASH_12345
✅ Transaction stored successfully
```

## Files Modified in This Update
- `src/utils/contractService.ts` - Auto-initialize with default address
- `contract-helper.js` - Improved helper functions (already created)
- `index.html` - Script reference for helpers (already added)

## Next Steps After Testing
1. ✅ Verify all transactions appear in live feed
2. ✅ Check Hardhat terminal for block creation
3. ✅ Confirm localStorage has contract address
4. ✅ Test MetaMask connection and sign-in flow
5. 🔄 Try creating new transactions and seeing them on chain
6. 🔄 Monitor console for any errors

## Key Features Now Working
- ✅ MetaMask wallet connection required before sign-in
- ✅ Automatic contract address initialization (no manual setup needed)
- ✅ Non-blocking transaction storage on blockchain
- ✅ Live transaction feed with real-time updates
- ✅ ₹ (Indian Rupees) formatting throughout app
- ✅ Transaction status tracking (pending, approved, flagged, blocked)
- ✅ Browser console helper functions for debugging
- ✅ Hardhat local blockchain fully configured

Good luck! 🚀
