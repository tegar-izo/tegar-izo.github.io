// Fitur dipanggil dari DOMContentLoaded; animasi murni lewat toggling class di CSS.

function initScrollReveal() {
  const hiddenElements = document.querySelectorAll(".hidden");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1 },
  );

  hiddenElements.forEach((el) => observer.observe(el));
}

function initNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const updateNavbar = () => {
    const scrolled = window.scrollY > 80;
    navbar.classList.toggle("navbar-show", scrolled);
    navbar.classList.toggle("navbar-hidden", !scrolled);
  };

  window.addEventListener("scroll", updateNavbar, { passive: true });
  updateNavbar();
}

// Tema awal sudah dipasang skrip di <head>; di sini hanya menangani tombol,
// penyimpanan pilihan, dan perubahan preferensi sistem selama belum memilih.
function initThemeToggle() {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  if (!toggle) return;

  const systemLight = window.matchMedia("(prefers-color-scheme: light)");

  const storedTheme = () => {
    try {
      const value = localStorage.getItem("theme");
      return value === "light" || value === "dark" ? value : null;
    } catch {
      return null; // localStorage diblokir
    }
  };

  const apply = (theme) => {
    root.dataset.theme = theme;
    toggle.setAttribute("aria-pressed", String(theme === "light"));
  };

  // Tombol hanya mengubah tema, pilihan disimpan agar bertahan antar kunjungan.
  toggle.addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    apply(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Penyimpanan diblokir: tema tetap berlaku untuk sesi ini.
    }
  });

  // Ikuti OS selama pengguna belum pernah memilih tema sendiri.
  systemLight.addEventListener("change", (event) => {
    if (storedTheme()) return;
    apply(event.matches ? "light" : "dark");
  });

  apply(root.dataset.theme === "light" ? "light" : "dark");
}

