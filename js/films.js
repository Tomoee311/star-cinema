/* films.js - film and showtime data used by every page (original content for this assignment).
   Titles, credits and facts come from public listings; synopses are written in our own words.
   To change a film, edit it here (and its card in index.html / movies.html). */
var SC = typeof window !== "undefined" ? (window.SC = window.SC || {}) : {};

SC.days = [
  { key: "mon", label: "Mon", full: "Monday" },
  { key: "tue", label: "Tue", full: "Tuesday" },
  { key: "wed", label: "Wed", full: "Wednesday" },
  { key: "thu", label: "Thu", full: "Thursday" },
  { key: "fri", label: "Fri", full: "Friday" },
  { key: "sat", label: "Sat", full: "Saturday" },
  { key: "sun", label: "Sun", full: "Sunday" }
];

SC.formats = { "standard": "Standard", "dolby-atmos": "Dolby Atmos" };

/* Ticket prices in dollars. There are two kinds of seat:
   - Standard: the front rows (A-E). Each row has its own price (A $9.50 ... E $11.00).
   - Recliner: the last row (F only). Lean back with a footrest, a comfortable "VIP" view.
   The price depends on the ROW (see SC.seatPlan below).
   Matinee: shows that start before 17:00 get this discount on every seat.
   Combo: popcorn + a cold drink sold as one set (worth more when bought separately). */
SC.seatTypes = {
  standard: { label: "Standard" },
  recliner: { label: "Recliner" }
};
SC.prices = { matinee: 3, combo: 6, comboSeparate: 8 };

/* stars: audience score out of 5 in steps of 0.5 (null = no score yet). Converted from Rotten Tomatoes % (or CinemaScore) as % / 20, rounded DOWN to the nearest 0.5. null = no reliable score found - edit them here.
   Sources (checked 8 Oct 2026): Spider-Man RT critics 90-91% / audience 98% -> 4.5; The Odyssey RT critics 94-95% / audience 96%, CinemaScore A -> 4.5;
   Cerita Lila has no critic aggregate (TMDB 5.0/10 on 3 votes, IMDb-based ~8/10 on ~23 votes, Letterboxd reviews 2.5-3) -> 3.5, LOW CONFIDENCE, revisit when more votes exist. */
/* video: YouTube video ID of an official trailer ("" = none).
   videoLabel (optional): word shown in the heading, default "trailer".
   To add one, paste the ID (the 11 characters after youtu.be/) and fill videoCredit. */
