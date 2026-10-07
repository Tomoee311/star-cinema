/* showtimes.js - builds the showtimes table for the chosen day and format.
   Uses the data in films.js. Original code for this assignment. */
(function () {
  "use strict";
  var SC = window.SC;
  if (!SC) { return; }

  function $(id) { return document.getElementById(id); }
  function add(parent, tag, text, cls) {
    var el = document.createElement(tag);
    if (text) { el.textContent = text; }
    if (cls) { el.className = cls; }
    parent.appendChild(el);
    return el;
  }

  var chipBox = $("dayChips");
  var formatFilter = $("formatFilter");
  var heading = $("showtimesHeading");
  var caption = $("tableCaption");
  var body = $("showtimesBody");
  var tableWrap = $("tableWrap");
  var empty = $("noShows");
  var summary = $("showSummary");
  var chips = [];
  var current = 0;

  /* Start on the day in the address (?day=fri) if there is one */
  var wanted = new URLSearchParams(window.location.search).get("day");
  SC.days.forEach(function (d, i) { if (d.key === wanted) { current = i; } });

  /* One row for each film on each screen it plays on that day */
  function rowsFor(dayIndex) {
    var rows = [];
    SC.films.forEach(function (film) {
      if (film.status !== "now") { return; }
      var byScreen = {};
      SC.showsFor(film.slug, dayIndex).forEach(function (s) {
        if (!byScreen[s.screen]) {
          byScreen[s.screen] = { film: film, screen: s.screen, format: s.format, times: [] };
          rows.push(byScreen[s.screen]);
        }
        byScreen[s.screen].times.push(s.time);
      });
    });
    return rows;
  }

  function render() {
    var day = SC.days[current];
    var format = formatFilter.value;
    var rows = rowsFor(current).filter(function (r) { return !format || r.format === format; });

    heading.textContent = "Showtimes for " + day.full;
    caption.textContent = "Showtimes for " + day.full + ": film, times, screen and format";
    body.textContent = "";

    rows.forEach(function (r) {
      var tr = add(body, "tr");
      var filmCell = add(tr, "td");
      var link = add(filmCell, "a", r.film.title, "sc-film-link");
      link.href = "details.html?film=" + r.film.slug;
      add(filmCell, "div", r.film.runtime + " · " + r.film.genres, "small sc-muted");

      var timeCell = add(tr, "td");
      r.times.forEach(function (t) {
        var matinee = t < "17:00";
        var a = add(timeCell, "a", t, "sc-chip sc-time" + (matinee ? " is-matinee" : ""));
        a.href = "booking.html?film=" + r.film.slug + "&day=" + day.key + "&time=" + t + "&screen=" + r.screen;
        a.setAttribute("aria-label", "Book " + r.film.title + " on " + day.full + " at " + t + (matinee ? " (matinee)" : ""));
      });

      add(tr, "td", "Screen " + r.screen);
      add(tr, "td", SC.formats[r.format]);
    });

    tableWrap.classList.toggle("d-none", rows.length === 0);
    empty.classList.toggle("d-none", rows.length !== 0);
    summary.textContent = rows.length === 0
      ? "No screenings match your choice."
      : rows.length + (rows.length === 1 ? " screening" : " screenings") + " on " + day.full;
  }

  SC.days.forEach(function (day, i) {
    var chip = add(chipBox, "button", day.label, "sc-chip" + (i === current ? " is-active" : ""));
    chip.type = "button";
    chip.setAttribute("aria-pressed", i === current ? "true" : "false");
    chip.addEventListener("click", function () {
      current = i;
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      render();
    });
    chips.push(chip);
  });

  formatFilter.addEventListener("change", render);
  render();
})();
