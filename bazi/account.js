/* ============================================================
   有朋迅 · 账号层：登录注册 + 报告存档 + 历史（自建后端，纯 fetch，无 supabase-js）
   ------------------------------------------------------------
   未配置 BAZI_API_URL 时整层休眠，页面＝纯静态/AI 演示。
   后端＝我们自己的 FastAPI（/auth/*、/api/reports、/api/content/systems）。
   token 存 localStorage('ypx_token')，请求带 Authorization: Bearer。
   ============================================================ */
(function () {
  "use strict";
  var CFG = window.YPX_CONFIG || {};
  var API = (CFG.BAZI_API_URL || "").replace(/\/$/, "");
  if (!API) return;   // 休眠

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  var token = null, user = null;

  function api(method, path, body) {
    var opt = { method: method, headers: {} };
    if (body) { opt.headers["Content-Type"] = "application/json"; opt.body = JSON.stringify(body); }
    if (token) opt.headers["Authorization"] = "Bearer " + token;
    return fetch(API + path, opt).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, ok: r.ok, data: j }; });
    });
  }

  function start() {
    injectStyles();
    var els = buildModal();
    try { token = localStorage.getItem("ypx_token"); } catch (e) {}

    if (token) {
      api("GET", "/auth/me").then(function (r) {
        if (r.ok && r.data.user) user = r.data.user; else { token = null; try { localStorage.removeItem("ypx_token"); } catch (e) {} }
        renderNav();
      });
    } else { renderNav(); }

    // 公开只读：确认数据层连通
    api("GET", "/api/content/systems").then(function (r) {
      if (r.ok) console.info("[ypx] 后端已连接 · 体系：", (r.data.systems || []).map(function (x) { return x.name_cn; }).join(" / "));
    });

    function setSession(d) {
      token = d.token; user = d.user;
      try { localStorage.setItem("ypx_token", token); } catch (e) {}
      renderNav(); closeModal();
    }
    function logout() {
      token = null; user = null;
      try { localStorage.removeItem("ypx_token"); } catch (e) {}
      renderNav();
    }

    function renderNav() {
      var navAuth = document.querySelector(".nav .nav-auth");
      if (!navAuth) return;
      if (user) {
        var nm = user.display_name || (user.email || "用户").split("@")[0];
        navAuth.innerHTML =
          '<button class="ypx-navbtn" id="ypx-history">我的报告</button>' +
          '<span class="ypx-userchip" title="' + esc(user.email) + '">' + esc(nm) + '</span>' +
          '<button class="ypx-navbtn ghost" id="ypx-logout">登出</button>';
        navAuth.querySelector("#ypx-logout").onclick = logout;
        navAuth.querySelector("#ypx-history").onclick = openHistory;
      } else {
        navAuth.innerHTML =
          '<a class="login" id="ypx-login" href="#">登录</a>' +
          '<a class="btn btn-primary" id="ypx-signup" href="#">注册 / 登录 <span class="arr">→</span></a>';
        navAuth.querySelector("#ypx-login").onclick = function (e) { e.preventDefault(); openModal("signin"); };
        navAuth.querySelector("#ypx-signup").onclick = function (e) { e.preventDefault(); openModal("signup"); };
      }
      renderMobileAuth();
    }

    // 移动端 burger 菜单里也放一份入口（≤1080px 时桌面 .nav-auth 被隐藏）
    function renderMobileAuth() {
      var sheet = document.querySelector(".mobile-sheet");
      if (!sheet) return;
      var a1 = sheet.querySelector(".ypx-ms-auth");
      if (!a1) { a1 = document.createElement("a"); a1.className = "ypx-ms-auth"; a1.href = "#"; sheet.appendChild(a1); }
      var a2 = sheet.querySelector(".ypx-ms-auth2");
      if (user) {
        a1.textContent = "我的报告";
        a1.onclick = function (e) { e.preventDefault(); sheet.classList.remove("open"); openHistory(); };
        if (!a2) { a2 = document.createElement("a"); a2.className = "ypx-ms-auth2"; a2.href = "#"; sheet.appendChild(a2); }
        a2.style.display = ""; a2.textContent = "登出（" + (user.display_name || user.email) + "）";
        a2.onclick = function (e) { e.preventDefault(); sheet.classList.remove("open"); logout(); };
      } else {
        a1.textContent = "登录 / 注册 →";
        a1.onclick = function (e) { e.preventDefault(); sheet.classList.remove("open"); openModal("signin"); };
        if (a2) a2.style.display = "none";
      }
    }

    /* ---------- 登录/注册 弹窗 ---------- */
    function buildModal() {
      var back = document.createElement("div");
      back.className = "ypx-modal-back"; back.hidden = true;
      back.innerHTML =
        '<div class="ypx-modal glass" role="dialog" aria-modal="true" aria-label="登录注册">' +
          '<button class="ypx-x" aria-label="关闭">×</button>' +
          '<div class="ypx-tabs"><button data-t="signin" class="on">登录</button><button data-t="signup">注册</button></div>' +
          '<label class="ypx-f ypx-name" hidden>昵称<input id="ypx-name" type="text" autocomplete="nickname" placeholder="怎么称呼你"/></label>' +
          '<label class="ypx-f">邮箱<input id="ypx-email" type="email" autocomplete="email" placeholder="you@example.com"/></label>' +
          '<label class="ypx-f">密码<input id="ypx-pw" type="password" autocomplete="current-password" placeholder="至少 6 位"/></label>' +
          '<div class="ypx-msg" hidden></div>' +
          '<button class="btn btn-primary ypx-go">登录 <span class="arr">→</span></button>' +
        '</div>';
      document.body.appendChild(back);
      var $ = function (s) { return back.querySelector(s); };
      back.addEventListener("click", function (e) { if (e.target === back) closeModal(); });
      $(".ypx-x").onclick = closeModal;
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !back.hidden) closeModal(); });

      var tab = "signin";
      back.querySelectorAll(".ypx-tabs button").forEach(function (b) { b.onclick = function () { setTab(b.dataset.t); }; });
      function setTab(t) {
        tab = t;
        back.querySelectorAll(".ypx-tabs button").forEach(function (b) { b.classList.toggle("on", b.dataset.t === t); });
        $(".ypx-name").hidden = t !== "signup";
        $("#ypx-pw").setAttribute("autocomplete", t === "signup" ? "new-password" : "current-password");
        $(".ypx-go").firstChild.nodeValue = (t === "signin" ? "登录 " : "注册 ");
        msg();
      }
      function msg(text, err) { var m = $(".ypx-msg"); if (!text) { m.hidden = true; return; } m.hidden = false; m.textContent = text; m.classList.toggle("err", !!err); }
      function busy(on) { $(".ypx-go").disabled = on; $(".ypx-go").style.opacity = on ? ".6" : ""; }

      $(".ypx-go").onclick = function () {
        var email = $("#ypx-email").value.trim(), pw = $("#ypx-pw").value;
        if (!email || pw.length < 6) return msg("请填写邮箱，密码至少 6 位", true);
        busy(true); msg("处理中…");
        var path = tab === "signup" ? "/auth/signup" : "/auth/login";
        var body = { email: email, password: pw };
        if (tab === "signup") body.display_name = $("#ypx-name").value.trim() || email.split("@")[0];
        api("POST", path, body).then(function (r) {
          busy(false);
          if (r.ok && r.data.token) { setSession(r.data); }
          else msg((r.data && r.data.detail) || (tab === "signup" ? "注册失败" : "登录失败"), true);
        }).catch(function (e) { busy(false); msg("连不上后端：" + (e.message || e) + "（确认 BAZI_API_URL 与服务在运行）", true); });
      };
      return { back: back, setTab: setTab, msg: msg };
    }
    function openModal(tab) { els.msg(); els.setTab(tab || "signin"); els.back.hidden = false; var i = els.back.querySelector("#ypx-email"); if (i) setTimeout(function () { i.focus(); }, 30); }
    function closeModal() { els.back.hidden = true; }

    /* ---------- 报告存档（AI #ask 完成后调用） ---------- */
    window.ypxSaveReport = function (d, ctx) {
      if (!user) return Promise.resolve({ skipped: "anon" });
      ctx = ctx || {};
      return api("POST", "/api/reports", {
        question: ctx.question || "", category: ctx.category || null,
        report_type: ctx.reportType || "ai_analysis", period: ctx.month || null,
        rating: d.rating || null, summary: d.summary || null,
        insights: d.insights || [], report_md: d.report_md || ""
      }).then(function (r) { if (!r.ok) console.warn("[ypx] 存档失败：", r.data && r.data.detail); return r; });
    };
    window.ypxLoggedIn = function () { return !!user; };

    /* ---------- 我的报告 · 抽屉 ---------- */
    function openHistory() {
      var d = document.getElementById("ypx-hist") || (function () {
        var x = document.createElement("div"); x.id = "ypx-hist"; x.className = "ypx-modal-back";
        x.innerHTML = '<div class="ypx-hist glass"><button class="ypx-x" aria-label="关闭">×</button><h3>我的报告</h3><div class="ypx-hist-list">加载中…</div></div>';
        document.body.appendChild(x);
        x.addEventListener("click", function (e) { if (e.target === x) x.hidden = true; });
        x.querySelector(".ypx-x").onclick = function () { x.hidden = true; };
        return x;
      })();
      d.hidden = false;
      var list = d.querySelector(".ypx-hist-list"); list.textContent = "加载中…";
      api("GET", "/api/reports").then(function (r) {
        if (!r.ok) { list.textContent = "读取失败：" + ((r.data && r.data.detail) || r.status); return; }
        var rows = r.data.reports || [];
        if (!rows.length) { list.innerHTML = '<p class="ypx-empty">还没有报告。去「输入问题」区生成一次，登录状态下会自动存档。</p>'; return; }
        list.innerHTML = rows.map(function (it) {
          return '<details class="ypx-hist-item"><summary><b>' + esc(it.rating || "—") + '</b>' +
            '<span>' + esc((it.created_at || "").slice(0, 10)) + ' · ' + esc(it.category || it.report_type) + '</span></summary>' +
            (it.question ? '<p class="ypx-summary">问：' + esc(it.question) + '</p>' : "") +
            (it.summary ? '<p class="ypx-summary">' + esc(it.summary) + '</p>' : "") +
            '<div class="ypx-report">' + mdLite(it.report_md || "") + '</div></details>';
        }).join("");
      });
    }
    function mdLite(md) {
      return String(md).replace(/\r/g, "").split("\n").map(function (ln) {
        if (/^#{1,6}\s/.test(ln)) { var h = ln.match(/^(#+)/)[1].length; return "<h" + h + ">" + esc(ln.replace(/^#+\s/, "")) + "</h" + h + ">"; }
        if (/^---+$/.test(ln.trim())) return "<hr/>";
        if (/^\s*$/.test(ln)) return "";
        return "<p>" + esc(ln).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>") + "</p>";
      }).join("");
    }
  }

  /* ---------- 样式（匹配玄学暗色玻璃） ---------- */
  function injectStyles() {
    if (document.getElementById("ypx-app-css")) return;
    var H = "var(--hue,262)";
    var css =
      ".ypx-navbtn{background:none;border:1px solid hsla(" + H + ",55%,70%,.28);color:#e9e4ff;border-radius:999px;padding:6px 14px;font:inherit;font-size:13px;cursor:pointer;transition:.25s}" +
      ".ypx-navbtn:hover{background:hsla(" + H + ",60%,65%,.14)}.ypx-navbtn.ghost{border-color:hsla(" + H + ",40%,60%,.2);color:hsla(" + H + ",25%,82%,.8)}" +
      ".ypx-userchip{font-size:13px;color:#efeaff;padding:0 6px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      ".ypx-modal-back{position:fixed;inset:0;z-index:9999;background:rgba(6,3,16,.72);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px}" +
      ".ypx-modal-back[hidden]{display:none}" +
      ".ypx-modal,.ypx-hist{position:relative;width:min(94vw,400px);padding:26px 26px 22px;border-radius:20px}" +
      ".ypx-hist{width:min(94vw,560px);max-height:82vh;overflow:auto}" +
      ".ypx-x{position:absolute;top:12px;right:14px;background:none;border:none;color:hsla(" + H + ",30%,80%,.7);font-size:24px;line-height:1;cursor:pointer}" +
      ".ypx-tabs{display:flex;gap:6px;margin-bottom:16px}" +
      ".ypx-tabs button{flex:1;background:hsla(" + H + ",40%,15%,.5);border:1px solid hsla(" + H + ",50%,70%,.18);color:hsla(" + H + ",25%,82%,.8);border-radius:10px;padding:9px;font:inherit;font-size:14px;cursor:pointer}" +
      ".ypx-tabs button.on{background:hsla(" + H + ",65%,62%,.22);border-color:hsla(" + H + ",80%,72%,.5);color:#fff}" +
      ".ypx-f{display:flex;flex-direction:column;gap:5px;font-size:12px;color:hsla(" + H + ",30%,80%,.75);margin-bottom:12px}" +
      ".ypx-f input{background:hsla(" + H + ",40%,12%,.55);border:1px solid hsla(" + H + ",55%,70%,.25);color:#ece8ff;border-radius:10px;padding:11px 12px;font:inherit;font-size:14px}" +
      ".ypx-f input:focus{outline:none;border-color:hsla(" + H + ",80%,72%,.6)}" +
      ".ypx-modal .btn{width:100%;justify-content:center;margin-top:4px}" +
      ".ypx-msg{font-size:13px;color:hsla(" + H + ",60%,82%,.9);margin:2px 0 12px}.ypx-msg.err{color:#ff9c9c}" +
      ".ypx-hist h3{font-family:'Noto Serif SC',serif;font-size:19px;color:#fff;margin:0 0 14px}" +
      ".ypx-hist-item{border:1px solid hsla(" + H + ",50%,70%,.16);border-radius:12px;padding:10px 14px;margin-bottom:10px;background:hsla(" + H + ",45%,58%,.05)}" +
      ".ypx-hist-item summary{cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px;color:#efeaff}" +
      ".ypx-hist-item summary b{font-family:'Noto Serif SC',serif;font-size:16px}.ypx-hist-item summary span{font-size:12px;color:hsla(" + H + ",25%,80%,.7)}" +
      ".ypx-hist .ypx-report{font-size:13.5px;line-height:1.8;color:hsla(" + H + ",18%,86%,.92);margin-top:8px}" +
      ".ypx-hist .ypx-report h2,.ypx-hist .ypx-report h3{font-family:'Noto Serif SC',serif;color:#fff;font-size:15px;margin:10px 0 4px}" +
      ".ypx-hist .ypx-summary{font-size:13.5px;color:hsla(" + H + ",22%,88%,.95);background:hsla(" + H + ",50%,60%,.08);border-radius:10px;padding:10px 12px;margin:6px 0}" +
      ".ypx-empty{font-size:14px;color:hsla(" + H + ",22%,82%,.7)}";
    var st = document.createElement("style"); st.id = "ypx-app-css"; st.textContent = css; document.head.appendChild(st);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
