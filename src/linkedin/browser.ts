import { chromium, BrowserContext } from 'playwright';
import { EnvConfig } from '../config/env.js';
import { SESSIONS_DIR } from '../config/constants.js';
import logger from '../logging/logger.js';

/**
 * Launches a persistent Playwright browser context using the Chromium engine.
 * The session state (cookies, local storage, cache) is persisted to the sessions/linkedin/ directory.
 * 
 * @param config Environment configurations containing headless preference.
 * @returns Playwright BrowserContext instance.
 */
export async function launchBrowser(config: EnvConfig): Promise<BrowserContext> {
  logger.info('Launching Playwright Chromium browser...');

  const context = await chromium.launchPersistentContext(SESSIONS_DIR, {
    headless: config.headless,
    viewport: { width: 1280, height: 800 },
    // Use a standard human user agent to increase compatibility
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    // Arguments to prevent automation flags and sandbox issues
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  // Set timeouts on the context
  context.setDefaultNavigationTimeout(30000);
  context.setDefaultTimeout(10000);

  logger.success('Browser started');
  return context;
}
