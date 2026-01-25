import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBasket } from '../context/BasketContext';
import { analyzeBasket, getCategories, generateRecipe } from '../lib/api';
import type { BasketAnalysis, Category, RecipeGenerateResponse } from '../lib/types';
import CartItemCard from '../components/CartItemCard';
import PriceSummary from '../components/PriceSummary';
import StoreBreakdown from '../components/StoreBreakdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';

export default function BasketScreen() {
  const { items, updateQuantity, removeItem, clearBasket } = useBasket();
  const [analysis, setAnalysis] = useState<BasketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<RecipeGenerateResponse | null>(null);

  // Fetch categories for price info
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Initialize selected items when basket changes
  useEffect(() => {
    setSelectedItems(new Set(items.map(item => item.category_id)));
  }, [items]);

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

  // Get price info for each item
  const getCategoryPrice = (categoryId: string): number | undefined => {
    const category = categories.find(c => c.category_id === categoryId);
    return category?.cheapest_price;
  };

  const getCategoryStore = (categoryId: string): string | undefined => {
    const category = categories.find(c => c.category_id === categoryId);
    return category?.cheapest_store?.replace('-', ' ');
  };

  const getCategoryImage = (categoryId: string): string | undefined => {
    const category = categories.find(c => c.category_id === categoryId);
    return category?.image_url;
  };

  // Selection handlers
  const toggleSelectItem = (categoryId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.category_id)));
    }
  };

  const removeSelectedItems = () => {
    selectedItems.forEach(categoryId => {
      removeItem(categoryId);
    });
    setSelectedItems(new Set());
  };

  const handleGenerateRecipe = async () => {
    setRecipeLoading(true);
    setRecipeError(null);
    try {
      const ingredients = items.map((item) => item.name);
      const categoryIds = items.map((item) => item.category_id);
      const result = await generateRecipe({
        ingredients,
        category_ids: categoryIds,
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

  // Items with prices for summary
  const itemsWithPrices = useMemo(() => {
    return items
      .filter(item => selectedItems.has(item.category_id))
      .map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: getCategoryPrice(item.category_id) ?? 0,
      }));
  }, [items, selectedItems, categories]);

  // Empty basket state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-savour-bg">
        <header className="bg-white border-b border-savour-border">
          <div className="max-w-6xl mx-auto px-6 py-5">
            <Link
              to="/products"
              className="flex items-center gap-2 text-savour-text-secondary hover:text-savour-text transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>
          </div>
        </header>

        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-savour-text mb-3">Your cart is empty</h1>
          <p className="text-savour-text-secondary mb-8">Start adding items to see your savings</p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold text-white bg-savour-accent hover:bg-savour-accent-hover transition-colors shadow-md"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-savour-bg">
      {/* Header */}
      <header className="bg-white border-b border-savour-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/products"
              className="flex items-center gap-2 text-savour-text-secondary hover:text-savour-text transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>

            <h1 className="text-lg font-bold text-savour-text">Your Cart</h1>

            <button
              onClick={clearBasket}
              className="text-sm font-medium text-savour-text-secondary hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="max-w-md mx-auto px-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-savour-text text-white flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-xs font-medium text-savour-text mt-1">Cart</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-savour-text-secondary flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-xs text-savour-text-secondary mt-1">Review</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-savour-text-secondary flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-xs text-savour-text-secondary mt-1">Shop</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Error state */}
        {error && (
          <div className="rounded-xl p-4 mb-6 bg-red-50 border border-red-200 text-red-800">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Cart Items */}
          <div className="flex-1">
            {/* Selection Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  className={`
                    w-5 h-5 rounded flex items-center justify-center border-2 transition-all duration-200
                    ${selectedItems.size === items.length
                      ? 'bg-savour-accent border-savour-accent'
                      : 'border-gray-300 hover:border-savour-accent'
                    }
                  `}
                  aria-label={selectedItems.size === items.length ? 'Deselect all' : 'Select all'}
                >
                  {selectedItems.size === items.length && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className="text-sm font-medium text-savour-text">
                  {selectedItems.size}/{items.length} items selected
                </span>
              </div>

              <div className="flex items-center gap-4">
                {selectedItems.size > 0 && (
                  <button
                    onClick={removeSelectedItems}
                    className="text-sm font-medium text-savour-text-secondary hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3">
              {items.map((item) => (
                <CartItemCard
                  key={item.category_id}
                  item={item}
                  isSelected={selectedItems.has(item.category_id)}
                  onToggleSelect={toggleSelectItem}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  price={getCategoryPrice(item.category_id)}
                  storeName={getCategoryStore(item.category_id)}
                  imageUrl={getCategoryImage(item.category_id)}
                />
              ))}
            </div>

            {/* Recipe Generator Section */}
            {analysis && (
              <div className="mt-8 bg-white border border-savour-border rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-savour-text">
                      Turn your basket into a recipe
                    </h2>
                    <p className="text-sm mt-1 text-savour-text-secondary">
                      Uses your basket items and current deals to craft a recipe.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateRecipe}
                    disabled={recipeLoading}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-white bg-savour-accent hover:bg-savour-accent-hover transition-colors disabled:opacity-60"
                  >
                    {recipeLoading ? 'Generating…' : 'Generate Recipe'}
                  </button>
                </div>

                {recipeError && (
                  <div className="rounded-lg p-3 mt-4 bg-red-50 border border-red-200 text-red-800">
                    <p className="text-sm">{recipeError}</p>
                  </div>
                )}

                {recipe && (
                  <div className="mt-5 space-y-4">
                    <div className="rounded-lg p-4 border border-savour-border text-sm text-savour-text">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
                          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
                          li: ({ children }) => <li>{children}</li>,
                        }}
                      >
                        {recipe.recipe_text}
                      </ReactMarkdown>
                    </div>

                    {recipe.rag_items.length > 0 && (
                      <div className="text-xs text-savour-text-secondary">
                        <span className="font-semibold text-savour-text">
                          RAG items used:
                        </span>{' '}
                        {recipe.rag_items
                          .map((item) => `${item.name} (${item.cheapest_store})`)
                          .join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Shopping List Section (collapsible) */}
            {analysis && (
              <div className="mt-8">
                <button
                  onClick={() => setShowShoppingList(!showShoppingList)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-savour-border rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-savour-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span className="font-medium text-savour-text">View Optimized Shopping List</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-savour-text-secondary transition-transform ${showShoppingList ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {showShoppingList && (
                  <div className="mt-4">
                    <StoreBreakdown items={analysis.multi_store_optimal} total={analysis.multi_store_total} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:w-[380px] lg:flex-shrink-0">
            <div className="lg:sticky lg:top-36">
              <PriceSummary
                items={itemsWithPrices}
                analysis={analysis}
                loading={loading}
                selectedCount={selectedItems.size}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
