const header = document.querySelector("#site-header");
const progress = document.querySelector(".page-progress");
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const mobileLinks = document.querySelectorAll(".mobile-nav a");
const sectionLinks = document.querySelectorAll('.desktop-nav a[href^="#"]');
const revealElements = document.querySelectorAll(".reveal");
const videoFrame = document.querySelector("[data-video-frame]");
const conceptVideo = document.querySelector("#concept-video");
const videoPlay = document.querySelector(".film-play");

function updateScrollState() {
  const scrollTop = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;

  header.classList.toggle("scrolled", scrollTop > 24);
  progress.style.width = `${percent}%`;
}

function setMenu(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  mobileNav.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
}

menuToggle.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

mobileLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

if (videoFrame && conceptVideo && videoPlay) {
  videoPlay.addEventListener("click", async () => {
    delete videoFrame.dataset.videoError;
    videoFrame.classList.add("is-playing");
    conceptVideo.controls = true;
    conceptVideo.muted = false;

    try {
      await conceptVideo.play();
    } catch (error) {
      if (error.name === "NotAllowedError") {
        conceptVideo.muted = true;

        try {
          await conceptVideo.play();
          return;
        } catch (mutedError) {
          error = mutedError;
        }
      }

      videoFrame.classList.remove("is-playing");
      conceptVideo.controls = false;
      videoFrame.dataset.videoError = `${error.name}: ${error.message}`;
      console.error("Video playback failed:", error);
    }
  });

  conceptVideo.addEventListener("ended", () => {
    videoFrame.classList.remove("is-playing");
    conceptVideo.controls = false;
    conceptVideo.load();
  });

  conceptVideo.addEventListener("pause", () => {
    if (!conceptVideo.ended && conceptVideo.currentTime > 0) {
      videoFrame.classList.remove("is-playing");
    }
  });

  conceptVideo.addEventListener("play", () => {
    videoFrame.classList.add("is-playing");
  });
}

window.addEventListener("resize", () => {
  if (window.innerWidth > 1150) setMenu(false);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.08,
  },
);

revealElements.forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(element);
});

const navigationSections = [...sectionLinks]
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (navigationSections.length) {
  const navigationObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (!visibleEntry) return;

      sectionLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${visibleEntry.target.id}`;
        link.classList.toggle("active", active);

        if (active) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },
    {
      rootMargin: "-28% 0px -60% 0px",
      threshold: [0, 0.1, 0.35],
    },
  );

  navigationSections.forEach((section) => navigationObserver.observe(section));
}

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();
