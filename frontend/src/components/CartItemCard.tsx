import type { BasketItem as BasketItemType } from '../lib/types';

interface CartItemCardProps {
  item: BasketItemType;
  isSelected: boolean;
  onToggleSelect: (categoryId: string) => void;
  onUpdateQuantity: (categoryId: string, quantity: number) => void;
  onRemove: (categoryId: string) => void;
  price?: number;
  storeName?: string;
  imageUrl?: string;
}

export default function CartItemCard({
  item,
  isSelected,
  onToggleSelect,
  onUpdateQuantity,
  onRemove,
  price,
  storeName,
  imageUrl,
}: CartItemCardProps) {
  const totalPrice = price ? price * item.quantity : null;

  return (
    <div className={`
      relative flex items-start gap-4 bg-white rounded-xl p-4 border transition-all duration-200
      ${isSelected ? 'border-savour-accent/30 bg-savour-accent/5' : 'border-savour-border hover:border-savour-text-secondary/30'}
    `}>
      {/* Selection Checkbox */}
      <div className="pt-1">
        <button
          onClick={() => onToggleSelect(item.category_id)}
          className={`
            w-5 h-5 rounded flex items-center justify-center border-2 transition-all duration-200
            ${isSelected
              ? 'bg-savour-accent border-savour-accent'
              : 'border-gray-300 hover:border-savour-accent'
            }
          `}
          aria-label={isSelected ? 'Deselect item' : 'Select item'}
        >
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Product Image */}
      <div className="flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-20 h-20 object-cover rounded-lg bg-gray-100"
          />
        ) : (
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border border-gray-200">
            <span className="text-3xl">{item.icon}</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-savour-text truncate">{item.name}</h3>
            {storeName && (
              <p className="text-xs text-savour-text-secondary mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                  </svg>
                  Best at {storeName}
                </span>
              </p>
            )}
          </div>

          {/* Remove button */}
          <button
            onClick={() => onRemove(item.category_id)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Remove item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Price and Quantity Row */}
        <div className="flex items-center justify-between mt-3">
          <div>
            {totalPrice !== null ? (
              <p className="text-lg font-semibold text-savour-text">
                ${totalPrice.toFixed(2)}
              </p>
            ) : (
              <p className="text-lg font-semibold text-savour-text">--</p>
            )}
            {price && item.quantity > 1 && (
              <p className="text-xs text-savour-text-secondary">${price.toFixed(2)} each</p>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-1 border border-savour-border rounded-lg bg-white">
            <button
              onClick={() => onUpdateQuantity(item.category_id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-savour-text-secondary hover:text-savour-text hover:bg-gray-50 rounded-l-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </button>
            <span className="w-8 text-center text-sm font-medium text-savour-text tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.category_id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-savour-text-secondary hover:text-savour-text hover:bg-gray-50 rounded-r-lg transition-colors"
              aria-label="Increase quantity"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
