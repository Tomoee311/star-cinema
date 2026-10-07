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

/* Ticket prices in dollars. Matinee price: standard seats, shows that start before 17:00. */
SC.prices = { standard: 12.5, recliner: 18, matinee: 9.5 };

/* video: YouTube video ID of an official trailer ("" = none).
   videoLabel (optional): word shown in the heading, default "trailer".
   To add one, paste the ID (the 11 characters after youtu.be/) and fill videoCredit. */
SC.films = [
  {
    slug: "spider-man-brand-new-day",
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

/* Standard-seat price for a screening (matinee before 17:00). */
SC.priceFor = function (time) {
  return time < "17:00" ? SC.prices.matinee : SC.prices.standard;
};

SC.money = function (n) { return "$" + n.toFixed(2); };

/* Seat plan and booking rules (shared by the booking page and the server) --------- */
SC.seatRows = ["A", "B", "C", "D", "E"];     /* A-C standard, D-E recliner */
SC.seatsPerRow = 10;
SC.aisleAfter = 5;
SC.maxSeats = 8;

SC.isValidSeat = function (seat) {
  return typeof seat === "string" && /^[A-E](10|[1-9])$/.test(seat);
};

SC.isRecliner = function (seat) {
  return seat.charAt(0) === "D" || seat.charAt(0) === "E";
};

SC.seatPrice = function (seat, time) {
  return SC.isRecliner(seat) ? SC.prices.recliner : SC.priceFor(time);
};

SC.total = function (seats, time) {
  var sum = 0;
  seats.forEach(function (seat) { sum += Math.round(SC.seatPrice(seat, time) * 100); });
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
  if (needCustomer) {
    var name = (b.name || "").trim();
    if (name.length < 2 || name.length > 60) { return "bad_name"; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((b.email || "").trim()) || b.email.length > 100) { return "bad_email"; }
  }
  return "";
};

if (typeof module !== "undefined" && module.exports) { module.exports = SC; }
