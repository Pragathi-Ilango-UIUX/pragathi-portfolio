const root = document.documentElement;
const hero = document.querySelector(".hero");
const calendarSection = document.querySelector(".calendar-section");

const reduceMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* =========================================================
   HERO SCROLL MOTION
   ========================================================= */

let heroTicking = false;

function updateHeroAnimation() {
  heroTicking = false;

  if (!hero || reduceMotion) {
    root.style.setProperty("--hero-left", "0px");
    root.style.setProperty("--hero-right", "0px");
    root.style.setProperty("--portrait-drop", "0px");
    return;
  }

  const rect = hero.getBoundingClientRect();
  const height = Math.max(hero.offsetHeight, 1);

  const progress =
    Math.min(
      1,
      Math.max(0, -rect.top / height)
    );

  const horizontalTravel =
    Math.min(window.innerWidth * 0.075, 115);

  const portraitTravel =
    Math.min(window.innerWidth * 0.045, 65);

  root.style.setProperty(
    "--hero-left",
    `${-(progress * horizontalTravel)}px`
  );

  root.style.setProperty(
    "--hero-right",
    `${progress * horizontalTravel}px`
  );

  root.style.setProperty(
    "--portrait-drop",
    `${progress * portraitTravel}px`
  );
}

function requestHeroAnimation() {
  if (heroTicking) return;

  heroTicking = true;
  requestAnimationFrame(updateHeroAnimation);
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
   PAGE EVENTS
   ========================================================= */

updateHeroAnimation();

window.addEventListener(
  "scroll",
  requestHeroAnimation,
  {
    passive: true
  }
);

window.addEventListener(
  "resize",
  requestHeroAnimation
);
