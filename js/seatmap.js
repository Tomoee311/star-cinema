/* seatmap.js - draws the seat map (used by the booking page and the "change seats" panel).
   container: the element to fill. opts: { time, taken: [...], selected: [...] }
   Seats are buttons: data-seat holds the seat name, taken seats are disabled. */
(function () {
  "use strict";
  var SC = window.SC;
  if (!SC) { return; }

  SC.renderSeatMap = function (container, opts) {
    var taken = opts.taken || [];
    var selected = opts.selected || [];
    container.textContent = "";

    SC.seatRows.forEach(function (row) {
      var line = document.createElement("div");
      line.className = "sc-seatrow";
      var label = document.createElement("span");
      label.className = "sc-rowlabel";
      label.textContent = row;
      label.setAttribute("aria-hidden", "true");
      line.appendChild(label);

      for (var n = 1; n <= SC.seatsPerRow; n++) {
        var id = row + n;
        var isTaken = taken.indexOf(id) !== -1;
        var isOn = selected.indexOf(id) !== -1;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = String(n);
        btn.className = "sc-seat" + (SC.isRecliner(id) ? " is-recliner" : "") + (isOn ? " is-selected" : "");
        btn.setAttribute("data-seat", id);
        btn.setAttribute("aria-pressed", isOn ? "true" : "false");
        btn.setAttribute("aria-label", "Seat " + id + ", " + (SC.isRecliner(id) ? "recliner" : "standard") + ", " +
          SC.money(SC.seatPrice(id, opts.time)) + (isTaken ? ", taken" : ""));
        btn.disabled = isTaken;
        line.appendChild(btn);

        if (n === SC.aisleAfter) {
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
