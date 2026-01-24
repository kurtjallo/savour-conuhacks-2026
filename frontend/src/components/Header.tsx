import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useBasket } from '../context/BasketContext';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalCount } = useBasket();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/')}
            className="hover:opacity-70 transition-opacity duration-200"
          >
            <h1 className="text-xl font-semibold tracking-wide text-charcoal">
              Savour
            </h1>
          </button>
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isActive('/')
                  ? 'font-medium text-charcoal bg-white shadow-sm'
                  : 'text-charcoal-light hover:text-charcoal'
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isActive('/products')
                  ? 'font-medium text-charcoal bg-white shadow-sm'
                  : 'text-charcoal-light hover:text-charcoal'
              }`}
            >
              All Products
            </Link>
          </nav>
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
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-white bg-accent rounded-full">
              {totalCount > 99 ? '99+' : totalCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
