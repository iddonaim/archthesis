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
      },
      fontFamily: {
        sans: ['Heebo', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        // Signature sunset gradient — the one gradient used across the site
        'sunset': 'linear-gradient(135deg, #FF6B6B 0%, #FF9A62 100%)',
        // Subtle blueprint grid for dark architectural surfaces
        'blueprint': `linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)`,
        // The same grid for light surfaces (e.g. behind the editor canvas)
        'blueprint-light': `linear-gradient(rgba(32,36,46,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(32,36,46,0.05) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'grid-sm': '24px 24px',
        'grid-lg': '96px 96px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(32,36,46,0.06), 0 4px 16px rgba(32,36,46,0.06)',
        'card-hover': '0 2px 4px rgba(32,36,46,0.08), 0 12px 32px rgba(32,36,46,0.12)',
      },
    },
  },
  plugins: [],
}
