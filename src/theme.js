// Theme preference. Three modes: "light", "dark", and "system" (follow the
// operating system). The preference is stored under STORAGE_KEY. Nothing
// here touches the DOM at import time, so Node can import it for tests.

export const STORAGE_KEY = "tabby-theme";
export const SYSTEM = "system";
export const MODES = ["light", "dark", SYSTEM];

// Only an explicit light or dark choice is returned. Anything else,
// including a corrupt stored value, means "follow the system".
export function normaliseMode(stored) {
  return stored === "light" || stored === "dark" ? stored : SYSTEM;
}

// The stored mode decides which theme applies. "system" (and anything
// unknown) defers to the OS preference.
export function resolveTheme(stored, prefersDark) {
  const mode = normaliseMode(stored);
  if (mode !== SYSTEM) return mode;
  return prefersDark ? "dark" : "light";
}

// Apply a mode to the document. In system mode the data-theme attribute is
// removed rather than written with the resolved value, so the page keeps
// following the OS after load (the stylesheet's media query decides).
export function applyMode(document, mode) {
  if (mode === "light" || mode === "dark") {
    document.documentElement.setAttribute("data-theme", mode);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

// Wire the select and the OS preference to the document. Every dependency
// is injectable so this can be tested without a real browser.
export function initTheme({ document, storage, matchMedia }) {
  const select = document.querySelector("#theme");
  const media = matchMedia("(prefers-color-scheme: dark)");

  function readStored() {
    try {
      return storage ? storage.getItem(STORAGE_KEY) : null;
    } catch {
      return null;
    }
  }

  function writeStored(mode) {
    try {
      if (!storage) return;
      if (mode === SYSTEM) storage.removeItem(STORAGE_KEY);
      else storage.setItem(STORAGE_KEY, mode);
    } catch {
      // Storage blocked or full: the choice applies until reload.
    }
  }

  function currentMode() {
    return normaliseMode(readStored());
  }

  function show(mode) {
    applyMode(document, mode);
    if (select) select.value = mode;
  }

  show(currentMode());

  if (select) {
    select.addEventListener("change", () => {
      const mode = normaliseMode(select.value);
      writeStored(mode);
      show(mode);
    });
  }

  // A live OS switch repaints only while the page follows the system.
  media.addEventListener?.("change", () => {
    if (currentMode() === SYSTEM) applyMode(document, SYSTEM);
  });

  return { mode: currentMode, refresh: () => show(currentMode()) };
}
