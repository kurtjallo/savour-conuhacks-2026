'use client';

import { useState } from 'react';
import { useBasket } from '@/context/BasketContext';

interface Props {
  categoryId: string;
  name: string;
  prices: Record<string, number>;
  unit: string;
}

export default function AddToBasket({ categoryId, name, prices, unit }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, items } = useBasket();

  const existingItem = items.find(i => i.category_id === categoryId);

  const handleAdd = () => {
    addItem({ category_id: categoryId, name, prices, unit }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-xl font-bold"
        >
          −
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
          className="w-16 text-center text-xl font-bold border rounded-lg py-2"
          min="1"
          max="99"
        />
        <button
          onClick={() => setQuantity(Math.min(99, quantity + 1))}
          className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-xl font-bold"
        >
          +
        </button>
      </div>

      <button
        onClick={handleAdd}
        className={`flex-1 sm:flex-none px-8 py-3 rounded-full font-semibold text-white transition ${
          added
            ? 'bg-green-500'
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {added ? '✓ Added!' : existingItem ? 'Update Basket' : 'Add to Basket'}
      </button>

      {existingItem && (
        <span className="text-gray-500 text-sm">
          ({existingItem.quantity} in basket)
        </span>
      )}
    </div>
  );
}
