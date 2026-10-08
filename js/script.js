/* script.js - Star Cinema (original code for this assignment)
   1) dark / light theme  2) scroll reveal  3) command-style search */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");

  /* 0. Page identity + cinematic navigation transition */
  var pageName = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  var pageClass = pageName.replace(/\.html$/, "").replace(/[^a-z0-9-]/g, "-") || "index";
  document.body.classList.add(pageClass === "index" ? "home-page" : pageClass + "-page");

  var curtain = document.createElement("div");
  curtain.className = "sc-page-curtain";
  curtain.setAttribute("aria-hidden", "true");
  document.body.appendChild(curtain);
  /* The curtain opens itself with a CSS animation (see style.css), so nothing to do on load. */

  /* Back / forward button: the browser can bring the page back exactly as it was when
     we left it, with the dark curtain still closed. Always open it when the page is
     shown, becomes visible, or regains focus. */
  function openCurtain() {
    curtain.classList.remove("is-closing");
    curtain.classList.add("is-open");
  }
  window.addEventListener("pageshow", function (e) {
    if (e.persisted || curtain.classList.contains("is-closing")) {
      openCurtain();
      window.setTimeout(openCurtain, 50);
    }
  });
  window.addEventListener("focus", function () { if (curtain.classList.contains("is-closing")) { openCurtain(); } });
  window.addEventListener("popstate", openCurtain);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) { openCurtain(); }
  });

  /* Home stage: navbar floats transparent over the picture and turns solid after scrolling */
  var stageNav = document.querySelector(".sc-navbar");
  function navState() {
    if (stageNav && document.body.classList.contains("has-stage")) {
      stageNav.classList.toggle("is-scrolled", window.scrollY > 40);
    }
  }
  navState();
  window.addEventListener("scroll", navState, { passive: true });

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[href]");
    if (!link || e.defaultPrevented || link.hasAttribute("data-no-fade") || link.target === "_blank" || link.hasAttribute("download")) { return; }
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(https?:|mailto:|tel:|javascript:)/i.test(href)) { return; }
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { return; }
    e.preventDefault();
    curtain.classList.remove("is-open");
    curtain.classList.add("is-closing");
    /* Give the curtain enough time to read as a deliberate page transition. */
    window.setTimeout(function () { window.location.href = href; }, 360);
    /* Safety: if we are still on this page a moment later (for example the person came
       back with the Back button and the page was restored from memory), open the curtain.
       Timers pause while a page is stored, so this fires right after it comes back. */
    window.setTimeout(openCurtain, 1500);
  });

  /* 1. Theme toggle (remembered in the browser) */
  var toggle = document.getElementById("themeToggle");

  function applyTheme(theme) {
    root.setAttribute("data-bs-theme", theme);
    if (toggle) {
      toggle.querySelector("i").className =
        theme === "dark" ? "bi bi-moon-stars-fill" : "bi bi-sun-fill";
      toggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  }

  var saved = null;
  try {
    saved = localStorage.getItem("sc-theme");
  } catch (e) {
    /* storage not available: ignore */
  }
  applyTheme(saved === "light" ? "light" : "dark");

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem("sc-theme", next);
      } catch (e) {
        /* storage not available: ignore */
      }
    });
  }

  /* 2. Fade-up reveal when elements scroll into view */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );
    items.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    items.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Cinematic auto-reveal: motion without changing page markup. */
  var motionTargets = document.querySelectorAll(
    ".sc-card, .movie-item, #main > section:not(.stage), .sc-table-wrap, .sc-summary, .sc-map-wrap"
  );
  if ("IntersectionObserver" in window) {
    var motionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          motionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    motionTargets.forEach(function (el, i) {
      el.classList.add("sc-auto-reveal");
      el.style.setProperty("--sc-delay", Math.min((i % 6) * 55, 275) + "ms");
      motionObserver.observe(el);
    });
  }

  /* 3. Command-style search: type a film name to filter,
        or a page name (e.g. "showtimes") and press Go */
  var form = document.getElementById("commandForm");
  var input = document.getElementById("movieSearch");
  var movies = document.querySelectorAll(".movie-item");
  var empty = document.getElementById("noResults");
  var commands = {
    "movies": "movies.html",
    "now showing": "movies.html",
    "showtimes": "showtimes.html",
    "prices": "showtimes.html",
    "book": "booking.html",
    "booking": "booking.html",
    "book seats": "booking.html",
    "my booking": "my-booking.html",
    "about": "about.html",
    "contact": "contact.html"
  };

  function filterMovies() {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    movies.forEach(function (m) {
      var match = !q || m.getAttribute("data-title").toLowerCase().indexOf(q) !== -1;
      m.classList.toggle("d-none", !match);
      if (match) {
        shown++;
      }
    });
    if (empty) {
      empty.classList.toggle("d-none", shown !== 0);
    }
    return shown;
  }

  if (form && input) {
    input.addEventListener("input", filterMovies);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim().toLowerCase();
      if (commands[q]) {
        window.location.href = commands[q];
        return;
      }
      if (filterMovies() === 1) {
        var only = document.querySelector(".movie-item:not(.d-none)");
        window.location.href = "details.html?film=" + only.getAttribute("data-slug");
      }
    });
  }

  /* 4. Movies page: search, genre/format filters, status chips and sorting */
  var filterForm = document.getElementById("filterForm");
  if (filterForm) {
    var cards = [].slice.call(document.querySelectorAll(".movie-item"));
    var titleSearch = document.getElementById("titleSearch");
    var genreFilter = document.getElementById("genreFilter");
    var formatFilter = document.getElementById("formatFilter");
    var sortBy = document.getElementById("sortBy");
    var chips = [].slice.call(filterForm.querySelectorAll("[data-status]"));
    var clearBtn = document.getElementById("clearFilters");
    var countEl = document.getElementById("resultCount");
    var noMovies = document.getElementById("noMovies");
    var sections = [].slice.call(document.querySelectorAll("[data-section]"));
    var statusFilter = "all";

    function cardMatches(card) {
      var q = titleSearch.value.trim().toLowerCase();
      var okStatus = statusFilter === "all" || card.getAttribute("data-status") === statusFilter;
      var okTitle = !q || card.getAttribute("data-title").toLowerCase().indexOf(q) !== -1;
      var okGenre = !genreFilter.value ||
        card.getAttribute("data-genre").split(" ").indexOf(genreFilter.value) !== -1;
      var okFormat = !formatFilter.value ||
        card.getAttribute("data-format").split(" ").indexOf(formatFilter.value) !== -1;
      return okStatus && okTitle && okGenre && okFormat;
    }

    function sortGrids() {
      var mode = sortBy.value;
      [].slice.call(document.querySelectorAll(".movie-grid")).forEach(function (grid) {
        var kids = [].slice.call(grid.children);
        kids.sort(function (a, b) {
          if (mode === "az") {
            return a.getAttribute("data-title").localeCompare(b.getAttribute("data-title"));
          }
          if (mode === "short") {
            return a.getAttribute("data-runtime") - b.getAttribute("data-runtime");
          }
          if (mode === "long") {
            return b.getAttribute("data-runtime") - a.getAttribute("data-runtime");
          }
          return a.getAttribute("data-order") - b.getAttribute("data-order");
        });
        kids.forEach(function (k) { grid.appendChild(k); });
      });
    }

    function updateMovies() {
      sortGrids();
      var shown = 0;
      cards.forEach(function (card) {
        var ok = cardMatches(card);
        card.classList.toggle("d-none", !ok);
        if (ok) { shown++; }
      });
      sections.forEach(function (sec) {
        var visible = sec.querySelectorAll(".movie-item:not(.d-none)").length;
        sec.classList.toggle("d-none", visible === 0);
      });
      countEl.textContent = "Showing " + shown + " of " + cards.length + " films";
      noMovies.classList.toggle("d-none", shown !== 0);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        statusFilter = chip.getAttribute("data-status");
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle("is-active", on);
          c.setAttribute("aria-pressed", on ? "true" : "false");
        });
        updateMovies();
      });
    });

    [titleSearch, genreFilter, formatFilter, sortBy].forEach(function (el) {
      el.addEventListener("input", updateMovies);
      el.addEventListener("change", updateMovies);
    });

    clearBtn.addEventListener("click", function () {
      titleSearch.value = "";
      genreFilter.value = "";
      formatFilter.value = "";
      sortBy.value = "default";
      chips[0].click();
    });

    updateMovies();
  }
})();
