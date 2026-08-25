import logger from '../logging/logger.js';

/**
 * Retries an asynchronous function a specified number of times with a delay.
 * 
 * @param fn Async function to execute
 * @param retries Number of retry attempts (default 3)
 * @param delay Delay between attempts in milliseconds (default 2000)
 * @param contextStr Description of the operation for logging purposes
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 2000,
  contextStr = 'operation'
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        logger.warn(`Retry ${i + 1}/${retries} failed for ${contextStr}. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}
