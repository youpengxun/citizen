/* ============================================================
   有朋迅 · 赛博神算子 统一排盘引擎
   单输入（出生年月日时+基础信息）→ 驱动双命盘：
   八字 / 紫微斗数
   每体系独立视觉语言（配色见 fortune-unified.css）
   纯前端、离线可用；命理为传统推演参考，非定数。
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 基础常量 ---------- */
  var TG = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  var DZ = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  var ZODIAC = ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"];
  var WX = { 甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",庚:"金",辛:"金",壬:"水",癸:"水" };
  var NAYIN30 = ["金","火","木","土","金","火","水","土","金","木","水","土","木","水","火","木","水","火","土","金","木","火","水","土","金","木","水","土","木","水"];
  /* ---------- 工具 ---------- */
  function $(s, r){ return (r||document).querySelector(s); }
  function pad(n){ return n<10 ? "0"+n : ""+n; }
  function hashStr(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
  function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  function ganZhiIdx(stem, branch){ // 60 甲子序号 0-59
    for(var i=0;i<60;i++){ if(i%10===stem && i%12===branch) return i; } return 0;
  }
  function nayin(stem, branch){ return NAYIN30[Math.floor(ganZhiIdx(stem,branch)/2)]; }
  function lunarToSolar(y,m,d,isLeap){
    var T=window.__LUNAR_TABLE; if(!T) return null;
    var yr=T[String(y)]; if(!yr) return null;
    var mo = isLeap ? (yr.leap && yr.leap.a===m ? yr.leap : null) : yr.months[m-1];
    if(!mo) return null;
    var p=String(mo.f).split("-"); var by=+p[0], bm=+p[1], bd=+p[2];
    return new Date(by, bm-1, bd + (d-1));
  }
  function shiChen(hh){ return Math.floor(((hh+1)%24)/2)+1; } // 1-12 时辰序

  // 主要城市经度（东经为正），用于真太阳时校正时辰
  var CITY_LON = {
    "北京":116.40, "上海":121.47, "广州":113.26, "深圳":114.06, "天津":117.20,
    "重庆":106.55, "成都":104.07, "杭州":120.15, "南京":118.80, "武汉":114.30,
    "西安":108.95, "苏州":120.62, "郑州":113.65, "长沙":112.94, "沈阳":123.43,
    "大连":121.62, "青岛":120.38, "济南":117.00, "哈尔滨":126.63, "长春":125.35,
    "石家庄":114.51, "太原":112.55, "合肥":117.28, "福州":119.30, "厦门":118.10,
    "南昌":115.86, "昆明":102.71, "贵阳":106.63, "南宁":108.37, "海口":110.33,
    "兰州":103.83, "西宁":101.78, "银川":106.27, "乌鲁木齐":87.62, "拉萨":91.14,
    "呼和浩特":111.75, "香港":114.17, "澳门":113.55, "台北":121.50, "高雄":120.30,
    "三亚":109.50, "桂林":110.29, "温州":120.70, "宁波":121.55, "无锡":120.30,
    "佛山":113.12, "东莞":113.75, "泉州":118.68, "常州":119.95, "徐州":117.18,
    "唐山":118.18, "烟台":121.39, "潍坊":119.10, "洛阳":112.45, "包头":109.84,
    "喀什":75.99, "延吉":129.50, "大庆":125.00, "昆明":102.71
  };

  /* ---------- 各体系计算 ---------- */
  // 八字：调用本地引擎
  async function calcBazi(date, hour, gender, opts){
    if(window.KnowledgeBazi && window.KnowledgeBazi.loadDataTables) await window.KnowledgeBazi.loadDataTables();
    if(!(window.KnowledgeBazi && window.KnowledgeBazi.fullAnalysis)) return null;
    // 引擎内部 calcBazi 期望 "YYYY-M-D" 字符串（会执行 birthDate.split("-")）；
    // 表单传入的是 Date 对象，这里统一转换为字符串，避免 "split is not a function" 崩溃。
    var ds;
    if (date instanceof Date) {
      ds = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    } else {
      ds = date; // 已是字符串（如农历路径直接传参）
    }
    var a = await window.KnowledgeBazi.fullAnalysis(ds, hour, gender, opts);
    return a;
  }
  // 紫微：调用 ypxCastZiwei
  async function calcZiwei(opts){
    if(!(window.ypxCastZiwei)) return null;
    try { return await window.ypxCastZiwei(opts); } catch(e){ return null; }
  }
  /* ---------- 渲染 ---------- */
  function mdToHtml(md){
    var esc=function(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");};
    var lines=String(md).replace(/\r/g,"").split("\n"), out=[], inList=false;
    var inline=function(s){return esc(s).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/`([^`]+)`/g,"<code>$1</code>");};
    for(var i=0;i<lines.length;i++){
      var ln=lines[i];
      if(/^\s*$/.test(ln)){ if(inList){out.push("</ul>");inList=false;} continue; }
      if(/^---+$/.test(ln.trim())){ out.push("<hr/>"); continue; }
      var h=ln.match(/^(#{1,6})\s+(.*)$/);
      if(h){ if(inList){out.push("</ul>");inList=false;} out.push("<h"+(h[1].length>4?4:h[1].length)+">"+inline(h[2])+"</h"+(h[1].length>4?4:h[1].length)+">"); continue; }
      if(/^>\s?/.test(ln)){ out.push("<blockquote>"+inline(ln.replace(/^>\s?/,""))+"</blockquote>"); continue; }
      var li=ln.match(/^\s*[-*]\s+(.*)$/);
      if(li){ if(!inList){out.push("<ul>");inList=true;} out.push("<li>"+inline(li[1])+"</li>"); continue; }
      out.push("<p>"+inline(ln)+"</p>");
    }
    if(inList) out.push("</ul>");
    return out.join("");
  }
  function sysWrap(cls, badge, title, en, body){
    return '<section class="uf-sys '+cls+'"><div class="uf-sys-head"><span class="badge">'+badge+
      '</span><h3>'+title+'</h3><span class="en">'+en+'</span></div><div class="uf-sys-body">'+body+'</div></section>';
  }

  function renderBazi(a){
    var p=a.pillars;
    var pillars=[["年柱",p.year],["月柱",p.month],["日柱",p.day],["时柱",p.hour]];
    var ph='<div class="bz-pillars">';
    pillars.forEach(function(it){
      var s=it[1]; var si=TG.indexOf(s.stem), bi=DZ.indexOf(s.branch);
      ph+='<div class="bz-p"><div class="lab">'+it[0]+'</div><div class="gz">'+s.stem+s.branch+'</div>'+
        '<div class="el">'+WX[s.stem]+' · '+nayin(si,bi)+'</div></div>';
    });
    ph+='</div>';
    var chart='';
    try { chart='<div style="overflow-x:auto;margin-bottom:16px">'+window.ypxRenderChart(window.KnowledgeBazi.toChartFormat(a))+'</div>'; } catch(e){}
    var report='';
    try { report='<div class="uf-prose">'+mdToHtml(window.KnowledgeBazi.generateReport(a))+'</div>'; } catch(e){}
    var guide='<details class="bz-reading-guide"><summary>读懂命盘：十神、藏干、纳音与行运</summary><dl>'+
      '<dt>四柱与日主</dt><dd>年、月、日、时各由一个天干和一个地支组成。日柱的天干称为日主，是十神关系的参照点。</dd>'+
      '<dt>十神</dt><dd>以日主为参照，按五行生克与阴阳关系分类。同一干支相对于不同日主，十神名称可能不同。</dd>'+
      '<dt>藏干</dt><dd>传统体系把地支关联到一个或多个天干。藏干与表面八个字的计数不同，不能把数量直接当作旺衰结论。</dd>'+
      '<dt>纳音</dt><dd>六十甲子的传统分类名称，与天干本身的五行不是同一套分类。可用于文化阅读，不单独用于判断吉凶。</dd>'+
      '<dt>大运与流年</dt><dd>大运表示传统排盘中的阶段序列，流年表示所查看年份的干支。起运时间依赖出生时间、顺逆规则和交节时刻，需要单独核验。</dd></dl></details>';
    var basis='<div class="bz-reading-basis"><b>本次排盘依据</b><p>沿用本站原有干支与节气数据表；年柱以立春、月柱以节分界。日柱沿用午夜换日，晚子时时干按次日日干推算。</p><p>交节时间已作局部测试。真太阳时采用NOAA近似均时差，日时柱随太阳日期跨日；不含历史夏令时转换。起运与解读仍待核验，尚未完成问真全面对照。</p></div>';
    var expanded=report?'<details class="bz-reading-report"><summary>展开传统规则解读</summary><p class="bz-reading-note">以下为本站规则引擎生成的解释，不是问真提供的分析，也不是已验证的个人结论。</p>'+report+'</details>':'<p class="bz-reading-note">本次解读未生成，请先核对命盘。</p>';
    if(a.daYun && a.daYun.start_date) basis += '<div class="bz-reading-basis"><b>起运依据</b><p>'+a.daYun.start_label+'起运 · '+(a.daYun.forward?'顺排':'逆排')+' · 交运 '+a.daYun.start_date+'</p><p>'+a.daYun.rule+'</p></div>';
    var rows=[], labels=["年柱","月柱","日柱","时柱"], keys=["year","month","day","hour"];
    [["六合","BRANCH_LIUHE"],["六冲","BRANCH_CHONG"],["六害","BRANCH_HAI"]].forEach(function(rule){
      var map=window.KnowledgeBazi[rule[1]] || {};
      for(var i=0;i<4;i++) for(var j=i+1;j<4;j++){
        var left=p[keys[i]],right=p[keys[j]];
        if(left && right && map[left.branch]===right.branch){
          rows.push('<li><span>'+labels[i]+' '+left.branch+'</span><b>'+rule[0]+'</b><span>'+labels[j]+' '+right.branch+'</span></li>');
        }
      }
    });
    var relations='<section class="bz-relations" id="bz-relations"><h3>地支关系 · 基础核对</h3><p>仅列原站规则表中的六合、六冲、六害；不涵盖刑、三合、半合、天干关系或合化条件，不据此直接判断吉凶。</p>'+
      (rows.length?'<ul>'+rows.join('')+'</ul>':'<p>这三类关系未匹配到，不代表四柱之间没有其他关系。</p>')+'</section>';
    var layout='<nav class="bz-result-nav" aria-label="本次排盘结果"><a href="#bz-main-chart">基本排盘</a><a href="#bz-reference">知识参考</a><a href="#bz-relations">地支关系</a><a href="#ask">返回修改</a></nav>'+
      '<div class="bz-result-layout"><div id="bz-main-chart" class="bz-result-main">'+(chart || ph)+'</div><aside id="bz-reference" class="bz-result-reference"><h3>知识参考</h3><p>结合命盘阅读本站术语解释。古籍原文的版本、出处与逐条匹配仍待整理。</p>'+guide+'<a class="btn btn-ghost" href="#learning">进入学习课堂 →</a>'+basis+'</aside></div>'+
      relations+expanded;
    return sysWrap("sys-bazi","八字 · Bazi","八字命盘","Four Pillars", layout);
  }
  function renderZiwei(sum){
    return sysWrap("sys-ziwei","紫微 · Ziwei","紫微斗数 · 十二宫全盘","Ziwei Natal Chart",'<div id="zwf-result"></div>');
  }
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function renderInfo(meta){
    var rows = [
      ["历法", meta.cal],
      ["公历", meta.solar],
      ["农历", meta.lunar || "—"],
      ["出生时间", meta.time + "（" + meta.shichen + "时）"],
      ["真太阳时", meta.trueSolar || "—"],
      ["生肖", meta.zodiac],
      ["性别", meta.gender]
    ];
    var cells = rows.map(function(r){
      return '<div class="info-cell"><div class="k">'+r[0]+'</div><div class="v">'+esc(r[1])+'</div></div>';
    }).join("");
    return '<div class="uf-info">'+cells+'</div>';
  }

  /* ---------- 主表单 + 初始化 ---------- */
  var MASTER_FORM =
    '<p style="color:var(--ink-2);font-size:14px;line-height:1.7">仅需填写一次出生信息，即可生成八字与紫微斗数命盘。十二宫、三方四正、四化及运限分别呈现，排盘在本地完成。</p>'+
    '<form class="uf-form" id="uf-form">'+
      '<div class="uf-row"><label>历法</label><select id="uf-cal"><option value="solar" selected>公历</option><option value="lunar">农历</option></select></div>'+
      '<div class="uf-row" id="uf-solar-wrap"><label>出生日期（公历）</label><input type="date" id="uf-date" value="1995-07-15" min="1940-01-01" max="2030-12-31" /></div>'+
      '<div class="uf-row" id="uf-lunar-wrap" hidden><label>出生日期（农历）</label>'+
        '<span style="display:flex;gap:6px"><select id="uf-ly" aria-label="农历年"></select><select id="uf-lm" aria-label="农历月"></select><select id="uf-ld" aria-label="农历日"></select></span>'+
        '<label style="margin-top:6px"><input type="checkbox" id="uf-leap" /> 闰月</label></div>'+
      '<div class="uf-row"><label>出生时间（精确到分）</label><input type="time" id="uf-time" value="09:30" step="60" /></div>'+
      '<div class="uf-row"><label>出生地（仅用于八字真太阳时校正）</label><select id="uf-place"></select></div>'+
      '<div class="uf-row" id="uf-lon-wrap" hidden><label>自定义经度（东经为正，如 116.4）</label><input type="number" id="uf-lon" step="0.01" placeholder="116.4" /></div>'+
      '<div class="uf-row"><label>性别</label><select id="uf-gender"><option value="女">女</option><option value="男">男</option></select></div>'+
      '<div class="uf-row"><label>姓名 / 昵称（可选）</label><input type="text" id="uf-name" placeholder="如：小林" /></div>'+
      '<div class="uf-row uf-full"><label>想问的事 / 当下关注（可选，仅供自己对照）</label>'+
        '<input type="text" id="uf-q" placeholder="如：要不要换城市工作？" /></div>'+
      '<button class="uf-submit" type="submit" id="uf-go">生成八字与紫微命盘 <span class="arr">→</span></button>'+
      '<div class="uf-hint">提示：时辰按时间自动换算（支持早晚子时）；农历仅支持 1990–2030。排盘结果为传统推演参考，不构成任何专业建议。</div>'+
    '</form>';

  function buildLunarSelects(){
    var ly=$("#uf-ly"), lm=$("#uf-lm"), ld=$("#uf-ld"); if(!ly) return;
    for(var y=2030;y>=1990;y--) ly.innerHTML+='<option value="'+y+'">'+y+'</option>';
    for(var m=1;m<=12;m++) lm.innerHTML+='<option value="'+m+'">'+m+'月</option>';
    for(var d=1;d<=30;d++) ld.innerHTML+='<option value="'+d+'">'+d+'日</option>';
  }

  function init(){
    var panel=$("#ask .ask-panel")||$("#ask");
    if(!panel) return;
    panel.innerHTML=MASTER_FORM;
    buildLunarSelects();
    // 出生地下拉（含自定义经度）
    var placeSel=$("#uf-place");
    if(placeSel){
      var optsHtml='<option value="">不校正（按北京时间）</option>';
      Object.keys(CITY_LON).forEach(function(c){ optsHtml+='<option value="'+CITY_LON[c]+'">'+c+'（'+CITY_LON[c]+'°E）</option>'; });
      optsHtml+='<option value="__custom__">自定义经度…</option>';
      placeSel.innerHTML=optsHtml;
      placeSel.addEventListener("change", function(){
        var lw=$("#uf-lon-wrap");
        if(lw) lw.hidden = (placeSel.value!=="__custom__");
      });
    }
    // 农历/公历切换
    var cal=$("#uf-cal");
    cal&&cal.addEventListener("change", function(){
      var lunar = cal.value==="lunar";
      var sw=$("#uf-solar-wrap"), lw=$("#uf-lunar-wrap");
      if(sw) sw.hidden= lunar; if(lw) lw.hidden= !lunar;
    });
    // 报告容器
    var report=document.createElement("div");
    report.className="uf-report"; report.id="unified-report";
    panel.parentNode.insertBefore(report, panel.nextSibling);

    var form=$("#uf-form");
    form.addEventListener("submit", async function(e){
      e.preventDefault();
      if(!$("#uf-time").value){ report.innerHTML='<div class="uf-err">请填写出生时间；当前不以默认时辰代替未知时间。</div>'; return; }
      report.innerHTML='<div class="uf-empty">正在生成八字与紫微斗数命盘…</div>';
      try {
        var calV=cal.value, gender=$("#uf-gender").value, q=($("#uf-q").value||"").trim(), name=($("#uf-name").value||"").trim();
        var date, hh, mm, shi, lunar=false, leap=false;
        if(calV==="lunar"){
          var ly=+$("#uf-ly").value, lm=+$("#uf-lm").value, ld=+$("#uf-ld").value; leap=$("#uf-leap").checked;
          date=lunarToSolar(ly,lm,ld,leap);
          if(!date){ report.innerHTML='<div class="uf-err">农历表仅支持 1990–2030，且所选闰月当年不存在，请改用公历或调整日期。</div>'; return; }
          var t=$("#uf-time").value.split(":"); hh=+t[0]; mm=+(t[1]||0);
        } else {
          var ds=$("#uf-date").value; if(!ds){ report.innerHTML='<div class="uf-err">请填写出生日期。</div>'; return; }
          var p=ds.split("-"); var t2=$("#uf-time").value.split(":"); hh=+t2[0]; mm=+(t2[1]||0);
          date=new Date(+p[0], +p[1]-1, +p[2], hh, mm);
        }
        // 出生地 → 真太阳时经度
        var placeSel=$("#uf-place"), lon=null;
        if(placeSel){
          var pv=placeSel.value;
          if(pv==="__custom__"){ lon=parseFloat($("#uf-lon").value); }
          else if(pv){ lon=parseFloat(pv); }
        }
        var opts = { minute: mm };
        if (lon != null) { if(!Number.isFinite(lon)) throw new Error("请填写有效经度。"); opts.longitude = lon; }
        shi=shiChen(hh);


        // 八字 + 紫微（并行）
        var a=null, z=null;
        [a,z]=await Promise.all([ calcBazi(date,hh,gender,opts),
                                  calcZiwei({birth:(calV==="lunar"?([+$("#uf-ly").value,+$("#uf-lm").value,+$("#uf-ld").value].join("-")):(date.getFullYear()+"-"+pad(date.getMonth()+1)+"-"+pad(date.getDate()))),
                                                hour:hh, minute:mm, gender:gender, calendar:calV, leap:leap, year:date.getFullYear()}).catch(function(){return null;}) ]);

        // 命主信息条：确认本地引擎已正确解析输入
        var zodiac = (a && a.pillars) ? (ZODIAC[DZ.indexOf(a.pillars.year.branch)] || "—") : "—";
        var shichenName = DZ[shi - 1] || "—";
        var lunarStr = (calV === "lunar")
          ? ("农历 " + $("#uf-ly").value + "年" + $("#uf-lm").value + "月" + ($("#uf-leap").checked ? "闰" : "") + $("#uf-ld").value + "日")
          : "（以公历为准）";
        // 真太阳时校正说明
        var tsNote = "未校正（按北京时间，非120°E出生地时辰可能有偏差）";
        if (a && a.pillars && a.pillars.birthInfo && a.pillars.birthInfo.trueSolarApplied) {
          var bi = a.pillars.birthInfo;
          var sign = bi.lonMin >= 0 ? "+" : "−";
          tsNote = "已按经度 " + (lon!=null?lon.toFixed(2):"?") + "°E 校正 · 真太阳时约 " + bi.trueSolarHour.toFixed(1) + " 时 · 日期 " + bi.trueSolarDate + "（经度偏移" + sign + Math.abs(Math.round(bi.lonMin)) + "分，均时差" + bi.eotMin.toFixed(1) + "分；近似计算）";
        }
        var infoMeta = {
          cal: calV === "lunar" ? "农历" : "公历",
          solar: date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()),
          lunar: lunarStr,
          time: pad(hh) + ":" + pad(mm),
          shichen: shichenName,
          zodiac: zodiac,
          trueSolar: tsNote,
          gender: gender
        };
        // 每个体系独立容错：任一体系出错只影响自身，绝不整页报错
        function safeSys(fn, label){
          try { return fn() || ""; }
          catch(e){ console.error("[赛博神算子][" + label + " 渲染异常]", e); return '<div class="uf-err" style="margin:12px 0">「' + label + '」生成异常：' + (e && e.message || e) + '</div>'; }
        }
        var html = renderInfo(infoMeta);
        if(a){
          html += safeSys(function(){ return renderBazi(a); }, "八字");
        } else {
          html += '<div class="uf-err">八字引擎未就绪，请稍后重试或检查数据表加载。</div>';
        }
        html += safeSys(function(){ return renderZiwei(z); }, "紫微");
        html+='<div style="margin-top:8px;padding:14px 16px;border:1px dashed rgba(212,175,110,.4);border-radius:12px;font-size:12.5px;color:var(--ink-3);line-height:1.7">'+
          '⚠️ 以上为玄学体系的传统解读与象征推演，仅供参考。本结果由本地规则生成，不构成医疗、法律、财务或投资建议；命理是参考，不是定数。涉及健康、法律、重大财务决策请咨询相应专业人士。</div>';

        report.innerHTML=html;
        window.YPXZiwei?.mount(document.getElementById('zwf-result'),z);
        window.dispatchEvent(new CustomEvent('ypx:chart-ready',{detail:{name:$("#uf-name").value,analysis:a,input:{date:date.getFullYear()+"-"+pad(date.getMonth()+1)+"-"+pad(date.getDate()),time:pad(hh)+":"+pad(mm),gender:gender,calendar:calV,options:opts,engine:"original+NOAA+lunar-javascript1.7.5-yun2"}}}));
        report.scrollIntoView({behavior:"smooth", block:"start"});
      } catch(err){
        console.error(err);
        report.innerHTML='<div class="uf-err">排盘出错：'+(err&&err.message||err)+'</div>';
      }
    });
  }

  if(document.readyState==="complete"||document.readyState==="interactive"){ setTimeout(init,0); }
  else window.addEventListener("load", init);
})();
