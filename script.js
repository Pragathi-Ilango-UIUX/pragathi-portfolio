const root = document.documentElement;
const hero = document.querySelector(".hero");
const calendarSection = document.querySelector(".calendar-section");

const reduceMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* =========================================================
   HERO SCROLL MOTION
   ========================================================= */

const portrait = document.querySelector(".hero-portrait");
const heroStage = document.querySelector(".hero-stage");
const heroNameRow = document.querySelector(".hero-name-row");

let heroTarget = 0;   // where scroll says we should be (0..1)
let heroCurrent = 0;  // eased value actually drawn
let heroRunning = false;

const clamp01 = value => Math.min(1, Math.max(0, value));
const smooth = t => t * t * (3 - 2 * t);

/* Layout-only measurements (unaffected by our own transforms). */
function measureHero() {
  const stageRect = heroStage.getBoundingClientRect();
  const nameRect = heroNameRow.getBoundingClientRect();
  const spans = heroNameRow.querySelectorAll("span");

  const stageCenterY = stageRect.top + stageRect.height / 2;
  const firstName = heroNameRow.querySelector("span").getBoundingClientRect();
  const nameCenterY = firstName.top + firstName.height / 2;

  const gap =
    spans.length > 1
      ? spans[1].getBoundingClientRect().left -
        spans[0].getBoundingClientRect().right
      : nameRect.width * 0.4;

  // portrait's un-scaled rendered width (offsetWidth ignores transforms)
  const baseWidth = portrait.offsetWidth || 1;
  const wanted = Math.min(gap * 0.9, nameRect.height * 4.6);

  return {
    drop: nameCenterY - stageCenterY,
    scale: Math.min(1, Math.max(0.2, wanted / baseWidth))
  };
}

function drawHero() {
  const { drop, scale } = measureHero();
  const p = smooth(heroCurrent);

  const drift = Math.min(window.innerWidth * 0.03, 44);

  root.style.setProperty("--hero-left", `${-p * drift}px`);
  root.style.setProperty("--hero-right", `${p * drift}px`);

  portrait.style.transform =
    `translate(-50%, calc(-50% + ${p * drop}px)) scale(${1 - p * (1 - scale)})`;
}

function heroFrame() {
  heroCurrent += (heroTarget - heroCurrent) * 0.14;

  if (Math.abs(heroTarget - heroCurrent) < 0.0005) {
    heroCurrent = heroTarget;
    heroRunning = false;
  }

  drawHero();

  if (heroRunning) requestAnimationFrame(heroFrame);
}

function updateHeroAnimation() {
  if (!hero || !portrait || reduceMotion) return;

  // Lands between the two name halves once ~65% of the hero has scrolled by.
  const distance = Math.max(hero.offsetHeight * 0.65, 1);
  heroTarget = clamp01(window.scrollY / distance);

  if (!heroRunning) {
    heroRunning = true;
    requestAnimationFrame(heroFrame);
  }
}

function requestHeroAnimation() {
  updateHeroAnimation();
}


/* =========================================================
   GENERIC REVEALS
   ========================================================= */

const reveals =
  document.querySelectorAll(".reveal");

if (reduceMotion) {
  reveals.forEach(element => {
    element.classList.add("visible");
  });
}
else {
  const revealObserver =
    new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px"
      }
    );

  reveals.forEach(element => {
    revealObserver.observe(element);
  });
}


/* =========================================================
   TYPEWRITER
   Natural wrapping only — no forced line breaks.
   ========================================================= */

const typewriterText =
  document.getElementById("typewriterText");

const typewriterPhrases = [
  "a UI/UX designer.",
  "a front-end developer.",
  "a visual problem solver.",
  "a professional tab hoarder.",
  "a designer + developer making complicated things feel simple."
];

let phraseIndex = 0;
let characterIndex = 0;
let deleting = false;
let typewriterStarted = false;

function runTypewriter() {
  if (!typewriterText) return;

  const phrase =
    typewriterPhrases[phraseIndex];

  if (!deleting) {
    characterIndex += 1;

    typewriterText.textContent =
      phrase.slice(0, characterIndex);

    if (characterIndex === phrase.length) {
      if (phraseIndex === typewriterPhrases.length - 1) {
        return;
      }

      deleting = true;
      setTimeout(runTypewriter, 850);
      return;
    }
  }
  else {
    characterIndex -= 1;

    typewriterText.textContent =
      phrase.slice(0, characterIndex);

    if (characterIndex === 0) {
      deleting = false;
      phraseIndex += 1;
    }
  }

  setTimeout(
    runTypewriter,
    deleting ? 30 : 54
  );
}

function startTypewriter() {
  if (typewriterStarted || !typewriterText) return;

  typewriterStarted = true;

  if (reduceMotion) {
    typewriterText.textContent =
      typewriterPhrases.at(-1);
    return;
  }

  setTimeout(runTypewriter, 350);
}

