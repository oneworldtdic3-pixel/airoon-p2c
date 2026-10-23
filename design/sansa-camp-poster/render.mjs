// Renders index.html to poster.pdf (single page, 1080px wide, height fitted to content) and poster.png.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1800 }, deviceScaleFactor: 2 });
await page.goto('file://' + path.join(dir, 'index.html'), { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const height = await page.evaluate(() => Math.ceil(document.querySelector('.poster').getBoundingClientRect().height));
console.log('poster height:', height);

await page.screenshot({ path: path.join(dir, 'poster.png'), fullPage: true });
await page.pdf({ path: path.join(dir, 'poster.pdf'), width: '1080px', height: `${height}px`, printBackground: true, pageRanges: '1' });
await browser.close();
