export const ICONS: Record<string, string> = {
  egg: '🥚',
  milk: '🥛',
  'bread-slice': '🍞',
  cube: '🧈',
  'apple-whole': '🍎',
  banana: '🍌',
  potato: '🥔',
  onion: '🧅',
  'drumstick-bite': '🍗',
  burger: '🍔',
  utensils: '🍝',
  'bowl-rice': '🍚',
  cheese: '🧀',
  jar: '🥫',
  'bowl-food': '🥣',
};

export function getIcon(iconKey: string): string {
  return ICONS[iconKey] || '🛒';
}
