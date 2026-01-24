import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BasketItem } from '../lib/types';

interface BasketContextType {
  items: BasketItem[];
  addItem: (item: Omit<BasketItem, 'quantity'>, quantity?: number) => void;
  removeItem: (categoryId: string) => void;
  updateQuantity: (categoryId: string, quantity: number) => void;
  clearBasket: () => void;
  getItemCount: () => number;
  isLoaded: boolean;
}

const BasketContext = createContext<BasketContextType | null>(null);

const STORAGE_KEY = 'inflationfighter_basket';

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load basket from AsyncStorage on mount
  useEffect(() => {
    const loadBasket = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setItems(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load basket:', e);
      }
      setIsLoaded(true);
    };
    loadBasket();
  }, []);

  // Save basket to AsyncStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      const saveBasket = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
          console.error('Failed to save basket:', e);
        }
      };
      saveBasket();
    }
  }, [items, isLoaded]);

  const addItem = (item: Omit<BasketItem, 'quantity'>, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.category_id === item.category_id);
      if (existing) {
        return prev.map(i =>
          i.category_id === item.category_id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const removeItem = (categoryId: string) => {
    setItems(prev => prev.filter(i => i.category_id !== categoryId));
  };

  const updateQuantity = (categoryId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(categoryId);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.category_id === categoryId ? { ...i, quantity } : i))
    );
  };

  const clearBasket = () => {
    setItems([]);
  };

  const getItemCount = () => items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <BasketContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearBasket, getItemCount, isLoaded }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error('useBasket must be used within BasketProvider');
  }
  return context;
}
