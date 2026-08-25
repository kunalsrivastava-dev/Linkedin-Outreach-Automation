export interface AuthStatus {
  isAuthenticated: boolean;
  requiresChallenge: boolean;
  challengeType?: 'otp' | 'captcha' | 'unknown';
}
