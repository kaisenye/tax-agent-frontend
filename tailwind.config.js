/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    colors: {
      'blue': '#42A5D6FF',
      'red': '#C11D1DFF',
      'purple': '#9688C7FF',
      'pink': '#CA85BCFF',
      'orange': '#D8886DFF',
      'green': '#75B090FF',
      'yellow': '#E4B73AFF',
      'gray-dark': '#C7C1BEFF',
      'gray': '#EFECEBFF',
      'gray-light': '#F9F8F8FF',
      'gray-light-light': '#FCFCFCFF',
      'white': '#ffffff',
      'black': '#1F1F1FFF',
      'black-light': '#5E594FFF',
    },
    fontFamily: {
      sans: ['Graphik', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
    fontWeight: {
      "400": "400",
      "500": "500",
      "600": "600",
      "700": "700",
    },
    fontSize: {
      "sm": "11px",
      "base": "12px",
      "lg": "14px",
      "xl": "15px",
      "2xl": "18px",
      "3xl": "24px",
      "4xl": "28px",
    },
    extend: {
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        "sm": "0.125rem",
        "md": "0.25rem",
        "lg": "0.375rem",
        "xl": "0.5rem",
        "2xl": "0.75rem",
        "3xl": "1rem"
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        }
      },
      animation: {
        slideUp: 'slideUp 0.3s ease-out forwards',
      }
    }
  },
  plugins: [],
}

