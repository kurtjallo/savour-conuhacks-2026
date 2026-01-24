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
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getCategories();
      setCategories(data);
      setFilteredCategories(data);
    } catch (err) {
      setError('Unable to load products. Please try again.');
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <main className="max-w-5xl mx-auto px-6 py-20">
          <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin mb-4"></div>
            <p className="text-charcoal-light text-sm">Loading products...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="max-w-5xl mx-auto px-6">
        {/* Hero Section */}
        <section className="py-16 md:py-20 text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-semibold text-charcoal tracking-tight mb-4">
            Compare. Save. Savour.
          </h1>
          <p className="text-charcoal-light text-lg font-light max-w-md mx-auto">
            Find the best grocery prices across Canadian stores
          </p>
        </section>

        {/* Search */}
        <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search groceries..."
          />
        </section>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-5 bg-white border border-border rounded-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-charcoal">{error}</p>
              <button
                onClick={fetchCategories}
                className="text-accent font-medium hover:underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        {searchQuery && (
          <p className="text-sm text-muted mb-6 animate-fade-in">
            {filteredCategories.length} result{filteredCategories.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        )}

        {/* Category Grid */}
        {filteredCategories.length > 0 ? (
          <section className="pb-20">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
              {filteredCategories.map((category, index) => (
                <div
                  key={`${category.category_id}-${index}`}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${150 + index * 50}ms` }}
                >
                  <CategoryCard category={category} />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="text-center py-20 animate-fade-in">
            <h3 className="text-xl font-medium text-charcoal mb-2">
              No products found
            </h3>
            <p className="text-charcoal-light mb-6">
              Try a different search term
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilteredCategories(categories);
              }}
              className="px-6 py-3 text-accent border border-accent rounded-xl hover:bg-accent hover:text-white transition-all duration-200"
            >
              Clear search
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
