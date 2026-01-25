import { useState } from 'react';
import type { Category } from '../lib/types';
import { useBasket } from '../context/BasketContext';

interface AddToBasketProps {
  category: Pick<Category, 'category_id' | 'name' | 'icon' | 'unit'>;
  bestPrice?: number;
  onAdd?: () => void;
  compact?: boolean;
}

export default function AddToBasket({ category, bestPrice, onAdd, compact = false }: AddToBasketProps) {
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

  // Compact mode for mobile sticky footer
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* Quantity Selector */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1 py-1">
          <button
            onClick={handleDecrease}
            disabled={quantity <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-full
                       text-charcoal-light hover:bg-white hover:text-accent
                       active:scale-95
                       disabled:opacity-30 disabled:cursor-not-allowed
                       transition-all duration-200"
            aria-label="Decrease quantity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>

          <span className="text-lg font-bold text-charcoal w-8 text-center tabular-nums">
            {quantity}
          </span>

          <button
            onClick={handleIncrease}
            className="w-8 h-8 flex items-center justify-center rounded-full
                       text-charcoal-light hover:bg-white hover:text-accent
                       active:scale-95
                       transition-all duration-200"
            aria-label="Increase quantity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Add to Basket Button */}
        <button
          onClick={handleAddToBasket}
          className={`
            flex-1 py-3.5 px-5 font-semibold rounded-full transition-all duration-200
            flex items-center justify-center gap-2 shadow-md hover:shadow-lg
            active:scale-[0.98]
            ${showConfirmation
              ? 'bg-sage text-white'
              : 'bg-accent hover:bg-accent/90 text-white'
            }
          `}
        >
          {showConfirmation ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Added!</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>
                Add {totalPrice ? `· ${formatPrice(totalPrice)}` : ''}
              </span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-subtle">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-charcoal font-display">Add to Cart</h3>
      </div>

      {/* Quantity Selector */}
      <p className="text-xs uppercase tracking-wide text-charcoal-light text-center mb-4">Select quantity</p>
      <div className="flex items-center justify-center gap-6 mb-6">
        <button
          onClick={handleDecrease}
          disabled={quantity <= 1}
          className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-border
                     text-charcoal-light hover:border-accent hover:text-accent hover:bg-accent/5
                     active:scale-95
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-transparent disabled:hover:text-charcoal-light
                     transition-all duration-200"
          aria-label="Decrease quantity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-4xl font-bold text-charcoal w-20 text-center tabular-nums font-display">
            {quantity}
          </span>
          {bestPrice && (
            <span className="text-sm text-charcoal-light mt-1">
              {formatPrice(bestPrice)} each
            </span>
          )}
        </div>

        <button
          onClick={handleIncrease}
          className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-border
                     text-charcoal-light hover:border-accent hover:text-accent hover:bg-accent/5
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
        <div className="bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 mb-5">
          <p className="text-accent text-sm text-center font-medium flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>
              {existingItem.quantity} {category.unit}
              {existingTotalPrice && ` (${formatPrice(existingTotalPrice)})`} already in cart
            </span>
          </p>
        </div>
      )}

      {/* Add to Basket Button */}
      <button
        onClick={handleAddToBasket}
        className={`
          w-full py-4 px-6 font-semibold rounded-full transition-all duration-200
          flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg
          active:scale-[0.98]
          ${showConfirmation
            ? 'bg-sage text-white'
            : 'bg-accent hover:bg-accent/90 text-white'
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
              Add to cart{totalPrice ? ` · ${formatPrice(totalPrice)}` : ''}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
