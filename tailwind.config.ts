import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FFFDF9",
          100: "#FDF6EE",
          200: "#F9EDDD",
          300: "#F2E0C8",
        },
        coral: {
          50: "#FFF1EE",
          100: "#FFD9D1",
          200: "#FFB0A3",
          300: "#F28776",
          400: "#E86B8B",
          500: "#D94F5E",
          600: "#B83A48",
        },
        amber: {
          50: "#FFF8E7",
          100: "#FFEFC2",
          200: "#FFDF85",
          300: "#F5C842",
          400: "#E8A817",
          500: "#C98E0E",
          600: "#A47008",
        },
        charcoal: {
          50: "#F5F3F2",
          100: "#E8E4E1",
          200: "#C9C2BC",
          300: "#A69D95",
          400: "#7D7269",
          500: "#5A4F46",
          600: "#3D3430",
          700: "#2C2421",
          800: "#1E1815",
          900: "#120E0C",
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        warm: "0 4px 24px -4px rgba(44, 36, 33, 0.08)",
        "warm-lg": "0 8px 40px -8px rgba(44, 36, 33, 0.12)",
        "warm-xl": "0 16px 56px -12px rgba(44, 36, 33, 0.16)",
        glow: "0 0 40px -8px rgba(232, 107, 139, 0.3)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #E86B8B 0%, #F5C842 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(232,107,139,0.15) 0%, rgba(245,200,66,0.15) 100%)",
        "cream-gradient":
          "linear-gradient(180deg, #FDF6EE 0%, #FFFDF9 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
