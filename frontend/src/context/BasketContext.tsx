/**
 * Copyright (c) 2026 Savour. All Rights Reserved.
 *
 * This software and associated documentation files are proprietary and confidential.
 * Unauthorized copying, distribution, modification, or use of this software,
 * via any medium, is strictly prohibited without express written permission from Savour.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { BasketItem } from '../lib/types';

const STORAGE_KEY = 'inflation-fighter-basket';
const MAX_QUANTITY = 99;

interface BasketContextType {
  items: BasketItem[];
  totalCount: number;
  addItem: (item: Omit<BasketItem, 'quantity'>) => void;
  addItemWithQuantity: (item: Omit<BasketItem, 'quantity'>, quantity: number) => void;
  removeItem: (categoryId: string) => void;
  updateQuantity: (categoryId: string, quantity: number) => void;
  clearBasket: () => void;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = (item: Omit<BasketItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.category_id === item.category_id);
      if (existing) {
        return prev.map((i) =>
          i.category_id === item.category_id
            ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QUANTITY) }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const addItemWithQuantity = (item: Omit<BasketItem, 'quantity'>, quantity: number) => {
    const clampedQuantity = Math.min(Math.max(1, quantity), MAX_QUANTITY);
    setItems((prev) => {
      const existing = prev.find((i) => i.category_id === item.category_id);
      if (existing) {
        return prev.map((i) =>
          i.category_id === item.category_id
            ? { ...i, quantity: Math.min(i.quantity + clampedQuantity, MAX_QUANTITY) }
            : i
        );
      }
      return [...prev, { ...item, quantity: clampedQuantity }];
    });
  };

  const removeItem = (categoryId: string) => {
    setItems((prev) => prev.filter((i) => i.category_id !== categoryId));
  };

  const updateQuantity = (categoryId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(categoryId);
      return;
    }
    const clampedQuantity = Math.min(quantity, MAX_QUANTITY);
    setItems((prev) =>
      prev.map((i) =>
        i.category_id === categoryId ? { ...i, quantity: clampedQuantity } : i
      )
    );
  };

  const clearBasket = () => {
    setItems([]);
  };

  return (
    <BasketContext.Provider
      value={{
        items,
        totalCount,
        addItem,
        addItemWithQuantity,
        removeItem,
        updateQuantity,
        clearBasket,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (context === undefined) {
    throw new Error('useBasket must be used within a BasketProvider');
  }
  return context;
}
