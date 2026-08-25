import fs from 'fs';
import path from 'path';
import { Page } from 'playwright';
import { SCREENSHOTS_DIR } from '../config/constants.js';
import logger from './logger.js';

// Ensure the screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Captures a screenshot of the current page state, saved inside screenshots/linkedin/
 * Named as <username>_<timestamp>.png.
 * 
 * @param page Playwright Page instance
 * @param username The username/identifier of the profile being processed
 * @returns The absolute path of the saved screenshot
 */
export async function takeFailureScreenshot(page: Page, username: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${username}_${timestamp}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);

  try {
    await page.screenshot({ path: filepath, fullPage: true });
    logger.info(`Screenshot saved to: ${filepath}`);
    return filepath;
  } catch (error) {
    logger.error(`Failed to take screenshot for ${username}:`, error);
    return '';
  }
}
