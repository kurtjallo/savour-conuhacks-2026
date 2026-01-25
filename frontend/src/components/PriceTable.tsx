import type { PriceEntry } from '../lib/types';

interface PriceTableProps {
  prices: PriceEntry[];
  unit: string;
}

interface PriceRow {
  store_id: string;
  store_name: string;
  price: number;
  rank: number;
  savingsPercent: number;
}

export default function PriceTable({ prices, unit }: PriceTableProps) {
  const priceRows: PriceRow[] = prices
    .map((entry) => ({
      store_id: entry.store_id,
      store_name: entry.store_name,
      price: entry.price,
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
    <div className="space-y-3">
      {priceRows.map((row) => (
        <div
          key={row.store_id}
          className={`
            group relative bg-white border rounded-xl px-5 py-4
            transition-all duration-200 cursor-pointer
            ${row.rank === 1
              ? 'border-l-4 border-l-savour-savings border-savour-savings/30 bg-savour-savings-light/40 shadow-sm hover:shadow-md'
              : 'border-savour-border hover:border-savour-text-secondary/40 hover:shadow-sm hover:bg-gray-50/50'
            }
          `}
        >
          <div className="flex items-center justify-between">
            {/* Left side: Rank + Store name */}
            <div className="flex items-center gap-4">
              <span className={`
                text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                ${row.rank === 1
                  ? 'bg-savour-savings text-white'
                  : 'bg-gray-100 text-savour-text-secondary'
                }
              `}>
                {row.rank}
              </span>
              <span className={`
                font-medium text-base
                ${row.rank === 1 ? 'text-savour-text' : 'text-savour-text group-hover:text-savour-text'}
              `}>
                {row.store_name}
              </span>
            </div>

            {/* Right side: Price + Savings */}
            <div className="flex items-center gap-3">
              {row.savingsPercent > 0 && (
                <span className={`
                  text-xs font-semibold px-2.5 py-1 rounded-full
                  ${row.rank === 1
                    ? 'bg-savour-savings text-white'
                    : 'bg-savour-savings-light text-savour-savings'
                  }
                `}>
                  Save {row.savingsPercent}%
                </span>
              )}
              <span className={`
                font-bold tabular-nums
                ${row.rank === 1 ? 'text-savour-savings text-xl' : 'text-savour-text text-base'}
              `}>
                ${row.price.toFixed(2)}
                <span className="text-savour-text-secondary text-xs font-normal ml-0.5">/{unit}</span>
              </span>
            </div>
          </div>

          {/* Best price indicator */}
          {row.rank === 1 && (
            <div className="absolute -top-2.5 left-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-savour-savings px-2.5 py-1 rounded-full shadow-sm">
                Best Price
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
