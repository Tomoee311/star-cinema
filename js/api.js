/* api.js - talks to the booking service.
   On the live site (Vercel) every call goes to the shared database through /api/...,
   so all visitors see the same booked seats.
   When the service is not there (for example the ZIP opened straight from a folder),
   the same calls run in "demo mode" and the bookings are kept only in this browser. */
(function () {
  "use strict";
  var SC = window.SC;
  if (!SC) { return; }

  var STORE_KEY = "sc-demo-bookings";
  SC.apiMode = window.location.protocol === "file:" ? "local" : "remote";

  /* ---------- real service ---------- */
  function remote(method, url, body) {
    var options = { method: method, headers: {} };
    if (body) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
    return fetch(url, options).then(function (res) {
      var type = res.headers.get("content-type") || "";
      if (type.indexOf("application/json") === -1) { throw new Error("service not available"); }
      return res.json().then(function (data) { return { status: res.status, data: data }; });
    });
  }

  /* ---------- demo mode (this browser only) ---------- */
  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { return []; }
  }
  function writeStore(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) { /* storage full or blocked */ }
  }
  function sameShow(b, s) {
    return b.film === s.film && b.day === s.day && b.time === s.time && Number(b.screen) === Number(s.screen);
  }
  function takenIn(list, show, ignoreRef) {
    var taken = [];
    list.forEach(function (b) {
      if (sameShow(b, show) && b.reference !== ignoreRef) { taken = taken.concat(b.seats); }
    });
    return taken;
  }
  function newReference() {
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var out = "SC-";
    for (var i = 0; i < 5; i++) { out += alphabet.charAt(Math.floor(Math.random() * alphabet.length)); }
    return out;
  }
  function find(list, ref, email) {
    ref = String(ref || "").trim().toUpperCase();
    email = String(email || "").trim().toLowerCase();
    for (var i = 0; i < list.length; i++) {
      if (list[i].reference === ref && list[i].email.toLowerCase() === email) { return i; }
    }
    return -1;
  }
  function clash(wanted, taken) {
    return wanted.some(function (s) { return taken.indexOf(s) !== -1; });
  }

  var local = {
    seats: function (show) {
      if (!SC.isRealShow(show.film, show.day, show.time, show.screen)) { return { status: 400, data: { error: "unknown_show" } }; }
      return { status: 200, data: { taken: takenIn(readStore(), show) } };
    },
    create: function (b) {
      var input = {
        film: b.film, day: b.day, time: b.time, screen: Number(b.screen), seats: b.seats,
        combos: b.combos === undefined ? 0 : b.combos,
        name: String(b.name || "").trim(), email: String(b.email || "").trim().toLowerCase()
      };
      var problem = SC.validateBooking(input, true);
      if (problem) { return { status: 400, data: { error: problem } }; }
      var list = readStore();
      if (clash(input.seats, takenIn(list, input))) { return { status: 409, data: { error: "seat_taken" } }; }
      input.reference = newReference();
      input.total = SC.total(input.seats, input.time, input.combos);
      list.push(input);
      writeStore(list);
      return { status: 201, data: { booking: input } };
    },
    lookup: function (ref, email) {
      var list = readStore();
      var i = find(list, ref, email);
      return i === -1 ? { status: 404, data: { error: "not_found" } } : { status: 200, data: { booking: list[i] } };
    },
    change: function (ref, email, seats, combos) {
      var list = readStore();
      var i = find(list, ref, email);
      if (i === -1) { return { status: 404, data: { error: "not_found" } }; }
      var b = list[i];
      var problem = SC.validateBooking({ film: b.film, day: b.day, time: b.time, screen: b.screen, seats: seats, combos: combos }, false);
      if (problem) { return { status: 400, data: { error: problem } }; }
      if (clash(seats, takenIn(list, b, b.reference))) { return { status: 409, data: { error: "seat_taken" } }; }
      b.seats = seats.slice().sort();
      b.combos = combos;
      b.total = SC.total(b.seats, b.time, b.combos);
      writeStore(list);
      return { status: 200, data: { booking: b } };
    },
    cancel: function (ref, email) {
      var list = readStore();
      var i = find(list, ref, email);
      if (i === -1) { return { status: 404, data: { error: "not_found" } }; }
      list.splice(i, 1);
      writeStore(list);
      return { status: 200, data: { cancelled: true } };
    }
  };

  /* Use the real service; if it is not there, switch to demo mode. */
  function run(method, url, body, localCall) {
    if (SC.apiMode === "local") { return Promise.resolve(localCall()); }
    return remote(method, url, body).catch(function () {
      SC.apiMode = "local";
      return localCall();
    });
  }

  function query(obj) {
    return Object.keys(obj).map(function (k) { return k + "=" + encodeURIComponent(obj[k]); }).join("&");
  }

  SC.api = {
    seats: function (show) {
      var q = query({ film: show.film, day: show.day, time: show.time, screen: show.screen });
      return run("GET", "/api/seats?" + q, null, function () { return local.seats(show); });
    },
    createBooking: function (b) {
      return run("POST", "/api/bookings", b, function () { return local.create(b); });
    },
    findBooking: function (ref, email) {
      return run("GET", "/api/bookings?" + query({ reference: ref, email: email }), null,
        function () { return local.lookup(ref, email); });
    },
    changeSeats: function (ref, email, seats, combos) {
      combos = combos || 0;
      return run("PATCH", "/api/bookings", { reference: ref, email: email, seats: seats, combos: combos },
        function () { return local.change(ref, email, seats, combos); });
    },
    cancelBooking: function (ref, email) {
      return run("DELETE", "/api/bookings?" + query({ reference: ref, email: email }), null,
        function () { return local.cancel(ref, email); });
    }
  };
})();
