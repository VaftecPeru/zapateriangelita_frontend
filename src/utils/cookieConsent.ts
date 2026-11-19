const key = 'angelita-cookie-preferences-v1';
let current: boolean | null | undefined;

export function readCookieConsent(): boolean | null {
  if (current !== undefined) return current;
  try {
    const choice = localStorage.getItem(key);
    return choice === 'accept' ? true : choice === 'reject' ? false : null;
  } catch {
    return null;
  }
}

export function saveCookieConsent(analytics: boolean) {
  current = analytics;
  try {
    localStorage.setItem(key, analytics ? 'accept' : 'reject');
  } catch {
    // Keep the current choice for this visit when storage is unavailable.
  }
}
