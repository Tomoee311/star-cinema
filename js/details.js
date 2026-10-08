/* details.js - fills details.html for the film named in the address (?film=slug).
   Uses the data in films.js. Original code for this assignment. */
(function () {
  "use strict";
  var SC = window.SC;
  if (!SC) { return; }

  var params = new URLSearchParams(window.location.search);
  var film = SC.film(params.get("film")) || SC.films[0];
  /* The CSS lives in css/, so a relative url() would point to css/images/. Use the full address of the page's own images folder. */
  var backdropUrl = new URL("images/poster-" + film.slug + ".jpg", window.location.href).href;
  document.body.style.setProperty("--film-backdrop", 'url("' + backdropUrl + '")');

  function $(id) { return document.getElementById(id); }
  function add(parent, tag, text, cls) {
    var el = document.createElement(tag);
    if (text) { el.textContent = text; }
    if (cls) { el.className = cls; }
    parent.appendChild(el);
    return el;
  }

  /* Page title and description */
  document.title = film.title + " | starcinema.com";
  var desc = document.querySelector('meta[name="description"]');
  if (desc) {
    desc.setAttribute("content", film.title + " at Star Cinema: synopsis, cast, showtimes and ticket prices at starcinema.com.");
  }

  /* Heading area */
  $("crumbTitle").textContent = film.title;
  $("filmTitle").textContent = film.title;
  $("filmMeta").textContent = film.runtime + " · " + film.genres + " · " + (film.release.match(/20\d\d/) || [""])[0];
  $("filmSynopsis").textContent = film.synopsis;
  $("filmCredits").textContent = "Director: " + film.director + " · Cast: " + film.cast.join(", ");

  var poster = $("filmPoster");
  poster.src = "images/poster-" + film.slug + ".jpg";
  poster.alt = "Poster artwork for " + film.title;

  /* Quick facts */
  var formats = [];
  var screens = [];
  SC.schedule.forEach(function (e) {
    if (e.film !== film.slug) { return; }
    if (formats.indexOf(SC.formats[e.format]) === -1) { formats.push(SC.formats[e.format]); }
    if (screens.indexOf(e.screen) === -1) { screens.push(e.screen); }
  });
  var facts = [
    ["Release", film.release],
    ["Runtime", film.runtime],
    ["Genre", film.genres],
    ["Rating (US)", film.rating],
    ["Language", film.language],
    ["Format", formats.length ? formats.join(", ") : "To be announced"],
    ["Screen", screens.length ? screens.join(", ") : "To be announced"]
  ];
  var list = $("factsList");
  facts.forEach(function (pair) {
    add(list, "dt", pair[0]);
    add(list, "dd", pair[1]);
  });

  /* Video (YouTube embed, only when an ID is set in films.js) */
  var videoBox = $("videoBox");
  if (film.video) {
    var label = film.videoLabel || "trailer";
    $("video-title").textContent = "Watch the " + label;
    var wrap = add(videoBox, "div", "", "ratio ratio-16x9 sc-video-wrap");
    var frame = document.createElement("iframe");
    frame.src = "https://www.youtube-nocookie.com/embed/" + film.video;
    frame.title = film.title + " " + label;
    frame.loading = "lazy";
    frame.setAttribute("allow", "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
    frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    frame.setAttribute("allowfullscreen", "");
    wrap.appendChild(frame);
    var credit = add(videoBox, "p", film.videoCredit + " ", "small sc-muted mt-2 mb-0");
    var yt = add(credit, "a", "Watch on YouTube");
    yt.href = "https://www.youtube.com/watch?v=" + film.video;
    yt.target = "_blank";
    yt.rel = "noopener noreferrer";
  } else {
    $("videoSection").classList.add("d-none");
  }

  /* Showtimes (only for films that are showing now) */
  var bookBtn = $("bookBtn");
  if (film.status === "soon") {
    $("showtimesSection").classList.add("d-none");
    $("soonNote").classList.remove("d-none");
    $("soonNote").textContent = film.title + " opens on " + film.release + ". Showtimes and advance tickets will be announced closer to release.";
    bookBtn.textContent = "Browse all films";
    bookBtn.href = "movies.html";
    bookBtn.className = "btn btn-line w-100 mt-3";
    return;
  }

  bookBtn.href = "booking.html?film=" + film.slug;

  var chipBox = $("dayChips");
  var body = $("showtimesBody");
  var heading = $("showtimesHeading");
  var empty = $("noShows");
  var table = $("showtimesTable");

  function renderDay(index) {
    var day = SC.days[index];
    heading.textContent = "Showtimes for " + day.full;
    body.textContent = "";
    var shows = SC.showsFor(film.slug, index);
    table.classList.toggle("d-none", shows.length === 0);
    empty.classList.toggle("d-none", shows.length !== 0);
    shows.forEach(function (s) {
      var tr = add(body, "tr");
      add(tr, "td", s.time, "fw-semibold");
      add(tr, "td", "Screen " + s.screen);
      add(tr, "td", SC.formats[s.format]);
      add(tr, "td", SC.money(SC.priceFor(s.time)));
      var cell = add(tr, "td");
      var link = add(cell, "a", "Book", "btn btn-gold btn-sm");
      link.href = "booking.html?film=" + film.slug + "&day=" + day.key + "&time=" + s.time + "&screen=" + s.screen;
      link.setAttribute("aria-label", "Book " + film.title + " on " + day.full + " at " + s.time);
    });
  }

  var chips = [];
  SC.days.forEach(function (day, i) {
    var chip = add(chipBox, "button", day.label, "sc-chip" + (i === 0 ? " is-active" : ""));
    chip.type = "button";
    chip.setAttribute("aria-pressed", i === 0 ? "true" : "false");
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      renderDay(i);
    });
    chips.push(chip);
  });
  renderDay(0);
})();
