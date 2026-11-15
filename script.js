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
  const backButton = document.querySelector(".back-button");
  if (!navMenu) return;

  // Fokus pindah ke dalam menu saat dibuka, dan kembali ke tombol menu saat ditutup
  // lewat Escape atau tombol tutup. Klik link tidak mengembalikan fokus karena
  // pengguna sedang menuju section tujuan.
  const setMenu = (open, restoreFocus = false) => {
    navMenu.classList.toggle("active", open);
    menuToggle?.setAttribute("aria-expanded", String(open));

    if (open) {
      navMenu.querySelector("a[href], button")?.focus();
    } else if (restoreFocus) {
      menuToggle?.focus();
    }
  };

  menuToggle?.addEventListener("click", () => setMenu(true));
  backButton?.addEventListener("click", () => setMenu(false, true));

  // Escape hanya ditangani saat menu terbuka, agar tidak menelan tombol Escape
  // untuk kebutuhan lain di halaman.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !navMenu.classList.contains("active")) return;
    e.preventDefault();
    setMenu(false, true);
  });

  // Tutup menu setelah link diklik agar layar HP tidak tertutup.
  navMenu.querySelectorAll("li a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
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
  initCarousel();
});
