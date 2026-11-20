import test from "node:test";
import assert from "node:assert/strict";
import { createPage } from "./helpers/page.js";

function setup(t) {
  const page = createPage();
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

test("hamburger membuka panel, mengunci scroll, dan menonaktifkan isi di belakang", (t) => {
  const { page, doc, menu, toggle, backdrop, main, footer, firstLink } =
    setup(t);

  page.click(toggle);

  assert.ok(menu.classList.contains("active"));
  assert.ok(backdrop.classList.contains("active"));
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(toggle.getAttribute("aria-label"), "Close menu");
  assert.ok(doc.documentElement.classList.contains("menu-open"));
  assert.ok(doc.body.classList.contains("menu-open"));
  assert.equal(main.inert, true);
  assert.equal(footer.inert, true);
  assert.equal(doc.activeElement, firstLink, "fokus pindah ke link pertama");
});

test("klik hamburger kedua menutup menu dan membuka kembali halaman", (t) => {
  const { page, doc, menu, toggle, main, footer } = setup(t);

  page.click(toggle);
  page.click(toggle);

  assert.equal(menu.classList.contains("active"), false);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(toggle.getAttribute("aria-label"), "Open menu");
  assert.equal(doc.body.classList.contains("menu-open"), false);
  assert.equal(main.inert, false);
  assert.equal(footer.inert, false);
});

test("Escape menutup menu yang sedang terbuka", (t) => {
  const { page, menu, toggle } = setup(t);

  page.click(toggle);
  page.pressKey("Escape");

  assert.equal(menu.classList.contains("active"), false);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
});

test("klik backdrop menutup menu", (t) => {
  const { page, menu, toggle, backdrop } = setup(t);

  page.click(toggle);
  page.click(backdrop);

  assert.equal(menu.classList.contains("active"), false);
});

test("klik link navigasi menutup menu", (t) => {
  const { page, doc, menu, toggle, main, firstLink } = setup(t);

  page.click(toggle);
  page.click(firstLink);

  assert.equal(menu.classList.contains("active"), false);
  assert.equal(doc.body.classList.contains("menu-open"), false);
  assert.equal(main.inert, false);
});

test("Escape tidak melakukan apa-apa saat menu tertutup", (t) => {
  const { page, menu, toggle } = setup(t);

  page.pressKey("Escape");

  assert.equal(menu.classList.contains("active"), false);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
});
