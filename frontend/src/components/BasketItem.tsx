import type { BasketItem as BasketItemType } from '../lib/types';

// Design system colors
const colors = {
  cardBorder: '#e8e6e3',
  textPrimary: '#2e2c29',
  textSecondary: '#6b6966',
};

interface BasketItemProps {
  item: BasketItemType;
  onUpdateQuantity: (categoryId: string, quantity: number) => void;
  onRemove: (categoryId: string) => void;
}

export default function BasketItem({ item, onUpdateQuantity, onRemove }: BasketItemProps) {
  return (
    <div
      className="group flex items-center justify-between bg-white rounded-xl p-5 border transition-all"
      style={{ borderColor: colors.cardBorder }}
    >
      <div className="flex items-center gap-4">
        <span
          className="text-2xl opacity-60"
          aria-hidden="true"
        >
          {item.icon}
        </span>
        <div>
          <h3
            className="font-medium"
            style={{ color: colors.textPrimary, fontFamily: "'Work Sans', sans-serif" }}
          >
            {item.name}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quantity controls */}
        <div
          className="flex items-center gap-1 border rounded-lg"
          style={{ borderColor: colors.cardBorder }}
        >
          <button
            onClick={() => onUpdateQuantity(item.category_id, item.quantity - 1)}
            className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-gray-50 rounded-l-lg"
            style={{ color: colors.textSecondary }}
            aria-label="Decrease quantity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
          </button>
          <span
            className="w-10 text-center text-sm font-medium"
            style={{ color: colors.textPrimary }}
          >
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.category_id, item.quantity + 1)}
            className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-gray-50 rounded-r-lg"
            style={{ color: colors.textSecondary }}
            aria-label="Increase quantity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        {/* Remove button - subtle, appears more visible on hover */}
        <button
          onClick={() => onRemove(item.category_id)}
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-all opacity-40 group-hover:opacity-100 hover:bg-gray-100"
          style={{ color: colors.textSecondary }}
          aria-label="Remove item"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
