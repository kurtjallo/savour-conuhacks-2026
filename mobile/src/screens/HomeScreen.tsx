import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
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
import CategoryCard from '../components/CategoryCard';
import FavoriteCard from '../components/FavoriteCard';
import SearchBar from '../components/SearchBar';
import { spacing, fontSizes } from '../lib/theme';
import { HomeStackParamList } from '../navigation/types';
import { useFavorites } from '../context/FavoritesContext';
import { getIconConfig } from '../lib/icons';

// Light theme colors
const lightTheme = {
  background: '#F7F7F7',
  cardBackground: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  accent: '#2D8F4E',
  accentLight: 'rgba(45, 143, 78, 0.1)',
  border: '#E5E7EB',
  dealOrange: '#FF6B35',
  dealOrangeLight: '#FFF4F0',
};

// Store colors for the quick stats card
const storeColors = [
  { name: 'No Frills', color: '#FFD500' },
  { name: 'FreshCo', color: '#E31837' },
  { name: 'Walmart', color: '#0071CE' },
  { name: 'Loblaws', color: '#E31837' },
  { name: 'Metro', color: '#0054A6' },
];

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { favorites, isLoaded } = useFavorites();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setAllCategories(data);
      setFilteredCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setAllCategories([]);
      setFilteredCategories([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchCategories().finally(() => setLoading(false));
  }, [fetchCategories]);

  // Debounced search - filter locally for instant feedback
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) {
        setFilteredCategories(allCategories);
      } else {
        // Filter locally for instant feedback
        const filtered = allCategories.filter(cat =>
          cat.name.toLowerCase().includes(query) ||
          cat.category_id.toLowerCase().includes(query)
        );
        setFilteredCategories(filtered);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, allCategories]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  }, [fetchCategories]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setFilteredCategories(allCategories);
  }, [allCategories]);

  // Get favorite categories from loaded categories
  const favoriteCategories = useMemo(() =>
    allCategories.filter(cat => favorites.includes(cat.category_id)),
    [allCategories, favorites]
  );

  // Get top deals sorted by savings_percent
  const topDeals = useMemo(() =>
    [...allCategories]
      .filter(cat => cat.savings_percent > 0)
      .sort((a, b) => b.savings_percent - a.savings_percent)
      .slice(0, 4),
    [allCategories]
  );

  const isSearching = searchQuery.trim().length > 0;

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.cardWrapper}>
      <CategoryCard
        category={item}
        onPress={() => navigation.navigate('Category', { id: item.category_id })}
      />
    </View>
  );

  // Header Section
  const renderHeaderSection = () => (
    <View style={styles.headerSection}>
      <Text style={styles.appTitle}>InflationFighter</Text>
      <Text style={styles.appSubtitle}>Find the best grocery prices</Text>
    </View>
  );

  // Search Bar Section
  const renderSearchSection = () => (
    <View style={styles.searchSection}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={handleClearSearch}
        placeholder="Search products..."
      />
    </View>
  );

  // Quick Stats Card
  const renderQuickStatsCard = () => (
    <View style={styles.quickStatsCard}>
      <View style={styles.quickStatsContent}>
        <Ionicons name="storefront-outline" size={28} color={lightTheme.accent} style={styles.quickStatsIcon} />
        <View style={styles.quickStatsText}>
          <Text style={styles.quickStatsTitle}>Compare prices across 5 Canadian stores</Text>
          <View style={styles.storeDotsContainer}>
            {storeColors.map((store, index) => (
              <View key={index} style={styles.storeDotWrapper}>
                <View style={[styles.storeDot, { backgroundColor: store.color }]} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  // Favorites Section
  const renderFavoritesSection = () => {
    if (!isLoaded || favoriteCategories.length === 0 || isSearching) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Favorites</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {favoriteCategories.map(cat => (
            <FavoriteCard
              key={cat.category_id}
              category={cat}
              onPress={() => navigation.navigate('Category', { id: cat.category_id })}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  // Deal Card Component
  const renderDealCard = (category: Category) => {
    const iconConfig = getIconConfig(category.icon);
    return (
      <TouchableOpacity
        key={category.category_id}
        style={styles.dealCard}
        onPress={() => navigation.navigate('Category', { id: category.category_id })}
        activeOpacity={0.7}
      >
        <View style={styles.dealBadge}>
          <Text style={styles.dealBadgeText}>-{category.savings_percent}%</Text>
        </View>
        <View style={styles.dealIconContainer}>
          <Ionicons name={iconConfig.name} size={32} color={lightTheme.accent} />
        </View>
        <Text style={styles.dealName} numberOfLines={1}>{category.name}</Text>
        <View style={styles.dealPriceRow}>
          <Text style={styles.dealPriceLow}>${category.cheapest_price.toFixed(2)}</Text>
          <Text style={styles.dealPriceHigh}>${category.most_expensive_price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Best Deals Section
  const renderBestDealsSection = () => {
    if (topDeals.length === 0 || isSearching) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Best Deals</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {topDeals.map(renderDealCard)}
        </ScrollView>
      </View>
    );
  };

  // All Products Header
  const renderAllProductsHeader = () => (
    <View style={styles.allProductsHeader}>
      <Text style={styles.sectionTitle}>
        {isSearching ? `Results for "${searchQuery}"` : 'All Products'}
      </Text>
      <Text style={styles.productCount}>({filteredCategories.length})</Text>
    </View>
  );

  // Combined Header for FlatList
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {renderHeaderSection()}
      {renderSearchSection()}
      {!isSearching && renderQuickStatsCard()}
      {renderFavoritesSection()}
      {renderBestDealsSection()}
      {renderAllProductsHeader()}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Ionicons name="search-outline" size={48} color={lightTheme.textSecondary} />
      <Text style={styles.emptyText}>
        {isSearching
          ? 'No products found. Try a different search.'
          : 'No products available.'}
      </Text>
      {!isSearching && (
        <Text style={styles.emptyHint}>
          Make sure the backend is running on port 8000
        </Text>
      )}
    </View>
  );

  if (loading && allCategories.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={lightTheme.accent} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={filteredCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.category_id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={lightTheme.accent}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightTheme.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: lightTheme.textSecondary,
    fontSize: fontSizes.md,
  },
  headerContainer: {
    marginBottom: spacing.sm,
  },
  // Header Section
  headerSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  appTitle: {
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: lightTheme.textPrimary,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: fontSizes.lg,
    color: lightTheme.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  // Search Section
  searchSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  // Quick Stats Card
  quickStatsCard: {
    backgroundColor: lightTheme.cardBackground,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickStatsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickStatsIcon: {
    marginRight: spacing.md,
  },
  quickStatsText: {
    flex: 1,
  },
  quickStatsTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: lightTheme.textPrimary,
    marginBottom: spacing.sm,
  },
  storeDotsContainer: {
    flexDirection: 'row',
  },
  storeDotWrapper: {
    marginRight: spacing.sm,
  },
  storeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  // Section Styles
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: lightTheme.textPrimary,
  },
  seeAllText: {
    fontSize: fontSizes.md,
    color: lightTheme.accent,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingHorizontal: spacing.lg,
  },
  // Deal Card
  dealCard: {
    backgroundColor: lightTheme.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.md,
    width: 130,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  dealBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: lightTheme.dealOrange,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dealBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  dealIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  dealName: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: lightTheme.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  dealPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dealPriceLow: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: lightTheme.accent,
  },
  dealPriceHigh: {
    fontSize: fontSizes.sm,
    color: lightTheme.textSecondary,
    textDecorationLine: 'line-through',
  },
  // All Products Header
  allProductsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  productCount: {
    fontSize: fontSizes.lg,
    color: lightTheme.textSecondary,
    marginLeft: spacing.sm,
  },
  // List
  list: {
    paddingBottom: spacing.xl,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '50%',
  },
  // Empty State
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: lightTheme.textSecondary,
    fontSize: fontSizes.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyHint: {
    color: lightTheme.textSecondary,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    opacity: 0.7,
  },
});
