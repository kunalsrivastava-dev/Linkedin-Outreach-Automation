import fs from 'fs';
import { PROCESSED_PROFILES_FILE, SEEN_FILE } from '../config/constants.js';
import logger from '../logging/logger.js';

export interface ProfileStatus {
  status: 'SUCCESS' | 'FAILED';
  timestamp: string;
  error?: string;
}

export type ProcessedProfilesMap = Record<string, ProfileStatus>;

/**
 * Loads the map of processed profiles from the json file.
 * Returns an empty map if the file does not exist or is empty.
 */
export function loadProcessedProfiles(): ProcessedProfilesMap {
  if (!fs.existsSync(PROCESSED_PROFILES_FILE)) {
    return {};
  }

  try {
    const fileContent = fs.readFileSync(PROCESSED_PROFILES_FILE, 'utf8');
    if (!fileContent.trim()) {
      return {};
    }
    return JSON.parse(fileContent) as ProcessedProfilesMap;
  } catch (error) {
    logger.error(`Failed to load processed profiles from ${PROCESSED_PROFILES_FILE}:`, error);
    return {};
  }
}

/**
 * Saves the map of processed profiles back to the json file.
 */
function saveProcessedProfiles(map: ProcessedProfilesMap): void {
  try {
    fs.writeFileSync(PROCESSED_PROFILES_FILE, JSON.stringify(map, null, 2), 'utf8');
  } catch (error) {
    logger.error(`Failed to save processed profiles to ${PROCESSED_PROFILES_FILE}:`, error);
  }
}

/**
 * Checks if a username has already been successfully processed.
 */
export function isProfileSuccess(username: string): boolean {
  const map = loadProcessedProfiles();
  return map[username]?.status === 'SUCCESS';
}

/**
 * Marks a profile's connection attempt as SUCCESS.
 */
export function markProfileSuccess(username: string): void {
  const map = loadProcessedProfiles();
  map[username] = {
    status: 'SUCCESS',
    timestamp: new Date().toISOString(),
  };
  saveProcessedProfiles(map);
  addToSeenProfiles(username);
}

/**
 * Marks a profile's connection attempt as FAILED, saving the error message.
 */ 
export function markProfileFailed(username: string, errorMessage: string): void {
  const map = loadProcessedProfiles();
  map[username] = {
    status: 'FAILED',
    timestamp: new Date().toISOString(),
    error: errorMessage,
  };
  saveProcessedProfiles(map);
}

/**
 * Loads the list of seen profiles (already reached out).
 * Returns an empty array if the file does not exist or is empty.
 */
export function loadSeenProfiles(): string[] {
  if (!fs.existsSync(SEEN_FILE)) {
    return [];
  }
  try {
    const fileContent = fs.readFileSync(SEEN_FILE, 'utf8');
    if (!fileContent.trim()) {
      return [];
    }
    const parsed = JSON.parse(fileContent);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    logger.error(`Failed to load seen profiles from ${SEEN_FILE}:`, error);
    return [];
  }
}

/**
 * Adds a profile's username to the seen profiles list.
 */
export function addToSeenProfiles(username: string): void {
  const seen = loadSeenProfiles();
  if (!seen.includes(username)) {
    seen.push(username);
    try {
      fs.writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2), 'utf8');
    } catch (error) {
      logger.error(`Failed to save seen profiles to ${SEEN_FILE}:`, error);
    }
  }
}

/**
 * Checks if a profile has already been reached out to (is present in seen.json).
 */
export function isProfileSeen(username: string): boolean {
  const seen = loadSeenProfiles();
  return seen.includes(username);
}

