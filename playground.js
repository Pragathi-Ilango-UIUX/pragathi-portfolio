const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal, .reveal-card");

let revealObserver = null;

if (reduceMotion) {
  revealItems.forEach(item => item.classList.add("is-visible"));
} else {
  revealObserver = new IntersectionObserver(entries => {
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
const browserSection = document.querySelector(".playground-browser");

function revealActiveSection(section) {
  section.querySelectorAll(".reveal, .reveal-card").forEach(item => {
    if (reduceMotion) {
      item.classList.add("is-visible");
    } else if (!item.classList.contains("is-visible")) {
      revealObserver?.observe(item);
    }
  });
}

function showCategory(filter, shouldScroll = false) {
  filterButtons.forEach(button => {
    const selected = button.dataset.filter === filter;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });

  let selectedSection = null;

  workSections.forEach(section => {
    const selected = section.dataset.sectionCategory === filter;
    section.classList.toggle("is-filtered-out", !selected);
    section.hidden = !selected;

    if (selected) {
      selectedSection = section;
      revealActiveSection(section);
    }
  });

  if (shouldScroll && browserSection) {
    const top = browserSection.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top,
      behavior: reduceMotion ? "auto" : "smooth"
    });
  }
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => showCategory(button.dataset.filter, true));

  button.addEventListener("keydown", event => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(event.key)) return;

    event.preventDefault();
    const currentIndex = filterButtons.indexOf(button);
    const step = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1;
    const nextIndex = (currentIndex + step + filterButtons.length) % filterButtons.length;
    const nextButton = filterButtons[nextIndex];

    nextButton.focus();
    showCategory(nextButton.dataset.filter, false);
  });
});

// Playground intentionally opens on Branding rather than showing every category at once.
showCategory("branding");

const playgroundVideo = document.querySelector(".hero-media video");
playgroundVideo?.play().catch(() => {});
