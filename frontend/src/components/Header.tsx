import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBasket } from '../context/BasketContext';
import SearchBar from './SearchBar';

export default function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { totalCount } = useBasket();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef(totalCount);

  useEffect(() => {
    if (totalCount > prevCountRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = totalCount;
  }, [totalCount]);

  const handleSearchSubmit = (query: string) => {
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/')}
          className="hover:opacity-70 transition-opacity duration-200 flex-shrink-0"
        >
          <img
            src="/savourlogo.png"
            alt="Savour"
            className="h-8 w-auto"
          />
        </button>

        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
            placeholder="Search groceries..."
            compact
          />
        </div>

        <button
          onClick={() => navigate('/basket')}
          className="relative p-2.5 -mr-2.5 rounded-lg hover:bg-white/50 transition-colors duration-200"
          aria-label={`View basket with ${totalCount} items`}
        >
          <svg
            className="w-5 h-5 text-charcoal"
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
          {totalCount > 0 && (
            <span className={`absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-white bg-accent rounded-full ${isAnimating ? 'cart-badge-updated' : ''}`}>
              {totalCount > 99 ? '99+' : totalCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
