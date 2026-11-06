import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { veu, espera } from '../audio/veu';
import { placaLliure, type Objecte, type ZonaId } from '../logica/quantitats';
import { N_PASSOS, aplica, confirma, pasActual, type EstatMissio, type Pas, type Terme } from '../logica/missio';
import { Dibuix, Poma } from '../art/Dibuix';
import type { Api } from '../App';

/** Posición de cada plaza dentro del dibujo de la zona, en %. */
const PLACES: Record<ZonaId, [number, number][]> = {
  cistella: [[24, 44], [50, 42], [76, 44], [37, 75], [63, 75]],
  safata: [[24, 44], [50, 42], [76, 44], [37, 75], [63, 75]],
  arbre: [[31.25, 33.3], [50, 33.3], [68.75, 33.3], [40.6, 58.3], [59.4, 58.3]],
  terra: [[50, 58], [27, 64], [73, 64]],
};

interface Rect { x: number; y: number; w: number; h: number }
interface Punt { x: number; y: number }
interface Visual {
  destacada: ZonaId | null;
  forats: { zona: ZonaId; n: number } | null;
  insignies: Record<string, number>;
  fantasma: Punt | null;
  resalta: number | string | 'totes' | null;
}
const BUIT: Visual = { destacada: null, forats: null, insignies: {}, fantasma: null, resalta: null };

interface Props { missio: EstatMissio; tutorialVist: boolean; sensedemo: boolean; api: Api }

