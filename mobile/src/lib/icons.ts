import { Ionicons } from '@expo/vector-icons';

export type IconConfig = {
  name: keyof typeof Ionicons.glyphMap;
  color?: string;
};

// Map category icon strings to Ionicons - all 25 products
export function getIconConfig(icon: string): IconConfig {
  const iconMap: Record<string, IconConfig> = {
    // Original 15
    'egg': { name: 'egg-outline' },
    'eggs': { name: 'egg-outline' },
    'milk': { name: 'water-outline' },
    'bread': { name: 'fast-food-outline' },
    'bread-slice': { name: 'fast-food-outline' },
    'cube': { name: 'cube-outline' },
    'butter': { name: 'cube-outline' },
    'apple-whole': { name: 'nutrition-outline' },
    'apples': { name: 'nutrition-outline' },
    'banana': { name: 'nutrition-outline' },
    'bananas': { name: 'nutrition-outline' },
    'potato': { name: 'ellipse-outline' },
    'potatoes': { name: 'ellipse-outline' },
    'onion': { name: 'ellipse-outline' },
    'onions': { name: 'ellipse-outline' },
    'drumstick-bite': { name: 'restaurant-outline' },
    'chicken': { name: 'restaurant-outline' },
    'burger': { name: 'restaurant-outline' },
    'ground-beef': { name: 'restaurant-outline' },
    'utensils': { name: 'restaurant-outline' },
    'pasta': { name: 'restaurant-outline' },
    'bowl-rice': { name: 'cafe-outline' },
    'rice': { name: 'cafe-outline' },
    'cheese': { name: 'triangle-outline' },
    'triangle-outline': { name: 'triangle-outline' },
    'jar': { name: 'beaker-outline' },
    'canned-tomatoes': { name: 'beaker-outline' },
    'bowl-food': { name: 'cafe-outline' },
    'cereal': { name: 'cafe-outline' },
    // New 10 products
    'yogurt': { name: 'beaker-outline' },
    'orange-juice': { name: 'water-outline' },
    'coffee': { name: 'cafe-outline' },
    'sugar': { name: 'cube-outline' },
    'flour': { name: 'cube-outline' },
    'cooking-oil': { name: 'flask-outline' },
    'frozen-pizza': { name: 'pizza-outline' },
    'ice-cream': { name: 'ice-cream-outline' },
    'bacon': { name: 'restaurant-outline' },
    'lettuce': { name: 'leaf-outline' },
  };

  return iconMap[icon] || { name: 'basket-outline' };
}

// Deprecated - use getIconConfig instead
export function getIcon(icon: string): string {
  return '';
}
