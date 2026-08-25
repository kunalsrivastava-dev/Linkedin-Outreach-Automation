import dotenv from 'dotenv';
import { promptUsername, promptPassword } from '../input/prompts.js';

dotenv.config();

export interface EnvConfig {
  linkedinUsername: string;
  linkedinPassword: string;
  headless: boolean;
}

let cachedConfig: EnvConfig | null = null;

/**
 * Loads configuration from environment variables (.env) or CLI prompts.
 * Guarantees that credentials will be filled.
 */
export async function getEnvConfig(): Promise<EnvConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  let username = process.env.LINKEDIN_USERNAME || '';
  let password = process.env.LINKEDIN_PASSWORD || '';
  const headless = process.env.HEADLESS === 'true';

  if (!username) {
    console.log('LinkedIn Username not found in .env.');
    username = await promptUsername();
    while (!username) {
      console.log('Username cannot be empty.');
      username = await promptUsername();
    }
  }

  if (!password) {
    console.log('LinkedIn Password not found in .env.');
    password = await promptPassword();
    while (!password) {
      console.log('Password cannot be empty.');
      password = await promptPassword();
    }
  }

  cachedConfig = {
    linkedinUsername: username,
    linkedinPassword: password,
    headless,
  };

  return cachedConfig;
}
