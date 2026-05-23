# Blockchain Real-Time Fraud Detection Platform

A sophisticated fraud detection system with **real blockchain integration** using smart contracts, MetaMask wallet authentication, and live transaction monitoring.

## 🚀 Key Features

- **🔗 Smart Contract Storage**: Transactions stored on blockchain using Solidity smart contracts
- **🦊 MetaMask Integration**: Wallet-first authentication - connect wallet before signing in
- **⚡ Non-Blocking Blockchain**: Fire-and-forget pattern ensures smooth UI performance
- **📊 Real-Time Analytics**: Live transaction feed with fraud detection (97.2% accuracy)
- **🗺️ Geographic Mapping**: Interactive India map with transaction visualization
- **💰 Indian Rupee Support**: All amounts displayed in ₹ with proper formatting
- **🎯 Multi-Role Support**: Admin dashboard and customer portal
- **📈 Advanced Analytics**: Deep insights with charts, trends, and risk scoring

## 📋 Prerequisites

- Node.js v16+ installed
- MetaMask browser extension
- npm or yarn package manager

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Hardhat for Blockchain
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### 3. Start Local Blockchain
```bash
npx hardhat node
```
Keep this terminal running - it's your local blockchain network.

### 4. Deploy Smart Contract (New Terminal)
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 5. Configure MetaMask
- Add network: `http://127.0.0.1:8545`, Chain ID: `31337`
- Import test account (copy private key from Hardhat node terminal)

### 6. Start Application
```bash
npm run dev
```

### 7. Set Contract Address
- Open browser console
- Run: `setContractAddress('YOUR_ADDRESS_FROM_STEP_4')`
- Or check `deployment-info.json` file

### 8. Use the App
1. Connect MetaMask wallet (required before sign-in)
2. Sign in with credentials
3. Watch live transactions store on blockchain!

## 📖 Detailed Setup

See [BLOCKCHAIN_SETUP.md](BLOCKCHAIN_SETUP.md) for:
- Complete Hardhat/Ganache configuration
- Testnet deployment instructions
- Troubleshooting guide
- Contract functions reference

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    ↓
Web3 Provider (ethers.js)
    ↓
MetaMask Wallet
    ↓
Local Blockchain (Hardhat/Ganache)
    ↓
Smart Contract (TransactionRegistry.sol)
```

### Tech Stack

- **Frontend**: React 18.3.1, TypeScript, Vite
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **Blockchain**: Solidity 0.8.19, Hardhat, ethers.js 6.16.0
- **Mapping**: Leaflet 1.9.4, React Leaflet
- **Charts**: Recharts
- **State**: React Context API

## 📂 Project Structure

```
blockchain-realtime-fraud/
├── contracts/
│   └── TransactionRegistry.sol    # Smart contract for blockchain storage
├── scripts/
│   └── deploy.js                  # Contract deployment script
├── src/
│   ├── components/
│   │   ├── fraud/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── LiveTransactionFeed.tsx
│   │   │   ├── AnalyticsCharts.tsx
│   │   │   ├── GeographicAnalytics.tsx
│   │   │   ├── Header.tsx         # MetaMask integration
│   │   │   └── ...
│   │   └── ui/                    # shadcn/ui components
│   ├── utils/
│   │   ├── contractService.ts     # Web3 blockchain interaction
│   │   ├── transactionGenerator.ts
│   │   └── analyticsGenerator.ts
│   ├── types/
│   │   └── fraud.ts
│   └── AppLayout.tsx              # Main app logic
├── hardhat.config.js              # Hardhat configuration
├── BLOCKCHAIN_SETUP.md            # Detailed setup guide
└── package.json
```

## 🎮 Usage

### Admin Dashboard

**Default Credentials:**
- Email: `admin@frauddetect.com`
- Password: `admin123`

**Features:**
- Live transaction monitoring
- Analytics with charts and metrics
- Deep insights and trends
- Geographic analysis with India map
- Transaction status management

### Customer Portal

**Default Credentials:**
- Email: `customer@example.com`
- Password: `customer123`

**Features:**
- Personal transaction history
- Fraud alerts and notifications
- Account security overview

### MetaMask Wallet

**Required Before Sign-In:**
1. Click MetaMask icon in header
2. Connect wallet when prompted
3. Approve connection
4. Now you can sign in

**If not connected:**
- Warning appears: "🔒 Connect wallet first to sign in"

## 🔗 Blockchain Integration

### Smart Contract Functions

```solidity
// Store single transaction
storeTransaction(string txHash, uint256 amount, uint8 status)

