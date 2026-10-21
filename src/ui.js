/* ui.js — classic script: DOM UI, Lenis, GSAP/ScrollTrigger choreography.
   Shares state with the Three.js module through window.__stage. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rtl = root.getAttribute('dir') === 'rtl';

  var stage = window.__stage = {
    state: { x: 2.3, y: 0, z: 0, s: 1, strength: 0.55, rings: 0, speed: 1, opacity: 1 },
    scroll: 0, aux: 0, ready: false, reduce: reduce,
    mobile: innerWidth <= 780 || matchMedia('(hover: none)').matches,
    fail: function () { root.classList.add('no-webgl'); done.stage = true; tryReveal(); }
  };

  /* ---------- basic UI (works without GSAP) ---------- */
  var themeBtn = document.querySelector('.theme-toggle');
  var menuBtn = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');

  function isDark() {
    return root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function syncTheme() { if (themeBtn) themeBtn.setAttribute('aria-pressed', String(isDark())); }
  syncTheme();
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next; syncTheme();
    try { localStorage.setItem('personal-theme', next); } catch (e) {}
  });
  function closeMenu() {
    if (!nav || !menuBtn) return;
    nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false');
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = menuBtn.getAttribute('aria-expanded') !== 'true';
      menuBtn.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuBtn.focus(); }
    });
  }
  document.querySelectorAll('.print-profile').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* project card tilt (mouse only) */
  document.querySelectorAll('.project').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || reduce) return;
      var r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', (px * 8).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (-py * 8).toFixed(2) + 'deg');
      card.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1) + '%');
    });
    card.addEventListener('pointerleave', function () {
      card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
    });
  });

  /* ---------- motion layer ---------- */
  var done = { count: false, stage: false };
  var landing = !!document.querySelector('[data-stage="hero"]');
  var loader = document.getElementById('loader');
  var curtain = document.getElementById('curtain');
  var revealed = false;
  var lenis = null;

  function tryReveal() { if (done.count && done.stage && !revealed) reveal(); }

  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('js', 'is-loading'); root.classList.add('no-loader');
    return;
  }

  try { init(); } catch (err) {
    if (window.console) console.error(err);
    root.classList.add('reveal-all', 'no-loader'); root.classList.remove('is-loading');
    if (loader) loader.hidden = true; if (curtain) curtain.hidden = true;
    if (lenis) lenis.start();
  }

  function init() {
    gsap.registerPlugin(ScrollTrigger);
    root.classList.toggle('reveal-all', reduce);

    /* smooth scroll */
    if (!reduce && window.Lenis) {
      lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      if (root.classList.contains('is-loading')) lenis.stop();
    }

    splitWords(document.querySelectorAll('[data-split]'));

    /* loader counter / curtain entrance */
    var showLoader = root.classList.contains('is-loading') && loader;
    if (showLoader) {
      var countEl = document.getElementById('loader-count');
      var barEl = loader.querySelector('.loader-bar i');
      var o = { v: 0 };
      gsap.to(o, {
        v: 100, duration: 1.5, ease: 'power2.inOut',
        onUpdate: function () { countEl.textContent = Math.round(o.v); barEl.style.transform = 'scaleX(' + o.v / 100 + ')'; },
        onComplete: function () { done.count = true; tryReveal(); }
      });
    } else { done.count = true; }

    window.addEventListener('stage:ready', function () { done.stage = true; tryReveal(); });
    if (stage.ready) done.stage = true;
    setTimeout(function () { if (!stage.ready) stage.fail(); done.stage = true; tryReveal(); }, 5000);
    tryReveal();

    buildScroll();
    bindLinks();

    window.addEventListener('pageshow', function (e) {
      if (e.persisted) { gsap.set(curtain, { scaleY: 0 }); if (lenis) lenis.start(); }
    });
  }

  function reveal() {
    revealed = true;
    try { sessionStorage.setItem('seen', '1'); } catch (e) {}
    var d = reduce ? 0 : 1;
    var finish = function () {
      if (loader) loader.hidden = true;
      root.classList.remove('is-loading');
      if (lenis) lenis.start();
      ScrollTrigger.refresh();
      if (location.hash && lenis) {
        var t = document.querySelector(location.hash);
        if (t) lenis.scrollTo(t, { immediate: true });
      }
    };
    root.classList.add('is-ready');
    var tl = gsap.timeline();
    if (loader && !loader.hidden && root.classList.contains('is-loading')) {
      tl.to(loader, { yPercent: -100, duration: 0.9 * d, ease: 'power4.inOut', onComplete: finish });
    } else {
      tl.to(curtain, { scaleY: 0, duration: 0.8 * d, ease: 'power4.inOut', transformOrigin: 'top', onComplete: finish }, 0);
    }
    var at = reduce ? 0 : (root.classList.contains('is-loading') ? 0.45 : 0.25);
    tl.to('.hero .wi', { yPercent: 0, duration: 1.3 * d, ease: 'power4.out', stagger: 0.07 * d }, at);
    tl.to('[data-intro]', { opacity: 1, y: 0, duration: 1 * d, ease: 'power3.out', stagger: 0.12 * d }, at + 0.35 * d);
    tl.fromTo('.header', { yPercent: -100 }, { yPercent: 0, duration: 0.9 * d, ease: 'power3.out', clearProps: 'transform' }, at);
  }

  /* wrap words of text nodes in masks (keeps <em>, <span>, <br>) */
  function splitWords(list) {
    list.forEach(function (el) {
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(function (node) {
        var parts = node.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
        parts.forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'), wi = document.createElement('span');
          w.className = 'w'; wi.className = 'wi'; wi.textContent = p; w.appendChild(wi); frag.appendChild(w);
        });
        node.parentNode.replaceChild(frag, node);
      });
    });
  }

  /* ---------- scroll choreography ---------- */
  function buildCfg(desk) {
    var dir = rtl ? -1 : 1;
    var d = {
      hero:       { x: 2.3 * dir,  y: 0,    z: 0,    s: 1,   strength: 0.55, rings: 0,   speed: 1,   opacity: 1 },
      about:      { x: 0,          y: 0,    z: -2.5, s: 1.2, strength: 0.25, rings: 0,   speed: 0.6, opacity: 0.5 },
      projects:   { x: 2.9 * dir,  y: 1.5,  z: 0,    s: 0.5, strength: 0.7,  rings: 0,   speed: 1.2, opacity: 0.9 },
      experience: { x: -2.9 * dir, y: -0.3, z: 0,    s: 0.9, strength: 0.4,  rings: 0,   speed: 0.8, opacity: 0.9 },
      services:   { x: 0,          y: 0,    z: -3.5, s: 1.5, strength: 0.2,  rings: 1,   speed: 0.7, opacity: 0.35 },
      journal:    { x: 3 * dir,    y: 1.1,  z: 0,    s: 0.55, strength: 0.3, rings: 0,   speed: 0.8, opacity: 0.6 },
      contact:    { x: 0,          y: 0,    z: 0.5,  s: 1.1, strength: 0.95, rings: 0.6, speed: 2.2, opacity: 1 },
      calm:       { x: 3.1 * dir,  y: 1.7,  z: -1,   s: 0.45, strength: 0.2, rings: 0,   speed: 0.6, opacity: 0.35 }
    };
    if (desk) return d;
    var m = {};
    Object.keys(d).forEach(function (k) {
      var v = d[k];
      m[k] = { x: 0, y: k === 'about' || k === 'services' ? 1.6 : 2.4, z: Math.min(v.z, 0), s: Math.max(0.35, v.s * 0.55),
        strength: v.strength, rings: v.rings, speed: v.speed, opacity: Math.min(v.opacity, 0.5) };
    });
    m.hero = { x: 0, y: 1.9, z: 0, s: 0.8, strength: 0.55, rings: 0, speed: 1, opacity: 1 };
    m.contact = { x: 0, y: 2.2, z: 0, s: 0.7, strength: 0.95, rings: 0.4, speed: 2.2, opacity: 0.8 };
    return m;
  }

  function buildScroll() {
    var bar = document.getElementById('progress');
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (s) { stage.scroll = s.progress; if (bar) bar.style.transform = 'scaleX(' + s.progress + ')'; }
    });

    /* reveals */
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      if (reduce) return;
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: parseFloat(el.dataset.delay) || 0,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    gsap.utils.toArray('[data-clip]').forEach(function (el) {
      if (reduce) return;
      gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.25 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.4, ease: 'power4.out', clearProps: 'clipPath',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    var mm = gsap.matchMedia();
    mm.add({ desk: '(min-width: 781px)', mob: '(max-width: 780px)', rm: '(prefers-reduced-motion: reduce)' }, function (ctx) {
      var desk = ctx.conditions.desk, rm = ctx.conditions.rm;
      var cfg = buildCfg(desk), cleanups = [];
      var links = document.querySelectorAll('.nav a[href*="#"]');

      function go(name) {
        gsap.to(stage.state, Object.assign({ duration: rm ? 0 : 1.7, ease: 'power3.inOut', overwrite: true }, cfg[name]));
        links.forEach(function (a) { a.setAttribute('aria-current', String((a.getAttribute('href').split('#')[1] || '') === name || (name === 'journal' && /#writing$/.test(a.getAttribute('href'))))); });
      }
      gsap.set(stage.state, cfg[landing ? 'hero' : 'calm']);

      gsap.utils.toArray('[data-stage]').forEach(function (sec) {
        var name = sec.dataset.stage, trig = sec;
        if (name === 'projects' && desk && !rm) {
          var viewport = sec.querySelector('.projects-viewport'), track = sec.querySelector('.projects');
          sec.classList.add('h-scroll');
          var dir = rtl ? 1 : -1;
          var dist = function () {
            var pad = parseFloat(getComputedStyle(viewport).paddingInlineStart) || 0;
            return Math.max(0, track.offsetWidth + pad * 2 - viewport.clientWidth);
          };
          var st = gsap.to(track, { x: function () { return dir * dist(); }, ease: 'none',
            scrollTrigger: { trigger: sec, pin: true, start: 'top top', end: function () { return '+=' + dist(); },
              scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
              onUpdate: function (self) { stage.aux = self.progress; } } }).scrollTrigger;
          trig = st.pin.parentNode;
          cleanups.push(function () { sec.classList.remove('h-scroll'); stage.aux = 0; });
        }
        ScrollTrigger.create({ trigger: trig, start: 'top 60%', end: 'bottom 60%',
          onToggle: function (self) { if (self.isActive && cfg[name]) go(name); } });
      });
      return function () { cleanups.forEach(function (f) { f(); }); };
    });
  }

  /* ---------- links: smooth anchors + page transitions ---------- */
  function bindLinks() {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target || a.hasAttribute('download') || a.getAttribute('rel') === 'external') return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (!/^https?:$/.test(url.protocol) || url.origin !== location.origin) return;
      var samePage = url.pathname === location.pathname && url.search === location.search;
      if (samePage && url.hash) {
        var t = document.querySelector(url.hash);
        if (!t) return;
        e.preventDefault(); closeMenu();
        if (lenis) lenis.scrollTo(t, { offset: -10, duration: 1.6 });
        else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
        try { history.replaceState(null, '', url.hash); } catch (err) {}
        return;
      }
      if (samePage && !url.hash) return;
      if (reduce || !curtain) return;
      e.preventDefault(); closeMenu();
      gsap.set(curtain, { transformOrigin: 'bottom' });
      gsap.to(curtain, { scaleY: 1, duration: 0.55, ease: 'power3.inOut', onComplete: function () { location.href = a.href; } });
    });
  }
})();
