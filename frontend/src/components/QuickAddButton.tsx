import { useBasket } from '../context/BasketContext';
import type { Category } from '../lib/types';

interface QuickAddButtonProps {
  category: Pick<Category, 'category_id' | 'name' | 'icon'>;
}

export default function QuickAddButton({ category }: QuickAddButtonProps) {
  const { items, addItem, updateQuantity, removeItem } = useBasket();

  const existingItem = items.find((item) => item.category_id === category.category_id);
  const quantity = existingItem?.quantity || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      category_id: category.category_id,
      name: category.name,
      icon: category.icon,
    });
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (existingItem) {
      updateQuantity(category.category_id, quantity + 1);
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity === 1) {
      removeItem(category.category_id);
    } else if (quantity > 1) {
      updateQuantity(category.category_id, quantity - 1);
    }
  };

  // Not in cart - show + button
  if (quantity === 0) {
    return (
      <button
        onClick={handleAdd}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-accent text-white
                   shadow-md hover:bg-savour-accent-hover
                   active:scale-95
                   transition-all duration-200"
        aria-label={`Add ${category.name} to cart`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    );
  }

  // In cart - show quantity stepper
  return (
    <div
      className="flex items-center gap-0 bg-white border border-border rounded-full shadow-md overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Decrease / Trash button */}
      <button
        onClick={handleDecrease}
        className="w-9 h-9 flex items-center justify-center bg-charcoal text-white
                   hover:bg-charcoal-light
                   active:scale-95
                   transition-all duration-200"
        aria-label={quantity === 1 ? `Remove ${category.name} from cart` : `Decrease ${category.name} quantity`}
      >
        {quantity === 1 ? (
          // Trash icon
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        ) : (
          // Minus icon
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        )}
      </button>

      {/* Quantity display */}
      <span className="w-8 text-center text-sm font-semibold text-charcoal tabular-nums select-none">
        {quantity}
      </span>

      {/* Increase button */}
      <button
        onClick={handleIncrease}
        className="w-9 h-9 flex items-center justify-center bg-accent text-white
                   hover:bg-savour-accent-hover
                   active:scale-95
                   transition-all duration-200"
        aria-label={`Increase ${category.name} quantity`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
