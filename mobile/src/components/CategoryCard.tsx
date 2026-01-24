import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../lib/types';
import { getIconConfig } from '../lib/icons';
import { useFavorites } from '../context/FavoritesContext';

interface Props {
  category: Category;
  onPress: () => void;
  showFavorite?: boolean;
  onQuickAdd?: () => void;
}

export default function CategoryCard({ category, onPress, showFavorite = true, onQuickAdd }: Props) {
  const iconConfig = getIconConfig(category.icon);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(category.category_id);

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    toggleFavorite(category.category_id);
  };

  const handleQuickAdd = (e: any) => {
    e.stopPropagation();
    onQuickAdd?.();
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Favorite heart - top right */}
      {showFavorite && (
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={favorited ? "heart" : "heart-outline"}
            size={20}
            color={favorited ? "#EF4444" : "#D1D5DB"}
          />
        </TouchableOpacity>
      )}

      {/* Quick-add button - bottom right */}
      {onQuickAdd && (
        <TouchableOpacity
          style={styles.quickAddButton}
          onPress={handleQuickAdd}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="add" size={18} color="#2D8F4E" />
        </TouchableOpacity>
      )}

      {/* Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name={iconConfig.name} size={28} color="#2D8F4E" />
      </View>

      {/* Product name */}
      <Text style={styles.name} numberOfLines={2}>{category.name}</Text>

      {/* Price range */}
      <Text style={styles.priceRange}>
        <Text style={styles.priceMain}>${category.cheapest_price.toFixed(2)}</Text>
        <Text style={styles.priceSeparator}> - </Text>
        <Text style={styles.priceSecondary}>${category.most_expensive_price.toFixed(2)}</Text>
      </Text>

      {/* Savings badge */}
      {category.savings_percent > 0 && (
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsText}>Save {category.savings_percent}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    flex: 1,
    margin: 6,
    position: 'relative',
    minHeight: 160,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  quickAddButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#F3F4F6',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 18,
  },
  priceRange: {
    marginBottom: 8,
  },
  priceMain: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D8F4E',
  },
  priceSeparator: {
    fontSize: 13,
    color: '#6B7280',
  },
  priceSecondary: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  savingsBadge: {
    backgroundColor: '#E8F5EC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2D8F4E',
  },
});
