import { Link } from 'react-router-dom';
import GroceryVisual from '../components/GroceryVisual';
import BackgroundPattern from '../components/BackgroundPattern';
import StoreLogoCarousel from '../components/StoreLogoCarousel';
import FloatingStats from '../components/FloatingStats';

export default function LandingScreen() {
  return (
    <div className="h-screen bg-cream overflow-hidden relative flex flex-col">
      {/* Background dot pattern with radial gradient */}
      <BackgroundPattern />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 flex flex-col flex-1 w-full">
        {/* Logo / Brand */}
        <header className="pt-6 pb-2">
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
        <main className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center flex-1">
          {/* Left: Content */}
          <div className="space-y-6 animate-fade-in-up">
            {/* Animated Stats */}
            <FloatingStats />

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
            <div className="flex flex-wrap gap-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <Link
                to="/onboarding"
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
          </div>

          {/* Right: Visual */}
          <div className="relative lg:pl-8 animate-fade-in stagger-2 hidden md:block">
            <GroceryVisual />
          </div>
        </main>

        {/* Store Logo Carousel */}
        <StoreLogoCarousel />
      </div>
    </div>
  );
}
