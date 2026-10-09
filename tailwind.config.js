/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#00D4AC',
        deep: '#00A68A',
        mint: '#E6FBF6',
        sun: '#FFD64A',
        ink: '#1F2937',
        sub: '#6B7280',
        line: '#E0F3EE',
        sky: '#5BC8F5',
        ember: '#F0552A',
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '22px', tile: '18px' },
      boxShadow: {
        card: '0 10px 30px -12px rgba(0,166,138,0.22)',
        soft: '0 1px 2px rgba(31,41,55,0.04), 0 6px 20px -10px rgba(0,166,138,0.18)',
        float: '0 12px 28px -6px rgba(0,166,138,0.45)',
      },
      backgroundImage: {
        'hero-grad': 'linear-gradient(180deg, #2EE3BF 0%, #00C49E 100%)',
      },
    },
  },
  plugins: [],
}
