import type { MultiStoreOptimal } from '../lib/types';

interface StoreBreakdownProps {
  multiStoreOptimal: MultiStoreOptimal;
}

// Store colors for visual distinction
const STORE_COLORS: Record<string, string> = {
  'no-frills': 'bg-yellow-500',
  'freshco': 'bg-green-500',
  'walmart': 'bg-blue-500',
  'loblaws': 'bg-red-500',
  'metro': 'bg-orange-500',
};

export default function StoreBreakdown({ multiStoreOptimal }: StoreBreakdownProps) {
  // Group items by store
  const itemsByStore = multiStoreOptimal.items.reduce((acc, item) => {
    const store = item.best_store;
    if (!acc[store]) {
      acc[store] = [];
    }
    acc[store].push(item);
    return acc;
  }, {} as Record<string, typeof multiStoreOptimal.items>);

  // Calculate subtotal per store
  const storeSubtotals = Object.entries(itemsByStore).map(([store, items]) => ({
    store,
    items,
    subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
          </svg>
          Multi-Store Optimal Shopping
        </h3>
        <p className="text-indigo-100 text-sm mt-1">
          Visit {multiStoreOptimal.stores_needed.length} store{multiStoreOptimal.stores_needed.length > 1 ? 's' : ''} for maximum savings
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {storeSubtotals.map(({ store, items, subtotal }) => (
          <div key={store} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${STORE_COLORS[store] || 'bg-gray-500'}`} />
              <h4 className="font-semibold text-gray-900 capitalize">
                {store.replace('-', ' ')}
              </h4>
              <span className="ml-auto font-bold text-gray-900">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2 pl-6">
              {items.map((item) => (
                <div
                  key={item.category_id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-gray-400">x{item.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      ${item.unit_price.toFixed(2)}/ea
                    </span>
                    <span className="font-medium text-gray-700">
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Grand total */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-700">Total</span>
          <span className="text-2xl font-bold text-gray-900">
            ${multiStoreOptimal.total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
