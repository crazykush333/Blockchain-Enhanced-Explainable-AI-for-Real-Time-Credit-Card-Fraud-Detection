# Transaction Storage Troubleshooting Guide

## Issue: Transactions aren't being recorded in Ganache

### Quick Checklist

1. **Check Private Key is Loaded**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for message: "🔍 PRIVATE KEY CHECK"
   - Should see: ✅ VITE_GANACHE_PRIVATE_KEY is loaded
   - If you see ❌, the issue is that the private key is not loaded

2. **Fix: Restart Dev Server**
   ```bash
   # Stop the dev server (Ctrl+C)
   # Then restart it
   npm run dev
   ```

3. **Verify .env File**
   ```bash
   # Check .env exists and has the private key
   cat .env
   
   # Should output:
   # VITE_GANACHE_PRIVATE_KEY=0x...
   ```

4. **Check Ganache is Running**
   ```bash
   # Ganache should be running on port 7545
   # Visit: http://127.0.0.1:7545 in browser
   # Or check if port 7545 is listening
   ```

5. **Verify Contract is Deployed**
   ```bash
   # Run diagnostic script
   node diagnose-ganache.js
   
   # Check if you see:
   # ✓ Contract deployed
   ```

### Step-by-Step Debugging

**Step 1: Browser Console Check**
1. Open app in browser
2. Press F12 to open DevTools
3. Go to "Console" tab
4. Check for:
   - "🔍 PRIVATE KEY CHECK" message
   - "✅ VITE_GANACHE_PRIVATE_KEY is loaded" (should be present)
   - Any error messages about Ganache connection

**Step 2: Transaction Generation Check**
1. In Console, watch for messages like:
   ```
   📝 NEW TRANSACTION GENERATED
      Transaction ID: TXN...
      Amount: ₹...
      Status: ...
      Generated Hash: 0x...
   ```

**Step 3: Blockchain Storage Check**
1. Look for message:
   ```
   🔄 Attempting to store in Ganache...
   ```

2. If you see errors here, check:
   - Is Ganache running?
   - Is the contract address correct?
   - Is the private key valid?

**Step 4: Confirmation Check**
1. After "Attempting to store", you should see:
   ```
   ✓ Connected to Ganache, block: X
   Signer address: 0x...
   Signer balance: X ETH
   
   📦 Calling storeTransaction with:
      Hash: 0x...
      Amount (paise): XXX
      Status: 0
   
   ✅ Transaction sent to Ganache!
      TX Hash: 0x...
   
   ⏳ Waiting for confirmation...
   🔗 ✓ CONFIRMED in Ganache!
      Block Number: X
   ```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "VITE_GANACHE_PRIVATE_KEY not found" | Restart dev server after adding to .env |
| "Cannot connect to Ganache" | Start Ganache: `ganache-cli` or open Ganache desktop |
| "Contract NOT DEPLOYED" | Run: `npx hardhat run scripts/deploy.cjs --network ganache` |
| "Confirmation failed" | Check Ganache balance is sufficient |
| Hash appears in UI but not in Ganache | Check console for detailed error logs |

### Complete Resolution Steps

```bash
# 1. Stop everything
# Ctrl+C in all terminals

# 2. Verify .env has private key
cat .env
# Should have: VITE_GANACHE_PRIVATE_KEY=0x1a020df0ff7c392196...

# 3. Start Ganache (if not already running)
ganache-cli

# 4. In another terminal, deploy contract
npx hardhat run scripts/deploy.cjs --network ganache

# 5. In another terminal, start dev server
npm run dev

# 6. Open http://localhost:8080 in browser
# 7. F12 Console should show:
#    ✅ VITE_GANACHE_PRIVATE_KEY is loaded
#    (if not, close browser and clear cache, then try again)

# 8. Transactions should now appear in:
#    - Browser UI (live feed)
#    - Browser Console (detailed logs)
#    - Ganache (contract data)
```

### Verify Transactions are Stored

```bash
# Use the verification script
node verify-ganache.js 0x<YOUR_HASH>

# Should output:
# ✅ Transaction FOUND in Ganache!
#    Hash: 0x...
#    Amount: X paise
#    Status: ...
#    Timestamp: ...
```
