const key = "facetiq-registration";

export type PendingRegistration = { registrationId: string; email: string; lastSentAt: number };

/** Kept so a refresh on the code screen does not lose the attempt. A blocked store starts over. */
export function readRegistration(): PendingRegistration | null {
  try {
    const raw = localStorage.getItem(key);

    return raw === null ? null : (JSON.parse(raw) as PendingRegistration);
  } catch {
    return null;
  }
}

export function saveRegistration(registration: PendingRegistration) {
  try {
    localStorage.setItem(key, JSON.stringify(registration));
  } catch {
    // A blocked store only costs the code screen on a refresh.
  }
}

export function clearRegistration() {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing was stored.
  }
}

/** Calls back when another tab in this browser starts, cancels or finishes a registration. */
export function onRegistrationChange(callback: () => void): () => void {
  function handle(event: StorageEvent) {
    // A null key means the whole store was cleared.
    if (event.key === key || event.key === null) {
      callback();
    }
  }

  window.addEventListener("storage", handle);

  return () => window.removeEventListener("storage", handle);
}
