import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../lib/types';
import { getIconConfig } from '../lib/icons';
import { spacing, fontSizes } from '../lib/theme';
import { useBasket } from '../context/BasketContext';

interface Props {
  category: Category;
  onPress: () => void;
}

export default function FavoriteCard({ category, onPress }: Props) {
  const iconConfig = getIconConfig(category.icon);
  const { addItem } = useBasket();

  const handleAddToBasket = (e: any) => {
    e.stopPropagation();
    // Get prices from the category - need to construct from cheapest_price
    // Since we only have cheapest_price in Category, we'll add with minimal data
    addItem({
      category_id: category.category_id,
      name: category.name,
      prices: {}, // Will be populated when viewing category detail
      unit: category.unit,
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={iconConfig.name} size={24} color="#2D8F4E" />
        </View>
        <Text style={styles.name} numberOfLines={1}>{category.name}</Text>
        <Text style={styles.price}>${category.cheapest_price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddToBasket}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
      >
        <Ionicons name="add" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.md,
    width: 120,
    flexDirection: 'column',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#2D8F4E',
  },
  addButton: {
    backgroundColor: '#2D8F4E',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
