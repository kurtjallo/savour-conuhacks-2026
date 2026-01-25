import { useState, useEffect, useCallback } from 'react';
import { optimizeRoute } from '../lib/api';
import type { RouteSettings, RouteOptimizeResponse, BasketItem } from '../lib/types';
import RouteMap from './RouteMap';
import useGeolocation from '../hooks/useGeolocation';

interface RouteOptimizerProps {
  basketItems: BasketItem[];
  multiStoreRecommended: boolean;
}

const DEFAULT_SETTINGS: RouteSettings = {
  gas_price_per_liter: 1.50,
  fuel_efficiency_l_per_100km: 10.0,
  time_value_per_hour: 15.0,
  time_per_store_minutes: 30,
};

export default function RouteOptimizer({ basketItems, multiStoreRecommended }: RouteOptimizerProps) {
  const { location: userLocation, isLoading: locationLoading, isUsingDefault, requestLocation } = useGeolocation();
  const [settings] = useState<RouteSettings>(DEFAULT_SETTINGS);
  const [routeResponse, setRouteResponse] = useState<RouteOptimizeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const fetchRoute = useCallback(async () => {
    if (!userLocation || basketItems.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const items = basketItems.map(item => ({
        category_id: item.category_id,
        quantity: item.quantity,
      }));
      const response = await optimizeRoute(items, userLocation, settings);
      setRouteResponse(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to optimize route';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userLocation, basketItems, settings]);

  // Auto-fetch when location becomes available
  useEffect(() => {
    if (userLocation && basketItems.length > 0 && !routeResponse && !loading) {
      fetchRoute();
    }
  }, [userLocation, basketItems.length, routeResponse, loading, fetchRoute]);

  if (!multiStoreRecommended) {
    return null;
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  return (
    <div className="bg-white rounded-2xl border border-savour-border overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-savour-border bg-gradient-to-r from-charcoal to-charcoal/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">Route Optimizer</h3>
            <p className="text-sm text-white/70">Is the trip worth it?</p>
          </div>
        </div>
      </div>

      {/* Location Bar */}
      <button
        onClick={isUsingDefault ? requestLocation : undefined}
        className={`w-full px-5 py-3 flex items-center justify-between text-sm border-b border-savour-border transition-colors
          ${isUsingDefault ? 'bg-amber-50 hover:bg-amber-100 cursor-pointer' : 'bg-green-50 cursor-default'}`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isUsingDefault ? 'bg-amber-500' : 'bg-green-500'} ${locationLoading ? 'animate-pulse' : ''}`} />
          <span className={isUsingDefault ? 'text-amber-800' : 'text-green-800'}>
            {locationLoading ? 'Finding your location...' : isUsingDefault ? 'Using default location (Toronto)' : 'Using your location'}
          </span>
        </div>
        {isUsingDefault && !locationLoading && (
          <span className="text-xs font-medium text-amber-600 hover:text-amber-700">
            Enable GPS
          </span>
        )}
      </button>

      {/* Content */}
      <div className="p-5">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-3 border-savour-border border-t-accent rounded-full animate-spin mb-4" />
            <p className="text-savour-text-secondary text-sm">Calculating best route...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-savour-text-secondary text-sm mb-3">{error}</p>
            <button
              onClick={fetchRoute}
              className="text-sm font-medium text-accent hover:text-accent/80"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {routeResponse && !loading && userLocation && (
          <div className="space-y-5">
            {/* Verdict Card */}
            <div className={`rounded-xl p-4 ${routeResponse.is_worth_it ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  routeResponse.is_worth_it ? 'bg-green-500' : 'bg-amber-500'
                }`}>
                  {routeResponse.is_worth_it ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${routeResponse.is_worth_it ? 'text-green-700' : 'text-amber-700'}`}>
                    {routeResponse.is_worth_it ? 'Multi-store trip is worth it!' : 'Stick to one store'}
                  </p>
                  <p className={`text-2xl font-bold ${routeResponse.is_worth_it ? 'text-green-600' : 'text-amber-600'}`}>
                    {routeResponse.is_worth_it
                      ? `Save $${routeResponse.net_savings.toFixed(2)}`
                      : `Save $${Math.abs(routeResponse.net_savings).toFixed(2)} by not driving`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-xl overflow-hidden border border-savour-border">
              <RouteMap
                userLocation={userLocation}
                storeVisits={routeResponse.stores_to_visit}
                routePolyline={routeResponse.route_polyline}
              />
            </div>

            {/* Route Steps - Horizontal */}
            {routeResponse.stores_to_visit.length > 0 && (
              <div className="flex items-center justify-center gap-2 flex-wrap py-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                  </svg>
                  Start
                </div>
                {routeResponse.stores_to_visit.map((visit, i) => (
                  <div key={visit.store.store_id} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: visit.store.color }}
                    >
                      <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-[10px]">
                        {i + 1}
                      </span>
                      {visit.store.name}
                    </div>
                  </div>
                ))}
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                  </svg>
                  Home
                </div>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-charcoal">{routeResponse.travel_cost.total_distance_km.toFixed(1)}</p>
                <p className="text-xs text-muted">km total</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-charcoal">{formatTime(routeResponse.travel_cost.total_trip_time_minutes)}</p>
                <p className="text-xs text-muted">trip time</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-charcoal">${routeResponse.travel_cost.gas_cost.toFixed(2)}</p>
                <p className="text-xs text-muted">gas cost</p>
              </div>
            </div>

            {/* Savings Breakdown - Compact */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-savour-text-secondary">Grocery savings</span>
                <span className="font-semibold text-green-600">+${routeResponse.grocery_savings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-savour-text-secondary">Travel cost</span>
                <span className="font-semibold text-red-500">-${routeResponse.travel_cost.total_travel_cost.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-charcoal">Net savings</span>
                  <span className={`text-xl font-bold ${routeResponse.net_savings >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {routeResponse.net_savings >= 0 ? '+' : ''}${routeResponse.net_savings.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs text-muted hover:text-charcoal transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              {showSettings ? 'Hide trip settings' : 'Adjust trip settings'}
            </button>

            {showSettings && (
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl text-sm">
                <div>
                  <label className="text-xs text-muted block mb-1">Gas ($/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.gas_price_per_liter}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">L/100km</label>
                  <input
                    type="number"
                    step="0.5"
                    value={settings.fuel_efficiency_l_per_100km}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Time value ($/hr)</label>
                  <input
                    type="number"
                    step="5"
                    value={settings.time_value_per_hour}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Min/store</label>
                  <input
                    type="number"
                    step="5"
                    value={settings.time_per_store_minutes}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    readOnly
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
