/* ============================================================
   有朋迅 · 命理平台 — 演示模式提示 + 日期动态化
   ------------------------------------------------------------
   1. 未配置后端（BAZI_API_URL 为空）时，点击「登录」给出 toast 提示，
      告知演示模式下登录/报告存档功能上线后开放，避免点击无反馈。
   2. 把静态写死的 input[type=date] 的 max 改为当前年份年末，
      避免跨年后日期选择框卡在旧年份。
   已配置后端时，account.js 会接管登录按钮，本脚本第 1 项自动失效。
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 极简 toast（自含样式，不依赖任何 CSS） ---------- */
  var toastTimer = null;
  function ypxToast(msg) {
    var box = document.getElementById("ypx-toast");
    if (!box) {
      box = document.createElement("div");
      box.id = "ypx-toast";
      box.setAttribute("role", "status");
      box.style.cssText = [
        "position:fixed", "left:50%", "bottom:28px", "transform:translateX(-50%) translateY(20px)",
        "z-index:9999", "max-width:90vw", "padding:12px 20px", "border-radius:10px",
        "background:rgba(20,12,40,0.92)", "color:#e8dcff",
        "font:500 13px/1.5 system-ui,'Noto Sans SC',sans-serif",
        "border:1px solid rgba(160,130,255,0.35)", "box-shadow:0 8px 32px rgba(40,10,80,0.45)",
        "backdrop-filter:blur(8px)", "opacity:0", "transition:opacity .25s,transform .25s",
        "pointer-events:none"
      ].join(";");
      document.body.appendChild(box);
    }
    box.textContent = msg;
    requestAnimationFrame(function () {
      box.style.opacity = "1";
      box.style.transform = "translateX(-50%) translateY(0)";
    });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      box.style.opacity = "0";
      box.style.transform = "translateX(-50%) translateY(20px)";
    }, 3200);
  }
  window.ypxToast = ypxToast;

  function init() {
    var CFG = window.YPX_CONFIG || {};
    var hasBackend = !!CFG.BAZI_API_URL;

    /* 1. 演示模式：登录按钮给反馈（后端已配置时由 account.js 接管，跳过） */
    if (!hasBackend) {
      var loginBtn = document.querySelector(".nav-auth .login");
      if (loginBtn) {
        loginBtn.addEventListener("click", function (e) {
          e.preventDefault();
          ypxToast("演示模式：登录与报告存档功能上线后开放，当前可免费体验排盘与月运。");
        }, { capture: true });
      }
    }

    /* 2. 日期选择框 max 动态化为当前年份年末 */
    var yearEnd = new Date().getFullYear() + "-12-31";
    document.querySelectorAll('input[type="date"]').forEach(function (el) {
      if (el.getAttribute("max") && /20\d\d-12-31/.test(el.getAttribute("max"))) {
        el.setAttribute("max", yearEnd);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
