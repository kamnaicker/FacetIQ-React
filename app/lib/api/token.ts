const key = "facetiq.session";

type Session = { token: string; expiresAt: number };

/**
 * Only the access token is kept, and only in localStorage. The refresh token the API issues is
 * deliberately discarded: a long lived credential is the one worth stealing, and signing in again
 * after an hour is a fair price for never storing it.
 *
 * localStorage over memory so a page refresh does not sign the user out. Both are readable by any
 * script on the page, so the real protection is not storing the refresh token and keeping the
 * access token short lived.
 *
 * The expiry is stored beside the token so the client can tell a session has ended before the
 * API does, and send the person to sign in instead of letting a screen half load and then fail.
 */
export function getToken(): string | null {
  const session = read();

  if (session === null) {
    return null;
  }

  if (Date.now() >= session.expiresAt) {
    clearToken();
    return null;
  }

  return session.token;
}

export function setToken(token: string, expiresInSeconds: number): void {
  const session: Session = { token, expiresAt: Date.now() + expiresInSeconds * 1000 };

  localStorage.setItem(key, JSON.stringify(session));
}

export function clearToken(): void {
  localStorage.removeItem(key);
}

function read(): Session | null {
  const raw = localStorage.getItem(key);

  if (raw === null) {
    return null;
  }

  try {
    return JSON.parse(raw) as Session;
  } catch {
    clearToken();
    return null;
  }
}
