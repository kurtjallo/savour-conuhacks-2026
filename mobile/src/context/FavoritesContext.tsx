import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (categoryId: string) => void;
  isFavorite: (categoryId: string) => boolean;
  isLoaded: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const STORAGE_KEY = 'inflationfighter_favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setFavorites(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load favorites:', e);
      }
      setIsLoaded(true);
    };
    loadFavorites();
  }, []);

  // Save favorites to AsyncStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      const saveFavorites = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        } catch (e) {
          console.error('Failed to save favorites:', e);
        }
      };
      saveFavorites();
    }
  }, [favorites, isLoaded]);

  const toggleFavorite = (categoryId: string) => {
    setFavorites(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  };

  const isFavorite = (categoryId: string) => favorites.includes(categoryId);

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, isFavorite, isLoaded }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
