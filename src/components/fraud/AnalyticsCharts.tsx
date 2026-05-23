import React, { useState } from 'react';
import { AnalyticsData, Transaction } from '@/types/fraud';
import { formatINR } from '@/utils/transactionGenerator';
import RealTimeInsights from './RealTimeInsights';

interface AnalyticsChartsProps {
  data: AnalyticsData;
  transactions?: Transaction[];
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data, transactions = [] }) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  // Enhanced bar chart component with tooltips
  const BarChart: React.FC<{ 
    data: { label: string; value: number; color: string; secondaryValue?: number }[]; 
    maxValue: number;
    showTooltip?: boolean;
  }> = ({ data, maxValue, showTooltip = true }) => (
    <div className="flex items-end gap-1 h-40">
      {data.map((item, index) => (
        <div 
          key={index} 
          className="flex-1 flex flex-col items-center gap-1 group relative"
          onMouseEnter={() => setHoveredBar(index)}
          onMouseLeave={() => setHoveredBar(null)}
        >
          {showTooltip && hoveredBar === index && (
            <div className="absolute bottom-full mb-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white shadow-xl z-10 whitespace-nowrap">
              <div className="font-semibold">{item.label}</div>
              <div className="text-slate-400">Count: {item.value.toLocaleString()}</div>
              {item.secondaryValue !== undefined && (
                <div className="text-amber-400">Flagged: {item.secondaryValue}</div>
              )}
            </div>
          )}
          <div className="relative w-full">
            <div
              className={`w-full rounded-t ${item.color} transition-all duration-500 group-hover:opacity-80`}
              style={{ height: `${(item.value / maxValue) * 160}px`, minHeight: '4px' }}
            />
            {item.secondaryValue !== undefined && (
              <div
                className="absolute bottom-0 w-full rounded-t bg-amber-500/50"
                style={{ height: `${(item.secondaryValue / maxValue) * 160}px`, minHeight: '2px' }}
              />
            )}
          </div>
          <span className="text-slate-500 text-xs group-hover:text-slate-300 transition-colors">{item.label}</span>
        </div>
      ))}
    </div>
  );

  // Line chart component for trends
  const LineChart: React.FC<{ 
    data: { label: string; value: number; volume?: number }[]; 
  }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const maxVolume = data[0]?.volume !== undefined ? Math.max(...data.map(d => d.volume || 0), 1) : 0;
    const points = data.map((item, index) => ({
      x: (index / (data.length - 1)) * 100,
      y: 100 - (item.value / maxValue) * 80,
    }));
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="relative h-40">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#334155"
              strokeWidth="0.2"
              strokeDasharray="1,1"
            />
          ))}
          
          {/* Area fill */}
          <path
            d={`${pathD} L 100 100 L 0 100 Z`}
            fill="url(#gradient)"
            opacity="0.2"
          />
          
          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#06B6D4"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="1"
              fill="#06B6D4"
              className="hover:r-2 transition-all cursor-pointer"
            />
          ))}
          
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
          {data.map((item, index) => (
            index % Math.ceil(data.length / 5) === 0 && (
              <span key={index} className="text-xs text-slate-500">
                {item.label}
              </span>
            )
          ))}
        </div>
      </div>
    );
  };

  // Donut chart component
  const DonutChart: React.FC<{ approved: number; flagged: number; blocked: number }> = ({ approved, flagged, blocked }) => {
    const total = approved + flagged + blocked;
    const approvedPct = (approved / total) * 100;
    const flaggedPct = (flagged / total) * 100;
    const blockedPct = (blocked / total) * 100;

    const circumference = 2 * Math.PI * 40;
    const approvedDash = (approvedPct / 100) * circumference;
    const flaggedDash = (flaggedPct / 100) * circumference;
    const blockedDash = (blockedPct / 100) * circumference;

    return (
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Approved */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#10B981"
            strokeWidth="12"
            strokeDasharray={`${approvedDash} ${circumference}`}
            strokeDashoffset="0"
          />
          {/* Flagged */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="12"
            strokeDasharray={`${flaggedDash} ${circumference}`}
            strokeDashoffset={-approvedDash}
          />
          {/* Blocked */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#EF4444"
            strokeWidth="12"
            strokeDasharray={`${blockedDash} ${circumference}`}
            strokeDashoffset={-(approvedDash + flaggedDash)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white font-bold text-lg">{total.toLocaleString()}</p>
            <p className="text-slate-400 text-xs">Total</p>
          </div>
        </div>
      </div>
    );
  };

  // Prepare hourly data for chart
  const hourlyChartData = data.hourlyData.slice(-12).map(h => ({
    label: `${h.hour}h`,
    value: h.count,
    secondaryValue: h.flagged,
    color: 'bg-cyan-500',
  }));
  const maxHourly = Math.max(...hourlyChartData.map(d => d.value), 1);

  // Prepare daily data for chart with volume
  const dailyChartData = data.dailyData.map(d => ({
    label: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    value: d.count,
    volume: d.volume,
    secondaryValue: d.flagged,
    color: 'bg-purple-500',
  }));
  const maxDaily = Math.max(...dailyChartData.map(d => d.value), 1);

  // Calculate trends
  const todayTransactions = data.dailyData[data.dailyData.length - 1]?.count || 0;
  const yesterdayTransactions = data.dailyData[data.dailyData.length - 2]?.count || 0;
  const transactionTrend = yesterdayTransactions > 0 
    ? ((todayTransactions - yesterdayTransactions) / yesterdayTransactions) * 100 
    : 0;

  const todayVolume = data.dailyData[data.dailyData.length - 1]?.volume || 0;
  const yesterdayVolume = data.dailyData[data.dailyData.length - 2]?.volume || 0;
  const volumeTrend = yesterdayVolume > 0 
    ? ((todayVolume - yesterdayVolume) / yesterdayVolume) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Real-Time Insights */}
      {transactions.length > 0 && (
        <RealTimeInsights transactions={transactions} analytics={data} />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 hover:border-cyan-500/50 transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-slate-400 text-sm">Total Transactions</span>
          </div>
          <p className="text-white font-bold text-2xl mb-1">{transactions.length.toLocaleString()}</p>
          <div className="flex items-center gap-1">
            {transactionTrend !== 0 && (
              <>
                <svg className={`w-3 h-3 ${transactionTrend > 0 ? 'text-emerald-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d={transactionTrend > 0 
                    ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  } clipRule="evenodd" />
                </svg>
                <span className={`text-xs font-medium ${transactionTrend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {Math.abs(transactionTrend).toFixed(1)}%
                </span>
              </>
            )}
            <span className="text-xs text-slate-500">Live feed count</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 hover:border-emerald-500/50 transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <span className="text-2xl">₹</span>
            </div>
            <span className="text-slate-400 text-sm">Total Volume</span>
          </div>
          <p className="text-white font-bold text-2xl mb-1">{formatINR(transactions.reduce((sum, t) => sum + t.amount, 0))}</p>
          <div className="flex items-center gap-1">
            {volumeTrend !== 0 && (
              <>
                <svg className={`w-3 h-3 ${volumeTrend > 0 ? 'text-emerald-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d={volumeTrend > 0 
                    ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  } clipRule="evenodd" />
                </svg>
                <span className={`text-xs font-medium ${volumeTrend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {Math.abs(volumeTrend).toFixed(1)}%
                </span>
              </>
            )}
            <span className="text-xs text-slate-500">vs yesterday</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 hover:border-amber-500/50 transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-slate-400 text-sm">Fraud Rate</span>
          </div>
          <p className="text-amber-400 font-bold text-2xl mb-1">{data.fraudRate.toFixed(1)}%</p>
          <div className="text-xs text-slate-500">
            {data.flaggedCount + data.blockedCount} suspicious
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 hover:border-purple-500/50 transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-slate-400 text-sm">Avg Risk Score</span>
          </div>
          <p className="text-white font-bold text-2xl mb-1">{data.avgRiskScore}</p>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
            <div 
              className={`h-full rounded-full ${
                data.avgRiskScore > 70 ? 'bg-red-500' :
                data.avgRiskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${data.avgRiskScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Charts Row - Improved Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hourly Transactions */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Hourly Activity (Last 12 Hours)</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-xs text-slate-400">Total</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs text-slate-400">Flagged</span>
              </div>
            </div>
          </div>
          <BarChart data={hourlyChartData} maxValue={maxHourly} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Peak Hour</div>
              <div className="text-cyan-400 font-bold">
                {data.hourlyData.reduce((max, curr) => curr.count > max.count ? curr : max).hour}:00
              </div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Avg/Hour</div>
              <div className="text-white font-bold">
                {Math.round(data.hourlyData.reduce((sum, h) => sum + h.count, 0) / data.hourlyData.length).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Transactions */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">7-Day Trend</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-xs text-slate-400">Total</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs text-slate-400">Flagged</span>
              </div>
            </div>
          </div>
          <BarChart data={dailyChartData} maxValue={maxDaily} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Avg Daily Volume</div>
              <div className="text-purple-400 font-bold">
                {formatINR(data.dailyData.reduce((sum, d) => sum + d.volume, 0) / data.dailyData.length)}
              </div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Peak Day</div>
              <div className="text-white font-bold">
                {new Date(data.dailyData.reduce((max, d) => d.count > max.count ? d : max).date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Transaction Distribution</h3>
            <div className="text-xs text-slate-400">Real-time</div>
          </div>
          <div className="flex items-center justify-center">
            <DonutChart
              approved={data.approvedCount}
              flagged={data.flaggedCount}
              blocked={data.blockedCount}
            />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-400 text-sm">Approved</span>
              </div>
              <div className="text-right">
                <span className="text-white font-medium">{data.approvedCount.toLocaleString()}</span>
                <span className="text-emerald-400 text-xs ml-2">
                  {((data.approvedCount / data.totalTransactions) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-400 text-sm">Flagged</span>
              </div>
              <div className="text-right">
                <span className="text-white font-medium">{data.flaggedCount.toLocaleString()}</span>
                <span className="text-amber-400 text-xs ml-2">
                  {((data.flaggedCount / data.totalTransactions) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-400 text-sm">Blocked</span>
              </div>
              <div className="text-right">
                <span className="text-white font-medium">{data.blockedCount.toLocaleString()}</span>
                <span className="text-red-400 text-xs ml-2">
                  {((data.blockedCount / data.totalTransactions) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Volume Trend Over Time */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Transaction Volume Trend</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Last 7 days</span>
            <div className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 rounded">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400">Live</span>
            </div>
          </div>
        </div>
        <LineChart data={data.dailyData.map(d => ({ 
          label: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          value: d.count,
          volume: d.volume
        }))} />
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">Current Volume (Live)</div>
            <div className="text-white font-bold">
              {formatINR(transactions.reduce((sum, t) => sum + t.amount, 0))}
            </div>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">7d Total Volume</div>
            <div className="text-white font-bold">
              {formatINR(data.dailyData.reduce((sum, d) => sum + d.volume, 0))}
            </div>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">Daily Avg</div>
            <div className="text-white font-bold">
              {formatINR(data.dailyData.reduce((sum, d) => sum + d.volume, 0) / data.dailyData.length)}
            </div>
          </div>
        </div>
      </div>

      {/* Model Performance */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg">XAI Model Performance Metrics</h3>
          </div>
          <span className="text-xs text-emerald-400 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
            Excellent
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            className="bg-slate-900/50 rounded-xl p-4 hover:bg-slate-900/70 transition-all cursor-pointer"
            onMouseEnter={() => setHoveredMetric('precision')}
            onMouseLeave={() => setHoveredMetric(null)}
          >
            <p className="text-slate-400 text-sm mb-2">Precision</p>
            <p className="text-emerald-400 font-bold text-2xl mb-2">{data.modelMetrics.precision.toFixed(1)}%</p>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${data.modelMetrics.precision}%` }} />
            </div>
            {hoveredMetric === 'precision' && (
              <p className="text-xs text-slate-400 mt-2">True positive rate - accuracy of fraud predictions</p>
            )}
          </div>
          <div 
            className="bg-slate-900/50 rounded-xl p-4 hover:bg-slate-900/70 transition-all cursor-pointer"
            onMouseEnter={() => setHoveredMetric('recall')}
            onMouseLeave={() => setHoveredMetric(null)}
          >
            <p className="text-slate-400 text-sm mb-2">Recall</p>
            <p className="text-cyan-400 font-bold text-2xl mb-2">{data.modelMetrics.recall.toFixed(1)}%</p>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${data.modelMetrics.recall}%` }} />
            </div>
            {hoveredMetric === 'recall' && (
              <p className="text-xs text-slate-400 mt-2">Detection rate - % of frauds caught by model</p>
            )}
          </div>
          <div 
            className="bg-slate-900/50 rounded-xl p-4 hover:bg-slate-900/70 transition-all cursor-pointer"
            onMouseEnter={() => setHoveredMetric('f1')}
            onMouseLeave={() => setHoveredMetric(null)}
          >
            <p className="text-slate-400 text-sm mb-2">F1 Score</p>
            <p className="text-purple-400 font-bold text-2xl mb-2">{data.modelMetrics.f1Score.toFixed(1)}%</p>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${data.modelMetrics.f1Score}%` }} />
            </div>
            {hoveredMetric === 'f1' && (
              <p className="text-xs text-slate-400 mt-2">Harmonic mean of precision and recall</p>
            )}
          </div>
          <div 
            className="bg-slate-900/50 rounded-xl p-4 hover:bg-slate-900/70 transition-all cursor-pointer"
            onMouseEnter={() => setHoveredMetric('accuracy')}
            onMouseLeave={() => setHoveredMetric(null)}
          >
            <p className="text-slate-400 text-sm mb-2">Accuracy</p>
            <p className="text-amber-400 font-bold text-2xl mb-2">{data.modelMetrics.accuracy.toFixed(1)}%</p>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${data.modelMetrics.accuracy}%` }} />
            </div>
            {hoveredMetric === 'accuracy' && (
              <p className="text-xs text-slate-400 mt-2">Overall correctness across all predictions</p>
            )}
          </div>
        </div>
        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-purple-300 text-sm font-medium mb-1">Model Insights</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                The XAI model is performing exceptionally well with {data.modelMetrics.accuracy.toFixed(1)}% overall accuracy. 
                Detection rate is {data.modelMetrics.recall.toFixed(1)}%, catching {Math.round(data.modelMetrics.recall * (data.flaggedCount + data.blockedCount) / 100)} out of {data.flaggedCount + data.blockedCount} fraudulent transactions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Fraud Risk by Category</h3>
            <span className="text-xs text-slate-400">Sorted by risk</span>
          </div>
          <div className="space-y-3">
            {data.categoryData
              .sort((a, b) => b.flaggedRate - a.flaggedRate)
              .slice(0, 8)
              .map((cat, index) => (
              <div key={index} className="hover:bg-slate-700/30 p-2 rounded-lg transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      index < 3 ? 'bg-red-500/20 text-red-400' :
                      index < 5 ? 'bg-amber-500/20 text-amber-400' : 
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      #{index + 1}
                    </span>
                    <span className="text-slate-300 text-sm font-medium">{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${
                      cat.flaggedRate > 15 ? 'text-red-400' :
                      cat.flaggedRate > 10 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {cat.flaggedRate.toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-500 ml-2">
                      {cat.count} txns
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat.flaggedRate > 15 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      cat.flaggedRate > 10 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 
                      'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    }`}
                    style={{ width: `${Math.min(cat.flaggedRate * 5, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* State-wise Analysis */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Top States by Transaction Volume</h3>
            <span className="text-xs text-slate-400">Top 8</span>
          </div>
          <div className="space-y-3">
            {data.stateData
              .sort((a, b) => b.volume - a.volume)
              .slice(0, 8)
              .map((state, index) => {
                const fraudRate = state.count > 0 ? (state.flaggedCount / state.count) * 100 : 0;
                return (
                  <div key={index} className="hover:bg-slate-700/30 p-2 rounded-lg transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 w-6">#{index + 1}</span>
                        <span className="text-slate-300 text-sm font-medium">{state.state}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          fraudRate > 15 ? 'bg-red-500/20 text-red-400' :
                          fraudRate > 10 ? 'bg-amber-500/20 text-amber-400' : 
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {fraudRate.toFixed(1)}% risk
                        </span>
                      </div>
                      <span className="text-white text-sm font-bold">
                        {formatINR(state.volume)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{state.count.toLocaleString()} transactions</span>
                      <span>•</span>
                      <span className="text-red-400">{state.flaggedCount} flagged</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Detection Speed */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold">Avg Detection Time</h3>
          </div>
          <p className="text-cyan-400 font-bold text-3xl mb-2">47ms</p>
          <p className="text-slate-400 text-sm">Real-time fraud analysis with XAI explanations</p>
          <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">Processing</span>
              <span className="text-cyan-400">23ms</span>
            </div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">ML Inference</span>
              <span className="text-cyan-400">18ms</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Blockchain</span>
              <span className="text-cyan-400">6ms</span>
            </div>
          </div>
        </div>

        {/* Cost Savings */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold">Fraud Prevented</h3>
          </div>
          <p className="text-emerald-400 font-bold text-3xl mb-2">
            {formatINR(data.blockedCount * 45000)}
          </p>
          <p className="text-slate-400 text-sm">Estimated amount saved from blocked frauds</p>
          <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Blocked Transactions</span>
              <span className="text-emerald-400 font-medium">{data.blockedCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold">System Uptime</h3>
          </div>
          <p className="text-purple-400 font-bold text-3xl mb-2">99.8%</p>
          <p className="text-slate-400 text-sm">Reliable 24/7 fraud detection service</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between p-2 bg-emerald-500/10 rounded">
              <span className="text-xs text-slate-400">Payment Gateway</span>
              <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-emerald-500/10 rounded">
              <span className="text-xs text-slate-400">ML Model</span>
              <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
