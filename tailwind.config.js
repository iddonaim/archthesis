/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand coral — the single anchor color of the identity
        primary: {
          DEFAULT: '#FF6B6B',
          50: '#FFF1F0',
          100: '#FFE1DF',
          200: '#FFC7C3',
          300: '#FFA69F',
          400: '#FF8A80',
          500: '#FF6B6B',
          600: '#F04E4E',
          700: '#D93A3F',
          800: '#B32D35',
          900: '#8F262E',
        },
        // Supporting teal — used sparingly for secondary actions
        secondary: {
          DEFAULT: '#4ECDC4',
          50: '#EFFBF9',
          100: '#D6F5F1',
          200: '#ADEBE4',
          300: '#7FDED4',
          400: '#4ECDC4',
          500: '#35B5AC',
          600: '#279189',
          700: '#21746E',
          800: '#1E5D59',
          900: '#1B4D4A',
        },
        // Warm highlight for small touches only
        accent: {
          DEFAULT: '#FFD166',
          100: '#FFF3D6',
          300: '#FFE3A3',
          500: '#FFD166',
          700: '#E0A82E',
        },
        // Warm near-black used for hero, footer and headings
        ink: {
          DEFAULT: '#20242E',
          light: '#3A404E',
          dark: '#171A21',
        },
        // Warm off-white page background
        paper: '#FAF8F5',
        dark: '#2C3E50', // legacy alias, kept for old class usage
        // Bubblegum pop palette — playful accents + pastel washes
        pop: {
          pink: '#FF66A3',
          purple: '#8C52FF',
          orange: '#FF9A3D',
          teal: '#4ECDC4',
          yellow: '#FFD166',
        },
        pastel: {
          pink: '#FFD6EC',
          teal: '#C9F5EF',
          lilac: '#E4D9FF',
          butter: '#FFF3C4',
          blush: '#FFF7FC',
        },
      },
      fontFamily: {
        sans: ['Heebo', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        // Signature sunset gradient — used for primary buttons
        'sunset': 'linear-gradient(135deg, #FF6B6B 0%, #FF9A62 100%)',
        // Bubblegum headline/CTA gradient (reads right-to-left)
        'bubblegum': 'linear-gradient(to left, #8C52FF 0%, #FF66A3 50%, #FF9A3D 100%)',
        // Playful polka dots for light surfaces (e.g. behind the editor canvas)
        'confetti-dots': 'radial-gradient(circle, rgba(255,102,163,0.14) 1.5px, transparent 1.5px)',
      },
      backgroundSize: {
        'dots': '18px 18px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(32,36,46,0.06), 0 4px 16px rgba(32,36,46,0.06)',
        'card-hover': '0 2px 4px rgba(32,36,46,0.08), 0 12px 32px rgba(32,36,46,0.12)',
      },
    },
  },
  plugins: [],
}
