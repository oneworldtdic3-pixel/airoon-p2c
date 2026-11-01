// Renders assets/characters/v3/variants/svg/*.svg -> png/ and a variants sheet
// (rows = characters, columns = expression/pose variants).
// Usage: node tools/render_variants.js   (needs the `playwright` package)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'assets', 'characters', 'v3', 'variants');
const KO = { 'sansa-cat': '산사', 'dongeul-monk': '동글스님', 'daram-squirrel': '다람이', 'tori-acorn': '토리', 'bami-owl': '밤이', 'dungsil-balloon': '둥실이', 'buddhz-booth': '붓쯔부스' };
const ORDER = Object.keys(KO);
const LABEL = { 'smile--stand': '기본', 'happy--stand': '활짝', 'surprised--stand': '놀람', 'wink--stand': '윙크', 'happy--wave': '손 흔들기', 'happy--jump': '점프' };
const COLS = Object.keys(LABEL);

(async () => {
  fs.mkdirSync(path.join(root, 'png'), { recursive: true });
  const files = fs.readdirSync(path.join(root, 'svg')).filter(f => f.endsWith('.svg')).sort();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  for (const f of files) {
    const svg = fs.readFileSync(path.join(root, 'svg', f), 'utf8');
    await page.setContent(`<body style="margin:0;background:transparent">${svg}</body>`);
    await page.screenshot({ path: path.join(root, 'png', f.replace(/\.svg$/, '.png')), omitBackground: true,
      clip: { x: 0, y: 0, width: 1024, height: 1024 } });
  }
  const cell = (name, v) => {
    const p = path.join(root, 'svg', `${name}--${v}.svg`);
    if (!fs.existsSync(p)) return '<div class="art"></div>';
    const svg = fs.readFileSync(p, 'utf8').replace('width="1024" height="1024"', 'width="100%" height="100%"');
    return `<div class="art">${svg}</div>`;
  };
  const rows = ORDER.map(n => `<div class="rowlabel">${KO[n]}</div>` + COLS.map(v => cell(n, v)).join('')).join('');
  const html = `<style>
    body{margin:0;background:#FAF9F4;font-family:'WenQuanYi Zen Hei','Unifont-JP',sans-serif;color:#2A1A10}
    h1{margin:0;padding:48px 0 0;text-align:center;font-size:40px}
    p{margin:6px 0 0;text-align:center;color:#8a7a68;font-size:18px}
    .grid{display:grid;grid-template-columns:150px repeat(${COLS.length},240px);gap:6px 10px;padding:28px 48px 56px;align-items:center}
    .head{font-size:20px;color:#8a7a68;text-align:center;padding-bottom:4px}
    .rowlabel{font-size:30px;font-weight:bold;text-align:center}
    .art{aspect-ratio:1}
  </style><h1>사이버 산사캠프 캐릭터 · 표정 / 포즈</h1><p>Cyber Sansa Camp · v3 expression &amp; pose sheet</p>
  <div class="grid"><div></div>${COLS.map(v => `<div class="head">${LABEL[v]}</div>`).join('')}${rows}</div>`;
  const sheet = await browser.newPage({ viewport: { width: 150 + COLS.length * 250 + 110, height: 1500 } });
  await sheet.setContent(html);
  await sheet.screenshot({ path: path.join(root, 'variants-sheet.png'), fullPage: true });
  await browser.close();
  console.log(`rendered ${files.length} variants + sheet`);
})();
