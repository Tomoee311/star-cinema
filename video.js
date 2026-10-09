/* Click-to-play YouTube video with a fallback link.
   Some phones/networks (VPN, shared IP, not signed in) get YouTube's
   "confirm you're not a bot" screen inside embeds. The fallback link opens
   the video in the YouTube app/site, where it always works. */
function scVideo(box, id, title) {
  var wrap = document.createElement("div");
  wrap.className = "ratio ratio-16x9 sc-video-wrap";
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "sc-video-facade";
  btn.setAttribute("aria-label", "Play: " + title);
  /* Sharpest thumbnail first (1280x720); fall back if YouTube doesn't have it. */
  var sizes = ["maxresdefault", "sddefault", "hqdefault"];
  (function tryThumb(i) {
    var url = "https://i.ytimg.com/vi/" + id + "/" + sizes[i] + ".jpg";
    var img = new Image();
    img.onload = function () {
      /* YouTube returns a tiny 120px placeholder when a size is missing */
      if (img.naturalWidth > 200 || i === sizes.length - 1) {
        btn.style.backgroundImage = "url(" + url + ")";
      } else {
        tryThumb(i + 1);
      }
    };
    img.onerror = function () { if (i < sizes.length - 1) tryThumb(i + 1); };
    img.src = url;
  })(0);
  btn.innerHTML = '<i class="bi bi-play-circle-fill" aria-hidden="true"></i>';
  btn.addEventListener("click", function () {
    var f = document.createElement("iframe");
    f.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&playsinline=1&rel=0";
    f.title = title;
    f.setAttribute("allow", "autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
    f.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    f.setAttribute("allowfullscreen", "");
    wrap.replaceChildren(f);
  });
  wrap.appendChild(btn);
  box.appendChild(wrap);

  var p = document.createElement("p");
  p.className = "small sc-muted mt-2 mb-0";
  p.appendChild(document.createTextNode("Video not playing? "));
  var a = document.createElement("a");
  a.href = "https://www.youtube.com/watch?v=" + id;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = "Watch on YouTube";
  p.appendChild(a);
  box.appendChild(p);
}
