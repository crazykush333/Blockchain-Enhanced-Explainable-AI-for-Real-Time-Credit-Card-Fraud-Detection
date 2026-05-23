# 🚀 Quick Reference Card

## One-Time Setup (5 minutes)

```bash
# 1. Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# 2. Start blockchain (Terminal 1 - keep running)
npx hardhat node

# 3. Deploy contract (Terminal 2)
npx hardhat run scripts/deploy.js --network localhost

# 4. Start app (Terminal 3)
npm run dev
```

## MetaMask Configuration (2 minutes)

**Add Network:**
- Name: `Hardhat Local`
- RPC: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency: `ETH`

**Import Account:**
- Copy private key from Hardhat terminal
- MetaMask → Import Account → Paste key

## App Configuration (30 seconds)

**Browser Console:**
```javascript
// Set contract address (from deployment output)
setContractAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3')

// Check it's set
getContractAddress()
```

## Usage Flow

1. **Connect MetaMask** (button in header)
2. **Sign In** (only works after wallet connected)
   - Admin: `admin@frauddetect.com` / `admin123`
   - Customer: `customer@example.com` / `customer123`
3. **Watch transactions** store on blockchain automatically!

## Console Commands

```javascript
// View contract address
getContractAddress()

// Set contract address
setContractAddress('0x...')

// Check MetaMask connection
window.ethereum.selectedAddress
```

## Verify It's Working

✅ **Header shows:** MetaMask button + wallet address  
✅ **Console shows:** "Transaction confirmed on chain"  
✅ **Hardhat shows:** Transaction logs  
✅ **UI:** Smooth, no freezing  

## Common Commands

```bash
# Restart everything
npx hardhat clean
npx hardhat node                    # Terminal 1
npx hardhat run scripts/deploy.js --network localhost  # Terminal 2
npm run dev                         # Terminal 3

# Reset MetaMask (if nonce errors)
MetaMask → Settings → Advanced → Reset Account

# Check contract
npx hardhat console --network localhost
> const c = await ethers.getContractAt("TransactionRegistry", "0x...")
> await c.getTransactionCount()
```

## File Locations

- **Contract:** `contracts/TransactionRegistry.sol`
- **Deploy:** `scripts/deploy.js`
- **Config:** `hardhat.config.js`
- **Service:** `src/utils/contractService.ts`
- **Docs:** `BLOCKCHAIN_SETUP.md`, `README.md`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Can't sign in | Connect wallet first |
| "Nonce too high" | Reset MetaMask account |
| No transactions | Check you're signed in as admin |
| Not storing | Verify contract address set |
| Page freezing | Shouldn't happen! Check console |

## Test Transaction Storage

```bash
npx hardhat console --network localhost
```

```javascript
const contract = await ethers.getContractAt("TransactionRegistry", "YOUR_ADDRESS");
const count = await contract.getTransactionCount();
console.log("Transactions stored:", count.toString());

const tx = await contract.getTransaction(0);
console.log("First TX:", tx);
```

## Daily Development Flow

```bash
# Morning: Start everything
npx hardhat node &                  # Background
npx hardhat run scripts/deploy.js --network localhost
npm run dev

# During dev: App running at localhost:5173
# Hardhat: localhost:8545

# Evening: Stop (Ctrl+C all terminals)
```

## Production Deployment (Later)

1. Get testnet ETH (Sepolia faucet)
2. Update `hardhat.config.js` with Infura/Alchemy
3. Deploy: `npx hardhat run scripts/deploy.js --network sepolia`
4. Update app with new contract address
5. Configure MetaMask for Sepolia

---

**Need Help?** See `BLOCKCHAIN_SETUP.md` for detailed guide  
**Implementation Details?** See `IMPLEMENTATION_SUMMARY.md`  
**Project Info?** See `README.md`
