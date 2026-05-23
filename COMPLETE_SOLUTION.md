# Complete Solution: Deploy & Connect Your Contract

## Your Contract Address
```
0xdD2FD4581271e230360230F9337D5c0430Bf44C0
```

## Step-by-Step Setup

### Step 1: Start Hardhat Node (Terminal 1)
```bash
cd c:\Users\ayush\OneDrive\Desktop\Blockchain\blockchain-realtime-fraud
npx hardhat --config hardhat.config.cjs node
```

**Wait for output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545
```

### Step 2: Deploy Contract (Terminal 2 - NEW)
```bash
cd c:\Users\ayush\OneDrive\Desktop\Blockchain\blockchain-realtime-fraud
npx hardhat --config hardhat.config.cjs run scripts/deploy.js --network localhost
```

**Expected output:**
```
🚀 Deploying TransactionRegistry contract...
✅ Contract deployed to: 0xdD2FD4581271e230360230F9337D5c0430Bf44C0
```

### Step 3: Start React App (Terminal 3 - NEW)
```bash
cd c:\Users\ayush\OneDrive\Desktop\Blockchain\blockchain-realtime-fraud
npm run dev
```

**Wait for:**
```
➜  Local:   http://localhost:5173/
```

### Step 4: Configure MetaMask
1. **Open MetaMask**
2. **Add Network:**
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
3. **Switch to Hardhat Local network**
4. **Import Account 4** (the one that deployed the contract):
   - Private Key: `0x7c0c4f7f8fc1c5f5c5b5a5959585857565554535251504f4e4d4c4b4a494847`
   - This account has the contract deployed to it

### Step 5: Test in Browser
1. **Go to:** `http://localhost:5173/`
2. **Click "Connect MetaMask"**
   - Select the account that has the contract (Account 4)
   - Confirm connection
3. **Sign In**
4. **Watch transactions appear** in the Live Feed

### Step 6: Verify on Blockchain

**In browser console (F12):**
```javascript
// Check contract address
getContractAddress()
// Should output: 0xdD2FD4581271e230360230F9337D5c0430Bf44C0

// Check if transactions are stored
// Look at Hardhat terminal - you should see:
// - eth_sendTransaction
// - ✓ Block #1 mined
```

## If You Get "Calling an account which is not a contract" Error

This means the contract wasn't found at that address. **Do this:**

1. **Clear everything:**
```javascript
// In browser console (F12)
localStorage.clear()
location.reload()
```

2. **Restart Hardhat Node** (Terminal 1):
   - Press Ctrl+C to stop
   - Run: `npx hardhat --config hardhat.config.cjs node`

3. **Redeploy contract** (Terminal 2):
   - Run: `npx hardhat --config hardhat.config.cjs run scripts/deploy.js --network localhost`
   - Copy the new contract address shown

4. **Update app** with new address:
   ```javascript
   // In browser console
   setContractAddress('0xNEW_ADDRESS_HERE')
   location.reload()
   ```

## Architecture

```
User connects wallet (Account 4 with 10,000 ETH)
           ↓
    MetaMask confirms
           ↓
    Signs into app
           ↓
    Transactions generated (every 3-5 seconds)
           ↓
    Each transaction stored on blockchain
           ↓
    Live feed updates
           ↓
    Hardhat node mines blocks
           ↓
    Blockchain explorer shows transactions
```

## Key Files
- `hardhat.config.cjs` - Hardhat configuration
- `scripts/deploy.js` - Deployment script
- `contracts/TransactionRegistry.sol` - Smart contract
- `src/utils/contractService.ts` - Web3 service
- `src/components/AppLayout.tsx` - Main app component

## Ports Used
- **5173** - React app (http://localhost:5173)
- **8545** - Hardhat node (http://127.0.0.1:8545)

## Console Helper Functions
```javascript
// Set contract address if deployment changed
setContractAddress('0x...')

// Get current contract address
getContractAddress()

// Check localStorage
localStorage.getItem('contractAddress')
```

## Troubleshooting

### Port 8545 already in use
```bash
# Kill the process
netstat -ano | findstr :8545
taskkill /PID <PID> /F
```

### npm run dev fails
```bash
# Clear and reinstall
rm -r node_modules
npm install
npm run dev
```

### MetaMask shows 0 balance
- Make sure you're on "Hardhat Local" network
- Imported the correct account with the private key
- Account should show 10,000 ETH

### No transactions appearing
1. Check MetaMask is connected (shows address in header)
2. Check browser console (F12) for errors
3. Verify Hardhat node is still running (Terminal 1)

## Success Indicators

✅ Hardhat node running and shows blocks being mined
✅ Contract deployed at 0xdD2FD4581271e230360230F9337D5c0430Bf44C0
✅ React app loads at http://localhost:5173
✅ MetaMask shows wallet address and 10,000 ETH balance
✅ Transactions appear in live feed every 3-5 seconds
✅ Hardhat terminal shows "✓ Block #N mined" messages
✅ Console shows "✅ Contract address auto-set to: 0xdD2..."

Good luck! 🚀
