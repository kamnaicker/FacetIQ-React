const key = "facetiq.accessToken";

/**
 * Only the access token is kept, and only in localStorage. The refresh token the API issues is
 * deliberately discarded: a long lived credential is the one worth stealing, and signing in again
 * after an hour is a fair price for never storing it.
 *
 * localStorage over memory so a page refresh does not sign the user out. Both are readable by any
 * script on the page, so the real protection is not storing the refresh token and keeping the
 * access token short lived.
 */
export function getToken(): string | null {
  return localStorage.getItem(key);
}

export function setToken(token: string): void {
  localStorage.setItem(key, token);
}

export function clearToken(): void {
  localStorage.removeItem(key);
}
