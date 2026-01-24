import { getCategories, searchCategories } from '@/lib/api';
import CategoryCard from '@/components/CategoryCard';
import SearchBar from '@/components/SearchBar';

export default async function Home({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || '';

  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    categories = query ? await searchCategories(query) : await getCategories();
  } catch {
    categories = [];
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Stop Overpaying for Groceries
          </h1>
          <p className="text-xl mb-8 text-green-100">
            Compare prices across 5 major Canadian stores. Save up to 30% on your weekly shop.
          </p>
          <SearchBar defaultValue={query} />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {query ? `Search Results for "${query}"` : 'Browse Categories'}
        </h2>
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {query ? 'No categories found. Try a different search.' : 'Loading categories... Make sure the backend is running.'}
            </p>
            <p className="text-sm text-gray-400">
              Start the backend: cd backend && python -m uvicorn main:app --reload
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map(category => (
              <CategoryCard key={category.category_id} category={category} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
