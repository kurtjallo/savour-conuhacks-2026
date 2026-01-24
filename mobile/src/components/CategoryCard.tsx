import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Category } from '../lib/types';
import { getIcon } from '../lib/icons';
import { colors, spacing, fontSizes } from '../lib/theme';

interface Props {
  category: Category;
  onPress: () => void;
}

export default function CategoryCard({ category, onPress }: Props) {
  const icon = getIcon(category.icon);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.name}>{category.name}</Text>
      <Text style={styles.unit}>{category.unit}</Text>
      <Text style={styles.price}>From ${category.cheapest_price.toFixed(2)}</Text>
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
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flex: 1,
    margin: spacing.sm,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  unit: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  savingsBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  savingsText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.primaryDark,
  },
});
