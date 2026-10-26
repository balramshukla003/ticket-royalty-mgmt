/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Primary — Indigo ──────────────────────────────────
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',   // default primary
          600: '#4f46e5',   // hover
          700: '#4338ca',   // active / pressed
          800: '#3730a3',
          900: '#312e81',
        },
        // ── Surface & backgrounds ─────────────────────────────
        surface:  '#ffffff',
        'surface-alt': '#f8fafc',  // slightly off-white panels
        background: '#f1f5f9',     // page bg (slate-100)

        // ── Text ──────────────────────────────────────────────
        'text-base':  '#0f172a',   // slate-900
        'text-muted': '#64748b',   // slate-500
        'text-light': '#94a3b8',   // slate-400

        // ── Borders ───────────────────────────────────────────
        border: '#e2e8f0',         // slate-200
        'border-strong': '#cbd5e1',// slate-300

        // ── Semantic ──────────────────────────────────────────
        danger:  { DEFAULT: '#ef4444', light: '#fef2f2', dark: '#b91c1c' },
        warning: { DEFAULT: '#f59e0b', light: '#fffbeb', dark: '#b45309' },
        success: { DEFAULT: '#22c55e', light: '#f0fdf4', dark: '#15803d' },
        info:    { DEFAULT: '#3b82f6', light: '#eff6ff', dark: '#1d4ed8' },

        // ── Priority badges (mirror the BE ENUM order) ────────
        priority: {
          critical: '#ef4444',
          high:     '#f59e0b',
          medium:   '#3b82f6',
          low:      '#94a3b8',
        },

        // ── Status badges ─────────────────────────────────────
        status: {
          open:        '#f59e0b',
          in_progress: '#3b82f6',
          resolved:    '#22c55e',
          closed:      '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        modal: '0 20px 60px -10px rgb(0 0 0 / 0.25)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [],
}
