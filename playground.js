const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal, .reveal-card");

if (reduceMotion) {
  revealItems.forEach(item => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  revealItems.forEach(item => revealObserver.observe(item));
}

const filterButtons = [...document.querySelectorAll(".filter-chip")];
const workSections = [...document.querySelectorAll(".work-section[data-section-category]")];

function showCategory(filter, shouldScroll = false) {
  filterButtons.forEach(button => {
    const selected = button.dataset.filter === filter;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
  });

  workSections.forEach(section => {
    const selected = section.dataset.sectionCategory === filter;
    section.classList.toggle("is-filtered-out", !selected);

    if (selected) {
      section.querySelectorAll(".reveal, .reveal-card").forEach(item => {
        if (reduceMotion) item.classList.add("is-visible");
      });
    }
  });

  if (shouldScroll) {
    const selectedSection = workSections.find(section => section.dataset.sectionCategory === filter);
    selectedSection?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => showCategory(button.dataset.filter, true));
});

// Playground intentionally opens on Branding rather than showing every category at once.
showCategory("branding");

const menuButton = document.querySelector(".menu-button");
const mainNav = document.querySelector(".main-nav");

menuButton?.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  mainNav?.classList.toggle("mobile-open");
});

mainNav?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("mobile-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

// Autoplay is allowed because the video is muted; this retries in browsers that delay playback.
const playgroundVideo = document.querySelector(".hero-media video");
playgroundVideo?.play().catch(() => {});
