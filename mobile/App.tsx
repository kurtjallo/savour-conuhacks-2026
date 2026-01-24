import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BasketProvider } from './src/context/BasketContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import HomeScreen from './src/screens/HomeScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import BasketScreen from './src/screens/BasketScreen';
import DealsScreen from './src/screens/DealsScreen';
import {
  RootTabParamList,
  HomeStackParamList,
  DealsStackParamList,
  BasketStackParamList,
} from './src/navigation/types';
import { colors } from './src/lib/theme';
import { View, Text, StyleSheet } from 'react-native';
import { useBasket } from './src/context/BasketContext';

const LightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#2D8F4E',
    background: '#F7F7F7',
    card: '#FFFFFF',
    text: '#1A1A1A',
    border: '#E5E5E5',
    notification: '#FF6B35',
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '900' },
  },
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const DealsStack = createNativeStackNavigator<DealsStackParamList>();
const BasketStack = createNativeStackNavigator<BasketStackParamList>();

const stackScreenOptions = {
  headerStyle: {
    backgroundColor: '#FFFFFF',
  },
  headerTintColor: '#1A1A1A',
  headerTitleStyle: {
    color: '#2D8F4E',
    fontWeight: '700' as const,
  },
  headerShadowVisible: false,
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{
          title: 'InflationFighter',
        }}
      />
      <HomeStack.Screen
        name="Category"
        component={CategoryScreen}
        options={{
          title: 'Price Comparison',
        }}
      />
    </HomeStack.Navigator>
  );
}

function DealsStackNavigator() {
  return (
    <DealsStack.Navigator screenOptions={stackScreenOptions}>
      <DealsStack.Screen
        name="DealsMain"
        component={DealsScreen}
        options={{
          title: 'Best Deals',
        }}
      />
      <DealsStack.Screen
        name="Category"
        component={CategoryScreen}
        options={{
          title: 'Price Comparison',
        }}
      />
    </DealsStack.Navigator>
  );
}

function BasketStackNavigator() {
  return (
    <BasketStack.Navigator screenOptions={stackScreenOptions}>
      <BasketStack.Screen
        name="BasketMain"
        component={BasketScreen}
        options={{
          title: 'Your Basket',
        }}
      />
    </BasketStack.Navigator>
  );
}

function TabBarIcon({ name, color, size }: { name: keyof typeof Ionicons.glyphMap; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function BasketTabIcon({ focused, color, size }: { focused: boolean; color: string; size: number }) {
  const { getItemCount } = useBasket();
  const count = getItemCount();

  return (
    <View>
      <Ionicons name={focused ? "cart" : "cart-outline"} size={size} color={color} />
      {count > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </View>
  );
}

function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5E5',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: '#2D8F4E',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon name={focused ? "home" : "home-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="DealsTab"
        component={DealsStackNavigator}
        options={{
          tabBarLabel: 'Deals',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon name={focused ? "pricetag" : "pricetag-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="BasketTab"
        component={BasketStackNavigator}
        options={{
          tabBarLabel: 'Basket',
          tabBarIcon: ({ color, size, focused }) => (
            <BasketTabIcon focused={focused} color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <BasketProvider>
      <FavoritesProvider>
        <NavigationContainer theme={LightTheme}>
          <StatusBar style="dark" />
          <AppNavigator />
        </NavigationContainer>
      </FavoritesProvider>
    </BasketProvider>
  );
}

const styles = StyleSheet.create({
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#ef4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});
