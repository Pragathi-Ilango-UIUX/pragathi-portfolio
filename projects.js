const scroller = document.getElementById("projectTimeline");
const progress = document.getElementById("timelineProgress");
const menu = document.querySelector(".projects-menu");
const nav = document.querySelector(".projects-nav");
const yearButtons = document.querySelectorAll(".year-jump button");

menu?.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!open));
  nav?.classList.toggle("mobile-open", !open);
});

if (scroller) {
  let targetX = scroller.scrollLeft;
  let currentX = scroller.scrollLeft;
  let rafId = null;

  const maxScroll = () => Math.max(0, scroller.scrollWidth - scroller.clientWidth);

  function updateProgress() {
    const max = maxScroll();
    const ratio = max > 0 ? scroller.scrollLeft / max : 0;
    if (progress) progress.style.width = `${ratio * 100}%`;
  }

  function animateToTarget() {
    currentX += (targetX - currentX) * 0.18;

    if (Math.abs(targetX - currentX) < 0.5) {
      currentX = targetX;
      scroller.scrollLeft = currentX;
      rafId = null;
      updateProgress();
      return;
    }

    scroller.scrollLeft = currentX;
    updateProgress();
    rafId = requestAnimationFrame(animateToTarget);
  }

  function requestAnimation() {
    if (rafId === null) {
      currentX = scroller.scrollLeft;
      rafId = requestAnimationFrame(animateToTarget);
    }
  }

  scroller.addEventListener(
    "wheel",
    (event) => {
      const dominantDelta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX;

      const max = maxScroll();
      const atStart = scroller.scrollLeft <= 1;
      const atEnd = scroller.scrollLeft >= max - 1;

      // Once the timeline has reached either end, allow normal vertical
      // page scrolling so the footer can be reached naturally.
      if ((dominantDelta < 0 && atStart) || (dominantDelta > 0 && atEnd)) {
        return;
      }

      event.preventDefault();

      targetX = Math.min(
        max,
        Math.max(0, targetX + dominantDelta * 1.15)
      );

      requestAnimation();
    },
    { passive: false }
  );

  // Native horizontal trackpad gestures / scrollbar changes still update UI.
  scroller.addEventListener("scroll", () => {
    if (rafId === null) {
      targetX = scroller.scrollLeft;
      currentX = scroller.scrollLeft;
    }
    updateProgress();
  });

  // Mouse / pen drag.
  let dragging = false;
  let startX = 0;
  let startScroll = 0;

  scroller.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return;

    dragging = true;
    startX = event.clientX;
    startScroll = scroller.scrollLeft;
    targetX = scroller.scrollLeft;
    currentX = scroller.scrollLeft;

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    scroller.classList.add("is-dragging");
    scroller.setPointerCapture?.(event.pointerId);
  });

  scroller.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const next = startScroll - (event.clientX - startX);
    scroller.scrollLeft = next;
    targetX = scroller.scrollLeft;
    currentX = scroller.scrollLeft;
  });

  function stopDragging(event) {
    if (!dragging) return;
    dragging = false;
    scroller.classList.remove("is-dragging");

    if (event?.pointerId !== undefined) {
      try {
        scroller.releasePointerCapture?.(event.pointerId);
      } catch (_) {}
    }
  }

  scroller.addEventListener("pointerup", stopDragging);
  scroller.addEventListener("pointercancel", stopDragging);
  scroller.addEventListener("lostpointercapture", stopDragging);

  // Keyboard accessibility.
  scroller.addEventListener("keydown", (event) => {
    const jump = Math.max(260, scroller.clientWidth * 0.55);

    if (event.key === "ArrowRight") {
      event.preventDefault();
      scroller.scrollBy({ left: jump, behavior: "smooth" });
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scroller.scrollBy({ left: -jump, behavior: "smooth" });
    }
  });

  // Year bubbles.
  yearButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.target);
      if (!target) return;

      const left = target.offsetLeft;
      targetX = left;
      currentX = scroller.scrollLeft;

      yearButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      scroller.scrollTo({
        left,
        behavior: "smooth"
      });
    });
  });

  // Keep selected year bubble in sync while scrolling.
  const yearSections = [...document.querySelectorAll("[data-year]")];

  function syncYearButton() {
    const center = scroller.scrollLeft + scroller.clientWidth * 0.35;
    let selected = yearSections[0];

    for (const section of yearSections) {
      if (section.offsetLeft <= center) selected = section;
    }

    if (!selected) return;

    yearButtons.forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.target === selected.id
      );
    });
  }

  scroller.addEventListener("scroll", syncYearButton);

  updateProgress();
  syncYearButton();
}
