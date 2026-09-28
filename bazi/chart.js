/* ============================================================
   有朋迅 · 八字真盘渲染器（确定性，无需 AI）
   ------------------------------------------------------------
   window.ypxRenderChart(chart) -> HTML 字符串
   chart = 后端 /api/chart 返回：四柱(十神/藏干/纳音)+五行+旺衰+喜用+大运+流年+指标
   纯展示，不依赖任何后端 key —— 让「排盘框架」始终可见。
   ============================================================ */
(function () {
  "use strict";
  var EC = { "木": "#276438", "火": "#ac3029", "土": "#795613", "金": "#695225", "水": "#1d60a0" };
  var ROLE = { year: "年柱", month: "月柱", day: "日柱", hour: "时柱" };
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function col(c) { return EC[c] || "#cfc6ee"; }
  // 阴阳色：阳干=金白，阴干=水蓝
  var STEM_YINYANG = {
    "甲":"阳","丙":"阳","戊":"阳","庚":"阳","壬":"阳",
    "乙":"阴","丁":"阴","己":"阴","辛":"阴","癸":"阴"
  };
  // 八卦类象（基础类象信息）
  var STEM_BAGUA = {
    "甲":"木·雷·胆","乙":"木·风·肝",
    "丙":"火·火·小肠","丁":"火·火·心",
    "戊":"土·山·胃","己":"土·地·脾",
    "庚":"金·泽·大肠","辛":"金·泽·肺",
    "壬":"水·水·膀胱","癸":"水·水·肾"
  };

  // === 八字排盘表（标准格式）===
  // 行：1.柱位(年柱/...) 2.天干 3.地支 4.十神(天干) 5.藏干(本气/中气/余气) 6.十神(藏干)
  //    7.地支主气五行 8.纳音 9.神煞 10.空亡
  // 列：4列（年柱、月柱、日柱、时柱）
  function renderPillarTable(P, kongWang) {
    // 表头：年柱 月柱 日柱 时柱
    var headRow = '<tr class="yc-th-row"><th class="yc-th yc-th-label"></th>' +
      P.map(function(p) {
        var hl = p.role === "day" ? ' yc-day-h' : '';
        return '<th class="yc-th' + hl + '">' + ROLE[p.role] + '</th>';
      }).join("") + '</tr>';

    // 行1：胎元/命宫之类的高级信息（这里简化为四柱的"位置"说明）
    // 行2：天干
    var stemRow = '<tr class="yc-r-stem">' +
      '<td class="yc-rl">天干</td>' +
      P.map(function(p) {
        var hl = p.role === "day" ? ' yc-day' : '';
        var yy = STEM_YINYANG[p.stem] || "";
        return '<td class="yc-td' + hl + '">' +
          '<b class="yc-stem-big" style="color:' + col(p.element) + '">' + esc(p.stem) + '</b>' +
          '<i class="yc-yy">' + yy + '</i></td>';
      }).join("") + '</tr>';

    // 行3：地支
    var branchRow = '<tr class="yc-r-branch">' +
      '<td class="yc-rl">地支</td>' +
      P.map(function(p) {
        var hl = p.role === "day" ? ' yc-day' : '';
        return '<td class="yc-td' + hl + '">' +
          '<b class="yc-branch-big" style="color:' + col(p.branch_element) + '">' + esc(p.branch) + '</b></td>';
      }).join("") + '</tr>';

    // 行4：十神（对日主）
    var godRow = '<tr class="yc-r-god">' +
      '<td class="yc-rl">十神</td>' +
      P.map(function(p) {
        var hl = p.role === "day" ? ' yc-day' : '';
        var g = p.role === "day" ? "日主" : (p.stem_god || "—");
        return '<td class="yc-td yc-god-td' + hl + '">' + esc(g) + '</td>';
      }).join("") + '</tr>';

    // 行5：藏干（本气/中气/余气，含十神）
    var hidRow = '<tr class="yc-r-hid">' +
      '<td class="yc-rl">藏干<br/><i class="yc-rli">本/中/余</i></td>' +
      P.map(function(p) {
        var hl = p.role === "day" ? ' yc-day' : '';
        var hid = (p.hidden || []);
        if (!hid.length) return '<td class="yc-td' + hl + '"><span class="yc-empty">—</span></td>';
        // 标记本/中/余
        var types = ["本", "中", "余"];
        var inner = hid.map(function(h, i) {
          var tag = types[i] || "";
          return '<div class="yc-hid-line">' +
            (tag ? '<i class="yc-hid-tag" data-type="' + tag + '">' + tag + '</i>' : '') +
            '<b style="color:' + col(h.element) + '">' + esc(h.stem) + '</b>' +
            '<span class="yc-hid-god">' + esc(h.god || "") + '</span>' +
            '</div>';
        }).join("");
        return '<td class="yc-td yc-hid-td' + hl + '">' + inner + '</td>';
      }).join("") + '</tr>';

    // 行6：地支五行
    var elemRow = '<tr class="yc-r-elem">' +
      '<td class="yc-rl">地支五行</td>' +
      P.map(function(p) {
        var hl = p.role === "day" ? ' yc-day' : '';
        return '<td class="yc-td' + hl + '">' +
          '<span class="yc-elem-tag" style="color:' + col(p.branch_element) + '">' + esc(p.branch_element) + '</span></td>';
      }).join("") + '</tr>';

    // 行7：纳音
    var nyRow = '<tr class="yc-r-ny">' +
      '<td class="yc-rl">纳音</td>' +
      P.map(function(p) {
        var hl = p.role === "day" ? ' yc-day' : '';
        return '<td class="yc-td yc-ny-td' + hl + '">' + esc(p.nayin || "—") + '</td>';
      }).join("") + '</tr>';

    // 行8：空亡（在日柱上方标注日柱旬对应的空亡地支）
    var kwRow = '<tr class="yc-r-kw">' +
      '<td class="yc-rl">空亡</td>' +
      P.map(function(p) {
        var hl = p.role === "day" ? ' yc-day' : '';
        var inKw = (kongWang || []).indexOf(p.branch) >= 0;
        if (inKw) {
          return '<td class="yc-td yc-kw-hit' + hl + '">' + esc(p.branch) + '<i class="yc-kw-i">空</i></td>';
        }
        return '<td class="yc-td' + hl + '"><span class="yc-empty">—</span></td>';
      }).join("") + '</tr>';

    return '<table class="yc-pillars">' +
      '<thead>' + headRow + '</thead>' +
      '<tbody>' + stemRow + branchRow + godRow + hidRow + elemRow + nyRow + kwRow + '</tbody>' +
      '</table>';
  }

  function render(c) {
    if (!c || !c.pillars_detail) return "";
    var P = c.pillars_detail, dm = c.day_master || {}, xy = c.xiyong || {}, wx = c.wuxing || {};
    var dy = c.da_yun || {}, ln = c.liu_nian || {}, m = c.metrics || {};
    var shensha = c.shensha || [];
    var kongWang = c.kong_wang || [];

    // === 主排盘表 ===
    var pillarTable = renderPillarTable(P, kongWang);

    // === 日主信息行（横跨整行） ===
    var meta = '<div class="yc-meta">' +
      '<span class="yc-dm">日主 <b style="color:' + col(dm.element) + '">' + esc(dm.stem) + '</b>（' + esc(dm.element) + '）</span>' +
      '<span class="yc-st">身<b>' + esc(dm.strength || "—") + '</b></span>' +
      '<span class="yc-xy">喜用 <b class="yc-xi">' + esc((xy.xi || []).join("·") || "—") + '</b></span>' +
      '<span class="yc-ji">忌 <b class="yc-ji-c">' + esc((xy.ji || []).join("·") || "—") + '</b></span>' +
      (dm.score != null ? '<span class="yc-score">评分 ' + dm.score + '</span>' : '') +
      '</div>';

    // === 五行能量条 ===
    var vals = ["木", "火", "土", "金", "水"].map(function (k) { return wx[k] || 0; });
    var mx = Math.max.apply(null, [1].concat(vals));
    var total = vals.reduce(function(a,b){return a+b;}, 0) || 1;
    var wxBars = ["木", "火", "土", "金", "水"].map(function (k) {
      var v = wx[k] || 0;
      var pct = Math.round(v / mx * 100);
      var ratio = (v / total * 100).toFixed(1);
      return '<div class="yc-wx"><span class="yc-wxk" style="color:' + col(k) + '">' + k + '</span>' +
        '<span class="yc-wxbar"><i style="width:' + pct + '%;background:' + col(k) + '"></i></span>' +
        '<span class="yc-wxv">' + v.toFixed(1) + '</span>' +
        '<span class="yc-wxpct">' + ratio + '%</span></div>';
    }).join("");

    // === 状态指标 ===
    var gauges = Object.keys(m).map(function (k) {
      var v = m[k];
      return '<div class="yc-g"><span class="yc-gk">' + esc(k) + '</span>' +
        '<span class="yc-gbar"><i style="width:' + v + '%"></i></span><span class="yc-gv">' + v + '</span></div>';
    }).join("");

    // === 大运 ===
    var runs = (dy.runs || []).slice(0, 8).map(function (r) {
      var isCurrent = r.current ? ' yc-yun-cur' : '';
      return '<div class="yc-yun' + isCurrent + '"><b>' + esc(r.gz) + '</b><span>' + r.age + '岁</span></div>';
    }).join("");

    // === 神煞（精简到每柱所属神煞）===
    // 把神煞按所在地支分组
    var ssByBranch = {};
    for (var i = 0; i < shensha.length; i++) {
      var s = shensha[i];
      var where = s.where || (s.branch ? [s.branch] : []);
      for (var j = 0; j < where.length; j++) {
        if (!ssByBranch[where[j]]) ssByBranch[where[j]] = [];
        ssByBranch[where[j]].push(s);
      }
    }
    // 在主表后追加"神煞"行（按四柱分别列示）
    var ssHeader = '<tr class="yc-th-row"><th class="yc-th yc-th-label">神煞</th>' +
      P.map(function(p) {
        var hl = p.role === "day" ? ' yc-day-h' : '';
        return '<th class="yc-th' + hl + '">' + ROLE[p.role] + '</th>';
      }).join("") + '</tr>';
    var ssRow = '<tr class="yc-r-ss">' +
      '<td class="yc-rl">所在神煞</td>' +
      P.map(function(p) {
        var hl = p.role === "day" ? ' yc-day' : '';
        var list = ssByBranch[p.branch] || [];
        if (!list.length) return '<td class="yc-td' + hl + '"><span class="yc-empty">—</span></td>';
        var inner = list.map(function(s) {
          return '<i class="yc-ss-tag">' + esc(s.name) + '</i>';
        }).join("");
        return '<td class="yc-td yc-ss-td' + hl + '">' + inner + '</td>';
      }).join("") + '</tr>';

    var ssTable = '<table class="yc-pillars yc-ss-table">' +
      '<thead>' + ssHeader + '</thead>' +
      '<tbody>' + ssRow + '</tbody></table>';

    // === 格局 ===
    var geju = c.geju || [];
    var gejuHtml = '';
    if (geju.length) {
      var gjList = geju.map(function(g) {
        return '<div class="yc-gj"><b>' + esc(g.name) + '</b>' +
          (g.reason ? '<span>' + esc(g.reason) + '</span>' : '') + '</div>';
      }).join("");
      gejuHtml = '<div class="yc-card"><div class="yc-ct">格局 · ' + (geju[0].name || "") + '</div>' + gjList + '</div>';
    }

    return '<div class="yc-wrap">' +
      '<div class="yc-h"><b>命主命盘</b><span>八字真排 · 据出生信息实算 · ' + ROLE.day + '高亮</span></div>' +
      pillarTable +
      meta +
      ssTable +
      '<div class="yc-cols2">' +
        '<div class="yc-card"><div class="yc-ct">五行能量</div>' + wxBars + '</div>' +
        '<div class="yc-card"><div class="yc-ct">状态指标 · 按命盘实算</div>' + gauges + '</div>' +
      '</div>' +
      (dy.runs && dy.runs.length ?
        ('<div class="yc-card"><div class="yc-ct">大运 · ' + (dy.forward ? "顺行" : "逆行") +
          '（约 ' + (dy.start_age || "") + ' 岁起运，黄色为当前大运）</div><div class="yc-yuns">' + runs + '</div></div>') : '') +
      gejuHtml +
      '<div class="yc-ln">' + (ln.year || "") + ' 流年 <b style="color:' + col(ln.element) + '">' + esc(ln.gz) +
        '</b>（' + esc(ln.element) + '）· 对日主＝<b>' + esc(ln.god) + '</b> · 当年主题由此星定调</div>' +
      '</div>';
  }

  function injectCSS() {
    if (document.getElementById("yc-css")) return;
    var H = "var(--hue,262)";
    var css =
      // === 整体 ===
      ".yc-wrap{margin:6px 0 18px;padding:0}" +
      ".yc-h{display:flex;align-items:baseline;gap:10px;margin-bottom:14px;padding:0 4px}" +
      ".yc-h b{font-family:'Noto Serif SC',serif;font-size:18px;color:#fff;letter-spacing:.04em}" +
      ".yc-h span{font-size:12px;color:hsla(" + H + ",30%,80%,.6)}" +

      // === 主表（排盘） ===
      ".yc-pillars{width:100%;border-collapse:separate;border-spacing:0;background:hsla(" + H + ",45%,14%,.4);border:1px solid hsla(" + H + ",50%,68%,.18);border-radius:14px;overflow:hidden;table-layout:fixed}" +
      ".yc-pillars thead th{padding:10px 0;font-family:'Noto Serif SC',serif;font-size:13px;color:hsla(" + H + ",60%,84%,.92);background:hsla(" + H + ",55%,20%,.5);border-bottom:1px solid hsla(" + H + ",55%,68%,.18);font-weight:500;letter-spacing:.06em}" +
      ".yc-pillars thead th.yc-th-label{width:90px;color:hsla(" + H + ",35%,78%,.7);font-weight:400}" +
      ".yc-pillars thead th.yc-day-h{background:hsla(" + H + ",70%,42%,.45);color:#fff;font-weight:600;text-shadow:0 0 8px hsla(" + H + ",80%,70%,.5)}" +
      ".yc-pillars tbody tr{border-bottom:1px solid hsla(" + H + ",45%,68%,.08)}" +
      ".yc-pillars tbody tr:last-child{border-bottom:none}" +
      ".yc-pillars td{padding:9px 6px;text-align:center;vertical-align:middle;font-size:13.5px}" +
      ".yc-pillars .yc-rl{width:90px;text-align:right;padding-right:14px;color:hsla(" + H + ",35%,82%,.65);font-size:12.5px;font-family:'Noto Serif SC',serif;background:hsla(" + H + ",40%,18%,.3);border-right:1px solid hsla(" + H + ",50%,68%,.1)}" +
      ".yc-pillars .yc-rli{font-style:normal;color:hsla(" + H + ",30%,78%,.45);font-size:10.5px;display:block;margin-top:1px}" +
      // 日柱列高亮
      ".yc-pillars .yc-day{background:hsla(" + H + ",65%,30%,.18)}" +
      ".yc-pillars td.yc-day{position:relative}" +
      ".yc-pillars td.yc-day::before{content:'';position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,hsla(" + H + ",80%,65%,.7),transparent)}" +
      ".yc-pillars td.yc-day::after{content:'';position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,transparent,hsla(" + H + ",80%,65%,.5),transparent)}" +

      // === 天干/地支大字 ===
      ".yc-stem-big,.yc-branch-big{display:block;font-family:'Noto Serif SC',serif;font-size:30px;font-weight:600;line-height:1.05;text-shadow:0 0 12px hsla(" + H + ",50%,40%,.3)}" +
      ".yc-branch-big{font-size:30px;margin-top:2px}" +
      ".yc-yy{display:block;font-size:9.5px;color:hsla(" + H + ",30%,78%,.5);font-style:normal;letter-spacing:.1em;margin-top:1px}" +

      // === 十神 ===
      ".yc-god-td{font-family:'Noto Serif SC',serif;font-size:13px;color:hsla(" + H + ",55%,86%,.92);font-weight:500;letter-spacing:.04em}" +
      ".yc-pillars tr.yc-r-god td.yc-god-td{color:hsla(" + H + ",70%,86%,.95)}" +

      // === 藏干 ===
      ".yc-hid-td{font-size:11.5px;padding:6px 4px;line-height:1.45}" +
      ".yc-hid-line{display:flex;align-items:center;justify-content:center;gap:3px;margin:1px 0}" +
      ".yc-hid-tag{display:inline-block;width:11px;height:11px;line-height:11px;text-align:center;border-radius:2px;font-size:8.5px;font-style:normal;color:#0c0a1a;margin-right:2px;font-weight:700}" +
      ".yc-hid-tag[data-type='本']{background:#695225}" +
      ".yc-hid-tag[data-type='中']{background:#276438}" +
      ".yc-hid-tag[data-type='余']{background:#1d60a0}" +
      ".yc-hid-line b{font-family:'Noto Serif SC',serif;font-size:14px;font-weight:600}" +
      ".yc-hid-god{color:hsla(" + H + ",25%,80%,.78);font-size:10.5px}" +

      // === 地支五行 ===
      ".yc-elem-tag{display:inline-block;font-family:'Noto Serif SC',serif;font-size:14px;letter-spacing:.06em}" +

      // === 纳音 ===
      ".yc-ny-td{font-size:12px;color:hsla(" + H + ",30%,82%,.78);font-family:'Noto Serif SC',serif;letter-spacing:.04em}" +

      // === 空亡 ===
      ".yc-kw-hit{color:#ff9c9c;font-family:'Noto Serif SC',serif;font-weight:600;position:relative}" +
      ".yc-kw-hit b{font-size:16px}" +
      ".yc-kw-i{font-style:normal;display:inline-block;font-size:9.5px;background:hsla(8,70%,60%,.18);color:#ff9c9c;padding:1px 4px;border-radius:3px;margin-left:3px;vertical-align:middle}" +
      ".yc-empty{color:hsla(" + H + ",25%,78%,.32);font-size:12px}" +

      // === 神煞表（第二张表） ===
      ".yc-ss-table{margin-top:6px}" +
      ".yc-ss-td{padding:7px 4px}" +
      ".yc-ss-tag{display:inline-block;margin:1px 2px;padding:2px 7px;font-size:10.5px;font-style:normal;border-radius:9px;background:hsla(" + H + ",50%,42%,.18);color:hsla(" + H + ",55%,84%,.92);border:1px solid hsla(" + H + ",55%,68%,.2);letter-spacing:.02em}" +

      // === 日主信息行 ===
      ".yc-meta{margin:14px 0;font-size:13.5px;color:hsla(" + H + ",20%,86%,.9);text-align:center;padding:9px 12px;background:hsla(" + H + ",55%,55%,.08);border-radius:11px;border:1px solid hsla(" + H + ",55%,70%,.18)}" +
      ".yc-meta span{margin:0 8px}" +
      ".yc-meta b{font-weight:600;font-family:'Noto Serif SC',serif}" +
      ".yc-xi{color:#bfe08a}.yc-ji-c{color:#ff9c9c}.yc-score{color:hsla(" + H + ",30%,82%,.7);font-size:12px}" +

      // === 双列卡片 ===
      ".yc-cols2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;margin-top:4px}" +
      ".yc-card{padding:13px 15px;border-radius:13px;background:hsla(" + H + ",45%,14%,.4);border:1px solid hsla(" + H + ",50%,68%,.14)}" +
      ".yc-ct{font-size:12px;color:hsla(" + H + ",55%,82%,.8);margin-bottom:9px;font-weight:500;letter-spacing:.04em}" +

      // === 五行条 ===
      ".yc-wx{display:flex;align-items:center;gap:8px;margin:6px 0}" +
      ".yc-wxk{width:18px;font-family:'Noto Serif SC',serif;font-size:14px;text-align:center}" +
      ".yc-wxbar{flex:1;height:8px;border-radius:4px;background:hsla(" + H + ",30%,30%,.4);overflow:hidden}" +
      ".yc-wxbar i{display:block;height:100%;border-radius:4px;transition:width .9s cubic-bezier(.2,.7,.2,1)}" +
      ".yc-wxv{width:32px;text-align:right;font-size:12px;color:hsla(" + H + ",20%,84%,.85);font-variant-numeric:tabular-nums}" +
      ".yc-wxpct{width:38px;text-align:right;font-size:10.5px;color:hsla(" + H + ",25%,78%,.55);font-variant-numeric:tabular-nums}" +

      // === 指标 ===
      ".yc-g{display:flex;align-items:center;gap:8px;margin:7px 0}" +
      ".yc-gk{width:54px;font-size:12px;color:hsla(" + H + ",22%,84%,.85)}" +
      ".yc-gbar{flex:1;height:8px;border-radius:4px;background:hsla(" + H + ",30%,30%,.4);overflow:hidden}" +
      ".yc-gbar i{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,hsla(" + H + ",75%,62%,.9),hsla(" + (320) + ",75%,66%,.9));transition:width .9s cubic-bezier(.2,.7,.2,1)}" +
      ".yc-gv{width:32px;text-align:right;font-size:12px;color:#efeaff;font-variant-numeric:tabular-nums}" +

      // === 大运 ===
      ".yc-yuns{display:flex;gap:6px;flex-wrap:wrap}" +
      ".yc-yun{flex:1;min-width:60px;text-align:center;padding:9px 4px;border-radius:10px;background:hsla(" + H + ",45%,18%,.45);border:1px solid hsla(" + H + ",50%,68%,.14);position:relative}" +
      ".yc-yun b{display:block;font-family:'Noto Serif SC',serif;font-size:16px;color:#efeaff;letter-spacing:.06em}" +
      ".yc-yun span{font-size:11px;color:hsla(" + H + ",25%,80%,.6);margin-top:1px;display:block}" +
      ".yc-yun.yc-yun-cur{background:hsla(48,80%,55%,.18);border-color:hsla(48,80%,65%,.55);box-shadow:0 0 12px hsla(48,80%,55%,.25)}" +
      ".yc-yun.yc-yun-cur b{color:#ffe68a}" +
      ".yc-yun.yc-yun-cur::after{content:'当';position:absolute;top:2px;right:4px;font-size:9px;color:#ffe68a;background:hsla(48,80%,55%,.2);padding:1px 4px;border-radius:3px}" +

      // === 格局 ===
      ".yc-gj{padding:8px 12px;border-radius:8px;background:hsla(" + H + ",40%,18%,.4);border:1px solid hsla(" + H + ",50%,68%,.14);margin:4px 0}" +
      ".yc-gj b{display:inline-block;font-family:'Noto Serif SC',serif;color:#fff;font-size:14px;margin-right:8px}" +
      ".yc-gj span{color:hsla(" + H + ",25%,82%,.78);font-size:12.5px}" +

      // === 流年 ===
      ".yc-ln{margin-top:11px;padding:11px 14px;border-radius:12px;text-align:center;font-size:13.5px;color:hsla(" + H + ",20%,88%,.92);background:hsla(" + H + ",55%,55%,.1);border:1px solid hsla(" + H + ",55%,70%,.2)}" +
      ".yc-ln b{font-family:'Noto Serif SC',serif}" +

      // === 紫微要点（保留兼容） ===
      ".yc-zw{border-color:hsla(" + H + ",60%,70%,.3)}" +
      ".yc-zwhead{font-size:12.5px;color:hsla(" + H + ",24%,86%,.92);margin-bottom:8px}" +
      ".yc-zwrows{display:grid;grid-template-columns:1fr 1fr;gap:4px 14px}" +
      ".yc-zwrow{font-size:12.5px;color:#efeaff}.yc-zwrow b{display:inline-block;min-width:34px;color:hsla(" + H + ",60%,84%,.92);font-weight:500}" +
      ".yc-zwluck{margin-top:9px;padding-top:8px;border-top:1px solid hsla(" + H + ",50%,70%,.14);font-size:12.5px;color:hsla(" + H + ",22%,86%,.92)}" +

      // === 响应式 ===
      "@media(max-width:600px){.yc-cols2{grid-template-columns:1fr}.yc-stem-big,.yc-branch-big{font-size:25px}.yc-pillars .yc-rl{width:64px;font-size:11.5px;padding-right:8px}.yc-pillars td{padding:7px 3px;font-size:12px}.yc-hid-line b{font-size:12px}.yc-hid-god{font-size:9.5px}}";
    var st = document.createElement("style");
    st.id = "yc-css"; st.textContent = css;
    document.head.appendChild(st);
  }

  // 双盘合参：八字真盘下方附「紫微要点」卡
  function ziweiBrief(z) {
    if (!z || !z.palaces || !z.palaces.length) return "";
    var find = function (nm) { for (var i = 0; i < z.palaces.length; i++) { if ((z.palaces[i].name || "").replace("宫", "") === nm) return z.palaces[i]; } return null; };
    var stars = function (p) { return (p && p.majorStars && p.majorStars.length) ? p.majorStars.join("、") : "无主星"; };
    var rows = [], map = [["命", "命宫"], ["官禄", "官禄"], ["财帛", "财帛"], ["夫妻", "夫妻"]];
    for (var i = 0; i < map.length; i++) {
      var p = find(map[i][0]) || (map[i][0] === "官禄" ? find("事业") : null);
      if (p) rows.push('<div class="yc-zwrow"><b>' + map[i][1] + '</b>' + esc(stars(p)) + '</div>');
    }
    var hl = "";
    if (z.horoscope && z.horoscope.yearly) {
      var y = z.horoscope.yearly, HUA = ["禄", "权", "科", "忌"];
      var mut = (y.mutagen || []).map(function (s, i) { return s + "化" + (HUA[i] || ""); }).join(" · ");
      hl = '<div class="yc-zwluck">' + esc(z.horoscope.year) + ' 流年命宫入本命「' + esc(y.palace || "") + '」宫' + (mut ? ' · 四化 ' + esc(mut) : "") + '</div>';
    }
    return '<div class="yc-card yc-zw"><div class="yc-ct">紫微要点 · 与八字合参</div>' +
      '<div class="yc-zwhead">' + esc(z.fiveElementsClass || "") + ' · 命主 ' + esc(z.soul || "—") + ' · 身主 ' + esc(z.body || "—") + '</div>' +
      '<div class="yc-zwrows">' + rows.join("") + '</div>' + hl + '</div>';
  }

  injectCSS();
  window.ypxRenderChart = render;
  window.ypxRenderZiweiBrief = ziweiBrief;
})();
