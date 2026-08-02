import type { Config } from "tailwindcss";

// Design tokens for the Local Market platform.
// Palette moves away from generic "AI cream + terracotta" defaults:
// deep bazaar indigo for trust/navigation, marigold for CTAs/energy,
// mint for "open now" / verified states — colors drawn from an
// Indian bazaar's own vocabulary (spice stalls, marigold garlands,
// fresh produce) rather than a neutral SaaS palette.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: "#EEEFF7",
          100: "#D3D5EA",
          400: "#4B4F94",
          600: "#2B2F6B",
          700: "#20244E", // primary — nav, headers, footer
          900: "#14172F",
        },
        marigold: {
          50: "#FFF6E5",
          100: "#FFE8B8",
          400: "#F7B733",
          500: "#F0A202", // CTA / accent
          600: "#C98300",
        },
        mint: {
          50: "#E7F8F0",
          400: "#33B784",
          500: "#1F9D6B", // open now / verified / in stock
          600: "#187C55",
        },
        rose: {
          500: "#D64545", // out of stock / errors / reports
        },
        sand: {
          50: "#FBF9F5", // page background
          100: "#F3EEE4",
          200: "#E7DFCF",
        },
        ink: {
          900: "#201C18", // primary text
          600: "#5B5450",
          400: "#8C847E",
        },
      },
      fontFamily: {
        display: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        devanagari: ["var(--font-noto-devanagari)", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        card: "0 2px 12px rgba(32, 36, 78, 0.08)",
        "card-hover": "0 8px 24px rgba(32, 36, 78, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
