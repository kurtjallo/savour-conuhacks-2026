import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBasket } from '../context/BasketContext';
import { analyzeBasket, generateRecipe } from '../lib/api';
import type { BasketAnalysis, RecipeGenerateResponse } from '../lib/types';
import BasketItem from '../components/BasketItem';
import SavingsCard from '../components/SavingsCard';
import StoreBreakdown from '../components/StoreBreakdown';

// Design system colors
const colors = {
  background: '#f8f7f6',
  cardBorder: '#e8e6e3',
  textPrimary: '#2e2c29',
  textSecondary: '#6b6966',
  accent: '#f35c1d',
  savings: '#4a7c59',
};

export default function BasketScreen() {
  const { items, updateQuantity, removeItem, clearBasket } = useBasket();
  const [analysis, setAnalysis] = useState<BasketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<RecipeGenerateResponse | null>(null);

  // Fetch analysis whenever basket items change
  useEffect(() => {
    if (items.length === 0) {
      setAnalysis(null);
      setRecipe(null);
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

  const handleGenerateRecipe = async () => {
    setRecipeLoading(true);
    setRecipeError(null);
    try {
      const ingredients = items.map((item) => item.name);
      const result = await generateRecipe({
        ingredients,
        servings: 2,
        meal_type: 'dinner',
      });
      setRecipe(result);
    } catch (err) {
      setRecipeError('Failed to generate recipe. Please try again.');
      console.error('Recipe error:', err);
    } finally {
      setRecipeLoading(false);
    }
  };

  // Empty basket state
  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
        <header className="bg-white border-b" style={{ borderColor: colors.cardBorder }}>
          <div className="max-w-4xl mx-auto px-6 py-5">
            <Link
              to="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ color: colors.textSecondary }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>
          </div>
        </header>

        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <h1
            className="text-2xl font-semibold mb-3"
            style={{ color: colors.textPrimary }}
          >
            Your basket is empty
          </h1>
          <p
            className="text-base mb-10"
            style={{ color: colors.textSecondary }}
          >
            Start adding items to see your savings
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: colors.accent }}
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10" style={{ borderColor: colors.cardBorder }}>
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ color: colors.textSecondary }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="text-center">
              <h1
                className="text-xl font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Your Basket
              </h1>
              <p
                className="text-sm mt-0.5"
                style={{ color: colors.textSecondary }}
              >
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            <button
              onClick={clearBasket}
              className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: colors.textSecondary }}
            >
              Clear all
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Basket Items */}
        <section className="mb-10">
          <div className="space-y-4">
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
          <div className="flex items-center justify-center py-12">
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{ borderColor: colors.cardBorder, borderTopColor: colors.accent }}
            />
            <span className="ml-3 text-sm" style={{ color: colors.textSecondary }}>
              Analyzing prices...
            </span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div
            className="rounded-lg p-4 mb-8 border"
            style={{
              backgroundColor: '#fef2f2',
              borderColor: '#fecaca',
              color: '#991b1b'
            }}
          >
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !loading && (
          <div className="space-y-8">
            {/* Recipe Generator */}
            <section
              className="bg-white rounded-xl p-6 border"
              style={{ borderColor: colors.cardBorder }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: colors.textPrimary }}
                  >
                    Turn your basket into a recipe
                  </h2>
                  <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                    Uses your basket items and current deals to craft a recipe.
                  </p>
                </div>
                <button
                  onClick={handleGenerateRecipe}
                  disabled={recipeLoading}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: colors.accent }}
                >
                  {recipeLoading ? 'Generating…' : 'Generate Recipe'}
                </button>
              </div>

              {recipeError && (
                <div
                  className="rounded-lg p-3 mt-4 border"
                  style={{
                    backgroundColor: '#fef2f2',
                    borderColor: '#fecaca',
                    color: '#991b1b'
                  }}
                >
                  <p className="text-sm">{recipeError}</p>
                </div>
              )}

              {recipe && (
                <div className="mt-5 space-y-4">
                  <div
                    className="rounded-lg p-4 border whitespace-pre-line text-sm"
                    style={{ borderColor: colors.cardBorder, color: colors.textPrimary }}
                  >
                    {recipe.recipe_text}
                  </div>

                  {recipe.rag_items.length > 0 && (
                    <div className="text-xs" style={{ color: colors.textSecondary }}>
                      <span className="font-semibold" style={{ color: colors.textPrimary }}>
                        RAG items used:
                      </span>{' '}
                      {recipe.rag_items
                        .map((item) => `${item.name} (${item.cheapest_store})`)
                        .join(', ')}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Savings Card */}
            <SavingsCard
              savingsAmount={analysis.savings_vs_worst}
              savingsPercent={analysis.savings_percent}
              annualProjection={analysis.annual_projection}
            />

            {/* Strategy Section */}
            <section>
              <h2
                className="text-lg font-semibold mb-5"
                style={{ color: colors.textPrimary }}
              >
                Optimal Strategy
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Best Single Store */}
                <div
                  className="bg-white rounded-xl p-6 border"
                  style={{ borderColor: colors.cardBorder }}
                >
                  <p
                    className="text-xs font-medium uppercase tracking-wider mb-3"
                    style={{ color: colors.textSecondary }}
                  >
                    Single Store
                  </p>
                  <p
                    className="text-xl font-semibold capitalize mb-1"
                    style={{ color: colors.textPrimary }}
                  >
                    {analysis.single_store_best.store_name.replace('-', ' ')}
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: colors.savings }}
                  >
                    ${analysis.single_store_best.total.toFixed(2)}
                  </p>
                  <p
                    className="text-sm mt-2"
                    style={{ color: colors.textSecondary }}
                  >
                    Best option for one stop
                  </p>
                </div>

                {/* Multi-Store Summary */}
                <div
                  className="bg-white rounded-xl p-6 border"
                  style={{ borderColor: colors.cardBorder }}
                >
                  <p
                    className="text-xs font-medium uppercase tracking-wider mb-3"
                    style={{ color: colors.textSecondary }}
                  >
                    Multi-Store
                  </p>
                  <p
                    className="text-xl font-semibold mb-1"
                    style={{ color: colors.textPrimary }}
                  >
                    {analysis.multi_store_optimal.stores_needed.length} Stores
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: colors.savings }}
                  >
                    ${analysis.multi_store_optimal.total.toFixed(2)}
                  </p>
                  <p
                    className="text-sm mt-2"
                    style={{ color: colors.textSecondary }}
                  >
                    Maximum savings
                  </p>
                </div>
              </div>
            </section>

            {/* Multi-Store Breakdown */}
            <StoreBreakdown multiStoreOptimal={analysis.multi_store_optimal} />

            {/* Comparison Note */}
            <div
              className="bg-white rounded-xl p-5 border"
              style={{ borderColor: colors.cardBorder }}
            >
              <p
                className="text-sm"
                style={{ color: colors.textSecondary }}
              >
                Compared to shopping at{' '}
                <span className="font-medium capitalize" style={{ color: colors.textPrimary }}>
                  {analysis.single_store_worst.store_name.replace('-', ' ')}
                </span>{' '}
                (${analysis.single_store_worst.total.toFixed(2)}), you save{' '}
                <span className="font-medium" style={{ color: colors.savings }}>
                  ${analysis.savings_vs_worst.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