export default function Berenar({ missio, tutorialVist, sensedemo, api }: Props) {
  const p = pasActual(missio) as Pas;
  const arrel = useRef<HTMLElement>(null);
  const ancores = useRef<Partial<Record<ZonaId, HTMLDivElement | null>>>({});
  const sonda = useRef<HTMLDivElement>(null);
  const missioRef = useRef(missio);
  missioRef.current = missio;
  const [geo, setGeo] = useState<{ rects: Partial<Record<ZonaId, Rect>>; poma: number } | null>(null);
  const [visual, setVisual] = useState<Visual>(BUIT);
  const [seleccio, setSeleccio] = useState<number | null>(null);
  const [arrossega, setArrossega] = useState<ZonaId | null>(null);
  const torn = useRef(0);
  const ocupat = useRef(false);
  const muntat = useRef(true);
  useEffect(() => () => { muntat.current = false; }, []);

  /* ---------- Medidas: las posiciones se derivan del estado y de la geometría ---------- */
  const mesura = useCallback(() => {
    const a = arrel.current?.getBoundingClientRect();
    if (!a) return;
    const rects: Partial<Record<ZonaId, Rect>> = {};
    for (const [z, el] of Object.entries(ancores.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      rects[z as ZonaId] = { x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height };
    }
    setGeo({ rects, poma: sonda.current?.offsetWidth ?? 60 });
  }, []);
  useLayoutEffect(mesura, [missio.pas, missio.fase, mesura]);
  useEffect(() => {
    const ro = new ResizeObserver(() => mesura());
    if (arrel.current) ro.observe(arrel.current);
    const o = () => setTimeout(mesura, 250);
    window.addEventListener('orientationchange', o);
    return () => { ro.disconnect(); window.removeEventListener('orientationchange', o); };
  }, [mesura]);

  const centre = useCallback((z: ZonaId, i: number): Punt | null => {
    const r = geo?.rects[z];
    if (!r) return null;
    const [px, py] = PLACES[z][i];
    return { x: r.x + (r.w * px) / 100, y: r.y + (r.h * py) / 100 };
  }, [geo]);
  const transf = (c: Punt | null) => (c && geo ? `translate(${c.x - geo.poma / 2}px, ${c.y - geo.poma / 2}px)` : 'translate(-200px,-200px)');

  /* ---------- Ayuda, conteo y demostración ---------- */
  const interromp = useCallback(() => {
    torn.current++;
    setVisual(v => ({ ...v, fantasma: null }));
  }, []);
  const netejaAjuda = useCallback(() => setVisual(BUIT), []);

  const compta = useCallback(async (t: number, claus: string[]) => {
    await veu.parla(['comptem']);
    for (let i = 0; i < claus.length; i++) {
      if (t !== torn.current) return;
      setVisual(v => ({ ...v, insignies: { ...v.insignies, [claus[i]]: i + 1 } }));
      await veu.parla([`n${i + 1}`]);
      await espera(150);
    }
  }, []);

  const objectesA = (e: EstatMissio, z: ZonaId) => e.objectes.filter(o => o.zona === z).sort((a, b) => a.placa - b.placa);

  const demostra = useCallback(async (t: number) => {
    const e = missioRef.current;
    const q = pasActual(e);
    if (!q || q.tipus !== 'moure') return;
    const o = objectesA(e, q.origen)[0];
    const lliure = placaLliure(e.objectes, q.desti);
    const a = o && centre(o.zona, o.placa), b = lliure >= 0 && centre(q.desti, lliure);
    if (!a || !b) return;
    setVisual(v => ({ ...v, fantasma: a }));
    veu.parla([q.demo]);
    await espera(500); if (t !== torn.current) return;
    setVisual(v => ({ ...v, fantasma: b }));
    await espera(2000); if (t !== torn.current) return;
    setVisual(v => ({ ...v, fantasma: a }));
    await espera(1400); if (t !== torn.current) return;
    setVisual(v => ({ ...v, fantasma: null }));
  }, [centre]);

  const executaAjuda = useCallback((e: EstatMissio) => {
    const q = pasActual(e);
    if (!q) return;
    const t = ++torn.current;
    setSeleccio(null);
    const n = e.nivellAjuda;
    if (q.tipus === 'moure') {
      const forats = { zona: q.desti, n: q.objectiu };
      if (n === 1) { setVisual({ ...BUIT, destacada: q.desti, forats }); veu.parla([q.ajuda]); }
      else if (n === 2) {
        setVisual({ ...BUIT, forats });
        const objs = objectesA(e, q.desti);
        compta(t, objs.length ? objs.map(o => `o${o.id}`) : Array.from({ length: q.objectiu }, (_, i) => `f${i}`));
      } else { setVisual(BUIT); demostra(t); }
    } else if (q.tipus === 'triar') {
      const claus = objectesA(e, q.zonaComptar).map(o => `o${o.id}`);
      setVisual({ ...BUIT, destacada: q.zonaComptar });
      if (n === 1) veu.parla([q.ajuda]);
      else compta(t, claus).then(() => { if (n >= 3 && t === torn.current) setVisual(v => ({ ...v, resalta: q.correcta })); });
    } else {
      setVisual({ ...BUIT, resalta: 'totes' });
      veu.parla([q.ajuda]);
    }
  }, [compta, demostra]);

  const ajuda = () => {
    if (ocupat.current || missio.fase !== 'joc') return;
    const e = aplica(missioRef.current, { t: 'ajuda' });
    api.posaMissio(e);
    executaAjuda(e);
  };

  /* ---------- Entrada en cada paso ---------- */
  useEffect(() => {
    if (missio.fase !== 'joc') return;
    setSeleccio(null);
    setVisual(BUIT);
    const t = ++torn.current;
    veu.instrueix([p.veu]).then(ok => {
      if (ok && t === torn.current && missio.pas === 0 && !tutorialVist && !sensedemo && muntat.current) {
        api.marcaTutorial();
        demostra(t);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missio.pas]);

  /* ---------- Confirmación ---------- */
  const confirmar = async () => {
    if (ocupat.current) return;
    const m = missioRef.current;
    const r = confirma(m);
    if (r.estat === m) return;
    if (!r.correcte) { api.posaMissio(r.estat); executaAjuda(r.estat); return; }
    ocupat.current = true;
    interromp();
    setSeleccio(null);
    netejaAjuda();
    api.posaMissio(r.estat);
    api.registra(r.intent!);
    await veu.parla([p.ok]);
    await espera(veu.silenci ? 500 : 400);
    ocupat.current = false;
    if (!muntat.current) return;
    const ara = missioRef.current;
    if (ara.pas !== m.pas || ara.fase !== 'exit') return;
    if (m.pas === N_PASSOS - 1) api.acaba(r.estat.banderi);
    else api.posaMissio(aplica(ara, { t: 'seguent' }));
  };

  /* ---------- Movimiento: arrastre o toque objeto + toque destino ---------- */
  const altraZona = (o: Objecte): ZonaId | null => {
    if (p.tipus !== 'moure') return null;
    return o.zona === p.desti ? p.origen : p.desti;
  };
  const mou = (id: number, zona: ZonaId): boolean => {
    const m = missioRef.current;
    const n = aplica(m, { t: 'moure', id, zona });
    if (n === m) return false;
    api.posaMissio(n);
    netejaAjuda();
    return true;
  };
  const tocaPoma = (o: Objecte) => {
    const sel = seleccio !== null ? missioRef.current.objectes.find(x => x.id === seleccio) : undefined;
    // Tocar una manzana que ya está en el destino equivale a tocar el destino.
    if (sel && sel.id !== o.id && o.zona === altraZona(sel)) { setSeleccio(null); mou(sel.id, o.zona); return; }
    setSeleccio(seleccio === o.id ? null : o.id);
  };
  const tocaZona = (z: ZonaId) => {
    if (seleccio === null || ocupat.current) return;
    const sel = missioRef.current.objectes.find(x => x.id === seleccio);
    if (!sel || altraZona(sel) !== z) return;
    setSeleccio(null);
    mou(sel.id, z);
  };

  const gest = useRef<{ pid: number; o: Objecte; x0: number; y0: number; mogut: boolean; el: HTMLElement } | null>(null);
  const baixa = (e: RPointerEvent<HTMLButtonElement>, o: Objecte) => {
    if (ocupat.current || missio.fase !== 'joc' || p.tipus !== 'moure') return;
    if (gest.current) {
      // Si otro dedo ya tocaba una manzana sin moverla, el nuevo toque toma el relevo.
      if (gest.current.mogut) return;
      gest.current = null;
    }
    interromp();
    gest.current = { pid: e.pointerId, o, x0: e.clientX, y0: e.clientY, mogut: false, el: e.currentTarget };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* sin captura */ }
    e.preventDefault();
  };
  const accions = useRef({ tocaPoma, mou, altraZona });
  accions.current = { tocaPoma, mou, altraZona };

  useEffect(() => {
    const dins = (x: number, y: number, z: ZonaId) => {
      const r = ancores.current[z]?.getBoundingClientRect();
      const m = 44;
      return !!r && x >= r.left - m && x <= r.right + m && y >= r.top - m && y <= r.bottom + m;
    };
    const move = (e: PointerEvent) => {
      const g = gest.current;
      if (!g || e.pointerId !== g.pid) return;
      if (!g.mogut && Math.hypot(e.clientX - g.x0, e.clientY - g.y0) < 10) return;
      const a = arrel.current!.getBoundingClientRect();
      if (!g.mogut) {
        g.mogut = true;
        setSeleccio(null);
        setVisual(BUIT);
        g.el.classList.add('arrossegada');
        setArrossega(accions.current.altraZona(g.o));
      }
      const s = g.el.offsetWidth;
      // La manzana se eleva sobre el dedo para que se vea.
      g.el.style.transform = `translate(${e.clientX - a.left - s / 2}px, ${e.clientY - a.top - s / 2 - s * 0.4}px)`;
    };
    const fi = (e: PointerEvent, cancel: boolean) => {
      const g = gest.current;
      if (!g || e.pointerId !== g.pid) return;
      gest.current = null;
      g.el.classList.remove('arrossegada');
      setArrossega(null);
      if (!g.mogut) { if (!cancel) accions.current.tocaPoma(g.o); return; }
      const z = accions.current.altraZona(g.o);
      // Soltar fuera devuelve la manzana: no es un error matemático.
      if (!cancel && z && dins(e.clientX, e.clientY, z) && accions.current.mou(g.o.id, z)) return;
      g.el.style.transform = g.el.dataset.t ?? '';
    };
    const up = (e: PointerEvent) => fi(e, false);
    const cancel = (e: PointerEvent) => fi(e, true);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
    };
  }, []);

  /* ---------- Render ---------- */
  const visibles = new Set(p.visibles);
  const selObj = seleccio !== null ? missio.objectes.find(o => o.id === seleccio) : undefined;
  const destacades = new Set<ZonaId>([visual.destacada, arrossega, selObj ? altraZona(selObj) : null].filter(Boolean) as ZonaId[]);
  const mostraConfirma = missio.fase === 'joc' && (p.tipus === 'moure' ? missio.moguts > 0 : missio.triada !== null);
  const equacio: Terme[] | undefined = missio.fase === 'exit' && p.equacioOk ? p.equacioOk : p.equacioInicial;
  const zona = (z: ZonaId, cls: string, contingut: React.ReactNode) => visibles.has(z) && (
    <section className={`zona ${cls}${destacades.has(z) ? ' destacada' : ''}`} data-zona={z} onClick={() => tocaZona(z)}>
      {contingut}
    </section>
  );
  const ancora = (z: ZonaId, cls: string, simbol: string, w: number, h: number) => (
    <div className={`ancora ${cls}`} ref={el => { ancores.current[z] = el; }}>
      <Dibuix id={simbol} w={w} h={h} />
    </div>
  );
  if (!visibles.has('arbre')) ancores.current.arbre = null;

  return (
    <main id="berenar" className="escena" ref={arrel}>
      <Dibuix className="fons fons-h" id="fons-berenar-h" w={1180} h={820} par="xMidYMax slice" />
      <Dibuix className="fons fons-v" id="fons-berenar-v" w={390} h={844} par="xMidYMax slice" />
      <div ref={sonda} className="sonda-poma" />

      <div className="taulell" onClick={e => { if (e.target === e.currentTarget) setSeleccio(null); }}>
        {zona('arbre', 'zona-origen', ancora('arbre', 'ancora-arbre', 'arbre', 480, 360))}
        {zona('terra', 'zona-origen', ancora('terra', 'ancora-mata', 'mata', 320, 240))}
        {zona('safata', 'zona-origen zona-mariner', <>
          <Dibuix className="mariner" id="mariner" w={220} h={300} />
          {ancora('safata', 'ancora-recipient', 'safata', 400, 290)}
        </>)}
        {zona('cistella', 'zona-cistella', <>
          <Equacio termes={equacio} />
          {ancora('cistella', 'ancora-recipient', 'cistella', 400, 290)}
        </>)}

        {p.tipus === 'triar' && (
          <div className="targetes">
            {p.opcions.map(v => (
              <button key={v} className={`targeta${missio.triada === v ? ' triada' : ''}${visual.resalta === v ? ' resaltada' : ''}`} aria-label={String(v)}
                onClick={() => { if (ocupat.current) return; interromp(); netejaAjuda(); api.posaMissio(aplica(missioRef.current, { t: 'triar', valor: v })); }}>
                <span className="grup">{Array.from({ length: v }, (_, i) => <Dibuix key={i} id="poma" w={100} h={100} />)}</span>
                <span className="xifra">{v}</span>
                <svg className="marca" viewBox="0 0 48 48"><use href="#i-check" /></svg>
              </button>
            ))}
          </div>
        )}
        {p.tipus === 'banderi' && (
          <div className="banderins">
            {p.opcions.map(b => (
              <button key={b} className={`targeta targeta-banderi${missio.triada === b ? ' triada' : ''}${visual.resalta === 'totes' ? ' resaltada' : ''}`} aria-label={b}
                onClick={() => { if (ocupat.current) return; interromp(); netejaAjuda(); api.posaMissio(aplica(missioRef.current, { t: 'triar', valor: b })); }}>
                <svg viewBox="0 0 100 120"><rect x="10" y="4" width="7" height="112" rx="3" fill="#53331F" /><use href={`#${b}`} x="17" y="10" width="80" height="50" /></svg>
                <svg className="marca" viewBox="0 0 48 48"><use href="#i-check" /></svg>
              </button>
            ))}
          </div>
        )}

        <div className="lateral">
          <button id="boto-ajuda" className="guineu-boto" aria-label="Ajuda" onClick={ajuda}>
            <Dibuix className="mirall-h" id="guineu" w={200} h={250} />
          </button>
          {mostraConfirma && (
            <button id="confirma" className="boto boto-confirma" aria-label="Ja està" onClick={confirmar}>
              <svg viewBox="0 0 48 48"><use href="#i-check" /></svg>
            </button>
          )}
        </div>
      </div>

      <div className="capa-pomes">
        {visual.forats && Array.from({ length: visual.forats.n }, (_, i) => {
          const t = transf(centre(visual.forats!.zona, i));
          return <div key={`f${i}`} className="forat" style={{ transform: t }}>{visual.insignies[`f${i}`] && <span className="insignia">{visual.insignies[`f${i}`]}</span>}</div>;
        })}
        {geo && missio.objectes.filter(o => visibles.has(o.zona)).map(o => {
          const t = transf(centre(o.zona, o.placa));
          return (
            <button key={o.id} className={`poma${seleccio === o.id ? ' seleccionada' : ''}`} aria-label="Poma" data-t={t} style={{ transform: t }}
              onPointerDown={e => baixa(e, o)}>
              <Poma />
              {visual.insignies[`o${o.id}`] && <span className="insignia">{visual.insignies[`o${o.id}`]}</span>}
            </button>
          );
        })}
        {visual.fantasma && (
          <div className="fantasma" style={{ transform: transf(visual.fantasma) }}>
            <Poma />
            <svg className="pota" viewBox="0 0 60 60"><use href="#i-pota" /></svg>
          </div>
        )}
      </div>
    </main>
  );
}

function Equacio({ termes }: { termes?: Terme[] }) {
  return (
    <div className={`equacio${termes ? '' : ' buida'}`} aria-live="polite">
      {termes?.map((x, i) => typeof x === 'number'
        ? <span key={i} className="terme">{x}<span className="punts">{Array.from({ length: x }, (_, k) => <i key={k} />)}</span></span>
        : <span key={i}>{x}</span>)}
    </div>
  );
}
