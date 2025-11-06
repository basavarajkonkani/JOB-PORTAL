import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Design System - Spacing Units
      spacing: {
        '4.5': '1.125rem', // 18px
        '18': '4.5rem', // 72px
      },
      // Design System - Container
      maxWidth: {
        'container': '1200px',
      },
      // Premium Design System - Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Poppins', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'Poppins', 'sans-serif'],
      },
      fontSize: {
        'hero-mobile': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'hero-tablet': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'hero-desktop': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      // Premium Design System - Colors (Blue-Violet Theme)
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#0f1729',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#2e1065',
        },
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      // Premium Design System - Border Radius
      borderRadius: {
        'sm': '0.75rem', // 12px
        'md': '1rem', // 16px
        'lg': '1.5rem', // 24px
        'xl': '2rem', // 32px
        '2xl': '2.5rem', // 40px
        '3xl': '3rem', // 48px
      },
      // Premium Design System - Shadows
      boxShadow: {
        'soft': '0 2px 12px rgba(99, 102, 241, 0.08)',
        'card': '0 8px 32px rgba(99, 102, 241, 0.12)',
        'card-hover': '0 16px 48px rgba(99, 102, 241, 0.18)',
        'elevated': '0 20px 60px rgba(99, 102, 241, 0.15)',
        'premium': '0 32px 80px rgba(99, 102, 241, 0.2)',
        'glow-blue': '0 0 40px rgba(59, 130, 246, 0.4)',
        'glow-purple': '0 0 40px rgba(168, 85, 247, 0.4)',
        'glow-cyan': '0 0 40px rgba(6, 182, 212, 0.4)',
        'inner-glow': 'inset 0 2px 12px rgba(99, 102, 241, 0.1)',
        'neumorphic': '8px 8px 24px rgba(148, 163, 184, 0.15), -8px -8px 24px rgba(255, 255, 255, 0.9)',
        'neumorphic-inset': 'inset 4px 4px 12px rgba(148, 163, 184, 0.1), inset -4px -4px 12px rgba(255, 255, 255, 0.9)',
      },
      // Premium Design System - Animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'gradient': 'gradient 4s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'rotate-slow': 'rotateSlow 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.1)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.5), 0 0 80px rgba(99, 102, 241, 0.2)' 
          },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        rotateSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      // Design System - Transitions
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
};

export default config;
