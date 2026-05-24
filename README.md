# 🚀 Blockchain Real-Time Fraud Detection

![Build badge](https://img.shields.io/github/actions/workflow/status/crazykush333/Blockchain-Enhanced-Explainable-AI-for-Real-Time-Credit-Card-Fraud-Detection/ci.yml?branch=main)
![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.0-blue?logo=ethereum)
![React](https://img.shields.io/badge/React-18.0.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-4.0-blue?logo=typescript)
![Python](https://img.shields.io/badge/Python-3.9%2B-yellow?logo=python)

---

## 🗂️ Table of Contents
- [Overview 🧐](#project-overview)
- [Quick Start ⚡](#quick-start-development)
- [Project Structure 🗃️](#project-structure-important-files)
- [ML Model 🤖](#ml-model-optional)
- [Smart Contract 📜](#smart-contract-interface)
- [Testing 🧪](#testing)
- [Troubleshooting 🛠️](#troubleshooting)
- [CI & Deployment 🚦](#ci--deployment-suggestions)
- [Contributing 🤝](#contributing)
- [Contact ✉️](#contact)

---

## 🧐 Project Overview
Blockchain x ML x Dashboard  
A full-stack PoC linking a [Solidity](https://soliditylang.org/) smart contract to a [React](https://react.dev/) dashboard and a [Python](https://python.org/) ML fraud scoring service.

- <img height="20" src="https://simpleicons.org/icons/ethereum.svg"/> **Smart contract**: `contracts/TransactionRegistry.sol` for on-chain ledger
- ⚛️ **Frontend**: Vite + React + TypeScript dashboard with [MetaMask](https://metamask.io/) 🦊 integration
- 🧠 **ML**: Python scikit-learn model in `ml/`

## ⚡ Quick Start (development)
**Prerequisites**  
<img height="20" src="https://simpleicons.org/icons/node-dot-js.svg"/> Node.js v16+ | <img height="20" src="https://simpleicons.org/icons/metamask.svg"/> MetaMask extension

```sh
npm install                          # Install deps
npx hardhat node                     # Start Hardhat node 🟦
npx hardhat run scripts/deploy.js --network localhost
npm run dev                          # Start frontend
```
- Connect <img height="18" src="https://simpleicons.org/icons/metamask.svg"/> MetaMask to `http://127.0.0.1:8545` (Chain ID **31337**)
- Enter contract address in app or place it in `config/deployment-info.json`

---

<details>
<summary><strong>🗃️ Project Structure (click to expand)</strong></summary>

- `contracts/` — Solidity smart contracts <img height="16" src="https://simpleicons.org/icons/ethereum.svg"/>
- `scripts/` — deployment scripts <img height="16" src="https://simpleicons.org/icons/javascript.svg"/>
- `src/` — React frontend <img height="16" src="https://simpleicons.org/icons/react.svg"/>
- `ml/` — Python ML training/server <img height="16" src="https://simpleicons.org/icons/python.svg"/>
- `deployment-info.json`, `config/deployment-info.json` — contract addresses

</details>

---

<details>
<summary><strong>🤖 ML Model (optional)</strong></summary>

- Python scripts for ML in `ml/`
- Train:
  ```sh
  python -m venv .venv
  .venv\Scripts\activate   # Windows
  pip install -r ml/requirements.txt
  python ml/train_model.py
  ```
- Run server to score tx:
  ```sh
  python ml/serve_model.py
  ```

</details>

---

<details>
<summary><strong>📜 Smart Contract Interface</strong></summary>

- `storeTransaction(txHash, amount, status)` — store tx
- `getTransaction(index)` — read record
- `getTransactionCount()` — count
- Status: 0=Pending, 1=Approved, 2=Flagged, 3=Blocked 

</details>

---

## 🧪 Testing

```sh
npx hardhat compile
npm test
```

---

## 🛠️ Troubleshooting
- **Large files?** Use Git LFS
- **MetaMask errors?** Reset account / check chain ID
- **Contract not found?** Verify `deployment-info.json`

---

## 🚦 CI / Deployment Suggestions
- Use GitHub Actions to run build/test/compile
- Store secrets in GitHub secrets

---

## 🤝 Contributing

Fork ➡️ Feature branch ➡️ PR  
Keep large files out of PRs—use LFS.

---

## ✉️ Contact

Need help or want a custom demo?  
Open an issue or reach out through GitHub!

---
