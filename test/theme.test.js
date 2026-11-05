import { test } from "node:test";
import assert from "node:assert/strict";
import {
  STORAGE_KEY,
  MODES,
  SYSTEM,
  normaliseMode,
  resolveTheme,
  applyMode,
  initTheme,
} from "../src/theme.js";

// The repository's node:test style is shown by test/split.test.js.

test("normaliseMode keeps only light and dark", () => {
  assert.equal(normaliseMode("light"), "light");
  assert.equal(normaliseMode("dark"), "dark");
  assert.equal(normaliseMode(SYSTEM), SYSTEM);
  assert.deepEqual(MODES, ["light", "dark", "system"]);
});

test("normaliseMode treats missing and unknown values as system", () => {
  for (const bad of [
    undefined,
    null,
    "",
    "Light",
    "DARK",
    " dark",
    "dark ",
    "auto",
    "0",
    0,
    true,
    {},
    ["dark"],
  ]) {
    assert.equal(normaliseMode(bad), SYSTEM, `stored ${JSON.stringify(bad)}`);
  }
});

test("resolveTheme: an explicit choice always wins over the OS", () => {
  assert.equal(resolveTheme("light", false), "light");
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
  assert.equal(resolveTheme("dark", true), "dark");
});

test("resolveTheme: system and unknown values defer to the OS", () => {
  assert.equal(resolveTheme(SYSTEM, true), "dark");
  assert.equal(resolveTheme(SYSTEM, false), "light");
  assert.equal(resolveTheme(null, true), "dark");
  assert.equal(resolveTheme(null, false), "light");
  assert.equal(resolveTheme("garbage", true), "dark");
  assert.equal(resolveTheme("", false), "light");
});

test("resolveTheme covers every stored x prefersDark combination", () => {
  const stored = [undefined, null, "", "system", "light", "dark", "bogus", "Light", "0"];
  const expected = {
    undefined: (p) => (p ? "dark" : "light"),
    null: (p) => (p ? "dark" : "light"),
    "": (p) => (p ? "dark" : "light"),
    system: (p) => (p ? "dark" : "light"),
    light: () => "light",
    dark: () => "dark",
    bogus: (p) => (p ? "dark" : "light"),
    Light: (p) => (p ? "dark" : "light"),
    0: (p) => (p ? "dark" : "light"),
  };
  for (const value of stored) {
    for (const prefersDark of [true, false]) {
      const want = expected[String(value)](prefersDark);
      assert.equal(resolveTheme(value, prefersDark), want, `${String(value)} / ${prefersDark}`);
      assert.ok(want === "light" || want === "dark");
    }
  }
});

// --- a tiny fake DOM, enough for applyMode and initTheme ----------------

function fakeDocument(initial = {}) {
  return {
    documentElement: {
      attributes: { ...initial },
      setAttribute(name, value) {
        this.attributes[name] = value;
      },
      removeAttribute(name) {
        delete this.attributes[name];
      },
      getAttribute(name) {
        return Object.hasOwn(this.attributes, name) ? this.attributes[name] : null;
      },
    },
  };
}

function fakeSelect(value = SYSTEM) {
  const listeners = [];
  return {
    value,
    listeners,
    addEventListener(type, fn) {
      if (type === "change") listeners.push(fn);
    },
    changeTo(next) {
      this.value = next;
      for (const fn of listeners) fn({ type: "change" });
    },
  };
}

function fakeMatchMedia(prefersDark) {
  const listeners = [];
  return {
    matches: prefersDark,
    listeners,
    addEventListener(type, fn) {
      if (type === "change") listeners.push(fn);
    },
    set(prefersDark) {
      this.matches = prefersDark;
      for (const fn of listeners) fn({ matches: prefersDark });
    },
  };
}

function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
}

