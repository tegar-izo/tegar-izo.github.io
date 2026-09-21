// Penjelasan:
// Kode di bawah ini adalah Intersection Observer.
// Tugasnya adalah memantau elemen HTML yang memiliki class "hidden".
// Ketika elemen tersebut muncul di layar saat kita scroll, JS akan menambahkan class "show".

document.addEventListener("DOMContentLoaded", function () {
  // 1. Memilih semua elemen yang akan dianimasikan
  const hiddenElements = document.querySelectorAll(".hidden");

  // 2. Membuat "Pengintai" (Observer)
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Jika elemen masuk ke dalam pandangan layar
        if (entry.isIntersecting) {
          entry.target.classList.add("show"); // Tambahkan animasi muncul
        }
      });
    },
    {
      threshold: 0.1, // Animasi dimulai saat 10% elemen terlihat di layar
    },
  );
  // ... (Kode Intersection Observer sebelumnya tetap dibiarkan) ...

  // ==========================================
  // KODE UNTUK MENU MOBILE (HAMBURGER)
  // ==========================================

  // 1. Kenali elemen-elemen yang akan dimanipulasi
  const navbar = document.getElementById("navbar");
  const menuToggle = document.querySelector(".menu-toggle"); // Tombol ☰
  const backButton = document.querySelector(".back-button"); // Tombol X
  const navMenu = document.querySelector("nav ul"); // Panel Menu
  const menuLinks = document.querySelectorAll("nav ul li a"); // Semua link di dalam menu

  // scroll navbar

  window.addEventListener("scroll", () => {
    if (window.scrollY > 80) {
      navbar.classList.remove("navbar-hidden");
      navbar.classList.add("navbar-show");
    } else {
      navbar.classList.remove("navbar-show");
      navbar.classList.add("navbar-hidden");
    }
  });

  // 2. Beri 'Event Listener' klik pada tombol ☰ untuk membuka menu
  menuToggle.addEventListener("click", () => {
    // Tambahkan class 'active' agar CSS menggeser menu ke dalam layar
    navMenu.classList.add("active");
  });

  // 3. Beri 'Event Listener' klik pada tombol X untuk menutup menu
  backButton.addEventListener("click", () => {
    // Hapus class 'active' agar CSS menggeser menu kembali keluar
    navMenu.classList.remove("active");
  });

  // 4. Tutup menu otomatis jika salah satu teks/link diklik
  // Ini penting agar setelah menavigasi, layar HP tidak tertutup oleh menu
  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
    });
  });
  // ==========================================
  // KODE UNTUK CAROUSEL PROYEK (DRAG TO SCROLL DI PC/LAPTOP)
  // ==========================================
  const slider = document.querySelector(".carousel-track");
  let isDown = false; // Status apakah mouse sedang ditekan
  let startX; // Posisi awal klik X (horizontal)
  let scrollLeft; // Posisi scroll awal

  // Saat tombol mouse ditekan di dalam carousel
  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  // Saat kursor mouse keluar dari area carousel
  slider.addEventListener("mouseleave", () => {
    isDown = false;
  });

  // Saat tombol mouse dilepas
  slider.addEventListener("mouseup", () => {
    isDown = false;
  });

  // Saat kursor mouse digerakkan (digeser)
  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return; // Hentikan fungsi jika mouse tidak sedang ditekan
    e.preventDefault(); // Mencegah perilaku default seperti memblok gambar/teks
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5; // Angka 1.5 adalah kecepatan geser (bisa disesuaikan)
    slider.scrollLeft = scrollLeft - walk;
  });

  // 3. Menyuruh pengintai untuk mengawasi setiap elemen
  hiddenElements.forEach((el) => observer.observe(el));
});
