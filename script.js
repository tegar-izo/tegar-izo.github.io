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
    menuToggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");

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

function initCarousel() {
  const slider = document.querySelector(".carousel-track");
  if (!slider) return;

  const prevButton = document.querySelector("[data-carousel-prev]");
  const nextButton = document.querySelector("[data-carousel-next]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Satu langkah = satu kartu penuh ditambah jarak antar kartu.
  const stepSize = () => {
    const card = slider.querySelector(".project-card");
    const gap = parseFloat(getComputedStyle(slider).columnGap) || 0;
    return card ? card.offsetWidth + gap : slider.clientWidth * 0.8;
  };

  const updateButtons = () => {
    if (!prevButton || !nextButton) return;
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    prevButton.disabled = slider.scrollLeft <= 1;
    nextButton.disabled = slider.scrollLeft >= maxScroll - 1;
  };

  const scrollByCard = (direction) => {
    slider.scrollBy({
      left: direction * stepSize(),
      behavior: reduceMotion.matches ? "auto" : "smooth",
    });
  };

  prevButton?.addEventListener("click", () => scrollByCard(-1));
  nextButton?.addEventListener("click", () => scrollByCard(1));
  slider.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);
  updateButtons();

  let isDown = false;
  let hasDragged = false;
  let startX = 0;
  let startScrollLeft = 0;

  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    hasDragged = false;
    startX = e.pageX - slider.offsetLeft;
    startScrollLeft = slider.scrollLeft;
  });

  slider.addEventListener("mouseleave", () => {
    isDown = false;
  });

  window.addEventListener("mouseup", () => {
    isDown = false;
  });

  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5;

    if (Math.abs(walk) > 5) hasDragged = true;

    slider.scrollLeft = startScrollLeft - walk;
  });

  // Batalkan klik yang terpicu setelah selesai drag.
  slider.addEventListener("click", (e) => {
    if (!hasDragged) return;
    e.preventDefault();
    e.stopPropagation();
    hasDragged = false;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initScrollReveal();
  initNavbarScroll();
  initMobileMenu();
  initScrollSpy();
  initCarousel();
});
