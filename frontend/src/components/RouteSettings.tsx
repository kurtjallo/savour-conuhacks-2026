import { useState } from 'react';
import type { RouteSettings as RouteSettingsType } from '../lib/types';

interface RouteSettingsProps {
  settings: RouteSettingsType;
  onSettingsChange: (settings: RouteSettingsType) => void;
}

export default function RouteSettings({ settings, onSettingsChange }: RouteSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (field: keyof RouteSettingsType, value: number) => {
    onSettingsChange({ ...settings, [field]: value });
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-savour-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-savour-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          <span className="text-sm font-medium text-savour-text">Trip Settings</span>
        </div>
        <svg
          className={`w-4 h-4 text-savour-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-savour-border pt-3">
          <div>
            <label className="text-xs text-savour-text-secondary block mb-1">
              Gas price ($/L)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.50"
              max="3.00"
              value={settings.gas_price_per_liter}
              onChange={(e) => handleChange('gas_price_per_liter', parseFloat(e.target.value) || 1.50)}
              className="w-full px-3 py-2 text-sm border border-savour-border rounded-lg focus:outline-none focus:ring-2 focus:ring-savour-accent/20"
            />
          </div>

          <div>
            <label className="text-xs text-savour-text-secondary block mb-1">
              Fuel efficiency (L/100km)
            </label>
            <input
              type="number"
              step="0.5"
              min="4"
              max="20"
              value={settings.fuel_efficiency_l_per_100km}
              onChange={(e) => handleChange('fuel_efficiency_l_per_100km', parseFloat(e.target.value) || 10)}
              className="w-full px-3 py-2 text-sm border border-savour-border rounded-lg focus:outline-none focus:ring-2 focus:ring-savour-accent/20"
            />
          </div>

          <div>
            <label className="text-xs text-savour-text-secondary block mb-1">
              Your time value ($/hour)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={settings.time_value_per_hour}
              onChange={(e) => handleChange('time_value_per_hour', parseFloat(e.target.value) || 15)}
              className="w-full px-3 py-2 text-sm border border-savour-border rounded-lg focus:outline-none focus:ring-2 focus:ring-savour-accent/20"
            />
          </div>

          <div>
            <label className="text-xs text-savour-text-secondary block mb-1">
              Time per store (minutes)
            </label>
            <input
              type="number"
              step="5"
              min="10"
              max="90"
              value={settings.time_per_store_minutes}
              onChange={(e) => handleChange('time_per_store_minutes', parseInt(e.target.value) || 30)}
              className="w-full px-3 py-2 text-sm border border-savour-border rounded-lg focus:outline-none focus:ring-2 focus:ring-savour-accent/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
