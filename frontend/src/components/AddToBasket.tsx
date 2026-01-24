import { useState } from 'react';
import type { Category } from '../lib/types';
import { useBasket } from '../context/BasketContext';

interface AddToBasketProps {
  category: Category;
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
      // Update existing item quantity
      updateQuantity(category.category_id, existingItem.quantity + quantity);
    } else {
      // Add as new item
      for (let i = 0; i < quantity; i++) {
        addItem({
          category_id: category.category_id,
          name: category.name,
          icon: category.icon,
        });
      }
    }

    // Show confirmation
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 2000);

    // Reset quantity
    setQuantity(1);

    // Call optional callback
    onAdd?.();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Add to Basket</h3>

      {/* Quantity Selector */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={handleDecrease}
          disabled={quantity <= 1}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease quantity"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <span className="text-3xl font-bold text-gray-900 w-16 text-center">{quantity}</span>

        <button
          onClick={handleIncrease}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Increase quantity"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Existing item indicator */}
      {existingItem && (
        <p className="text-sm text-gray-500 text-center mb-4">
          Already in basket: {existingItem.quantity} {category.unit}
        </p>
      )}

      {/* Add to Basket Button */}
      <button
        onClick={handleAddToBasket}
        className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        Add {quantity} {category.unit} to Basket
      </button>

      {/* Confirmation Toast */}
      {showConfirmation && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in z-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Added to basket!</span>
        </div>
      )}
    </div>
  );
}
