import { chromium } from 'playwright';
import { SESSIONS_DIR } from './config/constants.js';

async function main() {
  console.log('Launching browser...');
  const context = await chromium.launchPersistentContext(SESSIONS_DIR, { headless: false });
  const page = await context.newPage();

  const profileUrl = 'https://www.linkedin.com/in/kunal-srivastava-9a8758258/';
  await page.goto(profileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  console.log('--- FINDING THE BLUE CONNECT BUTTON ---');

  // Let's search for buttons on the page with text Connect
  const buttons = page.locator('button');
  const count = await buttons.count();
  console.log(`Found ${count} total <button> tags.`);

  for (let i = 0; i < count; i++) {
    const btn = buttons.nth(i);
    const isVis = await btn.isVisible().catch(() => false);
    const text = (await btn.innerText().catch(() => '')).replace(/\n/g, ' ').trim();
    const className = await btn.getAttribute('class').catch(() => '');
    const ariaLabel = await btn.getAttribute('aria-label').catch(() => '');
    
    if (text.includes('Connect') || (ariaLabel && ariaLabel.includes('Connect'))) {
      console.log(`Button ${i}: visible=${isVis} text="${text}" aria-label="${ariaLabel}" class="${className}"`);
    }
  }

  // Also search for any element with artdeco-button--primary or primary class
  const primaryButtons = page.locator('.artdeco-button--primary, button[class*="primary"], [class*="artdeco-button--primary"]');
  const pCount = await primaryButtons.count();
  console.log(`Found ${pCount} primary buttons.`);
  for (let i = 0; i < pCount; i++) {
    const pBtn = primaryButtons.nth(i);
    const isVis = await pBtn.isVisible().catch(() => false);
    const text = (await pBtn.innerText().catch(() => '')).replace(/\n/g, ' ').trim();
    const tag = await pBtn.evaluate(node => node.tagName).catch(() => '');
    console.log(`Primary Button ${i}: tag=${tag} visible=${isVis} text="${text}"`);
  }

  await context.close();
}

main().catch(console.error);
