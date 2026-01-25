import { useState, useEffect, useCallback } from 'react';
import type { Location } from '../lib/types';

// Toronto downtown as default fallback
const DEFAULT_LOCATION: Location = { lat: 43.6532, lng: -79.3832 };

interface GeolocationState {
  location: Location;
  isLoading: boolean;
  error: string | null;
  isUsingDefault: boolean;
}

export default function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: DEFAULT_LOCATION,
    isLoading: true,
    error: null,
    isUsingDefault: true,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        location: DEFAULT_LOCATION,
        isLoading: false,
        error: 'Geolocation not supported',
        isUsingDefault: true,
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          isLoading: false,
          error: null,
          isUsingDefault: false,
        });
      },
      (error) => {
        let errorMessage = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setState({
          location: DEFAULT_LOCATION,
          isLoading: false,
          error: errorMessage,
          isUsingDefault: true,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  }, []);

  // Request location on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    ...state,
    requestLocation,
    DEFAULT_LOCATION,
  };
}
