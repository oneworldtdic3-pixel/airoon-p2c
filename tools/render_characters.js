// Renders assets/characters/svg/*.svg -> png/ (transparent, 1024) and a character sheet.
// Usage: node tools/render_characters.js   (needs the `playwright` package)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const sub = process.argv[2] || '';
const root = path.join(__dirname, '..', 'assets', 'characters', sub);
const names = [
  ['sansa-cat', '산사', 'Sansa · 고양이'],
  ['dongeul-monk', '동글스님', 'Dongeul · 동자승'],
  ['daram-squirrel', '다람이', 'Daram · 다람쥐'],
  ['tori-acorn', '토리', 'Tori · 도토리'],
  ['bami-owl', '밤이', 'Bami · 부엉이'],
  ['dungsil-balloon', '둥실이', 'Dungsil · 열기구'],
];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  for (const [file] of names) {
    const svg = fs.readFileSync(path.join(root, 'svg', file + '.svg'), 'utf8');
    await page.setContent(`<body style="margin:0;background:transparent">${svg}</body>`);
    await page.screenshot({ path: path.join(root, 'png', file + '.png'), omitBackground: true,
      clip: { x: 0, y: 0, width: 1024, height: 1024 } });
  }
  const cards = names.map(([f, ko, en]) => {
    const svg = fs.readFileSync(path.join(root, 'svg', f + '.svg'), 'utf8')
      .replace('width="1024" height="1024"', 'width="100%" height="100%"');
    return `<figure><div class="art">${svg}</div><figcaption><b>${ko}</b><span>${en}</span></figcaption></figure>`;
  }).join('');
  const html = `<style>
    body{margin:0;background:#FAF9F4;font-family:'WenQuanYi Zen Hei','Unifont-JP',sans-serif;color:#2A1A10}
    h1{margin:0;padding:56px 0 0;text-align:center;font-size:44px}
    p{margin:8px 0 0;text-align:center;color:#8a7a68;font-size:20px}
    .grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px 24px;padding:24px 64px 64px}
    figure{margin:0;grid-column:span 2;text-align:center}
    /* 6 figures: 3 per row */
    .art{aspect-ratio:1}
    figcaption b{display:block;font-size:34px}
    figcaption span{font-size:18px;color:#8a7a68}
  </style><h1>사이버 산사캠프 캐릭터</h1><p>Cyber Sansa Camp · character set ${sub || 'v1'}</p><div class="grid">${cards}</div>`;
  const sheet = await browser.newPage({ viewport: { width: 1800, height: 1300 } });
  await sheet.setContent(html);
  await sheet.screenshot({ path: path.join(root, 'character-sheet.png'), fullPage: true });
  await browser.close();
})();