function setup({ stored, prefersDark = false, selectValue } = {}) {
  const document = fakeDocument();
  const storage = fakeStorage(stored === undefined ? {} : { [STORAGE_KEY]: stored });
  const media = fakeMatchMedia(prefersDark);
  const select = fakeSelect(selectValue);
  const doc = {
    documentElement: document.documentElement,
    querySelector: (sel) => (sel === "#theme" ? select : null),
  };
  const theme = initTheme({ document: doc, storage, matchMedia: () => media });
  return { document: doc, storage, media, select, theme };
}

const themeAttr = (doc) => doc.documentElement.getAttribute("data-theme");

// --- applyMode -----------------------------------------------------------

test("applyMode writes data-theme only for light and dark", () => {
  const doc = fakeDocument();
  applyMode(doc, "dark");
  assert.equal(themeAttr(doc), "dark");
  applyMode(doc, "light");
  assert.equal(themeAttr(doc), "light");
});

test("applyMode removes the attribute in system mode", () => {
  const doc = fakeDocument({ "data-theme": "dark" });
  applyMode(doc, SYSTEM);
  assert.equal(themeAttr(doc), null);
  assert.ok(!Object.hasOwn(doc.documentElement.attributes, "data-theme"));
});

test("applyMode is idempotent", () => {
  const doc = fakeDocument();
  applyMode(doc, "dark");
  applyMode(doc, "dark");
  assert.equal(themeAttr(doc), "dark");
  applyMode(doc, SYSTEM);
  applyMode(doc, SYSTEM);
  assert.equal(themeAttr(doc), null);
});

// --- initTheme: initial state -------------------------------------------

test("initTheme defaults to system with no attribute and nothing stored", () => {
  const { document, storage, select } = setup({ prefersDark: true });
  assert.equal(themeAttr(document), null);
  assert.equal(select.value, SYSTEM);
  assert.equal(storage.getItem(STORAGE_KEY), null);
});

test("initTheme paints a saved dark choice and reflects it in the select", () => {
  const { document, select } = setup({ stored: "dark", prefersDark: false });
  assert.equal(themeAttr(document), "dark");
  assert.equal(select.value, "dark");
});

test("initTheme paints a saved light choice even when the OS is dark", () => {
  const { document, select } = setup({ stored: "light", prefersDark: true });
  assert.equal(themeAttr(document), "light");
  assert.equal(select.value, "light");
});

test("initTheme ignores garbage in storage and leaves no attribute", () => {
  for (const bad of ["", "auto", "LIGHT", "blue", "1"]) {
    const { document, select } = setup({ stored: bad, prefersDark: true });
    assert.equal(themeAttr(document), null, `stored ${JSON.stringify(bad)}`);
    assert.equal(select.value, SYSTEM);
  }
});

// --- initTheme: user changes --------------------------------------------

test("choosing Light or Dark persists and applies", () => {
  const { document, storage, select } = setup({ prefersDark: true });
  select.changeTo("light");
  assert.equal(themeAttr(document), "light");
  assert.equal(storage.getItem(STORAGE_KEY), "light");

  select.changeTo("dark");
  assert.equal(themeAttr(document), "dark");
  assert.equal(storage.getItem(STORAGE_KEY), "dark");
});

test("choosing Follow system clears the saved value and the attribute", () => {
  const { document, storage, select } = setup({ stored: "dark", prefersDark: false });
  assert.equal(themeAttr(document), "dark");
  select.changeTo(SYSTEM);
  assert.equal(themeAttr(document), null);
  assert.equal(storage.getItem(STORAGE_KEY), null);
});

test("a change to an unexpected select value falls back to system", () => {
  const { document, storage, select } = setup({ stored: "light" });
  select.changeTo("sepia");
  assert.equal(themeAttr(document), null);
  assert.equal(storage.getItem(STORAGE_KEY), null);
});

// --- initTheme: following the OS live ------------------------------------

test("a live OS switch repaints while following system", () => {
  const { document, media } = setup({ prefersDark: false });
  media.set(true);
  // Still no attribute: the media query decides, not a written value.
  assert.equal(themeAttr(document), null);
  media.set(false);
  assert.equal(themeAttr(document), null);
});

