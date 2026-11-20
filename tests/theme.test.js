import test from "node:test";
import assert from "node:assert/strict";
import { createPage } from "./helpers/page.js";

// Perilaku tema harus sama di kedua versi bahasa; hanya label tombol berbeda.
const LANGS = ["id", "en"];
const THEME_LABEL = { id: "Ubah tema warna", en: "Toggle color theme" };

const themeOf = (page) => page.document.documentElement.dataset.theme;

for (const lang of LANGS) {
  test(`[${lang}] memakai tema OS sebagai default saat belum ada pilihan tersimpan`, (t) => {
    const light = createPage({ lang, systemLight: true });
    t.after(() => light.close());
    assert.equal(themeOf(light), "light");

    const dark = createPage({ lang, systemLight: false });
    t.after(() => dark.close());
    assert.equal(themeOf(dark), "dark");
  });

  test(`[${lang}] pilihan tersimpan mengalahkan preferensi sistem`, (t) => {
    const page = createPage({ lang, systemLight: false, storedTheme: "light" });
    t.after(() => page.close());

    const toggle = page.document.querySelector(".theme-toggle");
    assert.equal(themeOf(page), "light");
    assert.equal(toggle.getAttribute("aria-pressed"), "true");
    assert.equal(toggle.getAttribute("aria-label"), THEME_LABEL[lang]);
  });

  test(`[${lang}] tombol membalik tema, menyimpan pilihan, dan memperbarui aria-pressed`, (t) => {
    const page = createPage({ lang, systemLight: false });
    t.after(() => page.close());

    const toggle = page.document.querySelector(".theme-toggle");
    assert.equal(themeOf(page), "dark");
    assert.equal(toggle.getAttribute("aria-pressed"), "false");

    page.click(toggle);
    assert.equal(themeOf(page), "light");
    assert.equal(toggle.getAttribute("aria-pressed"), "true");
    assert.equal(page.storageTheme(), "light");

    page.click(toggle);
    assert.equal(themeOf(page), "dark");
    assert.equal(toggle.getAttribute("aria-pressed"), "false");
    assert.equal(page.storageTheme(), "dark");
  });

  test(`[${lang}] perubahan tema OS diikuti selama pengguna belum memilih manual`, (t) => {
    const page = createPage({ lang, systemLight: false });
    t.after(() => page.close());

    page.systemTheme("light");
    assert.equal(themeOf(page), "light");

    page.systemTheme("dark");
    assert.equal(themeOf(page), "dark");
  });

  test(`[${lang}] perubahan tema OS diabaikan setelah pengguna memilih manual`, (t) => {
    const page = createPage({ lang, systemLight: false, storedTheme: "dark" });
    t.after(() => page.close());

    page.systemTheme("light");
    assert.equal(themeOf(page), "dark");
  });
}
