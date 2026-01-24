const iconMap: Record<string, string> = {
  eggs: '🥚',
  milk: '🥛',
  bread: '🍞',
  butter: '🧈',
  apples: '🍎',
  bananas: '🍌',
  potatoes: '🥔',
  onions: '🧅',
  chicken: '🍗',
  'ground-beef': '🥩',
  pasta: '🍝',
  rice: '🍚',
  cheese: '🧀',
  'canned-tomatoes': '🥫',
  cereal: '🥣',
};

export function getIcon(iconName: string): string {
  return iconMap[iconName] || '🛒';
}
