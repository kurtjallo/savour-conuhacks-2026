import { useState, useEffect, useCallback } from 'react';
import { optimizeRoute } from '../lib/api';
import type { Location, RouteSettings, RouteOptimizeResponse, BasketItem } from '../lib/types';
import RouteMap from './RouteMap';
import CostBreakdown from './CostBreakdown';
import RouteSettingsPanel from './RouteSettings';

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

// Toronto downtown as default fallback
const DEFAULT_LOCATION: Location = { lat: 43.6532, lng: -79.3832 };

export default function RouteOptimizer({ basketItems, multiStoreRecommended }: RouteOptimizerProps) {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [settings, setSettings] = useState<RouteSettings>(DEFAULT_SETTINGS);
  const [routeResponse, setRouteResponse] = useState<RouteOptimizeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Request user location
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Using downtown Toronto.');
      setUserLocation(DEFAULT_LOCATION);
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocationError('Could not get your location. Using downtown Toronto.');
        setUserLocation(DEFAULT_LOCATION);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, []);

  // Fetch route optimization when location and items are available
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
      console.error('Route optimization error:', err);
    } finally {
      setLoading(false);
    }
  }, [userLocation, basketItems, settings]);

  // Auto-fetch when location becomes available and panel is expanded
  useEffect(() => {
    if (userLocation && basketItems.length > 0 && isExpanded && !routeResponse) {
      fetchRoute();
    }
  }, [userLocation, isExpanded, basketItems.length, routeResponse, fetchRoute]);

  // Re-fetch when settings change (debounced)
  useEffect(() => {
    if (!userLocation || !isExpanded || !routeResponse) return;
    const timeoutId = setTimeout(fetchRoute, 500);
    return () => clearTimeout(timeoutId);
  }, [settings]);

  // Don't render if multi-store isn't recommended
  if (!multiStoreRecommended) {
    return null;
  }

  return (
    <div className="mt-6 bg-white border border-savour-border rounded-xl overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          if (!userLocation && !isExpanded) {
            requestLocation();
          }
        }}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-savour-accent/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-savour-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-medium text-savour-text">Route Optimizer</h3>
            <p className="text-sm text-savour-text-secondary">Is multi-store shopping worth it?</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-savour-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-savour-border pt-4">
          {/* Location Status */}
          {locationLoading && (
            <div className="flex items-center gap-2 text-sm text-savour-text-secondary">
              <div className="w-4 h-4 border-2 border-savour-border border-t-savour-accent rounded-full animate-spin" />
              <span>Getting your location...</span>
            </div>
          )}

          {locationError && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{locationError}</span>
            </div>
          )}

          {/* Settings Panel */}
          <RouteSettingsPanel settings={settings} onSettingsChange={setSettings} />

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-savour-border border-t-savour-accent rounded-full animate-spin" />
              <span className="ml-3 text-savour-text-secondary">Calculating optimal route...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={fetchRoute}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Try again
              </button>
            </div>
          )}

          {/* Results */}
          {routeResponse && !loading && userLocation && (
            <>
              {/* Map */}
              <RouteMap
                userLocation={userLocation}
                storeVisits={routeResponse.stores_to_visit}
                routePolyline={routeResponse.route_polyline}
              />

              {/* Store Visit Order */}
              {routeResponse.stores_to_visit.length > 1 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-savour-text mb-2">Optimized Route</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">You</span>
                    {routeResponse.stores_to_visit.map((visit, index) => (
                      <div key={visit.store.store_id} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-savour-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                        <span
                          className="text-xs px-2 py-1 rounded-full text-white font-medium"
                          style={{ backgroundColor: visit.store.color }}
                        >
                          {index + 1}. {visit.store.name}
                        </span>
                      </div>
                    ))}
                    <svg className="w-4 h-4 text-savour-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Home</span>
                  </div>
                </div>
              )}

              {/* Cost Breakdown */}
              <CostBreakdown response={routeResponse} />
            </>
          )}

          {/* Manual Refresh Button */}
          {userLocation && !loading && (
            <button
              onClick={fetchRoute}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-savour-accent hover:text-savour-accent-hover transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Recalculate Route
            </button>
          )}
        </div>
      )}
    </div>
  );
}
