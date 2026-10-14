/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#111118',
        card: '#1a1a24',
        border: '#2a2a3a',
        accent: '#00d4ff',
        purple: '#7c3aed',
        green: '#00ff88',
        warning: '#ff6b35',
        'text-primary': '#f0f0ff',
        'text-muted': '#8888aa',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0,212,255,0.3)',
        'neon-purple': '0 0 20px rgba(124,58,237,0.3)',
        'neon-green': '0 0 20px rgba(0,255,136,0.3)',
      },
    },
  },
  plugins: [],
}
