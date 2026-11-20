import test from "node:test";
import assert from "node:assert/strict";
import { createPage } from "./helpers/page.js";

const SECTION_TOP = {
  hero: 0,
  about: 800,
  experience: 1600,
  projects: 2400,
  certificates: 3000,
  contact: 3600,
};

const DOCUMENT_HEIGHT = 4400;

function setupScrollSpy(t) {
  const page = createPage();
  t.after(() => page.close());

  const { window, document: doc } = page;

  // jsdom tidak punya layout: posisi tiap section dan tinggi dokumen distub.
  for (const [id, top] of Object.entries(SECTION_TOP)) {
    doc.getElementById(id).getBoundingClientRect = () => ({
      top: top - window.scrollY,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON() {},
    });
  }

  let scrollY = 0;
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    get: () => scrollY,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: 768,
  });
  Object.defineProperty(doc.documentElement, "scrollHeight", {
    configurable: true,
    value: DOCUMENT_HEIGHT,
  });

  const scrollTo = (y) => {
    scrollY = y;
    window.dispatchEvent(new window.Event("scroll"));
  };

  const links = [...doc.querySelectorAll("nav ul li a")];
  const activeLinks = () =>
    links
      .filter((link) => link.classList.contains("is-active"))
      .map((link) => link.getAttribute("href"));

  return { window, doc, links, scrollTo, activeLinks };
}

test("section aktif mengikuti posisi scroll", (t) => {
  const { scrollTo, activeLinks } = setupScrollSpy(t);

  scrollTo(0);
  assert.deepEqual(activeLinks(), ["#hero"]);

  scrollTo(600);
  assert.deepEqual(activeLinks(), ["#about"]);

  scrollTo(1900);
  assert.deepEqual(activeLinks(), ["#experience"]);
});

test("hanya satu link ditandai dan aria-current hanya ada di link aktif", (t) => {
  const { scrollTo, activeLinks, links } = setupScrollSpy(t);

  scrollTo(600);
  assert.equal(activeLinks().length, 1);

  const [about] = links.filter(
    (link) => link.getAttribute("href") === "#about",
  );
  assert.equal(about.getAttribute("aria-current"), "true");

  const others = links.filter((link) => link.getAttribute("href") !== "#about");
  for (const link of others) {
    assert.equal(link.hasAttribute("aria-current"), false);
  }
});

test("section terakhir menang saat halaman mentok di dasar", (t) => {
  const { scrollTo, activeLinks } = setupScrollSpy(t);

  // 3700 + 768 = 4468 >= 4400 - 2
  scrollTo(3700);
  assert.deepEqual(activeLinks(), ["#contact"]);
});
