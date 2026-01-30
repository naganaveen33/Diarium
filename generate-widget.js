const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport size if needed
  await page.setViewportSize({ width: 1280, height: 720 });
  
  // Navigate to your URL
  await page.goto('https://naganaveen33.github.io/Diarium/widget.html', {
    waitUntil: 'networkidle'
  });

  // Take the screenshot and save it as widget.png
  await page.screenshot({ path: 'widget.png' });

  await browser.close();
})();
