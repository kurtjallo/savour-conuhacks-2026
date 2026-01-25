import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useBasket } from '../context/BasketContext';
import { getMetadata } from '../lib/api';
import SearchBar from './SearchBar';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const hideSearchBar = location.pathname === '/onboarding';
  const { totalCount } = useBasket();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
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

  // Fetch last updated timestamp
  useEffect(() => {
    getMetadata().then(meta => {
      if (meta.last_updated) {
        setLastUpdated(meta.last_updated);
      }
    });
  }, []);

  const handleSearchSubmit = (query: string) => {
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const formatLastUpdated = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => navigate('/')}
            className="hover:opacity-70 transition-opacity duration-200"
          >
            <img
              src="/savourlogo.png"
              alt="Savour"
              className="h-8 w-auto"
            />
          </button>
          {lastUpdated && (
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted bg-white/60 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Prices updated {formatLastUpdated(lastUpdated)}
            </span>
          )}
        </div>

        {!hideSearchBar && (
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
              placeholder="Search groceries..."
              compact
            />
          </div>
        )}

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
