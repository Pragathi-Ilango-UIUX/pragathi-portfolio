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
  const wanted = Math.min(gap * 0.82, nameRect.height * 3.4);

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
   PIN BOARD — drag the cards anywhere inside the section.
   Offsets are stored as a fraction of the board size so the
   arrangement scales when the window is resized.
   ========================================================= */

(function initPinBoard() {
  const board = document.getElementById("pinBoard");
  if (!board) return;

  const section = board.closest(".experience-section");
  const cards = board.querySelectorAll(".stack-image");
  const offsets = new Map();   // card -> { fx, fy }
  let zTop = 40;
  let drag = null;

  function apply(card) {
    const o = offsets.get(card);
    const rect = board.getBoundingClientRect();
    card.style.setProperty("--dx", `${o.fx * rect.width}px`);
    card.style.setProperty("--dy", `${o.fy * rect.height}px`);
  }

  cards.forEach(card => {
    offsets.set(card, { fx: 0, fy: 0 });

    card.addEventListener("pointerdown", event => {
      if (event.button !== undefined && event.button !== 0) return;

      const cardRect = card.getBoundingClientRect();
      const o = offsets.get(card);
      const boardRect = board.getBoundingClientRect();
      const bounds = section.getBoundingClientRect();

      drag = {
        card,
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        baseX: o.fx * boardRect.width,
        baseY: o.fy * boardRect.height,
        // how far the card may travel and still stay inside the section
        minX: bounds.left - (cardRect.left - o.fx * boardRect.width),
        maxX: bounds.right - (cardRect.right - o.fx * boardRect.width),
        minY: bounds.top - (cardRect.top - o.fy * boardRect.height),
        maxY: bounds.bottom - (cardRect.bottom - o.fy * boardRect.height),
        armed: event.pointerType !== "touch",
        timer: null
      };

      if (!drag.armed) {
        // touch: press-and-hold so normal page scrolling still works
        drag.timer = setTimeout(() => {
          if (drag) { drag.armed = true; card.classList.add("is-dragging"); }
        }, 220);
      } else {
        card.classList.add("is-dragging");
      }

      zTop += 1;
      card.style.zIndex = zTop;
      card.setPointerCapture?.(event.pointerId);
      if (drag.armed) event.preventDefault();
    });

    card.addEventListener("pointermove", event => {
      if (!drag || drag.card !== card || event.pointerId !== drag.id) return;

      const moveX = event.clientX - drag.startX;
      const moveY = event.clientY - drag.startY;

      if (!drag.armed) {
        // finger moved before the hold finished: it's a scroll, not a drag
        if (Math.hypot(moveX, moveY) > 8) {
          clearTimeout(drag.timer);
          drag = null;
        }
        return;
      }

      const boardRect = board.getBoundingClientRect();
      const x = Math.min(drag.maxX, Math.max(drag.minX, drag.baseX + moveX));
      const y = Math.min(drag.maxY, Math.max(drag.minY, drag.baseY + moveY));

      offsets.set(card, { fx: x / boardRect.width, fy: y / boardRect.height });
      apply(card);
    });

    const end = event => {
      if (!drag || drag.card !== card) return;
      clearTimeout(drag.timer);
      card.classList.remove("is-dragging");
      card.releasePointerCapture?.(drag.id);
      drag = null;
    };

    card.addEventListener("pointerup", end);
    card.addEventListener("pointercancel", end);
    card.addEventListener("dragstart", event => event.preventDefault());
  });

  // stop the page scrolling while a touch drag is active
  board.addEventListener(
    "touchmove",
    event => { if (drag && drag.armed) event.preventDefault(); },
    { passive: false }
  );

  window.addEventListener("resize", () => cards.forEach(apply));
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
