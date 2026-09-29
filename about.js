/* =========================================================
   ABOUT PAGE
   ========================================================= */

const reduceMotion =
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


/* =========================================================
   HERO TYPEWRITER
   ========================================================= */

const aboutHeadline =
  document.getElementById(
    "aboutHeadline"
  );

const headlineText =
  "Because great ideas deserve to be built just as beautifully as they’re imagined.";

let headlineStarted =
  false;


function typeHeadline() {

  if (
    !aboutHeadline
    ||
    headlineStarted
  ) {
    return;
  }


  headlineStarted =
    true;


  if (
    reduceMotion
  ) {

    aboutHeadline.textContent =
      headlineText;

    return;

  }


  let index =
    0;


  const typeNext =
    () => {

      index++;


      aboutHeadline.textContent =
        headlineText.slice(
          0,
          index
        );


      if (
        index
        <
        headlineText.length
      ) {

        /*
          Slightly varied typing speed so it feels less mechanical.
        */

        const current =
          headlineText[index - 1];


        const delay =
          current === "," || current === "."
            ? 135
            : current === " "
              ? 34
              : 52;


        window.setTimeout(
          typeNext,
          delay
        );

      }

    };


  window.setTimeout(
    typeNext,
    280
  );

}


/* headline starts once the hero is actually visible */

if (aboutHeadline) {

  if (reduceMotion) {

    typeHeadline();

  }
  else {

    const headlineObserver =
      new IntersectionObserver(

        entries => {

          entries.forEach(
            entry => {

              if (
                !entry.isIntersecting
              ) {
                return;
              }


              typeHeadline();


              headlineObserver.unobserve(
                entry.target
              );

            }
          );

        },

        {
          threshold: .35
        }

      );


    headlineObserver.observe(
      aboutHeadline
    );

  }

}


/* =========================================================
   GENERIC REVEALS
   ========================================================= */

const revealItems =
  document.querySelectorAll(
    ".reveal, .reveal-card"
  );


if (
  reduceMotion
) {

  revealItems.forEach(
    item => {

      item.classList.add(
        "is-visible"
      );

    }
  );

}
else {

  const revealObserver =
    new IntersectionObserver(

      entries => {

        entries.forEach(
          entry => {

            if (
              !entry.isIntersecting
            ) {
              return;
            }


            entry.target.classList.add(
              "is-visible"
            );


            revealObserver.unobserve(
              entry.target
            );

          }
        );

      },

      {
        threshold: .14,
        rootMargin: "0px 0px -8% 0px"
      }

    );


  revealItems.forEach(
    item => {

      revealObserver.observe(
        item
      );

    }
  );

}


/* =========================================================
   SKILLS — ORDERED TOP-LEFT → BOTTOM-RIGHT
   ========================================================= */

const skillCards =
  document.querySelectorAll(
    ".stagger-card"
  );


if (
  reduceMotion
) {

  skillCards.forEach(
    card => {

      card.classList.add(
        "is-visible"
      );

    }
  );

}
else {

  const skillsGrid =
    document.querySelector(
      ".skills-grid"
    );


  if (
    skillsGrid
    &&
    skillCards.length
  ) {

    const skillsObserver =
      new IntersectionObserver(

        entries => {

          entries.forEach(
            entry => {

              if (
                !entry.isIntersecting
              ) {
                return;
              }


              skillCards.forEach(
                (card, index) => {

                  window.setTimeout(
                    () => {

                      card.classList.add(
                        "is-visible"
                      );

                    },

                    index * 145
                  );

                }
              );


              skillsObserver.unobserve(
                entry.target
              );

            }
          );

        },

        {
          threshold: .18,
          rootMargin: "0px 0px -10% 0px"
        }

      );


    skillsObserver.observe(
      skillsGrid
    );

  }

}


/* =========================================================
   SIGNATURE WRITE-ON
   ========================================================= */

const aboutSignature =
  document.getElementById(
    "aboutSignature"
  );


if (
  aboutSignature
) {

  if (
    reduceMotion
  ) {

    aboutSignature.classList.add(
      "write-on"
    );

  }
  else {

    const signatureObserver =
      new IntersectionObserver(

        entries => {

          entries.forEach(
            entry => {

              if (
                !entry.isIntersecting
              ) {
                return;
              }


              entry.target.classList.add(
                "write-on"
              );


              signatureObserver.unobserve(
                entry.target
              );

            }
          );

        },

        {
          threshold: .45
        }

      );


    signatureObserver.observe(
      aboutSignature
    );

  }

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

const menuButton =
  document.querySelector(
    ".menu-button"
  );

const mainNav =
  document.querySelector(
    ".main-nav"
  );


menuButton?.addEventListener(
  "click",
  () => {

    const expanded =
      menuButton.getAttribute(
        "aria-expanded"
      )
      ===
      "true";


    menuButton.setAttribute(
      "aria-expanded",
      String(
        !expanded
      )
    );


    mainNav?.classList.toggle(
      "mobile-open"
    );

  }
);


mainNav
  ?.querySelectorAll("a")
  .forEach(
    link => {

      link.addEventListener(
        "click",
        () => {

          mainNav.classList.remove(
            "mobile-open"
          );


          menuButton?.setAttribute(
            "aria-expanded",
            "false"
          );

        }
      );

    }
  );
