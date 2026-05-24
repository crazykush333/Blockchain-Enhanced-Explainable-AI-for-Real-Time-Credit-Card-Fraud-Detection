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
## Detailed README

This README contains step-by-step instructions to run, develop, test and deploy the project locally, plus notes on the smart contract API and the ML components.

---

## Project overview

This repository demonstrates a full-stack PoC that links a real blockchain smart contract to a React front end and an optional ML service for fraud scoring.

- Smart contract: `contracts/TransactionRegistry.sol` — a simple on-chain ledger for transaction events.
- Frontend: `src/` — Vite + React + TypeScript dashboard and UI components, including MetaMask integration.
- ML: `ml/` — training scripts and a small model-serving script (`serve_model.py`) used to score transaction features.

Use case: generate or capture transaction events in the UI, optionally score them via the ML server, and persist an immutable record on a local blockchain node (Hardhat) for demo/validation.

## Prerequisites

- Node.js v16 or newer
- npm (or yarn)
- Git (with Git LFS installed if you work with dataset files)
- MetaMask browser extension (for interacting with the dApp)

Optional (for ML): Python 3.9+, pip, scikit-learn, joblib

## Development (local)

1. Install JavaScript dependencies

```bash
npm install
```

2. Start a local blockchain (Hardhat node)

```bash
npx hardhat node
```

Leave the node running in a terminal.

3. Deploy the smart contract to the local network (new terminal)

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Note the contract address printed by the script. You can also find it under `deployment-info.json`.

4. Configure MetaMask

- Add a network pointing to `http://127.0.0.1:8545` (Chain ID `31337`).
- Import one of the test accounts printed by the Hardhat node (copy private key into MetaMask import).

5. Run the frontend

```bash
npm run dev
```

Open the app in the browser, connect the wallet, and use the Admin/Customer UI.

## ML model (optional)

The `ml/` folder contains training and serving utilities. If you include a pretrained model, it is stored under `ml/artifacts/`. We recommend treating model artifacts as large files tracked via Git LFS or kept out of Git and downloaded separately.

To train locally (example):

```bash
python -m venv .venv
.\.venv\Scripts\activate   # Windows
pip install -r ml/requirements.txt
python ml/train_model.py
```

To run the lightweight model server:

```bash
python ml/serve_model.py
```

Then configure the frontend to call the model server (see `src/utils/fraudApi.ts`).

## Smart contract interface

Contract: `TransactionRegistry`

Key functions:

- `storeTransaction(string txHash, uint256 amount, uint8 status)` — store a single transaction.
- `storeBatchTransactions(string[] txHashes, uint256[] amounts, uint8[] statuses)` — batch store.
- `getTransaction(uint256 index)` — read a stored record.
- `getTransactionCount()` — number of stored records.

Status codes:

- `0` Pending
- `1` Approved
- `2` Flagged
- `3` Blocked

The contract source includes `// SPDX-License-Identifier: MIT` at the top; this repository uses the MIT license (see `LICENSE`).

## Testing

1. Compile contracts

```bash
npx hardhat compile
```

2. Run unit tests (if present)

```bash
npm test
```

3. Manual verification

- Use `npx hardhat console --network localhost` to query the contract and confirm stored transactions.

## Troubleshooting

- Large files: keep datasets out of Git or use Git LFS. This repo already uses Git LFS for the sample dataset.
- MetaMask: use "Reset Account" if you see nonce issues. Make sure the network is `http://127.0.0.1:8545`.
- Contract not found: confirm `deployment-info.json` contains the right address and redeploy if needed.

## CI / Deployment suggestions

- Add a GitHub Actions workflow to run `npm ci && npm run build && npx hardhat compile` on pull requests.
- Do not store private keys or real credentials in the repo; use GitHub Secrets for CI.

## GitHub publishing notes

- This repository already has `ml/data/raw/creditcard.csv` tracked via Git LFS to avoid the 100 MB limit. If you add new large files, use `git lfs track`.
- Recommended `.gitignore` entries were added; update as needed for your environment.

## Contributing

If you'd like to contribute, fork the repo, create a feature branch, and open a pull request describing your changes. Keep large data files out of PRs — use LFS or external storage.

## Contact

If you need help with the setup or want a custom README variant (for a public demo vs internal use), tell me what sections to expand and I will update `README.md` and commit the change.

