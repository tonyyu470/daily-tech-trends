/**
 * HTML → PNG 批量截图脚本
 * 用法: node screenshot.js [目录路径]
 * 默认处理当前目录下所有 .html 文件
 */
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const TARGET_DIR = process.argv[2] || process.cwd();
const VIEWPORT = { width: 1080, height: 1350, deviceScaleFactor: 2 };

const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
];

function findChrome() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('未找到 Chrome，请安装 Google Chrome 或设置 CHROME_PATH 环境变量');
}

(async () => {
  const executablePath = process.env.CHROME_PATH || findChrome();
  console.log(`使用浏览器: ${executablePath}`);

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  const htmlFiles = fs.readdirSync(TARGET_DIR)
    .filter(f => f.endsWith('.html') && f !== 'screenshot.js')
    .sort();

  if (htmlFiles.length === 0) {
    console.log('未找到 HTML 文件');
    await browser.close();
    return;
  }

  for (const file of htmlFiles) {
    const htmlPath = path.resolve(TARGET_DIR, file);
    const pngPath = htmlPath.replace(/\.html$/, '.png');

    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: pngPath });

    const name = path.basename(pngPath);
    console.log(`✓ ${name} (${VIEWPORT.width * VIEWPORT.deviceScaleFactor}×${VIEWPORT.height * VIEWPORT.deviceScaleFactor}px @${VIEWPORT.deviceScaleFactor}x)`);
  }

  await browser.close();
  console.log(`\n完成！${htmlFiles.length} 张图片已保存到 ${TARGET_DIR}`);
})();
