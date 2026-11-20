// Menjaga agar /index.html dan /en/index.html tidak melenceng: bahasa, metadata,
// tujuan toggle, struktur section, dan semua path aset harus tetap konsisten.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const SITE = "https://tegar-izo.github.io";

const PAGES = {
  id: {
    file: new URL("../index.html", import.meta.url),
    url: `${SITE}/`,
    lang: "id",
    locale: "id_ID",
    alternateLocale: "en_US",
  },
  en: {
    file: new URL("../en/index.html", import.meta.url),
    url: `${SITE}/en/`,
    lang: "en",
    locale: "en_US",
    alternateLocale: "id_ID",
  },
};

function load(key) {
  const page = PAGES[key];
  const html = readFileSync(page.file, "utf8");
  return { page, doc: new JSDOM(html, { url: page.url }).window.document };
}

const attr = (doc, selector, name) =>
  doc.querySelector(selector)?.getAttribute(name) ?? null;

const alternates = (doc) =>
  Object.fromEntries(
    [...doc.querySelectorAll('link[rel="alternate"][hreflang]')].map((link) => [
      link.getAttribute("hreflang"),
      link.getAttribute("href"),
    ]),
  );

for (const key of Object.keys(PAGES)) {
  const expected = PAGES[key];

  test(`[${key}] bahasa dokumen dan metadata mengikuti versi halamannya`, () => {
    const { doc } = load(key);

    assert.equal(doc.documentElement.getAttribute("lang"), expected.lang);
    assert.equal(attr(doc, 'link[rel="canonical"]', "href"), expected.url);
    assert.equal(
      attr(doc, 'meta[property="og:url"]', "content"),
      expected.url,
    );
    assert.equal(
      attr(doc, 'meta[property="og:locale"]', "content"),
      expected.locale,
    );
    assert.equal(
      attr(doc, 'meta[property="og:locale:alternate"]', "content"),
      expected.alternateLocale,
    );
    assert.equal(attr(doc, 'meta[name="twitter:card"]', "content"), "summary");
    assert.ok(
      attr(doc, "title", "lang") === null && doc.title.trim().length > 0,
      "judul halaman tidak boleh kosong",
    );
    assert.ok(
      attr(doc, 'meta[name="description"]', "content").length > 0,
      "deskripsi tidak boleh kosong",
    );
  });

  test(`[${key}] canonical, hreflang, dan x-default saling menunjuk`, () => {
    const { doc } = load(key);

    assert.deepEqual(alternates(doc), {
      id: `${SITE}/`,
      en: `${SITE}/en/`,
      "x-default": `${SITE}/`,
    });
  });

  test(`[${key}] toggle bahasa menandai halaman aktif dan tidak menyeberang bahasa`, () => {
    const { doc } = load(key);

    const group = doc.querySelector(".lang-switch");
    assert.ok(group, "toggle bahasa harus ada di navbar");

    const links = [...group.querySelectorAll("a")];
    assert.equal(links.length, 2);

    const [idLink, enLink] = links;
    assert.equal(idLink.getAttribute("href"), "/");
    assert.equal(idLink.getAttribute("hreflang"), "id");
    assert.equal(idLink.getAttribute("lang"), "id");
    assert.equal(enLink.getAttribute("href"), "/en/");
    assert.equal(enLink.getAttribute("hreflang"), "en");
    assert.equal(enLink.getAttribute("lang"), "en");

    const active = links.filter(
      (link) => link.getAttribute("aria-current") === "page",
    );
    assert.equal(active.length, 1, "hanya satu bahasa yang ditandai aktif");
    assert.equal(active[0], expected.lang === "id" ? idLink : enLink);
  });

  test(`[${key}] semua path aset lokal ada di dalam repositori`, () => {
    const { doc } = load(key);

    const refs = [
      ...doc.querySelectorAll(
        'link[rel="stylesheet"][href], link[rel="preload"][href], link[rel="icon"][href], link[rel="apple-touch-icon"][href], script[src], img[src], a.cert-link[href]',
      ),
    ].map((el) => el.getAttribute("href") ?? el.getAttribute("src"));

    assert.ok(refs.length > 0);

    for (const ref of refs) {
      // Font Google dan tautan absolut lain berasal dari luar repositori.
      if (/^(https?:)?\/\//.test(ref)) continue;
      assert.equal(
        ref.startsWith("/"),
        false,
        `aset lokal sebaiknya relatif terhadap halaman: ${ref}`,
      );
      // Path lama tidak boleh tertinggal setelah aset pindah ke assets/.
      assert.equal(
        ref.startsWith("img/") || ref === "style.css" || ref === "script.js",
        false,
        `path lama masih dipakai: ${ref}`,
      );

      const file = fileURLToPath(new URL(ref, expected.file));
      assert.ok(existsSync(file), `berkas tidak ditemukan: ${ref}`);
    }
  });

  test(`[${key}] setiap link navigasi menunjuk section yang ada`, () => {
    const { doc } = load(key);

    const links = [...doc.querySelectorAll("#nav-menu a")];
    assert.equal(links.length, 6);

    for (const link of links) {
      const href = link.getAttribute("href");
      assert.ok(href.startsWith("#"), `link navigasi harus anchor: ${href}`);
      assert.ok(
        doc.getElementById(href.slice(1)),
        `section tidak ditemukan untuk ${href}`,
      );
    }
  });
}

test("kedua versi memakai struktur section dan jumlah konten yang sama", () => {
  const id = load("id").doc;
  const en = load("en").doc;

  const ids = (doc) => [...doc.querySelectorAll("main section")].map((s) => s.id);

  assert.deepEqual(ids(id), ids(en));
  assert.deepEqual(
    [...id.querySelectorAll("#nav-menu a")].map((a) => a.getAttribute("href")),
    [...en.querySelectorAll("#nav-menu a")].map((a) => a.getAttribute("href")),
  );
  assert.equal(
    id.querySelectorAll(".cert-card").length,
    en.querySelectorAll(".cert-card").length,
  );
  assert.equal(
    id.querySelectorAll(".project-feature").length,
    en.querySelectorAll(".project-feature").length,
  );
});
