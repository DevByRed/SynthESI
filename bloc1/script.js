/**
 * ========================================
 * SynthESI - JavaScript Principal
 * ========================================
 *
 * Ce fichier gère les interactions utilisateur :
 * - Navigation mobile
 * - Scroll effects
 * - Animations au scroll
 * - Interactions diverses
 *
 * ========================================
 */

// ========================================
// INITIALISATION
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initSmoothScroll();
  initScrollEffects();
  initIntersectionObserver();
  initNavbarActiveState();
});

// ========================================
// NAVIGATION MOBILE
// ========================================

function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.getElementById("nav-links");

  if (!mobileMenuBtn || !navLinks) return;

  // Toggle menu on button click
  mobileMenuBtn.addEventListener("click", function () {
    this.classList.toggle("active");
    navLinks.classList.toggle("active");

    // Accessibility: Update ARIA attributes
    const isExpanded = navLinks.classList.contains("active");
    this.setAttribute("aria-expanded", isExpanded);
  });

  // Close menu when clicking on a link
  const navLinkItems = navLinks.querySelectorAll("a");
  navLinkItems.forEach((link) => {
    link.addEventListener("click", function () {
      mobileMenuBtn.classList.remove("active");
      navLinks.classList.remove("active");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", function (event) {
    const isClickInsideNav = navLinks.contains(event.target);
    const isClickOnButton = mobileMenuBtn.contains(event.target);

    if (
      !isClickInsideNav &&
      !isClickOnButton &&
      navLinks.classList.contains("active")
    ) {
      mobileMenuBtn.classList.remove("active");
      navLinks.classList.remove("active");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
    }
  });

  // Close menu on escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && navLinks.classList.contains("active")) {
      mobileMenuBtn.classList.remove("active");
      navLinks.classList.remove("active");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
      mobileMenuBtn.focus();
    }
  });
}

// ========================================
// SMOOTH SCROLL
// ========================================

function initSmoothScroll() {
  // Handle all anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      const targetId = this.getAttribute("href");

      // Skip if it's just "#"
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        event.preventDefault();

        // Calculate offset for fixed navbar
        const navbarHeight = document.querySelector(".navbar").offsetHeight;
        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        // Update URL without jumping
        history.pushState(null, null, targetId);
      }
    });
  });
}

// ========================================
// SCROLL EFFECTS
// ========================================

function initScrollEffects() {
  const navbar = document.getElementById("navbar");
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateNavbar() {
    const currentScrollY = window.scrollY;

    // Add scrolled class for styling
    if (currentScrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateNavbar();
      });
      ticking = true;
    }
  });

  // Initial check
  updateNavbar();
  // Check if IntersectionObserver is supported
  if (!("IntersectionObserver" in window)) {
    // Fallback: show all elements
    animatedElements.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
    return;
  }

  // Set initial state
  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  });

  // Create observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger animation for grid items
          const delay = entry.target.closest(
            ".reviews-grid, .packs-grid, .how-to-content"
          )
            ? index * 100
            : 0;

          setTimeout(() => {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }, delay);

          // Unobserve after animation
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  // Observe elements
  animatedElements.forEach((el) => observer.observe(el));
}

// ========================================
// NAVBAR ACTIVE STATE
// ========================================

function initNavbarActiveState() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (sections.length === 0 || navLinks.length === 0) return;

  function updateActiveLink() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  // Add active class styling
  const style = document.createElement("style");
  style.textContent = `
        .nav-links a.active {
            color: #7c3aed !important;
            background: #ede9fe !important;
        }
    `;
  document.head.appendChild(style);

  // Update on scroll with throttle
  let scrollTimeout;
  window.addEventListener("scroll", function () {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(function () {
      updateActiveLink();
    });
  });

  // Initial check
  updateActiveLink();
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ========================================
// PACK CARDS INTERACTION
// ========================================

// Pack buttons now use regular links - no JavaScript blocking needed
// Analytics tracking can be added here if needed in the future

// ========================================
// LAZY LOADING IMAGES (Performance)
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  // Check for native lazy loading support
  if ("loading" in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach((img) => {
      img.src = img.dataset.src || img.src;
    });
  } else {
    // Fallback for browsers that don't support lazy loading
    const lazyImages = document.querySelectorAll("img");

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach((img) => imageObserver.observe(img));
  }
});

// ========================================
// ACCESSIBILITY IMPROVEMENTS
// ========================================

// Handle keyboard navigation for cards
document.addEventListener("DOMContentLoaded", function () {
  const interactiveCards = document.querySelectorAll(
    ".pack-card, .review-card"
  );

  interactiveCards.forEach((card) => {
    // Make cards focusable
    if (!card.hasAttribute("tabindex")) {
      card.setAttribute("tabindex", "0");
    }

    // Handle keyboard interaction
    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        const link = this.querySelector("a");
        if (link) {
          link.click();
        }
      }
    });
  });
});

// Skip to main content link (for screen readers)
document.addEventListener("DOMContentLoaded", function () {
  const skipLink = document.createElement("a");
  skipLink.href = "#description";
  skipLink.className = "skip-link";
  skipLink.textContent = "Aller au contenu principal";
  skipLink.style.cssText = `
        position: absolute;
        top: -100%;
        left: 50%;
        transform: translateX(-50%);
        background: #1e3a8a;
        color: white;
        padding: 10px 20px;
        border-radius: 0 0 8px 8px;
        z-index: 10000;
        transition: top 0.3s;
    `;

  skipLink.addEventListener("focus", function () {
    this.style.top = "0";
  });

  skipLink.addEventListener("blur", function () {
    this.style.top = "-100%";
  });

  document.body.insertBefore(skipLink, document.body.firstChild);
});

// ========================================
// CONSOLE BRANDING
// ========================================

console.log(
  "%c📚 SynthESI %c- Plateforme étudiante",
  "background: #1e3a8a; color: white; padding: 10px 15px; font-size: 16px; font-weight: bold; border-radius: 5px 0 0 5px;",
  "background: #7c3aed; color: white; padding: 10px 15px; font-size: 16px; border-radius: 0 5px 5px 0;"
);
console.log(
  "%cCréé avec ❤️ pour les étudiants de l'ESI",
  "color: #6b7280; font-size: 12px;"
);
