/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Brand colors resolve to CSS variables (single source of truth in
      // index.css). RGB triples let `<alpha-value>` work, e.g. `bg-bone/20`.
      colors: {
        void: 'rgb(var(--void-rgb) / <alpha-value>)',
        surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
        layer: 'rgb(var(--layer-rgb) / <alpha-value>)',
        bone: 'rgb(var(--bone-rgb) / <alpha-value>)',
        ash: 'rgb(var(--ash-rgb) / <alpha-value>)',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Oswald', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-quart': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: {
        800: '800ms',
        1100: '1100ms',
        1400: '1400ms',
      },
      letterSpacing: {
        display: '0.02em',
      },
      screens: {
        xs: '400px',
      },
    },
  },
  plugins: [],
}