SC.films = [
  {
    slug: "spider-man-brand-new-day",
    stars: 4.5,
    title: "Spider-Man: Brand New Day",
    status: "now",
    release: "July 2026",
    runtime: "2h 30m",
    genres: "Adventure / Sci-fi",
    rating: "PG-13",
    language: "English",
    director: "Destin Daniel Cretton",
    cast: ["Tom Holland", "Zendaya", "Sadie Sink"],
    synopsis: "Years after the world forgot him, Peter Parker fights crime alone in a New York that no longer knows his name. As his old friends move on, the strain sets off a change in him that he may not be able to control, just as a dangerous new enemy appears.",
    video: "P3uI5sLosKU",
    videoCredit: "Official trailer © Sony Pictures Entertainment, played from YouTube."
  },
  {
    slug: "the-odyssey",
    stars: 4.5,
    title: "The Odyssey",
    status: "now",
    release: "17 July 2026",
    runtime: "2h 52m",
    genres: "Action / Fantasy",
    rating: "R",
    language: "English",
    director: "Christopher Nolan",
    cast: ["Matt Damon", "Tom Holland", "Anne Hathaway", "Robert Pattinson"],
    synopsis: "After the Trojan War, Odysseus sets out on a long and dangerous voyage home to Ithaca, meeting monsters and temptations along the way. Christopher Nolan brings Homer's ancient epic to the big screen.",
    video: "Mzw2ttJD2qQ",
    videoCredit: "Official trailer © Universal Pictures, played from YouTube."
  },
  {
    slug: "toy-story-5",
    stars: 4.5,
    title: "Toy Story 5",
    status: "now",
    release: "19 June 2026",
    runtime: "1h 42m",
    genres: "Comedy / Adventure",
    rating: "PG",
    language: "English",
    director: "Andrew Stanton",
    cast: ["Tom Hanks (voice)", "Tim Allen (voice)", "Joan Cusack (voice)", "Greta Lee (voice)"],
    synopsis: "When Bonnie gets a shiny new tablet called Lilypad, Woody, Buzz, Jessie and the gang find that playtime is facing its toughest rival yet.",
    video: "c51ND9Hdbw0",
    videoCredit: "Official trailer © Disney / Pixar, played from YouTube."
  },
  {
    slug: "resident-evil",
    stars: 4.5,
    title: "Resident Evil",
    status: "now",
    release: "18 September 2026",
    runtime: "1h 37m",
    genres: "Horror / Sci-fi",
    rating: "R",
    language: "English",
    director: "Zach Cregger",
    cast: ["Austin Abrams", "Paul Walter Hauser", "Zach Cherry"],
    synopsis: "A medical courier named Bryan is pulled into a desperate race to survive as one terrifying night spirals out of control. It is a fresh story set in the world of the Resident Evil games.",
    video: "mNd1gb19A-c",
    videoCredit: "Official trailer © Sony Pictures Entertainment, played from YouTube."
  },
  {
    slug: "backrooms",
    stars: 4,
    title: "Backrooms",
    status: "now",
    release: "29 May 2026",
    runtime: "1h 51m",
    genres: "Sci-fi / Horror",
    rating: "R",
    language: "English",
    director: "Kane Parsons",
    cast: ["Chiwetel Ejiofor", "Renate Reinsve", "Mark Duplass"],
    synopsis: "A mysterious doorway appears in the basement of a furniture showroom and opens onto endless yellow rooms where nothing feels right. The film grows out of the viral Backrooms web series.",
    video: "0HjdiohVOik",
    videoCredit: "Official trailer © A24 and Kane Pixels, played from YouTube."
  },
  {
    slug: "obsession",
    stars: 4.5,
    title: "Obsession",
    status: "now",
    release: "15 May 2026",
    runtime: "1h 48m",
    genres: "Horror",
    rating: "R",
    language: "English",
    director: "Curry Barker",
    cast: ["Michael Johnston", "Inde Navarrette", "Cooper Tomlinson"],
    synopsis: "To win over the person he loves, a hopeless romantic snaps a strange wish-granting twig. He gets exactly what he asked for, but soon learns that the wish carries a terrible price.",
    video: "xJYoN-fX2j0",
    videoCredit: "Official trailer, played from the IGN Movie Trailers channel on YouTube."
  },
  {
    slug: "cerita-lila",
    stars: 3.5,
    title: "Cerita Lila",
    status: "now",
    release: "18 June 2026 (Indonesia)",
    runtime: "1h 46m",
    genres: "Horror",
    rating: "Not listed",
    language: "Indonesian",
    director: "Bobby Prasetyo",
    cast: ["Lutesha", "Shareefa Daanish", "Firzanah Alya", "Myesha Lin"],
    synopsis: "The spirit of a little girl lingers in an old house, still searching for the twin sister who vanished. When a mother and daughter move in, a friendship forms and long-buried family secrets begin to surface.",
    video: "kY2XUULjXPo",
    videoCredit: "Official trailer © MVP Pictures, played from YouTube."
  },
  {
    slug: "avengers-doomsday",
    stars: null,
    title: "Avengers: Doomsday",
    status: "soon",
    release: "18 December 2026",
    opens: "Opens 18 December",
    runtime: "2h 45m",
    genres: "Sci-fi / Action",
    rating: "Not yet rated",
    language: "English",
    director: "Anthony Russo and Joe Russo",
    cast: ["Robert Downey Jr.", "Chris Hemsworth", "Vanessa Kirby"],
    synopsis: "Heroes from several corners of Marvel's world join forces to face Doctor Doom, played by Robert Downey Jr., in the next big team-up film.",
    video: "X1aFkAkFASk",
    videoLabel: "special look",
    videoCredit: "Special look © Marvel Studios / Disney, played from YouTube."
  }
];

/* Daily timetable. screen 1-2 = Standard, screen 3-4 = Dolby Atmos.
   "days" (0 = Monday ... 6 = Sunday) limits an entry to some days; no "days" = every day. */
SC.schedule = [
  { film: "toy-story-5", screen: 1, format: "standard", times: ["10:30", "12:45", "15:00"] },
  { film: "resident-evil", screen: 1, format: "standard", times: ["17:30", "20:00"] },
  { film: "cerita-lila", screen: 2, format: "standard", times: ["11:00", "13:15"] },
  { film: "obsession", screen: 2, format: "standard", times: ["15:45", "18:00"] },
  { film: "obsession", screen: 2, format: "standard", times: ["20:15"], days: [3, 4, 5, 6] },
  { film: "spider-man-brand-new-day", screen: 3, format: "dolby-atmos", times: ["11:00", "14:00", "17:00", "20:00"] },
  { film: "the-odyssey", screen: 4, format: "dolby-atmos", times: ["11:00", "14:30", "18:00"] },
  { film: "backrooms", screen: 4, format: "dolby-atmos", times: ["21:15"], days: [4, 5, 6] }
];

