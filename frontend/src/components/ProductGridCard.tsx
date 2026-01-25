import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Category } from '../lib/types';
import { resolveImageUrl } from '../lib/api';

interface ProductGridCardProps {
  category: Category;
}

export default function ProductGridCard({ category }: ProductGridCardProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before visible
        threshold: 0.1,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price);
  };

  const getStoreLogo = (storeId: string): { logo: string; name: string } => {
    const storeLogos: Record<string, { logo: string; name: string }> = {
      'nofrills': { logo: '/nofrills.png', name: 'No Frills' },
      'no-frills': { logo: '/nofrills.png', name: 'No Frills' },
      'freshco': { logo: '/freshco-seeklogo.png', name: 'FreshCo' },
      'walmart': { logo: '/walmart.svg', name: 'Walmart' },
      'loblaws': { logo: '/loblaws.png', name: 'Loblaws' },
      'metro': { logo: '/metro.png', name: 'Metro' },
    };
    return storeLogos[storeId] || { logo: '', name: storeId };
  };

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/category/${category.category_id}`)}
      className="bg-white rounded-xl border border-border cursor-pointer
                 hover:-translate-y-1 hover:shadow-lift
                 transition-all duration-300 ease-out overflow-hidden group"
    >
      {/* Product Image with skeleton */}
      <div className="w-full aspect-square bg-gray-50 overflow-hidden relative">
        {/* Skeleton placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}

        {isVisible && category.image_url ? (
          <img
            src={resolveImageUrl(category.image_url)}
            alt={category.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300
                       ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : !category.image_url ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-50">{category.icon}</span>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Product Name & Unit */}
        <h3 className="text-sm font-medium text-charcoal mb-0.5 line-clamp-2 min-h-[2.5rem] font-display">
          {category.name}
        </h3>
        <p className="text-xs text-muted mb-2 font-ui truncate">
          {category.unit}
        </p>

        {/* Price Display */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-semibold text-charcoal font-display">
            {formatPrice(category.cheapest_price)}
          </span>
          {category.previous_price && category.previous_price > category.cheapest_price && (
            <span className="text-xs text-muted line-through font-ui">
              {formatPrice(category.previous_price)}
            </span>
          )}
        </div>

        {/* Store & Savings */}
        <div className="flex items-center justify-between flex-wrap gap-1">
          <img
            src={getStoreLogo(category.cheapest_store).logo}
            alt={getStoreLogo(category.cheapest_store).name}
            className={`object-contain ${category.cheapest_store === 'freshco' ? 'h-6' : 'h-4'}`}
          />
          {category.previous_price && category.previous_price > category.cheapest_price && (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-sage bg-sage-light rounded-full font-ui">
              Save {Math.round(((category.previous_price - category.cheapest_price) / category.previous_price) * 100)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
