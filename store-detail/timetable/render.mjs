// 사용: node render.mjs /abs/path/timetable.html out.png  (Playwright + Chromium, 848px 폭)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const [,, src, out] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 848, height: 800 }, deviceScaleFactor: 1 });
await p.goto('file://' + src); await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: out, fullPage: true }); await b.close();