/* Helpers ------------------------------------------------ */

/* Age rating -> short label, CSS class and tooltip (used for the coloured badges). */
SC.ratingInfo = function (rating) {
  var map = {
    "G":     { label: "G",     cls: "g",    tip: "Rated G" },
    "PG":    { label: "PG",    cls: "pg",   tip: "Rated PG" },
    "PG-13": { label: "PG-13", cls: "pg13", tip: "Rated PG-13" },
    "R":     { label: "R",     cls: "r",    tip: "Rated R" }
  };
  if (map[rating]) { return map[rating]; }
  if (rating === "Not yet rated") { return { label: "TBA", cls: "nr", tip: "Not yet rated" }; }
  return { label: "NR", cls: "nr", tip: "Not rated / not listed" };
};

/* Star score (0-5, halves allowed) -> a row of Bootstrap-icon stars. null = no score yet. */
SC.starsEl = function (score, showNumber) {
  var wrap = document.createElement("span");
  wrap.className = "sc-stars" + (score == null ? " is-empty" : "");
  wrap.setAttribute("role", "img");
  wrap.setAttribute("aria-label", score == null ? "No rating yet" : "Rated " + score + " out of 5 stars");
  for (var i = 1; i <= 5; i++) {
    var icon = document.createElement("i");
    var kind = "bi-star";
    if (score != null) {
      if (score >= i) { kind = "bi-star-fill"; }
      else if (score >= i - 0.5) { kind = "bi-star-half"; }
    }
    icon.className = "bi " + kind;
    icon.setAttribute("aria-hidden", "true");
    wrap.appendChild(icon);
  }
  if (showNumber) {
    var num = document.createElement("span");
    num.className = "sc-stars-num";
    num.textContent = score == null ? "No rating yet" : score.toFixed(1);
    wrap.appendChild(num);
  }
  return wrap;
};

SC.ratingBadge = function (rating, extraClass) {
  var info = SC.ratingInfo(rating);
  var el = document.createElement("span");
  el.className = "sc-rating sc-rating--" + info.cls + (extraClass ? " " + extraClass : "");
  el.title = info.tip;
  el.textContent = info.label;
  return el;
};

SC.film = function (slug) {
  for (var i = 0; i < SC.films.length; i++) {
    if (SC.films[i].slug === slug) { return SC.films[i]; }
  }
  return null;
};

/* All screenings of one film on one day, sorted by time. */
SC.showsFor = function (slug, dayIndex) {
  var out = [];
  SC.schedule.forEach(function (entry) {
    if (entry.film !== slug) { return; }
    if (entry.days && entry.days.indexOf(dayIndex) === -1) { return; }
    entry.times.forEach(function (t) {
      out.push({ time: t, screen: entry.screen, format: entry.format });
    });
  });
  out.sort(function (a, b) { return a.time < b.time ? -1 : a.time > b.time ? 1 : 0; });
  return out;
};

/* Matinee discount for a screening (shows before 17:00), 0 for later shows. */
SC.discountFor = function (time) {
  return time < "17:00" ? SC.prices.matinee : 0;
};

SC.money = function (n) { return "$" + n.toFixed(2); };

/* Seat plan and booking rules (shared by the booking page and the server) --------- */
/* A = nearest the screen. Standard seats in rows A-E, one recliner row (F) at the very back.
   Every row has its own price. A recliner is as wide as two standard seats, so every row is the same width.
   zigzag: true = the seats in that row are staggered up/down (zig-zag). */
SC.seatPlan = [
  { row: "A", type: "standard", price: 9.5, seats: 8, aisleAfter: 4 },
  { row: "B", type: "standard", price: 9.5, seats: 8, aisleAfter: 4 },
  { row: "C", type: "standard", price: 10, seats: 8, aisleAfter: 4 },
  { row: "D", type: "standard", price: 10.5, seats: 8, aisleAfter: 4 },
  { row: "E", type: "standard", price: 11, seats: 8, aisleAfter: 4 },
  { row: "F", type: "recliner", price: 18, seats: 4, aisleAfter: 2, zigzag: true }
];
SC.seatRows = SC.seatPlan.map(function (r) { return r.row; });
SC.maxSeats = 8;

/* The plan entry (row, type, seat count) for a row letter, or null. */
SC.rowInfo = function (row) {
  for (var i = 0; i < SC.seatPlan.length; i++) {
    if (SC.seatPlan[i].row === row) { return SC.seatPlan[i]; }
  }
  return null;
};

