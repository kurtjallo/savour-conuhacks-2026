import { getCategory } from '@/lib/api';
import Link from 'next/link';
import AddToBasket from '@/components/AddToBasket';
import { notFound } from 'next/navigation';

const ICONS: Record<string, string> = {
  egg: '🥚', milk: '🥛', 'bread-slice': '🍞', cube: '🧈',
  'apple-whole': '🍎', banana: '🍌', potato: '🥔', onion: '🧅',
  'drumstick-bite': '🍗', burger: '🍔', utensils: '🍝',
  'bowl-rice': '🍚', cheese: '🧀', jar: '🥫', 'bowl-food': '🥣'
};

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const category = await getCategory(params.id).catch(() => notFound());

  const icon = ICONS[category.icon] || '🛒';
  const cheapest = category.prices[0];
  const mostExpensive = category.prices[category.prices.length - 1];
  const savingsPercent = Math.round((1 - cheapest.price / mostExpensive.price) * 100);

  const pricesMap: Record<string, number> = {};
  category.prices.forEach(p => {
    pricesMap[p.store_id] = p.price;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="text-green-600 hover:text-green-700 mb-6 inline-block">
        ← Back to categories
      </Link>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-6xl">{icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{category.name}</h1>
            <p className="text-gray-500">{category.unit}</p>
          </div>
        </div>

        {savingsPercent > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-green-800 font-semibold">
              Save up to {savingsPercent}% by choosing {cheapest.store_name} over {mostExpensive.store_name}!
            </p>
            <p className="text-green-600 text-sm">
              That&apos;s ${(mostExpensive.price - cheapest.price).toFixed(2)} savings per {category.unit}
            </p>
          </div>
        )}

        <h2 className="text-xl font-semibold mb-4">Price Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Rank</th>
                <th className="text-left py-3 px-4">Store</th>
                <th className="text-right py-3 px-4">Price per {category.unit}</th>
              </tr>
            </thead>
            <tbody>
              {category.prices.map((price, index) => (
                <tr
                  key={price.store_id}
                  className={`border-b ${
                    index === 0 ? 'bg-green-50' :
                    index === 1 ? 'bg-gray-50' :
                    index === 2 ? 'bg-orange-50' : ''
                  }`}
                >
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-2">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className="font-semibold"
                      style={{ color: price.color }}
                    >
                      {price.store_name}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-lg">
                    ${price.price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 pt-8 border-t">
          <AddToBasket
            categoryId={category.category_id}
            name={category.name}
            prices={pricesMap}
            unit={category.unit}
          />
        </div>
      </div>
    </div>
  );
}
