/* GET /api/seats?film=&day=&time=&screen=  ->  { taken: ["A3", "B4", ...] } */
const { SC, getDb, send } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "GET") { return send(res, 405, { error: "method_not_allowed" }); }
  const q = req.query || {};
  if (!SC.isRealShow(q.film, q.day, q.time, q.screen)) { return send(res, 400, { error: "unknown_show" }); }
  try {
    const rows = await getDb().query(
      "select seat from booking_seats where film = $1 and day = $2 and show_time = $3 and screen = $4",
      [q.film, q.day, q.time, Number(q.screen)]
    );
    return send(res, 200, { taken: rows.map((r) => r.seat) });
  } catch (err) {
    console.error("seats error:", err.message);
    return send(res, 500, { error: "server_error" });
  }
};
