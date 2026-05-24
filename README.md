# Blockchain Real-Time Fraud Detection

Lightweight platform that demonstrates on-chain storage of transaction events combined with a machine-learning fraud classifier and a React dashboard. Built for local development and demonstration (not production).

## Quick overview
- Smart contract: `contracts/TransactionRegistry.sol` stores transaction records on a local blockchain.
- Frontend: React + TypeScript (Vite) with MetaMask wallet authentication.
- ML: model training + a prediction server under `ml/` (optional to include in repo).

## Quick Start (development)
Prerequisites: Node.js v16+, MetaMask extension

1) Install dependencies
```bash
npm install
```

2) Start local blockchain
```bash
npx hardhat node
```

3) Deploy contract (new terminal)
```bash
npx hardhat run scripts/deploy.js --network localhost
```

4) Start dev server
```bash
npm run dev
```

5) Connect MetaMask to `http://127.0.0.1:8545` (Chain ID `31337`) and import a test account from the Hardhat node.

6) Set contract address in the app (or place it into `config/deployment-info.json`).

## Project structure (important files)
- `contracts/` — Solidity contract source
- `scripts/` — deployment scripts
- `src/` — React frontend (components, utils, pages)
- `ml/` — model training and model server (`train_model.py`, `serve_model.py`)
- `deployment-info.json` / `config/deployment-info.json` — contract address references

## Suggestions: files to remove before pushing (review & confirm)
These are build artifacts, caches, or large model artifacts that are safe to remove because they can be regenerated:

- `artifacts/`            (Hardhat build artifacts)
- `cache/`                (Hardhat/compile cache)
- `ml/artifacts/`         (trained model, feature dumps — large files)

I will NOT delete anything until you confirm. If you approve, I can remove them and add recommended `.gitignore` entries.

## Recommended .gitignore entries (if you want me to add them)
```
/artifacts/
/cache/
/ml/artifacts/
.env
node_modules/
dist/
/.vite
```

## Notes
- `ml/artifacts/fraud_model.joblib` may be large — keep it only if you want to publish a pretrained model.
- Solidity `artifacts/` and `cache/` are usually omitted from source control and rebuilt during CI or by contributors locally.

## Next steps
1. Confirm which of the suggested files I should remove.
2. I will remove them and add `.gitignore` entries if you want.
3. I can then show the exact git commands to push to GitHub.

---
If you'd like a longer README (detailed setup, testing, API examples), tell me which sections to expand.
