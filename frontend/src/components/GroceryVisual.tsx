export default function GroceryVisual() {
  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-[520px] flex items-center justify-center">
      {/* Main grocery bag */}
      <div className="relative">
        <svg width="280" height="320" viewBox="0 0 280 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Paper bag shadow */}
          <ellipse cx="145" cy="310" rx="100" ry="12" fill="rgba(0,0,0,0.06)" />

          {/* Paper bag back */}
          <path d="M45 95 L45 290 Q45 300 55 300 L225 300 Q235 300 235 290 L235 95 Z" fill="#D4A574" />

          {/* Paper bag front */}
          <path d="M35 100 L35 285 Q35 295 45 295 L235 295 Q245 295 245 285 L245 100 Z" fill="#E8C9A0" />

          {/* Bag fold/rim */}
          <path d="M35 100 Q35 85 55 85 L225 85 Q245 85 245 100 L245 110 Q245 95 225 95 L55 95 Q35 95 35 110 Z" fill="#D4A574" />

          {/* Bag texture lines */}
          <path d="M60 120 L60 280" stroke="#D4A574" strokeWidth="1" opacity="0.4" />
          <path d="M100 120 L100 280" stroke="#D4A574" strokeWidth="1" opacity="0.3" />
          <path d="M140 120 L140 280" stroke="#D4A574" strokeWidth="1" opacity="0.4" />
          <path d="M180 120 L180 280" stroke="#D4A574" strokeWidth="1" opacity="0.3" />
          <path d="M220 120 L220 280" stroke="#D4A574" strokeWidth="1" opacity="0.4" />

          {/* Baguette sticking out */}
          <ellipse cx="200" cy="45" rx="18" ry="55" fill="#E8D4B8" transform="rotate(-15 200 45)" />
          <ellipse cx="200" cy="45" rx="18" ry="55" fill="url(#baguette-gradient)" transform="rotate(-15 200 45)" />
          <path d="M185 20 Q190 25 195 20 Q200 25 205 20 Q210 25 215 20" stroke="#C9A882" strokeWidth="2" fill="none" transform="rotate(-15 200 45)" />
          <path d="M183 35 Q188 40 193 35 Q198 40 203 35 Q208 40 213 35" stroke="#C9A882" strokeWidth="2" fill="none" transform="rotate(-15 200 45)" />
          <path d="M182 50 Q187 55 192 50 Q197 55 202 50 Q207 55 212 50" stroke="#C9A882" strokeWidth="2" fill="none" transform="rotate(-15 200 45)" />

          {/* Celery/Leek sticking out */}
          <path d="M70 30 Q65 60 75 90" stroke="#8BC34A" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M80 25 Q78 55 85 85" stroke="#9CCC65" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M90 35 Q92 60 88 80" stroke="#7CB342" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Celery leaves */}
          <ellipse cx="68" cy="22" rx="12" ry="8" fill="#66BB6A" transform="rotate(-30 68 22)" />
          <ellipse cx="82" cy="15" rx="10" ry="6" fill="#81C784" transform="rotate(10 82 15)" />
          <ellipse cx="95" cy="28" rx="8" ry="5" fill="#66BB6A" transform="rotate(30 95 28)" />

          {/* Carrot tops visible */}
          <path d="M120 75 Q115 50 125 30" stroke="#66BB6A" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M130 75 Q128 55 135 35" stroke="#81C784" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M140 78 Q142 58 138 40" stroke="#66BB6A" strokeWidth="2" strokeLinecap="round" fill="none" />

          <defs>
            <linearGradient id="baguette-gradient" x1="180" y1="0" x2="220" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F5E6D3" />
              <stop offset="1" stopColor="#D4A574" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating Apple - Top Left */}
      <div className="absolute top-[5%] left-[5%] animate-float float-delay-1">
        <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="35" cy="40" rx="25" ry="26" fill="#E53935"/>
          <ellipse cx="35" cy="40" rx="25" ry="26" fill="url(#apple-grad-1)"/>
          <path d="M35 14 Q37 8 42 10" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <ellipse cx="39" cy="11" rx="7" ry="4" fill="#66BB6A" transform="rotate(-25 39 11)"/>
          <ellipse cx="28" cy="34" rx="5" ry="7" fill="rgba(255,255,255,0.25)"/>
          <defs>
            <linearGradient id="apple-grad-1" x1="15" y1="18" x2="55" y2="65" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EF5350"/>
              <stop offset="1" stopColor="#C62828"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating Orange - Top Right */}
      <div className="absolute top-[2%] right-[8%] animate-float-slow float-delay-2">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="42" r="30" fill="#FF9800"/>
          <circle cx="40" cy="42" r="30" fill="url(#orange-grad-1)"/>
          <ellipse cx="32" cy="35" rx="7" ry="9" fill="rgba(255,255,255,0.2)"/>
          <circle cx="40" cy="12" r="4" fill="#66BB6A"/>
          {/* Orange texture dots */}
          <circle cx="28" cy="50" r="1.5" fill="rgba(255,255,255,0.15)"/>
          <circle cx="45" cy="55" r="1" fill="rgba(255,255,255,0.15)"/>
          <circle cx="52" cy="38" r="1.5" fill="rgba(255,255,255,0.12)"/>
          <defs>
            <linearGradient id="orange-grad-1" x1="15" y1="18" x2="65" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFB74D"/>
              <stop offset="1" stopColor="#F57C00"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating Tomato - Middle Right */}
      <div className="absolute top-[35%] right-[0%] animate-float-reverse float-delay-3">
        <svg width="65" height="65" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="32" cy="36" rx="26" ry="24" fill="#F44336"/>
          <ellipse cx="32" cy="36" rx="26" ry="24" fill="url(#tomato-grad-1)"/>
          <ellipse cx="24" cy="30" rx="6" ry="8" fill="rgba(255,255,255,0.2)"/>
          <path d="M20 12 Q26 6 32 10 Q38 6 44 12" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <circle cx="32" cy="10" r="3" fill="#66BB6A"/>
          <defs>
            <linearGradient id="tomato-grad-1" x1="10" y1="15" x2="50" y2="58" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EF5350"/>
              <stop offset="1" stopColor="#C62828"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating Lemon - Bottom Right */}
      <div className="absolute bottom-[20%] right-[5%] animate-float float-delay-5">
        <svg width="60" height="50" viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="30" cy="25" rx="26" ry="20" fill="#FDD835"/>
          <ellipse cx="30" cy="25" rx="26" ry="20" fill="url(#lemon-grad)"/>
          <ellipse cx="22" cy="20" rx="5" ry="6" fill="rgba(255,255,255,0.25)"/>
          <ellipse cx="8" cy="25" rx="4" ry="3" fill="#F9A825"/>
          <ellipse cx="52" cy="25" rx="4" ry="3" fill="#F9A825"/>
          <defs>
            <linearGradient id="lemon-grad" x1="10" y1="8" x2="50" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFEE58"/>
              <stop offset="1" stopColor="#FBC02D"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating Avocado - Bottom Left */}
      <div className="absolute bottom-[8%] left-[8%] animate-float-slow float-delay-4">
        <svg width="55" height="75" viewBox="0 0 55 75" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M27 5 Q2 25 7 48 Q12 72 27 72 Q42 72 47 48 Q52 25 27 5Z" fill="#8BC34A"/>
          <path d="M27 5 Q2 25 7 48 Q12 72 27 72 Q42 72 47 48 Q52 25 27 5Z" fill="url(#avo-outer)"/>
          <ellipse cx="27" cy="44" rx="14" ry="20" fill="#C5E1A5"/>
          <ellipse cx="27" cy="48" rx="8" ry="11" fill="#6D4C41"/>
          <ellipse cx="24" cy="45" rx="2.5" ry="3" fill="rgba(255,255,255,0.3)"/>
          <defs>
            <linearGradient id="avo-outer" x1="8" y1="8" x2="45" y2="68" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9CCC65"/>
              <stop offset="1" stopColor="#558B2F"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating Broccoli - Left Middle */}
      <div className="absolute top-[45%] left-[0%] animate-float float-delay-6">
        <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Stem */}
          <path d="M35 70 L35 45 Q35 40 35 38" stroke="#7CB342" strokeWidth="8" strokeLinecap="round"/>
          {/* Florets */}
          <circle cx="25" cy="30" r="12" fill="#4CAF50"/>
          <circle cx="45" cy="30" r="12" fill="#43A047"/>
          <circle cx="35" cy="20" r="14" fill="#66BB6A"/>
          <circle cx="20" cy="22" r="8" fill="#4CAF50"/>
          <circle cx="50" cy="22" r="8" fill="#43A047"/>
          {/* Highlights */}
          <circle cx="30" cy="16" r="3" fill="rgba(255,255,255,0.2)"/>
          <circle cx="42" cy="25" r="2" fill="rgba(255,255,255,0.15)"/>
        </svg>
      </div>

      {/* Small Banana - Top */}
      <div className="absolute top-[18%] left-[25%] animate-float-reverse float-delay-2">
        <svg width="50" height="35" viewBox="0 0 50 35" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 25 Q10 5 30 5 Q50 5 48 18 Q46 28 25 28 Q10 28 5 25Z" fill="#FFD54F"/>
          <path d="M5 25 Q10 5 30 5 Q50 5 48 18 Q46 28 25 28 Q10 28 5 25Z" fill="url(#banana-grad)"/>
          <path d="M10 20 Q15 10 30 10" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <ellipse cx="5" cy="25" rx="3" ry="2" fill="#8D6E63"/>
          <defs>
            <linearGradient id="banana-grad" x1="5" y1="5" x2="45" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFEB3B"/>
              <stop offset="1" stopColor="#FFC107"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating cheese wedge - decorative */}
      <div className="absolute bottom-[35%] right-[18%] animate-float-slow float-delay-1">
        <svg width="45" height="40" viewBox="0 0 45 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 35 L22 5 L42 35 Z" fill="#FFC107"/>
          <path d="M5 35 L22 5 L42 35 Z" fill="url(#cheese-grad)"/>
          <circle cx="15" cy="28" r="3" fill="#FFB300"/>
          <circle cx="28" cy="25" r="4" fill="#FFB300"/>
          <circle cx="22" cy="18" r="2.5" fill="#FFB300"/>
          <defs>
            <linearGradient id="cheese-grad" x1="10" y1="5" x2="35" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFCA28"/>
              <stop offset="1" stopColor="#FF8F00"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Decorative dots/circles */}
      <div className="absolute top-[28%] left-[42%] w-3 h-3 bg-accent/15 rounded-full animate-float float-delay-3" />
      <div className="absolute bottom-[45%] right-[25%] w-2 h-2 bg-sage/20 rounded-full animate-float-slow float-delay-5" />
      <div className="absolute top-[55%] right-[35%] w-4 h-4 bg-orange-200/30 rounded-full animate-float-reverse float-delay-2" />
      <div className="absolute bottom-[15%] left-[30%] w-2.5 h-2.5 bg-yellow-300/25 rounded-full animate-float float-delay-4" />
    </div>
  );
}
