/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003087',
          dark: '#00255F',
          light: '#0052CC',
          50: '#E6F0FF',
          100: '#CCE0FF',
          200: '#99C2FF',
          300: '#66A3FF',
          400: '#3385FF',
          500: '#003087',
          600: '#00255F',
          700: '#001E46',
          800: '#00162D',
          900: '#000F1A',
        },
        accent: {
          yellow: '#FFC107',
          'yellow-dark': '#FFB300',
          'yellow-light': '#FFD54F',
        },
        success: {
          50: '#ECFDF5',
          200: '#A7F3D0',
          DEFAULT: '#28A745',
          dark: '#218838',
          light: '#34D399',
          700: '#15803D',
        },
        // ✅ ADD THIS ENTIRE DANGER OBJECT
        danger: {
          50: '#FEF2F2',
          200: '#FECACA',
          DEFAULT: '#EF4444',
          dark: '#DC2626',
          700: '#B91C1C',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        rhinos: ['Rhinos', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.875rem',
        'sm': '1rem',
        'base': '1.125rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '2.5rem',
        '3xl': '3rem',
        '4xl': '3.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'tiket': '0 2px 8px rgba(0, 48, 135, 0.15)',
      },
      borderRadius: {
        'tiket': '12px',
        'tiket-lg': '16px',
        'tiket-xl': '20px',
      },
      backgroundImage: {
        'hero': 'linear-gradient(rgba(0, 48, 135, 0.7), rgba(0, 48, 135, 0.7)), url(/src/assets/lake.jpg)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}