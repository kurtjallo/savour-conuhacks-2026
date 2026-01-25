import type { RouteOptimizeResponse } from '../lib/types';

interface CostBreakdownProps {
  response: RouteOptimizeResponse;
}

export default function CostBreakdown({ response }: CostBreakdownProps) {
  const { travel_cost, grocery_savings, net_savings, is_worth_it, recommendation } = response;

  return (
    <div className="bg-white rounded-xl border border-savour-border overflow-hidden">
      {/* Verdict Banner */}
      <div className={`p-4 ${is_worth_it ? 'bg-savour-savings/10' : 'bg-amber-50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            is_worth_it ? 'bg-savour-savings/20' : 'bg-amber-100'
          }`}>
            {is_worth_it ? (
              <svg className="w-5 h-5 text-savour-savings" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <div>
            <p className={`text-sm font-medium ${is_worth_it ? 'text-savour-savings' : 'text-amber-700'}`}>
              {is_worth_it ? 'Multi-store shopping is worth it!' : 'Single store is better'}
            </p>
            <p className={`text-lg font-bold ${is_worth_it ? 'text-savour-savings' : 'text-amber-700'}`}>
              {is_worth_it ? `Net savings: $${net_savings.toFixed(2)}` : `Save $${Math.abs(net_savings).toFixed(2)} in travel`}
            </p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="p-4 space-y-4">
        <h3 className="text-sm font-semibold text-savour-text">Trip Cost Breakdown</h3>

        <div className="space-y-2">
          {/* Trip Stats */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-savour-text-secondary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
              Total distance
            </span>
            <span className="text-savour-text">{travel_cost.total_distance_km.toFixed(1)} km</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-savour-text-secondary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Drive time
            </span>
            <span className="text-savour-text">{Math.round(travel_cost.total_drive_time_minutes)} min</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-savour-text-secondary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
              </svg>
              Shopping time
            </span>
            <span className="text-savour-text">{travel_cost.total_store_time_minutes} min</span>
          </div>

          <div className="border-t border-savour-border pt-2 mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-savour-text-secondary">Gas cost</span>
              <span className="text-savour-text">${travel_cost.gas_cost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-savour-text-secondary">Time cost</span>
              <span className="text-savour-text">${travel_cost.time_cost.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-savour-border pt-2 mt-2">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-savour-text">Total travel cost</span>
              <span className="text-savour-text">${travel_cost.total_travel_cost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Savings Comparison */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-savour-text-secondary">Grocery savings (multi-store)</span>
            <span className="text-savour-savings font-medium">+${grocery_savings.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-savour-text-secondary">Travel cost</span>
            <span className="text-red-500 font-medium">-${travel_cost.total_travel_cost.toFixed(2)}</span>
          </div>
          <div className="border-t border-savour-border pt-2">
            <div className="flex items-center justify-between">
              <span className="text-savour-text font-medium">Net savings</span>
              <span className={`text-lg font-bold ${net_savings >= 0 ? 'text-savour-savings' : 'text-red-500'}`}>
                {net_savings >= 0 ? '+' : '-'}${Math.abs(net_savings).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="px-4 pb-4">
        <p className="text-sm text-savour-text-secondary italic">
          {recommendation}
        </p>
      </div>
    </div>
  );
}
