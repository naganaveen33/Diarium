const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    viewport: { width: 450, height: 600 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2
  });
  
  const page = await context.newPage();
  await page.goto('https://naganaveen33.github.io/Diarium/widget.html');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'widget.png' });
  await browser.close();
})();
