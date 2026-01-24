import type { MultiStoreItem } from '../lib/types';

// Design system colors
const colors = {
  cardBorder: '#e8e6e3',
  textPrimary: '#2e2c29',
  textSecondary: '#6b6966',
};

interface StoreBreakdownProps {
  items: MultiStoreItem[];
  total: number;
}

export default function StoreBreakdown({ items, total }: StoreBreakdownProps) {
  // Group items by store
  const itemsByStore = items.reduce((acc, item) => {
    const store = item.store_id;
    if (!acc[store]) {
      acc[store] = [];
    }
    acc[store].push(item);
    return acc;
  }, {} as Record<string, MultiStoreItem[]>);

  // Calculate subtotal per store
  const storeSubtotals = Object.entries(itemsByStore).map(([store, items]) => ({
    store,
    items,
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  }));

  return (
    <section>
      <h2
        className="text-lg font-semibold mb-5"
        style={{ color: colors.textPrimary }}
      >
        Shopping List
      </h2>

      <div
        className="bg-white rounded-xl border overflow-hidden"
        style={{ borderColor: colors.cardBorder }}
      >
        <div className="divide-y" style={{ borderColor: colors.cardBorder }}>
          {storeSubtotals.map(({ store, items, subtotal }) => (
            <div key={store} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="font-medium capitalize"
                  style={{ color: colors.textPrimary }}
                >
                  {items[0]?.store_name?.replace('-', ' ') ?? store.replace('-', ' ')}
                </h3>
                <span
                  className="font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.category_id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: colors.textPrimary }}>
                        {item.name}
                      </span>
                      <span style={{ color: colors.textSecondary }}>
                        x{item.quantity}
                      </span>
                    </div>
                    <span style={{ color: colors.textSecondary }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div
          className="px-5 py-4 border-t"
          style={{
            borderColor: colors.cardBorder,
            backgroundColor: '#fafaf9'
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="font-semibold"
              style={{ color: colors.textPrimary }}
            >
              Total
            </span>
            <span
              className="text-xl font-semibold"
              style={{ color: colors.textPrimary }}
            >
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
