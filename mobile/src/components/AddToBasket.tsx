import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useBasket } from '../context/BasketContext';
import { colors, spacing, fontSizes } from '../lib/theme';

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
    <View style={styles.container}>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
        >
          <Text style={styles.quantityButtonText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => setQuantity(Math.min(99, quantity + 1))}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.addButton, added && styles.addButtonSuccess]}
        onPress={handleAdd}
      >
        <Text style={styles.addButtonText}>
          {added ? '✓ Added!' : existingItem ? 'Update Basket' : 'Add to Basket'}
        </Text>
      </TouchableOpacity>

      {existingItem && (
        <Text style={styles.existingText}>({existingItem.quantity} in basket)</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  quantityText: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 30,
  },
  addButtonSuccess: {
    backgroundColor: '#22c55e', // green-500
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: fontSizes.lg,
  },
  existingText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
  },
});
