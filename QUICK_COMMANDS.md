# Quick Commands to Run

Run these commands in order in separate terminals:

## Terminal 1: Start Hardhat Node
```bash
cd c:\Users\ayush\OneDrive\Desktop\Blockchain\blockchain-realtime-fraud
npx hardhat --config hardhat.config.cjs node
```
**Wait for:** `Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/`

## Terminal 2: Deploy Contract (after Terminal 1 starts)
```bash
cd c:\Users\ayush\OneDrive\Desktop\Blockchain\blockchain-realtime-fraud
npx hardhat --config hardhat.config.cjs run scripts/deploy.js --network localhost
```
**Copy the contract address shown (should be 0xdD2FD4...)**

## Terminal 3: Start React App (after deployment)
```bash
cd c:\Users\ayush\OneDrive\Desktop\Blockchain\blockchain-realtime-fraud
npm run dev
```
**Wait for:** `Local: http://localhost:5173/`

## Browser: Connect & Test
1. Go to http://localhost:5173/
2. Click "Connect MetaMask"
3. Select Account 4 (the one with your contract)
4. Click "Sign In"
5. Watch transactions appear in live feed!

## If Something Goes Wrong

**Port 8545 in use?**
```bash
netstat -ano | findstr :8545
taskkill /PID <PID> /F
```

**Need to clear data?**
- Open browser console (F12)
- Run: `localStorage.clear(); location.reload();`

**Contract address changed?**
- In browser console run: `setContractAddress('0xNEW_ADDRESS')`
- Refresh page

---

## File Summary
✅ **scripts/deploy.js** - Fixed to use CommonJS (require)
✅ **hardhat.config.cjs** - Correct config file (use this!)
✅ **src/utils/contractService.ts** - Has your contract address
✅ **contracts/TransactionRegistry.sol** - Your smart contract
