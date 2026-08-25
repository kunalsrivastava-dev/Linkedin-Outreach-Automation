import { getEnvConfig } from '../config/env.js';
import { launchBrowser } from '../linkedin/browser.js';
import { ensureAuthenticated } from '../auth/login.js';
import { loadMessageRecords } from '../input/json.js';
import { isProfileSuccess, isProfileSeen } from '../tracking/processedProfiles.js';
import { runProfileWorkflow } from './workflow.js';
import logger from '../logging/logger.js';

/**
 * Runs the complete batch automation orchestration workflow.
 */
export async function runOrchestration(): Promise<void> {
  logger.divider();
  console.log('     LinkedIn Connection Automation');
  logger.divider();
  console.log('');

  // 1. Load Configurations
  const config = await getEnvConfig();

  // 2. Load Input Source
  let records;
  try {
    records = loadMessageRecords();
  } catch (error: any) {
    logger.error('Failed to load connection data:', error);
    return;
  }

  if (records.length === 0) {
    logger.warn('No profiles found to process. Exiting.');
    return;
  }

  console.log('');
  logger.info(`Found ${records.length} profiles.`);
  console.log('');

  // 3. Launch Persistent Playwright Browser
  let context;
  try {
    context = await launchBrowser(config);
  } catch (error: any) {
    logger.error('Failed to launch Playwright browser context:', error);
    return;
  }

  try {
    const page = await context.newPage();

    // 4. Ensure Authenticated
    await ensureAuthenticated(page, config);

    let successful = 0;
    let failed = 0;
    let skipped = 0;

    // 5. Sequential Profile Processing Loop
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const indexStr = `[${i + 1}/${records.length}]`;
      
      console.log('');
      logger.info(`${indexStr} Processing user: ${record.username}`);

      // Check if already successfully processed or seen
      if (isProfileSuccess(record.username) || isProfileSeen(record.username)) {
        logger.info(`Status: SKIPPED (Already successfully processed or reached out)`);
        skipped++;
        continue;
      }

      // Execute Connection Workflow
      const result = await runProfileWorkflow(page, record);

      if (result.success) {
        successful++;
      } else {
        failed++;
        logger.info('Continuing...');
      }

      // Human-like pause between profiles to stay within limits and avoid triggers
      if (i < records.length - 1) {
        const pauseTime = Math.floor(Math.random() * 4000) + 4000; // 4 to 8 second random pause
        logger.info(`Waiting ${pauseTime / 1000}s before next profile...`);
        await page.waitForTimeout(pauseTime);
      }
    }

    // 6. Output Summary Report
    console.log('');
    logger.divider();
    console.log('             BATCH SUMMARY');
    logger.divider();
    console.log(`Total:       ${records.length}`);
    console.log(`Successful:  ${successful}`);
    console.log(`Failed:      ${failed}`);
    console.log(`Skipped:     ${skipped}`);
    logger.divider();
    console.log('');

  } catch (error: any) {
    logger.error('An unexpected orchestrator error occurred:', error);
  } finally {
    logger.info('Closing browser and cleaning up...');
    try {
      await context.close();
      logger.success('Browser context closed successfully.');
    } catch (closeError: any) {
      logger.error('Failed to close browser context:', closeError);
    }
    logger.close();
  }
}
