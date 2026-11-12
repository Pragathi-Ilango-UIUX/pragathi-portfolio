const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- HERO TYPEWRITER ----------------
   Every character is in the page from the start (hidden), so the
   lines never re-wrap while typing. Typing only fades letters in. */
const headlineTarget = document.getElementById("aboutHeadlineText");
const headlineText = "Because great ideas deserve to be built just as beautifully as they’re imagined.";
let headlineChars = [];
let headlineCursor = null;

function buildHeadline() {
  if (!headlineTarget) return;
  headlineCursor = document.createElement("span");
  headlineCursor.className = "type-cursor";
  headlineCursor.setAttribute("aria-hidden", "true");

  headlineText.split(" ").forEach((word, wi, words) => {
    const w = document.createElement("span");
    w.className = "w";
    [...word].forEach(ch => {
      const c = document.createElement("span");
      c.className = "ch";
      c.textContent = ch;
      w.appendChild(c);
      headlineChars.push(c);
    });
    headlineTarget.appendChild(w);
    if (wi < words.length - 1) headlineTarget.appendChild(document.createTextNode(" "));
  });
  headlineChars[0].parentNode.insertBefore(headlineCursor, headlineChars[0]);
}

let headlineStarted = false;
function typeHeadline() {
  if (!headlineTarget || headlineStarted) return;
  headlineStarted = true;

  if (reduceMotion) {
    headlineChars.forEach(c => c.classList.add("on"));
    headlineChars[headlineChars.length - 1].after(headlineCursor);
    return;
  }

  const msPerCharacter = 75;
  const startDelay = 500;
  let startTime = null;
  let shown = 0;

  function frame(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = Math.max(0, timestamp - startTime - startDelay);
    const count = Math.min(headlineChars.length, Math.floor(elapsed / msPerCharacter));

    if (count !== shown) {
      for (let i = shown; i < count; i++) headlineChars[i].classList.add("on");
      headlineChars[count - 1].after(headlineCursor);
      shown = count;
    }
    if (count < headlineChars.length) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

buildHeadline();

if (headlineTarget) {
  if (reduceMotion) {
    typeHeadline();
  } else {
    const headlineObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        typeHeadline();
        headlineObserver.unobserve(entry.target);
      });
    }, { threshold: 0.2 });

    headlineObserver.observe(headlineTarget.closest(".about-headline-stage") || headlineTarget);
  }
}

/* ---------------- GENERIC REVEALS ---------------- */
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
  }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });

  revealItems.forEach(item => revealObserver.observe(item));
}

/* ---------------- SKILLS STAGGER ----------------
   Each card animates as it scrolls into view; the delay follows
   its column so a row ripples left to right. */
const skillCards = [...document.querySelectorAll(".stagger-card")];
const skillsGrid = document.querySelector(".skills-grid");

if (skillCards.length) {
  skillCards.forEach(card =>
    card.querySelectorAll("li").forEach((li, i) => li.style.setProperty("--li", i))
  );

  if (reduceMotion) {
    skillCards.forEach(card => card.classList.add("is-visible"));
  } else {
    const skillsObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const cols = getComputedStyle(skillsGrid).gridTemplateColumns.split(" ").length || 1;
        const idx = skillCards.indexOf(entry.target);
        entry.target.style.setProperty("--delay", (idx % cols) * 140 + "ms");
        entry.target.classList.add("is-visible");
        skillsObserver.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -6% 0px" });

    skillCards.forEach(card => skillsObserver.observe(card));
  }
}

/* ---------------- INTRO HANDWRITTEN NOTE ---------------- */
const signature = document.getElementById("aboutSignature");

if (signature) {
  if (reduceMotion) {
    signature.classList.add("write-on");
  } else {
    const signatureObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("write-on");
        signatureObserver.unobserve(entry.target);
      });
    }, { threshold: 0.35 });

    signatureObserver.observe(signature);
  }
}

/* ---------------- 5–9 POLAROID CAROUSEL ----------------
   Fill this list to populate the carousel. Leave `src` empty to show
   an empty polaroid; add as many items as you like. */
const POLAROIDS = [
  { src: "", caption: "hiking" },
  { src: "", caption: "travel" },
  { src: "", caption: "cooking" },
  { src: "", caption: "photography" },
  { src: "", caption: "prince walks" },
  { src: "", caption: "biking" },
  { src: "", caption: "music" },
  { src: "", caption: "friends" },
  { src: "", caption: "weekend" },
  { src: "", caption: "somewhere new" }
];

(function () {
  const track = document.getElementById("polaroidTrack");
  if (!track) return;

  POLAROIDS.forEach((item, i) => {
    const fig = document.createElement("figure");
    fig.className = "polaroid";
    fig.style.setProperty("--r", ["-2.4deg", "1.8deg", "-1deg", "2.6deg"][i % 4]);
    const photo = document.createElement("div");
    photo.className = "polaroid-photo";
    if (item.src) {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt || item.caption || "";
      img.loading = "lazy";
      img.draggable = false;
      photo.appendChild(img);
    } else {
      photo.textContent = String(i + 1).padStart(2, "0");
    }
    const cap = document.createElement("figcaption");
    cap.textContent = item.caption || "";
    fig.append(photo, cap);
    track.appendChild(fig);
  });

  /* second copy makes the CSS loop seamless (it slides exactly half the track) */
  [...track.children].forEach(node => {
    const clone = node.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  /* constant speed regardless of how many photos there are */
  const setSpeed = () => {
    const half = track.scrollWidth / 2;
    track.style.setProperty("--loop", Math.max(20, half / 55) + "s");
  };
  setSpeed();
  window.addEventListener("resize", setSpeed);
  window.addEventListener("load", setSpeed);
})();
