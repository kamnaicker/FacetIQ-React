const key = "facetiq-guide";

/** Shown until the person turns it off. A blocked store shows it on every visit. */
export function guideShown(): boolean {
  try {
    return localStorage.getItem(key) !== "hidden";
  } catch {
    return true;
  }
}

export function setGuideShown(shown: boolean) {
  try {
    if (shown) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, "hidden");
    }
  } catch {
    // A blocked store only costs the choice on the next visit.
  }
}
