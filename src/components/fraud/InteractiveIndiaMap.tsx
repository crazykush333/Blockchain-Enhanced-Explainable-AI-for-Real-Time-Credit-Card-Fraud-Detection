import React, { useEffect, useState, useMemo, useRef } from 'react';
import { IndianState, Transaction, INDIAN_CITIES } from '@/types/fraud';
import { formatINR } from '@/utils/transactionGenerator';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface InteractiveIndiaMapProps {
  stateData: IndianState[];
  transactions: Transaction[];
  onStateClick?: (state: IndianState) => void;
  onCityClick?: (city: string, state: string, count: number) => void;
  className?: string;
}

// Helper to fix default marker icons
const fixMarkerIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

const InteractiveIndiaMap: React.FC<InteractiveIndiaMapProps> = ({
  stateData,
  transactions,
  onStateClick,
  onCityClick,
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const circleMarkers = useRef<L.CircleMarker[]>([]);
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  
  fixMarkerIcons();

  // Calculate city data from transactions
  const cityData = useMemo(() => {
    if (!transactions.length) return [];

    const cityMap = new Map<string, {
      lat: number;
      lng: number;
      count: number;
      volume: number;
      fraud: number;
      flagged: number;
      city: string;
      state: string;
      riskLevel: 'high' | 'medium' | 'low';
    }>();

    transactions.forEach(t => {
      const cityKey = `${t.location.city}-${t.location.state}`;
      const cityObj = INDIAN_CITIES.find(c => c.city === t.location.city);

      const lat = t.location.coordinates?.lat || cityObj?.lat;
      const lng = t.location.coordinates?.lng || cityObj?.lng;

      if (lat && lng) {
        if (!cityMap.has(cityKey)) {
          cityMap.set(cityKey, {
            lat,
            lng,
            count: 0,
            volume: 0,
            fraud: 0,
            flagged: 0,
            city: t.location.city,
            state: t.location.state,
            riskLevel: 'low'
          });
        }

        const data = cityMap.get(cityKey)!;
        data.count++;
        data.volume += t.amount;
        if (t.status === 'blocked') data.fraud++;
        if (t.status === 'flagged') data.flagged++;
      }
    });

    // Assign risk levels after aggregation
    const enriched = Array.from(cityMap.values()).map(city => {
      const fraudRatio = city.count === 0 ? 0 : (city.fraud + city.flagged) / city.count;
      let riskLevel: 'high' | 'medium' | 'low' = 'low';
      if (fraudRatio >= 0.2) riskLevel = 'high';
      else if (fraudRatio >= 0.08) riskLevel = 'medium';
      return { ...city, riskLevel };
    });

    return enriched.sort((a, b) => b.count - a.count);
  }, [transactions]);

  // Get color based on transaction metrics
  const getCircleColor = (data: {
    count: number;
    volume: number;
    fraud: number;
    flagged: number;
    riskLevel?: 'high' | 'medium' | 'low';
  }): string => {
    const level = data.riskLevel ?? 'low';
    if (level === 'high') return '#ef4444';
    if (level === 'medium') return '#f59e0b';
    return '#10b981';
  };

  const getCircleRadius = (count: number, maxCount: number): number => {
    return Math.max(5, Math.min(25, (count / maxCount) * 25));
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Create map
    map.current = L.map(mapContainer.current).setView([20.5937, 78.9629], 4);

    // Add tile layer (English-only labels)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap, &copy; Carto',
      maxZoom: 19,
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const filteredCities = useMemo(() => (
    riskFilter === 'all' ? cityData : cityData.filter(c => c.riskLevel === riskFilter)
  ), [cityData, riskFilter]);

  // Add circles when data changes
  useEffect(() => {
    if (!map.current || !filteredCities.length) return;

    // Remove old circles
    circleMarkers.current.forEach(marker => marker.remove());
    circleMarkers.current = [];

    const maxCount = Math.max(...filteredCities.map(c => c.count));

    // Add new circles
    filteredCities.forEach(city => {
      const circle = L.circleMarker([city.lat, city.lng], {
        radius: getCircleRadius(city.count, maxCount),
        fillColor: getCircleColor(city),
        color: getCircleColor(city),
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.7
      });

      circle.bindPopup(`
        <div style="font-size: 12px; color: #333;">
          <div style="font-weight: bold; margin-bottom: 8px;">
            ${city.city}, ${city.state}
          </div>
          <div style="line-height: 1.6;">
            <div><strong>Transactions:</strong> ${city.count}</div>
            <div><strong>Volume:</strong> ${formatINR(city.volume)}</div>
            <div><strong>Flagged:</strong> ${city.flagged}</div>
            <div><strong>Blocked:</strong> ${city.fraud}</div>
            <div style="margin-top: 8px; color: #666; font-size: 11px;">
              Click for detailed analytics
            </div>
          </div>
        </div>
      `);

      circle.bindTooltip(`<strong>${city.city}</strong>: ${city.count} txn • ${formatINR(city.volume)} • ${city.riskLevel.toUpperCase()} RISK`, {
        direction: 'top',
        offset: [0, -10]
      });

      circle.on('click', () => {
        onCityClick?.(city.city, city.state, city.count);
      });

      circle.addTo(map.current!);
      circleMarkers.current.push(circle);
    });
  }, [filteredCities, onCityClick, riskFilter]);

  return (
    <div className={`bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '550px', zIndex: 1 }} />
      
      {/* Legend / Filters - Made smaller */}
      <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-slate-700 rounded-lg p-2 text-xs z-50 shadow-lg">
        <div className="font-semibold text-white mb-1.5 text-[11px]">Transaction Fraud Risk</div>
        <div className="space-y-1">
          {[{ id: 'all', label: 'All', color: 'bg-slate-400' }, { id: 'high', label: 'High (>=20%)', color: 'bg-red-500' }, { id: 'medium', label: 'Medium (8-20%)', color: 'bg-amber-500' }, { id: 'low', label: 'Low (<8%)', color: 'bg-emerald-500' }].map(item => (
            <button
              key={item.id}
              onClick={() => setRiskFilter(item.id as any)}
              className={`w-full flex items-center justify-between gap-1.5 px-1.5 py-1 rounded text-left transition border text-[11px] ${
                riskFilter === item.id
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span>{item.label}</span>
              </div>
              {riskFilter === item.id && <span className="text-[9px] uppercase tracking-wide text-white/80">✓</span>}
            </button>
          ))}
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-700 text-slate-400 text-[10px]">
          Circle size = Volume
        </div>
      </div>
    </div>
  );
};

export default InteractiveIndiaMap;
