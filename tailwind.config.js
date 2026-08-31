/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Warm neutral rather than Tailwind's cool gray — the default slate
        // palette is what makes every dashboard look like the same dashboard.
        ink: {
          50: "#faf9f8",
          100: "#f4f2f0",
          200: "#e7e4e0",
          300: "#d3cec8",
          400: "#a49d95",
          500: "#7c746c",
          600: "#5c554e",
          700: "#443f3a",
          800: "#2a2724",
          900: "#1a1816",
          950: "#0e0d0c",
        },
        // Indigo, pulled slightly violet: the "intelligence" accent.
        accent: {
          50: "#eef0ff",
          100: "#e0e3ff",
          200: "#c6cbff",
          300: "#a3a8ff",
          400: "#837eff",
          500: "#6c5cf5",
          600: "#5b3fe8",
          700: "#4e31cc",
          800: "#402aa5",
          900: "#372a83",
        },
        // Potential tiers. Named for meaning, not hue, so a re-theme can't
        // silently swap "hot" and "cold".
        hot: "#e2632a",
        warm: "#c99a1e",
        cool: "#3b82c4",
        cold: "#8a837b",
      },
      fontFamily: {
        sans: [
          "Inter var",
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        card: "0 1px 2px rgba(14, 13, 12, 0.04), 0 1px 3px rgba(14, 13, 12, 0.06)",
        lift: "0 8px 30px rgba(14, 13, 12, 0.12)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.18s ease-out",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};
