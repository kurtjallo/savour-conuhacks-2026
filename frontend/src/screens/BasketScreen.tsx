/**
 * Copyright (c) 2026 Savour. All Rights Reserved.
 *
 * This software and associated documentation files are proprietary and confidential.
 * Unauthorized copying, distribution, modification, or use of this software,
 * via any medium, is strictly prohibited without express written permission from Savour.
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Joyride, { type CallBackProps, STATUS } from 'react-joyride';
import { useBasket } from '../context/BasketContext';
import { analyzeBasket, getCategories, generateRecipe, checkRecipeAvailability } from '../lib/api';
import type { BasketAnalysis, Category, RecipeGenerateResponse } from '../lib/types';
import CartItemCard from '../components/CartItemCard';
import PriceSummary from '../components/PriceSummary';
import StoreBreakdown from '../components/StoreBreakdown';
import RouteOptimizer from '../components/RouteOptimizer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import { useTour } from '../context/TourContext';

const BASKET_TOUR_STEPS = [
  {
    target: '.tour-cart-items',
    content: 'Your selected items appear here. Adjust quantities or remove items as needed.',
    disableBeacon: true,
    placement: 'right' as const,
  },
  {
    target: '.tour-price-summary',
    content: 'See your total savings compared to shopping at the most expensive store.',
    placement: 'left' as const,
  },
  {
    target: '.tour-recipe-generator',
    content: 'Generate AI-powered recipes using the items in your basket. Get meal ideas that use your deals!',
    placement: 'top' as const,
  },
  {
    target: '.tour-strategy-tabs',
    content: 'Switch between your shopping list and trip planner to optimize your shopping route.',
    placement: 'top' as const,
  },
];

export default function BasketScreen() {
  const { items, updateQuantity, removeItem, clearBasket } = useBasket();
  const { isActive, currentPage, setTourPage, completeTour } = useTour();
  const [runTour, setRunTour] = useState(false);
  const [analysis, setAnalysis] = useState<BasketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<RecipeGenerateResponse | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [recipeAvailable, setRecipeAvailable] = useState<boolean | null>(null);

  // Set tour page when on this page
  useEffect(() => {
    if (isActive) {
      setTourPage('basket');
    }
  }, [isActive, setTourPage]);

  // Start tour when analysis is ready (means items are loaded)
  useEffect(() => {
    if (isActive && currentPage === 'basket' && items.length > 0 && analysis) {
      const timer = setTimeout(() => setRunTour(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isActive, currentPage, items.length, analysis]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      completeTour(); // Tour ends here
    }
  };

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

  // Check if recipe generation is available
  useEffect(() => {
    checkRecipeAvailability().then(setRecipeAvailable);
  }, []);

  // Initialize selected items when basket changes
  useEffect(() => {
    setSelectedItems(new Set(items.map(item => item.category_id)));
  }, [items]);

  // Fetch analysis whenever basket items or selection changes (debounced)
  useEffect(() => {
    // Filter to only selected items
    const selectedBasketItems = items.filter(item => selectedItems.has(item.category_id));

    if (selectedBasketItems.length === 0) {
      setAnalysis(null);
      setRecipe(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
          const basketItems = selectedBasketItems.map((item) => ({
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
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [items, selectedItems]);

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
    // Use only selected items for recipe
    const selectedBasketItems = items.filter(item => selectedItems.has(item.category_id));
    if (selectedBasketItems.length === 0) {
      setRecipeError('Please select at least one item to generate a recipe.');
      return;
    }

    setRecipeLoading(true);
    setRecipeError(null);
    try {
      const ingredients = selectedBasketItems.map((item) => item.name);
      const categoryIds = selectedBasketItems.map((item) => item.category_id);
      const result = await generateRecipe({
        ingredients,
        category_ids: categoryIds,
        servings: 2,
        meal_type: 'dinner',
      });
      setRecipe(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recipe. Please try again.';
      setRecipeError(errorMessage);
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
      <Joyride
        steps={BASKET_TOUR_STEPS}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        scrollOffset={80}
        disableScrollParentFix
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#f05a24',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 12,
            fontSize: 14,
          },
          buttonNext: {
            borderRadius: 8,
            fontWeight: 600,
          },
          buttonBack: {
            marginRight: 8,
          },
          buttonSkip: {
            color: '#666',
          },
        }}
        floaterProps={{
          disableAnimation: true,
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish tour',
          next: 'Next',
          skip: 'Skip tour',
        }}
      />
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
              onClick={() => setShowClearConfirm(true)}
              className="text-sm font-medium text-savour-text-secondary hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Progress Stepper */}
        <nav className="max-w-md mx-auto px-6 pb-4" aria-label="Checkout progress">
          <ol className="flex items-center justify-between" role="list">
            <li className="flex flex-col items-center" aria-current="step">
              <div className="w-8 h-8 rounded-full bg-savour-text text-white flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-xs font-medium text-savour-text mt-1">Cart</span>
            </li>
            <li className="flex-1 h-0.5 bg-gray-200 mx-2" aria-hidden="true" />
            <li className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-savour-text-secondary flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-xs text-savour-text-secondary mt-1">Compare</span>
            </li>
            <li className="flex-1 h-0.5 bg-gray-200 mx-2" aria-hidden="true" />
            <li className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-savour-text-secondary flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-xs text-savour-text-secondary mt-1">Shop</span>
            </li>
          </ol>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Error state */}
        {error && (
          <div role="alert" className="rounded-xl p-4 mb-6 bg-red-50 border border-red-200 text-red-800">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Cart Items */}
          <div className="tour-cart-items flex-1">
            {/* Selection Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  role="checkbox"
                  aria-checked={selectedItems.size === items.length}
                  className={`
                    w-5 h-5 rounded flex items-center justify-center border-2 transition-all duration-200
                    ${selectedItems.size === items.length
                      ? 'bg-savour-accent border-savour-accent'
                      : 'border-gray-300 hover:border-savour-accent'
                    }
                  `}
                  aria-label={selectedItems.size === items.length ? 'Deselect all items' : 'Select all items'}
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
              <div className="tour-recipe-generator mt-8 bg-white border border-savour-border rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-savour-text">
                      Turn your basket into a recipe
                    </h2>
                    <p className="text-sm mt-1 text-savour-text-secondary">
                      {recipeAvailable === false
                        ? 'AI recipe generation is currently unavailable.'
                        : 'Uses your basket items and current deals to craft a recipe.'}
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateRecipe}
                    disabled={recipeLoading || recipeAvailable === false}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-white bg-savour-accent hover:bg-savour-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {recipeLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating…
                      </>
                    ) : recipeAvailable === false ? (
                      'Unavailable'
                    ) : (
                      'Generate Recipe'
                    )}
                  </button>
                </div>

                {recipeError && (
                  <div role="alert" className="rounded-lg p-3 mt-4 bg-red-50 border border-red-200 text-red-800">
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
                          Ingredients from your basket:
                        </span>{' '}
                        {recipe.rag_items
                          .map((item) => `${item.name} (best at ${item.cheapest_store})`)
                          .join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Combined Shopping Strategy Section */}
            {analysis && (
              <div id="shopping-strategy-section" className="tour-strategy-tabs mt-8">
                {/* Tab Header */}
                <div className="bg-white border border-savour-border rounded-t-xl overflow-hidden">
                  <div className="flex border-b border-savour-border">
                    <button
                      onClick={() => setShowShoppingList(true)}
                      className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                        showShoppingList
                          ? 'bg-savour-accent/5 border-b-2 border-savour-accent text-savour-accent'
                          : 'text-savour-text-secondary hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      <span className="font-medium">Shopping List</span>
                    </button>
                    <button
                      onClick={() => setShowShoppingList(false)}
                      className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                        !showShoppingList
                          ? 'bg-savour-accent/5 border-b-2 border-savour-accent text-savour-accent'
                          : 'text-savour-text-secondary hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                      </svg>
                      <span className="font-medium">Trip Planner</span>
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white border border-t-0 border-savour-border rounded-b-xl p-6">
                  {showShoppingList ? (
                    <StoreBreakdown items={analysis.multi_store_optimal} total={analysis.multi_store_total} />
                  ) : (
                    <div className="-m-6">
                      <RouteOptimizer
                        basketItems={items.filter(item => selectedItems.has(item.category_id))}
                        multiStoreRecommended={
                          analysis.multi_store_total < analysis.single_store_best.total
                        }
                        embedded={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Price Summary */}
          <div className="tour-price-summary lg:w-[380px] lg:flex-shrink-0">
            <div className="lg:sticky lg:top-36">
              <PriceSummary
                items={itemsWithPrices}
                analysis={analysis}
                loading={loading}
                selectedCount={selectedItems.size}
                onViewShoppingList={() => {
                  setShowShoppingList(true);
                  // Scroll to shopping strategy section
                  setTimeout(() => {
                    document.getElementById('shopping-strategy-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowClearConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-cart-title"
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="clear-cart-title" className="text-lg font-bold text-savour-text mb-2">
              Clear your cart?
            </h2>
            <p className="text-savour-text-secondary text-sm mb-6">
              This will remove all {items.length} item{items.length !== 1 ? 's' : ''} from your cart. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl font-medium text-savour-text bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearBasket();
                  setShowClearConfirm(false);
                }}
                className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Clear cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
