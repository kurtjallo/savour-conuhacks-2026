import { useRef, useEffect, useState } from 'react';
import { getCategoryColor } from '../lib/icons';

interface CategoryItem {
  id: string;
  name: string;
  color?: string;
}

interface CategoryNavProps {
  categories: CategoryItem[];
  activeCategory: string | null;
  onCategoryClick: (categoryId: string) => void;
  showAllOption?: boolean;
  onAllClick?: () => void;
}

export default function CategoryNav({
  categories,
  activeCategory,
  onCategoryClick,
  showAllOption = false,
  onAllClick,
}: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);

  // Update gradient visibility based on scroll position
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftGradient(scrollLeft > 10);
    setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Check gradients on mount and resize
  useEffect(() => {
    handleScroll();
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
    }
    return () => {
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', handleScroll);
    };
  }, [categories]);

  // Scroll active category into view
  useEffect(() => {
    if (activeCategory && scrollRef.current) {
      const activeEl = scrollRef.current.querySelector(
        `[data-category-id="${activeCategory}"]`
      ) as HTMLElement;
      if (activeEl) {
        const container = scrollRef.current;
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();

        // Check if element is outside visible area
        if (activeRect.left < containerRect.left + 40 || activeRect.right > containerRect.right - 40) {
          activeEl.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          });
        }
      }
    }
  }, [activeCategory]);

  return (
    <nav className="sticky top-[64px] z-40 bg-cream/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto relative">
        {/* Left gradient fade */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-cream/95 to-transparent z-10 pointer-events-none transition-opacity duration-200 ${
            showLeftGradient ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Right gradient fade */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-cream/95 to-transparent z-10 pointer-events-none transition-opacity duration-200 ${
            showRightGradient ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Scrollable category pills */}
        <div
          ref={scrollRef}
          className="flex gap-2 px-6 py-3 overflow-x-auto scrollbar-hide"
        >
          {showAllOption && (
            <button
              data-category-id="all"
              onClick={onAllClick}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all duration-200 flex-shrink-0
                ${
                  !activeCategory
                    ? 'bg-charcoal text-white shadow-sm'
                    : 'bg-white text-charcoal border border-border hover:border-charcoal/30 hover:bg-gray-50'
                }`}
            >
              <span className="font-ui">All</span>
            </button>
          )}
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            const dotColor = category.color || getCategoryColor(category.id);
            return (
              <button
                key={category.id}
                data-category-id={category.id}
                onClick={() => onCategoryClick(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all duration-200 flex-shrink-0
                  ${
                    isActive
                      ? 'bg-charcoal text-white shadow-sm'
                      : 'bg-white text-charcoal border border-border hover:border-charcoal/30 hover:bg-gray-50'
                  }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isActive ? 'currentColor' : dotColor }}
                />
                <span className="font-ui">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
