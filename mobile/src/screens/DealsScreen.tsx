import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Category } from '../lib/types';
import { getCategories } from '../lib/api';
import { getIconConfig } from '../lib/icons';
import { spacing, fontSizes } from '../lib/theme';
import { DealsStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<DealsStackParamList, 'DealsMain'>;

export default function DealsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      // Sort by savings_percent descending (biggest deals first)
      const sorted = [...data].sort((a, b) => b.savings_percent - a.savings_percent);
      setCategories(sorted);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchCategories().finally(() => setLoading(false));
  }, [fetchCategories]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  }, [fetchCategories]);

  const renderDealCard = ({ item }: { item: Category }) => {
    const iconConfig = getIconConfig(item.icon);
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={iconConfig.name} size={32} color="#2D8F4E" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.priceRange}>
              ${item.cheapest_price.toFixed(2)} - ${item.most_expensive_price.toFixed(2)}
            </Text>
            <Text style={styles.unitText}>{item.unit}</Text>
          </View>
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>Save {Math.round(item.savings_percent)}%</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.compareButton}
          onPress={() => navigation.navigate('Category', { id: item.category_id })}
          activeOpacity={0.8}
        >
          <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.compareButtonText}>Compare Prices</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Best Deals</Text>
      <Text style={styles.subtitle}>Items with the biggest savings</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>No deals available</Text>
      <Text style={styles.emptyHint}>
        Check back later for the latest savings
      </Text>
    </View>
  );

  if (loading && categories.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#2D8F4E" />
        <Text style={styles.loadingText}>Loading deals...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={categories}
        renderItem={renderDealCard}
        keyExtractor={(item) => item.category_id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2D8F4E"
          />
        }
      />
    </SafeAreaView>
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
  loadingText: {
    marginTop: spacing.md,
    color: '#6B7280',
    fontSize: fontSizes.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    color: '#6B7280',
  },
  list: {
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E8F5EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  productName: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: spacing.xs,
  },
  priceRange: {
    fontSize: fontSizes.md,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  unitText: {
    fontSize: fontSizes.sm,
    color: '#9CA3AF',
    marginTop: 2,
  },
  savingsBadge: {
    backgroundColor: '#E8F5EC',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: '#2D8F4E',
  },
  compareButton: {
    backgroundColor: '#2D8F4E',
    paddingVertical: spacing.sm + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  compareButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: fontSizes.lg,
    fontWeight: '500',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyHint: {
    color: '#9CA3AF',
    fontSize: fontSizes.md,
    textAlign: 'center',
  },
});
