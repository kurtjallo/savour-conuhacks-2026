import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBasket } from '../context/BasketContext';
import { getCategories } from '../lib/api';
import type { Category } from '../lib/types';

export default function FloatingBasketButton() {
  const { items, totalCount } = useBasket();
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const prevCountRef = useRef(0);

  // Hide on /basket page
  const isBasketPage = location.pathname === '/basket';

  // Fetch categories for price calculation
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Animate in when first item is added
  useEffect(() => {
    if (totalCount > 0 && prevCountRef.current === 0) {
      // Small delay for animation
      setTimeout(() => setIsVisible(true), 50);
    } else if (totalCount === 0) {
      setIsVisible(false);
    } else if (totalCount > 0) {
      setIsVisible(true);
    }
    prevCountRef.current = totalCount;
  }, [totalCount]);

  // Calculate total price based on cheapest prices
  const totalPrice = items.reduce((sum, item) => {
    const category = categories.find((c) => c.category_id === item.category_id);
    const price = category?.cheapest_price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  // Don't render on basket page or when cart is empty
  if (isBasketPage || totalCount === 0) {
    return null;
  }

  return (
    <Link
      to="/basket"
      className={`
        fixed bottom-6 left-4 right-4 z-50
        md:hidden
        flex items-center justify-between
        bg-charcoal text-white
        rounded-2xl px-5 py-4
        shadow-lg
        transition-all duration-300 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}
      aria-label={`View basket with ${totalCount} items, total $${totalPrice.toFixed(2)}`}
    >
      {/* Left side: Icon with badge + text */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
          {/* Badge */}
          <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[11px] font-bold text-white bg-accent rounded-full">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        </div>
        <span className="font-semibold text-base">View Basket</span>
      </div>

      {/* Right side: Total price */}
      <span className="font-bold text-lg">
        ${totalPrice.toFixed(2)}
      </span>
    </Link>
  );
}
