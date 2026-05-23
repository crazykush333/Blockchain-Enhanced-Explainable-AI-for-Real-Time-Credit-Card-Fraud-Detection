// Supabase Database Setup Instructions
// Run these SQL commands in your Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql)

-- 1. Create Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  transaction_id TEXT UNIQUE NOT NULL,
  transaction_hash TEXT UNIQUE NOT NULL,
  merchant_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  risk_score NUMERIC NOT NULL,
  card_last_4 TEXT NOT NULL,
  location JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  block_number BIGINT NOT NULL,
  wallet_address TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Blocks Table
CREATE TABLE IF NOT EXISTS blocks (
  id BIGSERIAL PRIMARY KEY,
  block_number BIGINT UNIQUE NOT NULL,
  block_hash TEXT UNIQUE NOT NULL,
  previous_hash TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  transactions TEXT[] NOT NULL,
  nonce BIGINT NOT NULL,
  gas_used BIGINT NOT NULL,
  gas_limit BIGINT NOT NULL,
  mined_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_block ON transactions(block_number);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_blocks_number ON blocks(block_number DESC);
CREATE INDEX IF NOT EXISTS idx_blocks_hash ON blocks(block_hash);
CREATE INDEX IF NOT EXISTS idx_blocks_miner ON blocks(mined_by);

-- 4. Enable Row Level Security (Optional but recommended)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Allow authenticated users to read/write their own data)
CREATE POLICY "Users can read all transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Users can insert transactions" ON transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read all blocks" ON blocks FOR SELECT USING (true);
CREATE POLICY "Users can insert blocks" ON blocks FOR INSERT WITH CHECK (true);

-- 6. Verify Tables Created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
