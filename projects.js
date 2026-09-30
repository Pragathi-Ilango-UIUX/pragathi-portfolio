const scroller = document.getElementById("projectTimeline");
const progress = document.getElementById("timelineProgress");
const menu = document.querySelector(".projects-menu");
const nav = document.querySelector(".projects-nav");
const yearButtons = document.querySelectorAll(".year-jump button");
const yearSections = [...document.querySelectorAll("[data-year]")];
const projectPanels = [...document.querySelectorAll(".project-panel")];

menu?.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!open));
  nav?.classList.toggle("mobile-open", !open);
});

const isMobileLayout = () => window.matchMedia("(max-width: 700px)").matches;

if (scroller) {
  let targetX = scroller.scrollLeft;
  let currentX = scroller.scrollLeft;
  let rafId = null;

  const maxScroll = () => Math.max(0, scroller.scrollWidth - scroller.clientWidth);

  function updateProgress() {
    if (isMobileLayout()) return;
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
      if (isMobileLayout()) return;

      const dominantDelta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX;

      const max = maxScroll();
      const atStart = scroller.scrollLeft <= 1;
      const atEnd = scroller.scrollLeft >= max - 1;

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

  scroller.addEventListener("scroll", () => {
    if (!isMobileLayout() && rafId === null) {
      targetX = scroller.scrollLeft;
      currentX = scroller.scrollLeft;
    }
    updateProgress();
    syncYearButtons();
  });

  let dragging = false;
  let startX = 0;
  let startScroll = 0;

  scroller.addEventListener("pointerdown", (event) => {
    if (isMobileLayout() || event.pointerType === "touch") return;

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

  scroller.addEventListener("keydown", (event) => {
    if (isMobileLayout()) return;

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

  function syncYearButtons() {
    if (isMobileLayout()) return;

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

  yearButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.target);
      if (!target) return;

      if (isMobileLayout()) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
        return;
      }

      // offsetLeft is relative to the horizontal track.
      const left = target.offsetLeft;

      targetX = left;
      currentX = scroller.scrollLeft;

      scroller.scrollTo({
        left,
        behavior: "smooth"
      });

      // Keep ALL repeated year controls in sync.
      yearButtons.forEach((item) => {
        item.classList.toggle(
          "active",
          item.dataset.target === button.dataset.target
        );
      });
    });
  });

  updateProgress();
  syncYearButtons();
}

/* ---------------------------------------------------------
   MOBILE LONG PRESS
   A long press selects a project and animates its orange fill.
   The preview image remains visible on mobile at all times.
   --------------------------------------------------------- */
let longPressTimer = null;
let longPressPanel = null;
let longPressStartX = 0;
let longPressStartY = 0;

projectPanels.forEach((panel) => {
  panel.addEventListener("touchstart", (event) => {
    if (!isMobileLayout()) return;

    const touch = event.touches[0];
    longPressStartX = touch.clientX;
    longPressStartY = touch.clientY;
    longPressPanel = panel;

    clearTimeout(longPressTimer);

    longPressTimer = setTimeout(() => {
      projectPanels.forEach((item) => {
        if (item !== panel) item.classList.remove("is-selected");
      });

      panel.classList.toggle("is-selected");
      longPressTimer = null;
    }, 460);
  }, { passive: true });

  panel.addEventListener("touchmove", (event) => {
    if (!longPressTimer) return;

    const touch = event.touches[0];
    const moved =
      Math.abs(touch.clientX - longPressStartX) > 10 ||
      Math.abs(touch.clientY - longPressStartY) > 10;

    if (moved) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }, { passive: true });

  panel.addEventListener("touchend", () => {
    clearTimeout(longPressTimer);
    longPressTimer = null;
    longPressPanel = null;
  });

  panel.addEventListener("touchcancel", () => {
    clearTimeout(longPressTimer);
    longPressTimer = null;
    longPressPanel = null;
  });
});

window.addEventListener("resize", () => {
  if (!isMobileLayout()) {
    projectPanels.forEach((panel) => panel.classList.remove("is-selected"));
  }
});
