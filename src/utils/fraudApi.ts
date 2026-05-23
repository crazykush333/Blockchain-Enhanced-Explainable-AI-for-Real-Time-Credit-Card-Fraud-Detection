import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types/fraud';

interface AnalyzeTransactionRequest {
  amount: number;
  merchantName: string;
  merchantCategory: string;
  city: string;
  state: string;
  cardType: string;
  hour: number;
}

interface AnalysisResult {
  success: boolean;
  analysis?: {
    riskScore: number;
    decision: 'approved' | 'flagged' | 'blocked';
    confidence: number;
    summary: string;
    factors: Array<{
      name: string;
      value: number;
      impact: 'positive' | 'negative' | 'neutral';
      weight: number;
      description: string;
      actualValue?: string;
    }>;
  };
  modelVersion?: string;
  processedAt?: string;
  aiPowered?: boolean;
  error?: string;
}

// Analyze a transaction using the edge function
export async function analyzeTransaction(
  transaction: AnalyzeTransactionRequest
): Promise<AnalysisResult> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-transaction', {
      body: transaction,
    });

    if (error) {
      console.error('Edge function error:', error);
      return { success: false, error: error.message };
    }

    return data as AnalysisResult;
  } catch (err: any) {
    console.error('API call error:', err);
    return { success: false, error: err.message };
  }
}

// Save transaction to database
export async function saveTransaction(transaction: Transaction): Promise<boolean> {
  try {
    const { error } = await supabase.from('transactions').insert({
      id: transaction.id,
      hash: transaction.hash,
      block_number: transaction.blockNumber,
      timestamp: transaction.timestamp.toISOString(),
      amount: transaction.amount,
      currency: transaction.currency,
      merchant_name: transaction.merchantName,
      merchant_category: transaction.merchantCategory,
      card_last4: transaction.cardLast4,
      card_type: transaction.cardType,
      location_city: transaction.location.city,
      location_state: transaction.location.state,
      location_country: transaction.location.country,
      location_lat: transaction.location.coordinates.lat,
      location_lng: transaction.location.coordinates.lng,
      status: transaction.status,
      risk_score: transaction.riskScore,
      processing_time_payment: transaction.processingTime.payment,
      processing_time_fraud: transaction.processingTime.fraudDetection,
      processing_time_gateway: transaction.processingTime.gateway,
      processing_time_total: transaction.processingTime.total,
      xai_confidence: transaction.xaiExplanation?.confidence,
      xai_summary: transaction.xaiExplanation?.summary,
      customer_id: transaction.customerId,
      customer_email: transaction.customerEmail,
    });

    if (error) {
      console.error('Database error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Save transaction error:', err);
    return false;
  }
}

// Get transactions from database
export async function getTransactions(
  limit: number = 50,
  status?: 'approved' | 'flagged' | 'blocked'
): Promise<Transaction[]> {
  try {
    let query = supabase
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch transactions error:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      hash: row.hash,
      blockNumber: row.block_number,
      timestamp: new Date(row.timestamp),
      amount: parseFloat(row.amount),
      currency: row.currency,
      merchantName: row.merchant_name,
      merchantCategory: row.merchant_category,
      cardLast4: row.card_last4,
      cardType: row.card_type,
      location: {
        city: row.location_city,
        state: row.location_state,
        country: row.location_country,
        coordinates: {
          lat: parseFloat(row.location_lat),
          lng: parseFloat(row.location_lng),
        },
      },
      status: row.status,
      riskScore: row.risk_score,
      processingTime: {
        payment: row.processing_time_payment,
        fraudDetection: row.processing_time_fraud,
        gateway: row.processing_time_gateway,
        total: row.processing_time_total,
      },
      xaiExplanation: row.xai_summary ? {
        riskScore: row.risk_score,
        confidence: parseFloat(row.xai_confidence),
        decision: row.status,
        summary: row.xai_summary,
        factors: [],
        modelVersion: 'XAI-FRAUD-v2.4.1',
      } : undefined,
      customerId: row.customer_id,
      customerEmail: row.customer_email,
    }));
  } catch (err) {
    console.error('Get transactions error:', err);
    return [];
  }
}

// Submit an appeal
export async function submitAppeal(
  transactionId: string,
  userId: string,
  reason: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from('appeals').insert({
      transaction_id: transactionId,
      user_id: userId,
      reason,
      status: 'pending',
    });

    if (error) {
      console.error('Submit appeal error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Appeal submission error:', err);
    return false;
  }
}
