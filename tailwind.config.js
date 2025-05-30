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
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        }
      },
      animation: {
        slideUp: 'slideUp 0.3s ease-out forwards',
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        fadeOut: 'fadeOut 0.2s ease-out forwards',
      }
    }
  },
  plugins: [],
}

