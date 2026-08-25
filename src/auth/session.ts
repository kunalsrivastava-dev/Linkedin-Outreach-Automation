import fs from 'fs';
import { SESSIONS_DIR } from '../config/constants.js';

/**
 * Checks whether the session directory exists and contains data,
 * suggesting a saved persistent browser session is present.
 */
export function hasSavedSession(): boolean {
  if (!fs.existsSync(SESSIONS_DIR)) {
    return false;
  }
  try {
    const files = fs.readdirSync(SESSIONS_DIR);
    // If files are present in the persistent context directory, we assume a session exists
    return files.length > 0;
  } catch {
    return false;
  }
}
