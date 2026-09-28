/* ============================================================
   有朋迅 · 命理平台 — 本地八字解析引擎（基于古籍的完整实现）
   ------------------------------------------------------------
   本引擎基于以下中国八字命理古籍的核心理论：
   1) 渊海子平 (宋·徐大升) — 子平法源头，论日主、格局、神煞
   2) 子平真诠 (清·沈孝瞻) — 五行—干支—十神—用神—相神—格局—行运体系
   3) 滴天髓 (宋·京土) — 阴阳五行正理，论天地人、中和、月令
   4) 穷通宝鉴 (清·余春台) — 调候用神，十天干十二月喜忌
   5) 三命通会 (明·万民英) — 集大成之作，纳音、神煞、格局
   6) 神峰通考 (明·张楠) — 病药说、格局详论
   7) 千里命稿 (民国·韦千里) — 现代命理实践
   8) 命理探原 (清·沈孝瞻) — 论命源流
   9) 李虚中命书 (唐·李虚中) — 早期禄命法
   10) 五行大义 (隋·萧吉) — 五行精义

   核心数据来源：
   - 日柱表 (day_ganzhi_table.json): 1900-2100年每天的精确日柱
   - 节气表 (jieqi_table.json): 每年24节气的精确日期
   - 年柱表 (year_ganzhi_table.json): 每年年柱（立春分界）
   ============================================================ */