/* "standard" or "recliner" for a seat such as "A6" or "F2". */
SC.seatType = function (seat) {
  var info = SC.rowInfo(seat.charAt(0));
  return info ? info.type : "standard";
};

SC.seatTypeLabel = function (seat) {
  return SC.seatTypes[SC.seatType(seat)].label;
};

SC.isValidSeat = function (seat) {
  if (typeof seat !== "string") { return false; }
  var info = SC.rowInfo(seat.charAt(0));
  var n = Number(seat.slice(1));
  return !!info && /^[1-9][0-9]?$/.test(seat.slice(1)) && n >= 1 && n <= info.seats;
};

/* Base price of a seat (set per row in SC.seatPlan), before any matinee discount. */
SC.basePrice = function (seat) {
  var info = SC.rowInfo(seat.charAt(0));
  return info ? info.price : 0;
};

SC.seatPrice = function (seat, time) {
  return Math.max(0, SC.basePrice(seat) - SC.discountFor(time));
};

/* Groups chosen seats by type AND price (rows A and B share $9.50, so they share a line),
   in row order, for the order summary:
   [{ type, label, count, seats: ["A6", "C8"], price }] (price = each, after any matinee discount). */
SC.groupSeats = function (seats, time) {
  var out = [];
  SC.seatPlan.forEach(function (plan) {
    var mine = seats.filter(function (s) { return s.charAt(0) === plan.row; });
    if (!mine.length) { return; }
    var last = out[out.length - 1];
    if (last && last.type === plan.type && last.base === plan.price) {
      last.seats = last.seats.concat(mine);
      last.count = last.seats.length;
    } else {
      out.push({
        type: plan.type,
        label: SC.seatTypes[plan.type].label,
        count: mine.length,
        seats: mine,
        base: plan.price,
        price: Math.max(0, plan.price - SC.discountFor(time))
      });
    }
  });
  return out;
};

/* The order summary as separate lines, one under the other (used on the booking and my-booking pages). */
SC.summaryLines = function (seats, time, combos) {
  var lines = SC.groupSeats(seats, time).map(function (g) {
    return g.count + " × " + g.label + " seat (" + g.seats.join(", ") + ") · " + SC.money(g.price) + " each";
  });
  if (SC.discountFor(time)) { lines.push("Matinee: " + SC.money(SC.discountFor(time)) + " off each seat (already included)"); }
  if (combos) { lines.push(combos + " × Popcorn + drink combo · " + SC.money(SC.prices.combo) + " each"); }
  return lines;
};

/* Combo count is a whole number from 0 up to the number of seats. */
SC.validCombos = function (combos, seatCount) {
  return Number.isInteger(combos) && combos >= 0 && combos <= seatCount;
};

SC.total = function (seats, time, combos) {
  var sum = 0;
  seats.forEach(function (seat) { sum += Math.round(SC.seatPrice(seat, time) * 100); });
  sum += Math.round(SC.prices.combo * 100) * (combos || 0);
  return sum / 100;
};

SC.dayIndex = function (key) {
  for (var i = 0; i < SC.days.length; i++) {
    if (SC.days[i].key === key) { return i; }
  }
  return -1;
};

/* Is there really a screening of this film at this day, time and screen? */
SC.isRealShow = function (film, day, time, screen) {
  var f = SC.film(film);
  var d = SC.dayIndex(day);
  if (!f || f.status !== "now" || d === -1) { return false; }
  return SC.showsFor(film, d).some(function (s) {
    return s.time === time && s.screen === Number(screen);
  });
};

/* Returns "" when the request is fine, otherwise a short error code. */
SC.validateBooking = function (b, needCustomer) {
  if (!b || !SC.isRealShow(b.film, b.day, b.time, b.screen)) { return "unknown_show"; }
  if (!Array.isArray(b.seats) || b.seats.length < 1) { return "no_seats"; }
  if (b.seats.length > SC.maxSeats) { return "too_many_seats"; }
  var seen = {};
  for (var i = 0; i < b.seats.length; i++) {
    if (!SC.isValidSeat(b.seats[i]) || seen[b.seats[i]]) { return "bad_seat"; }
    seen[b.seats[i]] = true;
  }
  if (b.combos !== undefined && !SC.validCombos(b.combos, b.seats.length)) { return "bad_combos"; }
  if (needCustomer) {
    var name = (b.name || "").trim();
    if (name.length < 2 || name.length > 60) { return "bad_name"; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((b.email || "").trim()) || b.email.length > 100) { return "bad_email"; }
  }
  return "";
};

if (typeof module !== "undefined" && module.exports) { module.exports = SC; }
