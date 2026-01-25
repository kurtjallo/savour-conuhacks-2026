import type { BasketAnalysis } from '../lib/types';

interface PriceItem {
  name: string;
  quantity: number;
  price: number;
}

interface PriceSummaryProps {
  items: PriceItem[];
  analysis: BasketAnalysis | null;
  loading: boolean;
  selectedCount: number;
  onViewShoppingList?: () => void;
}

export default function PriceSummary({
  items,
  analysis,
  loading,
  selectedCount,
  onViewShoppingList,
}: PriceSummaryProps) {
  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const savingsAmount = analysis?.savings_vs_worst ?? 0;
  // Use the actual best price: either multi-store or single-store, whichever is cheaper
  const bestTotal = analysis
    ? Math.min(analysis.multi_store_total, analysis.single_store_best.total)
    : itemsTotal;

  return (
    <div className="bg-white border border-savour-border rounded-2xl overflow-hidden shadow-sm">
      {/* Savings Highlight */}
      {analysis && savingsAmount > 0 && (
        <div className="bg-gradient-to-r from-savour-savings/10 to-savour-savings/5 p-4 border-b border-savour-savings/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-savour-savings/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-savour-savings" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-savour-savings">You're saving!</p>
              <p className="text-lg font-bold text-savour-savings">
                ${savingsAmount.toFixed(2)} ({analysis.savings_percent.toFixed(0)}% off)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Best Strategy Section */}
      {analysis && (
        <div className="p-4 border-b border-savour-border">
          <h3 className="text-sm font-semibold text-savour-text mb-3">Best Strategy</h3>
          <div className="space-y-2">
            {/* Multi-store is best */}
            {analysis.multi_store_total < analysis.single_store_best.total ? (
              <>
                <div className="flex items-center justify-between p-3 bg-savour-savings/5 rounded-lg border border-savour-savings/20">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-savour-savings" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-savour-text">Multi-store</span>
                  </div>
                  <span className="text-sm font-bold text-savour-savings">
                    ${analysis.multi_store_total.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-savour-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                    </svg>
                    <span className="text-sm text-savour-text-secondary capitalize">
                      {analysis.single_store_best.store_name.replace('-', ' ')}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-savour-text">
                    ${analysis.single_store_best.total.toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              /* Single store is best (or equal) */
              <div className="flex items-center justify-between p-3 bg-savour-savings/5 rounded-lg border border-savour-savings/20">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-savour-savings" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-savour-text capitalize">
                    {analysis.single_store_best.store_name.replace('-', ' ')}
                  </span>
                </div>
                <span className="text-sm font-bold text-savour-savings">
                  ${analysis.single_store_best.total.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Price Details */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-savour-text mb-3">Price Details</h3>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-5 h-5 border-2 border-savour-border border-t-savour-accent rounded-full animate-spin" />
            <span className="ml-2 text-sm text-savour-text-secondary">Analyzing...</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-savour-text-secondary">
                {selectedCount} {selectedCount === 1 ? 'item' : 'items'}
              </span>
              <span className="text-savour-text">${itemsTotal.toFixed(2)}</span>
            </div>

            {/* Item breakdown */}
            <div className="space-y-1.5 py-2 border-t border-b border-dashed border-savour-border">
              {items.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-savour-text-secondary truncate max-w-[160px]">
                    {item.quantity} x {item.name}
                  </span>
                  <span className="text-savour-text-secondary">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              {items.length > 3 && (
                <p className="text-xs text-savour-text-secondary">
                  +{items.length - 3} more items
                </p>
              )}
            </div>

            {savingsAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-savour-savings">Savings</span>
                <span className="text-savour-savings font-medium">-${savingsAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-savour-text-secondary">Price comparison</span>
              <span className="text-savour-savings font-medium">Free</span>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-savour-border">
          <span className="font-semibold text-savour-text">Total Amount</span>
          <span className="text-xl font-bold text-savour-text">
            ${bestTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Annual Savings */}
      {analysis && (
        <div className="px-4 pb-4">
          <div className="bg-savour-accent/5 rounded-lg p-3 text-center">
            <p className="text-xs text-savour-text-secondary">Annual savings projection</p>
            <p className="text-lg font-bold text-savour-accent">${analysis.annual_projection.toFixed(0)}/year</p>
          </div>
        </div>
      )}

      {/* Checkout Button */}
      <div className="p-4 border-t border-savour-border bg-gray-50">
        <button
          onClick={onViewShoppingList}
          disabled={!analysis}
          className="w-full bg-savour-text hover:bg-savour-text/90 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>View Shopping List</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
