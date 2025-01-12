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
      'blue': '#1fb6ff',
      'purple': '#7e5bef',
      'pink': '#ff49db',
      'orange': '#ff7849',
      'green': '#13ce66',
      'yellow': '#ffc82c',
      'gray-dark': '#C7C1BEFF',
      'gray': '#EFECEBFF',
      'gray-light': '#F9F8F8FF',
      'white': '#ffffff',
      'black': '#1F1F1FFF',
      'black-light': '#59544CFF',
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
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.4rem",
      "3xl": "1.5rem",
      "4xl": "1.75rem",
    },
    extend: {
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        "sm": "0.125rem",
        "md": "0.25rem",
        "lg": "0.5rem",
        "xl": "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem"
      }
    }
  },
  plugins: [],
}

