/* Les illes de la Nicole · Lógica de la maqueta (Fase A).
   Sin guardado ni progresión: eso corresponde a la Fase B. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const SILENCI = params.has('silenci');
  const SENSE_DEMO = params.has('sensedemo');
  const espera = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- Cantidades: cada manzana está en un único lugar ---------- */
  const PLACES = {
    cistella: [[24, 44], [50, 42], [76, 44], [37, 75], [63, 75]],
    safata:   [[24, 44], [50, 42], [76, 44], [37, 75], [63, 75]],
    arbre:    [[31.25, 33.3], [50, 33.3], [68.75, 33.3], [40.6, 58.3], [59.4, 58.3]],
    terra:    [[50, 58]],
  };
  let pomes = [];
  const compte = z => pomes.filter(p => p.zona === z).length;
  const placaLliure = z => PLACES[z].findIndex((_, i) => !pomes.some(p => p.zona === z && p.placa === i));
  function transfereix(poma, zona) {
    if (poma.zona === zona) return false;
    const placa = placaLliure(zona);
    if (placa < 0) return false;
    poma.zona = zona; poma.placa = placa;
    return true;
  }

  /* ---------- Guion de la maqueta ---------- */
  const MOMENTS = {
    port: { rotul: 'Preparem el berenar?', veu: ['port'], ajuda: 'a-port' },
    recull: {
      rotul: 'Posa tres pomes a la cistella', veu: ['recull'], ajuda: 'a-recull',
      origen: 'arbre', desti: 'cistella', inicial: { arbre: 5 },
      objectiu: 3, comprova: () => compte('cistella') === 3,
      ok: 'ok-recull', seguent: 'afegeix', demo: 'demo-cistella', primeraDemo: true,
    },
    afegeix: {
      rotul: "N'hem trobat una més", veu: ['afegeix'], ajuda: 'a-afegeix',
      origen: 'terra', desti: 'cistella', inicial: { cistella: 3, terra: 1 },
      objectiu: 4, comprova: () => compte('cistella') === 4,
      ok: 'ok-afegeix', seguent: 'dona', demo: 'demo-cistella',
      equacioOk: [3, '+', 1, '=', 4],
    },
    dona: {
      rotul: 'Dona dues pomes al mariner', veu: ['dona'], ajuda: 'a-dona',
      origen: 'cistella', desti: 'safata', inicial: { cistella: 4 },
      objectiu: 2, comprova: () => compte('safata') === 2,
      ok: 'ok-dona', seguent: 'queden', demo: 'demo-safata',
      // El resultado no se muestra aún: lo descubrirá en el paso siguiente.
      equacioOk: [4, '−', 2],
    },
    queden: {
      rotul: 'Quantes pomes queden a la cistella?', veu: ['queden'], ajuda: 'a-queden',
      inicial: { cistella: 2, safata: 2 }, targetes: [4, 2], correcta: 2,
      desti: 'cistella', ok: 'ok-queden', seguent: 'port',
      equacioInicial: [4, '−', 2], equacioOk: [4, '−', 2, '=', 2],
    },
  };

  /* ---------- Audio: un solo elemento, nunca se solapan locuciones ---------- */
  const audio = new Audio();
  audio.preload = 'auto';
  let tornVeu = 0, activat = false;
  const altaveu = $('#altaveu');
  function marcaFallida() {
    altaveu.classList.add('sense-veu');
    console.warn('[illes] Audio no disponible: se mantiene la demostración visual y el rótulo.');
  }
  function clip(nom, torn) {
    if (SILENCI) return espera(900);
    return new Promise(resol => {
      if (torn !== tornVeu) return resol();
      let fet = false;
      const fi = () => { if (fet) return; fet = true; audio.onended = audio.onerror = null; clearTimeout(t); resol(); };
      const t = setTimeout(fi, 9000);
      audio.onended = fi;
      audio.onerror = () => { marcaFallida(); fi(); };
      audio.src = 'audio/' + nom + '.m4a';
      const p = audio.play();
      if (p) p.catch(e => {
        if (e.name === 'NotAllowedError') { if (activat) marcaFallida(); fi(); }
        else if (e.name !== 'AbortError') { marcaFallida(); fi(); }
      });
    });
  }
  function calla() { tornVeu++; audio.pause(); altaveu.classList.remove('parlant'); }
  async function parla(noms) {
    calla();
    const torn = tornVeu;
    altaveu.classList.add('parlant');
    for (const n of noms) { if (torn !== tornVeu) return false; await clip(n, torn); }
    if (torn === tornVeu) altaveu.classList.remove('parlant');
    return torn === tornVeu;
  }
  // La primera interacción activa el audio; no dependemos de reproducción automática.
  document.addEventListener('pointerdown', () => {
    if (activat || SILENCI) return;
    activat = true; audio.src = 'audio/silenci.m4a';
    const p = audio.play(); if (p) p.catch(() => {});
    setTimeout(() => { if (!document.hidden && audio.src.endsWith('silenci.m4a')) parla(MOMENTS[moment].veu); }, 250);
  }, { capture: true, once: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) calla(); else colocaTot(); });

  /* ---------- Referencias ---------- */
  const capa = $('#capa-pomes'), port = $('#port'), berenar = $('#berenar');
  const confirma = $('#confirma'), rotul = $('#rotul'), equacio = $('#equacio'), targetes = $('#targetes');
  let moment = 'port', nivell = 0, ocupat = false, seleccio = null, triada = null, demoVista = false, tornDemo = 0;

  /* ---------- Colocación ---------- */
  const zonaEl = z => $(`.zona[data-zona="${z}"]`);
  const ancora = z => $('.ancora', zonaEl(z));
  function puntPlaca(z, i) {
    const a = ancora(z).getBoundingClientRect();
    const [px, py] = PLACES[z][i];
    return { x: a.left + a.width * px / 100, y: a.top + a.height * py / 100 };
  }
  function situa(el, x, y) {
    const w = el.offsetWidth, h = el.offsetHeight;
    el.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px)`;
  }
  function colocaPoma(p) { const c = puntPlaca(p.zona, p.placa); situa(p.el, c.x, c.y); }
  function colocaTot(sense = true) {
    if (moment === 'port') return;
    pomes.forEach(p => {
      if (sense) p.el.classList.add('sense-trans');
      colocaPoma(p);
    });
    $$('.forat', capa).forEach(f => { const c = puntPlaca(f.dataset.z, +f.dataset.i); situa(f, c.x, c.y); });
    if (sense) requestAnimationFrame(() => requestAnimationFrame(() => pomes.forEach(p => p.el.classList.remove('sense-trans'))));
  }
  new ResizeObserver(() => colocaTot()).observe(document.documentElement);
  window.addEventListener('orientationchange', () => setTimeout(colocaTot, 250));

  /* ---------- Entradas: arrastre y toque ---------- */
  function creaPoma(zona, placa, id) {
    const el = document.createElement('button');
    el.className = 'poma sense-trans'; el.setAttribute('aria-label', 'Poma');
    el.innerHTML = '<svg viewBox="0 0 100 100"><use href="#poma"/></svg>';
    const p = { id, zona, placa, el };
    el.addEventListener('pointerdown', e => inicia(e, p));
    capa.appendChild(el);
    return p;
  }
  const altraZona = p => { const m = MOMENTS[moment]; return p.zona === m.desti ? m.origen : m.desti; };
  let gest = null;
  function inicia(e, p) {
    if (ocupat || !MOMENTS[moment].origen) return;
    // Si otro dedo ya tocaba una manzana sin moverla, el nuevo toque toma el relevo.
    if (gest) { if (gest.mogut) return; colocaPoma(gest.p); gest = null; }
    cancelaDemo(); netejaAjuda();
    gest = { id: e.pointerId, p, x: e.clientX, y: e.clientY, mogut: false };
    try { p.el.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
  }
  window.addEventListener('pointermove', e => {
    if (!gest || e.pointerId !== gest.id) return;
    if (!gest.mogut && Math.hypot(e.clientX - gest.x, e.clientY - gest.y) < 10) return;
    if (!gest.mogut) { gest.mogut = true; desselecciona(); gest.p.el.classList.add('arrossegada'); zonaEl(altraZona(gest.p)).classList.add('destacada'); }
    // La manzana se eleva sobre el dedo para que se vea mientras se arrastra.
    situa(gest.p.el, e.clientX, e.clientY - gest.p.el.offsetHeight * .4);
  });
  function zonaSota(x, y, z) {
    const r = ancora(z).getBoundingClientRect(), m = 44;
    return x >= r.left - m && x <= r.right + m && y >= r.top - m && y <= r.bottom + m;
  }
  function acaba(e, cancel) {
    if (!gest || e.pointerId !== gest.id) return;
    const { p, mogut } = gest; gest = null;
    p.el.classList.remove('arrossegada');
    $$('.zona.destacada').forEach(z => z.classList.remove('destacada'));
    if (!mogut) { if (!cancel) tocaPoma(p); return; }
    const z = altraZona(p);
    // Soltar fuera devuelve la manzana sin contar ningún error.
    if (!cancel && zonaSota(e.clientX, e.clientY, z) && transfereix(p, z)) moviment();
    colocaPoma(p);
  }
  window.addEventListener('pointerup', e => acaba(e, false));
  window.addEventListener('pointercancel', e => acaba(e, true));
  function desselecciona() {
    if (seleccio) seleccio.el.classList.remove('seleccionada');
    seleccio = null;
    $$('.zona.destacada').forEach(z => z.classList.remove('destacada'));
  }
  function tocaPoma(p) {
    // Tocar una manzana que ya está en el destino equivale a tocar el destino.
    if (seleccio && seleccio !== p && p.zona === altraZona(seleccio)) {
      const s = seleccio, z = p.zona; desselecciona();
      if (transfereix(s, z)) moviment();
      colocaPoma(s); return;
    }
    const era = seleccio === p; desselecciona();
    if (era) return;
    seleccio = p; p.el.classList.add('seleccionada');
    zonaEl(altraZona(p)).classList.add('destacada');
  }
  // Tocar objeto y luego destino. Tocar el fondo solo deselecciona.
  $$('.zona').forEach(z => z.addEventListener('click', () => {
    if (!seleccio || ocupat) return;
    const dest = z.dataset.zona, p = seleccio;
    if (dest !== altraZona(p)) return;
    desselecciona();
    if (transfereix(p, dest)) moviment();
    colocaPoma(p);
  }));
  $('.taulell').addEventListener('click', e => { if (e.target === e.currentTarget) desselecciona(); });
  function moviment() { netejaAjuda(); confirma.hidden = false; }

  /* ---------- Ayuda: sin castigo ni pérdida de recompensa ---------- */
  function netejaAjuda() {
    $$('.forat', capa).forEach(f => f.remove());
    $$('.insignia').forEach(i => i.remove());
    if (!seleccio) $$('.zona.destacada').forEach(z => z.classList.remove('destacada'));
  }
  function plantilla(z, n) {
    for (let i = 0; i < n; i++) {
      const f = document.createElement('div');
      f.className = 'forat'; f.dataset.z = z; f.dataset.i = i;
      capa.prepend(f);
      const c = puntPlaca(z, i); situa(f, c.x, c.y);
    }
  }
  async function compta(els) {
    const torn = ++tornDemo;
    await parla(['comptem']);
    for (let i = 0; i < els.length; i++) {
      if (torn !== tornDemo) return;
      const b = document.createElement('span'); b.className = 'insignia'; b.textContent = i + 1;
      els[i].appendChild(b);
      await parla(['n' + (i + 1)]);
      await espera(150);
    }
  }
  async function ajuda() {
    if (ocupat) return;
    const m = MOMENTS[moment];
    nivell = Math.min(nivell + 1, 3);
    cancelaDemo(); desselecciona(); netejaAjuda();
    if (moment === 'port') {
      const c = $('#port-cistella'); c.classList.remove('resalta'); void c.offsetWidth; c.classList.add('resalta');
      parla([m.ajuda]); return;
    }
    if (nivell === 1) {
      zonaEl(m.desti).classList.add('destacada');
      if (m.objectiu && m.desti) plantilla(m.desti, m.objectiu);
      parla([m.ajuda]);
    } else if (nivell === 2) {
      if (m.objectiu) plantilla(m.desti, m.objectiu);
      let obj = pomes.filter(p => p.zona === m.desti).map(p => p.el);
      if (!obj.length) obj = $$('.forat', capa).reverse();
      compta(obj);
    } else if (m.origen) {
      demostra();
    } else {
      zonaEl(m.desti).classList.add('destacada');
      compta(pomes.filter(p => p.zona === m.desti).map(p => p.el));
    }
  }

  /* ---------- Demostración: fantasma que no altera las cantidades ---------- */
  function cancelaDemo() { tornDemo++; $$('.fantasma', capa).forEach(f => f.remove()); }
  async function demostra() {
    const m = MOMENTS[moment]; if (!m.demo) return;
    const torn = ++tornDemo;
    const p = pomes.find(x => x.zona === m.origen); if (!p) return;
    const lliure = placaLliure(m.desti); if (lliure < 0) return;
    const r = p.el.getBoundingClientRect();
    const a = { x: r.left + r.width / 2, y: r.top + r.height / 2 }, b = puntPlaca(m.desti, lliure);
    const g = document.createElement('div'); g.className = 'fantasma';
    g.innerHTML = '<svg viewBox="0 0 100 100"><use href="#poma"/></svg><svg class="pota" viewBox="0 0 60 60"><use href="#i-pota"/></svg>';
    capa.appendChild(g); situa(g, a.x, a.y);
    parla([m.demo]);
    await espera(500); if (torn !== tornDemo) return;
    situa(g, b.x, b.y);
    await espera(2000); if (torn !== tornDemo) return;
    situa(g, a.x, a.y);
    await espera(1400); if (torn !== tornDemo) return;
    g.remove();
  }

  /* ---------- Ecuación ---------- */
  function pintaEquacio(t) {
    if (!t) { equacio.innerHTML = ''; equacio.classList.add('buida'); return; }
    equacio.classList.remove('buida');
    equacio.innerHTML = t.map(x => typeof x === 'number'
      ? `<span class="terme">${x}<span class="punts">${'<i></i>'.repeat(x)}</span></span>`
      : `<span>${x}</span>`).join('');
  }

  /* ---------- Tarjetas ---------- */
  function pintaTargetes(vals) {
    targetes.innerHTML = '';
    triada = null;
    (vals || []).forEach(v => {
      const b = document.createElement('button'); b.className = 'targeta'; b.setAttribute('aria-label', String(v));
      b.innerHTML = `<span class="grup">${'<svg viewBox="0 0 100 100"><use href="#poma"/></svg>'.repeat(v)}</span><span class="xifra">${v}</span><svg class="marca" viewBox="0 0 48 48"><use href="#i-check"/></svg>`;
      b.addEventListener('click', () => {
        if (ocupat) return;
        $$('.targeta').forEach(t => t.classList.remove('triada'));
        b.classList.add('triada'); triada = v; confirma.hidden = false; netejaAjuda();
      });
      targetes.appendChild(b);
    });
  }

  /* ---------- Confirmación ---------- */
  async function confirmar() {
    if (ocupat) return;
    const m = MOMENTS[moment];
    const be = m.targetes ? triada === m.correcta : m.comprova();
    if (!be) { ajuda(); return; }
    ocupat = true; confirma.hidden = true; cancelaDemo(); desselecciona(); netejaAjuda();
    if (m.equacioOk) pintaEquacio(m.equacioOk);
    await parla([m.ok]);
    await espera(SILENCI ? 900 : 500);
    ocupat = false;
    if (moment === Object.keys(MOMENTS).find(k => MOMENTS[k] === m)) entra(m.seguent, { final: m.seguent === 'port' });
  }

  /* ---------- Cambio de escena ---------- */
  function entra(nom, op = {}) {
    if (!MOMENTS[nom]) nom = 'port';
    const m = MOMENTS[nom];
    moment = nom; nivell = 0; ocupat = false; triada = null; gest = null;
    cancelaDemo(); seleccio = null; netejaAjuda();
    calla();
    document.body.dataset.moment = nom;
    rotul.textContent = op.final ? 'El berenar està a punt' : m.rotul;
    port.hidden = nom !== 'port'; berenar.hidden = nom === 'port';
    capa.innerHTML = ''; pomes = [];
    confirma.hidden = true;
    if (nom === 'port') { if (!op.final) parla(m.veu); return; }
    let id = 0;
    Object.entries(m.inicial).forEach(([z, n]) => { for (let i = 0; i < n; i++) pomes.push(creaPoma(z, i, id++)); });
    pintaEquacio(m.equacioInicial); pintaTargetes(m.targetes);
    requestAnimationFrame(() => {
      colocaTot();
      parla(m.veu).then(ok => {
        if (ok && m.primeraDemo && !demoVista && !SENSE_DEMO && !seleccio && !gest && moment === nom) { demoVista = true; demostra(); }
      });
    });
  }

  /* ---------- Controles ---------- */
  $('#port-cistella').addEventListener('click', () => entra('recull'));
  $('#port-guineu').addEventListener('click', ajuda);
  $('#boto-ajuda').addEventListener('click', ajuda);
  altaveu.addEventListener('click', () => parla(MOMENTS[moment].veu));
  $('#casa').addEventListener('click', () => entra('port'));
  confirma.addEventListener('click', confirmar);
  // Táctil: sin zoom con dos dedos ni doble toque, sin menú contextual.
  ['gesturestart', 'gesturechange', 'dblclick', 'contextmenu'].forEach(t => document.addEventListener(t, e => e.preventDefault(), { passive: false }));
  window.addEventListener('hashchange', () => entra(location.hash.slice(1) || 'port'));

  // Solo para verificación automática de la maqueta.
  window.__illes = { pomes: () => pomes.map(p => ({ id: p.id, zona: p.zona, placa: p.placa })), moment: () => moment };
  entra(location.hash.slice(1) || 'port');
})();
