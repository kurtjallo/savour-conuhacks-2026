import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { CategoryDetail } from '../lib/types';
import { getCategory } from '../lib/api';
import { getIconConfig } from '../lib/icons';
import { useBasket } from '../context/BasketContext';
import { spacing, fontSizes } from '../lib/theme';
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
        <ActivityIndicator size="large" color="#2D8F4E" />
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

  const iconConfig = getIconConfig(category.icon);
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

  // Calculate price per standard unit (e.g., $/kg, $/L)
  const getPricePerUnit = (price: number): string | null => {
    if (!category.unit_qty || category.unit_qty <= 0 || !category.standard_unit || category.unit_qty === 1) {
      return null;
    }
    const perUnitPrice = price / category.unit_qty;
    return `$${perUnitPrice.toFixed(2)}/${category.standard_unit}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.iconContainer}>
            <Ionicons name={iconConfig.name} size={48} color="#2D8F4E" />
          </View>
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
            <Text style={[styles.tableHeaderCell, styles.colPriceHeader]}>
              Price
            </Text>
          </View>
          {category.prices.map((price, index) => {
            const perUnitPrice = getPricePerUnit(price.price);
            const hasDeal = !!price.deal;
            const dealSavings = hasDeal && price.deal
              ? (price.deal.regular_price - price.deal.sale_price).toFixed(2)
              : null;
            const isCheapest = index === 0;
            return (
              <View key={price.store_id} style={[styles.tableRow, isCheapest && styles.cheapestRow, index === category.prices.length - 1 && styles.lastRow]}>
                <Text style={[styles.tableCell, styles.colRank]}>{getMedal(index)}</Text>
                <View style={styles.colStoreContainer}>
                  <Text style={[styles.tableCell, styles.colStore]}>
                    {price.store_name}
                  </Text>
                  {isCheapest && (
                    <View style={styles.bestPriceBadge}>
                      <Text style={styles.bestPriceBadgeText}>BEST PRICE</Text>
                    </View>
                  )}
                  {hasDeal && (
                    <View style={styles.saleBadge}>
                      <Text style={styles.saleBadgeText}>SALE</Text>
                    </View>
                  )}
                </View>
                <View style={styles.colPrice}>
                  {hasDeal && price.deal ? (
                    <>
                      <View style={styles.priceRow}>
                        <Text style={styles.regularPrice}>
                          ${price.deal.regular_price.toFixed(2)}
                        </Text>
                        <Text style={[styles.tableCell, styles.priceText, styles.salePrice]}>
                          ${price.price.toFixed(2)}
                        </Text>
                      </View>
                      <Text style={styles.dealSavingsText}>
                        Save ${dealSavings}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.tableCell, styles.priceText, isCheapest && styles.cheapestPrice]}>
                      ${price.price.toFixed(2)}
                    </Text>
                  )}
                  {perUnitPrice && (
                    <Text style={styles.perUnitText}>{perUnitPrice}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Add to Basket - Inline */}
        <View style={styles.addToBasketContainer}>
          <AddToBasketInline
            categoryId={category.category_id}
            name={category.name}
            prices={pricesMap}
            unit={category.unit}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Inline AddToBasket component with light theme
interface AddToBasketProps {
  categoryId: string;
  name: string;
  prices: Record<string, number>;
  unit: string;
}

function AddToBasketInline({ categoryId, name, prices, unit }: AddToBasketProps) {
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
    <View style={styles.basketContainer}>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
        >
          <Ionicons name="remove" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => setQuantity(Math.min(99, quantity + 1))}
        >
          <Ionicons name="add" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.addButton, added && styles.addButtonSuccess]}
        onPress={handleAdd}
      >
        <Ionicons
          name={added ? 'checkmark' : existingItem ? 'refresh' : 'cart'}
          size={20}
          color="#FFFFFF"
          style={styles.addButtonIcon}
        />
        <Text style={styles.addButtonText}>
          {added ? 'Added!' : existingItem ? 'Update Basket' : 'Add to Basket'}
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
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  errorText: {
    color: '#ef4444',
    fontSize: fontSizes.lg,
  },
  content: {
    padding: spacing.md,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#E8F5EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: '#1A1A1A',
  },
  unit: {
    fontSize: fontSizes.md,
    color: '#6B7280',
    marginTop: spacing.xs,
  },
  savingsBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#2D8F4E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  savingsMain: {
    color: '#2D8F4E',
    fontWeight: '600',
    fontSize: fontSizes.md,
    marginBottom: spacing.xs,
  },
  savingsSub: {
    color: '#6B7280',
    fontSize: fontSizes.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: spacing.md,
  },
  table: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tableHeaderCell: {
    fontWeight: '600',
    color: '#6B7280',
    fontSize: fontSizes.sm,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  cheapestRow: {
    backgroundColor: '#E8F5EC',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  tableCell: {
    fontSize: fontSizes.md,
    color: '#1A1A1A',
  },
  colRank: {
    width: 50,
    color: '#1A1A1A',
  },
  colStore: {
    fontWeight: '600',
    color: '#1A1A1A',
  },
  colStoreContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saleBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saleBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  bestPriceBadge: {
    backgroundColor: '#2D8F4E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestPriceBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  colPriceHeader: {
    width: 100,
    textAlign: 'right',
  },
  colPrice: {
    width: 100,
    alignItems: 'flex-end',
  },
  priceText: {
    fontWeight: '700',
    fontSize: fontSizes.lg,
    textAlign: 'right',
    color: '#1A1A1A',
  },
  cheapestPrice: {
    color: '#2D8F4E',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  regularPrice: {
    fontSize: fontSizes.sm,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  salePrice: {
    color: '#FF6B35',
  },
  dealSavingsText: {
    fontSize: fontSizes.xs,
    color: '#FF6B35',
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 2,
  },
  perUnitText: {
    fontSize: fontSizes.sm,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 2,
  },
  addToBasketContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  // Inline AddToBasket styles
  basketContainer: {
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
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: '#1A1A1A',
    minWidth: 40,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#2D8F4E',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonSuccess: {
    backgroundColor: '#22c55e',
  },
  addButtonIcon: {
    marginRight: spacing.xs,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: fontSizes.lg,
  },
  existingText: {
    color: '#6B7280',
    fontSize: fontSizes.sm,
  },
});
