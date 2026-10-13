(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const em = (s) => s.split('*').map((p, i) => (i % 2 ? `<em>${p}</em>` : p)).join('');
  const read = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };

  /* motyw */
  const themeBtn = $('#theme');
  themeBtn.addEventListener('click', () => {
    const t = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = t; try { localStorage.setItem('theme', t); } catch (e) {};
  });

  /* język PL / EN */
  const apply = (lang) => {
    const d = window.I18N[lang];
    root.lang = lang;
    document.title = d.doc_title;
    $('meta[name="description"]').content = d.doc_desc;
    $$('[data-i18n]').forEach((el) => { if (d[el.dataset.i18n] != null) el.innerHTML = em(d[el.dataset.i18n]); });
    $$('[data-i18n-list]').forEach((el) => { el.innerHTML = d[el.dataset.i18nList].map((x) => `<li>${x}</li>`).join(''); });
    $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    try { localStorage.setItem('lang', lang); } catch (e) {}
  };
  $$('.lang button').forEach((b) => b.addEventListener('click', () => apply(b.dataset.lang)));
  const saved = read('lang');
  if (saved === 'en' || saved === 'pl') { if (saved !== 'pl') apply(saved); }
  else if (!/^pl/i.test(navigator.language || 'pl')) apply('en');

  /* menu mobilne */
  const nav = $('#nav'), burger = $('#burger');
  burger.addEventListener('click', () => burger.setAttribute('aria-expanded', String(nav.classList.toggle('open'))));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }));

  /* animacje */
  const fmt = (n) => Math.round(n).toLocaleString('pl-PL');
  const counters = $$('[data-count]');
  if (!(window.gsap && window.ScrollTrigger) || reduce) return;
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -64 }); }
    }));
  }

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero .eyebrow', { y: 14, opacity: 0, duration: 0.5 })
    .from('.hero h1', { y: 40, opacity: 0, duration: 0.9 }, '-=0.2')
    .from('.hero .lead', { y: 20, opacity: 0, duration: 0.6 }, '-=0.5')
    .from('.hero .cta > *', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.4');

  $$('[data-reveal]').forEach((el) => gsap.from(el, {
    y: 36, opacity: 0, duration: 0.8, ease: 'power3.out', delay: +(el.dataset.delay || 0),
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
  }));
  $$('[data-speed]').forEach((el) => gsap.to(el, {
    yPercent: +el.dataset.speed * 30, ease: 'none',
    scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
  }));
  counters.forEach((el) => {
    const end = +el.dataset.count, o = { v: 0 };
    el.textContent = '0';
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v); } }) });
  });
})();