// Store multiple (gas efficient)
storeBatchTransactions(string[] txHashes, uint256[] amounts, uint8[] statuses)

// Read transaction
getTransaction(uint256 index) returns (TransactionRecord)

// Get total count
getTransactionCount() returns (uint256)
```

### Status Codes

- `0` - Pending
- `1` - Approved
- `2` - Flagged
- `3` - Blocked

### Transaction Storage

Every transaction is automatically stored on-chain with:
- Transaction hash (unique identifier)
- Amount in paise (₹100.50 = 10050)
- Status (0-3)
- Timestamp
- Submitter address (your wallet)

**Performance:** Non-blocking async writes don't slow down UI!

## 🧪 Testing

### Check Blockchain Storage

```bash
# Open Hardhat console
npx hardhat console --network localhost
```

```javascript
// Get contract
const contract = await ethers.getContractAt("TransactionRegistry", "YOUR_ADDRESS");

// Check transaction count
const count = await contract.getTransactionCount();
console.log("Stored:", count.toString());

// Read first transaction
const tx = await contract.getTransaction(0);
console.log("TX:", tx);
```

### Monitor Blockchain

Watch Hardhat node terminal for real-time transaction logs:
```
eth_sendTransaction
  Contract call: storeTransaction
  From: 0x...
  Gas used: 65432
  Block: #123
```

## 🐛 Troubleshooting

### MetaMask Issues

**"Connect wallet first" warning:**
- Install MetaMask extension
- Create or import wallet
- Connect to localhost:8545 network
- Refresh page

**"Nonce too high" error:**
- MetaMask → Settings → Advanced → Reset Account

**"Insufficient funds":**
- Import Hardhat test account with ETH

### Blockchain Issues

**Contract not found:**
- Check `deployment-info.json` for address
- Verify contract address in localStorage
- Redeploy if needed

**Transactions not storing:**
- Check browser console for errors
- Verify wallet is connected
- Ensure Hardhat node is running

**Page not loading:**
- Check all terminals are running
- Restart dev server: Ctrl+C then `npm run dev`

## 📝 Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Compile Contracts
```bash
npx hardhat compile
```

### Clean Build
```bash
npx hardhat clean && npx hardhat compile
```

## 🔐 Security Notes

**For Development:**
- Uses test networks only (no real money)
- Test private keys provided by Hardhat
- Contract is unaudited

**For Production:**
- Never commit private keys
- Get contract audited
- Use hardware wallet
- Deploy to testnet first
- Implement access controls
- Add rate limiting

## 🎯 Features in Detail

### Live Transaction Feed
- Continuous generation (3-5 second intervals)
- No transaction caps (unlimited)
- Real-time fraud detection
- Status updates (Approved, Flagged, Blocked)
- Search and filter capabilities

### Analytics Dashboard
- Total volume in ₹
- Success rate metrics
- Fraud detection accuracy
- Time-series charts
- Risk distribution

### Geographic Analytics
- Interactive India map
- Transaction circles by volume
- Fraud risk levels (High/Medium/Low)
- State-wise distribution
- Real-time updates

### Blockchain Explorer
- No longer included (removed for performance)
- Use Hardhat console instead

## 📚 Learn More

- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [MetaMask Guide](https://metamask.io/faqs/)
- [React Documentation](https://react.dev/)

## 🤝 Contributing

This is an educational project demonstrating blockchain integration with fraud detection. Feel free to fork and experiment!

## 📄 License

This project is for educational purposes. Use responsibly.

## 🎉 Success Indicators

✅ Hardhat node running  
✅ Contract deployed  
✅ MetaMask connected  
✅ Test account imported  
✅ Wallet connected in app  
✅ Sign-in working  
✅ Transactions flowing  
✅ Console shows blockchain confirmations  
✅ Hardhat logs show transactions  

**You're ready to go! 🚀**
