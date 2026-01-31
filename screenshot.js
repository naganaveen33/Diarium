const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Let page load first to get natural size
  await page.goto('https://naganaveen33.github.io/Diarium/widget.html');
  await page.waitForTimeout(3000);
  
  // Get the actual content height
  const dimensions = await page.evaluate(() => {
    const width = 900; // Fixed width
    const height = document.body.scrollHeight; // Auto height
    return { width, height };
  });
  
  await page.setViewportSize(dimensions);
  await page.screenshot({ path: 'widget.png', fullPage: true });
  await browser.close();
})();
