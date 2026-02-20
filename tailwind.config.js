/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'field': {
          light: '#56ab2f',
          dark: '#a8e063',
          grass: '#2d6a4f',
          line: '#ffffffcc',
        },
        'card': {
          base: '#fdfbf7', // Paper texture base
          back: '#1a365d', // Card back color
          border: '#e2e8f0',
        },
        'primary': '#2563eb',
        'accent': '#f59e0b',
        'forward': '#ef4444',    // Red for Forward
        'midfielder': '#10b981', // Green for Midfielder
        'defender': '#3b82f6',   // Blue for Defender
        'star': '#fbbf24',       // Gold for Stars
      },
      fontFamily: {
        'display': ['"Russo One"', 'sans-serif'], // Sporty display font (needs import)
        'body': ['"Roboto"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        'card-active': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'grass-pattern': "url('/assets/grass_texture.png')", // Placeholder
        'card-texture': "linear-gradient(to bottom right, #ffffff 0%, #f3f4f6 100%)",
      },
      animation: {
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'shimmer-delay': 'shimmer 3s ease-in-out infinite 1s',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}
