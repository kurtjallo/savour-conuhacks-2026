import { useState, useEffect } from 'react';

export default function FloatingStats() {
  const [savedAmount, setSavedAmount] = useState(1847);
  const [displayAmount, setDisplayAmount] = useState(1847);

  // Increment saved amount periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSavedAmount((prev) => prev + Math.floor(Math.random() * 15) + 5);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animate counter when savedAmount changes
  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    const startValue = displayAmount;
    const endValue = savedAmount;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(startValue + (endValue - startValue) * eased);
      setDisplayAmount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [savedAmount]);

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage/10 border border-sage/20 rounded-full animate-gentle-bounce" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <span className="w-2 h-2 bg-sage rounded-full animate-pulse" />
      <span className="text-sm font-semibold text-sage">
        ${displayAmount.toLocaleString()} saved today
      </span>
      <svg
        className="w-4 h-4 text-sage"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </div>
  );
}
