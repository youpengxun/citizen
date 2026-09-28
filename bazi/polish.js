/* ============================================================
   polish — 进度条 / 开屏 / 数字滚动 / 跨页转场
   ============================================================ */
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 滚动进度 */
  const bar = document.createElement("div");
  bar.id = "om-progress";
  document.body.appendChild(bar);
  const up = () => {
    const d = document.documentElement;
    const p = d.scrollTop / Math.max(1, d.scrollHeight - window.innerHeight);
    bar.style.width = (p * 100).toFixed(2) + "%";
  };
  window.addEventListener("scroll", up, { passive: true });
  up();

  /* 开屏 */
  const sp = document.getElementById("om-splash");
  if (sp) {
    const hide = () => sp.classList.add("gone");
    if (document.readyState === "complete") setTimeout(hide, 420);
    else window.addEventListener("load", () => setTimeout(hide, 420));
    setTimeout(hide, 2400); // 兜底
  }

  /* 数字滚动 */
  document.querySelectorAll(".hero-stats b").forEach((el) => {
    const m = el.textContent.trim().match(/^([\d,]+)(.*)$/);
    if (!m || reduced) return;
    const target = parseInt(m[1].replace(/,/g, ""), 10);
    const suf = m[2];
    const dur = 1400;
    let t0 = null;
    const step = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e).toLocaleString("en-US") + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    setTimeout(() => requestAnimationFrame(step), 750);
  });

  /* 跨页转场 */
  const veil = document.createElement("div");
  veil.id = "om-veil";
  document.body.appendChild(veil);
  document.querySelectorAll("a[href]").forEach((a) => {
    const h = a.getAttribute("href") || "";
    if (/^(index\.html|命理平台\.html)/.test(decodeURIComponent(h))) {
      a.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        veil.classList.add("on");
        setTimeout(() => { window.location.href = h; }, 320);
      });
    }
  });
})();
