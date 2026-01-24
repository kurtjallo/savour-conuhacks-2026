import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBasket } from '../context/BasketContext';
import { analyzeBasket } from '../lib/api';
import type { BasketAnalysis } from '../lib/types';
import BasketItem from '../components/BasketItem';
import SavingsCard from '../components/SavingsCard';
import StoreBreakdown from '../components/StoreBreakdown';

export default function BasketScreen() {
  const { items, updateQuantity, removeItem, clearBasket } = useBasket();
  const [analysis, setAnalysis] = useState<BasketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch analysis whenever basket items change
  useEffect(() => {
    if (items.length === 0) {
      setAnalysis(null);
      return;
    }

    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const basketItems = items.map((item) => ({
          category_id: item.category_id,
          quantity: item.quantity,
        }));
        const result = await analyzeBasket(basketItems);
        setAnalysis(result);
      } catch (err) {
        setError('Failed to analyze basket. Please try again.');
        console.error('Analysis error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [items]);

  // Empty basket state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span className="font-medium">Back</span>
            </Link>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your basket is empty</h1>
          <p className="text-gray-500 mb-8">
            Add some items to compare prices and find the best deals!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="font-medium">Back</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Your Basket</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Basket Items */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Items ({items.length})
            </h2>
            <button
              onClick={clearBasket}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Clear All
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <BasketItem
                key={item.category_id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
        </section>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            <span className="ml-3 text-gray-600">Analyzing prices...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !loading && (
          <>
            {/* Savings Card - The star of the show! */}
            <SavingsCard
              savingsAmount={analysis.savings_vs_worst}
              savingsPercent={analysis.savings_percent}
              annualProjection={analysis.annual_projection}
            />

            {/* Single Store Options */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Best Single Store */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-emerald-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Best Single Store</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {analysis.single_store_best.store_name.replace('-', ' ')}
                </p>
                <p className="text-lg text-emerald-600 font-semibold">
                  ${analysis.single_store_best.total.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  If you only want to visit one store
                </p>
              </div>

              {/* Worst Single Store (for comparison) */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Worst Single Store</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {analysis.single_store_worst.store_name.replace('-', ' ')}
                </p>
                <p className="text-lg text-red-600 font-semibold line-through">
                  ${analysis.single_store_worst.total.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Avoid this for your current basket
                </p>
              </div>
            </section>

            {/* Multi-Store Breakdown */}
            <StoreBreakdown multiStoreOptimal={analysis.multi_store_optimal} />
          </>
        )}

        {/* Clear Basket Button (at bottom) */}
        <div className="pt-4 pb-8">
          <button
            onClick={clearBasket}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Clear Basket
          </button>
        </div>
      </main>
    </div>
  );
}
