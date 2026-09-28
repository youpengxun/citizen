/* ============================================================
   有朋迅 · 命理平台 — 后端接入层（渐进增强）
   ------------------------------------------------------------
   设计原则：未配置后端时完全不介入，页面＝原设计静态演示；
   配置后端后才注入「真实命盘月运」能力，且全部包在 try/catch 里，
   任意环节失败都回退到演示态，绝不破坏页面。
   ============================================================ */
(function () {
  "use strict";
  var CFG = window.YPX_CONFIG || {};
  var HAS_BAZI = !!CFG.BAZI_API_URL;   // 自建后端（八字月运 + AI 解读）地址
  
  // 检查是否可以使用本地引擎（改为函数，动态检查）
  function hasLocalEngine() {
    return !!(window.KnowledgeBazi && window.KnowledgeBazi.fullAnalysis);
  }

  /* ---------- 极简 Markdown → HTML（渲染 bazi/AI 报告所用子集） ---------- */
  function mdToHtml(md) {
    var esc = function (s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
    var lines = String(md).replace(/\r/g, "").split("\n");
    var out = [], inList = false;
    var inline = function (s) {
      return esc(s)
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/`([^`]+)`/g, "<code>$1</code>");
    };
    for (var i = 0; i < lines.length; i++) {
      var ln = lines[i];
      if (/^\s*$/.test(ln)) { if (inList) { out.push("</ul>"); inList = false; } continue; }
      if (/^---+$/.test(ln.trim())) { out.push("<hr/>"); continue; }
      var h = ln.match(/^(#{1,6})\s+(.*)$/);
      if (h) { if (inList) { out.push("</ul>"); inList = false; } out.push("<h" + h[1].length + ">" + inline(h[2]) + "</h" + h[1].length + ">"); continue; }
      if (/^>\s?/.test(ln)) { out.push('<blockquote>' + inline(ln.replace(/^>\s?/, "")) + "</blockquote>"); continue; }
      var li = ln.match(/^\s*[-*]\s+(.*)$/);
      if (li) { if (!inList) { out.push("<ul>"); inList = true; } out.push("<li>" + inline(li[1]) + "</li>"); continue; }
      out.push("<p>" + inline(ln) + "</p>");
    }
    if (inList) out.push("</ul>");
    return out.join("\n");
  }

  /* ---------- 真实命盘月运：增强 #ask 区 ---------- */
  function enhanceAsk() {
    var panel = document.querySelector(".ask-panel");
    var go = document.getElementById("ask-go");
    if (!panel || !go) return;
    
    // 修改：当有后端或本地引擎时都显示出生信息输入栏
    var showBirthInput = HAS_BAZI || hasLocalEngine();
    if (!showBirthInput) return;

    // 注入出生信息行（仅在配置了 BAZI_API_URL 时出现）
    var bar = document.createElement("div");
    bar.className = "ypx-birth";
    var LMN = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
    var lyOpts = "", lmOpts = "", ldOpts = "";
    for (var yy = 2026; yy >= 1940; yy--) lyOpts += '<option value="' + yy + '"' + (yy === 1995 ? ' selected' : '') + '>' + yy + '</option>';
    for (var mm = 1; mm <= 12; mm++) lmOpts += '<option value="' + mm + '"' + (mm === 6 ? ' selected' : '') + '>' + LMN[mm - 1] + '月</option>';
    for (var dd = 1; dd <= 30; dd++) ldOpts += '<option value="' + dd + '"' + (dd === 18 ? ' selected' : '') + '>' + dd + '</option>';
    bar.innerHTML =
      '<span class="ypx-birth-lab">生成真实分析需要出生信息：</span>' +
      '<select id="ypx-cal" aria-label="历法"><option value="solar">公历</option><option value="lunar">农历</option></select>' +
      '<input type="date" id="ypx-birth" aria-label="出生日期（公历）" min="1940-01-01" max="' + new Date().getFullYear() + '-12-31" value="1995-06-18" />' +
      '<span id="ypx-lunar" class="ypx-lunar" hidden>' +
        '<select id="ypx-ly" aria-label="农历年">' + lyOpts + '</select>' +
        '<select id="ypx-lm" aria-label="农历月">' + lmOpts + '</select>' +
        '<select id="ypx-ld" aria-label="农历日">' + ldOpts + '</select>' +
        '<label class="ypx-leap"><input type="checkbox" id="ypx-leap" /> 闰月</label>' +
      '</span>' +
      '<select id="ypx-gender" aria-label="性别"><option value="female">女</option><option value="male">男</option></select>' +
      '<select id="ypx-hour" aria-label="出生时辰">' +
        '<option value="">时辰未知</option>' +
        ['0:00','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23']
          .map(function (_, h) { return '<option value="' + h + '"' + (h === 14 ? ' selected' : '') + '>' + h + ' 点</option>'; }).join("") +
      '</select>';
    var input = panel.querySelector(".ask-input");
    if (input && input.parentNode) input.parentNode.insertBefore(bar, input.nextSibling);
    var calEl = document.getElementById("ypx-cal");
    if (calEl) calEl.addEventListener("change", function () {
      var lunar = calEl.value === "lunar";
      var bi = document.getElementById("ypx-birth"); if (bi) bi.hidden = lunar;
      var lg = document.getElementById("ypx-lunar"); if (lg) lg.hidden = !lunar;
    });
    function readBirth() {
      if ((document.getElementById("ypx-cal") || {}).value === "lunar") {
        var ly = (document.getElementById("ypx-ly") || {}).value || "1995";
        var lm = (document.getElementById("ypx-lm") || {}).value || "6";
        var ld = (document.getElementById("ypx-ld") || {}).value || "18";
        return { birth: ly + "-" + lm + "-" + ld, calendar: "lunar", leap: !!((document.getElementById("ypx-leap") || {}).checked) };
      }
      return { birth: (document.getElementById("ypx-birth") || {}).value, calendar: "solar", leap: false };
    }

    // 结果容器
    var result = document.createElement("div");
    result.className = "ypx-result glass";
    result.hidden = true;
    var foot = panel.querySelector(".ask-foot");
    if (foot && foot.parentNode) foot.parentNode.insertBefore(result, foot.nextSibling);
    // 结果分两层：上＝八字真盘（确定性，503 也显示）；下＝AI/月运解读文字
    result.innerHTML = '<div class="ypx-chart" hidden></div><div class="ypx-analysis"></div>';
    var chartBox = result.querySelector(".ypx-chart");
    var anaBox = result.querySelector(".ypx-analysis");

    var busy = false;
    var API = CFG.BAZI_API_URL.replace(/\/$/, "");
    function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    // 让页面「分析 Dashboard · 个人状态概览」吃真实命盘数据（替换写死的演示值）
    function updateDashboard(c, question) {
      try {
        if (!c) return;
        var m = c.metrics || {};
        var gs = document.querySelectorAll("#system .gauge");
        for (var i = 0; i < gs.length; i++) {
          var lab = (gs[i].querySelector(".g-head span") || {}).textContent;
          if (lab && m[lab] != null) {
            var b = gs[i].querySelector(".g-head b"); if (b) b.textContent = m[lab];
            var f = gs[i].querySelector(".g-fill"); if (f) f.style.setProperty("--w", m[lab] + "%");
          }
        }
        if (question) {
          var q = document.querySelector("#system .dash-q");
          if (q) q.innerHTML = '<span class="tag-q">Q</span>' + esc(question);
        }
        // 「命盘」一行用真盘事实（确定性，无需 AI）
        var dm = c.day_master || {}, ln = c.liu_nian || {}, xy = c.xiyong || {};
        // 头部身份：访客 · 丁卯日主 → 命主 · 癸未日主（你的真盘）
        var day = (c.pillars_detail || []).filter(function (p) { return p.role === "day"; })[0] || {};
        var who = document.querySelector("#system .dash-id b");
        if (who) who.textContent = "命主 · " + (day.gz || dm.stem || "") + "日主";
        var aitems = document.querySelectorAll("#system .aitem");
        for (var j = 0; j < aitems.length; j++) {
          if ((aitems[j].querySelector(".dim") || {}).textContent === "命盘") {
            var t = aitems[j].querySelector(".txt");
            if (t) t.innerHTML = "日主 <b>" + esc(dm.stem) + "（" + esc(dm.element) + "）</b>身" + esc(dm.strength) +
              "，" + (ln.year || "") + " 流年 <b>" + esc(ln.gz) + "</b> 对你＝<b>" + esc(ln.god) +
              "</b>，喜用 <b>" + esc((xy.xi || []).join("")) + "</b> 忌 <b>" + esc((xy.ji || []).join("")) + "</b>。";
          }
        }
      } catch (e) {}
    }
    // 有 AI 结果时，用 insights/时间轴进一步充实 Dashboard（六爻/塔罗/现实/AI综合 + 趋势）
    function updateDashboardAI(d) {
      try {
        var sys = d && d.systems;
        if (sys) {
          var aitems = document.querySelectorAll("#system .aitem");
          for (var j = 0; j < aitems.length; j++) {
            var dim = ((aitems[j].querySelector(".dim") || {}).textContent || "").replace(/\s+/g, "");  // 兼容「AI 综合」/「AI综合」
            if (sys[dim]) { var t = aitems[j].querySelector(".txt"); if (t) t.textContent = sys[dim]; }
          }
        }
        var tl = d && d.timeline;
        if (tl && tl.length) {
          var nodes = document.querySelectorAll("#system .tnode");
          for (var k = 0; k < nodes.length && k < tl.length; k++) {
            var bb = nodes[k].querySelector("b"); var sp = nodes[k].querySelector("span");
            if (bb && tl[k].when) bb.textContent = tl[k].when;
            if (sp && tl[k].what) sp.textContent = tl[k].what;
          }
        }
        // AI 的风险点/机会窗口覆盖「报告示例」对应卡片（比确定性更贴问题）
        var ins = (d && d.insights) || [];
        for (var x = 0; x < ins.length; x++) {
          if (ins[x].type === "风险点") setReportCard("风险点", ins[x].value, ins[x].detail);
          if (ins[x].type === "机会窗口") setReportCard("机会窗口", ins[x].value, ins[x].detail);
        }
      } catch (e) {}
    }
    // 「报告示例」三张卡片 ← 真实命盘（截图②：解决问题，而非展示写死示例）
    function setReportCard(label, value, detail) {
      var cards = document.querySelectorAll("#report .rcard");
      for (var i = 0; i < cards.length; i++) {
        if ((cards[i].querySelector(".rk") || {}).textContent === label) {
          var rv = cards[i].querySelector(".rv"); if (rv && value) rv.textContent = value;
          var p = cards[i].querySelector("p"); if (p && detail) p.textContent = detail;
        }
      }
    }
    function updateReportCards(c) {
      try {
        if (!c) return;
        var dm = c.day_master || {}, xy = c.xiyong || {}, ln = c.liu_nian || {};
        var xi = (xy.xi || []).join(""), ji = (xy.ji || []).join("");
        setReportCard("当前状态", "身" + (dm.strength || ""),
          "日主" + dm.stem + "（" + dm.element + "）身" + dm.strength + (c.rating ? "，本期总评" + c.rating : "") + "，喜用" + xi + "。");
        if (ji) setReportCard("风险点", "忌" + ji,
          "忌神为" + ji + "，当该五行当令或被流年引动时易生波折，宜提前留意。");
        setReportCard("机会窗口", (ln.year ? ln.year + " · " + ln.god : ""),
          ln.year + " 流年 " + ln.gz + " 对日主＝" + ln.god + "，是这件事的关键时间窗口。");
      } catch (e) {}
    }
    function renderInsights(list) {
      if (!list || !list.length) return "";
      return '<div class="ypx-icards">' + list.map(function (it) {
        var cls = it.type === "风险点" ? "risk" : it.type === "机会窗口" ? "chance" : "other";
        return '<div class="ypx-icard ' + cls + '"><span class="ypx-ik">' + esc(it.type) + "</span>" +
          '<span class="ypx-iv">' + esc(it.value) + "</span><b>" + esc(it.title) + "</b><p>" + esc(it.detail) + "</p></div>";
      }).join("") + "</div>";
    }
    // 统一渲染分析结果（AI 与 命盘确定性引擎 同构，共用一套渲染 + Dashboard 充实）
    function renderAnalysis(d, headLabel) {
      var tags = (d.cached ? '<span class="ypx-tag">缓存命中</span>' : "") +
        (d.model ? '<span class="ypx-tag">' + esc(d.model) + "</span>" : "");
      anaBox.innerHTML =
        '<div class="ypx-result-head"><b>' + esc(headLabel) + " · " + esc(d.rating || "—") + "</b>" + tags + "</div>" +
        (d.summary ? '<p class="ypx-summary">' + esc(d.summary) + "</p>" : "") +
        renderInsights(d.insights) +
        '<div class="ypx-report">' + mdToHtml(d.report_md || "") + "</div>";
      updateDashboardAI(d);   // systems/timeline/insights → Dashboard 其余维度 + 报告卡片
    }
    function showErr(msg) {
      anaBox.innerHTML = '<div class="ypx-result-head ypx-err">分析服务暂时不可用</div><p class="ypx-report">' + esc(msg) + "</p>";
      busy = false;
    }
    // 退路：无 AI key（503）时，用「命盘确定性引擎」给贴题解读（真盘已在上方；无需 key、不联网）
    function fallbackReading(rb) {
      anaBox.innerHTML = '<div class="ypx-result-head"><span class="ypx-spin"></span>正在用命盘确定性引擎贴题解读…</div>';
      fetch(API + "/api/reading", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rb) })
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (d) {
          renderAnalysis(d, "命盘综合分析");
          anaBox.insertAdjacentHTML("beforeend", '<p class="ypx-summary" style="margin-top:12px;opacity:.85">本结果由命盘确定性引擎生成（未用 AI、不联网）。如需更自然的深度解读，可设置免费大模型 key（glm-4-flash / DeepSeek）。</p>');
          if (window.ypxSaveReport && window.ypxLoggedIn && window.ypxLoggedIn()) {
            try { window.ypxSaveReport(d, { question: rb.question, category: rb.category, month: rb.month, reportType: "bazi_reading" }); } catch (e) {}
          }
        })
        .catch(function (e) { 
          // 后端不可用，尝试使用本地引擎
          if (hasLocalEngine()) {
            useLocalEngine(rb);
          } else {
            showErr(String((e && e.message) || e) + "。请检查 BAZI_API_URL 与 bazi_api.py 服务（含 CORS）。"); 
          }
        })
        .finally(function () { busy = false; });
    }
    
    // 使用本地八字解析引擎
    async function useLocalEngine(rb) {
      try {
        console.log("[useLocalEngine] 开始使用本地引擎分析", rb);
        anaBox.innerHTML = '<div class="ypx-result-head"><span class="ypx-spin"></span>正在使用本地引擎分析命盘…</div>';

        // 调用本地引擎（异步，需 await）
        var birth = rb.birth;
        var hour = rb.hour;
        var gender = rb.gender || "male";

        console.log("[useLocalEngine] 调用 KnowledgeBazi.fullAnalysis", { birth: birth, hour: hour, gender: gender });
        var analysis = await window.KnowledgeBazi.fullAnalysis(birth, hour, gender);
        console.log("[useLocalEngine] 分析结果", analysis);

        var chartData = window.KnowledgeBazi.toChartFormat(analysis);
        console.log("[useLocalEngine] 图表数据", chartData);

        // 渲染命盘
        if (window.ypxRenderChart) {
          console.log("[useLocalEngine] 渲染命盘");
          chartBox.innerHTML = window.ypxRenderChart(chartData);
          chartBox.hidden = false;
        } else {
          console.warn("[useLocalEngine] ypxRenderChart 未定义，无法渲染命盘");
        }

        // 更新 Dashboard
        updateDashboard(chartData, rb.question);
        updateReportCards(chartData);

        // 生成分析报告（Markdown格式）
        var reportMd = window.KnowledgeBazi.generateReport(analysis);
        chartData.report_md = reportMd;
        chartData.rating = analysis.strengthInfo.strength === "旺" ? "身旺" :
                           analysis.strengthInfo.strength === "中" ? "中和" :
                           analysis.strengthInfo.strength === "弱" ? "身弱" : "极弱";
        chartData.summary = "日主" + analysis.pillars.day.stem + "（" + (window.KnowledgeBazi.STEM_ELEMENT[analysis.pillars.day.stem] || "") + "）身" + analysis.strengthInfo.strength +
          "，格局" + (analysis.geju[0] && analysis.geju[0].name || "普通") + "，喜用" + (analysis.xiyong.xiyong || []).join("、");

        // 渲染分析结果
        console.log("[useLocalEngine] 渲染分析结果");
        renderAnalysis(chartData, "本地命盘分析");

        anaBox.insertAdjacentHTML("beforeend", '<p class="ypx-summary" style="margin-top:12px;opacity:.85">本结果由本地八字解析引擎生成（完全离线），基于渊海子平、子平真诠、滴天髓等古籍理论。如需 AI 深度解读，可连接后端服务。</p>');

        busy = false;
      } catch (e) {
        console.error("[useLocalEngine] 错误", e);
        showErr("本地引擎分析失败：" + String(e.message || e));
        busy = false;
      }
    }
    go.addEventListener("click", function () {
      if (busy) return;
      var bi = readBirth();
      var birth = bi.birth;
      if (!birth) { return; } // 没填出生信息时，保留原演示动画，不打扰
      busy = true;
      var gender = (document.getElementById("ypx-gender") || {}).value || "female";
      var hourRaw = (document.getElementById("ypx-hour") || {}).value;
      var ta = panel.querySelector(".ask-input textarea");
      var question = (ta && ta.value.trim()) || "请综合分析我当前的整体状态与近期走向。";
      var tagEl = panel.querySelector(".ask-tag.on");
      var category = tagEl ? tagEl.textContent.trim() : null;

      var body = { question: question, birth: birth, gender: gender, category: category, calendar: bi.calendar, leap: bi.leap };
      if (hourRaw !== "" && hourRaw != null) body.hour = parseInt(hourRaw, 10);
      if (CFG.DEFAULT_MONTH) body.month = CFG.DEFAULT_MONTH;
      result.hidden = false;
      chartBox.hidden = true; chartBox.innerHTML = "";
      
      // 如果未配置后端但本地引擎可用，直接使用本地引擎
      if (!HAS_BAZI && hasLocalEngine()) {
        useLocalEngine(body);
        return;
      }
      
      anaBox.innerHTML = '<div class="ypx-result-head"><span class="ypx-spin"></span>正在综合八字 · 紫微 · 命局，生成分析…</div>';
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });

      // 紫微：用 #ask 的出生信息现起一盘（与问题同一人/同一年）；时辰未知或失败则退已显示的盘
      var tyear = body.month ? parseInt(String(body.month).slice(0, 4), 10) : 2026;
      var castZw = (window.ypxCastZiwei && body.hour != null)
        ? window.ypxCastZiwei({ birth: birth, calendar: bi.calendar, leap: bi.leap, hour: body.hour, gender: gender, year: tyear })
            .then(function (z) { return z || window.__ypxZiwei || null; })
            .catch(function () { return window.__ypxZiwei || null; })
        : Promise.resolve(window.__ypxZiwei || null);

      // 1) 先拉真盘并渲染框架（确定性，无论有无 AI key 都显示）
      var cb = { birth: birth, gender: gender, calendar: bi.calendar, leap: bi.leap, target_year: tyear };
      if (body.hour != null) cb.hour = body.hour;
      
      var backendFailed = false;  // 标志：后端是否失败
      
      fetch(API + "/api/chart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cb) })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (c) {
          if (c) {
            if (window.ypxRenderChart) { chartBox.innerHTML = window.ypxRenderChart(c); chartBox.hidden = false; }
            updateDashboard(c, question);   // 个人状态概览 ← 真实命盘
            updateReportCards(c);           // 报告示例卡片 ← 真实命盘
            castZw.then(function (zw) {      // 双盘合参：紫微就绪后附在八字盘下
              if (zw && window.ypxRenderZiweiBrief && !chartBox.hidden) {
                try { chartBox.insertAdjacentHTML("beforeend", window.ypxRenderZiweiBrief(zw)); } catch (e) {}
              }
            });
          } else {
            // /api/chart 返回 null（HTTP 错误），标记后端失败
            backendFailed = true;
          }
        })
        .catch(function (e) {
          // /api/chart 请求失败（网络错误等），标记后端失败
          console.warn("[ai-integration] /api/chart 请求失败，将使用本地引擎", e);
          backendFailed = true;
          
          // 如果本地引擎可用，直接使用
          if (hasLocalEngine()) {
            useLocalEngine(body);
          }
        });

      // 2) 紫微就绪后再请求 AI 深度解读（带紫微做八字×紫微双印证；503＝无 key → 退确定性解读）
      castZw.then(function (zw) {
        // 如果后端已经失败，跳过 API 调用
        if (backendFailed) {
          console.log("[ai-integration] 后端已失败，跳过 /api/analyze 请求");
          return;
        }
        
        if (zw) body.ziwei = zw;
        fetch(API + "/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
          .then(function (r) {
            if (r.status === 503) throw { fallback: true };       // 无 AI key → 退到月运
            if (!r.ok) return r.json().then(function (j) { throw new Error((j && j.detail) || ("HTTP " + r.status)); });
            return r.json();
          })
          .then(function (d) {
            renderAnalysis(d, "AI 综合分析");
            // 登录态下自动存档（自建后端，按 user_id 隔离）；未登录则跳过
            if (window.ypxSaveReport && window.ypxLoggedIn && window.ypxLoggedIn()) {
              try {
                window.ypxSaveReport(d, { question: question, category: category, month: body.month, reportType: "ai_analysis" });
                anaBox.insertAdjacentHTML("beforeend", '<p class="ypx-summary" style="margin-top:12px">已存入「我的报告」。</p>');
              } catch (e) {}
            }
            busy = false;
          })
          .catch(function (e) {
            if (e && e.fallback) { fallbackReading(body); return; }  // 无 key → 命盘确定性贴题解读
            // 后端请求失败，尝试使用本地引擎
            if (hasLocalEngine()) {
              console.warn("[ai-integration] /api/analyze 请求失败，将使用本地引擎", e);
              useLocalEngine(body);
            } else {
              showErr(String((e && e.message) || e) + "。请确认 BAZI_API_URL 与 bazi_api.py 服务（含 CORS）。");
            }
          });
      });   // castZw.then —— 紫微就绪后才发起解读
    }, false);
  }

  /* ---------- 增强元素样式（注入，保持原设计文件不被改动） ---------- */
  function injectStyles() {
    if (document.getElementById("ypx-enhance-css")) return;
    var css =
      ".ypx-birth{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:16px 0 2px}" +
      ".ypx-birth-lab{font-size:13px;color:hsla(var(--hue,262),30%,82%,.7);width:100%}" +
      ".ypx-birth input,.ypx-birth select{background:hsla(var(--hue,262),40%,12%,.5);border:1px solid hsla(var(--hue,262),60%,70%,.25);color:#ece8ff;border-radius:10px;padding:9px 12px;font:inherit;font-size:14px}" +
      ".ypx-lunar{display:inline-flex;gap:6px;align-items:center;flex-wrap:wrap}.ypx-lunar[hidden]{display:none}" +
      ".ypx-leap{display:inline-flex;align-items:center;gap:4px;font-size:13px;color:hsla(var(--hue,262),22%,84%,.85);white-space:nowrap}" +
      ".ypx-leap input{width:auto;margin:0;padding:0}" +
      ".ypx-birth input:focus,.ypx-birth select:focus{outline:none;border-color:hsla(var(--hue,262),80%,72%,.6)}" +
      ".ypx-result{margin-top:18px;padding:20px 22px;border-radius:16px}" +
      ".ypx-result-head{display:flex;align-items:center;gap:10px;font-family:'Noto Serif SC',serif;font-size:17px;color:#efeaff;margin-bottom:8px}" +
      ".ypx-result-head.ypx-err{color:#ff9c9c}" +
      ".ypx-tag{font-size:11px;padding:2px 8px;border-radius:999px;background:hsla(var(--hue,262),70%,70%,.18);color:hsla(var(--hue,262),80%,85%,.9)}" +
      ".ypx-report{font-size:14px;line-height:1.85;color:hsla(var(--hue,262),18%,86%,.92)}" +
      ".ypx-report h2{font-family:'Noto Serif SC',serif;font-size:18px;margin:16px 0 6px;color:#fff}" +
      ".ypx-report h3{font-size:15px;margin:14px 0 4px;color:hsla(var(--hue,262),60%,86%,.95)}" +
      ".ypx-report strong{color:#fff}.ypx-report code{font-family:'Space Grotesk',monospace;font-size:13px}" +
      ".ypx-report hr{border:none;border-top:1px solid hsla(var(--hue,262),50%,70%,.16);margin:12px 0}" +
      ".ypx-report blockquote{margin:8px 0;padding-left:12px;border-left:2px solid hsla(var(--hue,262),70%,70%,.4);color:hsla(var(--hue,262),25%,82%,.8)}" +
      ".ypx-report ul{margin:6px 0;padding-left:18px}.ypx-report li{margin:3px 0}" +
      ".ypx-summary{font-size:14px;line-height:1.8;color:hsla(var(--hue,262),22%,88%,.95);margin:2px 0 14px;padding:12px 14px;border-radius:12px;background:hsla(var(--hue,262),50%,60%,.08);border:1px solid hsla(var(--hue,262),50%,70%,.16)}" +
      ".ypx-icards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:4px 0 16px}" +
      ".ypx-icard{padding:12px 14px;border-radius:12px;background:hsla(var(--hue,262),45%,58%,.06);border:1px solid hsla(var(--hue,262),50%,70%,.16)}" +
      ".ypx-icard .ypx-ik{font-size:11px;letter-spacing:.06em;color:hsla(var(--hue,262),60%,82%,.8)}" +
      ".ypx-icard .ypx-iv{display:block;font-family:'Noto Serif SC',serif;font-size:17px;color:#fff;margin:3px 0 6px}" +
      ".ypx-icard b{display:block;font-size:13px;color:#efeaff;margin-bottom:3px}" +
      ".ypx-icard p{font-size:12.5px;line-height:1.6;color:hsla(var(--hue,262),18%,84%,.8);margin:0}" +
      ".ypx-icard.risk{border-color:hsla(8,70%,65%,.38)}.ypx-icard.risk .ypx-ik{color:#ff9c9c}" +
      ".ypx-icard.chance{border-color:hsla(96,55%,55%,.4)}.ypx-icard.chance .ypx-ik{color:#bfe08a}" +
      ".ypx-spin{width:14px;height:14px;border-radius:50%;border:2px solid hsla(var(--hue,262),70%,75%,.3);border-top-color:hsla(var(--hue,262),90%,80%,.95);display:inline-block;animation:ypxspin .8s linear infinite}" +
      "@keyframes ypxspin{to{transform:rotate(360deg)}}";
    var st = document.createElement("style");
    st.id = "ypx-enhance-css";
    st.textContent = css;
    document.head.appendChild(st);
  }

  function boot() {
    try { injectStyles(); } catch (e) {}
    try { enhanceAsk(); } catch (e) {}
    if (!HAS_BAZI) {
      console.info("[ypx] 后端未配置 · 以静态演示模式运行（填写 web/config.js 的 BAZI_API_URL 即可启用真实分析）。");
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