const typewriterBlock =
  document.querySelector(".typewriter-block");

if (typewriterBlock && !reduceMotion) {
  const typewriterObserver =
    new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          startTypewriter();
          typewriterObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.35
      }
    );

  typewriterObserver.observe(typewriterBlock);
}
else {
  startTypewriter();
}


/* =========================================================
   DECORATIVE CURRENT WEEK
   ========================================================= */

const weekDaysContainer =
  document.getElementById("weekDays");

const today = new Date();

const weekdayFormatter =
  new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "short"
    }
  );

function startOfWeek(date) {
  const copy = new Date(date);

  copy.setHours(12, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());

  return copy;
}

function isSameDay(first, second) {
  return (
    first.getFullYear() === second.getFullYear()
    &&
    first.getMonth() === second.getMonth()
    &&
    first.getDate() === second.getDate()
  );
}

function renderCurrentWeek() {
  if (!weekDaysContainer) return;

  weekDaysContainer.innerHTML = "";

  const weekStart =
    startOfWeek(today);

  for (let index = 0; index < 7; index += 1) {
    const date =
      new Date(weekStart);

    date.setDate(
      weekStart.getDate() + index
    );

    const day =
      document.createElement("div");

    day.className = "week-day";

    if (isSameDay(date, today)) {
      day.classList.add("today");
    }

    const name =
      document.createElement("span");

    name.className = "week-day-name";
    name.textContent =
      weekdayFormatter.format(date);

    const number =
      document.createElement("span");

    number.className = "week-day-number";
    number.textContent = date.getDate();

    day.append(name, number);
    weekDaysContainer.appendChild(day);
  }
}

renderCurrentWeek();


/* =========================================================
   CALENDAR SCROLL REVEALS
   Each block appears only when it actually reaches the viewport.
   ========================================================= */

const calendarRevealItems =
  document.querySelectorAll(
    ".calendar-scroll-reveal"
  );

if (reduceMotion) {
  calendarRevealItems.forEach(element => {
    element.classList.add("is-visible");
  });
}
else {
  const calendarRevealObserver =
    new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          calendarRevealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -16% 0px"
      }
    );

  calendarRevealItems.forEach(element => {
    calendarRevealObserver.observe(element);
  });
}


/* =========================================================
   DARK / LIGHT CALENDAR
   ========================================================= */

const calendarThemeToggle =
  document.getElementById("calendarThemeToggle");

calendarThemeToggle?.addEventListener(
  "click",
  () => {
    if (!calendarSection) return;

    calendarSection.classList.toggle(
      "calendar-light"
    );

    const isLight =
      calendarSection.classList.contains(
        "calendar-light"
      );

    calendarThemeToggle.setAttribute(
      "aria-label",
      isLight
        ? "Switch calendar to dark mode"
        : "Switch calendar to light mode"
    );
  }
);


/* =========================================================
   MOBILE MENU
   ========================================================= */

const menuButton =
  document.querySelector(".menu-button");

const mainNav =
  document.querySelector(".main-nav");

menuButton?.addEventListener(
  "click",
  () => {
    const expanded =
      menuButton.getAttribute(
        "aria-expanded"
      ) === "true";

    menuButton.setAttribute(
      "aria-expanded",
      String(!expanded)
    );

    mainNav?.classList.toggle(
      "mobile-open"
    );
  }
);


/* =========================================================
   STACK CARD HOVER SUPPORT
   ========================================================= */

document.querySelectorAll(".stack-image")
  .forEach(card => {
    card.addEventListener(
      "mouseenter",
      () => card.classList.add("is-hovered")
    );

    card.addEventListener(
      "mouseleave",
      () => card.classList.remove("is-hovered")
    );
  });


/* =========================================================
   BULLETIN BOARD
   Edit this list to change what is pinned up.

   type:  "photo" | "note" | "word" | "stamp" | "sticker"
   src:   path to an image (leave "" to show a placeholder)
          e.g. src: "assets/images/board/flower.png"
   text:  words for notes + the big "word" card
   color: note / word card color (any CSS color)

   Desktop layout:  x, y = position (% of the board),
                    w = width (% of the board), r = tilt (deg)
   Narrow layout:   mx, my, mw, mr  (same idea, taller board)
   ========================================================= */

