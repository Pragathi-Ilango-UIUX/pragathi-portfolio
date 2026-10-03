/* =========================================================
   INSPIRATION PAGE
   ========================================================= */

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const stepCards = document.querySelectorAll(".reveal-step");

if (reduceMotion) {
  stepCards.forEach(card => card.classList.add("is-visible"));
} else {
  const stepObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        stepObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  stepCards.forEach(card => stepObserver.observe(card));
}
