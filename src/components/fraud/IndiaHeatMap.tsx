import React, { useEffect, useState, useMemo } from 'react';
import { IndianState, Transaction, INDIAN_CITIES } from '@/types/fraud';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface IndiaHeatMapProps {
  stateData: IndianState[];
  transactions?: Transaction[];
  onStateClick?: (state: IndianState) => void;
  showList?: boolean;
  className?: string;
}

// Helper component to handle map animations
const MapRefocus = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

const IndiaHeatMap: React.FC<IndiaHeatMapProps> = ({
  stateData,
  transactions = [],
  onStateClick,
  showList = true,
  className
}) => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState<{ center: [number, number], zoom: number }>({ center: [22.5937, 78.9629], zoom: 4 });
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Calculate City Data from transactions
  const cityData = useMemo(() => {
    if (!transactions.length) return [];

    const cityMap = new Map<string, { lat: number, lng: number, count: number, volume: number, fraud: number, city: string }>();

    transactions.forEach(t => {
      const cityObj = INDIAN_CITIES.find(c => c.city === t.location.city);
      // Use coordinates from transaction or fallback to predefined city coords
      const lat = t.location.coordinates?.lat || cityObj?.lat;
      const lng = t.location.coordinates?.lng || cityObj?.lng;

      if (lat && lng) {
        const key = `${lat}-${lng}`;
        if (!cityMap.has(key)) {
          cityMap.set(key, { lat, lng, count: 0, volume: 0, fraud: 0, city: t.location.city });
        }
        const data = cityMap.get(key)!;
        data.count++;
        data.volume += t.amount;
        if (t.status === 'blocked' || t.status === 'flagged') {
          data.fraud++;
        }
      }
    });
    return Array.from(cityMap.values());
  }, [transactions]);

  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        // Fetching a reliable GeoJSON source for Indian States
        const response = await fetch('https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States');

        // Alternate reliable source for India States GeoJSON if needed
        // const res = await fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson');

        // Using a comprehensive file from a different source
        const finalRes = await fetch('https://raw.githubusercontent.com/HindustanTimesLabs/shapefiles/master/state_level/st_2011.json');

        if (!finalRes.ok) throw new Error("Failed to fetch Map Data");
        const data = await finalRes.json();
        setGeoJsonData(data);
      } catch (error) {
        console.error("Error loading map data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGeoJSON();
  }, []);

  const getRiskColor = (riskLevel: IndianState['riskLevel']) => {
    switch (riskLevel) {
      case 'high': return '#ef4444'; // red-500
      case 'medium': return '#f59e0b'; // amber-500
      case 'low': return '#10b981'; // emerald-500
      default: return '#64748b'; // slate-500
    }
  };

  const getRiskClass = (riskLevel: IndianState['riskLevel']) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  const getRiskBgColor = (riskLevel: IndianState['riskLevel']) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30';
      case 'medium': return 'bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30';
      case 'low': return 'bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30';
      default: return 'bg-slate-500/20 border-slate-500/30';
    }
  };

  const getStateData = (stateName: string) => {
    // Fuzzy match or exact match state names
    return stateData.find(s =>
      s.name.toLowerCase() === stateName.toLowerCase() ||
      stateName.toLowerCase().includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().includes(stateName.toLowerCase())
    );
  };

  const style = (feature: any) => {
    const stateName = feature.properties.ST_NM || feature.properties.state_name || feature.properties.name;
    const data = getStateData(stateName);
    const riskLevel = data?.riskLevel || 'low';
    const isHovered = hoveredState === stateName;

    return {
      fillColor: getRiskColor(riskLevel),
      weight: isHovered ? 2 : 1,
      opacity: 1,
      color: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
      dashArray: '3',
      fillOpacity: isHovered ? 0.8 : 0.4
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const stateName = feature.properties.ST_NM || feature.properties.state_name || feature.properties.name;
    const data = getStateData(stateName);

    layer.on({
      mouseover: () => {
        setHoveredState(stateName);
        layer.openTooltip();
        // Highlight logic in style function via state
      },
      mouseout: () => {
        setHoveredState(null);
        layer.closeTooltip();
      },
      click: (e: any) => {
        if (data) onStateClick?.(data);
        const bounds = e.target.getBounds();
        setMapView({ center: bounds.getCenter(), zoom: 6 }); // Zoom into state
      }
    });

    if (data) {
      layer.bindTooltip(`
            <div class="text-center">
                <div class="font-bold">${data.name}</div>
                <div class="text-xs">Txns: ${data.transactionCount} | Risk: ${data.riskLevel.toUpperCase()}</div>
            </div>
        `, {
        permanent: false,
        direction: 'center',
        className: 'custom-tooltip bg-slate-900/90 text-white border border-slate-700/50 rounded px-2 py-1'
      });

      layer.bindPopup(`
            <div class="p-2 min-w-[150px]">
                <h4 class="font-bold text-sm mb-1 text-slate-900">${data.name} (${data.code})</h4>
                <div class="text-xs space-y-1 text-slate-700">
                    <p><strong>Risk Level:</strong> <span class="uppercase font-bold" style="color:${getRiskColor(data.riskLevel)}">${data.riskLevel}</span></p>
                    <p><strong>Transactions:</strong> ${data.transactionCount.toLocaleString()}</p>
                    <p><strong>Fraud Cases:</strong> ${data.fraudCount}</p>
                </div>
            </div>
        `);
    }
  };

  const sortedStates = [...stateData].sort((a, b) => b.transactionCount - a.transactionCount);

  return (
    <div className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 h-full flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Interactive India Fraud Map
            {loading && <span className="text-xs text-slate-400 animate-pulse">(Loading Geography...)</span>}
          </h3>
          <p className="text-slate-400 text-sm">Real-time state-level boundaries & transaction clusters</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMapView({ center: [22.5937, 78.9629], zoom: 4 })}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-colors border border-slate-600"
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-slate-900/50 rounded-xl p-2 mb-6 overflow-hidden flex-grow min-h-[400px] border border-slate-700/30">
        <MapContainer
          center={mapView.center}
          zoom={mapView.zoom}
          style={{ height: '100%', width: '100%', minHeight: '400px', borderRadius: '0.75rem', background: '#0f172a' }}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          zoomControl={false}
        >
          <MapRefocus center={mapView.center} zoom={mapView.zoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_nomLabels/{z}/{x}/{y}{r}.png"
          />
          {geoJsonData && !loading && (
            <GeoJSON
              data={geoJsonData}
              style={style}
              onEachFeature={onEachFeature}
            />
          )}

          {/* Render City Markers */}
          {cityData.map((city, idx) => (
            <CircleMarker
              key={idx}
              center={[city.lat, city.lng]}
              pathOptions={{
                fillColor: city.fraud > 0 ? '#ef4444' : '#3b82f6', // Red if fraud, Blue otherwise
                color: '#ffffff',
                weight: 1,
                fillOpacity: 0.8
              }}
              radius={Math.max(4, Math.min(15, city.count / 2))}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-bold text-sm text-slate-900">{city.city}</h4>
                  <div className="text-xs text-slate-700">
                    <p>Transactions: {city.count}</p>
                    <p>Volume: ₹{city.volume.toLocaleString()}</p>
                    {city.fraud > 0 && <p className="text-red-600 font-bold">Fraud: {city.fraud}</p>}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Live Indicator Overlay */}
        <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md rounded-lg p-3 border border-slate-600/50 shadow-xl">
          <p className="text-slate-300 font-semibold text-xs uppercase tracking-wider mb-1">Live Transactions</p>
          <p className="text-emerald-400 text-lg font-mono font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            {stateData.reduce((sum, s) => sum + s.transactionCount, 0).toLocaleString()}
          </p>
        </div>

        {/* Legend Overlay - Bottom Right */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md rounded-lg p-3 border border-slate-600/50 shadow-xl flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-slate-300 text-xs">Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className="text-slate-300 text-xs">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <span className="text-slate-300 text-xs">High Risk</span>
          </div>
          <div className="border-t border-slate-700 my-1 pt-1"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-slate-300 text-xs">Txn Cluster</span>
          </div>
        </div>
      </div>

      {/* State List (Optional) */}
      {showList && (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {sortedStates.map((state) => (
            <div
              key={state.code}
              onClick={() => {
                onStateClick?.(state);
                setMapView({ center: [state.coordinates.lat, state.coordinates.lng], zoom: 6 });
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${getRiskBgColor(state.riskLevel)} group hover:scale-[1.01]`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getRiskClass(state.riskLevel)} group-hover:animate-pulse`} />
                  <div>
                    <p className="text-white font-medium text-sm">{state.name}</p>
                    <p className="text-slate-400 text-xs">{state.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{state.transactionCount.toLocaleString()}</p>
                  <div className="flex items-center justify-end gap-1">
                    <p className={`text-xs ${state.riskLevel === 'high' ? 'text-red-400' :
                      state.riskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                      {state.fraudCount} flagged
                    </p>
                    {state.riskLevel === 'high' && (
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IndiaHeatMap;
