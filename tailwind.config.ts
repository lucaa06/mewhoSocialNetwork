import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        // Brand palette: only black & white
        black: "#000000",
        white: "#ffffff",
      },
      borderRadius: {
        /* Squircle-inspired scale — rounder than default Tailwind */
        none:    "0",
        sm:      "0.375rem",   /* 6px  */
        DEFAULT: "0.625rem",   /* 10px */
        md:      "0.875rem",   /* 14px */
        lg:      "1.125rem",   /* 18px */
        xl:      "1.375rem",   /* 22px */
        "2xl":   "1.75rem",    /* 28px */
        "3xl":   "2.25rem",    /* 36px */
        "4xl":   "3rem",       /* 48px */
        full:    "9999px",
      },
      backdropBlur: {
        xs: "4px",
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function({ addUtilities }: any) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
      });
    },
  ],
};

export default config;
