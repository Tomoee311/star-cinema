/* my-booking.js - find a booking with its reference and email, then change its seats or cancel it.
   Uses the booking service in api.js and the data in films.js. Original code for this assignment. */
(function () {
  "use strict";
  var SC = window.SC;
  if (!SC || !SC.api) { return; }

  function $(id) { return document.getElementById(id); }
  function show(el, on) { el.classList.toggle("d-none", !on); }

  var MESSAGES = {
    missing_fields: "Please enter both your booking reference and your email address.",
    not_found: "We could not find a booking with that reference and email. Please check both and try again.",
    no_seats: "Please keep at least one seat.",
    too_many_seats: "You can have up to " + SC.maxSeats + " seats.",
    bad_seat: "One of the seats is not valid. Please choose again.",
    seat_taken: "Sorry, one of those seats was just booked by someone else. Please choose different seats.",
    server_error: "Something went wrong on our side. Please try again in a moment."
  };

  var booking = null;      /* the booking that was found */
  var email = "";          /* the email used to find it (needed to change or cancel) */
  var selected = [];       /* seats chosen while changing */
  var takenByOthers = [];

  function seatOrder(a, b) {
    var ra = SC.seatRows.indexOf(a.charAt(0));
    var rb = SC.seatRows.indexOf(b.charAt(0));
    return ra !== rb ? ra - rb : Number(a.slice(1)) - Number(b.slice(1));
  }

  function formatOf(b) {
    var shows = SC.showsFor(b.film, SC.dayIndex(b.day));
    for (var i = 0; i < shows.length; i++) {
      if (shows[i].time === b.time && shows[i].screen === Number(b.screen)) { return SC.formats[shows[i].format]; }
    }
    return "";
  }

  function renderRecentBookings() {
    var card = $("recentBookingsCard");
    var listEl = $("recentBookings");
    if (!card || !listEl) { return; }
    if (SC.apiMode !== "local") { show(card, false); return; }
    var list = [];
    try { list = JSON.parse(localStorage.getItem("sc-demo-bookings")) || []; } catch (e) { list = []; }
    listEl.innerHTML = "";
    if (!list.length) { show(card, false); return; }
    list.slice().reverse().forEach(function (b) {
      var film = SC.film(b.film);
      var row = document.createElement("div");
      row.className = "sc-recent-booking";
      var info = document.createElement("div");
      info.innerHTML = '<div class="ref">' + b.reference + '</div><div class="small sc-muted">' + (film ? film.title : b.film) + ' · ' + b.day + ' · ' + b.time + '</div>';
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "btn btn-line btn-sm"; btn.textContent = "Load booking";
      btn.addEventListener("click", function () {
        $("refInput").value = b.reference;
        $("emailInput").value = b.email;
        $("findBtn").focus();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      row.appendChild(info); row.appendChild(btn); listEl.appendChild(row);
    });
    show(card, true);
  }

  function modeNote() {
    var note = $("modeNote");
    if (SC.apiMode === "local") {
      note.textContent = "Demo mode: the booking service is not connected here, so bookings are kept only in this browser. On the live website every visitor shares the same database.";
    }
    show(note, SC.apiMode === "local");
  }

  function priceLines(seats, time) {
    var std = seats.filter(function (s) { return !SC.isRecliner(s); });
    var rec = seats.filter(SC.isRecliner);
    var lines = [];
    if (std.length) { lines.push(std.length + " × Standard seat, " + SC.money(SC.priceFor(time)) + " each"); }
    if (rec.length) { lines.push(rec.length + " × Recliner seat, " + SC.money(SC.prices.recliner) + " each"); }
    return lines.join(" · ");
  }

  /* ---------- show the booking card ---------- */
  function renderBooking() {
    var film = SC.film(booking.film);
    var day = SC.days[SC.dayIndex(booking.day)];
    var seats = booking.seats.slice().sort(seatOrder);
    $("resFilm").textContent = film ? film.title : booking.film;
    $("resWhen").textContent = day.full + " · " + booking.time + " · Screen " + booking.screen + " · " + formatOf(booking);
    $("resSeats").textContent = "Seats: " + seats.join(", ");
    $("resLines").textContent = priceLines(seats, booking.time);
    $("resTotal").textContent = SC.money(booking.total);
    $("resRef").textContent = booking.reference;
    $("resName").textContent = booking.name;
    show($("resultCard"), true);
    show($("goneCard"), false);
    show($("editPanel"), false);
    show($("actionRow"), true);
  }

  function setNote(text) {
    var note = $("statusNote");
    note.textContent = text;
    show(note, !!text);
  }

  /* ---------- find ---------- */
  $("lookupForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var ref = $("refInput").value.trim();
    var mail = $("emailInput").value.trim();
    var err = $("lookupError");
    show(err, false);
    setNote("");
    if (!ref || !mail) {
      err.textContent = MESSAGES.missing_fields;
      show(err, true);
      return;
    }
    $("findBtn").disabled = true;
    SC.api.findBooking(ref, mail).then(function (res) {
      if (res.status === 200) {
        booking = res.data.booking;
        email = mail;
        renderBooking();
      } else {
        booking = null;
        show($("resultCard"), false);
        show($("goneCard"), false);
        err.textContent = MESSAGES[res.data && res.data.error] || MESSAGES.server_error;
        show(err, true);
      }
      modeNote();
    }).catch(function () {
      err.textContent = MESSAGES.server_error;
      show(err, true);
    }).then(function () { $("findBtn").disabled = false; });
  });

  /* ---------- change seats ---------- */
  function editError(text) {
    $("editError").textContent = text;
    show($("editError"), !!text);
  }

  function renderEdit() {
    SC.renderSeatMap($("editMap"), { time: booking.time, taken: takenByOthers, selected: selected });
    var seats = selected.slice().sort(seatOrder);
    $("editSummary").textContent = seats.length
      ? "New seats: " + seats.join(", ") + " · Total " + SC.money(SC.total(seats, booking.time))
      : "No seats chosen";
  }

  function loadEditSeats() {
    return SC.api.seats(booking).then(function (res) {
      var all = (res.data && res.data.taken) || [];
      takenByOthers = all.filter(function (s) { return booking.seats.indexOf(s) === -1; });
      selected = selected.filter(function (s) { return takenByOthers.indexOf(s) === -1; });
      renderEdit();
    });
  }

  $("changeBtn").addEventListener("click", function () {
    selected = booking.seats.slice();
    editError("");
    setNote("");
    show($("actionRow"), false);
    show($("editPanel"), true);
    loadEditSeats();
  });

  $("backBtn").addEventListener("click", function () {
    show($("editPanel"), false);
    show($("actionRow"), true);
    editError("");
  });

  $("editMap").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-seat]");
    if (!btn || btn.disabled) { return; }
    var id = btn.getAttribute("data-seat");
    var at = selected.indexOf(id);
    editError("");
    if (at !== -1) {
      selected.splice(at, 1);
    } else if (selected.length >= SC.maxSeats) {
      editError(MESSAGES.too_many_seats);
      return;
    } else {
      selected.push(id);
    }
    renderEdit();
    var again = $("editMap").querySelector('button[data-seat="' + id + '"]');
    if (again) { again.focus(); }
  });

  $("saveBtn").addEventListener("click", function () {
    var seats = selected.slice().sort(seatOrder);
    if (seats.length === 0) { editError(MESSAGES.no_seats); return; }
    if (seats.join() === booking.seats.slice().sort(seatOrder).join()) {
      editError("You have not changed any seats.");
      return;
    }
    $("saveBtn").disabled = true;
    SC.api.changeSeats(booking.reference, email, seats).then(function (res) {
      if (res.status === 200) {
        booking = res.data.booking;
        renderBooking();
        setNote("Your seats have been updated.");
      } else {
        editError(MESSAGES[res.data && res.data.error] || MESSAGES.server_error);
        if (res.status === 409) { return loadEditSeats(); }
      }
    }).catch(function () {
      editError(MESSAGES.server_error);
    }).then(function () { $("saveBtn").disabled = false; });
  });

  /* ---------- cancel (modal window asks first) ---------- */
  var cancelModal = null;

  $("cancelBtn").addEventListener("click", function () {
    var film = SC.film(booking.film);
    $("cancelText").textContent = "Booking " + booking.reference + " for " + (film ? film.title : booking.film) +
      " will be cancelled and your seats will be released for other people.";
    show($("cancelError"), false);
    cancelModal = cancelModal || new window.bootstrap.Modal($("cancelModal"));
    cancelModal.show();
  });

  $("confirmCancel").addEventListener("click", function () {
    var button = $("confirmCancel");
    button.disabled = true;
    SC.api.cancelBooking(booking.reference, email).then(function (res) {
      if (res.status === 200) {
        cancelModal.hide();
        $("goneText").textContent = "Booking " + booking.reference + " has been cancelled and its seats are free again.";
        show($("resultCard"), false);
        show($("goneCard"), true);
        booking = null;
        $("emailInput").value = "";
        $("refInput").value = "";
      } else {
        $("cancelError").textContent = MESSAGES[res.data && res.data.error] || MESSAGES.server_error;
        show($("cancelError"), true);
      }
    }).catch(function () {
      $("cancelError").textContent = MESSAGES.server_error;
      show($("cancelError"), true);
    }).then(function () { button.disabled = false; });
  });

  /* Link from the booking page: ?ref=SC-XXXXX fills in the reference */
  var ref = new URLSearchParams(window.location.search).get("ref");
  if (ref) {
    $("refInput").value = ref.toUpperCase().slice(0, 12);
    $("emailInput").focus();
  }
  modeNote();
  renderRecentBookings();
})();
