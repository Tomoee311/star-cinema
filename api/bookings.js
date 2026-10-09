/* /api/bookings
   POST    create a booking              body: film, day, time, screen, seats[], name, email
   GET     look a booking up             ?reference=&email=
   PATCH   change the seats              body: reference, email, seats[]
   DELETE  cancel (seats are released)   ?reference=&email=                              */
const { SC, getDb, send, newReference, cleanReference, cleanEmail, toBooking, isSeatConflict } = require("./_lib");

async function findBooking(q, reference, email) {
  const rows = await q.query(
    "select * from bookings where reference = $1 and lower(email) = $2",
    [reference, email]
  );
  if (rows.length === 0) { return null; }
  const seatRows = await q.query(
    "select seat from booking_seats where booking_id = $1 order by seat",
    [rows[0].id]
  );
  return toBooking(rows[0], seatRows.map((r) => r.seat));
}

async function createBooking(req, res) {
  const b = req.body || {};
  const input = {
    film: b.film, day: b.day, time: b.time, screen: Number(b.screen),
    seats: b.seats, combos: b.combos === undefined ? 0 : b.combos, name: String(b.name || "").trim(), email: cleanEmail(b.email)
  };
  const problem = SC.validateBooking(input, true);
  if (problem) { return send(res, 400, { error: problem }); }

  const totalCents = Math.round(SC.total(input.seats, input.time, input.combos) * 100);
  const db = getDb();

  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = newReference();
    try {
      await db.query(
        `with b as (
           insert into bookings (reference, film, day, show_time, screen, customer_name, email, total_cents, combos)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $10) returning id
         )
         insert into booking_seats (booking_id, film, day, show_time, screen, seat)
         select b.id, $2, $3, $4, $5, s from b, unnest($9::text[]) as s`,
        [reference, input.film, input.day, input.time, input.screen, input.name, input.email, totalCents, input.seats, input.combos]
      );
      const booking = await findBooking(db, reference, input.email);
      return send(res, 201, { booking });
    } catch (err) {
      if (isSeatConflict(err)) { return send(res, 409, { error: "seat_taken" }); }
      if (err.code === "23505") { continue; }          /* reference already used: try another */
      throw err;
    }
  }
  return send(res, 500, { error: "server_error" });
}

async function lookup(req, res) {
  const reference = cleanReference(req.query.reference);
  const email = cleanEmail(req.query.email);
  if (!reference || !email) { return send(res, 400, { error: "missing_fields" }); }
  const booking = await findBooking(getDb(), reference, email);
  if (!booking) { return send(res, 404, { error: "not_found" }); }
  return send(res, 200, { booking });
}

async function changeSeats(req, res) {
  const b = req.body || {};
  const reference = cleanReference(b.reference);
  const email = cleanEmail(b.email);
  if (!reference || !email) { return send(res, 400, { error: "missing_fields" }); }
  const combos = b.combos === undefined ? 0 : b.combos;

  try {
    const result = await getDb().tx(async (q) => {
      const rows = await q.query(
        "select * from bookings where reference = $1 and lower(email) = $2 for update",
        [reference, email]
      );
      if (rows.length === 0) { return { status: 404, body: { error: "not_found" } }; }
      const row = rows[0];
      const problem = SC.validateBooking(
        { film: row.film, day: row.day, time: row.show_time, screen: row.screen, seats: b.seats, combos: combos }, false
      );
      if (problem) { return { status: 400, body: { error: problem } }; }

      await q.query("delete from booking_seats where booking_id = $1", [row.id]);
      await q.query(
        `insert into booking_seats (booking_id, film, day, show_time, screen, seat)
         select $1, $2, $3, $4, $5, s from unnest($6::text[]) as s`,
        [row.id, row.film, row.day, row.show_time, row.screen, b.seats]
      );
      const totalCents = Math.round(SC.total(b.seats, row.show_time, combos) * 100);
      await q.query("update bookings set total_cents = $1, combos = $2 where id = $3", [totalCents, combos, row.id]);
      const booking = toBooking(Object.assign({}, row, { total_cents: totalCents, combos }), b.seats.slice().sort());
      return { status: 200, body: { booking } };
    });
    return send(res, result.status, result.body);
  } catch (err) {
    if (isSeatConflict(err)) { return send(res, 409, { error: "seat_taken" }); }   /* nothing was changed */
    throw err;
  }
}

async function cancelBooking(req, res) {
  const reference = cleanReference(req.query.reference);
  const email = cleanEmail(req.query.email);
  if (!reference || !email) { return send(res, 400, { error: "missing_fields" }); }
  const rows = await getDb().query(
    "delete from bookings where reference = $1 and lower(email) = $2 returning id",
    [reference, email]
  );
  if (rows.length === 0) { return send(res, 404, { error: "not_found" }); }
  return send(res, 200, { cancelled: true });   /* seats go too (on delete cascade) */
}

module.exports = async (req, res) => {
  try {
    if (req.method === "POST") { return await createBooking(req, res); }
    if (req.method === "GET") { return await lookup(req, res); }
    if (req.method === "PATCH") { return await changeSeats(req, res); }
    if (req.method === "DELETE") { return await cancelBooking(req, res); }
    return send(res, 405, { error: "method_not_allowed" });
  } catch (err) {
    console.error("bookings error:", err.message);
    return send(res, 500, { error: "server_error" });
  }
};
