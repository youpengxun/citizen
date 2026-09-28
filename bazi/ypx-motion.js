/* ============================================================
   有朋迅 · 交互增强层（ypx-motion）
   —— 非破坏性：在原 命理八字.html 之上叠加「鼠标跟随 / 滚动揭示 /
   拨云见日结果铺开 / 五行与紫微微光」。不改原配色、不改版式、不改数据。
   减弱动效或脚本异常时自动退场，原站完全照常。
   ============================================================ */
(function () {
  "use strict";
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return; // 尊重系统偏好：不动效，原样可见

  var doc = document.documentElement;
  doc.classList.add("ypx-motion");

  /* ---------- 1. 北斗七星 · 鼠标跟随（金墨微光） ---------- */
  (function () {
    var wrap = document.createElement("div");
    wrap.className = "ypx-dipper";
    document.body.appendChild(wrap);
    var N = 7, dots = [];
    // 北斗相对形态（斗勺→斗柄），微偏移以呈"勺"形
    var shape = [[-66, -6], [-46, -4], [-24, -2], [-2, 0], [14, 10], [30, 5], [46, -2]];
    for (var i = 0; i < N; i++) {
      var d = document.createElement("div"); d.className = "s";
      d.style.opacity = (1 - i * 0.11);
      d.style.width = d.style.height = (6 - i * 0.35) + "px";
      wrap.appendChild(d);
      dots.push({ el: d, x: innerWidth / 2, y: innerHeight / 2 });
    }
    var mx = innerWidth / 2, my = innerHeight / 2;
    window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; });
    function loop() {
      var px = mx, py = my;
      for (var i = 0; i < N; i++) {
        var dt = dots[i];
        dt.x += (px - dt.x) * 0.30; dt.y += (py - dt.y) * 0.30;
        dt.el.style.transform = "translate(" + (dt.x + shape[i][0]) + "px," + (dt.y + shape[i][1]) + "px) translate(-50%,-50%)";
        px = dt.x; py = dt.y;
      }
      requestAnimationFrame(loop);
    }
    loop();
  })();

  /* ---------- 2. 滚动揭示（Reveal Hero） ---------- */
  (function () {
    function ready(fn) {
      if (document.readyState !== "loading") fn();
      else document.addEventListener("DOMContentLoaded", fn);
    }
    ready(function () {
      // 仅对大区块附加入场（避免父子嵌套重复隐藏）
      var sel = [".hero", "#ask", "#compare", "#learning", "#member", "footer"];
      var seen = {};
      sel.forEach(function (s) {
        var nodes = document.querySelectorAll(s);
        nodes.forEach(function (n) {
          if (seen[n]) return; seen[n] = 1;
          n.setAttribute("data-reveal", "");
        });
      });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      document.querySelectorAll("[data-reveal]").forEach(function (n) { io.observe(n); });
      // 兜底：2.8s 后仍未进视口的强制显示，避免卡死
      setTimeout(function () {
        document.querySelectorAll("[data-reveal]:not(.in)").forEach(function (n) { n.classList.add("in"); });
      }, 2800);
    });
  })();

  /* ---------- 3. 排盘结果「拨云见日」渐次铺开 ---------- */
  (function () {
    function attach(report) {
      var mo = new MutationObserver(function () { reveal(report); });
      mo.observe(report, { childList: true });
      reveal(report); // 首次（loading 占位也走一次，单子无延迟）
    }
    function reveal(report) {
      var kids = Array.prototype.slice.call(report.children);
      if (!kids.length) return;
      report.classList.remove("ypx-in");
      kids.forEach(function (k, i) { k.style.transitionDelay = (kids.length > 1 ? i * 90 : 0) + "ms"; });
      void report.offsetWidth; // 强制回流，确保重置后再进入
      report.classList.add("ypx-in");
    }
    function tryAttach() {
      var r = document.getElementById("unified-report");
      if (r) { attach(r); return; }
      // #unified-report 由 fortune-unified.js 在 init 时创建，可能晚于本脚本
      var tries = 0;
      var t = setInterval(function () {
        var r2 = document.getElementById("unified-report");
        if (r2) { clearInterval(t); attach(r2); }
        else if (++tries > 40) clearInterval(t); // ~8s 后放弃，原站照常
      }, 200);
    }
    if (document.readyState !== "loading") tryAttach();
    else document.addEventListener("DOMContentLoaded", tryAttach);
  })();
})();
