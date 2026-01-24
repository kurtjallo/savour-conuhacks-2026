import Link from 'next/link';
import { Category } from '@/lib/types';

const ICONS: Record<string, string> = {
  egg: '🥚', milk: '🥛', 'bread-slice': '🍞', cube: '🧈',
  'apple-whole': '🍎', banana: '🍌', potato: '🥔', onion: '🧅',
  'drumstick-bite': '🍗', burger: '🍔', utensils: '🍝',
  'bowl-rice': '🍚', cheese: '🧀', jar: '🥫', 'bowl-food': '🥣'
};

export default function CategoryCard({ category }: { category: Category }) {
  const icon = ICONS[category.icon] || '🛒';

  return (
    <Link
      href={`/category/${category.category_id}`}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all hover:scale-105 p-6 flex flex-col items-center text-center"
    >
      <span className="text-5xl mb-3">{icon}</span>
      <h3 className="font-semibold text-gray-800 mb-1">{category.name}</h3>
      <p className="text-sm text-gray-500 mb-2">{category.unit}</p>
      <p className="text-lg font-bold text-green-600">
        From ${category.cheapest_price.toFixed(2)}
      </p>
      {category.savings_percent > 0 && (
        <span className="mt-2 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
          Save {category.savings_percent}%
        </span>
      )}
    </Link>
  );
}
