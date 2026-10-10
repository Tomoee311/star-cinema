/* booking.js - the booking page: choose a screening, pick seats on the seat map, confirm.
   Uses the data in films.js and the booking service in api.js. Original code for this assignment. */
(function () {
  "use strict";
  var SC = window.SC;
  if (!SC || !SC.api) { return; }

  function $(id) { return document.getElementById(id); }
  function add(parent, tag, text, cls) {
    var el = document.createElement(tag);
    if (text) { el.textContent = text; }
    if (cls) { el.className = cls; }
    parent.appendChild(el);
    return el;
  }

  var MESSAGES = {
    no_seats: "Please choose at least one seat.",
    too_many_seats: "You can book up to " + SC.maxSeats + " seats at a time.",
    bad_seat: "One of the seats is not valid. Please choose again.",
    bad_name: "Please enter your full name (2 to 60 characters).",
    bad_email: "Please enter a valid email address.",
    unknown_show: "That screening does not exist. Please choose another time.",
    seat_taken: "Sorry, one of your seats was just booked by someone else. Please choose different seats.",
    agree: "Please tick the box to confirm you understand this is a demonstration.",
    bad_combos: "You can add at most one combo for each seat.",
    server_error: "Something went wrong on our side. Please try again in a moment."
  };

  var showable = SC.films.filter(function (f) { return f.status === "now"; });
  var params = new URLSearchParams(window.location.search);

  var film = SC.film(params.get("film"));
  if (!film || film.status !== "now") { film = showable[0]; }
  var todayIndex = (new Date().getDay() + 6) % 7;          /* Monday = 0, like films.js */
  var dayIndex = SC.dayIndex(params.get("day"));
  if (dayIndex < 0) { dayIndex = todayIndex; }
  var wantedTime = params.get("time");
  var wantedScreen = params.get("screen");

  var filmSelect = $("filmSelect");
  var dayChips = $("dayChips");
  var timeChips = $("timeChips");
  var showInfo = $("showInfo");
  var timeValue = "";                                      /* chosen screening, "time|screen" */
  var freshShow = true;                                    /* play the seat entrance animation */
  var payOverlay = $("payOverlay");
  var seatMap = $("seatMap");
  var seatStatus = $("seatStatus");
  var noShowNote = $("noShowNote");
  var form = $("bookingForm");
  var formError = $("formError");
  var confirmBtn = $("confirmBtn");
  var modeNote = $("modeNote");

  var selected = [];
  var combos = 0;                                          /* popcorn + drink sets */
  var taken = [];
  var loadToken = 0;

  /* ---------- helpers ---------- */
  function seatOrder(a, b) {
    var ra = SC.seatRows.indexOf(a.charAt(0));
    var rb = SC.seatRows.indexOf(b.charAt(0));
    return ra !== rb ? ra - rb : Number(a.slice(1)) - Number(b.slice(1));
  }

  function currentShow() {
    var value = timeValue;
    if (!value) { return null; }
    var parts = value.split("|");
    var shows = SC.showsFor(film.slug, dayIndex);
    for (var i = 0; i < shows.length; i++) {
      if (shows[i].time === parts[0] && String(shows[i].screen) === parts[1]) {
        return { film: film.slug, day: SC.days[dayIndex].key, time: shows[i].time, screen: shows[i].screen, format: shows[i].format };
      }
    }
    return null;
  }

  function showError(text) {
    formError.textContent = text;
    formError.classList.toggle("d-none", !text);
  }

  function updateModeNote() {
    if (SC.apiMode === "local") {
      modeNote.textContent = "Demo mode: the booking service is not connected here, so bookings are saved only in this browser. On the live website every visitor shares the same seats.";
      modeNote.classList.remove("d-none");
    } else {
      modeNote.classList.add("d-none");
    }
  }

  /* ---------- the three drop-downs ---------- */
  function fillFilms() {
    filmSelect.textContent = "";
    showable.forEach(function (f) {
      var o = add(filmSelect, "option", f.title);
      o.value = f.slug;
      if (f.slug === film.slug) { o.selected = true; }
    });
  }

  /* Day chips start with today: big date number, weekday under it */
  function fillDays() {
    dayChips.textContent = "";
    var now = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    $("monthName").textContent = months[now.getMonth()];
    for (var k = 0; k < 7; k++) {
      var i = (todayIndex + k) % 7;
      var date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + k);
      var b = add(dayChips, "button", "", "bk-day" + (i === dayIndex ? " is-active" : ""));
      b.type = "button";
      add(b, "b", String(date.getDate()));
      add(b, "small", SC.days[i].label);
      b.setAttribute("data-day", String(i));
      b.setAttribute("aria-pressed", i === dayIndex ? "true" : "false");
      b.setAttribute("aria-label", SC.days[i].full + " " + date.getDate() + (k === 0 ? ", today" : ""));
    }
  }

  function fillTimes() {
    timeChips.textContent = "";
    timeValue = "";
    var shows = SC.showsFor(film.slug, dayIndex);
    if (shows.length === 0) {
      add(timeChips, "p", "No screenings on this day", "bk-none");
      showInfo.textContent = "";
      return;
    }
    var chosen = null;
    shows.forEach(function (s) {
      var value = s.time + "|" + s.screen;
      var b = add(timeChips, "button", s.time, "bk-time");
      b.type = "button";
      b.setAttribute("data-value", value);
      b.setAttribute("aria-label", s.time + ", screen " + s.screen + ", " + SC.formats[s.format]);
      if (!chosen && s.time === wantedTime && String(s.screen) === wantedScreen) { chosen = value; }
    });
    wantedTime = null;       /* only use the address once */
    pickTime(chosen || (shows[0].time + "|" + shows[0].screen));
  }

  function pickTime(value) {
    timeValue = value;
    [].forEach.call(timeChips.querySelectorAll(".bk-time"), function (b) {
      var on = b.getAttribute("data-value") === value;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var show = currentShow();
    showInfo.textContent = show ? "Screen " + show.screen + " · " + SC.formats[show.format] : "";
  }

  /* ---------- seat map ---------- */
  function renderMap() {
    seatMap.textContent = "";
    seatMap.classList.toggle("is-entering", freshShow);
    freshShow = false;
    var show = currentShow();
    noShowNote.classList.toggle("d-none", !!show);
    if (!show) { return; }

    SC.renderSeatMap(seatMap, { time: show.time, taken: taken, selected: selected });
  }

  function renderSummary() {
    var show = currentShow();
    $("sumFilm").textContent = film.title;
    $("sumWhen").textContent = show
      ? SC.days[dayIndex].full + " · " + show.time + " · Screen " + show.screen + " · " + SC.formats[show.format]
      : SC.days[dayIndex].full + " · no screening";

    var seats = selected.slice().sort(seatOrder);
    $("sumSeats").textContent = seats.length ? "Seats: " + seats.join(", ") : "No seats chosen yet";

    if (combos > seats.length) { combos = seats.length; }
    /* one line under the other: "2 × Standard seat (A6, C8) · 15,000 MMK each" then the recliners, then the combo */
    var lines = (show && seats.length) ? SC.summaryLines(seats, show.time, combos) : [];
    var list = $("sumLines");
    list.textContent = "";
    lines.forEach(function (text) {
      add(list, "li", text, /^Matinee/.test(text) ? "is-note" : "");
    });
    $("comboCount").textContent = String(combos);
    $("comboMinus").disabled = combos <= 0;
    $("comboPlus").disabled = !seats.length || combos >= seats.length;
    var body = $("sumBody");
    body.textContent = "";
    if (show) {
      seats.forEach(function (id) {
        var tr = add(body, "tr");
        add(tr, "td", id.charAt(0));
        add(tr, "td", id.slice(1));
        add(tr, "td", SC.seatTypeLabel(id));
        add(tr, "td", SC.money(SC.seatPrice(id, show.time)));
      });
    }
    $("sumTotal").textContent = show ? SC.money(SC.total(seats, show.time, combos)) : "0 MMK";
    updateBar(seats.length);
  }

  /* ---------- phone bar: shows seats + total and jumps to the booking form ---------- */
  var bkBar = $("bkBar");
  var barWanted = false;
  var summaryVisible = false;

  function syncBar() {
    if (!bkBar) { return; }
    var on = barWanted && !summaryVisible;
    bkBar.hidden = !on;
    document.body.classList.toggle("has-bk-bar", on);
  }

  function updateBar(count) {
    if (!bkBar) { return; }
    $("bkBarSeats").textContent = count + (count === 1 ? " seat" : " seats");
    $("bkBarTotal").textContent = $("sumTotal").textContent;
    barWanted = count > 0;
    syncBar();
  }

  if (bkBar) {
    $("bkBarGo").addEventListener("click", function () {
      $("summaryBox").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        summaryVisible = entries[0].isIntersecting;
        syncBar();
      }, { threshold: 0.15 }).observe($("summaryBox"));
    }
  }

  function refresh() {
    renderMap();
    renderSummary();
  }

  function loadSeats() {
    var show = currentShow();
    var token = ++loadToken;
    if (!show) { taken = []; refresh(); return Promise.resolve(); }
    return SC.api.seats(show).then(function (res) {
      if (token !== loadToken) { return; }                  /* an older answer: ignore */
      taken = (res.data && res.data.taken) || [];
      var lost = selected.filter(function (s) { return taken.indexOf(s) !== -1; });
      if (lost.length) {
        selected = selected.filter(function (s) { return taken.indexOf(s) === -1; });
        seatStatus.textContent = "Seat " + lost.join(", ") + " was just booked by someone else, so it was removed from your choice.";
      }
      updateModeNote();
      refresh();
    });
  }

  function changeShow() {
    freshShow = true;
    selected = [];
    combos = 0;
    seatStatus.textContent = "";
    showError("");
    loadSeats();
  }

  /* ---------- events ---------- */
  filmSelect.addEventListener("change", function () {
    film = SC.film(filmSelect.value) || film;
    fillTimes();
    changeShow();
  });

  dayChips.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-day]");
    if (!b) { return; }
    dayIndex = Number(b.getAttribute("data-day"));
    [].forEach.call(dayChips.querySelectorAll(".bk-day"), function (c) {
      var on = c === b;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    fillTimes();
    changeShow();
  });

  timeChips.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-value]");
    if (!b || b.getAttribute("data-value") === timeValue) { return; }
    pickTime(b.getAttribute("data-value"));
    changeShow();
  });

  seatMap.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-seat]");
    if (!btn || btn.disabled) { return; }
    var id = btn.getAttribute("data-seat");
    var at = selected.indexOf(id);
    seatStatus.textContent = "";
    if (at !== -1) {
      selected.splice(at, 1);
    } else if (selected.length >= SC.maxSeats) {
      seatStatus.textContent = "You can choose up to " + SC.maxSeats + " seats at a time.";
      return;
    } else {
      selected.push(id);
    }
    showError("");
    refresh();
    var again = seatMap.querySelector('button[data-seat="' + id + '"]');
    if (again) {
      again.focus({ preventScroll: true });
      if (at === -1) {
        again.classList.add("just-picked");
      }
    }
  });

  $("comboPrice").textContent = SC.money(SC.prices.combo);
  $("comboSave").textContent = SC.money(SC.prices.comboSeparate);
  $("comboPlus").addEventListener("click", function () {
    if (combos < selected.length) { combos++; refresh(); }
  });
  $("comboMinus").addEventListener("click", function () {
    if (combos > 0) { combos--; refresh(); }
  });

  function fillModal(booking) {
    $("modalRef").textContent = booking.reference;
    var f = SC.film(booking.film);
    var d = SC.days[SC.dayIndex(booking.day)];
    $("modalFilm").textContent = f ? f.title : booking.film;
    $("modalWhen").textContent = d.full + " · " + booking.time + " · Screen " + booking.screen;
    $("modalSeats").textContent = "Seats: " + booking.seats.slice().sort(seatOrder).join(", ") +
      (booking.combos ? " · " + booking.combos + " × Popcorn + drink combo" : "");
    $("modalTotal").textContent = "Total: " + SC.money(booking.total);
    $("manageLink").href = "my-booking.html?ref=" + encodeURIComponent(booking.reference);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    showError("");
    var show = currentShow();
    var payload = {
      film: film.slug,
      day: SC.days[dayIndex].key,
      time: show ? show.time : "",
      screen: show ? show.screen : 0,
      seats: selected.slice().sort(seatOrder),
      combos: combos,
      name: $("custName").value.trim(),
      email: $("custEmail").value.trim()
    };
    var problem = SC.validateBooking(payload, true);
    if (!problem && !$("agree").checked) { problem = "agree"; }
    if (problem) { showError(MESSAGES[problem] || MESSAGES.server_error); return; }

    confirmBtn.disabled = true;
    confirmBtn.textContent = "Booking…";
    showPay("Confirming your seats…", false);
    var started = Date.now();
    SC.api.createBooking(payload).then(function (res) {
      /* keep the spinner on screen for a moment so the change is easy to see */
      var wait = Math.max(0, 1100 - (Date.now() - started));
      return new Promise(function (resolve) { window.setTimeout(function () { resolve(res); }, wait); });
    }).then(function (res) {
      if (res.status === 201) {
        fillModal(res.data.booking);
        selected = [];
        combos = 0;
        form.reset();
        seatStatus.textContent = "";
        showPay("Booking completed successfully", true);
        window.setTimeout(function () {
          hidePay();
          new window.bootstrap.Modal($("confirmModal")).show();
        }, 1700);
      } else {
        hidePay();
        showError(MESSAGES[res.data && res.data.error] || MESSAGES.server_error);
      }
      updateModeNote();
      return loadSeats();
    }).catch(function () {
      hidePay();
      showError(MESSAGES.server_error);
    }).then(function () {
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Confirm booking";
    });
  });

  /* ---------- payment overlay (blur, spinner, tick) ---------- */
  function showPay(text, done) {
    $("payText").textContent = text;
    payOverlay.hidden = false;
    document.body.classList.add("is-paying");
    void payOverlay.offsetWidth;
    payOverlay.classList.add("is-on");
    payOverlay.classList.toggle("is-done", !!done);
  }

  function hidePay() {
    payOverlay.classList.remove("is-on", "is-done");
    document.body.classList.remove("is-paying");
    window.setTimeout(function () { payOverlay.hidden = true; }, 400);
  }

  $("copyRef").addEventListener("click", function () {
    var button = $("copyRef");
    var text = $("modalRef").textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        button.textContent = "Copied";
      }, function () { button.textContent = "Press Ctrl+C to copy"; });
    }
  });

  $("confirmModal").addEventListener("hidden.bs.modal", function () { $("copyRef").textContent = "Copy reference"; });

  /* Keep the seat map fresh while the page is open (other visitors may book) */
  window.setInterval(function () {
    if (!document.hidden && !confirmBtn.disabled) { loadSeats(); }
  }, 15000);

  /* ---------- Terms of Service popup: shown once per visit, before booking ---------- */
  (function () {
    var termsEl = $("termsModal");
    var accepted = false;
    try { accepted = window.sessionStorage.getItem("scTermsAccepted") === "1"; } catch (err) { /* storage blocked: just show it */ }
    if (accepted || !termsEl || !window.bootstrap) { return; }
    var terms = new window.bootstrap.Modal(termsEl);
    $("termsAgree").addEventListener("click", function () {
      try { window.sessionStorage.setItem("scTermsAccepted", "1"); } catch (err) { /* ignore */ }
      terms.hide();
    });
    terms.show();
  })();

  fillFilms();
  fillDays();
  fillTimes();
  loadSeats();
})();
