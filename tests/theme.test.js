import test from "node:test";
import assert from "node:assert/strict";
import { createPage } from "./helpers/page.js";

const themeOf = (page) => page.document.documentElement.dataset.theme;

test("memakai tema OS sebagai default saat belum ada pilihan tersimpan", (t) => {
  const light = createPage({ systemLight: true });
  t.after(() => light.close());
  assert.equal(themeOf(light), "light");

  const dark = createPage({ systemLight: false });
  t.after(() => dark.close());
  assert.equal(themeOf(dark), "dark");
});

test("pilihan tersimpan mengalahkan preferensi sistem", (t) => {
  const page = createPage({ systemLight: false, storedTheme: "light" });
  t.after(() => page.close());

  const toggle = page.document.querySelector(".theme-toggle");
  assert.equal(themeOf(page), "light");
  assert.equal(toggle.getAttribute("aria-pressed"), "true");
  assert.equal(toggle.getAttribute("aria-label"), "Toggle color theme");
});

test("tombol membalik tema, menyimpan pilihan, dan memperbarui aria-pressed", (t) => {
  const page = createPage({ systemLight: false });
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

test("perubahan tema OS diikuti selama pengguna belum memilih manual", (t) => {
  const page = createPage({ systemLight: false });
  t.after(() => page.close());

  page.systemTheme("light");
  assert.equal(themeOf(page), "light");

  page.systemTheme("dark");
  assert.equal(themeOf(page), "dark");
});

test("perubahan tema OS diabaikan setelah pengguna memilih manual", (t) => {
  const page = createPage({ systemLight: false, storedTheme: "dark" });
  t.after(() => page.close());

  page.systemTheme("light");
  assert.equal(themeOf(page), "dark");
});
