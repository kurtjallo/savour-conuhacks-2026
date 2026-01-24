import { Link } from 'react-router-dom';
import GroceryVisual from '../components/GroceryVisual';

export default function LandingScreen() {
  return (
    <div className="min-h-screen bg-cream overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-cream to-orange-50/30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Logo / Brand */}
        <header className="pt-8 pb-4">
          <Link to="/" className="inline-block">
            <h1
              className="text-2xl font-bold text-charcoal tracking-tight"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Savour
            </h1>
          </Link>
        </header>

        {/* Hero Section */}
        <main className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-120px)] py-8 lg:py-0">
          {/* Left: Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-full">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm font-medium text-accent" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Smart Savings
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal leading-tight tracking-tight"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Shop Smarter,
                <br />
                <span className="text-accent">Save More</span> on
                <br />
                Fresh Groceries.
              </h2>
            </div>

            {/* Subtitle */}
            <p
              className="text-lg md:text-xl text-charcoal-light max-w-lg leading-relaxed"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Compare prices across 5 major Canadian stores, build your basket,
              and discover exactly how much you can save with real numbers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <Link
                to="/home"
                className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-8 py-4 rounded-full
                         hover:bg-[#e04d12] hover:shadow-lg hover:scale-[1.02]
                         transition-all duration-200 ease-out"
              >
                Start Saving
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-charcoal font-semibold px-8 py-4 rounded-full
                         border-2 border-border hover:border-charcoal/20 hover:bg-cream
                         transition-all duration-200 ease-out"
              >
                View Products
              </Link>
            </div>

            {/* Trust indicators */}
            <div
              className="flex items-center gap-6 pt-4 text-sm text-muted"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>5 Major Stores</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Real-time Prices</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>100% Free</span>
              </div>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative lg:pl-8 animate-fade-in stagger-2 hidden md:block">
            <GroceryVisual />
          </div>
        </main>
      </div>
    </div>
  );
}
