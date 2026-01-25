import { useState } from 'react';
import type { Category } from '../lib/types';
import { useBasket } from '../context/BasketContext';

interface AddToBasketProps {
  category: Pick<Category, 'category_id' | 'name' | 'icon' | 'unit'>;
  bestPrice?: number;
  onAdd?: () => void;
}
// t
export default function AddToBasket({ category, bestPrice, onAdd }: AddToBasketProps) {
  const [quantity, setQuantity] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { addItemWithQuantity, items, updateQuantity } = useBasket();

  const existingItem = items.find((item) => item.category_id === category.category_id);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price);
  };

  const totalPrice = bestPrice ? bestPrice * quantity : null;
  const existingTotalPrice = bestPrice && existingItem ? bestPrice * existingItem.quantity : null;

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
      addItemWithQuantity({
        category_id: category.category_id,
        name: category.name,
        icon: category.icon,
      }, quantity);
    }

    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 2000);
    setQuantity(1);
    onAdd?.();
  };

  return (
    <div className="bg-white border border-savour-border rounded-2xl p-6 shadow-sm">
      {/* Quantity Selector */}
      <p className="text-xs uppercase tracking-wide text-savour-text-secondary text-center mb-4">Select quantity</p>
      <div className="flex items-center justify-center gap-6 mb-6">
        <button
          onClick={handleDecrease}
          disabled={quantity <= 1}
          className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-savour-border
                     text-savour-text-secondary hover:border-savour-accent hover:text-savour-accent hover:bg-savour-accent/5
                     active:scale-95
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-savour-border disabled:hover:bg-transparent disabled:hover:text-savour-text-secondary
                     transition-all duration-200"
          aria-label="Decrease quantity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-savour-text w-16 text-center tabular-nums">
            {quantity}
          </span>
          {bestPrice && (
            <span className="text-xs text-savour-text-secondary mt-1">
              {formatPrice(bestPrice)} each
            </span>
          )}
        </div>

        <button
          onClick={handleIncrease}
          className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-savour-border
                     text-savour-text-secondary hover:border-savour-accent hover:text-savour-accent hover:bg-savour-accent/5
                     active:scale-95
                     transition-all duration-200"
          aria-label="Increase quantity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Existing item indicator */}
      {existingItem && (
        <div className="bg-savour-accent/5 border border-savour-accent/20 rounded-lg px-4 py-2.5 mb-4">
          <p className="text-savour-accent text-sm text-center font-medium">
            <svg className="w-4 h-4 inline mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {existingItem.quantity} {category.unit}
            {existingTotalPrice && ` (${formatPrice(existingTotalPrice)})`} in basket
          </p>
        </div>
      )}

      {/* Add to Basket Button */}
      <button
        onClick={handleAddToBasket}
        className={`
          w-full py-4 px-6 font-semibold rounded-xl transition-all duration-200
          flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg
          active:scale-[0.98]
          ${showConfirmation
            ? 'bg-savour-savings text-white'
            : 'bg-savour-accent hover:bg-savour-accent-hover text-white'
          }
        `}
      >
        {showConfirmation ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Added to cart</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>
              Add to cart · {totalPrice ? formatPrice(totalPrice) : `${quantity} ${category.unit}`}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