// Positions are in "board width" units (the board is 100 wide).
// x, y = top-left corner, w = width, r = tilt in degrees.
// `m: [x, y, w, r]` is the arrangement on narrow/phone screens;
// leave `m` out to hide that item on narrow screens.
const BOARD_ITEMS = [
  { type: "photo",   label: "photo",   x: 3,  y: 3,  w: 15, r: -4, m: [4, 4, 42, -4] },
  { type: "note",    text: "ideas worth chasing", color: "#fff1a8", x: 19, y: 2,  w: 11, r: 3,  m: [52, 5, 30, 4] },
  { type: "word",    text: "make it feel like something.", color: "#ffe1d0", x: 32, y: 4,  w: 21, r: -2, m: [10, 50, 62, -2] },
  { type: "stamp",   label: "stamp",   x: 56, y: 3,  w: 8,  r: 7,  m: [72, 28, 19, 7] },
  { type: "sticker", label: "flower",  x: 68, y: 1,  w: 13, r: 5,  m: [62, 56, 34, 5] },
  { type: "photo",   label: "photo",   x: 84, y: 4,  w: 13, r: 3 },

  { type: "note",    text: "buy more plants", color: "#ffd0dc", x: 6,  y: 25, w: 11, r: 5,  m: [4, 92, 30, 5] },
  { type: "photo",   label: "photo",   x: 19, y: 21, w: 19, r: 2,  m: [36, 88, 44, 3] },
  { type: "stamp",   label: "stamp",   x: 41, y: 24, w: 8,  r: -6, m: [82, 100, 15, -6] },
  { type: "photo",   label: "photo",   x: 52, y: 20, w: 17, r: -3, m: [6, 122, 40, -3] },
  { type: "word",    text: "hello!", color: "#d7e6ff", x: 72, y: 25, w: 14, r: 3,  m: [60, 150, 32, 3] },
  { type: "note",    text: "to do:\nmake cool stuff", color: "#cdeccf", x: 87, y: 25, w: 11, r: -4, m: [52, 132, 36, -4] },

  { type: "sticker", label: "sticker", x: 4,  y: 44, w: 11, r: -8 },
  { type: "word",    text: "less noise, more soul.", color: "#f6e6a8", x: 24, y: 44, w: 24, r: 2 },
  { type: "note",    text: "call mom", color: "#ffc99a", x: 54, y: 44, w: 11, r: -3 },
  { type: "photo",   label: "photo",   x: 68, y: 40, w: 16, r: 3 },
  { type: "stamp",   label: "stamp",   x: 87, y: 44, w: 7,  r: 6 }
];

(function renderBoard() {
  const board = document.getElementById("pinBoard");
  if (!board) return;

  const surface = document.createElement("div");
  surface.className = "pin-surface";
  board.appendChild(surface);

  BOARD_ITEMS.forEach((item, index) => {
    const el = document.createElement("div");
    el.className = `pin-item pin-${item.type}`;
    // desktop board is 100 x 62.5 units, so y converts to % of height
    el.style.setProperty("--x", item.x);
    el.style.setProperty("--y", item.y * 1.6);
    el.style.setProperty("--w", item.w);
    el.style.setProperty("--r", `${item.r}deg`);

    if (item.m) {
      const [mx, my, mw, mr] = item.m;
      el.style.setProperty("--mx", mx);
      el.style.setProperty("--my", my);
      el.style.setProperty("--mw", mw);
      el.style.setProperty("--mr", `${mr}deg`);
    } else {
      el.classList.add("is-hidden-narrow");
      el.style.setProperty("--mx", 0);
      el.style.setProperty("--my", 0);
      el.style.setProperty("--mw", item.w);
      el.style.setProperty("--mr", "0deg");
    }
    el.style.setProperty("--z", index + 1);
    if (item.color) el.style.setProperty("--paper", item.color);

    if (item.type === "note" || item.type === "word") {
      const text = document.createElement("p");
      text.textContent = item.text || "";
      el.appendChild(text);
    } else if (item.src) {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt || "";
      img.draggable = false;
      el.appendChild(img);
    } else {
      const span = document.createElement("span");
      span.textContent = item.label || "image";
      el.appendChild(span);
    }

    surface.appendChild(el);
  });
})();


/* =========================================================
   INTRO VIDEO (calendar)
   ========================================================= */

(function initIntroVideo() {
  const card = document.querySelector(".calendar-video");
  if (!card) return;

  const video = card.querySelector("video");
  const button = card.querySelector(".video-play");
  const src = card.dataset.src;

  if (card.dataset.poster) video.poster = card.dataset.poster;
  if (!src) return;                       // placeholder until a video is set

  video.src = src;
  card.classList.add("has-video");

  button.addEventListener("click", () => {
    if (video.paused) {
      video.muted = false;
      video.play();
      card.classList.add("is-playing");
      button.setAttribute("aria-label", "Pause intro video");
    } else {
      video.pause();
      card.classList.remove("is-playing");
      button.setAttribute("aria-label", "Play intro video");
    }
  });
})();


/* =========================================================
   PAGE EVENTS
   ========================================================= */

drawHero();
updateHeroAnimation();

window.addEventListener("scroll", requestHeroAnimation, { passive: true });

window.addEventListener("resize", () => {
  updateHeroAnimation();
  drawHero();
});

window.addEventListener("load", () => {
  updateHeroAnimation();
  drawHero();
});
