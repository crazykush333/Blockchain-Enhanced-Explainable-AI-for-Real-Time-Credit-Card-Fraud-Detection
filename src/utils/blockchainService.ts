import { Transaction, BlockchainBlock } from '@/types/fraud';
import { supabase } from '@/lib/supabase';

// Real SHA-256 hashing function
export const generateBlockHash = async (
  blockNumber: number,
  previousHash: string,
  transactions: string[],
  timestamp: Date,
  nonce: number
): Promise<string> => {
  const data = `${blockNumber}${previousHash}${transactions.join('')}${timestamp.getTime()}${nonce}`;
  
  // Use browser's SubtleCrypto API for real SHA-256 hashing
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `0x${hashHex}`;
};

// Generate transaction hash - Fast synchronous version for UI responsiveness
export const generateTransactionHash = (transaction: Transaction): string => {
  const data = `${transaction.id}${transaction.merchantName}${transaction.amount}${transaction.timestamp}${transaction.cardLast4}`;
  
  // Simple fast hash using string manipulation (not cryptographically secure but fast for UI)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to hex and pad
  const hashHex = Math.abs(hash).toString(16).padStart(16, '0');
  return `0x${hashHex}${Date.now().toString(16)}`;
};

// Proof of Work mining function
export const mineBlock = async (
  block: Omit<BlockchainBlock, 'hash' | 'nonce'>,
  difficulty: number = 4
): Promise<{ hash: string; nonce: number }> => {
  let nonce = 0;
  let hash = '';
  const target = '0'.repeat(difficulty);
  
  while (!hash.startsWith(target)) {
    nonce++;
    hash = await generateBlockHash(
      block.number,
      block.previousHash,
      block.transactions,
      block.timestamp,
      nonce
    );
  }
  
  return { hash, nonce };
};

// Store transaction to Supabase cloud
export const storeTransactionToCloud = async (
  transaction: Transaction,
  hash: string,
  walletAddress?: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          transaction_id: transaction.id,
          transaction_hash: hash,
          merchant_name: transaction.merchantName,
          amount: transaction.amount,
          status: transaction.status,
          risk_score: transaction.riskScore,
          card_last_4: transaction.cardLast4,
          location: transaction.location,
          timestamp: transaction.timestamp,
          block_number: transaction.blockNumber,
          wallet_address: walletAddress || null,
          metadata: {
            xai_explanation: transaction.xaiExplanation,
            processing_time: transaction.processingTime,
          }
        }
      ]);
    
    if (error) {
      console.error('Error storing transaction:', error);
      return false;
    }
    
    console.log('✅ Transaction stored to cloud:', hash);
    return true;
  } catch (error) {
    console.error('Failed to store transaction:', error);
    return false;
  }
};

// Store blockchain block to Supabase cloud
export const storeBlockToCloud = async (
  block: BlockchainBlock,
  walletAddress?: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('blocks')
      .insert([
        {
          block_number: block.number,
          block_hash: block.hash,
          previous_hash: block.previousHash,
          timestamp: block.timestamp,
          transactions: block.transactions,
          nonce: block.nonce,
          gas_used: block.gasUsed,
          gas_limit: block.gasLimit,
          mined_by: walletAddress || null,
        }
      ]);
    
    if (error) {
      console.error('Error storing block:', error);
      return false;
    }
    
    console.log('⛓️ Block stored to cloud:', block.hash);
    return true;
  } catch (error) {
    console.error('Failed to store block:', error);
    return false;
  }
};

// Retrieve transactions from cloud
export const getTransactionsFromCloud = async (
  limit: number = 100
): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data?.map((row: any) => ({
      id: row.transaction_id,
      hash: row.transaction_hash,
      merchantName: row.merchant_name,
      amount: row.amount,
      currency: row.currency || 'INR',
      status: row.status,
      riskScore: row.risk_score,
      cardLast4: row.card_last4,
      cardType: row.card_type || 'visa',
      merchantCategory: row.merchant_category || 'retail',
      location: row.location,
      timestamp: new Date(row.timestamp),
      blockNumber: row.block_number,
      processingTime: row.metadata?.processingTime || { payment: 0, fraudDetection: 0, gateway: 0, total: 0 },
      xaiExplanation: row.metadata?.xaiExplanation,
    } as Transaction)) || [];
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return [];
  }
};

// Retrieve blocks from cloud
export const getBlocksFromCloud = async (
  limit: number = 20
): Promise<BlockchainBlock[]> => {
  try {
    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .order('block_number', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data?.map((row: any) => ({
      number: row.block_number,
      hash: row.block_hash,
      previousHash: row.previous_hash,
      timestamp: new Date(row.timestamp),
      transactions: row.transactions,
      nonce: row.nonce,
      gasUsed: row.gas_used,
      gasLimit: row.gas_limit,
    })) || [];
  } catch (error) {
    console.error('Failed to fetch blocks:', error);
    return [];
  }
};

// Verify blockchain integrity
export const verifyBlockchainIntegrity = async (
  blocks: BlockchainBlock[]
): Promise<{ valid: boolean; invalidBlocks: number[] }> => {
  const invalidBlocks: number[] = [];
  
  for (let i = 0; i < blocks.length - 1; i++) {
    const currentBlock = blocks[i];
    const nextBlock = blocks[i + 1];
    
    // Verify hash linkage
    if (nextBlock.previousHash !== currentBlock.hash) {
      invalidBlocks.push(currentBlock.number);
    }
    
    // Verify block hash
    const recalculatedHash = await generateBlockHash(
      currentBlock.number,
      currentBlock.previousHash,
      currentBlock.transactions,
      currentBlock.timestamp,
      currentBlock.nonce
    );
    
    if (recalculatedHash !== currentBlock.hash) {
      invalidBlocks.push(currentBlock.number);
    }
  }
  
  return {
    valid: invalidBlocks.length === 0,
    invalidBlocks,
  };
};

// Setup Supabase tables (run once)
export const setupCloudTables = async (): Promise<void> => {
  console.log('📊 Setting up cloud storage tables...');
  console.log('Please create these tables in your Supabase dashboard:');
  console.log(`
    -- Transactions Table
    CREATE TABLE transactions (
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
    
    -- Blocks Table
    CREATE TABLE blocks (
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
    
    -- Create indexes
    CREATE INDEX idx_transactions_hash ON transactions(transaction_hash);
    CREATE INDEX idx_transactions_block ON transactions(block_number);
    CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);
    CREATE INDEX idx_blocks_number ON blocks(block_number DESC);
    CREATE INDEX idx_blocks_hash ON blocks(block_hash);
  `);
};
