/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#1EC97E',
        deep: '#0B9659',
        mint: '#E9FAF2',
        sun: '#FFD64A',
        ink: '#1F2937',
        sub: '#6B7280',
        line: '#E6EFE9',
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '22px', tile: '18px' },
      boxShadow: {
        card: '0 10px 30px -12px rgba(11,150,89,0.22)',
        soft: '0 1px 2px rgba(31,41,55,0.04), 0 6px 20px -10px rgba(11,150,89,0.18)',
        float: '0 12px 28px -6px rgba(11,150,89,0.45)',
      },
      backgroundImage: {
        'hero-grad': 'linear-gradient(180deg, #43E09A 0%, #0FB267 100%)',
      },
    },
  },
  plugins: [],
}
