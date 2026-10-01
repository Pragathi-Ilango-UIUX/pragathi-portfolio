(() => {
  "use strict";

  const CONFIG = {
    resumeUrl: "assets/files/Pragathi_Ilango_Resume.pdf",
    email: "pragathi.ilango@gmail.com",
    social: {
      linkedin: "#",
      behance: "#",
      dribbble: "#"
    }
  };

  const headerMarkup = `
    <header class="site-header">
      <a class="site-logo-link" href="index.html" aria-label="Pragathi Ilango home">
        <span class="site-logo-mark" aria-hidden="true"></span>
      </a>

      <nav class="main-nav" aria-label="Primary navigation">
        <a href="projects.html" data-nav-key="work">Work</a>
        <a href="about.html" data-nav-key="about">About</a>
        <a href="playground.html" data-nav-key="playground">Playground</a>
        <a href="${CONFIG.resumeUrl}" target="_blank" rel="noopener">Resume</a>
      </nav>

      <button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  `;

  const footerMarkup = `
    <footer class="site-footer">
      <div class="footer-display">
        <img
          class="footer-cue-svg"
          src="assets/images/This_is_your_cue.svg"
          alt="This is your cue"
        >
        <p>say hi</p>
      </div>

      <div class="footer-contact">
        <div class="footer-socials">
          <a href="${CONFIG.social.linkedin}" aria-label="LinkedIn">
            <img src="assets/images/linkedin.svg" alt="">
          </a>
          <a href="${CONFIG.social.behance}" aria-label="Behance">
            <img src="assets/images/behance.svg" alt="">
          </a>
          <a href="${CONFIG.social.dribbble}" aria-label="Dribbble">
            <img src="assets/images/dribbble.svg" alt="">
          </a>
          <a href="${CONFIG.resumeUrl}" target="_blank" rel="noopener" aria-label="Resume">
            <img src="assets/images/resume.svg" alt="">
          </a>
        </div>

        <a class="footer-email" href="mailto:${CONFIG.email}">
          ${CONFIG.email}
        </a>
      </div>

      <div class="footer-bottom">
        <p>© Pragathi Ilango 2026</p>
        <p>Made with love and a sugar rush 🍰</p>
      </div>
    </footer>
  `;

  const headerMounts = document.querySelectorAll("[data-shared-header]");
  const footerMounts = document.querySelectorAll("[data-shared-footer]");

  headerMounts.forEach((mount) => {
    mount.outerHTML = headerMarkup;
  });

  footerMounts.forEach((mount) => {
    mount.outerHTML = footerMarkup;
  });

  const body = document.body;
  const currentPage = body.dataset.page || "";

  document.querySelectorAll(".main-nav [data-nav-key]").forEach((link) => {
    if (link.dataset.navKey === currentPage) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const header = document.querySelector(".site-header");
  const menuButton = header?.querySelector(".menu-button");
  const nav = header?.querySelector(".main-nav");

  const closeMenu = () => {
    if (!menuButton || !nav) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    nav.classList.remove("mobile-open");
  };

  const openMenu = () => {
    if (!menuButton || !nav) return;
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close menu");
    nav.classList.add("mobile-open");
  };

  /*
    Capture-phase handler intentionally owns the shared mobile menu.
    This prevents older page-specific menu listeners from toggling twice.
  */
  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest(".menu-button");
      if (button && header?.contains(button)) {
        event.preventDefault();
        event.stopImmediatePropagation();

        const isOpen = button.getAttribute("aria-expanded") === "true";
        isOpen ? closeMenu() : openMenu();
        return;
      }

      if (event.target.closest(".main-nav a")) {
        closeMenu();
        return;
      }

      if (nav?.classList.contains("mobile-open") && !header?.contains(event.target)) {
        closeMenu();
      }
    },
    true
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) closeMenu();
  });
})();
