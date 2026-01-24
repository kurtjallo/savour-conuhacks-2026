import { useNavigate } from 'react-router-dom';
import { useBasket } from '../context/BasketContext';

export default function Header() {
  const navigate = useNavigate();
  const { totalCount } = useBasket();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">💰</span>
          <h1 className="text-xl font-bold text-green-600">
            InflationFighter
          </h1>
        </button>

        <button
          onClick={() => navigate('/basket')}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={`View basket with ${totalCount} items`}
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-500 rounded-full">
              {totalCount > 99 ? '99+' : totalCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
