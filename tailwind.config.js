/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#35D6BD',
        deep: '#0AA7A7',
        mint: '#E8FAF4',
        sun: '#FFD64A',
        ink: '#1F2937',
        sub: '#6B7280',
        line: '#DDF3EE',
        sky: '#5BC8F5',
        ember: '#F0552A',
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '22px', tile: '18px' },
      boxShadow: {
        card: '0 10px 30px -12px rgba(5,199,199,0.22)',
        soft: '0 1px 2px rgba(31,41,55,0.04), 0 6px 20px -10px rgba(5,199,199,0.18)',
        float: '0 12px 28px -6px rgba(5,199,199,0.45)',
      },
      backgroundImage: {
        'hero-grad': 'linear-gradient(180deg, #72E1B8 0%, #35D6BD 50%, #05C7C7 100%)',
        'brand-grad': 'linear-gradient(160deg, #72E1B8 0%, #35D6BD 50%, #05C7C7 100%)',
        'btn-grad': 'linear-gradient(135deg, #35D6BD 0%, #05C7C7 100%)',
      },
    },
  },
  plugins: [],
}
