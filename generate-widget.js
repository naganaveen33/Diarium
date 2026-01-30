const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 560 });
  await page.goto('https://naganaveen33.github.io/Diarium/widget.html', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'widget.png' });
  await browser.close();
  console.log("Screenshot saved as widget.png");
})();
