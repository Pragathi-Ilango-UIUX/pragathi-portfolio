const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- reveal (staggered, so things settle into place one by one) ---------- */
let revealObserver = null;

function settle(item, delay) {
  item.style.transitionDelay = delay + "ms";
  item.classList.add("is-visible");
  window.setTimeout(() => { item.style.transitionDelay = ""; }, delay + 1000);
}

if (reduceMotion) {
  document.querySelectorAll(".reveal, .reveal-card").forEach(i => i.classList.add("is-visible"));
} else {
  revealObserver = new IntersectionObserver(entries => {
    entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
      .forEach((entry, i) => {
        settle(entry.target, Math.min(i, 8) * 90);
        revealObserver.unobserve(entry.target);
      });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".reveal, .reveal-card").forEach(i => revealObserver.observe(i));
}

/* ---------- category switching ---------- */
const filterButtons = [...document.querySelectorAll(".filter-chip")];
const workSections = [...document.querySelectorAll(".work-section[data-section-category]")];
const browserContent = document.querySelector(".browser-content");
const sectionFor = key => workSections.find(s => s.dataset.sectionCategory === key);

let current = "branding";
let swapTimer = null;

function markButtons(filter) {
  filterButtons.forEach(button => {
    const selected = button.dataset.filter === filter;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
}

function showSection(section) {
  section.hidden = false;
  section.classList.remove("is-filtered-out", "is-leaving");
  const items = [...section.querySelectorAll(".reveal, .reveal-card")];
  items.forEach(i => {
    i.classList.remove("is-visible");
    i.style.transitionDelay = "";
  });
  void section.offsetWidth;
  items.forEach(i => (reduceMotion ? i.classList.add("is-visible") : revealObserver.observe(i)));
}

function switchTo(filter) {
  if (filter === current) return;
  const outgoing = sectionFor(current);
  const incoming = sectionFor(filter);
  current = filter;
  markButtons(filter);
  window.clearTimeout(swapTimer);

  workSections.forEach(s => {
    if (s !== incoming && s !== outgoing) { s.hidden = true; s.classList.add("is-filtered-out"); }
  });

  const finish = () => {
    if (outgoing) { outgoing.hidden = true; outgoing.classList.add("is-filtered-out"); outgoing.classList.remove("is-leaving"); }
    showSection(incoming);
  };

  if (reduceMotion || !outgoing) {
    finish();
  } else {
    outgoing.classList.add("is-leaving");
    swapTimer = window.setTimeout(finish, 230);
  }
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => switchTo(button.dataset.filter));

  button.addEventListener("keydown", event => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(event.key)) return;
    event.preventDefault();
    const i = filterButtons.indexOf(button);
    const step = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1;
    const next = filterButtons[(i + step + filterButtons.length) % filterButtons.length];
    next.focus();
    switchTo(next.dataset.filter);
  });
});

/* open on Branding */
workSections.forEach(s => {
  const on = s.dataset.sectionCategory === current;
  s.hidden = !on;
  s.classList.toggle("is-filtered-out", !on);
});
markButtons(current);

document.querySelector(".hero-media video")?.play().catch(() => {});
