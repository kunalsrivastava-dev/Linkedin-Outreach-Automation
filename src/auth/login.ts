import { Page } from 'playwright';
import { EnvConfig } from '../config/env.js';
import { SELECTORS } from '../linkedin/selectors.js';
import logger from '../logging/logger.js';

/**
 * Checks whether the browser is currently authenticated with LinkedIn.
 * Looks for the presence of the global navigation bar.
 */
export async function checkAuthenticated(page: Page): Promise<boolean> {
  try {
    // Wait for either the global navigation bar (authenticated) or the login input (unauthenticated)
    await Promise.race([
      page.locator(SELECTORS.auth.globalNav).first().waitFor({ state: 'visible', timeout: 5000 }),
      page.locator(SELECTORS.login.usernameInput).first().waitFor({ state: 'visible', timeout: 5000 }),
    ]);

    // Check if global navigation is visible
    return await page.locator(SELECTORS.auth.globalNav).first().isVisible();
  } catch {
    // If neither is found or timed out, check current URL
    const url = page.url();
    return url.includes('/feed') || url.includes('/mynetwork');
  }
}

/**
 * Ensures the Playwright browser is authenticated.
 * Performs login using credentials, and handles manual OTP/verification challenge pauses.
 */
export async function ensureAuthenticated(page: Page, config: EnvConfig): Promise<void> {
  logger.info('Checking authentication status...');
  
  // Go to LinkedIn feed with retry on temporary network hiccups
  let navSuccess = false;
  for (let i = 0; i < 3; i++) {
    try {
      await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 30000 });
      navSuccess = true;
      break;
    } catch (e: any) {
      logger.warn(`Navigation to LinkedIn feed encountered an issue (${e.message}). Retrying in 2 seconds (attempt ${i + 1}/3)...`);
      await page.waitForTimeout(2000);
    }
  }

  if (!navSuccess) {
    throw new Error('Unable to connect to LinkedIn. Please verify your internet connection, VPN, or firewall settings.');
  }

  let authenticated = await checkAuthenticated(page);
  if (authenticated) {
    logger.success('LinkedIn session authenticated (reused saved session)');
    return;
  }

  logger.info('Not authenticated. Navigating to login page...');
  await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Fill in credentials
  logger.info('Filling credentials...');
  await page.locator(SELECTORS.login.usernameInput).first().fill(config.linkedinUsername);
  await page.locator(SELECTORS.login.passwordInput).first().fill(config.linkedinPassword);

  // Click submit
  logger.info('Submitting login form...');
  await page.locator(SELECTORS.login.submitButton).first().click();

  // Wait to see if we navigate successfully or hit a verification challenge
  await page.waitForTimeout(5000);

  // Check state again
  authenticated = await checkAuthenticated(page);
  if (authenticated) {
    logger.success('Successfully logged in using provided credentials.');
    return;
  }

  // Detect if checkpoint or verification is required
  const currentUrl = page.url();
  const requiresVerification = currentUrl.includes('/checkpoint/') || 
                               currentUrl.includes('/security') ||
                               await page.locator('input[name="pin"]').isVisible().catch(() => false);

  if (requiresVerification || !authenticated) {
    logger.warn('============================================================');
    logger.warn('          SECURITY CHALLENGE / VERIFICATION REQUIRED        ');
    logger.warn('Please complete the verification (OTP / CAPTCHA / Security) ');
    logger.warn('manually in the browser window.                             ');
    logger.warn('The automation will resume automatically once you log in.  ');
    logger.warn('============================================================');

    // Poll until authenticated
    let pollAttempts = 0;
    while (!authenticated) {
      pollAttempts++;
      if (pollAttempts % 10 === 0) {
        logger.info('Still waiting for manual authentication to complete...');
      }
      await page.waitForTimeout(2000);
      authenticated = await checkAuthenticated(page);
    }

    logger.success('Verification complete. Authentication successful!');
  }
}
