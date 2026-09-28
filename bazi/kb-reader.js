/* ============================================================
 * kb-reader.js · 有朋迅知识库阅读器
 * 将数据驱动的知识库（window.KnowledgeBase）渲染为可交互的
 * 学习课堂：分类筛选 + 玻璃态弹窗阅读 + 上/下篇导航。
 * 纯前端、零依赖、兼容 file:// 协议（不发起任何 fetch）。
 * ============================================================ */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    try {
      var KB = window.KnowledgeBase;
      var bar = document.getElementById("learnBar");
      var grid = document.getElementById("learnGrid");
      var modal = document.getElementById("kbModal");
      if (!KB || !bar || !grid || !modal) return; // 安全降级：不报错

      var cats = KB.CATEGORIES || [];
      var current = { cat: null, idx: -1 }; var opener = null;

      /* ---------- 1. 渲染分类筛选条 ---------- */
      function renderBar() {
        var html = '<button class="learn-chip active" data-filter="all" role="tab">全部</button>';
        cats.forEach(function (c) {
          var n = (KB[c.key] || []).length;
          html += '<button class="learn-chip" data-filter="' + c.key + '" role="tab">' +
                  c.label + ' <span class="chip-n">' + n + '</span></button>';
        });
        bar.innerHTML = html;
        bar.addEventListener("click", function (e) {
          var btn = e.target.closest(".learn-chip");
          if (!btn) return;
          var f = btn.getAttribute("data-filter");
          Array.prototype.forEach.call(bar.children, function (b) {
            b.classList.toggle("active", b === btn);
          });
          renderGrid(f);
        });
      }

      /* ---------- 2. 渲染知识列（数据驱动） ---------- */
      function renderGrid(filter) {
        var cols = cats.filter(function (c) {
          return filter === "all" || c.key === filter;
        });
        var html = "";
        cols.forEach(function (c, ci) {
          var arr = KB[c.key] || [];
          var items = "";
          arr.forEach(function (art, i) {
            items += '<li class="learn-item" data-cat="' + c.key + '" data-idx="' + i + '" tabindex="0" role="button">' +
                     '<span class="li-no">' + String(i + 1).padStart(2, "0") + '</span>' +
                     '<span class="li-t">' + art.title + '</span><span class="li-go">↗</span></li>';
          });
          html += '<div class="learn-col glass kb-col"' + (cols.length > 1 ? ' style="animation-delay:' + (ci * 60) + 'ms"' : '') + '>' +
                  '<h3>' + c.label + ' <span class="col-n">' + arr.length + '</span></h3>' +
                  '<ol class="learn-list">' + items + '</ol></div>';
        });
        grid.innerHTML = html;
        // 入场动画
        requestAnimationFrame(function () {
          Array.prototype.forEach.call(grid.querySelectorAll(".kb-col"), function (el, i) {
            el.classList.add("in");
          });
        });
      }

      /* ---------- 3. 打开弹窗 ---------- */
      function open(cat, idx) {
        var arr = KB[cat];
        if (!arr || !arr[idx]) return;
        if (!modal.classList.contains("open")) opener = document.activeElement;
        current = { cat: cat, idx: idx };
        var art = arr[idx];
        var catLabel = (cats.filter(function (c) { return c.key === cat; })[0] || {}).label || cat;

        document.getElementById("kbCat").textContent = catLabel;
        document.getElementById("kbTitle").textContent = art.title;
        document.getElementById("kbBody").innerHTML = KB.mdToHtml(art.content || "");
        document.getElementById("kbCount").textContent = (idx + 1) + " / " + arr.length;

        var prev = document.getElementById("kbPrev");
        var next = document.getElementById("kbNext");
        prev.style.visibility = idx > 0 ? "visible" : "hidden";
        next.style.visibility = idx < arr.length - 1 ? "visible" : "hidden";

        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        var closeBtn = modal.querySelector(".kb-close");
        document.getElementById("kbBody").scrollTop = 0;
        if (closeBtn) closeBtn.focus();
        window.dispatchEvent(new CustomEvent("ypx:article-opened",{detail:{cat:cat,index:idx}}));
      }

      function close() {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        if (opener && opener.isConnected) opener.focus(); else { var fallback=document.querySelector('.ypx-learning-search input'); if(fallback) fallback.focus(); }
      }

      function nav(dir) {
        var arr = KB[current.cat];
        if (!arr) return;
        var ni = current.idx + dir;
        if (ni < 0 || ni >= arr.length) return;
        open(current.cat, ni);
      }

      window.addEventListener("ypx:open-article", function(e){ open(e.detail.cat,e.detail.index); });
      /* ---------- 4. 事件绑定 ---------- */
      grid.addEventListener("click", function (e) {
        var li = e.target.closest(".learn-item");
        if (li) open(li.getAttribute("data-cat"), parseInt(li.getAttribute("data-idx"), 10));
      });
      grid.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          var li = e.target.closest(".learn-item");
          if (li) { e.preventDefault(); open(li.getAttribute("data-cat"), parseInt(li.getAttribute("data-idx"), 10)); }
        }
      });

      modal.addEventListener("click", function (e) {
        if (e.target.hasAttribute("data-kb-close")) close();
      });
      document.getElementById("kbPrev").addEventListener("click", function () { nav(-1); });
      document.getElementById("kbNext").addEventListener("click", function () { nav(1); });
      document.getElementById("kbPrev").addEventListener("keydown", function (e) { if (e.key === "Enter") nav(-1); });
      document.getElementById("kbNext").addEventListener("keydown", function (e) { if (e.key === "Enter") nav(1); });
      document.addEventListener("keydown", function (e) {
        if (!modal.classList.contains("open")) return;
        if(e.key === "Tab"){
 var controls=Array.prototype.slice.call(modal.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')).filter(function(x){return !x.disabled && x.getClientRects().length && getComputedStyle(x).visibility !== 'hidden';});
 var first=controls[0],last=controls[controls.length-1];
 if(controls.length && (e.shiftKey ? document.activeElement===first || !modal.contains(document.activeElement) : document.activeElement===last || !modal.contains(document.activeElement))){e.preventDefault();(e.shiftKey?last:first).focus();}
 } else if (e.key === "Escape") close();
        else if (e.key === "ArrowLeft") nav(-1);
        else if (e.key === "ArrowRight") nav(1);
      });

      renderBar();
      renderGrid("all");
    } catch (err) {
      // 绝不阻断页面其余功能
      if (window.console) console.warn("[kb-reader] 初始化跳过：", err);
    }
  });
})();
