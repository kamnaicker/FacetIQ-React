export type Theme = "light" | "dark";

const key = "facetiq-theme";

/** Runs in the document head before paint, so a stored choice never flashes the other scheme. */
export const themeScript = `
  (function () {
    try {
      var theme = localStorage.getItem("${key}");

      if (theme === "light" || theme === "dark") {
        document.documentElement.dataset.theme = theme;
      }
    } catch {
    }
  })();
`;

export function currentTheme(): Theme {
  const stored = document.documentElement.dataset.theme;

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// The transition attribute is removed once the fade is over. Left on, it would slow every hover.
export function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.dataset.themeChanging = "";
  root.dataset.theme = theme;

  window.setTimeout(() => delete root.dataset.themeChanging, 300);

  try {
    localStorage.setItem(key, theme);
  } catch {
    // A blocked store only costs the choice on the next visit.
  }
}
