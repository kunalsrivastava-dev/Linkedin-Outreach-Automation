# LinkedIn Connection Automation

A modular, robust Node.js + TypeScript + Playwright LinkedIn connection automation system. The tool sequentially visits LinkedIn profiles, clicks "Connect", and adds a personalized invitation note.

## Features

- **Persistent Playwright Session:** Saves session details under `sessions/linkedin/`, preventing login checks and verification requests on future runs.
- **Robust Selector Strategy:** Relies on user-facing accessible roles, labels, and text patterns rather than brittle CSS or DOM classes.
- **Automated Verification Intercept:** Automatically pauses execution and alerts you when a security verification page (OTP, captcha, email pin) appears. The automation automatically resumes once you complete the security prompt in the browser.
- **Progress Tracking:** Tracks connection history in `processed_profiles.json` to skip successfully connected profiles and only retry failures.
- **Defensive Error Handling:** Saves failure logs in `logs/linkedin.log` and failure screenshots in `screenshots/linkedin/` without breaking the entire batch.

## Directory Structure

```text
linkedin-automation/
│
├── data/
│   ├── messages.json             # Input profiles and custom notes
│   ├── processed_profiles.json   # Connection outcome history
│   └── seen.json                 # Reached out profiles tracking list
│
├── sessions/
│   └── linkedin/             # Persistent browser session cache
│
├── screenshots/
│   └── linkedin/             # Failure screenshots
│
├── logs/
│   └── linkedin.log          # Detailed execution logs
│
├── src/
│   ├── config/
│   │   ├── env.ts            # Env parsing and CLI prompts
│   │   └── constants.ts      # Paths and settings
│   │
│   ├── auth/
│   │   ├── login.ts          # Core authentication checks & forms
│   │   ├── session.ts        # Browser session status
│   │   └── auth.types.ts
│   │
│   ├── linkedin/
│   │   ├── browser.ts        # Browser launching wrapper
│   │   ├── profile.ts        # Profile page navigation & checks
│   │   ├── connection.ts     # Invitation modal flow & selectors
│   │   └── selectors.ts      # Centralized page selectors
│   │
│   ├── automation/
│   │   ├── orchestrator.ts   # Runs batch list sequentially
│   │   ├── workflow.ts       # Runs single connection transaction
│   │   └── retry.ts          # Resiliency helpers
│   │
│   ├── input/
│   │   ├── prompts.ts        # Terminal CLI inputs
│   │   └── json.ts           # messages.json validation
│   │
│   ├── tracking/
│   │   └── processedProfiles.ts
│   │
│   ├── logging/
│   │   ├── logger.ts
│   │   └── screenshots.ts
│   │
│   └── index.ts              # Entry point
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Setup & Configuration

### 1. Installation
Install project dependencies and browser binaries:
```bash
npm install
npx playwright install chromium
```

### 2. Configure Credentials
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your details:
```env
LINKEDIN_USERNAME=your.email@example.com
LINKEDIN_PASSWORD=yourpassword
HEADLESS=false
```
*Note: If credentials are left blank, the application will securely prompt you in the terminal at startup.*

### 3. Create Input Profile Data
Format your profile targets inside `data/messages.json`. For example:
```json
[
  {
    "username": "creator1",
    "url": "https://www.linkedin.com/in/creator1/",
    "message": "Hi, I'd love to connect with you."
  },
  {
    "username": "creator2",
    "url": "https://www.linkedin.com/in/creator2/",
    "message": "Hi, I came across your profile and would love to connect."
  }
]
```

## Running the Automation

To start the script:
```bash
npm run dev
```

### Workflow

1. Loads credentials from `.env` or asks for them via the CLI terminal.
2. Reads and validates `data/messages.json`.
3. Opens a persistent Playwright browser (headful mode recommended).
4. Verifies whether you are already logged in:
   - If not logged in, fills the credentials and clicks sign in.
   - If a security check is triggered, the program outputs a notice in the terminal and waits. Once you finish verification inside the browser window, it resumes.
5. Begins processing profiles sequentially:
   - Skips profiles that have already been marked as `SUCCESS` in `processed_profiles.json`.
   - Opens the profile URL.
   - Searches for the `Connect` button (directly or under the `More` menu).
   - If already connected/pending, marks as skipped or success.
   - Clicks `Connect`, types the message, and hits `Send`.
   - On success, marks status as `SUCCESS`.
   - On error, takes a failure screenshot under `screenshots/linkedin/`, logs to `logs/linkedin.log`, marks status as `FAILED`, and continues to the next profile.
6. Prints a final execution summary report and closes the browser context.

## Disclaimer & LinkedIn Automation Safety

- **Rate Limits & Anti-Bot Systems:** LinkedIn strictly monitors for repetitive and fast-paced automated behavior. 
- **Action Intervals:** The orchestrator implements dynamic human-like pauses (4-8 seconds) between actions to keep navigation patterns natural.
- **Invitation Caps:** LinkedIn imposes weekly limits on connection requests. If the script encounters an error like "You've reached your weekly limit", it will mark the attempt as `FAILED` and log the error.
