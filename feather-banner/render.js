// 미리보기 PNG + 인쇄용 벡터 PDF(600x2600mm, 폰트 임베드) + 목업 PNG 렌더
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 600, height: 2600 }, deviceScaleFactor: 2 });
  for (const n of ['green', 'sky', 'orange']) {
    const url = 'file://' + path.join(__dirname, `flag-${n}.svg`);
    await page.goto(url); await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await page.pdf({ path: path.join(__dirname, `out/flag-${n}.pdf`), width: '600mm', height: '2600mm', printBackground: true, pageRanges: '1' });
    // 미리보기는 viewBox 기준(600x2600px) x2 로 축소 렌더
    await page.evaluate(() => { const s = document.documentElement; s.setAttribute('width', '600'); s.setAttribute('height', '2600'); });
    await page.screenshot({ path: path.join(__dirname, `out/flag-${n}.png`), omitBackground: true });
  }
  const m = await browser.newPage({ viewport: { width: 1400, height: 1500 } });
  await m.goto('file://' + path.join(__dirname, 'mockup.html'));
  await m.waitForTimeout(1200);
  await m.screenshot({ path: path.join(__dirname, 'out/mockup.png') });
  await browser.close();
})();
