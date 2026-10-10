/* hero.js - the full-screen film stage on the home page.
   Backdrop fades through black, the big number and title roll out and in,
   the poster rail slides, and "More" zooms into the details page.
   Uses the film data in films.js. Original code for this assignment. */
(function () {
  "use strict";
  var SC = window.SC;
  var stage = document.getElementById("stage");
  if (!SC || !stage) { return; }

  var films = SC.films;
  var n = films.length;
  var DURATION = 7000;                       /* time each film stays on screen */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canAnimate = !!Element.prototype.animate && !reduce;

  /* Each backdrop has a slightly different composition.  These profiles keep
     the important artwork away from the copy while avoiding the "same overlay
     on every movie" look. */
  var BACKDROP_PROFILES = {
    "spider-man-brand-new-day": { size: "cover", position: "58% center", left: .70, mid: .34, right: .10, top: .58, bottom: .48 },
    "the-odyssey":              { size: "cover", position: "54% center", left: .78, mid: .38, right: .08, top: .58, bottom: .52 },
    "toy-story-5":              { size: "108% auto", position: "50% center", left: .78, mid: .34, right: .08, top: .50, bottom: .46 },
    "resident-evil":            { size: "112% auto", position: "0% center", left: .76, mid: .38, right: .08, top: .58, bottom: .52 },
    "backrooms":                { size: "cover", position: "58% center", left: .82, mid: .46, right: .12, top: .62, bottom: .54 },
    "obsession":                { size: "108% auto", position: "0% center", left: .74, mid: .40, right: .08, top: .60, bottom: .52 },
    "cerita-lila":              { size: "cover", position: "56% center", left: .88, mid: .50, right: .12, top: .66, bottom: .58 },
    "avengers-doomsday":        { size: "cover", position: "54% center", left: .80, mid: .40, right: .08, top: .60, bottom: .50 }
  };


  function $(id) { return document.getElementById(id); }
  var el = {
    when: $("stWhen"), count: $("stCount"), title: $("stTitle"), genre: $("stGenre"), meta: $("stMeta"),
    times: $("stTimes"), book: $("stBook"), more: $("stMore"), rail: $("stRail"),
    prev: $("stPrev"), next: $("stNext"), pause: $("stPause"), live: $("stLive"),
    layers: [$("layerA"), $("layerB")]
  };

  var cur = 0;
  var busy = false;
  var paused = false;
  var timer = null;
  var topLayer = 0;
  var todayIndex = (new Date().getDay() + 6) % 7;         /* Monday = 0, like films.js */

  function two(i) { return (i < 9 ? "0" : "") + (i + 1); }
  function poster(f) { return "images/poster-" + f.slug + ".jpg"; }
  /* wide 2560x1440 backdrop made for this film (images/backdrop-<slug>.jpg).
     To use a real still instead, just replace that file with your own 16:9 picture. */
  function backdrop(f) { return "images/backdrop-" + f.slug + ".jpg"; }

  /* preload every backdrop and poster so slides never flash or show a low-res frame */
  films.forEach(function (f) {
    var b = new Image(); b.decoding = "async"; b.src = backdrop(f);
    var im = new Image(); im.src = poster(f);
  });

  /* ---------- what to show for one film ---------- */
  function sessionFor(f) {
    if (f.status === "soon") { return { label: f.opens || "Coming soon", shows: [], dayKey: "" }; }
    for (var d = 0; d < 7; d++) {
      var idx = (todayIndex + d) % 7;
      var shows = SC.showsFor(f.slug, idx);
      if (shows.length) {
        return { label: d === 0 ? "Today" : d === 1 ? "Tomorrow" : SC.days[idx].full, shows: shows, dayKey: SC.days[idx].key };
      }
    }
    return { label: "Now showing", shows: [], dayKey: "" };
  }

  function fillTimes(f, info) {
    el.times.textContent = "";
    var li, a;
    if (!info.shows.length) {
      li = document.createElement("li");
      a = document.createElement("span");
      a.textContent = f.status === "soon" ? "Tickets open closer to release" : "See showtimes";
      li.appendChild(a);
      el.times.appendChild(li);
      return;
    }
    info.shows.slice(0, 5).forEach(function (s) {
      li = document.createElement("li");
      a = document.createElement("a");
      a.textContent = s.time;
      a.href = "booking.html?film=" + f.slug + "&day=" + info.dayKey + "&time=" + s.time + "&screen=" + s.screen;
      a.setAttribute("aria-label", "Book " + f.title + " at " + s.time + ", screen " + s.screen);
      li.appendChild(a);
      el.times.appendChild(li);
    });
  }

  function fillMeta(f) {
    el.meta.textContent = "";
    var info = SC.ratingInfo(f.rating);
    var rli = document.createElement("li");
    rli.className = "sc-rating sc-rating--" + info.cls;
    rli.title = info.tip;
    rli.textContent = info.label;
    el.meta.appendChild(rli);
    [f.runtime, f.language].forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      el.meta.appendChild(li);
    });
  }

  function setText(i) {
    var f = films[i];
    var info = sessionFor(f);
    el.when.textContent = info.label;
    el.title.textContent = f.title;
    el.genre.textContent = "";
    el.genre.appendChild(SC.starsEl(f.stars, false));
    var g = document.createElement("span");
    g.className = "stage-genre-text";
    g.textContent = "Genre: " + f.genres;
    el.genre.appendChild(g);
    fillMeta(f);
    fillTimes(f, info);
    var d = two(i);
    el.count.children[0].firstElementChild.textContent = d.charAt(0);
    el.count.children[1].firstElementChild.textContent = d.charAt(1);
    if (f.status === "soon") {
      el.book.textContent = "Film details";
      el.book.href = "details.html?film=" + f.slug;
    } else {
      el.book.textContent = "Book now";
      el.book.href = "booking.html?film=" + f.slug;
    }
    el.more.href = "details.html?film=" + f.slug;
    el.live.textContent = d + ". " + f.title;
  }

  /* ---------- backdrop: new picture fades up from blur ---------- */
  function setBackdrop(i, instant) {
    var f = films[i];
    var profile = BACKDROP_PROFILES[f.slug] || BACKDROP_PROFILES["spider-man-brand-new-day"];
    var next = el.layers[1 - topLayer];
    var old = el.layers[topLayer];

    next.style.backgroundImage = "url('" + backdrop(f) + "')";
    next.style.setProperty("--backdrop-size", profile.size);
    next.style.setProperty("--backdrop-position", profile.position);
    next.style.setProperty("--shade-left", profile.left);
    next.style.setProperty("--shade-mid", profile.mid);
    next.style.setProperty("--shade-right", profile.right);
    next.style.setProperty("--shade-top", profile.top);
    next.style.setProperty("--shade-bottom", profile.bottom);
    next.setAttribute("data-film", f.slug);
    next.classList.add("is-on");
    old.classList.remove("is-on");
    topLayer = 1 - topLayer;
    if (canAnimate && !instant) {
      next.animate(
        [{ opacity: 0, transform: "scale(1.08)", filter: "blur(8px)" },
         { opacity: 1, transform: "scale(1)", filter: "blur(0px)" }],
        { duration: 1300, easing: "cubic-bezier(0.2,0.7,0.2,1)", fill: "none" }
      );
      old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: "ease-in", fill: "none" });
    }
  }

  /* ---------- poster rail: films after the current one ---------- */
  function railItems(c) {
    var out = [];
    for (var k = 1; k < n; k++) { out.push((c + k) % n); }
    return out;
  }

  function makeCard(i) {
    var a = document.createElement("a");
    a.className = "rail-card";
    a.href = "details.html?film=" + films[i].slug;
    a.setAttribute("data-i", String(i));
    a.setAttribute("aria-label", "Show " + films[i].title);
    var no = document.createElement("span");
    no.className = "rail-no";
    no.textContent = two(i);
    var img = document.createElement("img");
    img.src = poster(films[i]);
    img.alt = "";
    img.width = 164;
    img.height = 246;
    a.appendChild(no);
    a.appendChild(img);
    return a;
  }

  function buildRail(list) {
    el.rail.textContent = "";
    list.forEach(function (i) { el.rail.appendChild(makeCard(i)); });
  }

  function step() {
    var c = el.rail.firstElementChild;
    if (!c) { return 178; }
    return c.getBoundingClientRect().width + 14;
  }

  /* ---------- text roll out / in ---------- */
  function rollTargets() {
    return [el.when, el.count.children[0].firstElementChild, el.count.children[1].firstElementChild, el.title];
  }

  function fadeTargets() {
    return [el.genre, el.meta, el.times];
  }

  function run(elm, frames, opts) {
    var a = elm.animate(frames, opts);
    return a;
  }

  function outAll() {
    rollTargets().forEach(function (t, k) {
      run(t, [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-110%)", opacity: 0 }],
        { duration: 380, delay: k * 40, easing: "cubic-bezier(0.7,0,0.84,0)", fill: "forwards" });
    });
    fadeTargets().forEach(function (t, k) {
      run(t, [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-10px)" }],
        { duration: 300, delay: k * 50, easing: "ease-in", fill: "forwards" });
    });
  }

  function inAll() {
    rollTargets().forEach(function (t, k) {
      t.getAnimations().forEach(function (a) { a.cancel(); });
      run(t, [{ transform: "translateY(110%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
        { duration: 750, delay: 80 + k * 70, easing: "cubic-bezier(0.16,1,0.3,1)", fill: "backwards" });
    });
    fadeTargets().forEach(function (t, k) {
      t.getAnimations().forEach(function (a) { a.cancel(); });
      run(t, [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 700, delay: 300 + k * 90, easing: "cubic-bezier(0.16,1,0.3,1)", fill: "backwards" });
    });
  }

  /* ---------- go to another film ---------- */
  function go(target, dir) {
    if (busy || target === cur) { return; }
    var forward = dir !== -1;
    var k = forward ? (target - cur + n) % n : 1;
    var from = cur;
    busy = true;
    stopTimer();

    if (!canAnimate) {
      cur = target;
      setText(cur);
      setBackdrop(cur, true);
      buildRail(railItems(cur));
      busy = false;
      startTimer();
      return;
    }

    outAll();

    /* rail slides one (or k) posters to the left, or one back in for "previous" */
    var w = step();
    if (forward) {
      var cards = el.rail.children;
      for (var j = 0; j < k && j < cards.length; j++) { cards[j].classList.add("is-leaving"); }
      el.rail.style.transform = "translateX(" + (-k * w) + "px)";
    } else {
      el.rail.classList.add("no-anim");
      el.rail.insertBefore(makeCard(from), el.rail.firstChild);
      el.rail.style.transform = "translateX(" + (-w) + "px)";
      void el.rail.offsetWidth;
      el.rail.classList.remove("no-anim");
      el.rail.style.transform = "translateX(0)";
    }

    window.setTimeout(function () {
      cur = target;
      setText(cur);
      setBackdrop(cur, false);
      inAll();
    }, 480);

    window.setTimeout(function () {
      el.rail.classList.add("no-anim");
      el.rail.style.transform = "";
      buildRail(railItems(cur));
      void el.rail.offsetWidth;
      el.rail.classList.remove("no-anim");
      busy = false;
      startTimer();
    }, 900);
  }

  function next() { go((cur + 1) % n, 1); }
  function prev() { go((cur - 1 + n) % n, -1); }

  /* ---------- autoplay with a progress ring on the next button ---------- */
  function startTimer() {
    stopTimer();
    if (paused || document.hidden) { return; }
    stage.style.setProperty("--dur", DURATION + "ms");
    stage.classList.remove("is-playing");
    void stage.offsetWidth;
    stage.classList.add("is-playing");
    timer = window.setTimeout(next, DURATION);
  }

  function stopTimer() {
    if (timer) { window.clearTimeout(timer); timer = null; }
    stage.classList.remove("is-playing");
  }

  el.next.addEventListener("click", next);
  el.prev.addEventListener("click", prev);

  el.pause.addEventListener("click", function () {
    paused = !paused;
    el.pause.setAttribute("aria-pressed", paused ? "true" : "false");
    el.pause.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
    if (paused) { stopTimer(); } else if (!busy) { startTimer(); }
  });

  el.rail.addEventListener("click", function (e) {
    var card = e.target.closest ? e.target.closest(".rail-card") : null;
    if (!card) { return; }
    e.preventDefault();
    go(Number(card.getAttribute("data-i")), 1);
  });

  /* Autoplay is controlled by the pause button only. Hovering the hero no
     longer silently stops the timer, so the first slide auto-runs immediately. */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { stopTimer(); } else if (!paused && !busy) { startTimer(); }
  });
  stage.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { next(); } else if (e.key === "ArrowLeft") { prev(); }
  });

  /* ---------- "More": rail and text fade away, picture zooms, then the details page opens ---------- */
  el.more.addEventListener("click", function (e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) { return; }
    e.preventDefault();
    if (busy) { return; }
    busy = true;
    stopTimer();
    var href = el.more.href;
    try { window.sessionStorage.setItem("sc-from", "hero"); } catch (err) { /* ignore */ }
    stage.classList.add("is-diving");
    window.setTimeout(function () { window.location.href = href; }, canAnimate ? 350 : 0);
  });

  window.addEventListener("pageshow", function (e) {
    if (e.persisted) {
      stage.classList.remove("is-diving");
      busy = false;
      startTimer();
    }
  });

  /* ---------- start ---------- */
  setText(0);
  var first = el.layers[0];
  var firstProfile = BACKDROP_PROFILES[films[0].slug] || BACKDROP_PROFILES["spider-man-brand-new-day"];
  first.style.backgroundImage = "url('" + backdrop(films[0]) + "')";
  first.style.setProperty("--backdrop-size", firstProfile.size);
  first.style.setProperty("--backdrop-position", firstProfile.position);
  first.style.setProperty("--shade-left", firstProfile.left);
  first.style.setProperty("--shade-mid", firstProfile.mid);
  first.style.setProperty("--shade-right", firstProfile.right);
  first.style.setProperty("--shade-top", firstProfile.top);
  first.style.setProperty("--shade-bottom", firstProfile.bottom);
  first.setAttribute("data-film", films[0].slug);
  buildRail(railItems(0));
  var railView = document.getElementById("railView");
  var railPrev = document.getElementById("railPrev");
  var railNext = document.getElementById("railNext");
  function scrollRail(direction) {
    if (!railView) { return; }
    var card = el.rail && el.rail.querySelector(".rail-card");
    var distance = card ? card.getBoundingClientRect().width + 14 : 178;
    railView.scrollBy({ left: direction * distance * 2, behavior: reduce ? "auto" : "smooth" });
  }
  if (railPrev) railPrev.addEventListener("click", function () { scrollRail(-1); });
  if (railNext) railNext.addEventListener("click", function () { scrollRail(1); });

  /* Posters can be dragged with the mouse too (phones/tablets just swipe: the rail scrolls by itself).
     A drag does not open the poster you let go on. */
  if (railView) {
    var dragFrom = null, dragStart = 0, dragged = false;
    railView.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) { return; }
      dragFrom = e.clientX; dragStart = railView.scrollLeft; dragged = false;
    });
    window.addEventListener("pointermove", function (e) {
      if (dragFrom === null) { return; }
      var dx = e.clientX - dragFrom;
      if (!dragged && Math.abs(dx) > 5) { dragged = true; railView.classList.add("is-dragging"); }
      if (dragged) { railView.scrollLeft = dragStart - dx; }
    });
    window.addEventListener("pointerup", function () {
      if (dragFrom === null) { return; }
      dragFrom = null;
      railView.classList.remove("is-dragging");
      if (dragged) { window.setTimeout(function () { dragged = false; }, 0); }
    });
    railView.addEventListener("click", function (e) {
      if (dragged) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    railView.addEventListener("dragstart", function (e) { e.preventDefault(); });
  }
  startTimer();
})();
