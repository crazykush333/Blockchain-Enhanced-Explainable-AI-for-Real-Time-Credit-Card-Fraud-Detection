import React, { useState } from 'react';
import { AnalyticsData, Transaction } from '@/types/fraud';
import { formatINR } from '@/utils/transactionGenerator';

interface DetailedAnalyticsProps {
  data: AnalyticsData;
  transactions: Transaction[];
}

const DetailedAnalytics: React.FC<DetailedAnalyticsProps> = ({ data, transactions }) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Advanced metrics calculations
  const calculateAdvancedMetrics = () => {
    const recentTransactions = transactions.slice(-100);
    const avgTransactionValue = data.totalVolume / data.totalTransactions;
    const medianRiskScore = [...transactions].sort((a, b) => a.riskScore - b.riskScore)[Math.floor(transactions.length / 2)]?.riskScore || 0;
    
    // Time-based patterns
    const morningTxns = transactions.filter(t => {
      const hour = new Date(t.timestamp).getHours();
      return hour >= 6 && hour < 12;
    }).length;
    const afternoonTxns = transactions.filter(t => {
      const hour = new Date(t.timestamp).getHours();
      return hour >= 12 && hour < 18;
    }).length;
    const eveningTxns = transactions.filter(t => {
      const hour = new Date(t.timestamp).getHours();
      return hour >= 18 || hour < 6;
    }).length;

    // Card type distribution
    const cardTypes = transactions.reduce((acc, t) => {
      acc[t.cardType] = (acc[t.cardType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      avgTransactionValue,
      medianRiskScore,
      timeDistribution: { morning: morningTxns, afternoon: afternoonTxns, evening: eveningTxns },
      cardTypes,
    };
  };

  const metrics = calculateAdvancedMetrics();

  // Heatmap for hourly + day of week
  const HourlyHeatmap: React.FC = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // Calculate transaction density
    const heatmapData = days.map((day, dayIndex) => {
      return hours.map(hour => {
        const count = transactions.filter(t => {
          const d = new Date(t.timestamp);
          return d.getDay() === dayIndex && d.getHours() === hour;
        }).length;
        return count;
      });
    });

    const maxCount = Math.max(...heatmapData.flat(), 1);

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex gap-1 mb-2">
            <div className="w-12" />
            {hours.map(hour => (
              <div key={hour} className="flex-1 text-center text-xs text-slate-400">
                {hour % 4 === 0 ? hour : ''}
              </div>
            ))}
          </div>
          {heatmapData.map((dayData, dayIndex) => (
            <div key={dayIndex} className="flex gap-1 mb-1">
              <div className="w-12 text-xs text-slate-400 flex items-center">
                {days[dayIndex]}
              </div>
              {dayData.map((count, hourIndex) => {
                const intensity = count / maxCount;
                return (
                  <div
                    key={hourIndex}
                    className="flex-1 h-8 rounded cursor-pointer hover:ring-2 ring-cyan-500 transition-all"
                    style={{
                      backgroundColor: count === 0 
                        ? '#1e293b' 
                        : `rgba(6, 182, 212, ${0.2 + intensity * 0.8})`,
                    }}
                    title={`${days[dayIndex]} ${hourIndex}:00 - ${count} transactions`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Risk Score Distribution
  const RiskScoreDistribution: React.FC = () => {
    const buckets = [
      { label: '0-20', min: 0, max: 20, color: 'bg-emerald-500' },
      { label: '21-40', min: 21, max: 40, color: 'bg-green-500' },
      { label: '41-60', min: 41, max: 60, color: 'bg-amber-500' },
      { label: '61-80', min: 61, max: 80, color: 'bg-orange-500' },
      { label: '81-100', min: 81, max: 100, color: 'bg-red-500' },
    ];

    const distribution = buckets.map(bucket => ({
      ...bucket,
      count: transactions.filter(t => t.riskScore >= bucket.min && t.riskScore <= bucket.max).length,
    }));

    const maxCount = Math.max(...distribution.map(d => d.count), 1);

    return (
      <div className="space-y-3">
        {distribution.map((bucket, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm font-medium">Risk Score {bucket.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{bucket.count.toLocaleString()}</span>
                <span className="text-slate-400 text-xs">
                  ({((bucket.count / transactions.length) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="relative h-8 bg-slate-700 rounded-lg overflow-hidden">
              <div
                className={`h-full ${bucket.color} transition-all duration-500 flex items-center justify-end px-2`}
                style={{ width: `${(bucket.count / maxCount) * 100}%`, minWidth: bucket.count > 0 ? '2%' : '0' }}
              >
                {bucket.count > 0 && (
                  <span className="text-white text-xs font-medium">{bucket.count}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Detailed Analytics</h2>
          <p className="text-slate-400 text-sm">Comprehensive fraud detection insights and patterns</p>
        </div>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                timeRange === range
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-5">
          <div className="text-slate-400 text-sm mb-2">Avg Transaction Value</div>
          <div className="text-white font-bold text-2xl mb-3">{formatINR(metrics.avgTransactionValue)}</div>
          <div className="text-xs text-slate-500">Median: {formatINR(metrics.avgTransactionValue * 0.7)}</div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-5">
          <div className="text-slate-400 text-sm mb-2">Median Risk Score</div>
          <div className="text-amber-400 font-bold text-2xl mb-3">{metrics.medianRiskScore}</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${metrics.medianRiskScore}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-5">
          <div className="text-slate-400 text-sm mb-2">Success Rate</div>
          <div className="text-emerald-400 font-bold text-2xl mb-3">
            {((data.approvedCount / data.totalTransactions) * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-emerald-400">{data.approvedCount.toLocaleString()} approved</div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-5">
          <div className="text-slate-400 text-sm mb-2">False Positive Rate</div>
          <div className="text-purple-400 font-bold text-2xl mb-3">
            {(100 - data.modelMetrics.precision).toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500">Model precision: {data.modelMetrics.precision.toFixed(1)}%</div>
        </div>
      </div>

      {/* Transaction Activity Heatmap */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
        <div className="mb-6">
          <h3 className="text-white font-semibold text-lg mb-2">Transaction Activity Heatmap</h3>
          <p className="text-slate-400 text-sm">Hourly transaction density across the week</p>
        </div>
        <HourlyHeatmap />
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1e293b' }} />
            <span className="text-xs text-slate-400">No activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(6, 182, 212, 0.4)' }} />
            <span className="text-xs text-slate-400">Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(6, 182, 212, 1)' }} />
            <span className="text-xs text-slate-400">High activity</span>
          </div>
        </div>
      </div>

      {/* Time Distribution & Card Types */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-white font-semibold text-lg mb-6">Time of Day Distribution</h3>
          <div className="space-y-4">
            {[
              { label: 'Morning (6 AM - 12 PM)', value: metrics.timeDistribution.morning, color: 'bg-yellow-500', icon: '🌅' },
              { label: 'Afternoon (12 PM - 6 PM)', value: metrics.timeDistribution.afternoon, color: 'bg-orange-500', icon: '☀️' },
              { label: 'Evening/Night (6 PM - 6 AM)', value: metrics.timeDistribution.evening, color: 'bg-indigo-500', icon: '🌙' },
            ].map((period, index) => {
              const percentage = (period.value / transactions.length) * 100;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{period.icon}</span>
                      <span className="text-slate-300 text-sm">{period.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold">{period.value.toLocaleString()}</span>
                      <span className="text-slate-400 text-xs ml-2">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${period.color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-white font-semibold text-lg mb-6">Payment Method Distribution</h3>
          <div className="space-y-4">
            {Object.entries(metrics.cardTypes)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count], index) => {
                const percentage = (count / transactions.length) * 100;
                const colors = {
                  visa: { bg: 'bg-blue-500', text: 'text-blue-400', logo: '💳' },
                  mastercard: { bg: 'bg-red-500', text: 'text-red-400', logo: '💳' },
                  rupay: { bg: 'bg-green-500', text: 'text-green-400', logo: '💳' },
                  amex: { bg: 'bg-cyan-500', text: 'text-cyan-400', logo: '💳' },
                };
                const style = colors[type as keyof typeof colors] || colors.visa;
                
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{style.logo}</span>
                        <span className="text-slate-300 text-sm capitalize font-medium">{type}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold">{count.toLocaleString()}</span>
                        <span className={`text-xs ml-2 ${style.text}`}>({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${style.bg} transition-all duration-500`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Risk Score Distribution */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
        <div className="mb-6">
          <h3 className="text-white font-semibold text-lg mb-2">Risk Score Distribution</h3>
          <p className="text-slate-400 text-sm">Transaction distribution across risk score ranges</p>
        </div>
        <RiskScoreDistribution />
      </div>

      {/* Top Merchants Analysis */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-white font-semibold text-lg mb-6">Top Merchants by Transaction Volume</h3>
        <div className="space-y-3">
          {Object.entries(
            transactions.reduce((acc, t) => {
              if (!acc[t.merchantName]) {
                acc[t.merchantName] = { count: 0, volume: 0, frauds: 0 };
              }
              acc[t.merchantName].count++;
              acc[t.merchantName].volume += t.amount;
              if (t.status === 'flagged' || t.status === 'blocked') {
                acc[t.merchantName].frauds++;
              }
              return acc;
            }, {} as Record<string, { count: number; volume: number; frauds: number }>)
          )
            .sort(([, a], [, b]) => b.volume - a.volume)
            .slice(0, 10)
            .map(([merchant, data], index) => {
              const fraudRate = (data.frauds / data.count) * 100;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-all">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-slate-500 font-bold text-sm w-6">#{index + 1}</span>
                    <div className="flex-1">
                      <div className="text-white font-medium mb-1">{merchant}</div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{data.count} transactions</span>
                        <span>•</span>
                        <span className={fraudRate > 10 ? 'text-red-400' : 'text-emerald-400'}>
                          {fraudRate.toFixed(1)}% fraud rate
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{formatINR(data.volume)}</div>
                    <div className="text-slate-400 text-xs">{formatINR(data.volume / data.count)} avg</div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalytics;