test("a live OS switch does not override an explicit choice", () => {
  const { document, media, storage } = setup({ stored: "light", prefersDark: false });
  media.set(true);
  assert.equal(themeAttr(document), "light");
  assert.equal(storage.getItem(STORAGE_KEY), "light");
  media.set(false);
  assert.equal(themeAttr(document), "light");
});

test("switching back to system re-follows the OS after an explicit choice", () => {
  const { document, media, select } = setup({ stored: "dark", prefersDark: false });
  select.changeTo(SYSTEM);
  assert.equal(themeAttr(document), null);
  media.set(false);
  assert.equal(themeAttr(document), null);
  media.set(true);
  assert.equal(themeAttr(document), null);
});

// --- initTheme: failure modes -------------------------------------------

test("blocked storage is not fatal: init, change and live switch still work", () => {
  const document = fakeDocument();
  const media = fakeMatchMedia(false);
  const select = fakeSelect(SYSTEM);
  const broken = {
    getItem() {
      throw new Error("SecurityError");
    },
    setItem() {
      throw new Error("QuotaExceededError");
    },
    removeItem() {
      throw new Error("SecurityError");
    },
  };
  const doc = {
    documentElement: document.documentElement,
    querySelector: () => select,
  };
  assert.doesNotThrow(() =>
    initTheme({ document: doc, storage: broken, matchMedia: () => media }),
  );
  assert.equal(themeAttr(doc), null);

  assert.doesNotThrow(() => select.changeTo("dark"));
  assert.equal(themeAttr(doc), "dark");
  assert.doesNotThrow(() => select.changeTo(SYSTEM));
  assert.equal(themeAttr(doc), null);
  assert.doesNotThrow(() => media.set(true));
  assert.equal(themeAttr(doc), null);
});

test("a missing storage object is treated as empty", () => {
  const document = fakeDocument();
  const select = fakeSelect();
  const doc = { documentElement: document.documentElement, querySelector: () => select };
  assert.doesNotThrow(() =>
    initTheme({ document: doc, storage: undefined, matchMedia: () => fakeMatchMedia(true) }),
  );
  assert.equal(themeAttr(doc), null);
  assert.doesNotThrow(() => select.changeTo("light"));
  assert.equal(themeAttr(doc), "light");
});

test("a page without the theme select still resolves the saved mode", () => {
  const document = fakeDocument();
  const doc = { documentElement: document.documentElement, querySelector: () => null };
  const theme = initTheme({
    document: doc,
    storage: fakeStorage({ [STORAGE_KEY]: "light" }),
    matchMedia: () => fakeMatchMedia(true),
  });
  assert.equal(themeAttr(doc), "light");
  assert.equal(theme.mode(), "light");
});

test("a matchMedia without change events does not break init", () => {
  const document = fakeDocument();
  const select = fakeSelect();
  const doc = { documentElement: document.documentElement, querySelector: () => select };
  assert.doesNotThrow(() =>
    initTheme({ document: doc, storage: fakeStorage(), matchMedia: () => ({ matches: false }) }),
  );
  assert.equal(themeAttr(doc), null);
});

test("refresh re-reads storage", () => {
  const { document, storage, theme, select } = setup({ prefersDark: false });
  storage.setItem(STORAGE_KEY, "dark");
  theme.refresh();
  assert.equal(themeAttr(document), "dark");
  assert.equal(select.value, "dark");
  assert.equal(theme.mode(), "dark");
});

// --- page and stylesheet contract ---------------------------------------

import { readFile } from "node:fs/promises";

const PAGE = new URL("../index.html", import.meta.url);
const CSS = new URL("../style.css", import.meta.url);

