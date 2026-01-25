// Category color scheme for professional dot indicators
// Colors are chosen for clear visual distinction and category relevance
export const categoryColors: Record<string, string> = {
  produce: '#22c55e',    // Green - fruits & vegetables
  dairy: '#3b82f6',      // Blue - dairy & eggs
  meat: '#ef4444',       // Red - meat & seafood
  bakery: '#f59e0b',     // Amber - bread & bakery
  pantry: '#f97316',     // Orange - pantry staples
  frozen: '#06b6d4',     // Cyan - frozen foods
  beverages: '#8b5cf6',  // Purple - drinks
  snacks: '#ec4899',     // Pink - snacks
  default: '#6b7280',    // Gray - fallback
};

// Get category color by category ID or product name keywords
export function getCategoryColor(categoryId: string): string {
  // Direct match
  if (categoryColors[categoryId]) {
    return categoryColors[categoryId];
  }
  return categoryColors.default;
}

// Infer category color from product name
export function getCategoryColorFromName(productName: string): string {
  const name = productName.toLowerCase();

  // Produce keywords
  if (['apple', 'banana', 'tomato', 'potato', 'onion', 'carrot', 'lettuce', 'broccoli', 'pepper', 'cucumber', 'fruit', 'vegetable', 'salad', 'spinach', 'celery', 'mushroom', 'avocado', 'lemon', 'orange', 'grape', 'strawberry', 'berry'].some(k => name.includes(k))) {
    return categoryColors.produce;
  }

  // Dairy keywords
  if (['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg', 'dairy'].some(k => name.includes(k))) {
    return categoryColors.dairy;
  }

  // Meat keywords
  if (['chicken', 'beef', 'pork', 'salmon', 'bacon', 'sausage', 'ground', 'meat', 'turkey', 'fish', 'shrimp', 'steak', 'ham'].some(k => name.includes(k))) {
    return categoryColors.meat;
  }

  // Bakery keywords
  if (['bread', 'bagel', 'bun', 'muffin', 'tortilla', 'croissant', 'roll', 'cake', 'cookie', 'pastry'].some(k => name.includes(k))) {
    return categoryColors.bakery;
  }

  // Pantry keywords
  if (['rice', 'pasta', 'flour', 'sugar', 'oil', 'cereal', 'oat', 'coffee', 'tea', 'sauce', 'soup', 'can', 'bean', 'spice'].some(k => name.includes(k))) {
    return categoryColors.pantry;
  }

  // Frozen keywords
  if (['frozen', 'ice cream', 'pizza'].some(k => name.includes(k))) {
    return categoryColors.frozen;
  }

  // Beverages keywords
  if (['juice', 'soda', 'water', 'drink', 'beverage', 'pop'].some(k => name.includes(k))) {
    return categoryColors.beverages;
  }

  // Snacks keywords
  if (['chip', 'snack', 'cracker', 'pretzel', 'popcorn', 'candy', 'chocolate'].some(k => name.includes(k))) {
    return categoryColors.snacks;
  }

  return categoryColors.default;
}

// Legacy function - returns empty string (no emojis)
// Kept for backwards compatibility during transition
export function getIcon(_iconName: string): string {
  return '';
}
