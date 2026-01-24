import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Share,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBasket } from '../context/BasketContext';
import { analyzeBasket } from '../lib/api';
import { BasketAnalysis, MultiStoreItem } from '../lib/types';
import { colors, spacing, fontSizes } from '../lib/theme';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Basket'>;

export default function BasketScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { items, updateQuantity, removeItem, clearBasket, getItemCount } = useBasket();
  const [analysis, setAnalysis] = useState<BasketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set());

  // Group items by store for shopping lists
  interface StoreGroup {
    store_id: string;
    store_name: string;
    color: string;
    items: MultiStoreItem[];
    subtotal: number;
  }

  const getStoreGroups = (): StoreGroup[] => {
    if (!analysis) return [];

    const groups: Record<string, StoreGroup> = {};

    analysis.multi_store_optimal.forEach(item => {
      if (!groups[item.store_id]) {
        groups[item.store_id] = {
          store_id: item.store_id,
          store_name: item.store_name,
          color: item.color,
          items: [],
          subtotal: 0,
        };
      }
      groups[item.store_id].items.push(item);
      groups[item.store_id].subtotal += item.price * item.quantity;
    });

    return Object.values(groups).sort((a, b) => b.subtotal - a.subtotal);
  };

  const toggleStoreExpanded = (storeId: string) => {
    setExpandedStores(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storeId)) {
        newSet.delete(storeId);
      } else {
        newSet.add(storeId);
      }
      return newSet;
    });
  };

  // Expand all stores by default when analysis loads
  useEffect(() => {
    if (analysis) {
      const storeIds = new Set(analysis.multi_store_optimal.map(item => item.store_id));
      setExpandedStores(storeIds);
    }
  }, [analysis]);

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

  const generateShareText = (): string => {
    if (!analysis) return '';

    // Build items list
    const itemsList = items.map(item => `${item.name} (${item.quantity})`).join(', ');

    // Build multi-store breakdown grouped by store
    const storeGroups: Record<string, string[]> = {};
    analysis.multi_store_optimal.forEach(item => {
      if (!storeGroups[item.store_name]) {
        storeGroups[item.store_name] = [];
      }
      storeGroups[item.store_name].push(`${item.name} (${item.quantity})`);
    });

    const multiStoreBreakdown = Object.entries(storeGroups)
      .map(([store, products]) => `- ${store}: ${products.join(', ')}`)
      .join('\n');

    return `🛒 My Grocery List (InflationFighter)

Items: ${itemsList}

💰 Best Single Store: ${analysis.single_store_best.store_name} - $${analysis.single_store_best.total.toFixed(2)}

🏆 Multi-Store Optimal: $${analysis.multi_store_total.toFixed(2)}
${multiStoreBreakdown}

Savings: ${analysis.savings_percent}% ($${analysis.savings_vs_worst.toFixed(2)}/week, $${analysis.annual_projection.toFixed(0)}/year)`;
  };

  const handleShare = async () => {
    if (!analysis) {
      Alert.alert('No Analysis', 'Wait for the basket analysis to complete before sharing.');
      return;
    }

    try {
      const message = generateShareText();
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Share Error', 'Could not share your basket summary.');
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />
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
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Basket ({getItemCount()} items)</Text>
          <View style={styles.headerButtons}>
            {analysis && (
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={clearBasket}>
              <Text style={styles.clearButton}>Clear All</Text>
            </TouchableOpacity>
          </View>
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
              <Text style={styles.savingsLabel}>Save vs Most Expensive Store</Text>
              <Text style={styles.savingsPercent}>{analysis.savings_percent}%</Text>
              <Text style={styles.savingsWeekly}>
                That's ${analysis.savings_vs_worst.toFixed(2)} this week
              </Text>
              <Text style={styles.savingsAnnual}>
                ${analysis.annual_projection.toFixed(0)}/year
              </Text>
            </View>

            {/* Best Single Store */}
            <View style={[styles.card, styles.bestStoreCard]}>
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

            {/* Comparison Summary Line */}
            <View style={styles.comparisonSummary}>
              <Text style={styles.comparisonText}>
                Shopping at {getStoreGroups().length} store{getStoreGroups().length !== 1 ? 's' : ''} saves ${analysis.savings_vs_worst.toFixed(2)} vs single store
              </Text>
            </View>

            {/* Shopping Lists Section */}
            <View style={styles.shoppingListsHeader}>
              <Text style={styles.shoppingListsTitle}>Shopping Lists</Text>
              <Text style={styles.shoppingListsSubtitle}>
                {getStoreGroups().length} store{getStoreGroups().length !== 1 ? 's' : ''} to visit
              </Text>
            </View>

            {getStoreGroups().map(group => {
              const isExpanded = expandedStores.has(group.store_id);
              return (
                <View key={group.store_id} style={styles.storeCard}>
                  <TouchableOpacity
                    style={styles.storeCardHeader}
                    onPress={() => toggleStoreExpanded(group.store_id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.storeCardHeaderLeft}>
                      <View style={[styles.storeColorIndicator, { backgroundColor: group.color }]} />
                      <View>
                        <Text style={[styles.storeCardName, { color: group.color }]}>
                          {group.store_name}
                        </Text>
                        <Text style={styles.storeCardItemCount}>
                          {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.storeCardHeaderRight}>
                      <Text style={styles.storeCardSubtotal}>
                        ${group.subtotal.toFixed(2)}
                      </Text>
                      <Text style={styles.expandIcon}>{isExpanded ? '-' : '+'}</Text>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.storeCardItems}>
                      {group.items.map(item => (
                        <View key={item.category_id} style={styles.checklistItem}>
                          <View style={styles.checklistCheckbox}>
                            <View style={styles.checklistCheckboxInner} />
                          </View>
                          <View style={styles.checklistItemInfo}>
                            <Text style={styles.checklistItemName}>{item.name}</Text>
                            <Text style={styles.checklistItemQty}>Qty: {item.quantity}</Text>
                          </View>
                          <Text style={styles.checklistItemPrice}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </Text>
                        </View>
                      ))}
                      <View style={styles.storeCardSubtotalRow}>
                        <Text style={styles.storeCardSubtotalLabel}>Store Subtotal</Text>
                        <Text style={[styles.storeCardSubtotalValue, { color: group.color }]}>
                          ${group.subtotal.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Most Expensive Store */}
            <View style={[styles.card, styles.worstCard]}>
              <Text style={styles.cardLabel}>Most Expensive Store</Text>
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

      {/* Floating Summary Bar */}
      {analysis && (
        <View style={styles.floatingBar}>
          <View style={styles.floatingBarLeft}>
            <Text style={styles.floatingBarLabel}>Save vs Most Expensive</Text>
            <Text style={styles.floatingBarSavings}>
              ${analysis.savings_vs_worst.toFixed(2)} ({analysis.savings_percent}%)
            </Text>
          </View>
          <View style={styles.floatingBarRight}>
            <Text style={styles.floatingBarTotal}>Optimal Total</Text>
            <Text style={styles.floatingBarAmount}>
              ${analysis.multi_store_total.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100, // Space for floating bar
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#F7F7F7',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSizes.md,
    color: '#6B7280',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: '#2D8F4E',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 30,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: fontSizes.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: '#1A1A1A',
  },
  shareButton: {
    backgroundColor: '#2D8F4E',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: fontSizes.sm,
  },
  clearButton: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: fontSizes.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  itemUnit: {
    fontSize: fontSizes.sm,
    color: '#6B7280',
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
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  quantityText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    marginHorizontal: spacing.sm,
    minWidth: 24,
    textAlign: 'center',
    color: '#1A1A1A',
  },
  removeButton: {
    color: '#DC2626',
    fontSize: fontSizes.lg,
    fontWeight: '600',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: '#6B7280',
  },
  savingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#2D8F4E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  savingsLabel: {
    color: '#1A1A1A',
    fontSize: fontSizes.lg,
    marginBottom: spacing.xs,
  },
  savingsPercent: {
    color: '#2D8F4E',
    fontSize: fontSizes['5xl'],
    fontWeight: '700',
  },
  savingsWeekly: {
    color: '#1A1A1A',
    fontSize: fontSizes.md,
    marginTop: spacing.xs,
  },
  savingsAnnual: {
    color: '#2D8F4E',
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    marginTop: spacing.md,
  },
  cardLabel: {
    color: '#6B7280',
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
    color: '#1A1A1A',
  },
  storeHint: {
    color: '#6B7280',
    fontSize: fontSizes.sm,
  },
  bestStoreCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2D8F4E',
  },
  optimalCard: {
    borderWidth: 2,
    borderColor: '#2D8F4E',
  },
  optimalLabel: {
    color: '#2D8F4E',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  optimalTotal: {
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: '#2D8F4E',
  },
  optimalHint: {
    color: '#6B7280',
    fontSize: fontSizes.sm,
    marginBottom: spacing.md,
  },
  optimalList: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: spacing.md,
  },
  optimalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  optimalItemName: {
    fontSize: fontSizes.sm,
    color: '#1A1A1A',
  },
  optimalItemStore: {
    fontSize: fontSizes.sm,
    color: '#6B7280',
  },
  worstCard: {
    opacity: 0.7,
    backgroundColor: '#FEF2F2',
  },
  worstHint: {
    color: '#DC2626',
    fontSize: fontSizes.sm,
  },
  // Comparison Summary
  comparisonSummary: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 4,
    borderLeftColor: '#2D8F4E',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  comparisonText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: '#065F46',
  },
  // Shopping Lists styles
  shoppingListsHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  shoppingListsTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: '#1A1A1A',
  },
  shoppingListsSubtitle: {
    fontSize: fontSizes.md,
    color: '#6B7280',
    marginTop: spacing.xs,
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  storeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  storeCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeColorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  storeCardName: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
  },
  storeCardItemCount: {
    fontSize: fontSizes.sm,
    color: '#6B7280',
    marginTop: 2,
  },
  storeCardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeCardSubtotal: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: '#2D8F4E',
    marginRight: spacing.sm,
  },
  expandIcon: {
    fontSize: fontSizes['2xl'],
    fontWeight: '600',
    color: '#6B7280',
    width: 24,
    textAlign: 'center',
  },
  storeCardItems: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  checklistCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistCheckboxInner: {
    width: 0,
    height: 0,
  },
  checklistItemInfo: {
    flex: 1,
  },
  checklistItemName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  checklistItemQty: {
    fontSize: fontSizes.sm,
    color: '#6B7280',
    marginTop: 2,
  },
  checklistItemPrice: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: '#2D8F4E',
  },
  storeCardSubtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  storeCardSubtotalLabel: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: '#6B7280',
  },
  storeCardSubtotalValue: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
  },
  // Floating summary bar
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingBarLeft: {
    flex: 1,
  },
  floatingBarLabel: {
    fontSize: fontSizes.sm,
    color: '#6B7280',
  },
  floatingBarSavings: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: '#2D8F4E',
  },
  floatingBarRight: {
    alignItems: 'flex-end',
  },
  floatingBarTotal: {
    fontSize: fontSizes.sm,
    color: '#6B7280',
  },
  floatingBarAmount: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});
