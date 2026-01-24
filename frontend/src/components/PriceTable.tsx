import type { Store } from '../lib/types';

interface PriceTableProps {
  prices: Record<string, number>;
  stores: Store[];
  unit: string;
}

interface PriceRow {
  store_id: string;
  store_name: string;
  price: number;
  rank: number;
  savingsPercent: number;
}

function getMedal(rank: number): string {
  switch (rank) {
    case 1:
      return '1';
    case 2:
      return '2';
    case 3:
      return '3';
    default:
      return String(rank);
  }
}

function getMedalEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return '\uD83E\uDD47';
    case 2:
      return '\uD83E\uDD48';
    case 3:
      return '\uD83E\uDD49';
    default:
      return '';
  }
}

export default function PriceTable({ prices, stores, unit }: PriceTableProps) {
  // Build price rows with store names
  const priceRows: PriceRow[] = stores
    .filter((store) => prices[store.store_id] !== undefined)
    .map((store) => ({
      store_id: store.store_id,
      store_name: store.name,
      price: prices[store.store_id],
      rank: 0,
      savingsPercent: 0,
    }))
    .sort((a, b) => a.price - b.price);

  // Calculate rank and savings vs highest
  const highestPrice = priceRows.length > 0 ? priceRows[priceRows.length - 1].price : 0;

  priceRows.forEach((row, index) => {
    row.rank = index + 1;
    if (highestPrice > 0) {
      row.savingsPercent = Math.round(((highestPrice - row.price) / highestPrice) * 100);
    }
  });

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rank</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Store</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Price/{unit}</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">vs Highest</th>
          </tr>
        </thead>
        <tbody>
          {priceRows.map((row) => (
            <tr
              key={row.store_id}
              className={`border-b border-gray-100 transition-colors ${
                row.rank === 1 ? 'bg-green-50' : 'hover:bg-gray-50'
              }`}
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  {row.rank <= 3 ? (
                    <span className="text-xl">{getMedalEmoji(row.rank)}</span>
                  ) : (
                    <span className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded-full text-sm font-medium text-gray-600">
                      {getMedal(row.rank)}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-4">
                <span className={`font-medium ${row.rank === 1 ? 'text-green-700' : 'text-gray-800'}`}>
                  {row.store_name}
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <span className={`font-semibold ${row.rank === 1 ? 'text-green-700' : 'text-gray-900'}`}>
                  ${row.price.toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                {row.savingsPercent > 0 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Save {row.savingsPercent}%
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