function initMobileMenu() {
  const navMenu = document.querySelector("nav ul");
  const menuToggle = document.querySelector(".menu-toggle");
  const backdrop = document.querySelector(".nav-backdrop");
  if (!navMenu || !menuToggle) return;

  const desktop = window.matchMedia("(min-width: 769px)");
  const pageRegions = document.querySelectorAll("main, footer");
  let lastFocused = null;

  // Hanya elemen yang benar-benar tampil ikut dalam urutan Tab di dalam menu.
  const focusables = () =>
    [menuToggle, ...navMenu.querySelectorAll("a[href], button")].filter(
      (el) => !el.disabled && el.offsetParent !== null,
    );

  // Fokus pindah ke link pertama saat dibuka, dan kembali ke elemen asal saat
  // ditutup lewat Escape atau klik di luar panel. Klik link tidak mengembalikan
  // fokus karena pengguna sedang menuju section tujuan.
  const setMenu = (open, restoreFocus = true) => {
    navMenu.classList.toggle("active", open);
    backdrop?.classList.toggle("active", open);
    document.documentElement.classList.toggle("menu-open", open);
    document.body.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");

    // Isi halaman di belakang overlay diabaikan pembaca layar dan Tab.
    pageRegions.forEach((region) => {
      region.inert = open;
    });

    if (open) {
      lastFocused = document.activeElement;
      navMenu.querySelector("a")?.focus();
    } else {
      if (restoreFocus && lastFocused instanceof HTMLElement) {
        lastFocused.focus();
      } else if (navMenu.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      lastFocused = null;
    }
  };

  const isMenuOpen = () => navMenu.classList.contains("active");

  // Hamburger berfungsi sebagai toggle: klik saat menu terbuka akan menutupnya.
  menuToggle.addEventListener("click", () => setMenu(!isMenuOpen()));

  // Klik di overlay menutup menu.
  backdrop?.addEventListener("click", () => setMenu(false));

  document.addEventListener("keydown", (e) => {
    if (!isMenuOpen()) return;

    // Escape hanya ditangani saat menu terbuka, agar tidak menelan tombol Escape
    // untuk kebutuhan lain di halaman.
    if (e.key === "Escape") {
      e.preventDefault();
      setMenu(false);
      return;
    }

    // Focus trap: Tab berputar di antara hamburger dan isi panel.
    if (e.key !== "Tab") return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const current = document.activeElement;

    if (!items.includes(current)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && current === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && current === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Tutup menu setelah link diklik agar layar HP tidak tertutup.
  navMenu.querySelectorAll("li a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false, false));
  });

  // Panel hanya ada di layar mobile; saat layar melebar menu ditutup agar
  // scroll-lock dan inert tidak tertinggal.
  desktop.addEventListener("change", (e) => {
    if (e.matches && isMenuOpen()) setMenu(false, false);
  });
}

function initScrollSpy() {
  const links = Array.from(
    document.querySelectorAll('nav ul li a[href^="#"]'),
  );
  const items = links
    .map((link) => ({
      link,
      section: document.getElementById(link.getAttribute("href").slice(1)),
    }))
    .filter((item) => item.section);
  if (!items.length) return;

  let currentId = null;

  const update = () => {
    const line = window.scrollY + window.innerHeight * 0.35;
    let active = items[0];

    items.forEach((item) => {
      const top = item.section.getBoundingClientRect().top + window.scrollY;
      if (top <= line) active = item;
    });

    // Saat halaman mentok di bawah, section terakhir yang menang.
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;
    if (atBottom) active = items[items.length - 1];

    if (active.section.id === currentId) return;
    currentId = active.section.id;

    items.forEach((item) => {
      const isActive = item.section.id === currentId;
      item.link.classList.toggle("is-active", isActive);
      if (isActive) item.link.setAttribute("aria-current", "true");
      else item.link.removeAttribute("aria-current");
    });
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

// Pratinjau sertifikat: satu dialog dipakai ulang untuk semua kartu. Data
// dibaca dari kartu yang diklik supaya judul, thumbnail, dan tautan PDF tidak
// perlu ditulis dua kali di markup.
function initCertModal() {
  const modal = document.getElementById("cert-modal");
  const triggers = document.querySelectorAll("[data-cert-open]");
  if (!modal || !triggers.length) return;

  const panel = modal.querySelector(".cert-modal-panel");
  const modalTitle = document.getElementById("cert-modal-title");
  const modalMeta = modal.querySelector("[data-cert-meta]");
  const modalImage = modal.querySelector("[data-cert-image]");
  const modalLink = modal.querySelector("[data-cert-href]");
  const closeButton = modal.querySelector(".cert-modal-close");
  const background = document.querySelectorAll("main, footer, header");
  let lastFocused = null;

  const isOpen = () => !modal.hidden;

  const open = (trigger) => {
    const card = trigger.closest(".cert-card");
    if (!card) return;

    const thumbnail = card.querySelector("img");
    const pdfLink = card.querySelector(".cert-link");

    lastFocused = trigger;
    modalTitle.textContent = card.querySelector("h3").textContent.trim();
    modalMeta.textContent = card.querySelector(".cert-meta").textContent.trim();
    modalImage.src = thumbnail.getAttribute("src");
    modalImage.alt = thumbnail.alt;
    modalLink.href = pdfLink.href;

    modal.hidden = false;
    // Isi halaman di belakang dialog tidak ikut Tab maupun pembaca layar.
    background.forEach((region) => {
      region.inert = true;
    });
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
    closeButton.focus();
  };

  const close = () => {
    modal.hidden = true;
    background.forEach((region) => {
      region.inert = false;
    });
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
    lastFocused = null;
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => open(trigger));
  });

  // Backdrop dan tombol tutup sama-sama memakai penanda data-cert-close.
  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-cert-close]")) close();
  });

  document.addEventListener("keydown", (event) => {
    if (!isOpen()) return;

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    // Focus trap: Tab berputar di antara tombol tutup dan tautan PDF.
    if (event.key !== "Tab") return;
    const focusables = Array.from(
      panel.querySelectorAll("a[href], button"),
    ).filter((el) => !el.disabled);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initScrollReveal();
  initNavbarScroll();
  initThemeToggle();
  initMobileMenu();
  initScrollSpy();
  initCertModal();
});
