/* =========================================================
   INSPIRATION PAGE
   - staggered entrance for each card's contents
   - equal card heights (tallest content wins)
   - cards stack; the one underneath eases back as it's covered
   ========================================================= */

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const steps = document.querySelector(".inspiration-steps");
  const cards = [...document.querySelectorAll(".step-card")];
  if (!steps || !cards.length) return;

  document.documentElement.classList.add("js");

  /* number every piece so it can animate in one by one */
  cards.forEach(card => {
    const parts = card.querySelectorAll(
      ".step-eyebrow, .value-stack span, .research-groups > div, " +
      ".book-cover-placeholder, .article-list a, .step-description"
    );
    parts.forEach((el, i) => {
      el.classList.add("anim");
      el.style.setProperty("--i", i);
    });
  });

  /* ---------- reveal ---------- */
  if (reduceMotion || !("IntersectionObserver" in window)) {
    cards.forEach(c => c.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    cards.forEach(c => io.observe(c));
  }

  /* ---------- equal heights + fit check ---------- */
  function layout() {
    steps.classList.remove("no-stack");
    steps.style.removeProperty("--card-h");
    cards.forEach(c => { c.style.height = "auto"; c.style.transform = "none"; });

    const natural = Math.max(...cards.map(c => c.offsetHeight));
    cards.forEach(c => { c.style.height = ""; c.style.transform = ""; });

    const base = Math.min(Math.max(470, window.innerHeight * 0.66), 620);
    const h = Math.ceil(Math.max(natural, base));
    steps.style.setProperty("--card-h", h + "px");

    const stick = parseFloat(getComputedStyle(cards[0]).top) || 0;
    const stack = (cards.length - 1) * 14;
    if (stick + stack + h > window.innerHeight - 8) steps.classList.add("no-stack");
    onScroll();
  }

  /* ---------- stacking depth ---------- */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const stacked = !steps.classList.contains("no-stack") && !reduceMotion;
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        let s = 1;
        if (stacked && next) {
          const cardTop = card.getBoundingClientRect().top;
          const nextTop = next.getBoundingClientRect().top;
          const h = card.offsetHeight;
          const p = Math.min(Math.max(1 - (nextTop - cardTop) / h, 0), 1);
          /* only starts easing once this card is actually pinned */
          const pinned = parseFloat(getComputedStyle(card).top) >= cardTop - 1;
          if (pinned) s = 1 - 0.045 * p;
        }
        card.style.setProperty("--scale", s.toFixed(4));
      });
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", layout);
  window.addEventListener("load", layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout();
})();
