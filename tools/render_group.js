// Renders assets/characters/v3/group/group-photo.svg -> group-photo.png (2400x1200).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'assets', 'characters', 'v3', 'group');
(async () => {
  const svg = fs.readFileSync(path.join(dir, 'group-photo.svg'), 'utf8');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2400, height: 1200 } });
  await page.setContent(`<body style="margin:0">${svg}</body>`);
  await page.screenshot({ path: path.join(dir, 'group-photo.png'), clip: { x: 0, y: 0, width: 2400, height: 1200 } });
  await browser.close();
  console.log('rendered group-photo.png');
})();
