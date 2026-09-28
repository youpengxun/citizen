/* ============================================================
   starlore — 二十八宿装饰星座组件（散布全页）
   ============================================================ */
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LORE = ["角宿", "亢宿", "氐宿", "房宿", "心宿", "尾宿", "箕宿", "斗宿", "牛宿", "女宿", "虚宿", "危宿", "室宿", "壁宿"];
  const SPOTS = [
    { sel: "#dimensions", pos: "top:9%;right:4%" },
    { sel: "#dimensions", pos: "bottom:8%;right:14%" },
    { sel: "#modules", pos: "bottom:7%;left:3%" },
    { sel: "#modules", pos: "top:10%;right:3.5%" },
    { sel: "#ask", pos: "top:14%;right:5%" },
    { sel: "#ask", pos: "bottom:10%;left:4%" },
    { sel: "#report", pos: "top:9%;left:3%" },
    { sel: "#why", pos: "bottom:10%;right:4%" },
    { sel: "#voices", pos: "top:11%;left:3.5%" },
    { sel: "#voices", pos: "bottom:14%;right:3%" },
    { sel: ".footer", pos: "top:18%;right:6%" },
    { sel: ".system-section .section-head", pos: "top:-30%;right:0%" },
  ];
  const NS = "http://www.w3.org/2000/svg";

  function makeAsterism(name, seed) {
    const wrap = document.createElement("span");
    wrap.className = "starlore";
    wrap.setAttribute("aria-hidden", "true");
    const W = 320, H = 210;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("width", W * 2); svg.setAttribute("height", H * 2);
    // 伪随机（按 seed 稳定）
    let s = seed * 9301 + 49297;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const n = 6 + Math.floor(rnd() * 3); // 6-8 星
    const pts = [];
    let x = 24 + rnd() * 36, y = 44 + rnd() * 110;
    for (let i = 0; i < n; i++) {
      pts.push([x, y]);
      x += 30 + rnd() * 32;
      y += (rnd() - 0.5) * 92;
      y = Math.max(18, Math.min(H - 20, y));
    }
    for (let i = 0; i < n - 1; i++) {
      const ln = document.createElementNS(NS, "line");
      ln.setAttribute("x1", pts[i][0]); ln.setAttribute("y1", pts[i][1]);
      ln.setAttribute("x2", pts[i + 1][0]); ln.setAttribute("y2", pts[i + 1][1]);
      svg.appendChild(ln);
    }
    // 背景微星（深度）
    for (let i = 0; i < 5; i++) {
      const bgc = document.createElementNS(NS, "circle");
      bgc.setAttribute("cx", (rnd() * W).toFixed(1));
      bgc.setAttribute("cy", (rnd() * H).toFixed(1));
      bgc.setAttribute("r", (0.7 + rnd() * 0.8).toFixed(1));
      bgc.setAttribute("opacity", "0.4");
      svg.appendChild(bgc);
    }
    let maxR = 0, maxEl = null, maxPt = null;
    pts.forEach(([px, py], i) => {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", px); c.setAttribute("cy", py);
      const r = 2.4 + rnd() * 2.6;
      c.setAttribute("r", r.toFixed(1));
      if (!reduced) c.style.animationDelay = (-rnd() * 4).toFixed(2) + "s";
      svg.appendChild(c);
      if (r > maxR) { maxR = r; maxEl = c; maxPt = [px, py]; }
    });
    // 主星光环
    if (maxPt) {
      const halo = document.createElementNS(NS, "circle");
      halo.setAttribute("class", "sl-halo");
      halo.setAttribute("cx", maxPt[0]); halo.setAttribute("cy", maxPt[1]);
      halo.setAttribute("r", (maxR + 7).toFixed(1));
      svg.appendChild(halo);
    }
    const label = document.createElement("i");
    label.textContent = name;
    wrap.appendChild(svg);
    wrap.appendChild(label);
    return wrap;
  }

  let li = 0;
  SPOTS.forEach((spot, i) => {
    const host = document.querySelector(spot.sel);
    if (!host) return;
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    const el = makeAsterism(LORE[li % LORE.length], i + 7);
    spot.pos.split(";").forEach((kv) => {
      const [k, v] = kv.split(":");
      if (k && v) el.style[k.trim()] = v.trim();
    });
    li++;
    host.appendChild(el);
  });
})();
