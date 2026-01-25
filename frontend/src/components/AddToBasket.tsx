import { useState } from 'react';
import type { Category } from '../lib/types';
import { useBasket } from '../context/BasketContext';

interface AddToBasketProps {
  category: Pick<Category, 'category_id' | 'name' | 'icon' | 'unit'>;
  onAdd?: () => void;
}

export default function AddToBasket({ category, onAdd }: AddToBasketProps) {
  const [quantity, setQuantity] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { addItem, items, updateQuantity } = useBasket();

  const existingItem = items.find((item) => item.category_id === category.category_id);

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToBasket = () => {
    if (existingItem) {
      updateQuantity(category.category_id, existingItem.quantity + quantity);
    } else {
      for (let i = 0; i < quantity; i++) {
        addItem({
          category_id: category.category_id,
          name: category.name,
          icon: category.icon,
        });
      }
    }

    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 2000);
    setQuantity(1);
    onAdd?.();
  };

  return (
    <div className="bg-white border border-savour-border rounded-2xl p-6">
      {/* Quantity Selector */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <button
          onClick={handleDecrease}
          disabled={quantity <= 1}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-savour-border
                     text-savour-text-secondary hover:border-savour-text-secondary hover:text-savour-text
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-savour-border
                     transition-all duration-200"
          aria-label="Decrease quantity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </button>

        <span className="text-2xl font-semibold text-savour-text w-12 text-center tabular-nums">
          {quantity}
        </span>

        <button
          onClick={handleIncrease}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-savour-border
                     text-savour-text-secondary hover:border-savour-text-secondary hover:text-savour-text
                     transition-all duration-200"
          aria-label="Increase quantity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Existing item indicator */}
      {existingItem && (
        <p className="text-savour-text-secondary text-sm text-center mb-4 font-ui">
          {existingItem.quantity} {category.unit} already in basket
        </p>
      )}

      {/* Add to Basket Button */}
      <button
        onClick={handleAddToBasket}
        className={`
          w-full py-4 px-6 font-medium rounded-xl transition-all duration-200
          flex items-center justify-center gap-2
          ${showConfirmation
            ? 'bg-savour-savings text-white'
            : 'bg-savour-accent hover:bg-savour-accent-hover text-white'
          }
        `}
      >
        {showConfirmation ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Added to cart</span>
          </>
        ) : (
          <span>Add to cart · {quantity} {category.unit}</span>
        )}
      </button>
    </div>
  );
}
