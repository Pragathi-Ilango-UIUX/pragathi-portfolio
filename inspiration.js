/* =========================================================
   INSPIRATION PAGE
   - the first card loads in place; scrolling raises the next
     cards from the bottom so each settles over the previous
   - equal card heights (tallest content wins)
   - contents of a card fade in slowly, one piece at a time,
     once the card has (nearly) arrived
   ========================================================= */

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const steps = document.querySelector(".inspiration-steps");
  const stage = document.querySelector(".steps-stage");
  const cards = [...document.querySelectorAll(".step-card")];
  if (!steps || !stage || !cards.length) return;

  document.documentElement.classList.add("js");

  cards.forEach(card => {
    card.querySelectorAll(
      ".step-eyebrow, .value-stack span, .research-groups > div, " +
      ".book-cover-placeholder, .article-list a, .step-description"
    ).forEach((el, i) => {
      el.classList.add("anim");
      el.style.setProperty("--i", i);
    });
  });

  const N = cards.length;
  let stacked = false, stick = 0, seg = 0, stageH = 0, step = 16;
  const shown = new Set();
  const show = i => {
    if (shown.has(i)) return;
    shown.add(i);
    cards[i].classList.add("is-visible");
  };
  const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function layout() {
    steps.classList.remove("no-stack");
    steps.style.height = "";
    cards.forEach(c => { c.style.height = "auto"; });

    const vh = window.innerHeight;
    /* desktop: pin exactly where the content already sits at load, so
       nothing shifts when scrolling starts (only the cards move) */
    document.body.style.removeProperty("--stick");
    if (window.innerWidth > 820) {
      const docTop = steps.getBoundingClientRect().top + window.scrollY;
      if (docTop < vh * 0.4) document.body.style.setProperty("--stick", Math.round(docTop) + "px");
    }
    stick = parseFloat(getComputedStyle(stage).top) || 0;
    step = parseFloat(getComputedStyle(document.body).getPropertyValue("--stack-step")) || 16;
    stageH = Math.max(vh - stick, 300);

    const natural = Math.max(...cards.map(c => c.offsetHeight));
    cards.forEach(c => { c.style.height = ""; });

    const avail = stageH - (N - 1) * step - 12;
    stacked = !reduceMotion && natural <= avail;

    if (!stacked) {
      steps.classList.add("no-stack");
      cards.forEach(c => { c.style.removeProperty("--ty"); c.style.removeProperty("--scale"); });
      onScroll();
      return;
    }

    const cardH = Math.ceil(Math.min(avail, Math.max(natural, 470)));
    seg = vh * 0.72;
    stage.style.setProperty("--stage-h", stageH + "px");
    stage.style.setProperty("--card-h", cardH + "px");
    steps.style.height = Math.round(stageH + (N - 1) * seg + vh * 0.25) + "px";
    onScroll();
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (!stacked) {
        cards.forEach((c, i) => {
          if (reduceMotion || c.getBoundingClientRect().top < window.innerHeight * 0.75) show(i);
        });
        return;
      }
      const runwayTop = steps.getBoundingClientRect().top + window.scrollY - stick;
      const scrolled = window.scrollY - runwayTop;
      const q = cards.map((_, i) =>
        i === 0 ? 1 : easeInOut(Math.min(Math.max((scrolled - (i - 1) * seg) / seg, 0), 1))
      );
      cards.forEach((c, i) => {
        let covered = 0;
        for (let j = i + 1; j < N; j++) covered += q[j];
        c.style.setProperty("--ty", ((1 - q[i]) * (stageH - i * step + 24)).toFixed(1) + "px");
        c.style.setProperty("--scale", (1 - 0.022 * covered).toFixed(4));
        /* outer dashes belong to the top card only, so covered cards drop theirs */
        c.style.setProperty("--dash", Math.max(0, 1 - covered * 3).toFixed(3));
        if (i === 0 || q[i] > 0.7) show(i);
      });
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", layout);
  window.addEventListener("load", layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout();
  setTimeout(() => show(0), 250);
})();
