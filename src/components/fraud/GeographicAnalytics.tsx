import React, { useState } from 'react';
import { Transaction, IndianState, INDIAN_CITIES } from '@/types/fraud';
import { formatINR } from '@/utils/transactionGenerator';
import InteractiveIndiaMap from './InteractiveIndiaMap';

interface GeographicAnalyticsProps {
  stateData: IndianState[];
  transactions: Transaction[];
  onStateClick?: (state: IndianState) => void;
}

const GeographicAnalytics: React.FC<GeographicAnalyticsProps> = ({
  stateData,
  transactions,
  onStateClick
}) => {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Calculate stats
  const getStateTransactions = (stateName: string) => {
    return transactions.filter(t => t.location.state === stateName);
  };

  const getCityTransactions = (stateName: string) => {
    const stateTransactions = getStateTransactions(stateName);
    const cityMap = new Map<string, {
      count: number;
      volume: number;
      frauds: number;
      lat: number;
      lng: number;
      flagged: number;
    }>();

    stateTransactions.forEach(t => {
      if (!cityMap.has(t.location.city)) {
        const cityData = INDIAN_CITIES.find(c => c.city === t.location.city);
        cityMap.set(t.location.city, {
          count: 0,
          volume: 0,
          frauds: 0,
          flagged: 0,
          lat: cityData?.lat || t.location.coordinates.lat,
          lng: cityData?.lng || t.location.coordinates.lng,
        });
      }
      const data = cityMap.get(t.location.city)!;
      data.count++;
      data.volume += t.amount;
      if (t.status === 'blocked') data.frauds++;
      if (t.status === 'flagged') data.flagged++;
    });

    return Array.from(cityMap.entries()).sort((a, b) => b[1].volume - a[1].volume);
  };

  const getRiskColor = (riskLevel: string) => {
    if (riskLevel === 'high') return 'bg-red-500';
    if (riskLevel === 'medium') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getRiskTextColor = (riskLevel: string) => {
    if (riskLevel === 'high') return 'text-red-400';
    if (riskLevel === 'medium') return 'text-amber-400';
    return 'text-emerald-400';
  };

  const selectedStateData = selectedState ? stateData.find(s => s.name === selectedState) : null;
  const selectedCities = selectedState ? getCityTransactions(selectedState) : [];
  const selectedCityData = selectedCity && selectedState ?
    selectedCities.find(c => c[0] === selectedCity)?.[1] : null;

  // Indian states with approximate boundaries (lat/lng ranges for mapping)
  const stateCoordinates: Record<string, {
    lat: number;
    lng: number;
    label_lat: number;
    label_lng: number
  }> = {
    'Maharashtra': { lat: 19.7515, lng: 75.7139, label_lat: 19.5, label_lng: 75.5 },
    'Delhi': { lat: 28.7041, lng: 77.1025, label_lat: 28.8, label_lng: 77.2 },
    'Karnataka': { lat: 15.3173, lng: 75.7139, label_lat: 15.5, label_lng: 75.5 },
    'Tamil Nadu': { lat: 11.1271, lng: 79.2787, label_lat: 11.0, label_lng: 79.5 },
    'Gujarat': { lat: 22.2587, lng: 71.1924, label_lat: 22.5, label_lng: 71.5 },
    'Uttar Pradesh': { lat: 26.8467, lng: 80.9462, label_lat: 26.5, label_lng: 81.5 },
    'West Bengal': { lat: 24.8355, lng: 88.2676, label_lat: 24.5, label_lng: 88.5 },
    'Rajasthan': { lat: 27.0238, lng: 74.2179, label_lat: 27.0, label_lng: 74.5 },
    'Telangana': { lat: 18.1124, lng: 79.0193, label_lat: 18.0, label_lng: 79.5 },
    'Kerala': { lat: 10.8505, lng: 76.2711, label_lat: 10.5, label_lng: 76.5 },
    'Madhya Pradesh': { lat: 22.9375, lng: 78.6553, label_lat: 23.0, label_lng: 79.0 },
    'Punjab': { lat: 31.1471, lng: 75.3412, label_lat: 31.5, label_lng: 75.5 },
    'Haryana': { lat: 29.0588, lng: 77.0745, label_lat: 29.5, label_lng: 77.5 },
    'Bihar': { lat: 25.0961, lng: 85.3131, label_lat: 25.5, label_lng: 85.5 },
    'Odisha': { lat: 20.9517, lng: 85.0985, label_lat: 20.5, label_lng: 85.5 }
  };

  // Map projection: Convert lat/lng to SVG coordinates (simplified Mercator)
  const projectToSVG = (lat: number, lng: number): [number, number] => {
    // India bounds approximately
    const minLat = 8, maxLat = 37;
    const minLng = 68, maxLng = 97;

    const svgWidth = 600;
    const svgHeight = 500;

    const x = ((lng - minLng) / (maxLng - minLng)) * svgWidth;
    const y = ((maxLat - lat) / (maxLat - minLat)) * svgHeight;

    return [x, y];
  };

  // Calculate total transactions and volume
  const totalTransactions = transactions.length;
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalFraudCount = transactions.filter(t => t.status === 'blocked').length;
  const totalFlaggedCount = transactions.filter(t => t.status === 'flagged').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <svg className="w-7 h-7 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
            Real-Time Geographic Analysis - India
          </h2>
          <p className="text-slate-400 text-sm">Transactions mapped by state and city across India</p>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Total Transactions</span>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-white text-2xl font-bold mt-2">{totalTransactions.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Total Volume</span>
            <span className="text-2xl">₹</span>
          </div>
          <p className="text-white text-2xl font-bold mt-2">{formatINR(totalVolume)}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Flagged</span>
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-white text-2xl font-bold mt-2">{totalFlaggedCount.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Blocked</span>
            <span className="text-2xl">🚫</span>
          </div>
          <p className="text-white text-2xl font-bold mt-2">{totalFraudCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Main Content - Map and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real India Map */}
        <div className="lg:col-span-2 h-[550px]">
          <InteractiveIndiaMap
            stateData={stateData}
            transactions={transactions}
            onStateClick={(state) => {
              setSelectedState(state.name);
              onStateClick?.(state);
            }}
            onCityClick={(city, state) => {
              setSelectedCity(city);
              setSelectedState(state);
            }}
            className="h-full"
          />
        </div>

        {/* Right Panel - State & City Details */}
        <div className="space-y-4">
          {/* State Selection */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
            <h4 className="text-white font-bold mb-3">📍 States</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {stateData.map((state) => {
                const stateTransactions = getStateTransactions(state.name);
                const isSelected = selectedState === state.name;

                return (
                  <button
                    key={state.name}
                    onClick={() => setSelectedState(state.name)}
                    className={`w-full p-3 rounded-lg text-left transition-all text-sm ${isSelected
                        ? 'bg-blue-500/30 border border-blue-500/50'
                        : 'bg-slate-700/50 border border-slate-600/30 hover:bg-slate-700'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getRiskColor(state.riskLevel)}`}></div>
                        <span className="text-white font-medium">{state.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">{stateTransactions.length}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* City Details */}
          {selectedState && (
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
              <h4 className="text-white font-bold mb-3">🏙️ Cities in {selectedState}</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {selectedCities.length > 0 ? (
                  selectedCities.slice(0, 8).map(([city, data]) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`w-full p-2 rounded-lg text-left transition-all text-xs ${selectedCity === city
                          ? 'bg-purple-500/30 border border-purple-500/50'
                          : 'bg-slate-700/50 hover:bg-slate-700'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-white font-medium">{city}</span>
                        <span className="text-emerald-400">{data.count}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 mt-1">
                        <span>{formatINR(data.volume)}</span>
                        {data.frauds > 0 && <span className="text-red-400">🚫 {data.frauds}</span>}
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs">No transactions</p>
                )}
              </div>
            </div>
          )}

          {/* Selected City Details */}
          {selectedCityData && (
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
              <h4 className="text-white font-bold mb-3">📊 {selectedCity} Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Transactions:</span>
                  <span className="text-white font-bold">{selectedCityData.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Volume:</span>
                  <span className="text-emerald-400 font-bold">{formatINR(selectedCityData.volume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Flagged:</span>
                  <span className="text-amber-400 font-bold">{selectedCityData.flagged}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Blocked:</span>
                  <span className="text-red-400 font-bold">{selectedCityData.frauds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Amount:</span>
                  <span className="text-purple-400 font-bold">{formatINR(selectedCityData.volume / selectedCityData.count)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed State Table */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="text-white font-bold flex items-center gap-2">
            <span>📈</span>
            State-wise Analysis
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/50">
                <th className="text-left py-3 px-4 text-slate-400 text-xs font-semibold">State</th>
                <th className="text-right py-3 px-4 text-slate-400 text-xs font-semibold">Transactions</th>
                <th className="text-right py-3 px-4 text-slate-400 text-xs font-semibold">Volume</th>
                <th className="text-right py-3 px-4 text-slate-400 text-xs font-semibold">Flagged</th>
                <th className="text-right py-3 px-4 text-slate-400 text-xs font-semibold">Blocked</th>
                <th className="text-center py-3 px-4 text-slate-400 text-xs font-semibold">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {stateData.map((state) => {
                const stateTransactions = getStateTransactions(state.name);
                const volume = stateTransactions.reduce((sum, t) => sum + t.amount, 0);
                const flagged = stateTransactions.filter(t => t.status === 'flagged').length;
                const blocked = stateTransactions.filter(t => t.status === 'blocked').length;

                return (
                  <tr
                    key={state.name}
                    className="border-b border-slate-700/30 hover:bg-slate-900/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedState(state.name)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getRiskColor(state.riskLevel)}`}></div>
                        <span className="text-white font-medium">{state.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-white">{stateTransactions.length.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-emerald-400 font-medium">{formatINR(volume)}</td>
                    <td className="text-right py-3 px-4 text-amber-400 font-medium">{flagged}</td>
                    <td className="text-right py-3 px-4 text-red-400 font-medium">{blocked}</td>
                    <td className="text-center py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${state.riskLevel === 'high' ? 'bg-red-500/30 text-red-300' :
                          state.riskLevel === 'medium' ? 'bg-amber-500/30 text-amber-300' :
                            'bg-emerald-500/30 text-emerald-300'
                        }`}>
                        {state.riskLevel.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GeographicAnalytics;
