import { Transaction, INDIAN_MERCHANTS, INDIAN_CITIES, XAIExplanation, XAIFactor } from '@/types/fraud';

// Generate a random hash (simulating blockchain hash)
export const generateHash = (): string => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

// Generate realistic Indian transaction amounts in INR
const generateAmount = (isFraudulent: boolean): number => {
  if (isFraudulent) {
    // Fraudulent transactions often have unusual amounts
    const patterns = [
      () => Math.floor(Math.random() * 500000) + 100000, // Large amounts (1L-6L)
      () => Math.floor(Math.random() * 99999) + 50000, // Medium-high (50K-1.5L)
      () => Math.floor(Math.random() * 9999) + 1, // Small rapid transactions
      () => Math.round((Math.random() * 25000 + 5000) * 100) / 100, // Precise amounts
    ];
    return patterns[Math.floor(Math.random() * patterns.length)]();
  }
  
  // Normal transaction amounts
  const ranges = [
    { min: 50, max: 500, weight: 30 }, // Small purchases
    { min: 500, max: 2000, weight: 35 }, // Medium purchases
    { min: 2000, max: 10000, weight: 20 }, // Large purchases
    { min: 10000, max: 50000, weight: 10 }, // Very large
    { min: 50000, max: 200000, weight: 5 }, // Premium
  ];
  
  const totalWeight = ranges.reduce((sum, r) => sum + r.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const range of ranges) {
    random -= range.weight;
    if (random <= 0) {
      return Math.floor(Math.random() * (range.max - range.min) + range.min);
    }
  }
  
  return Math.floor(Math.random() * 2000 + 100);
};

// Generate XAI explanation for a transaction
const generateXAIExplanation = (
  amount: number,
  location: { city: string; state: string },
  merchantCategory: string,
  hour: number,
  isFraudulent: boolean
): XAIExplanation => {
  const factors: XAIFactor[] = [];
  let totalRisk = 0;
  
  // Amount deviation factor
  const avgAmount = 3500;
  const amountDeviation = Math.abs(amount - avgAmount) / avgAmount;
  const amountImpact = amountDeviation > 2 ? 'negative' : amountDeviation > 0.5 ? 'neutral' : 'positive';
  factors.push({
    name: 'Transaction Amount Deviation',
    value: Math.min(amountDeviation * 30, 35),
    impact: amountImpact,
    weight: 0.25,
    description: `Amount ₹${amount.toLocaleString('en-IN')} deviates ${(amountDeviation * 100).toFixed(1)}% from average`,
    threshold: 200,
    actualValue: `₹${amount.toLocaleString('en-IN')}`,
  });
  totalRisk += factors[factors.length - 1].value * factors[factors.length - 1].weight;
  
  // Velocity check (simulated)
  const velocityScore = isFraudulent ? Math.random() * 30 + 20 : Math.random() * 15;
  factors.push({
    name: 'Transaction Velocity',
    value: velocityScore,
    impact: velocityScore > 20 ? 'negative' : 'positive',
    weight: 0.2,
    description: `${velocityScore > 20 ? 'High' : 'Normal'} transaction frequency detected`,
    threshold: 5,
    actualValue: `${Math.floor(velocityScore / 5)} txns/hour`,
  });
  totalRisk += velocityScore * 0.2;
  
  // Geographic anomaly
  const highRiskStates = ['Delhi', 'Uttar Pradesh', 'Bihar'];
  const geoRisk = highRiskStates.includes(location.state) ? 25 : 10;
  const adjustedGeoRisk = isFraudulent ? geoRisk + Math.random() * 20 : geoRisk;
  factors.push({
    name: 'Geographic Risk Pattern',
    value: adjustedGeoRisk,
    impact: adjustedGeoRisk > 20 ? 'negative' : 'positive',
    weight: 0.15,
    description: `Transaction from ${location.city}, ${location.state}`,
    actualValue: location.state,
  });
  totalRisk += adjustedGeoRisk * 0.15;
  
  // Time of day pattern
  const isOddHour = hour < 6 || hour > 23;
  const timeRisk = isOddHour ? (isFraudulent ? 35 : 20) : 5;
  factors.push({
    name: 'Time-of-Day Pattern',
    value: timeRisk,
    impact: isOddHour ? 'negative' : 'positive',
    weight: 0.15,
    description: `Transaction at ${hour}:00 ${isOddHour ? '(unusual hours)' : '(normal hours)'}`,
    actualValue: `${hour}:00 IST`,
  });
  totalRisk += timeRisk * 0.15;
  
  // Merchant category risk
  const highRiskCategories = ['Jewelry', 'Electronics', 'Travel & Airlines'];
  const categoryRisk = highRiskCategories.includes(merchantCategory) ? 20 : 8;
  const adjustedCategoryRisk = isFraudulent ? categoryRisk + Math.random() * 15 : categoryRisk;
  factors.push({
    name: 'Merchant Category Risk',
    value: adjustedCategoryRisk,
    impact: adjustedCategoryRisk > 15 ? 'negative' : 'positive',
    weight: 0.15,
    description: `${merchantCategory} - ${adjustedCategoryRisk > 15 ? 'Higher' : 'Lower'} fraud rate category`,
    actualValue: merchantCategory,
  });
  totalRisk += adjustedCategoryRisk * 0.15;
  
  // Device/behavior score (simulated)
  const behaviorScore = isFraudulent ? Math.random() * 25 + 15 : Math.random() * 10;
  factors.push({
    name: 'Behavioral Analysis',
    value: behaviorScore,
    impact: behaviorScore > 15 ? 'negative' : 'positive',
    weight: 0.1,
    description: `${behaviorScore > 15 ? 'Anomalous' : 'Normal'} user behavior pattern`,
    actualValue: behaviorScore > 15 ? 'Anomaly detected' : 'Pattern matches',
  });
  totalRisk += behaviorScore * 0.1;
  
  // Calculate final risk score
  const riskScore = Math.min(Math.max(totalRisk + (isFraudulent ? 25 : -10), 0), 100);
  const confidence = 85 + Math.random() * 12;
  
  let decision: 'approved' | 'flagged' | 'blocked';
  if (riskScore >= 70) {
    decision = 'blocked';
  } else if (riskScore >= 40) {
    decision = 'flagged';
  } else {
    decision = 'approved';
  }
  
  // Generate summary
  const topFactors = factors.sort((a, b) => b.value * b.weight - a.value * a.weight).slice(0, 3);
  const summary = decision === 'approved'
    ? `Transaction approved. Low risk indicators across all factors. Primary positive signals: ${topFactors.filter(f => f.impact === 'positive').map(f => f.name).join(', ') || 'Normal patterns'}.`
    : decision === 'flagged'
    ? `Transaction flagged for review. Key concerns: ${topFactors.filter(f => f.impact === 'negative').map(f => f.name).join(', ')}. Recommend manual verification.`
    : `Transaction blocked. High-risk indicators detected: ${topFactors.filter(f => f.impact === 'negative').map(f => f.name).join(', ')}. Immediate action required.`;
  
  return {
    riskScore: Math.round(riskScore),
    confidence: Math.round(confidence * 10) / 10,
    decision,
    factors: factors.sort((a, b) => b.value * b.weight - a.value * a.weight),
    summary,
    modelVersion: 'XAI-FRAUD-v2.4.1',
  };
};

