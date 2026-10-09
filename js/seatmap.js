/* seatmap.js - draws the seat map (used by the booking page and the "change seats" panel).
   container: the element to fill. opts: { time, taken: [...], selected: [...] }
   Seats are buttons: data-seat holds the seat name (row letter + number, e.g. "A6"), taken seats are disabled.
   Rows A-E are standard seats (small boxes, straight rows, each row has its own price).
   Row F is the only recliner row (wide boxes with a seat icon) and its seats are staggered in a zig-zag. */
(function () {
  "use strict";
  var SC = window.SC;
  if (!SC) { return; }

  SC.renderSeatMap = function (container, opts) {
    var taken = opts.taken || [];
    var selected = opts.selected || [];
    container.textContent = "";
    var index = 0;                                   /* used for the fade-in delay */
    var lastType = "";

    SC.seatPlan.forEach(function (plan) {
      /* a small heading before the first row of each seat type */
      if (plan.type !== lastType) {
        lastType = plan.type;
        var type = SC.seatTypes[plan.type];
        var cap = document.createElement("p");
        cap.className = "sc-typecap is-" + plan.type;
        if (plan.type === "recliner") {
          cap.textContent = type.label + " · " + SC.money(SC.seatPrice(plan.row + "1", opts.time)) + " each · lean back, footrest up";
        } else {
          /* standard rows have different prices: "Standard · A 15,000 MMK · B 15,000 MMK · C 16,000 MMK ..." */
          var parts = [];
          SC.seatPlan.forEach(function (p) {
            if (p.type === "standard") { parts.push(p.row + " " + SC.money(SC.seatPrice(p.row + "1", opts.time))); }
          });
          cap.textContent = type.label + " · " + parts.join(" · ");
        }
        cap.style.setProperty("--i", index++);
        container.appendChild(cap);
      }

      var line = document.createElement("div");
      line.className = "sc-seatrow" + (plan.zigzag ? " is-zigzag" : "");
      line.style.setProperty("--i", index++);

      for (var n = 1; n <= plan.seats; n++) {
        var id = plan.row + n;
        var isTaken = taken.indexOf(id) !== -1;
        var isOn = selected.indexOf(id) !== -1;
        var isRecliner = plan.type === "recliner";
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sc-seat " + (isRecliner ? "is-recliner" : "is-standard") +
          (plan.zigzag ? (n % 2 === 1 ? " is-zig-up" : " is-zig-down") : "") + (isOn ? " is-selected" : "");
        if (isRecliner) {
          var icon = document.createElement("i");
          icon.className = "bi bi-person-fill";
          icon.setAttribute("aria-hidden", "true");
          btn.appendChild(icon);
        }
        var text = document.createElement("span");
        text.textContent = id;                       /* letter + number together, like A6 */
        btn.appendChild(text);
        btn.setAttribute("data-seat", id);
        btn.setAttribute("aria-pressed", isOn ? "true" : "false");
        btn.setAttribute("aria-label", SC.seatTypes[plan.type].label + " seat " + id + ", " +
          SC.money(SC.seatPrice(id, opts.time)) + (isTaken ? ", taken" : ""));
        btn.disabled = isTaken;
        line.appendChild(btn);

        if (n === plan.aisleAfter) {
          var gap = document.createElement("span");
          gap.className = "sc-aisle";
          gap.setAttribute("aria-hidden", "true");
          line.appendChild(gap);
        }
      }
      container.appendChild(line);
    });
  };
})();
