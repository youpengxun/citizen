/* ============================================================
   紫微斗数 · 互动十二宫命盘
   ============================================================ */
(function () {
  "use strict";
  const chart = document.getElementById("zw-chart");
  const panel = document.getElementById("zw-panel");
  if (!chart || !panel) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const BR = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const BR_EN = ["ZI", "CHOU", "YIN", "MAO", "CHEN", "SI", "WU", "WEI", "SHEN", "YOU", "XU", "HAI"];
  // 4×4 传统排盘位置：branch -> [row, col]
  const POS = { 5: [1, 1], 6: [1, 2], 7: [1, 3], 8: [1, 4], 4: [2, 1], 9: [2, 4], 3: [3, 1], 10: [3, 4], 2: [4, 1], 1: [4, 2], 0: [4, 3], 11: [4, 4] };
  // 紫微在午 · 十四主星分布
  const STARS = { 0: ["贪狼"], 1: ["天同", "巨门"], 2: ["武曲", "天相"], 3: ["太阳", "天梁"], 4: ["七杀"], 5: ["天机"], 6: ["紫微"], 7: [], 8: ["破军"], 9: [], 10: ["廉贞", "天府"], 11: ["太阴"] };
  const STAR_DESC = {
    "紫微": "帝座 · 主格局与主导力，习惯把事情扛在自己身上",
    "天机": "智星 · 主思虑与应变，想得多，常常想在做之前",
    "太阳": "贵星 · 主表达与付出，光照别人，容易忘了自己",
    "武曲": "财星 · 主执行与务实，先看可不可行，再谈喜不喜欢",
    "天同": "福星 · 主情绪与安适，对舒服的环境格外敏感",
    "廉贞": "囚星 · 主原则与张力，标准很高，与自己较劲",
    "天府": "库星 · 主稳健与承载，习惯留余地、存后路",
    "太阴": "富星 · 主细腻与积蓄，情绪和钱都攒得很慢很深",
    "贪狼": "欲星 · 主欲望与人缘，想要的很多，这不是缺点",
    "巨门": "暗星 · 主言语与质疑，先怀疑，再相信",
    "天相": "印星 · 主辅佐与平衡，擅长把冲突调成秩序",
    "天梁": "荫星 · 主庇护与化解，出事时大家先找你",
    "七杀": "将星 · 主决断与突破，宁可错，不可拖",
    "破军": "耗星 · 主破立与变革，先拆掉，才能重建",
  };
  // 命宫可动：默认在午，逆布十二宫
  let PALACE_AT = {}; // branch -> palace
  let BRIGHT = {};    // branch -> { 星名: 庙旺平陷 }（iztro 真实排盘时填充）
  let MUTAGEN = {};   // branch -> { 星名: 禄|权|科|忌 }（生年四化）
  let MINOR = {};     // branch -> [辅煞星名]
  const P_NAMES = ["命宫", "兄弟宫", "夫妻宫", "子女宫", "财帛宫", "疾厄宫", "迁移宫", "交友宫", "官禄宫", "田宅宫", "福德宫", "父母宫"];
  const assignPalaces = (L) => {
    PALACE_AT = {};
    for (let k = 0; k < 12; k++) PALACE_AT[(L - k + 12) % 12] = P_NAMES[k];
  };
  assignPalaces(6);
  const PALACE_INFO = {
    "命宫": ["你的底色", "性格主轴与格局的起点——你怎么看自己、又如何本能地反应。具体星情与组合见下方「三方四正 · 综合解读」。"],
    "兄弟宫": ["同辈与伙伴", "合作关系里的张力与支撑：谁能与你并肩，谁只适合同路一段。"],
    "夫妻宫": ["亲密关系", "你在关系里的姿态与真正的需要——以及你不肯说出口的那一部分。"],
    "子女宫": ["创造与延续", "你愿意长期浇灌的东西：作品、孩子，或一个慢慢长大的计划。"],
    "财帛宫": ["金钱观", "你怎么挣钱、怎么花钱、怎么为钱焦虑——三件事常常不是同一种逻辑。"],
    "疾厄宫": ["身体与消耗", "压力最先落在身体的哪个环节。它通常比你更早知道你累了。"],
    "迁移宫": ["外部世界", "离开熟悉环境时你呈现的那一面——有时比命宫更接近真实的你。"],
    "交友宫": ["人际网络", "谁在托举你，谁在消耗你。这一宫常常解释你莫名的疲惫。"],
    "官禄宫": ["事业", "你和「做事」之间的关系：节奏、野心，以及对成就感的真实定义。"],
    "田宅宫": ["根基", "家、资产与安全感的来源——你愿意回去的地方，才是根。"],
    "福德宫": ["内在状态", "独处时的你。焦虑与满足都从这里出发，也都该回到这里被安放。"],
    "父母宫": ["来处", "原生家庭给你的印记与课题：有些要继承，有些要正式告别。"],
  };

  /* ---- 生成宫位格 ---- */
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "zw-lines");
  const cells = {};
  for (let b = 0; b < 12; b++) {
    const [r, c] = POS[b];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "zw-cell" + (STARS[b].length ? "" : " empty");
    btn.style.gridArea = `${r} / ${c}`;
    btn.setAttribute("aria-label", `${PALACE_AT[b]} · ${BR[b]}`);
    btn.innerHTML =
      `<span class="zw-stars">${STARS[b].map((s) => `<i>${s}</i>`).join("")}</span>` +
      `<span class="zw-meta"><b>${PALACE_AT[b]}</b><small>${BR[b]} ${BR_EN[b]}</small></span>`;
    chart.appendChild(btn);
    cells[b] = btn;
  }
  /* ---- 中宫 ---- */
  const center = document.createElement("div");
  center.className = "zw-center";
  center.innerHTML =
    `<span class="ring"></span>` +
    `<svg class="zw-dipper" viewBox="0 0 200 110" aria-hidden="true">
      <line x1="18" y1="86" x2="48" y2="64"></line><line x1="48" y1="64" x2="80" y2="58"></line>
      <line x1="80" y1="58" x2="108" y2="44"></line><line x1="108" y1="44" x2="138" y2="46"></line>
      <line x1="138" y1="46" x2="168" y2="30"></line><line x1="168" y1="30" x2="186" y2="56"></line>
      <line x1="186" y1="56" x2="138" y2="46"></line>
      <circle cx="18" cy="86" r="3"></circle><circle cx="48" cy="64" r="2.6"></circle>
      <circle cx="80" cy="58" r="2.6"></circle><circle cx="108" cy="44" r="2.4"></circle>
      <circle cx="138" cy="46" r="2.8"></circle><circle cx="168" cy="30" r="2.6"></circle>
      <circle cx="186" cy="56" r="3.2"></circle>
    </svg>` +
    `<div class="t"><b>紫微垣</b><span id="zw-center-sub">示例盘 · 紫微在午</span></div>` +
    `<span class="hint">点击任意宫位，查看三方四正联动</span>`;
  chart.appendChild(center);
  chart.appendChild(svg);

  /* ---- 三方四正连线 ---- */
  const centerOf = (b) => {
    const r = cells[b].getBoundingClientRect();
    const cr = chart.getBoundingClientRect();
    return [r.left - cr.left + r.width / 2, r.top - cr.top + r.height / 2];
  };
  const drawLines = (b) => {
    svg.innerHTML = "";
    const cr = chart.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${cr.width} ${cr.height}`);
    const [x0, y0] = centerOf(b);
    for (const t of [(b + 4) % 12, (b + 8) % 12, (b + 6) % 12]) {
      const [x1, y1] = centerOf(t);
      const ln = document.createElementNS(NS, "line");
      ln.setAttribute("x1", x0); ln.setAttribute("y1", y0);
      ln.setAttribute("x2", x1); ln.setAttribute("y2", y1);
      svg.appendChild(ln);
      const dot = document.createElementNS(NS, "circle");
      dot.setAttribute("cx", x1); dot.setAttribute("cy", y1); dot.setAttribute("r", 3);
      svg.appendChild(dot);
    }
    const dot0 = document.createElementNS(NS, "circle");
    dot0.setAttribute("cx", x0); dot0.setAttribute("cy", y0); dot0.setAttribute("r", 3.6);
    svg.appendChild(dot0);
  };

  /* ---- 三方四正综合解读：本宫 + 对宫(照) + 三合(会) 的星曜组合 ---- */
  (function injectSzCss() {
    if (document.getElementById("zw-sz-css")) return;
    const st = document.createElement("style"); st.id = "zw-sz-css";
    st.textContent =
      ".zw-p-sz{margin:12px 0;padding:11px 13px;border-radius:12px;background:hsla(var(--hue,262),50%,55%,.1);border:1px solid hsla(var(--hue,262),55%,70%,.22)}" +
      ".zw-p-sz .lab{font-size:11px;letter-spacing:.08em;color:hsla(var(--hue,262),62%,83%,.9)}" +
      ".zw-p-sz .sz-line{font-size:13px;line-height:1.7;color:hsla(var(--hue,262),18%,88%,.94);margin:6px 0 5px}" +
      ".zw-p-sz .sz-line b{color:#fff;font-weight:600}" +
      ".zw-p-sz .sz-geju{font-size:12.5px;line-height:1.66;color:hsla(var(--hue,262),58%,87%,.96);margin:0}" +
      ".zw-p-sz .sz-hua,.zw-p-sz .sz-fu{font-size:12px;line-height:1.7;margin:8px 0 0;color:hsla(var(--hue,262),16%,85%,.9)}" +
      ".zw-p-sz .sz-hua em,.zw-p-sz .sz-fu em{font-style:normal;margin-right:6px;padding:1px 7px;border-radius:6px;font-size:11px;background:hsla(var(--hue,262),65%,62%,.22);color:hsla(var(--hue,262),85%,89%,.95)}" +
      ".zw-p-sz .sz-hua b{color:#ffd6a3;font-weight:600}.zw-p-sz .sz-fu b{color:#cfe0ff;font-weight:600}";
    document.head.appendChild(st);
  })();
  const STAR_TONE = {
    "紫微": "主导", "天机": "机变", "太阳": "外显", "武曲": "务实", "天同": "温和", "廉贞": "原则",
    "天府": "稳重", "太阴": "内敛", "贪狼": "欲望", "巨门": "思辨", "天相": "协调", "天梁": "庇荫",
    "七杀": "决断", "破军": "开创",
  };
  const HUA_DESC = { "禄": "财禄顺遂、资源人缘", "权": "权力掌控、能力变动", "科": "名声贵人、文书平稳", "忌": "阻滞执着、是非要留意" };
  const MINOR_DESC = {
    "文昌": "文采才学", "文曲": "才艺口才", "左辅": "平辈助力", "右弼": "平辈助力",
    "天魁": "贵人提携", "天钺": "贵人提携", "禄存": "财禄积累", "天马": "变动·机会",
    "擎羊": "刚锐刑伤·阻力", "陀罗": "拖磨纠缠·阻力", "火星": "急躁突发", "铃星": "暗劲压力",
    "地空": "空想破耗", "地劫": "破耗劫财",
  };
  const HUA_ORDER = { "禄": 0, "权": 1, "科": 2, "忌": 3 };
  const gejuOf = (all) => {
    const h = (arr) => arr.some((s) => all.includes(s));
    const out = [];
    if (h(["七杀", "破军", "贪狼"])) out.push("<b>杀破狼格</b>：开创变动、在起伏中求突破，不安于守成");
    else if (h(["天机", "太阴", "天同", "天梁"])) out.push("<b>机月同梁格</b>：温和稳健，宜循序渐进、以柔克刚");
    if (h(["紫微", "天府"])) out.push("<b>紫府同会</b>：主导稳重、承载力强，但易把责任全揽在身上");
    if (h(["太阳", "太阴"])) out.push("<b>日月并明</b>：表达与内敛交替，需找显与藏的平衡");
    if (h(["武曲", "贪狼"]) && all.includes("武曲") && all.includes("贪狼")) out.push("<b>武贪</b>：行动力与欲望并驾，先稳基本盘再图扩张");
    return out;
  };
  const siZheng = (b) => {
    const branches = [b, (b + 6) % 12, (b + 4) % 12, (b + 8) % 12];   // 本宫·对宫·两三合
    const self = STARS[b] || [], opp = STARS[(b + 6) % 12] || [];
    const tri = [].concat(STARS[(b + 4) % 12] || [], STARS[(b + 8) % 12] || []);
    const all = [].concat(self, opp, tri);
    const parts = [self.length ? `本宫坐 <b>${self.join("、")}</b>`
      : `本宫无主星，借对宫 <b>${opp.join("、") || "—"}</b> 之力（弹性大、随环境与会合定调）`];
    if (self.length && opp.length) parts.push(`对宫 <b>${opp.join("、")}</b> 来照`);
    if (tri.length) parts.push(`三合会 <b>${tri.join("、")}</b>`);
    const gj = gejuOf(all);
    const tone = Array.from(new Set(all.map((s) => STAR_TONE[s]).filter(Boolean)));
    const geju = gj.length ? gj.join("；") + "。"
      : (tone.length ? `星情综合偏向 <b>${tone.join("、")}</b>，重在后天经营与会合引动。` : "四正主星偏少，宜参辅星与运限，后天经营空间大。");
    // 生年四化（落在四正之内）—— 紫微解读的关键
    const huas = [];
    branches.forEach((bb) => { const mt = MUTAGEN[bb] || {}; Object.keys(mt).forEach((star) => huas.push({ star, hua: mt[star] })); });
    huas.sort((x, y) => (HUA_ORDER[x.hua] - HUA_ORDER[y.hua]));
    const sihua = huas.length ? huas.map((h) => `<b>${h.star}化${h.hua}</b>（${HUA_DESC[h.hua]}）`).join("、") : "";
    // 辅煞星（四正之内，去重）
    const minorSet = [];
    branches.forEach((bb) => (MINOR[bb] || []).forEach((m) => { if (MINOR_DESC[m] && minorSet.indexOf(m) < 0) minorSet.push(m); }));
    const fu = minorSet.length ? minorSet.map((m) => `<b>${m}</b>（${MINOR_DESC[m]}）`).join("、") : "";
    return { line: parts.join("，") + "。", geju, sihua, fu };
  };

  /* ---- 选中 + 面板 ---- */
  let cur = -1;
  const select = (b, fromUser, force) => {
    if (b === cur && !force) return;
    cur = b;
    const trine = [(b + 4) % 12, (b + 8) % 12, (b + 6) % 12];
    for (let i = 0; i < 12; i++) {
      cells[i].classList.toggle("active", i === b);
      cells[i].classList.toggle("trine", trine.includes(i));
    }
    drawLines(b);
    const p = PALACE_AT[b];
    const info = PALACE_INFO[NORM[p] || p] || [p, ""];
    const key = info[0], desc = info[1];
    const starsHtml = STARS[b].length
      ? STARS[b].map((s) => `<div class="zs"><b>${s}${(BRIGHT[b] && BRIGHT[b][s]) ? ` · ${BRIGHT[b][s]}` : ""}</b><span>${STAR_DESC[s] || "主星 · 入此宫"}</span></div>`).join("")
      : `<span class="none">此宫无主星 · 借对宫之星观之，弹性也是一种格局。</span>`;
    const chips = trine.map((t) => `<button type="button" data-b="${t}">${PALACE_AT[t]} · ${BR[t]}</button>`).join("");
    const sz = siZheng(b);
    panel.innerHTML =
      `<div class="zw-p-fade">
        <div class="zw-p-head"><b>${p}</b><span class="br">${BR[b]} · ${BR_EN[b]}</span></div>
        <p class="zw-p-key">${key}</p>
        <p class="zw-p-desc">${desc}</p>
        <div class="zw-p-stars">${starsHtml}</div>
        <div class="zw-p-sz">
          <span class="lab">三方四正 · 综合解读</span>
          <p class="sz-line">${sz.line}</p>
          <p class="sz-geju">${sz.geju}</p>
          ${sz.sihua ? `<p class="sz-hua"><em>四化</em>${sz.sihua}</p>` : ""}
          ${sz.fu ? `<p class="sz-fu"><em>会照</em>${sz.fu}</p>` : ""}
        </div>
        <div class="zw-p-trine"><span class="lab">三方四正 · 牵动的宫位（点击联动）</span><div class="chips">${chips}</div></div>
      </div>`;
    panel.querySelectorAll(".chips button").forEach((btn) =>
      btn.addEventListener("click", () => select(parseInt(btn.dataset.b, 10), true))
    );
    if (fromUser) pauseTour();
  };
  const relabel = () => {
    for (let b = 0; b < 12; b++) {
      cells[b].querySelector(".zw-meta b").textContent = PALACE_AT[b];
      cells[b].setAttribute("aria-label", `${PALACE_AT[b]} · ${BR[b]}`);
    }
  };
  const ripple = (el, e) => {
    const r = el.getBoundingClientRect();
    const s = document.createElement("span");
    s.className = "zw-ripple";
    s.style.left = (e.clientX - r.left) + "px";
    s.style.top = (e.clientY - r.top) + "px";
    el.appendChild(s);
    setTimeout(() => s.remove(), 700);
  };
  for (let b = 0; b < 12; b++) cells[b].addEventListener("click", (e) => { ripple(cells[b], e); select(b, true); });

  /* ---- 真实排盘：iztro 引擎（公历生日 + 时辰 + 性别 → 命宫/五行局/十四主星） ----
     本地自带 vendor/iztro.js（已内联依赖），不依赖外部 CDN —— 离线、国内均可用 */
  const IZTRO_URL = "./vendor/iztro.js";
  // iztro 宫名（短名/仆役）→ 本地解读表键（命宫…父母宫 / 交友宫）
  const NORM = {
    "命宫": "命宫", "身宫": "命宫", "兄弟": "兄弟宫", "夫妻": "夫妻宫", "子女": "子女宫",
    "财帛": "财帛宫", "疾厄": "疾厄宫", "迁移": "迁移宫", "仆役": "交友宫", "交友": "交友宫",
    "官禄": "官禄宫", "田宅": "田宅宫", "福德": "福德宫", "父母": "父母宫",
  };
  let astroMod = null;
  const loadIztro = async () => {
    if (astroMod) return astroMod;
    const m = await import(IZTRO_URL);
    astroMod = m.astro || (m.default && m.default.astro);
    if (!astroMod) throw new Error("iztro: astro export not found");
    return astroMod;
  };
  const centerSub = (txt) => { const s = document.getElementById("zw-center-sub"); if (s) s.textContent = txt; };
  const updateCells = () => {
    for (let b = 0; b < 12; b++) {
      const btn = cells[b];
      btn.classList.toggle("empty", !(STARS[b] && STARS[b].length));
      const sc = btn.querySelector(".zw-stars"); if (sc) sc.innerHTML = (STARS[b] || []).map((s) => `<i>${s}</i>`).join("");
      const mb = btn.querySelector(".zw-meta b"); if (mb) mb.textContent = PALACE_AT[b] || "";
      btn.setAttribute("aria-label", `${PALACE_AT[b] || ""} · ${BR[b]}`);
    }
  };
  const applyChart = (a) => {
    ASTRO_INST = a;
    PALACE_AT = {}; BRIGHT = {}; MUTAGEN = {}; MINOR = {};
    for (let b = 0; b < 12; b++) STARS[b] = [];
    (a.palaces || []).forEach((p) => {
      const b = BR.indexOf(p.earthlyBranch);
      if (b < 0) return;
      PALACE_AT[b] = p.name;
      STARS[b] = (p.majorStars || []).map((s) => s.name);
      BRIGHT[b] = {}; MUTAGEN[b] = {};
      (p.majorStars || []).concat(p.minorStars || []).forEach((s) => {
        if (s.brightness) BRIGHT[b][s.name] = s.brightness;
        if (s.mutagen) MUTAGEN[b][s.name] = s.mutagen;          // 生年四化：禄/权/科/忌
      });
      MINOR[b] = (p.minorStars || []).map((s) => s.name);        // 辅煞星
    });
    updateCells();
    centerSub(`${a.fiveElementsClass || ""} · 命主 ${a.soul || "—"} · 身主 ${a.body || "—"}`);
    // 供 AI 解读层取用的紫微摘要（含四化、辅煞）
    window.__ypxZiwei = {
      fiveElementsClass: a.fiveElementsClass || "",
      soul: a.soul || "", body: a.body || "",
      palaces: (a.palaces || []).map((p) => ({
        name: p.name, branch: p.earthlyBranch,
        majorStars: (p.majorStars || []).map((s) => s.name),
        mutagen: (p.majorStars || []).concat(p.minorStars || [])
          .filter((s) => s.mutagen).map((s) => `${s.name}化${s.mutagen}`),
        minorStars: (p.minorStars || []).map((s) => s.name),
      })),
    };
    let ming = 6;
    for (let b = 0; b < 12; b++) if (PALACE_AT[b] === "命宫") { ming = b; break; }
    select(ming, false, true);
    try { renderLuck(getYear()); } catch (e) {}   // 运限：大限+流年叠加
  };
  const readForm = () => {
    const cal = (document.getElementById("zw-cal") || {}).value || "solar";
    const h = document.getElementById("zw-hour");
    const g = document.getElementById("zw-gender");
    const hv = h ? h.value : "5";
    const ti = (hv === "" || hv == null) ? 0 : parseInt(hv, 10);   // 时辰未知 → 子时近似
    const gender = g && g.value ? g.value : "女";
    if (cal === "lunar") {
      const ly = (document.getElementById("zw-ly") || {}).value || "1995";
      const lm = (document.getElementById("zw-lm") || {}).value || "7";
      const ld = (document.getElementById("zw-ld") || {}).value || "15";
      const leap = !!((document.getElementById("zw-leap") || {}).checked);
      return { cal: "lunar", lunar: `${ly}-${lm}-${ld}`, leap, ti, gender };
    }
    const d = document.getElementById("zw-date");
    return { cal: "solar", date: d && d.value ? d.value : "1995-07-15", ti, gender };
  };
  const realChart = async () => {
    const astro = await loadIztro();
    const f = readForm();
    const a = f.cal === "lunar"
      ? astro.byLunar(f.lunar, f.ti, f.gender, f.leap, true, "zh-CN")   // 农历→排盘（含闰月）
      : astro.bySolar(f.date, f.ti, f.gender, true, "zh-CN");
    applyChart(a);
    return true;
  };
  const STSTORE = {};                                   // 示例盘备份，供排盘失败时回退（STARS 是对象，非数组）
  for (let _b = 0; _b < 12; _b++) STSTORE[_b] = (STARS[_b] || []).slice();
  const PSTORE = Object.assign({}, PALACE_AT);
  const fallbackDemo = () => { for (let b = 0; b < 12; b++) STARS[b] = (STSTORE[b] || []).slice(); PALACE_AT = Object.assign({}, PSTORE); BRIGHT = {}; updateCells(); };

  /* ---- 运限：大限 + 流年（含运限四化）叠加在本命盘上 ---- */
  let ASTRO_INST = null;
  const HUA4 = ["禄", "权", "科", "忌"];
  const getYear = () => { const y = parseInt((document.getElementById("zw-year") || {}).value, 10); return (y >= 1900 && y <= 2100) ? y : 2026; };
  let luckEl = null;
  const ensureLuckEl = () => {
    if (luckEl) return luckEl;
    if (!document.getElementById("zw-luck-css")) {
      const st = document.createElement("style"); st.id = "zw-luck-css";
      st.textContent =
        ".zw-luck{margin:14px 0 0;padding:14px 16px;border-radius:14px}" +
        ".zw-luck .zl-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:9px}" +
        ".zw-luck .zl-head b{font-family:'Noto Serif SC',serif;font-size:15px;color:#fff}" +
        ".zw-luck .zl-y{font-size:13px;color:hsla(var(--hue,262),30%,82%,.82)}" +
        ".zw-luck .zl-y input{width:78px;background:hsla(var(--hue,262),40%,14%,.6);border:1px solid hsla(var(--hue,262),60%,70%,.3);color:#ece8ff;border-radius:8px;padding:5px 8px;font:inherit;font-size:13px}" +
        ".zw-luck .zl-row{font-size:13px;line-height:1.85;color:hsla(var(--hue,262),18%,87%,.92);margin:3px 0}" +
        ".zw-luck .zl-row>b{display:inline-block;min-width:38px;color:hsla(var(--hue,262),62%,84%,.95)}" +
        ".zw-luck .zl-row i{font-style:normal;color:#fff}" +
        ".zw-luck .hua em{font-style:normal;margin:0 5px 0 0;padding:1px 6px;border-radius:5px;font-size:11.5px;background:hsla(var(--hue,262),60%,60%,.2);color:hsla(var(--hue,262),86%,90%,.95)}" +
        ".zw-luck .hua .ji em{background:hsla(8,72%,60%,.26);color:#ffb3a8}" +
        ".zw-luck .zl-tip{font-size:12.5px;color:hsla(var(--hue,262),20%,80%,.6)}" +
        ".zw-cell.luck-year{outline:2px solid hsla(45,90%,66%,.65);outline-offset:-2px}" +
        ".zw-cell.luck-dec::after{content:'限';position:absolute;top:4px;right:6px;font-size:10px;color:hsla(var(--hue,262),85%,82%,.9)}";
      document.head.appendChild(st);
    }
    luckEl = document.createElement("div");
    luckEl.className = "zw-luck glass";
    luckEl.innerHTML =
      '<div class="zl-head"><b>运限 · 大限 / 流年</b>' +
      '<span class="zl-y">流年 <input type="number" id="zw-year" min="1930" max="2035" step="1" value="2026" aria-label="流年" /> 年</span></div>' +
      '<div class="zl-body" id="zw-luck-body"><span class="zl-tip">排盘后显示当年运势</span></div>';
    const stage = chart.closest(".zw-stage") || chart.parentNode;
    if (stage && stage.parentNode) stage.parentNode.insertBefore(luckEl, stage.nextSibling);
    else chart.parentNode.appendChild(luckEl);
    const yi = luckEl.querySelector("#zw-year");
    if (yi) yi.addEventListener("change", () => renderLuck(getYear()));
    return luckEl;
  };
  const huaHtml = (mutagen) => '<span class="hua">' + (mutagen || []).map((s, i) =>
    `<span class="${i === 3 ? 'ji' : ''}"><em>${s}化${HUA4[i] || ""}</em></span>`).join("") + "</span>";
  const renderLuck = (year) => {
    if (!ASTRO_INST) return;
    ensureLuckEl();
    const body = document.getElementById("zw-luck-body");
    if (!body) return;
    let h;
    try { h = ASTRO_INST.horoscope(`${year}-07-01`); } catch (e) { body.innerHTML = '<span class="zl-tip">该年运限不可用</span>'; return; }
    const dec = h.decadal || {}, yr = h.yearly || {};
    const decB = dec.earthlyBranch || dec.branch || "", yrB = yr.earthlyBranch || yr.branch || "";
    const decS = dec.heavenlyStem || dec.stem || "", yrS = yr.heavenlyStem || yr.stem || "";
    const decP = PALACE_AT[BR.indexOf(decB)] || "—", yrP = PALACE_AT[BR.indexOf(yrB)] || "—";
    body.innerHTML =
      `<div class="zl-row"><b>大限</b> ${decS}${decB} · 命宫在 <i>${decB || "—"}</i>（本命${decP}） ${huaHtml(dec.mutagen)}</div>` +
      `<div class="zl-row"><b>流年</b> ${yrS}${yrB}（${year}） · 命宫在 <i>${yrB || "—"}</i>（本命${yrP}） ${huaHtml(yr.mutagen)}</div>`;
    // 导出运限给解读层（#ask 提交时一并发后端，做八字流年 × 紫微流年双印证）
    if (window.__ypxZiwei) window.__ypxZiwei.horoscope = {
      year: year,
      decadal: { gz: decS + decB, palace: decP, mutagen: dec.mutagen || [] },
      yearly: { gz: yrS + yrB, palace: yrP, mutagen: yr.mutagen || [] },
    };
    for (let b = 0; b < 12; b++) cells[b].classList.remove("luck-year", "luck-dec");
    const yb = BR.indexOf(yrB); if (yb >= 0 && cells[yb]) cells[yb].classList.add("luck-year");
    const db = BR.indexOf(decB); if (db >= 0 && cells[db]) cells[db].classList.add("luck-dec");
  };

  /* ---- 农历输入：填充 年/月/日 选项 + 公历⇄农历 切换 ---- */
  (function initLunar() {
    const ly = document.getElementById("zw-ly"), lm = document.getElementById("zw-lm"), ld = document.getElementById("zw-ld");
    const cal = document.getElementById("zw-cal");
    if (!ly || !lm || !ld || !cal) return;
    if (!document.getElementById("zw-lunar-css")) {
      const st = document.createElement("style"); st.id = "zw-lunar-css";
      st.textContent = ".zw-lunar-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}" +
        ".zw-lunar-row select{flex:0 1 auto;min-width:0}" +
        ".zw-leap{display:inline-flex;align-items:center;gap:4px;font-size:13px;white-space:nowrap}" +
        ".zw-leap input{width:auto;margin:0}";
      document.head.appendChild(st);
    }
    const LM = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
    let o = "";
    for (let y = 2026; y >= 1930; y--) o += `<option value="${y}"${y === 1995 ? " selected" : ""}>${y}</option>`;
    ly.innerHTML = o;
    o = ""; for (let m = 1; m <= 12; m++) o += `<option value="${m}"${m === 7 ? " selected" : ""}>${LM[m - 1]}月</option>`;
    lm.innerHTML = o;
    o = ""; for (let d = 1; d <= 30; d++) o += `<option value="${d}"${d === 15 ? " selected" : ""}>${d}</option>`;
    ld.innerHTML = o;
    const sw = document.getElementById("zw-solar-wrap"), lw = document.getElementById("zw-lunar-wrap");
    cal.addEventListener("change", () => {
      const lunar = cal.value === "lunar";
      if (sw) sw.hidden = lunar;
      if (lw) lw.hidden = !lunar;
    });
  })();

  const form = document.getElementById("zw-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector(".btn");
      const orig = btn ? btn.innerHTML : "";
      if (btn) { btn.style.opacity = ".6"; btn.innerHTML = "排盘中…"; }
      realChart()
        .catch((err) => { console.warn("[ypx] iztro 排盘失败，保留当前盘：", err && err.message); })
        .finally(() => { if (btn) { btn.style.opacity = ""; btn.innerHTML = orig; } pauseTour(); });
    });
  }

  /* ---- 自动巡游 ---- */
  let tourTimer = null, resumeTimer = null;
  const ORDER = [6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8, 7]; // 逆行十二宫
  let oi = 0;
  const startTour = () => {
    if (reduced || tourTimer) return;
    tourTimer = setInterval(() => {
      oi = (oi + 1) % 12;
      select(ORDER[oi], false);
    }, 3600);
  };
  const pauseTour = () => {
    clearInterval(tourTimer); tourTimer = null;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { oi = ORDER.indexOf(cur); startTour(); }, 14000);
  };
  let booted = false;   // 懒加载：滚动到紫微区时才载入 iztro 引擎并以默认值排一盘
  new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) {
        if (!booted) {
          booted = true;
          realChart().catch((err) => { console.warn("[ypx] iztro 初次排盘失败，显示示例盘：", err && err.message); fallbackDemo(); });
        }
        startTour();
      } else { clearInterval(tourTimer); tourTimer = null; }
    });
  }, { threshold: 0.25 }).observe(chart);

  window.addEventListener("resize", () => { if (cur >= 0) drawLines(cur); });

  /* ---- 无界面排盘：供 #ask 用出生信息现起一盘（含运限），不动可见命盘 ---- */
  window.ypxCastZiwei = async function (opts) {
    try {
      opts = opts || {};
      if (opts.hour == null || opts.hour === "") return null;   // 紫微需时辰
      const astro = await loadIztro();
      const ti = Math.max(0, Math.min(11, Math.floor(((parseInt(opts.hour, 10) + 1) % 24) / 2)));   // 0-23点 → 时辰序
      const g = (opts.gender === "male" || opts.gender === "男") ? "男" : "女";
      const a = (opts.calendar === "lunar")
        ? astro.byLunar(opts.birth, ti, g, !!opts.leap, true, "zh-CN")
        : astro.bySolar(opts.birth, ti, g, true, "zh-CN");
      const sum = {
        fiveElementsClass: a.fiveElementsClass || "", soul: a.soul || "", body: a.body || "",
        palaces: (a.palaces || []).map((p) => ({
          name: p.name, branch: p.earthlyBranch,
          majorStars: (p.majorStars || []).map((s) => s.name),
          mutagen: (p.majorStars || []).concat(p.minorStars || []).filter((s) => s.mutagen).map((s) => `${s.name}化${s.mutagen}`),
          minorStars: (p.minorStars || []).map((s) => s.name),
        })),
      };
      const year = opts.year || getYear();
      try {
        const h = a.horoscope(`${year}-07-01`);
        const palAt = {}; (a.palaces || []).forEach((p) => { palAt[p.earthlyBranch] = p.name; });
        const yb = (h.yearly && (h.yearly.earthlyBranch || h.yearly.branch)) || "";
        const db = (h.decadal && (h.decadal.earthlyBranch || h.decadal.branch)) || "";
        sum.horoscope = {
          year: year,
          yearly: { gz: ((h.yearly.heavenlyStem || h.yearly.stem || "") + yb), palace: palAt[yb] || "", mutagen: (h.yearly && h.yearly.mutagen) || [] },
          decadal: { gz: ((h.decadal.heavenlyStem || h.decadal.stem || "") + db), palace: palAt[db] || "", mutagen: (h.decadal && h.decadal.mutagen) || [] },
        };
      } catch (e) { }
      return sum;
    } catch (e) { return null; }
  };

  select(6, false);   // 即时示例盘；进入视口后再懒加载 iztro 升级为真实盘
})();
