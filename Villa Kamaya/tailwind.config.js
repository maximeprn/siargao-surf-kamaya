/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Kamaya Light Theme (Primary)
        'kamaya': {
          'bg-primary': '#ECE8DB',
          'bg-secondary': 'rgba(28, 51, 64, 0.1)',
          'text-primary': '#1C3340',
          'text-secondary': '#1C3340',
          'text-muted': 'rgba(28, 51, 64, 0.6)',
          'accent': '#AEBDAF',
          'border': 'rgba(28, 51, 64, 0.2)',
        },
        // Kamaya Dark Theme (For sections like footer)
        'kamaya-dark': {
          'bg-primary': 'rgb(27, 51, 64)',
          'bg-secondary': 'rgba(27, 51, 64, 0.6)',
          'text-primary': '#EAF2F6',
          'text-secondary': '#C6D3DB',
          'text-muted': 'rgba(255, 255, 255, 0.6)',
          'accent': '#F8CB9E',
          'border': 'rgba(255, 255, 255, 0.14)',
        }
      },
      fontFamily: {
        'primary': ['Montserrat', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        'display': ['Analogue', 'ui-serif', 'Georgia', 'Times New Roman', 'serif'],
        'serif': ['Analogue', 'ui-serif', 'Georgia', 'Times New Roman', 'serif'],
      },
      fontSize: {
        // Display sizes
        'display': ['4rem', { lineHeight: '1.1', fontWeight: '700' }], // 64px
        'display-lg': ['6rem', { lineHeight: '1.1', fontWeight: '700' }], // 96px
        'metric': ['2.75rem', { lineHeight: '1.2', fontWeight: '600' }], // 44px
        'metric-lg': ['4.75rem', { lineHeight: '1.2', fontWeight: '600' }], // 76px
        
        // Content sizes
        'report': ['1rem', { lineHeight: '1.6' }], // 16px
        'report-lg': ['1.125rem', { lineHeight: '1.6' }], // 18px
        'eyebrow': ['1rem', { lineHeight: '1.4', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }], // 16px
        'subtle': ['1.125rem', { lineHeight: '1.5' }], // 18px
        'caption': ['0.875rem', { lineHeight: '1.4' }], // 14px
        'meta': ['0.75rem', { lineHeight: '1.3' }], // 12px
        'svg-label': ['0.6875rem', { lineHeight: '1.2' }], // 11px
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
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
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};