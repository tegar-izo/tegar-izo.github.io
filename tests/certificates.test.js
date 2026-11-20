import test from "node:test";
import assert from "node:assert/strict";
import { createPage } from "./helpers/page.js";

function setup(t) {
  const page = createPage();
  t.after(() => page.close());

  const { document: doc } = page;
  const modal = doc.getElementById("cert-modal");
  const cards = Array.from(doc.querySelectorAll(".cert-card"));
  const trigger = cards[0].querySelector("[data-cert-open]");

  return { page, doc, modal, cards, trigger };
}

test("dialog tertutup saat halaman dimuat", (t) => {
  const { modal } = setup(t);

  assert.equal(modal.hidden, true);
});

test("klik thumbnail mengisi dialog dari kartu yang dipilih", (t) => {
  const { page, doc, modal, cards } = setup(t);
  const card = cards[1];

  page.click(card.querySelector("[data-cert-open]"));

  assert.equal(modal.hidden, false);
  assert.equal(
    doc.getElementById("cert-modal-title").textContent,
    card.querySelector("h3").textContent.trim(),
  );
  assert.equal(
    doc.querySelector("[data-cert-meta]").textContent,
    card.querySelector(".cert-meta").textContent.trim(),
  );
  assert.equal(
    doc.querySelector("[data-cert-image]").getAttribute("src"),
    card.querySelector("img").getAttribute("src"),
  );
  // Properti href sudah diresolusi browser, jadi bandingkan URL hasilnya.
  assert.equal(
    doc.querySelector("[data-cert-href]").href,
    card.querySelector(".cert-link").href,
  );

  // Latar dikunci dan tidak ikut urutan Tab selama dialog terbuka.
  assert.equal(doc.body.classList.contains("modal-open"), true);
  assert.equal(doc.documentElement.classList.contains("modal-open"), true);
  assert.equal(doc.querySelector("main").inert, true);
  assert.equal(doc.activeElement, doc.querySelector(".cert-modal-close"));
});

test("Escape menutup dialog dan mengembalikan fokus ke thumbnail", (t) => {
  const { page, doc, modal, trigger } = setup(t);

  page.click(trigger);
  page.pressKey("Escape");

  assert.equal(modal.hidden, true);
  assert.equal(doc.body.classList.contains("modal-open"), false);
  assert.equal(doc.querySelector("main").inert, false);
  assert.equal(doc.activeElement, trigger);
});

test("backdrop dan tombol tutup sama-sama menutup dialog", (t) => {
  const { page, doc, modal, trigger } = setup(t);

  page.click(trigger);
  page.click(doc.querySelector(".cert-modal-backdrop"));
  assert.equal(modal.hidden, true);

  page.click(trigger);
  page.click(doc.querySelector(".cert-modal-close"));
  assert.equal(modal.hidden, true);
});

test("klik di dalam panel tidak menutup dialog", (t) => {
  const { page, doc, modal, trigger } = setup(t);

  page.click(trigger);
  page.click(doc.querySelector("[data-cert-image]"));

  assert.equal(modal.hidden, false);
});
