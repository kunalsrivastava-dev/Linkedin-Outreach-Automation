import readline from 'readline';
import { Writable } from 'stream';

/**
 * Prompts the user for their LinkedIn username (email or phone number).
 */
export function promptUsername(): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter LinkedIn Username (Email/Phone): ', (username) => {
      rl.close();
      resolve(username.trim());
    });
  });
}

/**
 * Prompts the user for their LinkedIn password, masking/hiding the input in the terminal.
 */
export function promptPassword(): Promise<string> {
  return new Promise((resolve) => {
    const mutableStdout = new Writable({
      write: function (chunk, encoding, callback) {
        if (!(this as any).muted) {
          process.stdout.write(chunk, encoding);
        }
        callback();
      },
    });
    (mutableStdout as any).muted = false;

    const rl = readline.createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal: true,
    });

    process.stdout.write('Enter LinkedIn Password: ');
    (mutableStdout as any).muted = true;

    rl.question('', (password) => {
      (mutableStdout as any).muted = false;
      process.stdout.write('\n');
      rl.close();
      resolve(password);
    });
  });
}

/**
 * Prompts the user in the CLI to manually solve a challenge/block and press Enter to resume,
 * or type 'skip' to skip processing the profile.
 * 
 * @param reason The error message or issue description.
 */
export function promptResumeOrSkip(reason: string): Promise<'resume' | 'skip'> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\x1b[33m'); // Yellow text color
    console.log('============================================================');
    console.log('                 MANUAL INTERVENTION REQUIRED               ');
    console.log(`Reason: ${reason}`);
    console.log('Please resolve this manually in the open browser window.    ');
    console.log('Once resolved, press ENTER in the terminal to retry/resume. ');
    console.log('Or type "skip" and press ENTER to skip this profile.        ');
    console.log('============================================================');
    console.log('\x1b[0m'); // Reset text color

    rl.question('Action (Press ENTER to retry, or type "skip"): ', (answer) => {
      rl.close();
      const cleanAnswer = answer.trim().toLowerCase();
      if (cleanAnswer === 'skip') {
        resolve('skip');
      } else {
        resolve('resume');
      }
    });
  });
}

