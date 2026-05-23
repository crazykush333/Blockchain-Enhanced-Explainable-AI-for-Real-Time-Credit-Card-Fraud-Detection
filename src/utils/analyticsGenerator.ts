import { AnalyticsData, Transaction, INDIAN_STATES, IndianState } from '@/types/fraud';

// Generate analytics data from transactions
export const generateAnalyticsFromTransactions = (transactions: Transaction[]): AnalyticsData => {
  const approvedCount = transactions.filter(t => t.status === 'approved').length;
  const flaggedCount = transactions.filter(t => t.status === 'flagged').length;
  const blockedCount = transactions.filter(t => t.status === 'blocked').length;
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgRiskScore = transactions.reduce((sum, t) => sum + t.riskScore, 0) / transactions.length || 0;
  
  // Generate hourly data
  const hourlyMap = new Map<number, { count: number; flagged: number }>();
  for (let i = 0; i < 24; i++) {
    hourlyMap.set(i, { count: 0, flagged: 0 });
  }
  transactions.forEach(t => {
    const hour = new Date(t.timestamp).getHours();
    const data = hourlyMap.get(hour)!;
    data.count++;
    if (t.status === 'flagged' || t.status === 'blocked') data.flagged++;
  });
  const hourlyData = Array.from(hourlyMap.entries()).map(([hour, data]) => ({
    hour,
    count: data.count,
    flagged: data.flagged,
  }));
  
  // Generate daily data (last 7 days)
  const dailyMap = new Map<string, { count: number; volume: number; flagged: number }>();
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyMap.set(dateStr, { count: 0, volume: 0, flagged: 0 });
  }
  transactions.forEach(t => {
    const dateStr = new Date(t.timestamp).toISOString().split('T')[0];
    if (dailyMap.has(dateStr)) {
      const data = dailyMap.get(dateStr)!;
      data.count++;
      data.volume += t.amount;
      if (t.status === 'flagged' || t.status === 'blocked') data.flagged++;
    }
  });
  const dailyData = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    count: data.count,
    volume: data.volume,
    flagged: data.flagged,
  }));
  
  // Generate state data
  const stateMap = new Map<string, { count: number; flaggedCount: number; volume: number }>();
  INDIAN_STATES.forEach(state => {
    stateMap.set(state.name, { count: 0, flaggedCount: 0, volume: 0 });
  });
  transactions.forEach(t => {
    if (stateMap.has(t.location.state)) {
      const data = stateMap.get(t.location.state)!;
      data.count++;
      data.volume += t.amount;
      if (t.status === 'flagged' || t.status === 'blocked') data.flaggedCount++;
    }
  });
  const stateData = Array.from(stateMap.entries()).map(([state, data]) => ({
    state,
    count: data.count,
    flaggedCount: data.flaggedCount,
    volume: data.volume,
  }));
  
  // Generate category data
  const categoryMap = new Map<string, { count: number; flagged: number }>();
  transactions.forEach(t => {
    if (!categoryMap.has(t.merchantCategory)) {
      categoryMap.set(t.merchantCategory, { count: 0, flagged: 0 });
    }
    const data = categoryMap.get(t.merchantCategory)!;
    data.count++;
    if (t.status === 'flagged' || t.status === 'blocked') data.flagged++;
  });
  const categoryData = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    count: data.count,
    flaggedRate: data.count > 0 ? (data.flagged / data.count) * 100 : 0,
  }));
  
  return {
    totalTransactions: transactions.length,
    approvedCount,
    flaggedCount,
    blockedCount,
    totalVolume,
    avgRiskScore: Math.round(avgRiskScore),
    fraudRate: transactions.length > 0 ? ((flaggedCount + blockedCount) / transactions.length) * 100 : 0,
    hourlyData,
    dailyData,
    stateData,
    categoryData,
    modelMetrics: {
      precision: 94.2 + Math.random() * 2,
      recall: 91.5 + Math.random() * 3,
      f1Score: 92.8 + Math.random() * 2,
      accuracy: 96.1 + Math.random() * 2,
    },
  };
};

// Generate state risk data for heat map
export const generateStateRiskData = (transactions: Transaction[]): IndianState[] => {
  const stateMap = new Map<string, { count: number; fraudCount: number }>();
  
  INDIAN_STATES.forEach(state => {
    stateMap.set(state.name, { count: 0, fraudCount: 0 });
  });
  
  transactions.forEach(t => {
    if (stateMap.has(t.location.state)) {
      const data = stateMap.get(t.location.state)!;
      data.count++;
      if (t.status === 'flagged' || t.status === 'blocked') {
        data.fraudCount++;
      }
    }
  });
  
  return INDIAN_STATES.map(state => {
    const data = stateMap.get(state.name) || { count: 0, fraudCount: 0 };
    const fraudRate = data.count > 0 ? data.fraudCount / data.count : 0;
    
    let riskLevel: 'low' | 'medium' | 'high';
    if (fraudRate > 0.2) riskLevel = 'high';
    else if (fraudRate > 0.1) riskLevel = 'medium';
    else riskLevel = 'low';
    
    return {
      ...state,
      transactionCount: data.count,
      fraudCount: data.fraudCount,
      riskLevel,
    };
  });
};

// Generate initial mock analytics for demo
export const generateInitialAnalytics = (): AnalyticsData => {
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: Math.floor(Math.random() * 500) + 100,
    flagged: Math.floor(Math.random() * 50) + 10,
  }));
  
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 5000) + 2000,
      volume: Math.floor(Math.random() * 50000000) + 10000000,
      flagged: Math.floor(Math.random() * 500) + 100,
    };
  });
  
  const stateData = INDIAN_STATES.map(state => ({
    state: state.name,
    count: Math.floor(Math.random() * 1000) + 100,
    flaggedCount: Math.floor(Math.random() * 100) + 10,
    volume: Math.floor(Math.random() * 10000000) + 1000000,
  }));
  
  const categories = ['E-commerce', 'Grocery', 'Restaurant', 'Travel', 'Electronics', 'Healthcare'];
  const categoryData = categories.map(category => ({
    category,
    count: Math.floor(Math.random() * 2000) + 500,
    flaggedRate: Math.random() * 15 + 5,
  }));
  
  return {
    totalTransactions: 45892,
    approvedCount: 38456,
    flaggedCount: 5234,
    blockedCount: 2202,
    totalVolume: 892456789,
    avgRiskScore: 28,
    fraudRate: 16.2,
    hourlyData,
    dailyData,
    stateData,
    categoryData,
    modelMetrics: {
      precision: 95.4,
      recall: 92.8,
      f1Score: 94.1,
      accuracy: 97.2,
    },
  };
};
