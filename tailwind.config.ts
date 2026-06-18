import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-deep': 'var(--primary-deep)',
        'on-primary': 'var(--on-primary)',
        secondary: 'var(--secondary)',
        'on-secondary': 'var(--on-secondary)',
        tertiary: 'var(--tertiary)',
        'on-tertiary': 'var(--on-tertiary)',
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'on-background': 'var(--on-background)',
        'on-surface': 'var(--on-surface)',
        muted: 'var(--muted)',
        error: 'var(--error)',
        outline: 'var(--outline)',
        'outline-variant': 'var(--outline-variant)',
        'secondary-container': 'var(--secondary-container)',
        'on-secondary-container': 'var(--on-secondary-container)',
        'success-online': 'var(--success-online)',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        card: '20px',
        auth: '28px',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,24,38,0.06)',
        nav: '0 8px 24px rgba(37,99,235,0.18)',
        fab: '0 4px 12px rgba(0,0,0,0.15)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      screens: {
        tablet: '768px',
        desktop: '1024px',
        wide: '1440px',
      },
    },
  },
  plugins: [],
} satisfies Config;
