const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- HERO TYPEWRITER ---------------- */
const headlineTarget = document.getElementById("aboutHeadlineText");
const headlineCursor = document.querySelector(".type-cursor");
const headlineText = "Because great ideas deserve to be built just as beautifully as they’re imagined.";
let headlineStarted = false;

function typeHeadline() {
  if (!headlineTarget || headlineStarted) return;
  headlineStarted = true;

  if (reduceMotion) {
    headlineTarget.textContent = headlineText;
    headlineCursor?.classList.add("is-done");
    return;
  }

  const msPerCharacter = 31;
  const startDelay = 180;
  let startTime = null;

  function frame(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = Math.max(0, timestamp - startTime - startDelay);
    const count = Math.min(headlineText.length, Math.floor(elapsed / msPerCharacter));

    headlineTarget.textContent = headlineText.slice(0, count);

    if (count < headlineText.length) {
      requestAnimationFrame(frame);
    } else {
      headlineCursor?.classList.add("is-done");
    }
  }

  requestAnimationFrame(frame);
}

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

/* ---------------- SKILLS STAGGER ---------------- */
const skillCards = [...document.querySelectorAll(".stagger-card")];
const skillsGrid = document.querySelector(".skills-grid");

if (skillCards.length) {
  if (reduceMotion) {
    skillCards.forEach(card => card.classList.add("is-visible"));
  } else if (skillsGrid) {
    const skillsObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        skillCards.forEach((card, index) => {
          window.setTimeout(() => card.classList.add("is-visible"), index * 105);
        });
        skillsObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

    skillsObserver.observe(skillsGrid);
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
