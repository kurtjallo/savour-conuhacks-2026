import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBasket } from '../context/BasketContext';
import { analyzeBasket } from '../lib/api';
import { BasketAnalysis } from '../lib/types';
import { colors, spacing, fontSizes } from '../lib/theme';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Basket'>;

export default function BasketScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { items, updateQuantity, removeItem, clearBasket, getItemCount } = useBasket();
  const [analysis, setAnalysis] = useState<BasketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length > 0) {
      setLoading(true);
      analyzeBasket(items.map(i => ({ category_id: i.category_id, quantity: i.quantity })))
        .then(setAnalysis)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setAnalysis(null);
    }
  }, [items]);

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your Basket is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Add some items to see how much you can save!
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.browseButtonText}>Browse Categories</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Basket ({getItemCount()} items)</Text>
          <TouchableOpacity onPress={clearBasket}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Items List */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items</Text>
          {items.map(item => (
            <View key={item.category_id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemUnit}>{item.unit}</Text>
              </View>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.category_id, item.quantity - 1)}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.category_id, item.quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => removeItem(item.category_id)}>
                <Text style={styles.removeButton}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Analysis */}
        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Calculating savings...</Text>
          </View>
        ) : analysis ? (
          <>
            {/* Savings Callout */}
            <View style={styles.savingsCard}>
              <Text style={styles.savingsLabel}>You Could Save</Text>
              <Text style={styles.savingsPercent}>{analysis.savings_percent}%</Text>
              <Text style={styles.savingsWeekly}>
                That's ${analysis.savings_vs_worst.toFixed(2)} this week
              </Text>
              <Text style={styles.savingsAnnual}>
                ${analysis.annual_projection.toFixed(0)}/year
              </Text>
            </View>

            {/* Best Single Store */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Best Single Store</Text>
              <Text style={[styles.storeName, { color: analysis.single_store_best.color }]}>
                {analysis.single_store_best.store_name}
              </Text>
              <Text style={styles.storeTotal}>
                ${analysis.single_store_best.total.toFixed(2)}
              </Text>
              <Text style={styles.storeHint}>One-stop shopping</Text>
            </View>

            {/* Multi-Store Optimal */}
            <View style={[styles.card, styles.optimalCard]}>
              <Text style={styles.optimalLabel}>Multi-Store Optimal</Text>
              <Text style={styles.optimalTotal}>
                ${analysis.multi_store_total.toFixed(2)}
              </Text>
              <Text style={styles.optimalHint}>Maximum savings</Text>
              <View style={styles.optimalList}>
                {analysis.multi_store_optimal.map(item => (
                  <View key={item.category_id} style={styles.optimalItem}>
                    <Text style={styles.optimalItemName}>
                      {item.name} × {item.quantity}
                    </Text>
                    <Text style={styles.optimalItemStore}>{item.store_name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Worst Case */}
            <View style={[styles.card, styles.worstCard]}>
              <Text style={styles.cardLabel}>Worst Case</Text>
              <Text style={[styles.storeName, { color: analysis.single_store_worst.color }]}>
                {analysis.single_store_worst.store_name}
              </Text>
              <Text style={styles.storeTotal}>
                ${analysis.single_store_worst.total.toFixed(2)}
              </Text>
              <Text style={styles.worstHint}>Don't shop here!</Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 30,
  },
  browseButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: fontSizes.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  clearButton: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: fontSizes.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  itemUnit: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  quantityText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    marginHorizontal: spacing.sm,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    color: colors.danger,
    fontSize: fontSizes.lg,
    fontWeight: '600',
  },
  loadingCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  savingsCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  savingsLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: fontSizes.lg,
    marginBottom: spacing.xs,
  },
  savingsPercent: {
    color: colors.white,
    fontSize: fontSizes['5xl'],
    fontWeight: '700',
  },
  savingsWeekly: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: fontSizes.md,
    marginTop: spacing.xs,
  },
  savingsAnnual: {
    color: colors.white,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    marginTop: spacing.md,
  },
  cardLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  storeName: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
  },
  storeTotal: {
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.text,
  },
  storeHint: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
  },
  optimalCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  optimalLabel: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  optimalTotal: {
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.primary,
  },
  optimalHint: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    marginBottom: spacing.md,
  },
  optimalList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  optimalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  optimalItemName: {
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  optimalItemStore: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  worstCard: {
    opacity: 0.6,
  },
  worstHint: {
    color: colors.danger,
    fontSize: fontSizes.sm,
  },
});
