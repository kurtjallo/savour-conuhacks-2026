import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Location, StoreVisit } from '../lib/types';

// Fix Leaflet default marker icon issue with Vite bundling
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface RouteMapProps {
  userLocation: Location;
  storeVisits: StoreVisit[];
  routePolyline?: string;
}

// Decode Google polyline encoding (used by OpenRouteService)
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += (result & 1) ? ~(result >> 1) : (result >> 1);

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

export default function RouteMap({ userLocation, storeVisits, routePolyline }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on user location
    const map = L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 12);
    mapInstanceRef.current = map;

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing layers (except tile layer)
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    // Add user marker (blue)
    const userIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 24px;
        height: 24px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('Your Location');

    // Add store markers with numbers
    const bounds = L.latLngBounds([[userLocation.lat, userLocation.lng]]);

    storeVisits.forEach((visit, index) => {
      const storeIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 32px;
          height: 32px;
          background: ${visit.store.color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">${index + 1}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([visit.store.lat, visit.store.lng], { icon: storeIcon })
        .addTo(map)
        .bindPopup(`
          <strong>${visit.store.name}</strong><br/>
          ${visit.store.address}<br/>
          <em>${visit.items_to_buy.length} items - $${visit.store_subtotal.toFixed(2)}</em>
        `);

      bounds.extend([visit.store.lat, visit.store.lng]);
    });

    // Draw route polyline if available
    if (routePolyline) {
      try {
        const decoded = decodePolyline(routePolyline);
        L.polyline(decoded, {
          color: '#f35c1d',
          weight: 4,
          opacity: 0.8,
        }).addTo(map);
      } catch (e) {
        console.warn('Failed to decode route polyline:', e);
      }
    } else if (storeVisits.length > 0) {
      // Draw simple lines connecting user -> stores -> user
      const points: [number, number][] = [
        [userLocation.lat, userLocation.lng],
        ...storeVisits.map(v => [v.store.lat, v.store.lng] as [number, number]),
        [userLocation.lat, userLocation.lng],
      ];
      L.polyline(points, {
        color: '#f35c1d',
        weight: 3,
        opacity: 0.6,
        dashArray: '10, 10',
      }).addTo(map);
    }

    // Fit map to show all markers
    if (storeVisits.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [userLocation, storeVisits, routePolyline]);

  return (
    <div
      ref={mapRef}
      className="w-full h-64 rounded-xl overflow-hidden border border-savour-border"
      style={{ minHeight: '256px' }}
    />
  );
}
