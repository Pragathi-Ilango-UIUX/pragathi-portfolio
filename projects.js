/* =========================================================
   WORK PAGE
   Desktop: vertical page scroll slides the timeline sideways
   (a sticky stage on a tall runway). No scroll-jacking, so the
   footer is always reachable and resizing can never trap you.
   Phones / short windows: a normal vertical list.
   ========================================================= */

const runway = document.getElementById("workScroll");
const stage = document.getElementById("workStage");
const track = document.getElementById("workTrack");
const yearBar = document.getElementById("yearBar");
const progressBar = document.getElementById("yearProgress");

const yearButtons = [...document.querySelectorAll(".year-jump button")];
const yearPanels = [...document.querySelectorAll(".timeline-panel[data-year]")];
const projectPanels = [...document.querySelectorAll(".project-panel")];

const stackedQuery = window.matchMedia("(max-width: 700px), (max-height: 600px)");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isStacked = () => stackedQuery.matches;

let travel = 0;        // how far the track can slide (px)
let runwayTop = 0;     // page Y where the sticky stage starts moving
let target = 0;        // scroll progress 0..1
let current = 0;       // eased progress actually drawn
let running = false;
let activeYear = null;
let jump = null;       // { year, y } while a pill-triggered scroll is in flight
let jumpTimer = null;

/* ---------- measurements ---------- */

function measure() {
  if (isStacked()) {
    runway.style.height = "";
    track.style.transform = "";
    travel = 0;
    return;
  }

  travel = Math.max(0, track.scrollWidth - stage.clientWidth);
  runway.style.height = `${travel + stage.clientHeight}px`;

  // The stage starts pinned right where the runway begins on the page.
  runwayTop = runway.getBoundingClientRect().top + window.scrollY -
    parseFloat(getComputedStyle(stage).top || 0);
}

function pageYForX(x) {
  return runwayTop + Math.min(travel, Math.max(0, x));
}

/* ---------- year pills ---------- */

function setActiveYear(year) {
  if (year === activeYear) return;
  activeYear = year;

  yearButtons.forEach((button) => {
    const on = button.dataset.year === year;
    button.classList.toggle("active", on);
    if (on) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });

  // keep the active pill visible if the bar can scroll (small phones)
  const bar = document.querySelector(".year-jump");
  const btn = yearButtons.find((b) => b.dataset.year === year);
  if (bar && btn && bar.scrollWidth > bar.clientWidth) {
    bar.scrollTo({ left: btn.offsetLeft - bar.clientWidth / 2 + btn.offsetWidth / 2, behavior: "smooth" });
  }
}

/* The year whose panel has come into view past 60% of the screen. */
function yearAtX(x) {
  const vw = stage.clientWidth;
  let year = yearPanels[0]?.dataset.year;

  for (const panel of yearPanels) {
    if (panel.offsetLeft - x < vw * 0.6) year = panel.dataset.year;
  }

  if (travel > 0 && x >= travel - 2) year = yearPanels.at(-1)?.dataset.year;
  return year;
}

function yearAtScroll() {
  const line = Math.min(window.innerHeight * 0.4, 320);
  let year = yearPanels[0]?.dataset.year;

  for (const panel of yearPanels) {
    if (panel.getBoundingClientRect().top <= line) year = panel.dataset.year;
  }
  return year;
}

/* ---------- drawing ---------- */

function draw() {
  if (isStacked()) return;
  const x = current * travel;
  track.style.transform = `translate3d(${-x}px,0,0)`;
  progressBar.style.transform = `scaleX(${current})`;
  if (!jump) setActiveYear(yearAtX(x));
}

function frame() {
  current += (target - current) * 0.14;

  if (reduceMotion || Math.abs(target - current) < 0.0004) {
    current = target;
    running = false;
  }

  draw();
  if (running) requestAnimationFrame(frame);
}

function onScroll() {
  if (jump) {
    clearTimeout(jumpTimer);
    jumpTimer = setTimeout(() => { jump = null; update(); }, 160);
    if (Math.abs(window.scrollY - jump.y) <= 3) { jump = null; }
  }

  update();
}

function update() {
  if (isStacked()) {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${total > 0 ? window.scrollY / total : 0})`;
    if (!jump) setActiveYear(yearAtScroll());
    return;
  }

  target = travel > 0 ? Math.min(1, Math.max(0, (window.scrollY - runwayTop) / travel)) : 0;
  if (!running) {
    running = true;
    requestAnimationFrame(frame);
  }
}

/* ---------- pill clicks ---------- */

yearButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const panel = document.getElementById(button.dataset.target);
    if (!panel) return;

    const year = button.dataset.year;
    setActiveYear(year);

    if (isStacked()) {
      jump = { year, y: panel.getBoundingClientRect().top + window.scrollY - stage.getBoundingClientRect().top * 0 };
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      jump = { year, y: pageYForX(panel.offsetLeft) };
      window.scrollTo({ top: jump.y, behavior: "smooth" });
    }

    clearTimeout(jumpTimer);
    jumpTimer = setTimeout(() => { jump = null; update(); }, 1600);
  });
});

// a manual scroll interrupts a pill jump
["wheel", "touchstart", "keydown"].forEach((name) =>
  window.addEventListener(name, () => { jump = null; }, { passive: true })
);

/* ---------- keyboard focus inside the track ---------- */

track.addEventListener("focusin", (event) => {
  if (isStacked()) return;
  const panel = event.target.closest(".timeline-panel");
  if (!panel) return;

  const center = panel.offsetLeft - (stage.clientWidth - panel.offsetWidth) / 2;
  window.scrollTo({ top: pageYForX(center), behavior: "smooth" });
});

/* ---------- phones: hide the pill bar over the footer ---------- */

const footer = document.querySelector(".site-footer");
if (footer && "IntersectionObserver" in window) {
  new IntersectionObserver(
    ([entry]) => yearBar.classList.toggle("is-hidden", entry.isIntersecting),
    { threshold: 0.05 }
  ).observe(footer);
}

/* ---------- phones: press-and-hold to flip a card ---------- */

let holdTimer = null;
let holdX = 0;
let holdY = 0;

projectPanels.forEach((panel) => {
  panel.addEventListener("touchstart", (event) => {
    if (!isStacked()) return;
    const touch = event.touches[0];
    holdX = touch.clientX;
    holdY = touch.clientY;
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => {
      projectPanels.forEach((item) => { if (item !== panel) item.classList.remove("is-selected"); });
      panel.classList.toggle("is-selected");
      holdTimer = null;
    }, 460);
  }, { passive: true });

  panel.addEventListener("touchmove", (event) => {
    if (!holdTimer) return;
    const touch = event.touches[0];
    if (Math.abs(touch.clientX - holdX) > 10 || Math.abs(touch.clientY - holdY) > 10) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  }, { passive: true });

  ["touchend", "touchcancel"].forEach((name) =>
    panel.addEventListener(name, () => { clearTimeout(holdTimer); holdTimer = null; })
  );
});

/* ---------- wiring ---------- */

function relayout() {
  measure();
  if (!isStacked()) projectPanels.forEach((panel) => panel.classList.remove("is-selected"));
  update();
  draw();
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", relayout);
window.addEventListener("load", relayout);
stackedQuery.addEventListener?.("change", relayout);
if ("ResizeObserver" in window) new ResizeObserver(relayout).observe(track);
document.fonts?.ready.then(relayout);

relayout();
