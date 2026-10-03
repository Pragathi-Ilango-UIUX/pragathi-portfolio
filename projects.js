const scroller = document.getElementById("projectTimeline");
const progress = document.getElementById("timelineProgress");
const yearButtons = [...document.querySelectorAll(".year-jump button")];
const yearSections = [...document.querySelectorAll(".timeline-panel[data-year]")];
const projectPanels = [...document.querySelectorAll(".project-panel")];

const isMobileLayout = () => window.matchMedia("(max-width: 700px)").matches;

let activeYear = "2022";
let pendingYear = null;

function setActiveYear(year) {
  activeYear = String(year);

  yearButtons.forEach((button) => {
    const selected = button.dataset.year === activeYear;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");

    if (selected) {
      button.setAttribute("aria-current", "true");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function maxScroll() {
  if (!scroller) return 0;
  return Math.max(0, scroller.scrollWidth - scroller.clientWidth);
}

function updateProgress() {
  if (!scroller || isMobileLayout()) return;

  const max = maxScroll();
  const ratio = max > 0 ? scroller.scrollLeft / max : 0;

  if (progress) {
    progress.style.width = `${ratio * 100}%`;
  }
}

function syncYearButtons() {
  if (!scroller || pendingYear) return;

  // Mobile becomes a normal vertical timeline, so choose the latest
  // year marker that has crossed the upper part of the viewport.
  if (isMobileLayout()) {
    const activationY = Math.min(window.innerHeight * 0.22, 150);
    let selected = yearSections[0] || null;

    for (const section of yearSections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= activationY) {
        selected = section;
      } else {
        break;
      }
    }

    if (selected?.dataset.year) setActiveYear(selected.dataset.year);
    return;
  }

  // At the very end of the horizontal track, 2026 cannot always be
  // physically aligned with the left edge because there is no more
  // content after it. Treat the end of the track as the final year.
  if (scroller.scrollLeft >= maxScroll() - 2) {
    const lastSection = yearSections[yearSections.length - 1];
    if (lastSection?.dataset.year) setActiveYear(lastSection.dataset.year);
    return;
  }

  const scrollerRect = scroller.getBoundingClientRect();
  const activationX = scrollerRect.left + Math.min(scroller.clientWidth * 0.22, 260);
  let selected = yearSections[0] || null;

  for (const section of yearSections) {
    const rect = section.getBoundingClientRect();

    if (rect.left <= activationX) {
      selected = section;
    } else {
      break;
    }
  }

  if (selected?.dataset.year) setActiveYear(selected.dataset.year);
}

function revealFooter() {
  if (isMobileLayout()) return;

  document.body.classList.add("footer-revealed");

  requestAnimationFrame(() => {
    const footer = document.querySelector(".site-footer");
    footer?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

function relockTimelineIfBackAtTop() {
  if (isMobileLayout()) return;

  if (
    document.body.classList.contains("footer-revealed") &&
    window.scrollY <= 2
  ) {
    document.body.classList.remove("footer-revealed");
  }
}

if (scroller) {
  let targetX = scroller.scrollLeft;
  let currentX = scroller.scrollLeft;
  let rafId = null;

  function animateToTarget() {
    currentX += (targetX - currentX) * 0.18;

    if (Math.abs(targetX - currentX) < 0.5) {
      currentX = targetX;
      scroller.scrollLeft = currentX;
      rafId = null;
      updateProgress();

      if (pendingYear) {
        const completedYear = pendingYear;
        pendingYear = null;
        setActiveYear(completedYear);
      }

      syncYearButtons();
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
      const atEnd = scroller.scrollLeft >= max - 2;

      if (dominantDelta > 0 && atEnd) {
        event.preventDefault();
        revealFooter();
        return;
      }

      if (dominantDelta < 0 && atStart) {
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
      targetX = Math.min(maxScroll(), targetX + jump);
      requestAnimation();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      targetX = Math.max(0, targetX - jump);
      requestAnimation();
    }
  });

  yearButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const year = button.dataset.year;
      const target = document.getElementById(button.dataset.target);

      if (!year || !target) return;

      setActiveYear(year);

      if (isMobileLayout()) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
        return;
      }

      pendingYear = year;
      setActiveYear(year);

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      targetX = Math.min(maxScroll(), Math.max(0, target.offsetLeft));
      currentX = scroller.scrollLeft;
      requestAnimation();
    });
  });

  updateProgress();
  pendingYear = null;
  syncYearButtons();
}

let longPressTimer = null;
let longPressStartX = 0;
let longPressStartY = 0;

projectPanels.forEach((panel) => {
  panel.addEventListener(
    "touchstart",
    (event) => {
      if (!isMobileLayout()) return;

      const touch = event.touches[0];
      longPressStartX = touch.clientX;
      longPressStartY = touch.clientY;

      clearTimeout(longPressTimer);

      longPressTimer = setTimeout(() => {
        projectPanels.forEach((item) => {
          if (item !== panel) item.classList.remove("is-selected");
        });

        panel.classList.toggle("is-selected");
        longPressTimer = null;
      }, 460);
    },
    { passive: true }
  );

  panel.addEventListener(
    "touchmove",
    (event) => {
      if (!longPressTimer) return;

      const touch = event.touches[0];
      const moved =
        Math.abs(touch.clientX - longPressStartX) > 10 ||
        Math.abs(touch.clientY - longPressStartY) > 10;

      if (moved) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    },
    { passive: true }
  );

  panel.addEventListener("touchend", () => {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  });

  panel.addEventListener("touchcancel", () => {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  });
});

window.addEventListener("scroll", () => {
  relockTimelineIfBackAtTop();
  if (isMobileLayout()) syncYearButtons();
});

window.addEventListener("resize", () => {
  if (!isMobileLayout()) {
    projectPanels.forEach((panel) => panel.classList.remove("is-selected"));
  } else {
    document.body.classList.remove("footer-revealed");
  }

  if (scroller) {
    updateProgress();
    syncYearButtons();
  }
});
