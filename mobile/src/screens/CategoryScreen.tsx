import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { CategoryDetail } from '../lib/types';
import { getCategory } from '../lib/api';
import { getIcon } from '../lib/icons';
import AddToBasket from '../components/AddToBasket';
import { colors, spacing, fontSizes } from '../lib/theme';
import { RootStackParamList } from '../navigation/types';

type CategoryRouteProp = RouteProp<RootStackParamList, 'Category'>;

export default function CategoryScreen() {
  const route = useRoute<CategoryRouteProp>();
  const { id } = route.params;

  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await getCategory(id);
        setCategory(data);
      } catch (e) {
        setError('Failed to load category');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !category) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Category not found'}</Text>
      </SafeAreaView>
    );
  }

  const icon = getIcon(category.icon);
  const cheapest = category.prices[0];
  const mostExpensive = category.prices[category.prices.length - 1];
  const savingsPercent = Math.round((1 - cheapest.price / mostExpensive.price) * 100);

  const pricesMap: Record<string, number> = {};
  category.prices.forEach(p => {
    pricesMap[p.store_id] = p.price;
  });

  const getMedal = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRowStyle = (index: number) => {
    if (index === 0) return styles.rowFirst;
    if (index === 1) return styles.rowSecond;
    if (index === 2) return styles.rowThird;
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.icon}>{icon}</Text>
            <View style={styles.headerText}>
              <Text style={styles.title}>{category.name}</Text>
              <Text style={styles.unit}>{category.unit}</Text>
            </View>
          </View>

          {/* Savings Banner */}
          {savingsPercent > 0 && (
            <View style={styles.savingsBanner}>
              <Text style={styles.savingsMain}>
                Save up to {savingsPercent}% by choosing {cheapest.store_name} over{' '}
                {mostExpensive.store_name}!
              </Text>
              <Text style={styles.savingsSub}>
                That's ${(mostExpensive.price - cheapest.price).toFixed(2)} savings per{' '}
                {category.unit}
              </Text>
            </View>
          )}

          {/* Price Table */}
          <Text style={styles.sectionTitle}>Price Comparison</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colRank]}>Rank</Text>
              <Text style={[styles.tableHeaderCell, styles.colStore]}>Store</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>
                Price/{category.unit}
              </Text>
            </View>
            {category.prices.map((price, index) => (
              <View key={price.store_id} style={[styles.tableRow, getRowStyle(index)]}>
                <Text style={[styles.tableCell, styles.colRank]}>{getMedal(index)}</Text>
                <Text
                  style={[styles.tableCell, styles.colStore, { color: price.color }]}
                >
                  {price.store_name}
                </Text>
                <Text style={[styles.tableCell, styles.colPrice, styles.priceText]}>
                  ${price.price.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Add to Basket */}
          <View style={styles.addToBasketContainer}>
            <AddToBasket
              categoryId={category.category_id}
              name={category.name}
              prices={pricesMap}
              unit={category.unit}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSizes.lg,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 64,
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  unit: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  savingsBanner: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  savingsMain: {
    color: colors.primaryDark,
    fontWeight: '600',
    fontSize: fontSizes.md,
    marginBottom: spacing.xs,
  },
  savingsSub: {
    color: colors.primary,
    fontSize: fontSizes.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  table: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderCell: {
    fontWeight: '600',
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowFirst: {
    backgroundColor: colors.primaryLight,
  },
  rowSecond: {
    backgroundColor: '#f9fafb',
  },
  rowThird: {
    backgroundColor: '#fff7ed',
  },
  tableCell: {
    fontSize: fontSizes.md,
  },
  colRank: {
    width: 50,
  },
  colStore: {
    flex: 1,
    fontWeight: '600',
  },
  colPrice: {
    width: 80,
    textAlign: 'right',
  },
  priceText: {
    fontWeight: '700',
    fontSize: fontSizes.lg,
  },
  addToBasketContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
});