// Generate a single transaction
export const generateTransaction = (blockNumber: number): Transaction => {
  const isFraudulent = Math.random() < 0.15; // 15% fraud rate for demo
  const merchant = INDIAN_MERCHANTS[Math.floor(Math.random() * INDIAN_MERCHANTS.length)];
  const locationData = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
  const cardTypes: Transaction['cardType'][] = ['visa', 'mastercard', 'rupay', 'amex'];
  const hour = new Date().getHours();
  
  const amount = generateAmount(isFraudulent);
  const location = {
    city: locationData.city,
    state: locationData.state,
    country: 'India',
    coordinates: { lat: locationData.lat, lng: locationData.lng },
  };
  
  const xaiExplanation = generateXAIExplanation(
    amount,
    location,
    merchant.category,
    hour,
    isFraudulent
  );
  
  const processingTimes = {
    payment: Math.floor(Math.random() * 150) + 100,
    fraudDetection: Math.floor(Math.random() * 200) + 150,
    gateway: Math.floor(Math.random() * 100) + 50,
    total: 0,
  };
  processingTimes.total = processingTimes.payment + processingTimes.fraudDetection + processingTimes.gateway;
  
  return {
    id: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    hash: generateHash(),
    blockNumber,
    timestamp: new Date(),
    amount,
    currency: 'INR',
    merchantName: merchant.name,
    merchantCategory: merchant.category,
    cardLast4: Math.floor(1000 + Math.random() * 9000).toString(),
    cardType: cardTypes[Math.floor(Math.random() * cardTypes.length)],
    location,
    status: xaiExplanation.decision === 'approved' ? 'approved' : xaiExplanation.decision,
    riskScore: xaiExplanation.riskScore,
    processingTime: processingTimes,
    xaiExplanation,
    customerEmail: `customer${Math.floor(Math.random() * 1000)}@example.com`,
    customerId: `CUST${Math.floor(Math.random() * 100000)}`,
  };
};

// Generate multiple transactions
export const generateTransactions = (count: number, startBlock: number): Transaction[] => {
  const transactions: Transaction[] = [];
  for (let i = 0; i < count; i++) {
    transactions.push(generateTransaction(startBlock + Math.floor(i / 3)));
  }
  return transactions;
};

// Format INR currency
export const formatINR = (amount: number): string => {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `₹${formatted}`;
};

// Format time ago
export const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};
