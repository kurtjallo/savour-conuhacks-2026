import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';
import { getCategories, searchCategories } from '../lib/api';
import type { Category } from '../lib/types';

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const data = await getCategories();
      setCategories(data);
      setFilteredCategories(data);
    } catch (err) {
      setError('Failed to load categories. Please try again.');
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
        setFilteredCategories(categories);
        return;
      }

      try {
        const results = await searchCategories(query);
        setFilteredCategories(results);
      } catch (err) {
        // Fall back to local filtering if API search fails
        console.error('Search API failed, using local filter:', err);
        const lowerQuery = query.toLowerCase();
        const filtered = categories.filter(
          (cat) =>
            cat.name.toLowerCase().includes(lowerQuery) ||
            cat.category_id.toLowerCase().includes(lowerQuery)
        );
        setFilteredCategories(filtered);
      }
    },
    [categories]
  );

  const handleRefresh = () => {
    setSearchQuery('');
    fetchCategories(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
            <p className="text-gray-500">Loading groceries...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Compare Grocery Prices
          </h2>
          <p className="text-gray-600">
            Find the best deals across 5 major Canadian stores
          </p>
        </div>

        {/* Search and Refresh */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search for eggs, milk, bread..."
            />
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-green-200 transition-all disabled:opacity-50 shadow-sm"
            aria-label="Refresh categories"
          >
            <svg
              className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
            <button
              onClick={handleRefresh}
              className="ml-auto text-red-700 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results Count */}
        {searchQuery && (
          <p className="text-sm text-gray-500 mb-4">
            {filteredCategories.length} result{filteredCategories.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        )}

        {/* Category Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCategories.map((category) => (
              <CategoryCard key={category.category_id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-4">
              Try a different search term or browse all categories
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilteredCategories(categories);
              }}
              className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Savings Tip */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-green-800 mb-1">
                Pro Tip: Build Your Basket
              </h4>
              <p className="text-sm text-green-700">
                Add items to your basket and we'll show you the optimal shopping
                strategy to maximize your savings across all stores.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>
            Prices updated daily from No Frills, FreshCo, Walmart, Loblaws, and Metro
          </p>
        </div>
      </footer>
    </div>
  );
}
