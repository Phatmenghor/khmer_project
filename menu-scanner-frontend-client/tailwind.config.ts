import type { Config } from "tailwindcss";

// Every rem-based Tailwind default is pre-multiplied by 0.7 so that the visual
// appearance at html { font-size: 100% } matches what the UI looked like when
// html { font-size: 70% } was in effect.  Pixel values are left untouched because
// they are already absolute and therefore unaffected by the root font-size.

const SCALE = 0.7;
const r = (rem: number) => `${+(rem * SCALE).toFixed(6).replace(/\.?0+$/, "")}rem`;

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    // ── Font-size scale (replaces Tailwind defaults) ────────────────────────
    // All values are the standard Tailwind rem values × 0.7.
    fontSize: {
      xs:   [r(0.75),  { lineHeight: r(1.0)  }],
      sm:   [r(0.875), { lineHeight: r(1.25) }],
      base: [r(1.0),   { lineHeight: r(1.5)  }],
      lg:   [r(1.125), { lineHeight: r(1.75) }],
      xl:   [r(1.25),  { lineHeight: r(1.75) }],
      "2xl":[r(1.5),   { lineHeight: r(2.0)  }],
      "3xl":[r(1.875), { lineHeight: r(2.25) }],
      "4xl":[r(2.25),  { lineHeight: r(2.5)  }],
      "5xl":[r(3.0),   { lineHeight: "1"     }],
      "6xl":[r(3.75),  { lineHeight: "1"     }],
      "7xl":[r(4.5),   { lineHeight: "1"     }],
      "8xl":[r(6.0),   { lineHeight: "1"     }],
      "9xl":[r(8.0),   { lineHeight: "1"     }],
    },

    // ── Spacing scale (replaces Tailwind defaults) ──────────────────────────
    // Controls: padding, margin, gap, width, height, translate, inset, etc.
    // Numeric rem values × 0.7; pixel values left unchanged.
    spacing: {
      px:   "1px",
      0:    "0px",
      0.5:  r(0.125),
      1:    r(0.25),
      1.5:  r(0.375),
      2:    r(0.5),
      2.5:  r(0.625),
      3:    r(0.75),
      3.5:  r(0.875),
      4:    r(1.0),
      5:    r(1.25),
      6:    r(1.5),
      7:    r(1.75),
      8:    r(2.0),
      9:    r(2.25),
      10:   r(2.5),
      11:   r(2.75),
      12:   r(3.0),
      14:   r(3.5),
      16:   r(4.0),
      20:   r(5.0),
      24:   r(6.0),
      28:   r(7.0),
      32:   r(8.0),
      36:   r(9.0),
      40:   r(10.0),
      44:   r(11.0),
      48:   r(12.0),
      52:   r(13.0),
      56:   r(14.0),
      60:   r(15.0),
      64:   r(16.0),
      72:   r(18.0),
      80:   r(20.0),
      96:   r(24.0),
      // Named semantic tokens (keep for any component using p-xs / gap-md etc.)
      xs:   r(0.25),
      sm:   r(0.5),
      md:   r(1.0),
      lg:   r(1.5),
      xl:   r(2.0),
      "2xl":r(3.0),
      "3xl":r(4.0),
    },

    extend: {
      colors: {
        brand: {
          50: "#F3F7F0",
          100: "#E2EDD9",
          200: "#BDD5AA",
          300: "#93BA78",
          400: "#6B9D4F",
          500: "#57823D",
          600: "#476B32",
          700: "#3C5A2A",
          800: "#304922",
          900: "#25381A",
          950: "#162110",
          main: "#57823D",
          darker: "#476B32",
          lighter: "#93BA78",
          subtle: "#E2EDD9",
        },

        status: {
          error: {
            50: "#FEF2F2",
            100: "#FEE2E2",
            200: "#FECACA",
            300: "#FCA5A5",
            400: "#F87171",
            500: "#D02E2E",
            600: "#DC2626",
            700: "#B91C1C",
            800: "#991B1B",
            900: "#7F1D1D",
            DEFAULT: "#D02E2E",
          },
          warning: {
            50: "#FFFBEB",
            100: "#FEF3C7",
            200: "#FDE68A",
            300: "#FCD34D",
            400: "#FBBF24",
            500: "#D09F2E",
            600: "#D97706",
            700: "#B45309",
            800: "#92400E",
            900: "#78350F",
            DEFAULT: "#D09F2E",
          },
          info: {
            50: "#EFF6FF",
            100: "#DBEAFE",
            200: "#BFDBFE",
            300: "#93C5FD",
            400: "#60A5FA",
            500: "#2E74D0",
            600: "#2563EB",
            700: "#1D4ED8",
            800: "#1E40AF",
            900: "#1E3A8A",
            DEFAULT: "#2E74D0",
          },
          success: {
            50: "#F0FDF4",
            100: "#DCFCE7",
            200: "#BBF7D0",
            300: "#86EFAC",
            400: "#4ADE80",
            500: "#2ED041",
            600: "#16A34A",
            700: "#15803D",
            800: "#166534",
            900: "#14532D",
            DEFAULT: "#2ED041",
          },
        },

        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#EAEAEA",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#878787",
          600: "#656565",
          700: "#525252",
          800: "#404040",
          900: "#242424",
          950: "#171717",
          "dark-1": "#242424",
          "dark-2": "#656565",
          "dark-3": "#878787",
          "dark-4": "#D4D4D4",
          "light-1": "#EAEAEA",
          "light-2": "#F1F1F1",
          "light-3": "#FFFFFF",
        },

        gray: {
          50: "hsl(var(--gray-50))",
          100: "hsl(var(--gray-100))",
          200: "hsl(var(--gray-200))",
          300: "hsl(var(--gray-300))",
          400: "hsl(var(--gray-400))",
          500: "hsl(var(--gray-500))",
          600: "hsl(var(--gray-600))",
          700: "hsl(var(--gray-700))",
          800: "hsl(var(--gray-800))",
          900: "hsl(var(--gray-900))",
        },

        primary: {
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          200: "hsl(var(--primary-200))",
          300: "hsl(var(--primary-300))",
          400: "hsl(var(--primary-400))",
          500: "hsl(var(--primary-500))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          800: "hsl(var(--primary-800))",
          900: "hsl(var(--primary-900))",
          950: "hsl(var(--primary-950))",
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        success: {
          50: "hsl(var(--success-50))",
          100: "hsl(var(--success-100))",
          500: "hsl(var(--success-500))",
          600: "hsl(var(--success-600))",
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          50: "hsl(var(--warning-50))",
          100: "hsl(var(--warning-100))",
          500: "hsl(var(--warning-500))",
          600: "hsl(var(--warning-600))",
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        error: {
          50: "hsl(var(--error-50))",
          100: "hsl(var(--error-100))",
          500: "hsl(var(--error-500))",
          600: "hsl(var(--error-600))",
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))",
        },
        info: {
          50: "hsl(var(--info-50))",
          100: "hsl(var(--info-100))",
          500: "hsl(var(--info-500))",
          600: "hsl(var(--info-600))",
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },

        surface: {
          1: "hsl(var(--surface-1))",
          2: "hsl(var(--surface-2))",
          3: "hsl(var(--surface-3))",
        },

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },

      // ── Border radius ──────────────────────────────────────────────────────
      // lg/md/sm use CSS vars (--radius = 0.35rem) so they scale automatically.
      // DEFAULT/xl/2xl/3xl are set to 0.7× of Tailwind defaults.
      borderRadius: {
        none:  "0",
        sm:    "calc(var(--radius) - 4px)",   // ≈ 1.6 px
        DEFAULT: r(0.25),                     // ≈ 2.8 px  (rounded)
        md:    "calc(var(--radius) - 2px)",   // ≈ 3.6 px
        lg:    "var(--radius)",               // = 5.6 px  (--radius = 0.35rem)
        xl:    r(0.75),                       // ≈ 8.4 px
        "2xl": r(1.0),                        // ≈ 11.2 px
        "3xl": r(1.5),                        // ≈ 16.8 px
        full:  "9999px",
      },

      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },

      boxShadow: {
        sm:      "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md:      "var(--shadow-md)",
        lg:      "var(--shadow-lg)",
        xl:      "var(--shadow-xl)",
        soft:    "0 2px 8px -2px rgba(0,0,0,0.08), 0 4px 16px -6px rgba(0,0,0,0.05)",
        colored: "0 4px 12px -2px hsl(var(--primary) / 0.15)",
      },

      transitionDuration: {
        fast:   "var(--transition-fast)",
        normal: "var(--transition-normal)",
        slow:   "var(--transition-slow)",
      },

      // ── Max-width ──────────────────────────────────────────────────────────
      // Standard Tailwind rem values × 0.7; custom px breakpoints unchanged.
      maxWidth: {
        xs:    r(20),   // 14 rem  ≈ 224 px
        sm:    r(24),   // 16.8 rem ≈ 268.8 px
        md:    r(28),   // 19.6 rem ≈ 313.6 px
        lg:    r(32),   // 22.4 rem ≈ 358.4 px
        xl:    r(36),   // 25.2 rem ≈ 403.2 px
        "2xl": r(42),   // 29.4 rem ≈ 470.4 px
        "3xl": r(48),   // 33.6 rem ≈ 537.6 px
        "4xl": r(56),   // 39.2 rem ≈ 627.2 px
        "5xl": r(64),   // 44.8 rem ≈ 716.8 px
        "6xl": r(72),   // 50.4 rem ≈ 806.4 px
        "7xl": "1140px",
        "8xl": "1340px",
        "9xl": "1600px",
      },

      animation: {
        "fade-in":    "fadeIn 0.5s ease-in-out",
        "slide-up":   "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in":   "scaleIn 0.2s ease-out",
      },

      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        slideDown: {
          "0%":   { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)",     opacity: "1" },
        },
        scaleIn: {
          "0%":   { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)",    opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
