Star Cinema - starcinema.com (Unit 13 Assignment 2)

All 8 pages: Home, Movies, Film details, Showtimes, Booking, My booking, About and Contact, + shared style, script, film data and a booking API.

How to open
1. Open this folder in VS Code.
2. Right-click index.html and choose "Open with Live Server".
   (An internet connection is needed: Bootstrap, fonts and the YouTube trailer load online.)

Files
- index.html     Home page
- movies.html    Movies page (search, genre/format filters, sort, Now showing / Coming soon)
- details.html   Film details page (one page for all films, e.g. details.html?film=toy-story-5)
- showtimes.html Showtimes and prices (day chips, format filter, tap a time to book)
- booking.html   Booking page (seat map, order summary, booking confirmed window)
- my-booking.html Find a booking by reference + email, change its seats or cancel it
- about.html     About the cinema (story, facilities, opening hours)
- contact.html   Contact (Google Map, address, inquiry form with all control types)
- css/style.css  External stylesheet (own theme, based on Bootstrap 5.3)
- js/hero.js     Home page full-screen film stage (backdrop fade, number/title roll, poster rail, autoplay ring, "More" zoom)
- js/script.js   Navbar-on-scroll, dark/light toggle, scroll reveal, command-style search, movies filters
- js/films.js    Film data, showtimes and prices (edit films here)
- js/details.js  Builds the details page from films.js
- js/showtimes.js Builds the showtimes table from films.js
- js/api.js      Talks to the booking service (falls back to demo mode, see below)
- js/booking.js  Booking form
- js/seatmap.js  Draws the seat map (shared)
- js/my-booking.js Find / change seats / cancel
- js/contact.js  Checks the inquiry form (front-end only)
- api/           Booking API (Vercel serverless functions): seats.js, bookings.js
- schema.sql     Database tables (run once in Supabase/Neon SQL editor)
- package.json   Server dependency (pg)
- images/        Film posters, SVG artwork and images/backdrop-<film>.jpg (2560x1440 banners used by the home stage;
                 replace any of them with your own 16:9 picture and it is used automatically)

Film list (titles and facts only; synopses are written in our own words)
Resident Evil, Cerita Lila, Spider-Man: Brand New Day, The Odyssey,
Toy Story 5, Obsession, Backrooms, Avengers: Doomsday

Preview video: embedded with the YouTube player (no video file is stored in this project).
To change it, replace the video ID (X1aFkAkFASk) in the iframe src in index.html.

Trailers: every film page embeds an official trailer through the YouTube player (IDs and credits are in js/films.js).
To change one, edit "video" and "videoCredit" there. Only use official trailers. Synopses are written in our own words.

Booking: two modes
- Live site (Vercel + database): every visitor shares the same seats. A seat that is booked cannot be
  booked again by anyone; cancelling gives the seats back. The database enforces this (see schema.sql).
- Opened from a folder / no service: "demo mode". Bookings are kept only in this browser.
  A yellow note on the booking page says so.
Set the DATABASE_URL environment variable on Vercel to switch the live site to the shared database.
