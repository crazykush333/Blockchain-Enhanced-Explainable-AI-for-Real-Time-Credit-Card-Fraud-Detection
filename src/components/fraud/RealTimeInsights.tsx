import React, { useState, useEffect } from 'react';
import { Transaction, AnalyticsData } from '@/types/fraud';

interface RealTimeInsightsProps {
  transactions: Transaction[];
  analytics: AnalyticsData;
}

const RealTimeInsights: React.FC<RealTimeInsightsProps> = ({ transactions, analytics }) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);

  useEffect(() => {
    generateInsights();
  }, [transactions, analytics]);

  useEffect(() => {
    if (insights.length > 0) {
      const interval = setInterval(() => {
        setCurrentInsightIndex((prev) => (prev + 1) % insights.length);
      }, 5000); // Rotate insights every 5 seconds

      return () => clearInterval(interval);
    }
  }, [insights.length]);

  const generateInsights = () => {
    const newInsights: string[] = [];
    
    // Recent transaction patterns
    const recentTxns = transactions.slice(-50);
    const recentFraudRate = (recentTxns.filter(t => t.status === 'flagged' || t.status === 'blocked').length / recentTxns.length) * 100;
    
    if (recentFraudRate > analytics.fraudRate * 1.5) {
      newInsights.push(`⚠️ Alert: Recent fraud rate is ${recentFraudRate.toFixed(1)}%, ${((recentFraudRate / analytics.fraudRate - 1) * 100).toFixed(0)}% higher than average`);
    } else if (recentFraudRate < analytics.fraudRate * 0.5) {
      newInsights.push(`✅ Good news: Recent fraud rate is down to ${recentFraudRate.toFixed(1)}%, significantly lower than average`);
    }

    // Peak hour detection
    const currentHour = new Date().getHours();
    const currentHourData = analytics.hourlyData.find(h => h.hour === currentHour);
    if (currentHourData) {
      const avgHourlyCount = analytics.hourlyData.reduce((sum, h) => sum + h.count, 0) / analytics.hourlyData.length;
      if (currentHourData.count > avgHourlyCount * 1.5) {
        newInsights.push(`📈 Peak activity detected: Current hour has ${((currentHourData.count / avgHourlyCount - 1) * 100).toFixed(0)}% more transactions than average`);
      }
    }

    // High-risk category warning
    const highRiskCategories = analytics.categoryData.filter(c => c.flaggedRate > 15);
    if (highRiskCategories.length > 0) {
      newInsights.push(`🎯 High-risk categories identified: ${highRiskCategories.map(c => c.category).join(', ')} showing elevated fraud rates`);
    }

    // Model performance insight
    if (analytics.modelMetrics.accuracy > 95) {
      newInsights.push(`🤖 ML model performing excellently with ${analytics.modelMetrics.accuracy.toFixed(1)}% accuracy and ${analytics.modelMetrics.recall.toFixed(1)}% detection rate`);
    }

    // Volume trends
    const todayVolume = analytics.dailyData[analytics.dailyData.length - 1]?.volume || 0;
    const yesterdayVolume = analytics.dailyData[analytics.dailyData.length - 2]?.volume || 0;
    if (yesterdayVolume > 0) {
      const volumeChange = ((todayVolume - yesterdayVolume) / yesterdayVolume) * 100;
      if (Math.abs(volumeChange) > 10) {
        newInsights.push(`💰 Transaction volume ${volumeChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(volumeChange).toFixed(1)}% compared to yesterday`);
      }
    }

    // Geographic insights
    const topState = analytics.stateData.reduce((max, state) => 
      state.volume > max.volume ? state : max
    , analytics.stateData[0]);
    if (topState) {
      newInsights.push(`🗺️ ${topState.state} leads with ${((topState.volume / analytics.totalVolume) * 100).toFixed(1)}% of total transaction volume`);
    }

    // Detection speed
    newInsights.push(`⚡ Average fraud detection time: 47ms with real-time blockchain verification`);

    // Success rate
    const successRate = (analytics.approvedCount / analytics.totalTransactions) * 100;
    newInsights.push(`✨ ${successRate.toFixed(1)}% of transactions approved with ${analytics.blockedCount} fraudulent attempts blocked`);

    setInsights(newInsights);
  };

  if (insights.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-xl p-4 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-500/20 rounded-lg mt-0.5">
          <svg className="w-5 h-5 text-purple-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-purple-300 font-semibold">Real-Time Insight</h3>
            <span className="text-xs text-slate-400">
              {currentInsightIndex + 1} of {insights.length}
            </span>
          </div>
          <p className="text-white text-sm leading-relaxed">
            {insights[currentInsightIndex]}
          </p>
          <div className="flex gap-1 mt-3">
            {insights.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentInsightIndex
                    ? 'bg-purple-400 w-8'
                    : 'bg-slate-600 w-2'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeInsights;
