import { useState, useRef, useEffect } from 'react';

export interface FoodCategory {
  id: string;
  name: string;
  keywords: string[];
}

export const FOOD_CATEGORIES: FoodCategory[] = [
  { id: 'dairy', name: 'Dairy', keywords: ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'egg'] },
  { id: 'produce', name: 'Produce', keywords: ['apple', 'banana', 'potato', 'onion', 'tomato', 'lettuce', 'carrot', 'celery', 'pepper', 'cucumber', 'fruit', 'vegetable'] },
  { id: 'meat', name: 'Meat & Protein', keywords: ['chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'meat', 'bacon', 'sausage'] },
  { id: 'pantry', name: 'Pantry', keywords: ['pasta', 'rice', 'canned', 'cereal', 'flour', 'sugar', 'oil', 'sauce', 'soup', 'bean'] },
  { id: 'bakery', name: 'Bakery', keywords: ['bread', 'bagel', 'muffin', 'croissant', 'bun', 'roll'] },
  { id: 'frozen', name: 'Frozen', keywords: ['frozen', 'ice cream', 'pizza'] },
  { id: 'beverages', name: 'Beverages', keywords: ['juice', 'water', 'soda', 'coffee', 'tea', 'drink'] },
  { id: 'snacks', name: 'Snacks', keywords: ['chips', 'crackers', 'cookies', 'candy', 'chocolate', 'nuts', 'snack'] },
];

interface CategoryFilterProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export default function CategoryFilter({ selectedCategories, onChange }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onChange([...selectedCategories, categoryId]);
    }
  };

  const clearAll = () => {
    onChange([]);
    setIsOpen(false);
  };

  const selectedCount = selectedCategories.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-4 bg-white border rounded-2xl
                   transition-all duration-200 whitespace-nowrap
                   ${selectedCount > 0
                     ? 'border-accent text-accent'
                     : 'border-border text-charcoal hover:border-charcoal/30'
                   }
                   focus:outline-none focus:ring-2 focus:ring-charcoal/10`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
          />
        </svg>
        <span className="text-sm font-medium">
          {selectedCount > 0 ? `Filters (${selectedCount})` : 'Filter'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-64 bg-white border border-border rounded-xl shadow-lg z-[100] animate-fade-in">
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-charcoal">Categories</span>
              {selectedCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-accent hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          <div className="p-2 max-h-64 overflow-y-auto">
            {FOOD_CATEGORIES.map(category => (
              <label
                key={category.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
                />
                <span className="text-sm text-charcoal">{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
