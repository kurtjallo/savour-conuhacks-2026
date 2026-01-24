/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: '#f8f7f6',
        charcoal: '#2e2c29',
        'charcoal-light': '#6b6966',
        muted: '#9a958c',
        accent: '#f35c1d',
        sage: '#4a7c59',
        'sage-light': '#eef5f0',
        border: '#e8e6e3',
        // Savour Design System (alternative namespace)
        savour: {
          bg: '#f8f7f6',
          card: '#ffffff',
          border: '#e8e6e3',
          text: '#2e2c29',
          'text-secondary': '#6b6966',
          accent: '#f35c1d',
          'accent-hover': '#e04d12',
          savings: '#4a7c59',
          'savings-light': '#e8f0eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Work Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.04)',
        'lift': '0 12px 40px rgba(0, 0, 0, 0.08)',
      },
      maxWidth: {
        '2xl': '42rem',
      },
    },
  },
  plugins: [],
}