// Contrast ratio of two #rrggbb colours (WCAG 2.x relative luminance).
function contrast(a, b) {
  const luminance = (input) => {
    const digits = input.replace("#", "");
    const hex =
      digits.length === 3 ? "#" + [...digits].map((c) => c + c).join("") : "#" + digits;
    const [r, g, bl] = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function themeBlock(css, selector) {
  const start = css.indexOf(selector + " {");
  assert.notEqual(start, -1, `missing ${selector}`);
  const end = css.indexOf("}", start);
  return css.slice(start, end);
}

function vars(block) {
  const out = {};
  const declarations = block.slice(block.indexOf("{") + 1);
  for (const [, name, value] of declarations.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    out[name] = value.trim();
  }
  return out;
}

test("index.html defaults to Follow system with exactly three options", async () => {
  const html = await readFile(PAGE, "utf8");
  const select = html.match(/<select[^>]*id="theme"[^>]*>([\s\S]*?)<\/select>/);
  assert.ok(select, "expected a #theme select");
  const options = [...select[1].matchAll(/<option value="([^"]+)"([^>]*)>([^<]+)<\/option>/g)].map(
    (m) => ({ value: m[1], selected: /\bselected\b/.test(m[2]), label: m[3].trim() }),
  );
  assert.deepEqual(
    options.map((o) => [o.value, o.label]),
    [
      ["light", "Light"],
      ["dark", "Dark"],
      ["system", "Follow system"],
    ],
  );
  assert.deepEqual(options.filter((o) => o.selected).map((o) => o.value), ["system"]);
  // The select is labelled and outside the bill form, above the heading.
  assert.match(html, /<label[^>]*>\s*Theme\s*<select/);
  assert.ok(html.indexOf('id="theme"') < html.indexOf('<h1>'));
  assert.ok(html.indexOf('id="theme"') < html.indexOf('<form id="bill">'));
});

test("index.html keeps the bill form and result untouched", async () => {
  const html = await readFile(PAGE, "utf8");
  for (const name of ["subtotal", "tip", "people"]) {
    assert.match(html, new RegExp(`name="${name}"`));
  }
  assert.match(html, /<button type="submit">Split<\/button>/);
  assert.match(html, /<p id="error" role="alert"><\/p>/);
  assert.match(html, /<dl id="result" hidden>/);
  assert.match(html, /<script type="module" src="src\/app\.js"><\/script>/);
});

test("index.html resolves the stored theme in the head, accepting only light and dark", async () => {
  const html = await readFile(PAGE, "utf8");
  const head = html.slice(0, html.indexOf("</head>"));
  const script = head.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(script, "expected an inline head script");
  assert.match(script[1], /localStorage\.getItem\("tabby-theme"\)/);
  // Storage failure must be swallowed so the media query still decides.
  assert.match(script[1], /try\s*\{[\s\S]*\}\s*catch/);

  const document = fakeDocument();
  new Function("localStorage", "document", script[1]);
  const run = (getItem) =>
    new Function("localStorage", "document", script[1])({ getItem }, document);

  for (const [stored, want] of [
    ["dark", "dark"],
    ["light", "light"],
    [null, null],
    ["system", null],
    ["auto", null],
    ["Dark", null],
  ]) {
    document.documentElement.attributes = {};
    run(() => stored);
    assert.equal(themeAttr(document), want, `stored ${JSON.stringify(stored)}`);
  }
  document.documentElement.attributes = {};
  assert.doesNotThrow(() =>
    run(() => {
      throw new Error("SecurityError");
    }),
  );
  assert.equal(themeAttr(document), null);
});

test("style.css keeps :root and the media query as the no-JS fallback", async () => {
  const css = await readFile(CSS, "utf8");
  assert.match(css, /^:root \{ [^}]*--bg: #fbfbfa;/);
  const media = css.match(/@media \(prefers-color-scheme: dark\) \{ :root \{([^}]*)\} \}/);
  assert.ok(media, "expected the prefers-color-scheme block");

  const light = themeBlock(css, ":root[data-theme=light]");
  const dark = themeBlock(css, ":root[data-theme=dark]");
  // The override sits after the media query so source order agrees too.
  assert.ok(css.indexOf("@media") < css.indexOf(":root[data-theme=light]"));
  // The dark override carries the same values as the media query.
  const darkVars = vars(dark);
  const mediaVars = vars(media[1]);
  for (const [name, value] of Object.entries(mediaVars)) {
    assert.equal(darkVars[name], value, `--${name}`);
  }
  assert.ok(!css.includes("!important"));
});

test("style.css uses tokens; the error colour passes contrast in both themes", async () => {
  const css = await readFile(CSS, "utf8");
  const rules = css
    .split("\n")
    .filter((line) => /^[^@:/*]/.test(line) && !line.startsWith(":root"));
  for (const rule of rules) {
    const hexes = rule.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
    const allowed = rule.startsWith("button ") ? ["#fff"] : [];
    assert.deepEqual(hexes, allowed, `colour literal outside a theme block: ${rule}`);
  }
  const light = vars(themeBlock(css, ":root"));
  const dark = vars(themeBlock(css, ":root[data-theme=dark]"));
  const lightOverride = vars(themeBlock(css, ":root[data-theme=light]"));
  for (const name of Object.keys(light)) {
    assert.equal(lightOverride[name], light[name], `light override --${name}`);
  }
  assert.notEqual(dark.error, light.error);
  assert.match(css, /#error \{ color: var\(--error\);/);
  assert.ok(contrast(light.error, light.bg) >= 4.5, `light ${contrast(light.error, light.bg)}`);
  assert.ok(contrast(dark.error, dark.bg) >= 4.5, `dark ${contrast(dark.error, dark.bg)}`);
  // Button label is #fff in every theme (unchanged by this change).
  assert.ok(contrast("#fff", lightOverride.accent) >= 4.5, "button label on light accent");
  // Pre-existing and deliberately unchanged: the white button label on the
  // dark accent is below 4.5:1 in the original stylesheet too.
  assert.ok(contrast("#fff", dark.accent) < 4.5, "existing dark accent keeps #fff, unchanged");
});

test("app.js starts the theme control without disturbing the bill splitter", async () => {
  const source = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
  assert.match(source, /initTheme\(\{ document, storage: window\.localStorage, matchMedia: window\.matchMedia\.bind\(window\) \}\)/);
  assert.match(source, /form\.addEventListener\("input", render\)/);

  // Boot it against the page's real elements, then split a bill as before.
  const elements = {
    "#bill": { subtotal: { value: "100.00" }, tip: { value: "18" }, people: { value: "3" } },
    "#result": {
      hidden: true,
      cells: {},
      querySelector(sel) {
        return (this.cells[sel] ??= { textContent: "" });
      },
    },
    "#error": { textContent: "" },
    "#theme": fakeSelect("dark"),
  };
  const listeners = { form: {}, select: elements["#theme"] };
  elements["#bill"].addEventListener = (type, fn) => (listeners.form[type] = fn);
  const media = fakeMatchMedia(false);
  const storage = fakeStorage();
  const documentElement = fakeDocument().documentElement;

  globalThis.document = { documentElement, querySelector: (sel) => elements[sel] ?? null };
  globalThis.window = { localStorage: storage, matchMedia: () => media };
  try {
    const app = new URL("../src/app.js", import.meta.url).href + "?boot=" + Date.now();
    await import(app);
  } finally {
    delete globalThis.document;
    delete globalThis.window;
  }

  // No saved choice: still follows the OS, no attribute.
  assert.equal(documentElement.getAttribute("data-theme"), null);
  // The form still renders its result.
  assert.equal(elements["#result"].hidden, false);
  assert.equal(elements["#result"].cells["[data-tip]"].textContent, "$18.00");
  assert.equal(elements["#result"].cells["[data-total]"].textContent, "$118.00");
  assert.equal(elements["#result"].cells["[data-each]"].textContent, "about $39.33");
  // And the theme select is wired: choosing Dark persists.
  elements["#theme"].changeTo("dark");
  assert.equal(documentElement.getAttribute("data-theme"), "dark");
  assert.equal(storage.getItem(STORAGE_KEY), "dark");
});
