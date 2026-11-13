/* OneProtocol — web pública. Sin dependencias. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = 'IntersectionObserver' in window;
  const fmt = n => Math.round(n).toLocaleString('es-EC');

  /* Navegación: fondo al bajar, menú en el teléfono, barra de progreso */
  const nav = $('#nav'), bar = $('#progress'), menu = $('#nav-menu');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    nav.classList.toggle('is-scrolled', scrollY > 20);
    const h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  const setMenu = open => { nav.classList.toggle('is-open', open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); };
  menu.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('#nav-links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* Sección activa en el menú */
  const links = $$('#nav-links a[href^="#"]');
  if (io && links.length) {
    const ao = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(a => { const t = $(a.getAttribute('href')); if (t) ao.observe(t); });
  }

  /* Aparición al hacer scroll */
  if (io && !reduced) {
    const ro = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); ro.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.rv').forEach(el => ro.observe(el));
  } else $$('.rv').forEach(el => el.classList.add('is-in'));

  /* Contadores */
  const count = el => {
    const to = Number(el.dataset.count), suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1400;
    const step = t => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(to * e) + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const counters = $$('[data-count]');
  if (io && !reduced) {
    const co = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { count(e.target); co.unobserve(e.target); } }), { threshold: .6 });
    counters.forEach(el => { el.textContent = '0' + (el.dataset.suffix || ''); co.observe(el); });
  }

  /* Historia del cliente: el teléfono cambia de pantalla con cada paso */
  const steps = $$('.story-step'), shots = $$('#story-screen img'), tag = $('#story-tag');
  const TAGS = { 1: '01 · Su semana', 2: '02 · Cuerpo 3D', 3: '03 · Arranque con tu marca', 4: '04 · Reproductor' };
  const showStep = n => {
    steps.forEach(s => s.classList.toggle('is-on', s.dataset.step === n));
    shots.forEach(i => i.classList.toggle('is-on', i.dataset.shot === n));
    if (tag) tag.textContent = TAGS[n];
  };
  if (io && steps.length) {
    const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) showStep(e.target.dataset.step); }), { rootMargin: matchMedia('(max-width: 600px)').matches ? '-62% 0px -30% 0px' : '-45% 0px -45% 0px' });
    steps.forEach(s => so.observe(s));
  }

  /* Tu marca: tres coaches de demostración tiñen la app y su tarjeta */
  const BRANDS = {
    atlas: { name: 'Atlas Coaching', tag: 'Fuerza con método', ini: 'AC', card: 'assets/shots/card-atlas.webp' },
    nova: { name: 'Nova Performance', tag: 'Rendimiento sin atajos', ini: 'NP', card: 'assets/shots/card-nova.webp' },
    kora: { name: 'Kora Fit', tag: 'Tu mejor versión', ini: 'KF', card: 'assets/shots/card-kora.webp' }
  };
  const brand = $('#marca');
  if (brand) {
    const order = Object.keys(BRANDS); let cur = 'atlas', timer = null, visible = false, touched = false;
    const logo = $('#bm-logo'), card = $('#bm-card');
    order.forEach(k => { const im = new Image(); im.src = BRANDS[k].card; });
    const set = k => {
      if (k === cur) return; cur = k; const b = BRANDS[k];
      brand.dataset.brand = k;
      $$('.brand-pick button', brand).forEach(x => x.classList.toggle('is-on', x.dataset.b === k));
      $('#bm-name').textContent = b.name; $('#bm-tag').textContent = b.tag; $('#bm-coach').textContent = 'Mensaje de ' + b.name.split(' ')[0];
      logo.textContent = b.ini; logo.classList.add('pop'); setTimeout(() => logo.classList.remove('pop'), 450);
      card.classList.add('is-fading'); setTimeout(() => { card.src = b.card; card.classList.remove('is-fading'); }, reduced ? 0 : 300);
    };
    const auto = () => { clearInterval(timer); if (!visible || touched || reduced) return; timer = setInterval(() => set(order[(order.indexOf(cur) + 1) % order.length]), 3600); };
    $$('.brand-pick button', brand).forEach(x => x.addEventListener('click', () => { touched = true; clearInterval(timer); set(x.dataset.b); }));
    if (io) new IntersectionObserver(es => { visible = es[0].isIntersecting; auto(); }, { threshold: .4 }).observe(brand);
  }

  /* Mazo de tarjetas (mismo comportamiento que la web de IronBase) */
  const deck = $('#share-deck');
  if (deck) {
    deck.tabIndex = 0;
    const cards = $$('.deck-card', deck), label = $('#share-deck-label'), dots = $$('.share-deck-dots i', deck);
    const RESUME = 12000, EVERY = 3800;
    let order = cards.map((_, i) => i), timer = null, wait = null, visible = false, drag = null, busy = false;
    const paint = () => {
      order.forEach((ci, pos) => { const c = cards[ci]; c.style.setProperty('--pos', pos); c.style.zIndex = String(cards.length - pos); c.classList.toggle('is-front', pos === 0); c.setAttribute('aria-hidden', String(pos !== 0)); });
      const front = cards[order[0]]; if (label) label.textContent = front.dataset.label || '';
      dots.forEach((d, i) => d.classList.toggle('on', i === order[0]));
    };
    const settle = el => { el.style.removeProperty('--dx'); el.style.removeProperty('--rot'); };
    const go = (dir = 1) => {
      if (busy) return; busy = true;
      const done = () => setTimeout(() => { busy = false; }, 60);
      if (dir > 0) {
        const front = cards[order[0]];
        front.style.setProperty('--fly', '-1'); front.classList.add('is-flying');
        setTimeout(() => { front.classList.remove('is-flying'); settle(front); order.push(order.shift()); paint(); done(); }, reduced ? 0 : 340);
      } else {
        const prev = cards[order[order.length - 1]];
        settle(cards[order[0]]);
        prev.classList.add('is-instant', 'is-flying'); prev.style.setProperty('--fly', '-1');
        order.unshift(order.pop()); paint();
        void prev.offsetWidth;
        prev.classList.remove('is-instant', 'is-flying');
        setTimeout(done, reduced ? 0 : 220);
      }
    };
    const stop = () => { clearInterval(timer); clearTimeout(wait); timer = wait = null; };
    const auto = (delay = 0) => {
      stop(); if (!visible || reduced) return;
      const run = () => { timer = setInterval(() => { if (!drag) go(1); }, EVERY); };
      if (delay) wait = setTimeout(() => { go(1); run(); }, delay); else run();
    };
    deck.addEventListener('pointerdown', e => {
      const front = cards[order[0]]; if (!front.contains(e.target) || busy) return;
      drag = { x: e.clientX, dx: 0, moved: false, id: e.pointerId, el: front };
      front.setPointerCapture(e.pointerId); front.classList.add('is-drag'); stop();
    });
    deck.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.x; if (Math.abs(drag.dx) > 6) drag.moved = true;
      drag.el.style.setProperty('--dx', drag.dx + 'px'); drag.el.style.setProperty('--rot', (drag.dx / 18) + 'deg');
    });
    const end = e => {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      const d = drag; drag = null; d.el.classList.remove('is-drag');
      if (!d.moved || d.dx < -60) go(1); else if (d.dx > 60) go(-1); else settle(d.el);
      auto(RESUME);
    };
    deck.addEventListener('pointerup', end); deck.addEventListener('pointercancel', end);
    deck.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); go(1); auto(RESUME); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); auto(RESUME); }
    });
    deck.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') stop(); });
    deck.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') auto(); });
    if (io) new IntersectionObserver(es => { visible = es[0].isIntersecting; auto(); }, { threshold: .35 }).observe(deck);
    paint();
  }

  /* Escenas: el builder y el panel se animan al verse y se repiten mientras siguen a la vista */
  const scene = (el, every) => {
    if (!el) return;
    if (reduced || !io) { el.classList.add('play'); return; }
    let timer = null;
    const replay = () => { el.classList.remove('play'); void el.offsetWidth; el.classList.add('play'); };
    new IntersectionObserver(es => {
      if (es[0].isIntersecting) { replay(); clearInterval(timer); if (every) timer = setInterval(replay, every); }
      else clearInterval(timer);
    }, { threshold: .45 }).observe(el);
  };
  scene($('#rb'), 9000); scene($('#db'), 0); scene($('#dash'), 0);

  /* Brillo que sigue al puntero en las tarjetas de los builders */
  $$('.build-card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* Calculadora de referidos: 25% del primer pago */
  const n = $('#calc-n'), nOut = $('#calc-n-out'), total = $('#calc-total'), planBtns = $$('.calc-plans button');
  if (n) {
    let per = 7.5;
    const money = v => '$' + (Math.round(v * 100) / 100).toLocaleString('es-EC', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
    const calc = () => { nOut.textContent = n.value; total.textContent = money(Number(n.value) * per); };
    n.addEventListener('input', calc);
    planBtns.forEach(b => b.addEventListener('click', () => {
      per = Number(b.dataset.v);
      planBtns.forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', String(on)); });
      calc();
    }));
    calc();
  }
})();
