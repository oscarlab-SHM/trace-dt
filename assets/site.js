// TRACE-DT site script: mobile menu + the interactive bridge digital twin on the home page.
// No need to edit this file.
(function () {
  // ---- Mobile menu ----
  var toggle = document.querySelector(".menu-btn");
  var menu = document.querySelector(".menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var canvas = document.getElementById("demo");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var slider = document.getElementById("dmg");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  var C = {
    strath: css("--strath") || "#002b5c",
    hi: css("--hi") || "#0078ae",
    grey: css("--grey") || "#a7a9ac",
    line: css("--line") || "#dde1e4",
    soft: css("--soft") || "#5b6168",
    warn: css("--warn") || "#d24a1e",
    ok: "#2e9e5b"
  };

  var F0 = 2.41;               // healthy, unloaded first natural frequency (Hz)
  var state = { p: 0.5, d: 0, vib: 0.5, t: 0, hist: [], f: F0 };

  function fit() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w) return;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // geometry helpers (recomputed each frame for responsiveness)
  function geom() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    return { w: w, h: h, x0: w * 0.10, x1: w * 0.90, deckY: h * 0.52, span: w * 0.80 };
  }
  // static deflection shape for a point load at fraction p (simply supported beam)
  function gshape(xi, a, L) {
    var b = L - a, val;
    if (xi <= a) val = b * xi * (L * L - b * b - xi * xi);
    else { var xr = L - xi; val = a * xr * (L * L - a * a - xr * xr); }
    return Math.max(0, val);
  }
  function deckPts(g) {
    var a = state.p * g.span, L = g.span;
    var gmax = gshape(a, a, L) || 1;
    var sagPeak = g.h * 0.11 * (1 + 1.6 * state.d);
    var fdisp = state.f;
    var pts = [], n = 60;
    for (var i = 0; i <= n; i++) {
      var xi = L * i / n, x = g.x0 + xi;
      var sag = gshape(xi, a, L) / gmax * sagPeak;
      var vib = state.vib * Math.sin(Math.PI * xi / L) * Math.sin(2 * Math.PI * fdisp * state.t / 60);
      pts.push([x, g.deckY + sag + vib]);
    }
    return pts;
  }

  function update() {
    var sv = slider ? parseFloat(slider.value) : 0;
    state.d = sv / 100;
    // first natural frequency: softens with damage (stiffness loss) and a little with load at mid-span
    var loadEff = Math.sin(Math.PI * state.p);          // greatest at mid-span
    state.f = F0 * Math.sqrt(1 - state.d) * (1 - 0.02 * loadEff);
    state.vib += (0.5 - state.vib) * 0.02;              // decay toward a gentle idle
    state.t += 1;
    state.hist.push(state.f); if (state.hist.length > 140) state.hist.shift();
  }

  function draw() {
    var g = geom(); ctx.clearRect(0, 0, g.w, g.h);
    var pts = deckPts(g);
    var a = state.p * g.span, xL = g.x0 + a;
    var yL = pts[Math.round(state.p * 60)][1];

    // water
    ctx.strokeStyle = C.line; ctx.lineWidth = 1;
    for (var wv = 0; wv < 3; wv++) { ctx.beginPath(); for (var xx = 0; xx <= g.w; xx += 8) { var yy = g.h - 16 + wv * 6 + Math.sin(xx / 28 + state.t / 34 + wv) * 1.8; xx ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }

    // supports (triangles)
    ctx.fillStyle = C.strath;
    [g.x0, g.x1].forEach(function (sx) { ctx.beginPath(); ctx.moveTo(sx, g.deckY + 2); ctx.lineTo(sx - 11, g.deckY + 26); ctx.lineTo(sx + 11, g.deckY + 26); ctx.closePath(); ctx.fill(); });
    ctx.fillRect(g.x0 - 16, g.deckY + 26, 32, g.h - (g.deckY + 26) - 14);
    ctx.fillRect(g.x1 - 16, g.deckY + 26, 32, g.h - (g.deckY + 26) - 14);

    // undeformed reference
    ctx.setLineDash([3, 5]); ctx.strokeStyle = C.grey; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(g.x0, g.deckY); ctx.lineTo(g.x1, g.deckY); ctx.stroke(); ctx.setLineDash([]);

    // deck
    ctx.strokeStyle = C.strath; ctx.lineWidth = 6; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.beginPath();
    pts.forEach(function (pt, i) { i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]); }); ctx.stroke();

    // damage zone (appears with stiffness loss), fixed near 0.62 span
    if (state.d > 0.001) {
      var di = Math.round(0.62 * 60), dp = pts[di];
      ctx.strokeStyle = C.warn; ctx.lineWidth = 6; ctx.globalAlpha = Math.min(1, 0.3 + state.d * 2);
      ctx.beginPath(); ctx.moveTo(pts[di - 2][0], pts[di - 2][1]); ctx.lineTo(pts[di + 2][0], pts[di + 2][1]); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = C.warn; ctx.font = "600 11px 'IBM Plex Mono', monospace"; ctx.fillText("damage", dp[0] - 18, dp[1] + 24);
    }

    // sensors pulsing
    var ns = 5;
    for (var s = 0; s < ns; s++) {
      var si = Math.round((s + 0.5) / ns * 60), sp = pts[si];
      var ph = ((state.t + s * 20) % 80) / 80;
      ctx.strokeStyle = C.hi; ctx.globalAlpha = 1 - ph; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sp[0], sp[1] - 7, 3 + ph * 14, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = C.hi; ctx.beginPath(); ctx.arc(sp[0], sp[1] - 7, 3.5, 0, 7); ctx.fill();
    }

    // the draggable load (a truck)
    var tw = 40, th = 18, tyTop = yL - th - 4;
    ctx.fillStyle = C.hi; roundRect(ctx, xL - tw / 2, tyTop, tw, th, 3); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillRect(xL - tw / 2 + 5, tyTop + 4, 12, th - 8);
    ctx.fillStyle = C.strath;
    [xL - tw / 2 + 9, xL + tw / 2 - 9].forEach(function (wx) { ctx.beginPath(); ctx.arc(wx, yL - 3, 4, 0, 7); ctx.fill(); });
    // grab hint ring
    ctx.strokeStyle = C.hi; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(xL, tyTop + th / 2, 30, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;

    // mini sparkline of frequency, top-right
    var sw = 120, sh = 34, sx0 = g.w - sw - 8, sy0 = 8;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.fillRect(sx0, sy0, sw, sh); ctx.strokeRect(sx0, sy0, sw, sh);
    ctx.fillStyle = C.soft; ctx.font = "9px 'IBM Plex Mono', monospace"; ctx.fillText("f1 history", sx0 + 6, sy0 + 11);
    var lo = 1.7, hi = F0 + 0.03;
    ctx.strokeStyle = C.hi; ctx.lineWidth = 1.6; ctx.beginPath();
    state.hist.forEach(function (fv, i) { var x = sx0 + 6 + (sw - 12) * i / 139, y = sy0 + sh - 6 - (fv - lo) / (hi - lo) * (sh - 16); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.stroke();
  }

  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  function readouts() {
    var drop = (F0 - state.f) / F0;
    var fEl = document.getElementById("d-f"), xEl = document.getElementById("d-x"), dEl = document.getElementById("d-d"), sEl = document.getElementById("d-s");
    if (fEl) fEl.textContent = state.f.toFixed(2) + " Hz";
    if (xEl) { var p = state.p; xEl.textContent = p < 0.2 ? "left" : p < 0.4 ? "quarter" : p < 0.6 ? "mid-span" : p < 0.8 ? "three-quarter" : "right"; }
    if (dEl) dEl.textContent = Math.round(state.d * 100) + "%";
    if (sEl) {
      var label = drop > 0.04 ? "Alarm" : drop > 0.02 ? "Watch" : "Healthy";
      sEl.textContent = label; sEl.className = drop > 0.04 ? "hot" : "";
      sEl.style.color = drop > 0.04 ? C.warn : drop > 0.02 ? "#b8860b" : C.ok;
    }
  }

  // ---- dragging the load ----
  var dragging = false;
  function setFromEvent(e) {
    var r = canvas.getBoundingClientRect();
    var clientX = (e.touches ? e.touches[0].clientX : e.clientX);
    var g = geom(); var p = (clientX - r.left - g.x0) / g.span;
    state.p = Math.max(0, Math.min(1, p));
    state.vib = Math.min(2.2, state.vib + 0.5); // moving the load excites vibration
  }
  canvas.addEventListener("pointerdown", function (e) { dragging = true; canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId); setFromEvent(e); });
  canvas.addEventListener("pointermove", function (e) { if (dragging) { e.preventDefault(); setFromEvent(e); } });
  window.addEventListener("pointerup", function () { dragging = false; });
  if (slider) slider.addEventListener("input", function () { state.vib = Math.min(2.2, state.vib + 0.6); });

  fit(); update(); draw(); readouts();
  window.addEventListener("resize", function () { fit(); draw(); });
  if (!reduce) {
    var last = 0;
    (function loop(ts) { if (ts - last > 30) { last = ts; update(); draw(); readouts(); } requestAnimationFrame(loop); })(0);
  } else {
    // static: still respond to slider and drag
    function redraw() { update(); draw(); readouts(); }
    canvas.addEventListener("pointermove", function () { if (dragging) redraw(); });
    canvas.addEventListener("pointerdown", redraw);
    if (slider) slider.addEventListener("input", redraw);
  }
})();
