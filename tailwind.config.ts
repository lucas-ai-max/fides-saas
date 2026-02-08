import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        'xs': '375px',
      },
      colors: {
        // Primary - Azul Mariano
        primary: {
          50: 'hsl(214, 100%, 97%)',
          100: 'hsl(214, 95%, 93%)',
          200: 'hsl(213, 97%, 87%)',
          300: 'hsl(212, 96%, 78%)',
          400: 'hsl(213, 94%, 68%)',
          500: 'hsl(217, 91%, 60%)',
          600: 'hsl(221, 83%, 53%)',
          700: 'hsl(224, 76%, 48%)',
          800: 'hsl(226, 71%, 40%)',
          900: 'hsl(224, 64%, 33%)',
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          light: 'hsl(var(--primary-light))',
        },

        // Accent - Dourado
        accent: {
          50: 'hsl(48, 100%, 96%)',
          100: 'hsl(48, 96%, 89%)',
          200: 'hsl(48, 97%, 77%)',
          300: 'hsl(46, 97%, 65%)',
          400: 'hsl(43, 96%, 56%)',
          500: 'hsl(38, 92%, 50%)',
          600: 'hsl(32, 95%, 44%)',
          700: 'hsl(26, 90%, 37%)',
          800: 'hsl(23, 83%, 31%)',
          900: 'hsl(22, 78%, 26%)',
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          light: 'hsl(var(--accent-light))',
          dark: 'hsl(var(--accent-dark))',
        },

        // Semantic colors
        success: {
          light: 'hsl(var(--success-light))',
          DEFAULT: 'hsl(var(--success))',
          dark: 'hsl(var(--success-dark))',
        },
        warning: {
          light: 'hsl(var(--warning-light))',
          DEFAULT: 'hsl(var(--warning))',
          dark: 'hsl(var(--warning-dark))',
        },
        error: {
          light: 'hsl(var(--error-light))',
          DEFAULT: 'hsl(var(--error))',
          dark: 'hsl(var(--error-dark))',
        },
        info: {
          light: 'hsl(var(--info-light))',
          DEFAULT: 'hsl(var(--info))',
          dark: 'hsl(var(--info-dark))',
        },

        // Background colors
        background: {
          DEFAULT: 'hsl(var(--background))',
          secondary: 'hsl(var(--background-secondary))',
          tertiary: 'hsl(var(--background-tertiary))',
          elevated: 'hsl(var(--background-elevated))',
          soft: 'hsl(var(--background-soft))',
        },

        // Text colors
        text: {
          primary: 'hsl(var(--text-primary))',
          secondary: 'hsl(var(--text-secondary))',
          tertiary: 'hsl(var(--text-tertiary))',
          disabled: 'hsl(var(--text-disabled))',
          inverse: 'hsl(var(--text-inverse))',
        },

        // Border colors
        border: {
          light: 'hsl(var(--border-light))',
          DEFAULT: 'hsl(var(--border))',
          medium: 'hsl(var(--border-medium))',
          strong: 'hsl(var(--border-strong))',
        },

        // Legacy compatibility
        'sky-blue': 'hsl(var(--sky-blue))',
        'gray-light': 'hsl(var(--gray-light))',
        'gray-medium': 'hsl(var(--gray-medium))',
        'gray-text': 'hsl(var(--gray-text))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        foreground: 'hsl(var(--foreground))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        liturgical: {
          purple: 'hsl(258, 90%, 66%)',
          green: 'hsl(158, 64%, 52%)',
          red: 'hsl(0, 72%, 51%)',
          gold: 'hsl(var(--accent))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Playfair Display', 'Literata', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        scripture: ['Literata', 'Georgia', 'serif'],
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['11px', { lineHeight: '16px', letterSpacing: '0.02em' }],
        sm: ['13px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        base: ['15px', { lineHeight: '24px', letterSpacing: '0' }],
        lg: ['17px', { lineHeight: '28px', letterSpacing: '0' }],
        xl: ['20px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
        '2xl': ['24px', { lineHeight: '36px', letterSpacing: '-0.01em' }],
        '3xl': ['28px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
        '4xl': ['32px', { lineHeight: '44px', letterSpacing: '-0.02em' }],
        '5xl': ['40px', { lineHeight: '52px', letterSpacing: '-0.03em' }],
        '6xl': ['48px', { lineHeight: '60px', letterSpacing: '-0.03em' }],
        button: '15px',
        caption: '13px',
        // Legacy sizes
        'display': ['48px', { lineHeight: '1.1', fontWeight: '600', letterSpacing: '-0.02em' }],
        'display-mobile': ['36px', { lineHeight: '1.1', fontWeight: '600', letterSpacing: '-0.02em' }],
        'h1': ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        'h1-mobile': ['28px', { lineHeight: '1.2', fontWeight: '600' }],
        'h2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h2-mobile': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['17px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        mariano: '0 10px 30px -10px rgba(59, 130, 246, 0.3)',
        gold: '0 10px 30px -10px rgba(245, 158, 11, 0.4)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "gentle-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)"
          },
          "50%": {
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)"
          }
        },
        "breathe": {
          "0%, 100%": {
            transform: "scale(1)"
          },
          "50%": {
            transform: "scale(1.02)"
          }
        },
        "route-enter": {
          "0%": {
            opacity: "0",
            transform: "translateY(8px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "gentle-glow": "gentle-glow 3s ease-in-out infinite",
        "breathe": "breathe 4s ease-in-out infinite",
        "route-enter": "route-enter 0.3s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
