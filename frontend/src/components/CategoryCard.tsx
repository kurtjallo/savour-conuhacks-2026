import { useNavigate } from 'react-router-dom';
import type { Category } from '../lib/types';
import { getCategoryColorFromName } from '../lib/icons';
import { resolveImageUrl } from '../lib/api';
import StoreLogo from './StoreLogo';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const navigate = useNavigate();

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price);
  };



  const calculateSavings = (): number | null => {
    if (category.most_expensive_price > category.cheapest_price) {
      const savings = ((category.most_expensive_price - category.cheapest_price) / category.most_expensive_price) * 100;
      return Math.round(savings);
    }
    return null;
  };

  const handleClick = () => {
    navigate(`/category/${category.category_id}`);
  };

  const savings = calculateSavings();

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl border border-border cursor-pointer
                 hover:-translate-y-1 hover:shadow-lift
                 transition-all duration-300 ease-out flex flex-col h-full overflow-hidden group"
    >
      {/* Product Image or Icon */}
      {category.image_url ? (
        <div className="w-full h-32 bg-white flex items-center justify-center overflow-hidden">
          <img
            src={resolveImageUrl(category.image_url)}
            alt={category.name}
            loading="lazy"
            className="w-full h-32 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="w-full h-32 bg-gray-50 flex items-center justify-center rounded-t-xl">
          <div
            className="w-12 h-12 rounded-full opacity-30"
            style={{ backgroundColor: getCategoryColorFromName(category.name) }}
          />
        </div>
      )}

      {/* Content area with padding */}
      <div className="p-5 flex flex-col flex-1">
        {/* Product name - fixed height with line clamp */}
        <h3 className="text-base font-medium text-charcoal mb-1 font-display line-clamp-2 min-h-[2.75rem]">
          {category.name}
        </h3>

        {/* Unit - single line */}
        <p className="text-sm text-muted mb-4 font-ui truncate">
          {category.unit}
        </p>

        {/* Price and savings */}
        <div className="mt-auto pt-3 border-t border-border/50">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl font-semibold text-charcoal font-display">
                {formatPrice(category.cheapest_price)}
              </span>
              <span className="text-sm text-muted ml-1 font-ui inline-flex items-center gap-1">
                at <StoreLogo storeId={category.cheapest_store} />
              </span>
            </div>
          </div>

          {/* Savings badge */}
          {savings && savings > 0 && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-sage bg-sage-light rounded-full font-ui">
                Save {savings}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
