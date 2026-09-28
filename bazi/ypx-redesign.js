/* ============================================================
   有朋迅 · 视觉重构交互
   仅做 Hero 滚动视差，全部 try/guard 包裹，失败不影响布局。
   ============================================================ */
(function () {
  try {
    document.documentElement.classList.add('ypx-anim');
  } catch (e) {}

  try {
    var hero = document.querySelector('header.hero');
    var core = document.querySelector('.hero-core');
    var inner = document.querySelector('.hero-inner');
    var cards = document.querySelector('.hero-cards');
    if (!hero) return;

    var ticking = false;
    function update() {
      ticking = false;
      var y = window.pageYOffset || 0;
      var h = hero.offsetHeight || window.innerHeight;
      var p = Math.min(y / h, 1);            // 0 → 1 随滚动
      if (core) core.style.transform = 'translateY(' + (y * 0.18) + 'px)';
      if (inner) {
        inner.style.transform = 'translateY(' + (y * 0.28) + 'px)';
        inner.style.opacity = String(Math.max(0, 1 - p * 1.25));
      }
      if (cards) {
        cards.style.transform = 'translateY(' + (y * 0.12) + 'px)';
        cards.style.opacity = String(Math.max(0, 1 - p * 1.1));
      }
    }
    function onScroll() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  } catch (e) {}
})();
