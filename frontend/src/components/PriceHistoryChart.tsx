import { useMemo } from 'react';

interface PriceHistoryChartProps {
  currentPrice: number;
  productId: string;
}

interface PricePoint {
  month: string;
  price: number;
}

export default function PriceHistoryChart({ currentPrice, productId }: PriceHistoryChartProps) {
  // Generate deterministic random prices based on productId
  const priceHistory = useMemo<PricePoint[]>(() => {
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];

    // Simple hash function for deterministic randomness
    const hash = (str: string, seed: number) => {
      let h = seed;
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h + str.charCodeAt(i)) | 0;
      }
      return Math.abs(h);
    };

    return months.map((month, index) => {
      // Generate price variation: ±15% from current price, trending down over time
      const randomFactor = (hash(productId, index) % 30 - 15) / 100;
      const trendFactor = (5 - index) * 0.02; // Prices were higher in the past
      const price = currentPrice * (1 + randomFactor + trendFactor);
      return {
        month,
        price: Math.round(price * 100) / 100,
      };
    });
  }, [currentPrice, productId]);

  // Chart dimensions
  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const prices = priceHistory.map(p => p.price);
  const minPrice = Math.floor(Math.min(...prices) * 0.95);
  const maxPrice = Math.ceil(Math.max(...prices) * 1.05);
  const priceRange = maxPrice - minPrice || 1;

  // Generate Y-axis ticks
  const yTicks = useMemo(() => {
    const tickCount = 4;
    const step = priceRange / (tickCount - 1);
    return Array.from({ length: tickCount }, (_, i) =>
      Math.round((minPrice + step * i) * 100) / 100
    );
  }, [minPrice, priceRange]);

  // Convert data to SVG coordinates
  const points = priceHistory.map((point, index) => {
    const x = padding.left + (index / (priceHistory.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
    return { x, y, ...point };
  });

  // Create path for the line
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Create path for the gradient area
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  // Determine trend: compare first price to current price
  const firstPrice = priceHistory[0]?.price || currentPrice;
  const priceWentUp = currentPrice > firstPrice;
  const priceChange = ((currentPrice - firstPrice) / firstPrice) * 100;

  // Colors based on trend (green = down/good, red = up/bad)
  const trendColor = priceWentUp ? '#EF4444' : '#22C55E'; // red if up, green if down
  const gradientId = `priceGradient-${productId.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="bg-white border border-savour-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-savour-text">Price History</h3>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
            priceWentUp
              ? 'bg-red-50 text-red-600'
              : 'bg-green-50 text-green-600'
          }`}
        >
          {priceWentUp ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
          {Math.abs(priceChange).toFixed(1)}%
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={trendColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map((tick, i) => {
          const y = padding.top + chartHeight - ((tick - minPrice) / priceRange) * chartHeight;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-savour-text-secondary"
                style={{ fontSize: '11px' }}
              >
                ${tick.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Area under the line */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={trendColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="white"
              stroke={trendColor}
              strokeWidth="2"
            />
            {/* X-axis labels */}
            <text
              x={point.x}
              y={height - 10}
              textAnchor="middle"
              className="text-xs fill-savour-text-secondary"
              style={{ fontSize: '11px' }}
            >
              {point.month}
            </text>
          </g>
        ))}

        {/* Current price indicator */}
        <g>
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="6"
            fill={trendColor}
          />
          <text
            x={points[points.length - 1].x}
            y={points[points.length - 1].y - 12}
            textAnchor="middle"
            className="text-xs font-medium fill-savour-text"
            style={{ fontSize: '12px' }}
          >
            ${currentPrice.toFixed(2)}
          </text>
        </g>
      </svg>

      <div className="mt-4 flex items-center justify-between text-xs text-savour-text-secondary">
        <span>6-month price trend</span>
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-0.5 rounded"
            style={{ backgroundColor: trendColor }}
          ></span>
          {priceWentUp ? 'Price increased' : 'Price decreased'}
        </span>
      </div>
    </div>
  );
}
