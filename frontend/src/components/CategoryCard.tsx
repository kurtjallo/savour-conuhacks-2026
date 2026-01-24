import { useNavigate } from 'react-router-dom';
import type { Category } from '../lib/types';
import { getIcon } from '../lib/icons';

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

  const formatStoreName = (storeId: string): string => {
    const storeNames: Record<string, string> = {
      'no-frills': 'No Frills',
      'freshco': 'FreshCo',
      'walmart': 'Walmart',
      'loblaws': 'Loblaws',
      'metro': 'Metro',
    };
    return storeNames[storeId] || storeId;
  };

  const handleClick = () => {
    navigate(`/category/${category.category_id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-green-200 hover:scale-[1.02] transition-all duration-200 flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-4xl" role="img" aria-label={category.name}>
          {getIcon(category.icon)}
        </span>
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
          Best at {formatStoreName(category.cheapest_store)}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        {category.name}
      </h3>

      <p className="text-sm text-gray-500 mb-3">
        {category.unit}
      </p>

      <div className="mt-auto">
        <p className="text-2xl font-bold text-green-600">
          {formatPrice(category.cheapest_price)}
        </p>
        {category.most_expensive_price > category.cheapest_price && (
          <p className="text-xs text-gray-400 line-through">
            {formatPrice(category.most_expensive_price)}
          </p>
        )}
      </div>
    </div>
  );
}
