import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BasketProvider } from './src/context/BasketContext';
import HomeScreen from './src/screens/HomeScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import BasketScreen from './src/screens/BasketScreen';
import { RootStackParamList } from './src/navigation/types';
import { colors } from './src/lib/theme';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useBasket } from './src/context/BasketContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

function BasketButton({ onPress }: { onPress: () => void }) {
  const { getItemCount } = useBasket();
  const count = getItemCount();

  return (
    <TouchableOpacity style={styles.basketButton} onPress={onPress}>
      <Text style={styles.basketButtonText}>Basket</Text>
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'InflationFighter',
          headerTitleStyle: {
            fontWeight: '700',
            color: colors.primary,
          },
          headerRight: () => (
            <BasketButton onPress={() => navigation.navigate('Basket')} />
          ),
        })}
      />
      <Stack.Screen
        name="Category"
        component={CategoryScreen}
        options={({ navigation }) => ({
          title: 'Price Comparison',
          headerRight: () => (
            <BasketButton onPress={() => navigation.navigate('Basket')} />
          ),
        })}
      />
      <Stack.Screen
        name="Basket"
        component={BasketScreen}
        options={{
          title: 'Your Basket',
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <BasketProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </BasketProvider>
  );
}

const styles = StyleSheet.create({
  basketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  basketButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
