import { runOrchestration } from './automation/orchestrator.js';
import logger from './logging/logger.js';

async function main() {
  try {
    await runOrchestration();
  } catch (error) {
    logger.error('Fatal crash during execution entry:', error);
    process.exit(1);
  }
}

main();
