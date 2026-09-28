/* ============================================================
   有朋迅 — 交互与动效
   ============================================================ */
(function () {
  "use strict";
  document.documentElement.classList.add("js-reveal");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------- Nav ---------- */
  const nav = $(".nav");
  const onScrollNav = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  const burger = $(".nav-burger");
  const sheet = $(".mobile-sheet");
  if (burger) {
    burger.addEventListener("click", () => sheet.classList.toggle("open"));
    $$("a", sheet).forEach((a) => a.addEventListener("click", () => sheet.classList.remove("open")));
  }

  /* ---------- Reveal（基于视口矩形，兼容隐藏 iframe） ---------- */
  const revealEls = $$(".reveal, .layers");
  const checkReveals = () => {
    const vh = window.innerHeight || 800;
    for (let i = revealEls.length - 1; i >= 0; i--) {
      const r = revealEls[i].getBoundingClientRect();
      if (r.top < vh - 40 && r.bottom > 0) {
        revealEls[i].classList.add("in");
        revealEls.splice(i, 1);
      }
    }
  };
  window.addEventListener("scroll", checkReveals, { passive: true });
  window.addEventListener("resize", checkReveals);
  document.addEventListener("DOMContentLoaded", checkReveals);
  checkReveals();
  setTimeout(checkReveals, 120);

  /* ---------- 命盘 SVG 生成（刻度 + 宫位线） ---------- */
  const NS = "http://www.w3.org/2000/svg";
  const PALACES = ["命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄", "迁移", "交友", "官禄", "田宅", "福德", "父母"];
  function buildChart(svg, { labels = true } = {}) {
    if (!svg) return;
    const C = 500;
    const mk = (tag, attrs, parent) => {
      const el = document.createElementNS(NS, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(el);
      return el;
    };
    // 旋转组
    const gSlow = mk("g", { class: "core-ring spin-slow" });
    const gRev = mk("g", { class: "core-ring spin-rev" });
    const gMid = mk("g", { class: "core-ring spin-mid" });
    // 外环 + 刻度
    mk("circle", { cx: C, cy: C, r: 478, fill: "none", stroke: "hsla(262,70%,75%,.16)", "stroke-width": 1 }, gSlow);
    mk("circle", { cx: C, cy: C, r: 440, fill: "none", stroke: "hsla(262,70%,75%,.1)", "stroke-width": 1, "stroke-dasharray": "2 9" }, gSlow);
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const long = i % 8 === 0;
      const r1 = long ? 460 : 468;
      mk("line", {
        x1: C + Math.cos(a) * r1, y1: C + Math.sin(a) * r1,
        x2: C + Math.cos(a) * 478, y2: C + Math.sin(a) * 478,
        stroke: long ? "hsla(262,85%,78%,.45)" : "hsla(262,70%,75%,.18)", "stroke-width": long ? 1.4 : 1,
      }, gSlow);
    }
    // 中环（反转）：弧段 + 星点
    mk("circle", { cx: C, cy: C, r: 372, fill: "none", stroke: "hsla(262,75%,75%,.14)", "stroke-width": 1 }, gRev);
    for (let i = 0; i < 5; i++) {
      const a0 = (i / 5) * 360 + 12;
      mk("path", {
        d: describeArc(C, C, 372, a0, a0 + 42),
        fill: "none", stroke: "hsla(262,90%,78%,.5)", "stroke-width": 2, "stroke-linecap": "round",
      }, gRev);
    }
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2, r = 330 + Math.random() * 36;
      mk("circle", { cx: C + Math.cos(a) * r, cy: C + Math.sin(a) * r, r: 1.6 + Math.random() * 1.4, fill: "hsla(262,90%,84%,.7)" }, gRev);
    }
    // 宫位线 + 标签
    mk("circle", { cx: C, cy: C, r: 290, fill: "none", stroke: "hsla(262,70%,75%,.18)", "stroke-width": 1 }, gMid);
    mk("circle", { cx: C, cy: C, r: 160, fill: "none", stroke: "hsla(262,75%,75%,.22)", "stroke-width": 1, "stroke-dasharray": "1 6" }, gMid);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      mk("line", {
        x1: C + Math.cos(a) * 160, y1: C + Math.sin(a) * 160,
        x2: C + Math.cos(a) * 290, y2: C + Math.sin(a) * 290,
        stroke: "hsla(262,70%,75%,.2)", "stroke-width": 1,
      }, gMid);
      if (labels) {
        const la = a + Math.PI / 12;
        const t = mk("text", {
          x: C + Math.cos(la) * 326, y: C + Math.sin(la) * 326,
          fill: "hsla(262,55%,80%,.5)", "font-size": 17, "text-anchor": "middle", "dominant-baseline": "middle",
          "font-family": "'Noto Serif SC',serif",
        }, gMid);
        t.textContent = PALACES[i];
      }
    }
  }
  function describeArc(cx, cy, r, a0, a1) {
    const p = (a) => [cx + r * Math.cos(((a - 90) * Math.PI) / 180), cy + r * Math.sin(((a - 90) * Math.PI) / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  }
  buildChart($("#core-svg"));
  buildChart($("#signs-svg"), { labels: false });

  /* ---------- 画布工具 ---------- */
  function canvasLoop(canvas, draw) {
    if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d");
    let raf = null, running = false, w = 0, h = 0, dpr = Math.min(devicePixelRatio || 1, 2);
    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const visible = () => {
      const r = canvas.getBoundingClientRect();
      return r.bottom > -120 && r.top < (window.innerHeight || 800) + 120;
    };
    const tick = (t) => {
      if (visible()) draw(ctx, w, h, t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    void running; void w; void h;
  }

  const cssNum = (name, fb) => {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return isNaN(v) ? fb : v;
  };
  const densityVar = () => cssNum("--particle-density", 1);
  const hueVar = () => cssNum("--hue", 262);

  /* ---------- Hero 星图 + 流光轨迹 ---------- */
  (function heroStars() {
    const canvas = $("#star-canvas");
    if (!canvas || reduced) return;
    let stars = [], orbiters = [];
    const init = (w, h) => {
      const n = Math.round(((w * h) / 9000) * densityVar());
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3, p: Math.random() * Math.PI * 2,
        s: 0.4 + Math.random() * 1.2, vx: (Math.random() - 0.5) * 0.06, vy: (Math.random() - 0.5) * 0.06,
      }));
      orbiters = Array.from({ length: 4 }, (_, i) => ({
        r: Math.min(w, h) * (0.28 + i * 0.085), a: Math.random() * Math.PI * 2,
        v: (0.0012 + Math.random() * 0.0012) * (i % 2 ? -1 : 1),
      }));
    };
    let inited = false;
    window.addEventListener("om-density", () => { inited = false; });
    canvasLoop(canvas, (ctx, w, h, t) => {
      if (!inited) { init(w, h); inited = true; }
      const H = hueVar();
      ctx.clearRect(0, 0, w, h);
      // 星点
      for (const s of stars) {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x = w; if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h; if (s.y > h) s.y = 0;
        const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.s + s.p));
        ctx.fillStyle = `hsla(${H}, 80%, 85%, ${a})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
      }
      // 流光轨迹（围绕命盘中心）
      const cx = w / 2, cy = h * 0.48;
      for (const o of orbiters) {
        o.a += o.v;
        const seg = 0.55;
        for (let k = 0; k < 14; k++) {
          const a0 = o.a - (k / 14) * seg;
          ctx.strokeStyle = `hsla(${H - 4}, 90%, 75%, ${0.32 * (1 - k / 14)})`;
          ctx.lineWidth = 1.6 * (1 - k / 16);
          ctx.beginPath();
          ctx.arc(cx, cy, o.r, a0 - seg / 16, a0);
          ctx.stroke();
        }
        const hx = cx + Math.cos(o.a) * o.r, hy = cy + Math.sin(o.a) * o.r;
        ctx.fillStyle = `hsla(${H}, 95%, 85%, .95)`;
        ctx.shadowColor = `hsla(${H}, 95%, 75%, .9)`; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(hx, hy, 1.8, 0, 7); ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  })();

  /* ---------- 全页微尘 ---------- */
  (function dust() {
    const canvas = $("#dust-canvas");
    if (!canvas || reduced) return;
    let ps = null;
    window.addEventListener("om-density", () => { ps = null; });
    canvasLoop(canvas, (ctx, w, h, t) => {
      if (!ps) ps = Array.from({ length: Math.round(40 * densityVar()) }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.1 + 0.3, v: 0.08 + Math.random() * 0.18, p: Math.random() * 9,
      }));
      const H = hueVar();
      ctx.clearRect(0, 0, w, h);
      for (const d of ps) {
        d.y -= d.v; if (d.y < -4) { d.y = h + 4; d.x = Math.random() * w; }
        ctx.fillStyle = `hsla(${H}, 75%, 82%, ${0.1 + 0.2 * (0.5 + 0.5 * Math.sin(t * 0.0008 + d.p))})`;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7); ctx.fill();
      }
    });
  })();

  /* ---------- 标语区 · 互动粒子星云 ---------- */
  (function signsNebula() {
    const canvas = $("#signs-canvas");
    if (!canvas || reduced) return;
    let ps = null;
    const mouse = { x: -9999, y: -9999 };
    const sec = canvas.closest(".signs");
    sec.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    sec.addEventListener("pointerleave", () => { mouse.x = -9999; mouse.y = -9999; });
    window.addEventListener("om-density", () => { ps = null; });
    canvasLoop(canvas, (ctx, w, h, t) => {
      if (!ps) ps = Array.from({ length: Math.round(((w * h) / 11000) * densityVar()) }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.6 + 0.4, p: Math.random() * 9,
      }));
      ctx.clearRect(0, 0, w, h);
      for (const d of ps) {
        const dx = d.x - mouse.x, dy = d.y - mouse.y, dist = Math.hypot(dx, dy);
        if (dist < 130 && dist > 0.1) {
          const f = ((130 - dist) / 130) * 0.6;
          d.vx += (dx / dist) * f; d.vy += (dy / dist) * f;
        }
        d.vx *= 0.96; d.vy *= 0.96;
        d.x += d.vx + Math.sin(t * 0.0004 + d.p) * 0.12;
        d.y += d.vy + Math.cos(t * 0.00035 + d.p) * 0.1;
        if (d.x < 0) d.x = w; if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h; if (d.y > h) d.y = 0;
        const a = 0.2 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.0012 + d.p));
        ctx.fillStyle = `hsla(${hueVar() - 4 + Math.sin(d.p) * 14}, 85%, 80%, ${a})`;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7); ctx.fill();
      }
    });
  })();

  /* ---------- Hero 鼠标视差 ---------- */
  (function parallax() {
    if (reduced) return;
    const hero = $(".hero");
    const targets = $$("[data-depth]", hero);
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const apply = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      for (const el of targets) {
        const d = parseFloat(el.dataset.depth);
        el.style.transform = `translate(${cx * d}px, ${cy * d}px)`;
      }
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) raf = requestAnimationFrame(apply);
      else raf = null;
    };
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width / 2) / 28;
      ty = (e.clientY - r.top - r.height / 2) / 28;
      if (!raf) raf = requestAnimationFrame(apply);
    });
  })();

  /* ---------- Dashboard 滚动联动 ---------- */
  (function dashboard() {
    const zone = $(".system-sticky-zone");
    const dash = $(".dash");
    if (!zone || !dash) return;
    const items = $$(".aitem", dash);
    const nodes = $$(".tnode", dash);
    const update = () => {
      const r = zone.getBoundingClientRect();
      const total = r.height - innerHeight;
      const p = total > 60 ? Math.min(1, Math.max(0, -r.top / total)) : (r.top < innerHeight * 0.5 ? 1 : 0);
      dash.classList.toggle("live", p > 0.02 || (r.top < innerHeight * 0.7 && total <= 60));
      const ni = Math.floor(p * (items.length + 1));
      items.forEach((el, i) => el.classList.toggle("active", i < Math.max(1, ni)));
      const tn = Math.floor(p * (nodes.length + 1));
      nodes.forEach((el, i) => el.classList.toggle("active", i < Math.max(1, tn)));
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  })();

  /* ---------- 问题输入 · 流程动画 ---------- */
  (function askFlow() {
    const panel = $(".ask-panel");
    if (!panel) return;
    $$(".ask-tag", panel).forEach((b) =>
      b.addEventListener("click", () => b.classList.toggle("on"))
    );
    const btn = $("#ask-go");
    const steps = $$(".flow-step", panel);
    let busy = false;
    btn.addEventListener("click", () => {
      if (busy) return;
      busy = true;
      panel.classList.add("processing");
      panel.classList.remove("finished");
      steps.forEach((s) => s.classList.remove("run", "ok"));
      btn.disabled = true; btn.style.opacity = ".55";
      let i = 0;
      const next = () => {
        if (i > 0) steps[i - 1].classList.replace("run", "ok");
        if (i >= steps.length) {
          panel.classList.add("finished");
          btn.disabled = false; btn.style.opacity = "";
          busy = false;
          return;
        }
        steps[i].classList.add("run");
        i++;
        setTimeout(next, 850 + Math.random() * 450);
      };
      setTimeout(next, 250);
    });
  })();

  /* ---------- 报告摘要抽屉 ---------- */
  (function drawer() {
    const sum = $(".report-summary");
    if (!sum) return;
    sum.addEventListener("click", () => sum.classList.toggle("open"));
    sum.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sum.classList.toggle("open"); }
    });
  })();

  /* ---------- 用户反馈 · 漂浮轮播 ---------- */
  (function voices() {
    const stage = $(".voice-stage");
    if (!stage) return;
    const cards = $$(".vcard", stage);
    const dots = $$(".voice-dots button");
    const n = cards.length;
    let cur = 0, timer = null;
    const place = () => {
      cards.forEach((c, i) => {
        let off = ((i - cur) % n + n) % n;
        if (off > n / 2) off -= n;
        const abs = Math.abs(off);
        const x = off * 56;          // % 横向偏移
        const z = -abs * 190;        // 纵深
        const rot = off * -9;
        c.style.transform = `translate(calc(-50% + ${x}%), -50%) translateZ(${z}px) rotateY(${rot}deg)`;
        c.style.opacity = abs > 2 ? 0 : 1 - abs * 0.32;
        c.style.filter = abs ? `blur(${abs * 1.5}px)` : "none";
        c.style.zIndex = 10 - abs;
        c.style.pointerEvents = abs ? "none" : "auto";
      });
      dots.forEach((d, i) => d.classList.toggle("on", i === cur));
    };
    const go = (i) => { cur = ((i % n) + n) % n; place(); };
    const auto = () => { timer = setInterval(() => go(cur + 1), 4200); };
    dots.forEach((d, i) => d.addEventListener("click", () => { clearInterval(timer); go(i); auto(); }));
    stage.addEventListener("pointerenter", () => clearInterval(timer));
    stage.addEventListener("pointerleave", () => { clearInterval(timer); auto(); });
    place();
    if (!reduced) auto();
  })();
})();