(function () {
  "use strict";

  /* ============================================================
   * 1. 基础数据表
   * ============================================================ */

  // 天干
  const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  // 地支
  const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

  // 天干五行
  const STEM_ELEMENT = {
    "甲":"木","乙":"木","丙":"火","丁":"火","戊":"土",
    "己":"土","庚":"金","辛":"金","壬":"水","癸":"水"
  };
  // 天干阴阳
  const STEM_YINYANG = {
    "甲":"阳","乙":"阴","丙":"阳","丁":"阴","戊":"阳",
    "己":"阴","庚":"阳","辛":"阴","壬":"阳","癸":"阴"
  };

  // 地支五行
  const BRANCH_ELEMENT = {
    "子":"水","丑":"土","寅":"木","卯":"木","辰":"土","巳":"火",
    "午":"火","未":"土","申":"金","酉":"金","戌":"土","亥":"水"
  };

  // 地支藏干（本气、中气、余气）
  // 来源：三命通会、渊海子平
  const BRANCH_HIDDEN = {
    "子":[{gan:"癸",type:"本"}],
    "丑":[{gan:"己",type:"本"},{gan:"癸",type:"中"},{gan:"辛",type:"余"}],
    "寅":[{gan:"甲",type:"本"},{gan:"丙",type:"中"},{gan:"戊",type:"余"}],
    "卯":[{gan:"乙",type:"本"}],
    "辰":[{gan:"戊",type:"本"},{gan:"乙",type:"中"},{gan:"癸",type:"余"}],
    "巳":[{gan:"丙",type:"本"},{gan:"庚",type:"中"},{gan:"戊",type:"余"}],
    "午":[{gan:"丁",type:"本"},{gan:"己",type:"中"}],
    "未":[{gan:"己",type:"本"},{gan:"丁",type:"中"},{gan:"乙",type:"余"}],
    "申":[{gan:"庚",type:"本"},{gan:"壬",type:"中"},{gan:"戊",type:"余"}],
    "酉":[{gan:"辛",type:"本"}],
    "戌":[{gan:"戊",type:"本"},{gan:"辛",type:"中"},{gan:"丁",type:"余"}],
    "亥":[{gan:"壬",type:"本"},{gan:"甲",type:"中"}]
  };

  // 纳音五行（六十甲子纳音）
  // 来源：三命通会、渊海子平
  const NAYIN = {
    "甲子":"海中金","乙丑":"海中金","丙寅":"炉中火","丁卯":"炉中火",
    "戊辰":"大林木","己巳":"大林木","庚午":"路旁土","辛未":"路旁土",
    "壬申":"剑锋金","癸酉":"剑锋金","甲戌":"山头火","乙亥":"山头火",
    "丙子":"涧下水","丁丑":"涧下水","戊寅":"城头土","己卯":"城头土",
    "庚辰":"白蜡金","辛巳":"白蜡金","壬午":"杨柳木","癸未":"杨柳木",
    "甲申":"泉中水","乙酉":"泉中水","丙戌":"屋上土","丁亥":"屋上土",
    "戊子":"霹雳火","己丑":"霹雳火","庚寅":"松柏木","辛卯":"松柏木",
    "壬辰":"长流水","癸巳":"长流水","甲午":"沙中金","乙未":"沙中金",
    "丙申":"山下火","丁酉":"山下火","戊戌":"平地木","己亥":"平地木",
    "庚子":"壁上土","辛丑":"壁上土","壬寅":"金箔金","癸卯":"金箔金",
    "甲辰":"覆灯火","乙巳":"覆灯火","丙午":"天河水","丁未":"天河水",
    "戊申":"大驿土","己酉":"大驿土","庚戌":"钗钏金","辛亥":"钗钏金",
    "壬子":"桑柘木","癸丑":"桑柘木","甲寅":"大溪水","乙卯":"大溪水",
    "丙辰":"沙中土","丁巳":"沙中土","戊午":"天上火","己未":"天上火",
    "庚申":"石榴木","辛酉":"石榴木","壬戌":"大海水","癸亥":"大海水"
  };

  /* ============================================================
   * 2. 十神体系
   * 来源：子平真诠、渊海子平
   * 十神以日干为中心，按五行生克与阴阳确定
   * ============================================================ */

  // 十神对照表（以日干为基准）
  // 行：日干；列：所取天干
  // 值：十神名称
  const TEN_GOD_TABLE = (function() {
    const tbl = {};
    // 五行生克关系
    const SHENG = {"木":"火","火":"土","土":"金","金":"水","水":"木"};
    const KE = {"木":"土","土":"水","水":"火","火":"金","金":"木"};
    // 我克者为财（异性为偏财，同性为正财）
    // 克我者为官（异性为七杀/偏官，同性为正官）
    // 生我者为印（异性为偏印/枭神，同性为正印）
    // 我生者为食伤（异性为伤官，同性为食神）
    // 同我者为比劫（异性为劫财，同性为比肩）

    for (const dayStem of STEMS) {
      tbl[dayStem] = {};
      const dayElem = STEM_ELEMENT[dayStem];
      const dayYinYang = STEM_YINYANG[dayStem];
      for (const otherStem of STEMS) {
        const otherElem = STEM_ELEMENT[otherStem];
        const otherYinYang = STEM_YINYANG[otherStem];
        const sameYY = dayYinYang === otherYinYang;
        let god;
        if (otherElem === dayElem) {
          god = sameYY ? "比肩" : "劫财";
        } else if (SHENG[dayElem] === otherElem) {
          // 我生者
          god = sameYY ? "食神" : "伤官";
        } else if (KE[dayElem] === otherElem) {
          // 我克者
          god = sameYY ? "偏财" : "正财";
        } else if (SHENG[otherElem] === dayElem) {
          // 生我者
          god = sameYY ? "偏印" : "正印";
        } else if (KE[otherElem] === dayElem) {
          // 克我者
          god = sameYY ? "七杀" : "正官";
        } else {
          god = "未知";
        }
        tbl[dayStem][otherStem] = god;
      }
    }
    return tbl;
  })();

  function getTenGod(dayStem, otherStem) {
    if (!dayStem || !otherStem) return "未知";
    return (TEN_GOD_TABLE[dayStem] && TEN_GOD_TABLE[dayStem][otherStem]) || "未知";
  }

  // 地支十神（取本气为主）
  function getBranchTenGod(dayStem, branch) {
    const hidden = BRANCH_HIDDEN[branch];
    if (!hidden || hidden.length === 0) return "未知";
    return getTenGod(dayStem, hidden[0].gan);
  }

  /* ============================================================
   * 3. 地支关系
   * 来源：渊海子平、滴天髓
   * ============================================================ */

  // 地支六合（子丑合、寅亥合、卯戌合、辰酉合、巳申合、午未合）
  const BRANCH_LIUHE = {
    "子":"丑","丑":"子","寅":"亥","亥":"寅","卯":"戌","戌":"卯",
    "辰":"酉","酉":"辰","巳":"申","申":"巳","午":"未","未":"午"
  };

  // 地支六冲
  const BRANCH_CHONG = {
    "子":"午","午":"子","丑":"未","未":"丑","寅":"申","申":"寅",
    "卯":"酉","酉":"卯","辰":"戌","戌":"辰","巳":"亥","亥":"巳"
  };

  // 地支三合局
  const SANHE_GROUPS = {
    "申子辰":{"element":"水","branches":["申","子","辰"]},
    "亥卯未":{"element":"木","branches":["亥","卯","未"]},
    "寅午戌":{"element":"火","branches":["寅","午","戌"]},
    "巳酉丑":{"element":"金","branches":["巳","酉","丑"]}
  };

  // 地支三会局
  const SANHUI_GROUPS = {
    "亥子丑":{"element":"水","branches":["亥","子","丑"]},
    "寅卯辰":{"element":"木","branches":["寅","卯","辰"]},
    "巳午未":{"element":"火","branches":["巳","午","未"]},
    "申酉戌":{"element":"金","branches":["申","酉","戌"]}
  };

  // 地支相刑
  // 三刑：寅巳申（恃势之刑）、丑未戌（持势之刑）、子卯（无礼之刑）
  // 自刑：辰辰、午午、酉酉、亥亥
  const XING_TRIPLE = [
    ["寅","巳","申"],
    ["丑","未","戌"]
  ];
  const XING_PAIR = [["子","卯"]];
  const XING_SELF = ["辰","午","酉","亥"];

  // 地支相害（穿）
  const BRANCH_HAI = {
    "子":"未","未":"子","丑":"午","午":"丑","寅":"巳","巳":"寅",
    "卯":"辰","辰":"卯","申":"亥","亥":"申","酉":"戌","戌":"酉"
  };

  /* ============================================================
   * 4. 十二长生
   * 来源：渊海子平、滴天髓
   * 阳生阴死、阴生阳死（按五行分阴阳顺逆）
   * ============================================================ */

  const CHANGSHENG = ["长生","沐浴","冠带","临官","帝旺","衰","病","死","墓","绝","胎","养"];

  // 阳干顺行、阴干逆行
  // 长生起点（按地支）
  const CHANGSHENG_START = {
    "甲":"亥","丙":"寅","戊":"寅","庚":"巳","壬":"申",  // 阳干
    "乙":"午","丁":"酉","己":"酉","辛":"子","癸":"卯"   // 阴干
  };

  function getChangsheng(dayStem, branch) {
    const startBranch = CHANGSHENG_START[dayStem];
    if (!startBranch) return "未知";
    const startIdx = BRANCHES.indexOf(startBranch);
    const targetIdx = BRANCHES.indexOf(branch);
    const isYang = STEM_YINYANG[dayStem] === "阳";
    let diff;
    if (isYang) {
      // 阳干顺行
      diff = (targetIdx - startIdx + 12) % 12;
    } else {
      // 阴干逆行
      diff = (startIdx - targetIdx + 12) % 12;
    }
    return CHANGSHENG[diff];
  }

  /* ============================================================
   * 5. 时辰与地支
   * 来源：渊海子平
   * 子时：23-1时，丑时：1-3时，寅时：3-5时...
   * 早子时（0-1时）和晚子时（23-24时）分属不同日
   * ============================================================ */

  const HOUR_BRANCH = {
    0:"子", 1:"丑", 2:"丑", 3:"寅", 4:"寅", 5:"卯",
    6:"卯", 7:"辰", 8:"辰", 9:"巳", 10:"巳", 11:"午",
    12:"午", 13:"未", 14:"未", 15:"申", 16:"申", 17:"酉",
    18:"酉", 19:"戌", 20:"戌", 21:"亥", 22:"亥", 23:"子"
  };

  // 五虎遁：年干起月
  // 甲己之年丙作首，乙庚之岁戊为头，丙辛必定从庚起，丁壬壬位顺行流，戊癸甲寅好追求
  const WUHU_DUN = {"甲":"丙","己":"丙","乙":"戊","庚":"戊","丙":"庚","辛":"庚","丁":"壬","壬":"壬","戊":"甲","癸":"甲"};

  // 五鼠遁：日干起时
  // 甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
  const WUSHU_DUN = {"甲":"甲","己":"甲","乙":"丙","庚":"丙","丙":"戊","辛":"戊","丁":"庚","壬":"庚","戊":"壬","癸":"壬"};

  /* ============================================================
   * 6. 神煞系统
   * 来源：三命通会、渊海子平、神峰通考
   * ============================================================ */

  // 天乙贵人
  // 甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸蛇兔藏，庚辛逢马虎
  const TIANYI_GUIREN = {
    "甲":["丑","未"], "戊":["丑","未"], "庚":["丑","未"],
    "乙":["子","申"], "己":["子","申"],
    "丙":["亥","酉"], "丁":["亥","酉"],
    "壬":["巳","卯"], "癸":["巳","卯"],
    "辛":["午","寅"]
  };

  // 文昌贵人
  // 甲乙巳午报君知，丙戊申宫丁己鸡，庚猪辛鼠壬逢虎，癸人见兔入云梯
  const WENCHANG = {
    "甲":"巳","乙":"午","丙":"申","丁":"酉","戊":"申",
    "己":"酉","庚":"亥","辛":"子","壬":"寅","癸":"卯"
  };

  // 驿马（按年支或日支）
  // 申子辰马在寅，寅午戌马在申，巳酉丑马在亥，亥卯未马在巳
  const YIMA = {
    "申":"寅","子":"寅","辰":"寅",
    "寅":"申","午":"申","戌":"申",
    "巳":"亥","酉":"亥","丑":"亥",
    "亥":"巳","卯":"巳","未":"巳"
  };

  // 桃花（按年支或日支）
  // 寅午戌桃花在卯，巳酉丑桃花在午，申子辰桃花在酉，亥卯未桃花在子
  const TAOHUA = {
    "寅":"卯","午":"卯","戌":"卯",
    "巳":"午","酉":"午","丑":"午",
    "申":"酉","子":"酉","辰":"酉",
    "亥":"子","卯":"子","未":"子"
  };

  // 华盖（按年支或日支）
  // 寅午戌华盖在戌，巳酉丑华盖在丑，申子辰华盖在辰，亥卯未华盖在未
  const HUAGAI = {
    "寅":"戌","午":"戌","戌":"戌",
    "巳":"丑","酉":"丑","丑":"丑",
    "申":"辰","子":"辰","辰":"辰",
    "亥":"未","卯":"未","未":"未"
  };

  // 将星（与华盖同位）
  const JIANGXING = HUAGAI;

  // 天德贵人、月德贵人（按月支）
  const TIANDE = {"寅":"丁","卯":"申","辰":"壬","巳":"辛","午":"亥","未":"甲","申":"癸","酉":"寅","戌":"丙","亥":"乙","子":"壬","丑":"庚"};
  const YUEDE = {"寅":"丙","卯":"甲","辰":"壬","巳":"庚","午":"丙","未":"甲","申":"壬","酉":"庚","戌":"丙","亥":"甲","子":"壬","丑":"庚"};

  // 羊刃（帝旺之位）
  // 甲刃在卯，乙刃在辰，丙刃在午，丁刃在未，戊刃在午，己刃在未，庚刃在酉，辛刃在戌，壬刃在子，癸刃在丑
  const YANGREN = {"甲":"卯","乙":"辰","丙":"午","丁":"未","戊":"午","己":"未","庚":"酉","辛":"戌","壬":"子","癸":"丑"};

  // 天罗地网
  // 辰为天罗，戌为地网
  const TIANLUO = "辰";
  const DIWANG = "戌";

  // 空亡（按日柱查）
  // 甲己日空亡在戌亥，乙庚日空亡在申酉，丙辛日空亡在午未，丁壬日空亡在辰巳，戊癸日空亡在子丑
  const KONGWANG = {
    "甲":["戌","亥"], "己":["戌","亥"],
    "乙":["申","酉"], "庚":["申","酉"],
    "丙":["午","未"], "辛":["午","未"],
    "丁":["辰","巳"], "壬":["辰","巳"],
    "戊":["子","丑"], "癸":["子","丑"]
  };

  /* ============================================================
   * 7. 加载预生成的数据表
   * ============================================================ */

  let DAY_TABLE = {};
  let JIEQI_TABLE = {};
  let YEAR_TABLE = {};
  let _dataLoaded = false;

  // 自动检测 <script> 标签加载的全局数据表（兼容 file:// 协议）
  if (typeof window !== "undefined") {
    if (window.__DAY_TABLE) { DAY_TABLE = window.__DAY_TABLE; }
    if (window.__JIEQI_TABLE) { JIEQI_TABLE = window.__JIEQI_TABLE; }
    if (window.__YEAR_TABLE) { YEAR_TABLE = window.__YEAR_TABLE; }
    if (DAY_TABLE && JIEQI_TABLE && YEAR_TABLE &&
        Object.keys(DAY_TABLE).length > 0) {
      _dataLoaded = true;
      console.log("[KnowledgeBazi] 数据表自动加载（全局变量）：日柱" + Object.keys(DAY_TABLE).length + "条，节气" + Object.keys(JIEQI_TABLE).length + "年，年柱" + Object.keys(YEAR_TABLE).length + "年");
    }
  }

  async function loadDataTables() {
    if (_dataLoaded) return true;
    try {
      // 浏览器环境：优先使用 <script> 标签加载的全局变量（兼容 file:// 协议）
      if (typeof window !== "undefined") {
        if (window.__DAY_TABLE && window.__JIEQI_TABLE && window.__YEAR_TABLE) {
          DAY_TABLE = window.__DAY_TABLE;
          JIEQI_TABLE = window.__JIEQI_TABLE;
          YEAR_TABLE = window.__YEAR_TABLE;
          _dataLoaded = true;
          console.log("[KnowledgeBazi] 数据表已加载（全局变量）：日柱" + Object.keys(DAY_TABLE).length + "条，节气" + Object.keys(JIEQI_TABLE).length + "年，年柱" + Object.keys(YEAR_TABLE).length + "年");
          return true;
        }
        // 回退：使用 fetch（需要 HTTP 服务器）
        if (typeof window.fetch === "function" && typeof document !== "undefined") {
          const [dayRes, jqRes, yearRes] = await Promise.all([
            window.fetch("day_ganzhi_table.json"),
            window.fetch("jieqi_table.json"),
            window.fetch("year_ganzhi_table.json")
          ]);
          DAY_TABLE = await dayRes.json();
          JIEQI_TABLE = await jqRes.json();
          YEAR_TABLE = await yearRes.json();
        }
      } else if (typeof require !== "undefined") {
        // Node.js 环境
        const fs = require("fs");
        const path = require("path");
        const base = typeof __dirname !== "undefined" ? __dirname : ".";
        DAY_TABLE = JSON.parse(fs.readFileSync(path.join(base, "day_ganzhi_table.json"), "utf-8"));
        JIEQI_TABLE = JSON.parse(fs.readFileSync(path.join(base, "jieqi_table.json"), "utf-8"));
        YEAR_TABLE = JSON.parse(fs.readFileSync(path.join(base, "year_ganzhi_table.json"), "utf-8"));
      } else {
        // 嵌入环境
        return false;
      }
      _dataLoaded = true;
      console.log("[KnowledgeBazi] 数据表已加载：日柱" + Object.keys(DAY_TABLE).length + "条，节气" + Object.keys(JIEQI_TABLE).length + "年，年柱" + Object.keys(YEAR_TABLE).length + "年");
      return true;
    } catch (e) {
      console.error("[KnowledgeBazi] 数据表加载失败：" + (e && e.message));
      return false;
    }
  }

  /* ============================================================
   * 8. 排盘核心算法
   * ============================================================ */

  // 判断是否需要换年柱
  // lunar-python采用"以立春换年"的方式
  function isBeforeLichun(year, month, day, hour, minute = 0) {
    const yearKey = String(year);
    if (!JIEQI_TABLE[yearKey]) return false;
    const lichun = JIEQI_TABLE[yearKey]["立春"];
    if (!lichun) return false;
    const target = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const lc = new Date(Date.UTC(
      parseInt(lichun.slice(0,4)),
      parseInt(lichun.slice(5,7)) - 1,
      parseInt(lichun.slice(8,10)),
      parseInt(lichun.slice(11,13) || 0),
      parseInt(lichun.slice(14,16) || 0),
      parseInt(lichun.slice(17,19) || 0)
    ));
    return target < lc;
  }

  // 判断两个节气之间
  // lunar-python采用"以节气换月"的方式
  // 按原节气表保留时分秒；UTC 容器仅用于无主机时区影响的同口径比较。
  function getJieqiMonth(year, month, day, hour, minute = 0) {
    const yearKey = String(year);
    if (!JIEQI_TABLE[yearKey]) return month;

    // 月份分界节气（按日历年内时间顺序排列）
    // 每个"节"开始一个新的八字月
    // 小寒(1月)→丑月, 立春(2月)→寅月, 惊蛰(3月)→卯月, 清明(4月)→辰月
    // 立夏(5月)→巳月, 芒种(6月)→午月, 小暑(7月)→未月, 立秋(8月)→申月
    // 白露(9月)→酉月, 寒露(10月)→戌月, 立冬(11月)→亥月, 大雪(12月)→子月
    // 注：小寒之前的日期(1月1日~小寒前)属于上一年的子月(大雪后)
    const monthJieqi = [
      {month: 1,  jq: "小寒", zhi: "丑"},   // ~1月6日
      {month: 2,  jq: "立春", zhi: "寅"},   // ~2月4日
      {month: 3,  jq: "惊蛰", zhi: "卯"},   // ~3月5-6日
      {month: 4,  jq: "清明", zhi: "辰"},   // ~4月4-5日
      {month: 5,  jq: "立夏", zhi: "巳"},   // ~5月5-6日
      {month: 6,  jq: "芒种", zhi: "午"},   // ~6月5-6日
      {month: 7,  jq: "小暑", zhi: "未"},   // ~7月7日
      {month: 8,  jq: "立秋", zhi: "申"},   // ~8月7-8日
      {month: 9,  jq: "白露", zhi: "酉"},   // ~9月7-8日
      {month: 10, jq: "寒露", zhi: "戌"},   // ~10月8日
      {month: 11, jq: "立冬", zhi: "亥"},   // ~11月7日
      {month: 12, jq: "大雪", zhi: "子"}    // ~12月7日
    ];

    // 构建该年份所有"节"的日期（含精确时分秒），按时间排序
    const jieqiDates = [];
    for (let i = 0; i < monthJieqi.length; i++) {
      const item = monthJieqi[i];
      const jqStr = JIEQI_TABLE[yearKey][item.jq];
      if (!jqStr) continue;
      const jqYear = parseInt(jqStr.slice(0,4));
      const jqMonth = parseInt(jqStr.slice(5,7));
      const jqDay = parseInt(jqStr.slice(8,10));
      const jqHour = parseInt(jqStr.slice(11,13) || 0);
      const jqMin = parseInt(jqStr.slice(14,16) || 0);
      jieqiDates.push({
        month: item.month,
        zhi: item.zhi,
        date: new Date(Date.UTC(jqYear, jqMonth - 1, jqDay, jqHour, jqMin, parseInt(jqStr.slice(17,19) || 0)))
      });
    }

    // 按日期排序（确保正确的时间顺序）
    jieqiDates.sort((a, b) => a.date - b.date);

    // 目标日期（含小时）
    const targetDateTime = new Date(Date.UTC(year, month - 1, day, hour || 0, minute));

    // 默认为子月（大雪之后、小寒之前的情况）
    // 即1月1日~小寒前属于上一年的子月
    let resultMonth = 12;
    let resultZhi = "子";

    // 遍历排序后的节气，找到最后一个已过的节气
    for (let i = 0; i < jieqiDates.length; i++) {
      if (targetDateTime >= jieqiDates[i].date) {
        resultMonth = jieqiDates[i].month;
        resultZhi = jieqiDates[i].zhi;
      } else {
        break;
      }
    }

    return resultMonth;
  }

  // 计算月柱（年干起月，五虎遁）
  function calcMonthPillar(yearStem, year, month, day, hour, minute = 0) {
    // 根据节气精确分月
    const actualMonth = getJieqiMonth(year, month, day, hour, minute);
    // 五虎遁：年干起正月（寅月）
    const startGan = WUHU_DUN[yearStem];
    const startGanIdx = STEMS.indexOf(startGan);
    // 五虎遁的口诀：甲己之年丙作首（寅月起丙）
    // 寅月=2月索引，卯月=3月...子月=12月索引
    // 寅月在五虎遁中对应"丙"（0），卯月"丁"（1），辰月"戊"（2）...
    // 实际月份为actualMonth（2=寅，3=卯，4=辰...12=子，1=丑）
    // 寅月在数组中索引=2-2=0
    const monthFromYin = (actualMonth - 2 + 12) % 12;  // 寅月=0, 卯月=1, ..., 子月=10, 丑月=11
    const monthGanIdx = (startGanIdx + monthFromYin) % 10;
    const monthBranchIdx = (actualMonth) % 12; // 寅=2, 卯=3...
    return {
      stem: STEMS[monthGanIdx],
      branch: BRANCHES[monthBranchIdx]
    };
  }

  // 计算年柱（立春分界）
  function calcYearPillar(year, month, day, hour, minute = 0) {
    let actualYear = year;
    if (isBeforeLichun(year, month, day, hour, minute)) {
      actualYear = year - 1;
    }
    const yearKey = String(actualYear);
    const yz = YEAR_TABLE[yearKey] || YEAR_TABLE[actualYear];
    if (yz) {
      return { stem: yz[0], branch: yz[1] };
    }
    // 后备算法
    return {
      stem: STEMS[((actualYear - 4) % 10 + 10) % 10],
      branch: BRANCHES[((actualYear - 4) % 12 + 12) % 12]
    };
  }

  // 计算日柱（查表）
  function calcDayPillar(year, month, day) {
    const key = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const dayGz = DAY_TABLE[key];
    if (!dayGz) {
      console.warn(`[KnowledgeBazi] 日柱表未找到: ${key}`);
      throw new Error("当前日期缺少日柱数据，请换用资料覆盖范围内的日期。");
    }
    return {
      stem: dayGz[0],
      branch: dayGz[1]
    };
  }

  // 计算时柱（五鼠遁）
  // 晚子时(23时)规则：日柱仍为当天，但时柱用次日的日干推算
  // 来源：渊海子平"一日之内，十二时辰，子时为始"
  //       三命通会"子时分早子晚子，晚子属次日"
  function calcHourPillar(dayStem, hour) {
    if (hour == null || hour === "") {
      return { stem: "甲", branch: "子" }; // 未知时辰
    }
    const h = parseFloat(hour);
    // 兼容小数小时（真太阳时）：时辰地支由小数小时推导，子=23~1、丑=1~3…
    const hourBranch = BRANCHES[Math.floor(((h + 1) % 24) / 2)];
    if (!hourBranch) return { stem: "甲", branch: "子" };

    // 晚子时（23–24 点，真太阳时）使用次日的日干来推算时柱
    let stemForCalc = dayStem;
    if (h >= 23) {
      const dayStemIdx = STEMS.indexOf(dayStem);
      stemForCalc = STEMS[(dayStemIdx + 1) % 10];
    }

    const startGan = WUSHU_DUN[stemForCalc];
    const startGanIdx = STEMS.indexOf(startGan);
    const hourBranchIdx = BRANCHES.indexOf(hourBranch);
    const hourGanIdx = (startGanIdx + hourBranchIdx) % 10;
    return {
      stem: STEMS[hourGanIdx],
      branch: hourBranch
    };
  }

  /* ============================================================
   * 5b. 真太阳时修正（用于时柱推算）
   * 真太阳时 = 平太阳时(出生地平时) + 时差方程(EoT)
   * 平太阳时 = 北京时间 + (经度 - 120°) × 4 分钟/度
   * 经度以东经为正；未提供经度时退化为北京时间（无修正）
   * ============================================================ */
  // NOAA fractional-year approximation; UTC+8 standard time, east longitude positive.
  function calcTrueSolar(bjHour, bjMin, longitude, dateObj) {
    const y=dateObj.getUTCFullYear();
    const leap=y%4===0 && (y%100!==0 || y%400===0);
    const N=Math.floor((Date.UTC(y,dateObj.getUTCMonth(),dateObj.getUTCDate())-Date.UTC(y,0,1))/86400000)+1;
    const gamma=2*Math.PI/(leap?366:365)*(N-1+(bjHour+bjMin/60-12)/24);
    const eot=229.18*(0.000075+0.001868*Math.cos(gamma)-0.032077*Math.sin(gamma)-0.014615*Math.cos(2*gamma)-0.040849*Math.sin(2*gamma));
    const lonMin=(longitude-120)*4;
    const total=bjHour*60+bjMin+lonMin+eot;
    const dayOffset=Math.floor(total/1440);
    return {trueHour:((total%1440)+1440)%1440/60,eotMin:eot,lonMin,dayOffset};
  }

  // 起运岁数：出生日到最近“节”的（含时分）天数 ÷ 3（三天为一岁，一天为四月）
  function computeStartAge(days) {
    const ageFloat = days / 3;
    let years = Math.floor(ageFloat);
    let months = Math.round((ageFloat - years) * 12);
    if (months >= 12) { years += 1; months = 0; }
    const label = (months > 0) ? (years + "岁" + months + "个月") : (years + "岁");
    const rounded = (months >= 6) ? years + 1 : years;
    return { age: Math.max(1, rounded), label: label, float: ageFloat };
  }

  // 计算完整四柱（hour 为北京时间 0-23；opts={minute,longitude} 用于真太阳时校正）
  function calcBazi(birthDate, hour, opts) {
    if (typeof birthDate !== "string" || !/^\d{4}-\d{1,2}-\d{1,2}$/.test(birthDate)) throw new Error("请填写有效公历日期。");
    const parts = birthDate.split("-");
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    if (hour == null || hour === "") throw new Error("出生时间不详：当前完整排盘需要准确时间，不能以默认时辰代替。");
    const h = Number(hour);
    const minute = (opts && opts.minute != null) ? Number(opts.minute) : 0;
    const longitude = (opts && opts.longitude != null) ? Number(opts.longitude) : null;
    const check=new Date(Date.UTC(year,month-1,day));
    if(check.getUTCFullYear()!==year || check.getUTCMonth()!==month-1 || check.getUTCDate()!==day) throw new Error("日期无效，请检查月份、日期和闰年。");
    if(!Number.isInteger(h)||h<0||h>23||!Number.isInteger(minute)||minute<0||minute>59) throw new Error("时间无效，请填写00:00至23:59。");
    if(longitude!=null && (!Number.isFinite(longitude)||longitude < -180||longitude>180)) throw new Error("经度必须在-180至180之间，东经为正。");
    if(!JIEQI_TABLE[String(year)] || !JIEQI_TABLE[String(year)]["立春"]) throw new Error("当前年份缺少节气数据，无法可靠排盘。");
    let dayOffset=0;

    // 真太阳时修正：仅当提供经度时启用，用于推算时柱
    let trueHour = h + minute / 60;
    let trueSolarApplied = false;
    let eotMin = 0, lonMin = 0;
    if (longitude != null) {
      const bjDate = new Date(Date.UTC(year, month - 1, day, h, minute));
      const ts = calcTrueSolar(h, minute, longitude, bjDate);
      trueHour = ts.trueHour; eotMin = ts.eotMin; lonMin = ts.lonMin; dayOffset=ts.dayOffset;
      trueSolarApplied = true;
    }

    // 年月柱以北京时间比对交节瞬间；日时柱使用校正后的当地太阳日期和时刻。
    const yearPillar = calcYearPillar(year, month, day, h, minute);
    const monthPillar = calcMonthPillar(yearPillar.stem, year, month, day, h, minute);
    const solarDate=new Date(Date.UTC(year,month-1,day+dayOffset));
    const dayPillar = calcDayPillar(solarDate.getUTCFullYear(), solarDate.getUTCMonth()+1, solarDate.getUTCDate());
    const hourPillar = calcHourPillar(dayPillar.stem, trueHour);

    return {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar,
      birthInfo: {
        year, month, day, hour: h, minute: minute,
        longitude: longitude,
        trueSolarHour: trueHour,
        trueSolarApplied: trueSolarApplied,
        trueSolarDate: solarDate.toISOString().slice(0,10), dayOffset: dayOffset,
        solarTimeMethod: trueSolarApplied ? "NOAA近似均时差，UTC+8；日时柱用太阳日期，年月柱按交节瞬间" : "UTC+8标准时间",
        eotMin: eotMin, lonMin: lonMin,
        bjHour: h, bjMinute: minute
      }
    };
  }

  /* ============================================================
   * 9. 五行统计
   * 来源：子平真诠
   * 天干地支本气计1，藏干中气计0.5，余气计0.2
   * ============================================================ */

  function calcWuxingCount(pillars) {
    const count = {"木":0,"火":0,"土":0,"金":0,"水":0};

    function add(stem, weight) {
      const elem = STEM_ELEMENT[stem];
      if (elem) count[elem] += weight;
    }
    function addBranch(b) {
      const hidden = BRANCH_HIDDEN[b];
      if (!hidden) return;
      hidden.forEach((h, i) => {
        const weight = i === 0 ? 1 : i === 1 ? 0.5 : 0.2;
        add(h.gan, weight);
      });
    }

    // 天干本气
    add(pillars.year.stem, 1);
    add(pillars.month.stem, 1);
    add(pillars.day.stem, 1);
    if (pillars.hour) add(pillars.hour.stem, 1);

    // 地支藏干
    addBranch(pillars.year.branch);
    addBranch(pillars.month.branch);
    addBranch(pillars.day.branch);
    if (pillars.hour) addBranch(pillars.hour.branch);

    // 保留1位小数
    for (const k in count) count[k] = Math.round(count[k] * 10) / 10;
    return count;
  }

  /* ============================================================
   * 10. 日主旺衰判断
   * 来源：滴天髓、子平真诠
   * 核心三要素：得令（季节月令）、得地（地支根气）、得势（天干帮扶）
   * ============================================================ */

  // 月令五行
  const MONTH_BRANCH_ELEMENT = {
    "寅":"木","卯":"木","辰":"土","巳":"火","午":"火","未":"土",
    "申":"金","酉":"金","戌":"土","亥":"水","子":"水","丑":"土"
  };

  function judgeDaymasterStrength(pillars) {
    const dayStem = pillars.day.stem;
    const dayElement = STEM_ELEMENT[dayStem];
    const monthBranch = pillars.month.branch;
    const seasonElement = MONTH_BRANCH_ELEMENT[monthBranch];

    let score = 0;
    let reason = [];

    // 1) 得令（最关键）：月令是否与日主同五行
    if (seasonElement === dayElement) {
      score += 5;
      reason.push("得令于" + monthBranch + "月（" + seasonElement + "）");
    } else {
      // 看月令生克
      const SHENG = {"木":"火","火":"土","土":"金","金":"水","水":"木"};
      const KE = {"木":"土","土":"水","水":"火","火":"金","金":"木"};
      if (SHENG[seasonElement] === dayElement) {
        score += 2; // 月令生日主
        reason.push("月令生身（" + seasonElement + "生" + dayElement + "）");
      } else if (SHENG[dayElement] === seasonElement) {
        score -= 3; // 日主生月令（泄气）
        reason.push("日主泄气于月令");
      } else if (KE[seasonElement] === dayElement) {
        score -= 4; // 月令克日主
        reason.push("月令克身（" + seasonElement + "克" + dayElement + "）");
      } else if (KE[dayElement] === seasonElement) {
        score += 1; // 日主克月令（耗气但有力量）
        reason.push("日主克月令");
      }
    }

    // 2) 得地：地支是否有日主的根
    const allBranches = [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch];
    for (const b of allBranches) {
      const hidden = BRANCH_HIDDEN[b] || [];
      for (let i = 0; i < hidden.length; i++) {
        if (STEM_ELEMENT[hidden[i].gan] === dayElement) {
          const weight = i === 0 ? 1.5 : i === 1 ? 0.8 : 0.4;
          score += weight;
          if (i === 0) reason.push("得根于" + b + "（本气）");
          break;
        }
      }
    }

    // 3) 得势：天干是否有帮扶
    const allStems = [pillars.year.stem, pillars.month.stem, pillars.hour.stem];
    for (const s of allStems) {
      if (STEM_ELEMENT[s] === dayElement) {
        // 同五行
        const sameYY = STEM_YINYANG[s] === STEM_YINYANG[dayStem];
        score += sameYY ? 1.2 : 0.6;
        reason.push("天干有" + s + "帮扶");
      } else {
        // 生我者
        const SHENG = {"木":"火","火":"土","土":"金","金":"水","水":"木"};
        // 反向：X生日主 → X=SHENG-1
        for (const k in SHENG) {
          if (SHENG[k] === dayElement && STEM_ELEMENT[s] === k) {
            const sameYY = STEM_YINYANG[s] === STEM_YINYANG[dayStem];
            score += sameYY ? 0.8 : 0.4;
            reason.push("天干" + s + "生身");
            break;
          }
        }
      }
    }

    // 判断旺衰
    let strength;
    if (score >= 6) strength = "旺";
    else if (score >= 3.5) strength = "中";
    else if (score >= 1) strength = "弱";
    else strength = "极弱";

    return {
      strength: strength,
      score: Math.round(score * 10) / 10,
      reason: reason
    };
  }

  /* ============================================================
   * 11. 喜用神分析
   * 来源：子平真诠、穷通宝鉴、滴天髓
   * 三法：扶抑、调候、病药
   * ============================================================ */

  function getXiyong(pillars, strengthInfo) {
    const dayStem = pillars.day.stem;
    const dayElement = STEM_ELEMENT[dayStem];
    const monthBranch = pillars.month.branch;
    const monthElement = MONTH_BRANCH_ELEMENT[monthBranch];

    const SHENG = {"木":"火","火":"土","土":"金","金":"水","水":"木"};
    const KE = {"木":"土","土":"水","水":"火","火":"金","金":"木"};

    const xiyong = []; // 喜用神
    const ji = [];     // 忌神
    const xiao = [];   // 闲神（不喜不忌）

    // 1) 扶抑法（子平真诠核心）
    if (strengthInfo.strength === "旺" || strengthInfo.strength === "中") {
      // 身旺：喜克泄耗
      if (KE[dayElement] && !xiyong.includes(KE[dayElement])) xiyong.push(KE[dayElement]);
      if (SHENG[dayElement] && !xiyong.includes(SHENG[dayElement])) xiyong.push(SHENG[dayElement]);
      if (!ji.includes(dayElement)) ji.push(dayElement);
    } else {
      // 身弱：喜生扶
      if (!xiyong.includes(dayElement)) xiyong.push(dayElement);
      // 生我者
      for (const k in SHENG) {
        if (SHENG[k] === dayElement && !xiyong.includes(k)) xiyong.push(k);
      }
      // 忌克泄
      if (KE[dayElement] && !ji.includes(KE[dayElement])) ji.push(KE[dayElement]);
      if (SHENG[dayElement] && !ji.includes(SHENG[dayElement])) ji.push(SHENG[dayElement]);
    }

    // 2) 调候法（穷通宝鉴核心）
    // 不同月份的调候用神
    const TIAOHOU = {
      "甲": {
        "寅":"丙癸","卯":"丙癸","辰":"癸丁","巳":"癸丁","午":"癸丁","未":"癸丁",
        "申":"丁庚","酉":"丁庚","戌":"丁甲壬","亥":"丁庚","子":"丁庚","丑":"丁庚"
      },
      "乙": {
        "寅":"丙","卯":"丙","辰":"癸","巳":"癸","午":"癸","未":"癸",
        "申":"丙癸","酉":"丙癸","戌":"癸","亥":"癸","子":"丙","丑":"丙"
      },
      "丙": {
        "寅":"壬","卯":"壬","辰":"壬","巳":"壬","午":"壬","未":"壬",
        "申":"壬","酉":"壬","戌":"壬","亥":"壬","子":"壬","丑":"壬"
      },
      "丁": {
        "寅":"甲","卯":"甲","辰":"甲","巳":"甲","午":"甲","未":"甲",
        "申":"甲","酉":"甲","戌":"甲","亥":"甲","子":"甲","丑":"甲"
      },
      "戊": {
        "寅":"甲丙","卯":"甲丙","辰":"甲丙","巳":"甲丙","午":"甲丙","未":"甲丙",
        "申":"甲丙","酉":"甲丙","戌":"甲丙","亥":"甲丙","子":"甲丙","丑":"甲丙"
      },
      "己": {
        "寅":"甲丙","卯":"甲丙","辰":"甲丙","巳":"甲丙","午":"甲丙","未":"甲丙",
        "申":"甲丙","酉":"甲丙","戌":"甲丙","亥":"甲丙","子":"甲丙","丑":"甲丙"
      },
      "庚": {
        "寅":"丁甲","卯":"丁甲","辰":"甲丁","巳":"甲丁","午":"甲丁","未":"甲丁",
        "申":"丁","酉":"丁","戌":"丁","亥":"丁","子":"丁","丑":"丁"
      },
      "辛": {
        "寅":"壬","卯":"壬","辰":"壬","巳":"壬","午":"壬","未":"壬",
        "申":"壬","酉":"壬","戌":"壬","亥":"壬","子":"壬","丑":"壬"
      },
      "壬": {
        "寅":"戊","卯":"戊","辰":"戊","巳":"戊","午":"戊","未":"戊",
        "申":"戊","酉":"戊","戌":"戊","亥":"戊","子":"戊","丑":"戊"
      },
      "癸": {
        "寅":"辛","卯":"辛","辰":"辛","巳":"辛","午":"辛","未":"辛",
        "申":"辛","酉":"辛","戌":"辛","亥":"辛","子":"辛","丑":"辛"
      }
    };

    if (TIAOHOU[dayStem] && TIAOHOU[dayStem][monthBranch]) {
      const tiaohouStems = TIAOHOU[dayStem][monthBranch];
      for (const c of tiaohouStems) {
        const elem = STEM_ELEMENT[c];
        if (elem && !xiyong.includes(elem)) xiyong.push(elem);
      }
    }

    return {
      xiyong: xiyong,
      ji: ji,
      method: "扶抑+调候"
    };
  }

  /* ============================================================
   * 12. 十神计算
   * ============================================================ */

  function calcTenGods(pillars) {
    const dayStem = pillars.day.stem;
    return {
      year: {
        stem: getTenGod(dayStem, pillars.year.stem),
        branch: getBranchTenGod(dayStem, pillars.year.branch)
      },
      month: {
        stem: getTenGod(dayStem, pillars.month.stem),
        branch: getBranchTenGod(dayStem, pillars.month.branch)
      },
      day: {
        stem: "日主",
        branch: getBranchTenGod(dayStem, pillars.day.branch)
      },
      hour: {
        stem: getTenGod(dayStem, pillars.hour.stem),
        branch: getBranchTenGod(dayStem, pillars.hour.branch)
      }
    };
  }

  /* ============================================================
   * 13. 格局分析
   * 来源：子平真诠、渊海子平
   * 月令所藏之透干者为格局
   * ============================================================ */

  function analyzeGeju(pillars, tenGods) {
    const monthBranch = pillars.month.branch;
    const monthHidden = BRANCH_HIDDEN[monthBranch];
    const dayStem = pillars.day.stem;
    const yearStem = pillars.year.stem;
    const hourStem = pillars.hour.stem;

    const gejus = [];

    // 检查月令本气是否透出
    const mainQi = monthHidden[0].gan;
    const mainQiGod = getTenGod(dayStem, mainQi);

    // 八大基本格局
    if (["正官","偏官","七杀"].includes(mainQiGod)) {
      gejus.push({name: monthHidden[0].gan === "正官" ? "正官格" : "七杀格", type: "正格"});
    } else if (mainQiGod === "正印" || mainQiGod === "偏印") {
      gejus.push({name: mainQiGod === "正印" ? "正印格" : "偏印格", type: "正格"});
    } else if (mainQiGod === "正财" || mainQiGod === "偏财") {
      gejus.push({name: mainQiGod === "正财" ? "正财格" : "偏财格", type: "正格"});
    } else if (mainQiGod === "食神" || mainQiGod === "伤官") {
      gejus.push({name: mainQiGod === "食神" ? "食神格" : "伤官格", type: "正格"});
    }

    // 比肩格（建禄、月劫）
    if (mainQi === dayStem) {
      gejus.push({name: "建禄格", type: "比肩格"});
    }

    // 羊刃格
    const YANGREN_BRANCH = {"甲":"卯","乙":"辰","丙":"午","丁":"未","戊":"午","己":"未","庚":"酉","辛":"戌","壬":"子","癸":"丑"};
    if (YANGREN_BRANCH[dayStem] === monthBranch) {
      gejus.push({name: "羊刃格", type: "特殊格"});
    }

    return gejus.length > 0 ? gejus : [{name: "普通命局", type: "杂格"}];
  }

  /* ============================================================
   * 14. 神煞查询
   * ============================================================ */

  function calcShensha(pillars, dayStem) {
    const yearBranch = pillars.year.branch;
    const dayBranch = pillars.day.branch;
    const monthBranch = pillars.month.branch;
    const allBranches = [yearBranch, pillars.month.branch, dayBranch, pillars.hour.branch];
    const allStems = [pillars.year.stem, pillars.month.stem, pillars.day.stem, pillars.hour.stem];

    const shensha = [];

    // 天乙贵人（以日干查）
    const tianyi = TIANYI_GUIREN[dayStem] || [];
    for (const b of allBranches) {
      if (tianyi.includes(b)) {
        shensha.push({name: "天乙贵人", branch: b, level: "吉"});
      }
    }

    // 文昌贵人
    const wc = WENCHANG[dayStem];
    if (wc && allBranches.includes(wc)) {
      shensha.push({name: "文昌贵人", branch: wc, level: "吉"});
    }

    // 驿马（以年支查）
    const ym = YIMA[yearBranch];
    if (ym && allBranches.includes(ym)) {
      shensha.push({name: "驿马", branch: ym, level: "中性"});
    }

    // 桃花
    const th = TAOHUA[yearBranch];
    if (th && allBranches.includes(th)) {
      shensha.push({name: "桃花", branch: th, level: "中性"});
    }

    // 华盖
    const hg = HUAGAI[yearBranch];
    if (hg && allBranches.includes(hg)) {
      shensha.push({name: "华盖", branch: hg, level: "中性"});
    }

    // 羊刃
    const yr = YANGREN[dayStem];
    if (yr && allBranches.includes(yr)) {
      shensha.push({name: "羊刃", branch: yr, level: "凶"});
    }

    return shensha;
  }

  /* ============================================================
   * 15. 完整分析
   * ============================================================ */

  async function fullAnalysis(birthDate, hour, gender, opts) {
    await loadDataTables();

    const pillars = calcBazi(birthDate, hour, opts);
    const wuxing = calcWuxingCount(pillars);
    const tenGods = calcTenGods(pillars);
    const strengthInfo = judgeDaymasterStrength(pillars);
    const xiyong = getXiyong(pillars, strengthInfo);
    const geju = analyzeGeju(pillars, tenGods);
    const shensha = calcShensha(pillars, pillars.day.stem);

    // 大运（供 generateReport 直接使用；toChartFormat 会另行计算用于真盘渲染）
    const daYun = calcDaYun(pillars, pillars.birthInfo, gender);
    const _now = new Date();
    const _birthY = pillars.birthInfo && pillars.birthInfo.year ? pillars.birthInfo.year : (_now.getFullYear() - 30);
    const _currentAge = _now.getFullYear() - _birthY;
    if (daYun && daYun.runs) {
      daYun.runs.forEach(function (r, i) {
        const next = daYun.runs[i + 1];
        const ageEnd = next ? next.age : 200;
        const nowText = new Date(Date.now()+8*3600000).toISOString().slice(0,19).replace("T"," ");
        r.current = nowText >= r.start_date && nowText < r.end_date;
      });
      daYun.current_age = _currentAge;
    }

    return {
      pillars: pillars,
      wuxing: wuxing,
      tenGods: tenGods,
      strength: strengthInfo.strength,
      strengthInfo: strengthInfo,
      xiyong: xiyong,
      geju: geju,
      shensha: shensha,
      daYun: daYun,
      gender: gender || "male"
    };
  }

  // 同步版本（数据已加载时使用）
  function fullAnalysisSync(birthDate, hour, gender, opts) {
    const pillars = calcBazi(birthDate, hour, opts);
    const wuxing = calcWuxingCount(pillars);
    const tenGods = calcTenGods(pillars);
    const strengthInfo = judgeDaymasterStrength(pillars);
    const xiyong = getXiyong(pillars, strengthInfo);
    const geju = analyzeGeju(pillars, tenGods);
    const shensha = calcShensha(pillars, pillars.day.stem);

    return {
      pillars: pillars,
      wuxing: wuxing,
      tenGods: tenGods,
      strength: strengthInfo.strength,
      strengthInfo: strengthInfo,
      xiyong: xiyong,
      geju: geju,
      shensha: shensha,
      gender: gender || "male"
    };
  }

  /* ============================================================
   * 16. 大运计算
   * 来源：子平真诠、渊海子平
   * 阳男阴女顺排，阴男阳女逆排
   * 起运岁数：出生日到下一个（顺排）或上一个（逆排）节气日的天数，3天=1年
   * ============================================================ */

  function calcDaYun(pillars, birthInfo, gender) {
    if (!window.YPXTools) throw new Error("起运模块未加载。");
    return window.YPXTools.yun(birthInfo, gender, window.Solar);
  }

  /* ============================================================
   * 17. 流年计算
   * ============================================================ */

  function calcLiuNian(dayStem, year) {
    const yearKey = String(year);
    const yearGz = YEAR_TABLE[yearKey] || YEAR_TABLE[year];
    if (!yearGz) return { year: year, gz: "—", element: "—", god: "—" };
    const stem = yearGz[0];
    const branch = yearGz[1];
    return {
      year: year,
      gz: yearGz,
      element: STEM_ELEMENT[stem],
      god: getTenGod(dayStem, stem)
    };
  }

  /* ============================================================
   * 18. 状态指标（基于命盘推算）
   * ============================================================ */

  function calcMetrics(analysis) {
    const xi = analysis.xiyong.xiyong || [];
    const ji = analysis.xiyong.ji || [];
    const strength = analysis.strengthInfo.strength;
    const dayElem = STEM_ELEMENT[analysis.pillars.day.stem];
    const wuxing = analysis.wuxing;

    const SHENG = {"木":"火","火":"土","土":"金","金":"水","水":"木"};
    const KE = {"木":"土","土":"水","水":"火","火":"金","金":"木"};

    // 事业：看官杀（克日主者）的力量
    const officerElem = KE[dayElem]; // 克我者
    let career = 50;
    if (xi.includes(officerElem)) career += 20;
    if (ji.includes(officerElem)) career -= 15;
    career += Math.min(20, (wuxing[officerElem] || 0) * 5);
    career = Math.max(10, Math.min(95, Math.round(career)));

    // 财运：看财星（我克者）的力量
    const wealthElem = KE[dayElem]; // 实际是我克者... 不对
    // 我克者为财
    const myWealthElem = SHENG[dayElem]; // 我生者... 不对
    // 重新：我克者为财 → KE[dayElem] 是日主克的
    const wealthElem2 = KE[dayElem]; // 日主克此元素 → 这是财星
    let wealth = 50;
    if (xi.includes(wealthElem2)) wealth += 20;
    if (ji.includes(wealthElem2)) wealth -= 15;
    wealth += Math.min(20, (wuxing[wealthElem2] || 0) * 5);
    wealth = Math.max(10, Math.min(95, Math.round(wealth)));

    // 感情：看桃花、天乙等神煞
    let love = 50;
    const shensha = analysis.shensha || [];
    if (shensha.some(s => s.name === "桃花")) love += 15;
    if (shensha.some(s => s.name === "天乙贵人")) love += 10;
    if (shensha.some(s => s.name === "华盖")) love -= 10;
    love = Math.max(15, Math.min(90, love));

    // 健康：看五行是否平衡
    const vals = Object.values(wuxing);
    const maxV = Math.max(...vals);
    const minV = Math.min(...vals);
    let health = 70;
    health -= (maxV - minV) * 5; // 五行偏枯扣分
    if (strength === "极弱") health -= 15;
    if (strength === "旺") health -= 5;
    if (strength === "中") health += 10;
    health = Math.max(20, Math.min(95, Math.round(health)));

    return { "事业": career, "财运": wealth, "感情": love, "健康": health };
  }

  /* ============================================================
   * 19. 生成分析报告（Markdown格式）
   * ============================================================ */


  const YUN_THEMES={
    比肩:['自主与同辈协作','明确自己负责的部分，练习独立决策，同时寻找能平等合作的人','独立不等于凡事自己扛；合作前把责任和资源分配讲清楚'],
    劫财:['资源分配与竞争','留意共同投入、团队分工和同辈比较，核对自己实际能承担的份额','不要因人情、比较或一时意气，承担未经确认的支出和承诺'],
    食神:['技能积累与稳定产出','把已经会的事做得更稳定，让作品、服务或练习形成可持续的节奏','舒适与产出要平衡，不能只积累准备而不交付'],
    伤官:['表达、改进与规则摩擦','把不同意见变成具体方案，用作品或证据说明为什么值得改变','表达不满前先明确目标，避免把证明自己变成与所有规则对抗'],
    正财:['日常经营与责任兑现','核对稳定收入来源、日常安排和持续履约的能力，重视可重复的成果','不要将安全感完全系在短期数字上，也不要为维持稳定无限加码'],
    偏财:['外部机会与资源调动','比较新合作、新渠道与可调动资源，先小规模验证再决定投入','机会多不等于收益高；明确成本、责任与退出条件'],
    正官:['职责、规范与认可','把角色要求、评价标准和履约边界讲清楚，建立可核对的工作记录','不要把外界评价当作全部价值，也不要默认职责之外的负担都应由你承担'],
    七杀:['压力、挑战与应对','拆解高要求或紧迫任务，确认优先级、支持条件和可控范围','承压不是硬撑；若现实资源不足，应协商目标或减少同时推进的事项'],
    正印:['学习、支持与整理','系统整理经验，吸收有用知识，建立能够支持自己的方法和关系','得到支持仍需要转化为行动，避免一直等到准备完美才开始'],
    偏印:['探索、辨别与方法更新','给新思路一个小范围试验，检验它是否真的解决眼前问题','避免反复换方法而不验证，也不要把独特等同于有效']
  };
  function describeDaYun(analysis,stamp){
    const runs=analysis.daYun?.runs||[],day=analysis.pillars.day.stem;
    stamp=stamp||new Date(Date.now()+8*3600000).toISOString().slice(0,19).replace('T',' ');
    const labels={year:'年柱（早年与外部环境）',month:'月柱（成长环境与社会角色）',day:'日柱（自身与亲密相处）',hour:'时柱（后续安排）'};
    const describe=r=>{
      const god=getTenGod(day,r.stem),hidden=(BRANCH_HIDDEN[r.branch]||[]).map(h=>({stem:h.gan,god:getTenGod(day,h.gan)}));
      const roots=Object.entries(labels).filter(([k])=>(BRANCH_HIDDEN[analysis.pillars[k].branch]||[]).some(h=>h.gan===r.stem)).map(([,v])=>v);
      const repeats=Object.entries(labels).filter(([k])=>analysis.pillars[k].stem===r.stem).map(([,v])=>v);
      const relations=[];
      for(const [k,label] of Object.entries(labels))for(const [kind,map] of [['六合',BRANCH_LIUHE],['六冲',BRANCH_CHONG],['六害',BRANCH_HAI]])if(map[r.branch]===analysis.pillars[k].branch)relations.push({kind,label,branch:analysis.pillars[k].branch});
      return {run:r,god,hidden,roots,repeats,relations,theme:YUN_THEMES[god]||['相对日主的关系','核对实际处境','不凭单一符号定结论']};
    };
    return {stamp,steps:runs.map(describe),current:runs.findIndex(r=>stamp>=r.start_date&&stamp<r.end_date)};
  }
  function generateDaYunReport(analysis,stamp){
    const d=describeDaYun(analysis,stamp);let md='## 大运状态：先看阶段，再看具体作用\n\n';
    if(!d.steps.length)return md+'大运起止资料未加载，暂不生成阶段判断。\n\n';
    md+='**参照时间（北京时间）**：'+d.stamp+'。区间以实际交运日期为准，结束时刻不计入本步。'+(analysis.daYun.forward?'顺排':'逆排')+'只说明排运顺序，不是运势顺逆。\n\n';
    md+='### 八步大运时间线\n\n';
    d.steps.forEach((s,i)=>{const r=s.run;md+='- 第'+r.order+'步 · **'+r.stem+r.branch+(i===d.current?'（当前）':'')+'** · '+r.start_date+' → '+r.end_date+'；天干'+s.god+'，主题为'+s.theme[0]+'。\n';});md+='\n';
    if(d.current<0)return md+'所选时刻尚未进入已列大运，或超出数据覆盖范围；不以最近一步代替。\n\n';
    const s=d.steps[d.current],r=s.run,day=analysis.pillars.day.stem;
    md+='### 当前'+r.stem+r.branch+'大运：'+s.theme[0]+'\n\n';
    md+='**先说重点**：以日主'+day+'为参照，运干'+r.stem+'为'+s.god+'；这一步的传统阅读主线是“'+s.theme[0]+'”。它提出的是阶段性观察方向，不是“这十年都会顺”或“都会差”。\n\n';
    md+='**天干这一层**：'+s.theme[1]+'。需要拿捏的是：'+s.theme[2]+'。这些做法只有在与你的真实处境相符时才适用。\n\n';
    md+='**地支这一层**：运支'+r.branch+'藏'+s.hidden.map(x=>x.stem+'（'+x.god+'）').join('、')+'。地支并不只有一种五行作用，藏干也不能直接当成已经透干。\n\n';
    s.hidden.forEach((x,i)=>{const h=YUN_THEMES[x.god];if(h)md+='- '+(i===0?'本气':'其他藏干')+x.stem+' · '+x.god+'：补充观察'+h[0]+'。若现实中同时遇到这些议题，需要协调优先级，不把它们累加成吉凶分数。\n';});md+='\n';
    md+='**这步运与本命如何衔接**：本命月柱'+analysis.pillars.month.stem+analysis.pillars.month.branch+'是原局背景，不能被运干的五行代替。运干'+r.stem+(s.roots.length?'在本命'+s.roots.join('、')+'的藏干中出现':'在本命四支藏干中没有同字落点')+'；'+(s.repeats.length?'本命'+s.repeats.join('、')+'也透出同字天干。':'本命四柱天干没有同字重复。')+'这里只核对同字根气与透出，不据此自动判旺衰、成格或喜用。\n\n';
    md+='### 哪些位置被触及\n\n';
    if(!s.relations.length)md+='本步运支与本命四支未检出六合、六冲、六害。这不表示“平顺”，因为刑、破、三合三会与合化条件不在这组规则内。\n\n';
    s.relations.forEach(x=>{const text={六合:'可把协作、牵连或彼此需要协调的条件列出来；有合不代表对方同意，也不自动成化。',六冲:'可对照是否正在经历节奏、安排或立场的差异；有冲不代表必然失去、分离或受损。',六害:'可留意约定与理解是否一致，核对未说清的条件；不能据此猜测有人伤害自己。'}[x.kind];md+='- 运支'+r.branch+'与本命'+x.label+x.branch+'形成'+x.kind+'。'+text+'\n';});md+='\n';
    const prev=d.steps[d.current-1],next=d.steps[d.current+1];md+='### 与前后阶段相比\n\n';
    if(prev)md+='- 上一步'+prev.run.stem+prev.run.branch+'侧重'+prev.theme[0]+'；现在转为'+s.theme[0]+'。这是十神主题的变化，不等于过去的现实问题会自动结束。\n';
    if(next)md+='- 下一步'+next.run.stem+next.run.branch+'从'+next.run.start_date+'开始，天干主题为'+next.theme[0]+'。在交运前仍按当前这步核对，不提前把下一步当成已经生效。\n';
    try{const parts=d.stamp.match(/\d+/g).map(Number),l=window.Solar.fromYmdHms(...parts).getLunar(),year=l.getYearInGanZhiExact(),yg=getTenGod(day,year[0]);md+='\n### 流年怎样叠加到这步大运\n\n';md+='所选时刻流年为**'+year+'**（按立春分界），年干为'+yg+'，与大运天干'+s.god+'分别观察。'+(yg===s.god?'两个层次出现同一十神，说明阅读主题重叠，不代表影响翻倍。':'年度的'+(YUN_THEMES[yg]?.[0]||yg)+'主题，叠在这步大运的'+s.theme[0]+'背景上；若现实任务不同，需要分清长期安排和当年事项。')+'\n\n';const hit=[];for(const [kind,map] of [['六合',BRANCH_LIUHE],['六冲',BRANCH_CHONG],['六害',BRANCH_HAI]])if(map[year[1]]===r.branch)hit.push(kind);md+='流年支'+year[1]+'与运支'+r.branch+(hit.length?'检出'+hit.join('、'):'未检出六合、六冲、六害')+'。这不是“吉凶相抵”；仍要分别核对原局受影响的位置与实际事件。\n\n';}catch(_){md+='\n流年精确历法暂不可用，不用公历年份余数代替立春年界。\n\n';}
    md+='**怎样落实**：先选本阶段与你最相关的一件现实事情，记录目标、已有资源与限制；再用实际反馈判断是否推进。月度变化请结合上方所选时间的流月分析。\n\n';
    md+='**目前判断到哪一步**：以上已展开时间、十神、藏干、同字根气及六合冲害；尚未完成完整月令旺衰、调候、格局成败和合化验证，所以不输出“整体好运／坏运”的总判。\n\n';return md;
  }

  function generateReport(analysis) {
    const p=analysis.pillars,dm=p.day.stem,keys=['year','month','day','hour'],labels=['年柱','月柱','日柱','时柱'];
    let md='## 本次命盘的核心结构\n\n';
    md+='四柱：**'+keys.map(k=>p[k].stem+p[k].branch).join(' · ')+'**。日主为 **'+dm+STEM_ELEMENT[dm]+'**，生于 **'+p.month.branch+'月**。\n\n';
    const hidden=BRANCH_HIDDEN[p.month.branch]||[],visible=keys.filter(k=>k!=='day');
    md+='### 1. 月令与透干\n\n';
    md+='月支藏干为 '+hidden.map(h=>h.gan+'（'+getTenGod(dm,h.gan)+'）').join('、')+'。\n\n';
    const exposed=hidden.map(h=>({h,at:visible.filter(k=>p[k].stem===h.gan)})).filter(x=>x.at.length);
    md+=exposed.length?'月令藏干中，'+exposed.map(x=>x.h.gan+'透在'+x.at.map(k=>labels[keys.indexOf(k)]).join('、')).join('；')+'。这明确了月支所藏与天干显露的对应；不单凭透干认定格局成立。\n\n':'月令藏干没有同字透在年、月、时干，月支所藏与外显天干需分别保留。\n\n';
    md+='### 2. 外显十神与内藏结构\n\n';
    visible.forEach(k=>{const god=getTenGod(dm,p[k].stem),theme=YUN_THEMES[god];md+='- **'+labels[keys.indexOf(k)]+' '+p[k].stem+' · '+god+'**：传统主题为'+(theme?theme[0]:'相对日主的生克关系')+'；地支'+p[k].branch+'藏'+(BRANCH_HIDDEN[p[k].branch]||[]).map(h=>h.gan+'（'+getTenGod(dm,h.gan)+'）').join('、')+'。\n';});
    md+='\n日支 **'+p.day.branch+'** 藏'+(BRANCH_HIDDEN[p.day.branch]||[]).map(h=>h.gan+'（'+getTenGod(dm,h.gan)+'）').join('、')+'，与日干分开呈现，不凭日支单独推断伴侣性格或关系结果。\n\n';
    const roots=keys.filter(k=>(BRANCH_HIDDEN[p[k].branch]||[]).some(h=>h.gan===dm));
    md+='### 3. 日主同字根气与旺衰依据\n\n';
    md+=roots.length?'日干'+dm+'在'+roots.map(k=>labels[keys.indexOf(k)]+'地支'+p[k].branch).join('、')+'的藏干中出现，存在同字根气。':'四支藏干未见日干'+dm+'同字；这一检查不包含其他生扶条件，不能直接判为无根或身弱。';
    md+='\n\n现有简化规则给出的旺衰标签为 **'+analysis.strengthInfo.strength+'**。此标签不是人格、精力或能力评价。依据：'+([].concat(analysis.strengthInfo.reason||[]).join('；')||'未返回')+'。\n\n';
    md+='### 4. 原局关系落点\n\n';let found=0;
    [['六合',BRANCH_LIUHE,'关联与牵引'],['六冲',BRANCH_CHONG,'对立与变动'],['六害',BRANCH_HAI,'牵制与不协调']].forEach(([title,map,meaning])=>{for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){if(map[p[keys[i]].branch]===p[keys[j]].branch){found++;md+='- **'+labels[i]+p[keys[i]].branch+'与'+labels[j]+p[keys[j]].branch+'：'+title+'**。此规则的传统象义是'+meaning+'；配对成立不等于合化成立，也不能单独推出具体事件。\n';}}});
    if(!found)md+='本局未匹配到六合、六冲、六害；其他关系不在这一组规则内。\n';
    md+='\n### 5. 喜用与格局的判断范围\n\n';
    md+='现有规则的候选五行为：'+(analysis.xiyong.xiyong||[]).join('、')+'。这里只保留算法候选，不据此推荐方位、行业、颜色或投资；月令深浅、调候、合化及格局成败尚未完成综合校验。\n\n';
    md+=generateDaYunReport(analysis);
    md+='\n\n以上按本次排盘数据与本站规则生成。十神和宫位属于传统解释体系；具体处境与行动比较请结合你填写的实际条件。\n';
    return md;
  }

  /* ============================================================
   * 20. 转换为chart.js期望的数据格式
   * ============================================================ */

  function toChartFormat(analysis) {
    const p = analysis.pillars;
    const dayStem = p.day.stem;

    // 四柱详情（匹配chart.js期望的格式）
    const pillarsDetail = ["year","month","day","hour"].map(role => {
      const pillar = p[role];
      const gz = pillar.stem + pillar.branch;
      const hidden = (BRANCH_HIDDEN[pillar.branch] || []).map(h => ({
        stem: h.gan,
        type: h.type || "",       // 本/中/余
        element: STEM_ELEMENT[h.gan],
        god: getTenGod(dayStem, h.gan)
      }));
      return {
        role: role,
        gz: gz,
        stem: pillar.stem,
        branch: pillar.branch,
        element: STEM_ELEMENT[pillar.stem],
        branch_element: BRANCH_ELEMENT[pillar.branch],
        stem_god: role === "day" ? "日主" : getTenGod(dayStem, pillar.stem),
        hidden: hidden,
        nayin: NAYIN[gz] || ""
      };
    });

    // 大运
    const daYun = calcDaYun(p, p.birthInfo, analysis.gender);

    // 流年
    const currentYear = new Date().getFullYear();
    const liuNian = calcLiuNian(dayStem, currentYear);

    // 指标
    const metrics = calcMetrics(analysis);

    // 空亡（按日柱查旬空地支）
    const kongWang = KONGWANG[dayStem] || [];

    // 当前大运（按本年虚岁查找）
    const now = new Date();
    const birthY = p.birthInfo && p.birthInfo.year ? p.birthInfo.year : (now.getFullYear() - 30);
    const currentAge = now.getFullYear() - birthY;
    if (daYun && daYun.runs) {
      daYun.runs.forEach((r, i) => {
        const next = daYun.runs[i + 1];
        const ageEnd = next ? next.age : 200;
        const nowText = new Date(Date.now()+8*3600000).toISOString().slice(0,19).replace("T"," "); r.current = nowText >= r.start_date && nowText < r.end_date;
      });
      daYun.current_age = currentAge;
    }

    return {
      pillars_detail: pillarsDetail,
      day_master: {
        stem: dayStem,
        element: STEM_ELEMENT[dayStem],
        strength: analysis.strengthInfo.strength,
        score: analysis.strengthInfo.score
      },
      xiyong: {
        xi: analysis.xiyong.xiyong,
        ji: analysis.xiyong.ji
      },
      wuxing: analysis.wuxing,
      ten_gods: analysis.tenGods,
      geju: analysis.geju,
      shensha: analysis.shensha,
      kong_wang: kongWang,
      strength_info: analysis.strengthInfo,
      da_yun: daYun,
      liu_nian: liuNian,
      metrics: metrics,
      rating: analysis.strengthInfo.strength === "旺" ? "身旺" :
              analysis.strengthInfo.strength === "中" ? "中和" :
              analysis.strengthInfo.strength === "弱" ? "身弱" : "极弱"
    };
  }

  /* ============================================================
   * 17. 导出
   * ============================================================ */

  window.KnowledgeBazi = {
    // 数据表
    STEMS, BRANCHES, STEM_ELEMENT, BRANCH_ELEMENT, BRANCH_HIDDEN,
    NAYIN, TEN_GOD_TABLE,
    BRANCH_LIUHE, BRANCH_CHONG, BRANCH_HAI,
    CHANGSHENG, CHANGSHENG_START,
    HOUR_BRANCH, WUHU_DUN, WUSHU_DUN,
    TIANYI_GUIREN, WENCHANG, YIMA, TAOHUA, HUAGAI, YANGREN, KONGWANG,
    TIANDE, YUEDE,
    // 核心方法
    loadDataTables,
    calcBazi,
    calcWuxingCount,
    judgeDaymasterStrength,
    getXiyong,
    calcTenGods,
    analyzeGeju,
    calcShensha,
    getTenGod,
    getBranchTenGod,
    getChangsheng,
    calcDaYun,
    calcLiuNian,
    calcMetrics,
    generateReport,
    describeDaYun, generateDaYunReport,
    fullAnalysis,
    fullAnalysisSync,
    toChartFormat
  };

  console.log("[KnowledgeBazi v2] 古籍知识库引擎已加载（渊海子平·子平真诠·滴天髓·穷通宝鉴·三命通会）");
})();
