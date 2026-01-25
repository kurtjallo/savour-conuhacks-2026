import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Category } from '../lib/types';
import { resolveImageUrl } from '../lib/api';
import { getCategoryColorFromName } from '../lib/icons';
import QuickAddButton from './QuickAddButton';
import StoreLogo from './StoreLogo';

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

  const formatStoreName = (storeId: string): string => {
    const storeNames: Record<string, string> = {
      'maxi': 'Maxi',
      'iga': 'IGA',
      'provigo': 'Provigo',
      'walmart': 'Walmart',
      'metro': 'Metro',
    };
    return storeNames[storeId] || storeId;
  };

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(`/category/${category.category_id}`)}
      className="product-card relative bg-white rounded-xl border border-border cursor-pointer
                 hover:-translate-y-1 hover:shadow-lift
                 transition-all duration-300 ease-out overflow-hidden group"
    >
      {/* Product Image with skeleton */}
      <div className="product-image w-full aspect-square bg-gray-50 overflow-hidden relative">
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
            <div
              className="w-12 h-12 rounded-full opacity-30"
              style={{ backgroundColor: getCategoryColorFromName(category.name) }}
            />
          </div>
        ) : null}

        {/* Save Badge - positioned at top-right of image */}
        {category.previous_price && category.previous_price > category.cheapest_price && (
          <span className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-white bg-sage rounded-full font-ui shadow-sm">
            Save {Math.round(((category.previous_price - category.cheapest_price) / category.previous_price) * 100)}%
          </span>
        )}
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
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-lg font-semibold text-charcoal font-display">
            {formatPrice(category.cheapest_price)}
          </span>
          {category.previous_price && category.previous_price > category.cheapest_price && (
            <span className="text-xs text-muted line-through font-ui">
              {formatPrice(category.previous_price)}
            </span>
          )}
        </div>
        {/* Price per unit */}
        {category.unit && (
          <p className="text-xs text-charcoal-light font-ui mb-1">
            {formatPrice(category.cheapest_price)} / {category.unit}
          </p>
        )}

        {/* Store name */}
        <span className="text-xs text-charcoal-light font-ui flex items-center gap-1">
          at <StoreLogo storeId={category.cheapest_store} />
        </span>
      </div>

      {/* Quick Add Button - positioned at bottom-right */}
      <div className="absolute bottom-3 right-3 opacity-70 group-hover:opacity-100
                      md:opacity-0 md:group-hover:opacity-100
                      transition-opacity duration-200">
        <QuickAddButton category={category} />
      </div>
    </div>
  );
}
