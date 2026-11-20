import test from "node:test";
import assert from "node:assert/strict";
import { createPage } from "./helpers/page.js";

const LANGS = ["id", "en"];
const LABELS = {
  id: { open: "Buka menu", close: "Tutup menu" },
  en: { open: "Open menu", close: "Close menu" },
};

function setup(t, lang) {
  const page = createPage({ lang });
  t.after(() => page.close());

  const doc = page.document;
  return {
    page,
    doc,
    menu: doc.getElementById("nav-menu"),
    toggle: doc.querySelector(".menu-toggle"),
    backdrop: doc.querySelector(".nav-backdrop"),
    main: doc.querySelector("main"),
    footer: doc.querySelector("footer"),
    firstLink: doc.querySelector("#nav-menu li a"),
  };
}

for (const lang of LANGS) {
  test(`[${lang}] hamburger membuka panel, mengunci scroll, dan menonaktifkan isi di belakang`, (t) => {
    const { page, doc, menu, toggle, backdrop, main, footer, firstLink } =
      setup(t, lang);

    page.click(toggle);

    assert.ok(menu.classList.contains("active"));
    assert.ok(backdrop.classList.contains("active"));
    assert.equal(toggle.getAttribute("aria-expanded"), "true");
    assert.equal(toggle.getAttribute("aria-label"), LABELS[lang].close);
    assert.ok(doc.documentElement.classList.contains("menu-open"));
    assert.ok(doc.body.classList.contains("menu-open"));
    assert.equal(main.inert, true);
    assert.equal(footer.inert, true);
    assert.equal(doc.activeElement, firstLink, "fokus pindah ke link pertama");
  });

  test(`[${lang}] klik hamburger kedua menutup menu dan membuka kembali halaman`, (t) => {
    const { page, doc, menu, toggle, main, footer } = setup(t, lang);

    page.click(toggle);
    page.click(toggle);

    assert.equal(menu.classList.contains("active"), false);
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
    assert.equal(toggle.getAttribute("aria-label"), LABELS[lang].open);
    assert.equal(doc.body.classList.contains("menu-open"), false);
    assert.equal(main.inert, false);
    assert.equal(footer.inert, false);
  });

  test(`[${lang}] Escape menutup menu yang sedang terbuka`, (t) => {
    const { page, menu, toggle } = setup(t, lang);

    page.click(toggle);
    page.pressKey("Escape");

    assert.equal(menu.classList.contains("active"), false);
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
  });

  test(`[${lang}] klik backdrop menutup menu`, (t) => {
    const { page, menu, toggle, backdrop } = setup(t, lang);

    page.click(toggle);
    page.click(backdrop);

    assert.equal(menu.classList.contains("active"), false);
  });

  test(`[${lang}] klik link navigasi menutup menu`, (t) => {
    const { page, doc, menu, toggle, main, firstLink } = setup(t, lang);

    page.click(toggle);
    page.click(firstLink);

    assert.equal(menu.classList.contains("active"), false);
    assert.equal(doc.body.classList.contains("menu-open"), false);
    assert.equal(main.inert, false);
  });

  test(`[${lang}] Escape tidak melakukan apa-apa saat menu tertutup`, (t) => {
    const { page, menu, toggle } = setup(t, lang);

    page.pressKey("Escape");

    assert.equal(menu.classList.contains("active"), false);
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
  });
}
