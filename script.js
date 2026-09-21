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

  const setMenu = (open) => {
    navMenu.classList.toggle("active", open);
    menuToggle?.setAttribute("aria-expanded", String(open));
  };

  menuToggle?.addEventListener("click", () => setMenu(true));
  backButton?.addEventListener("click", () => setMenu(false));

  // Tutup menu setelah link diklik agar layar HP tidak tertutup.
  navMenu.querySelectorAll("li a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
}

function initCarousel() {
  const slider = document.querySelector(".carousel-track");
  if (!slider) return;

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
