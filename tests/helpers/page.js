// Memuat halaman asli apa adanya di jsdom, lalu menjalankan script.js seperti di
// browser. Skrip tema di <head> ikut dieksekusi oleh runScripts karena itu
// bagian dari perilaku yang diuji.
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

// Kedua versi bahasa diuji dengan kode yang sama; hanya berkas dan URL berbeda.
const PAGES = {
  id: { html: "../../index.html", url: "https://portfolio.test/" },
  en: { html: "../../en/index.html", url: "https://portfolio.test/en/" },
};

const scriptSource = readFileSync(
  new URL("../../assets/js/script.js", import.meta.url),
  "utf8",
);

// MQL tiruan: hanya media query tema yang bisa diubah, sisanya selalu false
// (mis. prefers-reduced-motion dan min-width) agar inisialisasi deterministik.
function createMediaQueryList(query, matches) {
  const listeners = new Set();

  return {
    media: query,
    matches,
    onchange: null,
    addEventListener(type, listener) {
      if (type === "change") listeners.add(listener);
    },
    removeEventListener(type, listener) {
      if (type === "change") listeners.delete(listener);
    },
    addListener(listener) {
      listeners.add(listener);
    },
    removeListener(listener) {
      listeners.delete(listener);
    },
    setMatches(next) {
      this.matches = next;
      listeners.forEach((listener) =>
        listener({ matches: next, media: query }),
      );
    },
  };
}

export function createPage({
  lang = "id",
  systemLight = false,
  storedTheme = null,
} = {}) {
  const page = PAGES[lang] ?? PAGES.id;
  const html = readFileSync(new URL(page.html, import.meta.url), "utf8");
  const themeQuery = createMediaQueryList(
    "(prefers-color-scheme: light)",
    systemLight,
  );
  const dom = new JSDOM(html, {
    url: page.url,
    runScripts: "dangerously",
    pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = (query) => {
        if (query.includes("prefers-color-scheme")) return themeQuery;
        return createMediaQueryList(query, false);
      };

      // jsdom belum punya IntersectionObserver; animasi reveal tidak diuji.
      window.IntersectionObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };

      if (storedTheme) window.localStorage.setItem("theme", storedTheme);
    },
  });

  const { window } = dom;

  window.eval(scriptSource);
  window.document.dispatchEvent(new window.Event("DOMContentLoaded"));

  return {
    window,
    document: window.document,
    themeQuery,
    systemTheme(next) {
      themeQuery.setMatches(next === "light");
    },
    storageTheme() {
      return window.localStorage.getItem("theme");
    },
    click(element) {
      element.dispatchEvent(
        new window.MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    },
    pressKey(key) {
      window.document.dispatchEvent(
        new window.KeyboardEvent("keydown", { key, bubbles: true }),
      );
    },
    close() {
      window.close();
    },
  };
}
