import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getStoreLocations } from '../lib/api';
import type { StoreWithLocation } from '../lib/types';
import useGeolocation from '../hooks/useGeolocation';

// Fix Leaflet default marker icon issue with Vite bundling
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function FloatingStoreMap() {
  const { location: userLocation, isLoading: locationLoading, isUsingDefault, requestLocation } = useGeolocation();
  const [stores, setStores] = useState<StoreWithLocation[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Fetch store locations
  useEffect(() => {
    getStoreLocations()
      .then(setStores)
      .catch(err => console.error('Failed to fetch store locations:', err));
  }, []);

  // Initialize/update map when expanded and location available
  useEffect(() => {
    if (!isExpanded || isMinimized || !mapRef.current || locationLoading) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize map
    const map = L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 13);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Add user marker
    const userIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 20px;
        height: 20px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup(isUsingDefault ? 'Default Location (Montreal)' : 'Your Location');

    // Add store markers
    const bounds = L.latLngBounds([[userLocation.lat, userLocation.lng]]);

    stores.forEach(store => {
      const storeIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 28px;
          height: 28px;
          background: ${store.color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([store.lat, store.lng], { icon: storeIcon })
        .addTo(map)
        .bindPopup(`<strong>${store.name}</strong><br/>${store.address}`);

      bounds.extend([store.lat, store.lng]);
    });

    // Fit bounds to show all markers
    if (stores.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isExpanded, isMinimized, userLocation, stores, locationLoading, isUsingDefault]);

  // Don't render if minimized completely
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-24 right-4 z-40 w-12 h-12 bg-white rounded-full shadow-lg border border-border
                   flex items-center justify-center hover:shadow-xl transition-all duration-200"
        aria-label="Show store map"
      >
        <svg className="w-6 h-6 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-24 right-4 z-40 bg-white rounded-2xl shadow-xl border border-border overflow-hidden
                  transition-all duration-300 ease-out
                  ${isExpanded ? 'w-80 md:w-96' : 'w-64'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-cream">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-charcoal">Nearby Stores</h3>
            <p className="text-xs text-muted">{stores.length} locations</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label={isExpanded ? 'Collapse map' : 'Expand map'}
          >
            <svg className={`w-4 h-4 text-charcoal-light transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label="Minimize map"
          >
            <svg className="w-4 h-4 text-charcoal-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Location status bar */}
      <div className={`px-3 py-2 text-xs flex items-center justify-between ${isUsingDefault ? 'bg-amber-50' : 'bg-green-50'}`}>
        <span className={isUsingDefault ? 'text-amber-700' : 'text-green-700'}>
          {locationLoading ? 'Getting location...' : isUsingDefault ? 'Using default location' : 'Using your location'}
        </span>
        {isUsingDefault && !locationLoading && (
          <button
            onClick={requestLocation}
            className="text-amber-700 hover:text-amber-800 underline font-medium"
          >
            Update
          </button>
        )}
      </div>

      {/* Map Container */}
      {isExpanded && (
        <div
          ref={mapRef}
          className="w-full transition-all duration-300"
          style={{ height: '200px' }}
        />
      )}

      {/* Store List (when collapsed) */}
      {!isExpanded && (
        <div className="max-h-48 overflow-y-auto">
          {stores.slice(0, 5).map(store => (
            <div
              key={store.store_id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 border-b border-border/50 last:border-0"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: store.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-charcoal truncate">{store.name}</p>
                <p className="text-xs text-muted truncate">{store.address}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
