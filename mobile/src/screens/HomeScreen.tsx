import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Category } from '../lib/types';
import { getCategories, searchCategories } from '../lib/api';
import CategoryCard from '../components/CategoryCard';
import SearchBar from '../components/SearchBar';
import { colors, spacing, fontSizes } from '../lib/theme';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  const fetchCategories = useCallback(async (query: string = '') => {
    try {
      const data = query
        ? await searchCategories(query)
        : await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchCategories(activeQuery).finally(() => setLoading(false));
  }, [activeQuery, fetchCategories]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCategories(activeQuery);
    setRefreshing(false);
  }, [activeQuery, fetchCategories]);

  const handleSearch = () => {
    setActiveQuery(searchQuery.trim());
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.cardWrapper}>
      <CategoryCard
        category={item}
        onPress={() => navigation.navigate('Category', { id: item.category_id })}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Stop Overpaying for Groceries</Text>
        <Text style={styles.heroSubtitle}>
          Compare prices across 5 major Canadian stores. Save up to 30% on your weekly shop.
        </Text>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={handleSearch}
          />
        </View>
      </View>
      <Text style={styles.sectionTitle}>
        {activeQuery ? `Results for "${activeQuery}"` : 'Browse Categories'}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>
        {activeQuery
          ? 'No categories found. Try a different search.'
          : 'Loading categories...'}
      </Text>
      <Text style={styles.emptyHint}>
        Make sure the backend is running on port 8000
      </Text>
    </View>
  );

  if (loading && categories.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={categories}
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
            tintColor={colors.primary}
          />
        }
      />
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
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: fontSizes.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  heroTitle: {
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  heroSubtitle: {
    fontSize: fontSizes.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  searchContainer: {
    marginHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '50%',
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyHint: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
});
