import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "var(--color-primary)", hover: "var(--color-primary-hover)", fg: "var(--color-primary-fg)" },
        secondary: { DEFAULT: "var(--color-secondary)", fg: "var(--color-secondary-fg)" },
        accent: { DEFAULT: "var(--color-accent)" },
        success: { DEFAULT: "var(--color-success)", tint: "var(--color-success-tint)" },
        warning: { DEFAULT: "var(--color-warning)", tint: "var(--color-warning-tint)" },
        danger: { DEFAULT: "var(--color-danger)", tint: "var(--color-danger-tint)" },
        info: { DEFAULT: "var(--color-info)", tint: "var(--color-info-tint)" },
        bg: "var(--color-background)",
        surface: { DEFAULT: "var(--color-surface)", elevated: "var(--color-surface-elevated)" },
        border: { DEFAULT: "var(--color-border)", strong: "var(--color-border-strong)" },
        text: { primary: "var(--color-text-primary)", secondary: "var(--color-text-secondary)" },
        muted: "var(--color-muted)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        modal: "var(--shadow-modal)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
