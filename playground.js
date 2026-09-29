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
  }, { threshold: .12, rootMargin: "0px 0px -8% 0px" });
  revealItems.forEach(item => revealObserver.observe(item));
}

const filterButtons = document.querySelectorAll(".filter-chip");
const workSections = document.querySelectorAll(".work-section[data-section-category]");
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    workSections.forEach(section => {
      const category = section.dataset.sectionCategory;
      section.classList.toggle("is-filtered-out", !(filter === "all" || category === filter));
    });
  });
});

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
