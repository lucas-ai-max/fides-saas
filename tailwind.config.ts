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
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1E3A5F",
          light: "#2A4A75",
          dark: "#15283F",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#4A5568",
          light: "#718096",
          dark: "#2D3748",
          foreground: "#FFFFFF",
          bg: "#F8F9FA",
        },
        accent: {
          DEFAULT: "#C9A961",
          light: "#D4B980",
          dark: "#B8964F",
          foreground: "#1E3A5F",
        },
        success: {
          DEFAULT: "#48BB78",
          light: "#68D391",
          dark: "#38A169",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#ED8936",
          light: "#F6AD55",
          dark: "#DD6B20",
          foreground: "#FFFFFF",
        },
        error: {
          DEFAULT: "#F56565",
          light: "#FC8181",
          dark: "#E53E3E",
          foreground: "#FFFFFF",
        },
        info: {
          DEFAULT: "#4299E1",
          light: "#63B3ED",
          dark: "#3182CE",
          foreground: "#FFFFFF",
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#4A5568",
          tertiary: "#718096",
          disabled: "#A0AEC0",
        },
        bg: {
          primary: "#FFFFFF",
          secondary: "#F8F9FA",
          tertiary: "#F0F2F5",
        },
        borders: {
          light: "#E2E8F0",
          medium: "#CBD5E0",
          dark: "#A0AEC0",
        },
        liturgical: {
          purple: "#7C3AED",
          green: "#10B981",
          red: "#DC2626",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        serif: ['Crimson Text', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display': ['40px', { lineHeight: '1.2', fontWeight: '700' }],
        'display-mobile': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'h1': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'h1-mobile': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h2': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'h3': ['16px', { lineHeight: '1.5', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        'button': ['15px', { lineHeight: '1', fontWeight: '600', letterSpacing: '0.2px' }],
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        'full': '9999px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0,0,0,0.05)',
        'sm': '0 1px 3px rgba(0,0,0,0.08)',
        'md': '0 4px 12px rgba(0,0,0,0.1)',
        'lg': '0 8px 24px rgba(0,0,0,0.12)',
        'xl': '0 12px 32px rgba(0,0,0,0.15)',
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
