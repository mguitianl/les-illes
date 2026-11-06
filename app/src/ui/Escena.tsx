import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { veu, espera } from '../audio/veu';
import { placaLliure, type Objecte, type ZonaId } from '../logica/quantitats';
import {
  BANDERINS, OBJECTE, aplica, confirma, esUltimPas, illaId, pasActual, type EstatMissio, type IllaId, type Pas, type Terme,
} from '../logica/missio';
import { Dibuix, Peca } from '../art/Dibuix';
import Memory from './Memory';
import type { Api } from '../App';

/** Cómo se dibuja cada zona y dónde van sus plazas (en % del dibujo). */
interface ZonaUI { area: 'origen' | 'principal'; simbol: string; w: number; h: number; cls: string; places: [number, number][]; mariner?: boolean }
const CINC: [number, number][] = [[24, 44], [50, 42], [76, 44], [37, 75], [63, 75]];
const SIS: [number, number][] = [[24, 48], [50, 46], [76, 48], [26, 74], [50, 76], [74, 74]];
const ZONA_UI: Record<ZonaId, ZonaUI> = {
  arbre: { area: 'origen', simbol: 'arbre', w: 480, h: 360, cls: 'ancora-arbre', places: [[31.25, 33.3], [50, 33.3], [68.75, 33.3], [40.6, 58.3], [59.4, 58.3]] },
  terra: { area: 'origen', simbol: 'mata', w: 320, h: 240, cls: 'ancora-mata', places: [[50, 58], [27, 64], [73, 64]] },
  safata: { area: 'origen', simbol: 'safata', w: 400, h: 290, cls: 'ancora-recipient', places: CINC, mariner: true },
  cistella: { area: 'principal', simbol: 'cistella', w: 400, h: 290, cls: 'ancora-recipient', places: CINC },
  roca: { area: 'origen', simbol: 'roca', w: 420, h: 260, cls: 'ancora-ample', places: [[22, 54], [40, 40], [58, 36], [76, 46], [34, 70], [62, 66]] },
  platja: { area: 'origen', simbol: 'platja', w: 420, h: 260, cls: 'ancora-ample', places: [[26, 48], [50, 44], [74, 48], [30, 72], [52, 74], [72, 70]] },
  barca: { area: 'principal', simbol: 'barca', w: 440, h: 260, cls: 'ancora-ample', places: SIS },
  sorra: { area: 'origen', simbol: 'sorra', w: 420, h: 260, cls: 'ancora-ample', places: [[30, 62], [50, 52], [70, 62], [38, 80], [62, 80]] },
  cofre: { area: 'principal', simbol: 'cofre', w: 420, h: 300, cls: 'ancora-ample', places: [[28, 52], [50, 50], [72, 52], [28, 74], [50, 74], [72, 74]] },
};
const FONS: Record<IllaId, string> = { berenar: 'fons-berenar', badia: 'fons-badia', tresor: 'fons-tresor', bosc: 'fons-bosc' };

interface Rect { x: number; y: number; w: number; h: number }
interface Punt { x: number; y: number }
interface Visual {
  destacada: ZonaId[];
  forats: { zona: ZonaId; n: number } | null;
  insignies: Record<string, number>;
  fantasma: Punt | null;
  resalta: number | string | 'totes' | null;
}
const BUIT: Visual = { destacada: [], forats: null, insignies: {}, fantasma: null, resalta: null };

interface Props { missio: EstatMissio; tutorialVist: boolean; sensedemo: boolean; api: Api }

export default function Escena({ missio, tutorialVist, sensedemo, api }: Props) {
  const p = pasActual(missio) as Pas;
  const illa = illaId(missio);
  const arrel = useRef<HTMLElement>(null);
  const ancores = useRef<Partial<Record<ZonaId, HTMLDivElement | null>>>({});
  const sonda = useRef<HTMLDivElement>(null);
  const missioRef = useRef(missio);
  missioRef.current = missio;
  const [geo, setGeo] = useState<{ rects: Partial<Record<ZonaId, Rect>>; poma: number } | null>(null);
  const [visual, setVisual] = useState<Visual>(BUIT);
  const [seleccio, setSeleccio] = useState<number | null>(null);
  const [arrossega, setArrossega] = useState<ZonaId | null>(null);
  const [mostraCartes, setMostraCartes] = useState(false);
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
    const pl = ZONA_UI[z].places[i];
    if (!r || !pl) return null;
    return { x: r.x + (r.w * pl[0]) / 100, y: r.y + (r.h * pl[1]) / 100 };
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
      if (n === 1) { setVisual({ ...BUIT, destacada: [q.desti], forats }); veu.parla([q.ajuda]); }
      else if (n === 2) {
        setVisual({ ...BUIT, forats });
        const objs = objectesA(e, q.desti);
        compta(t, objs.length ? objs.map(o => `o${o.id}`) : Array.from({ length: q.objectiu }, (_, i) => `f${i}`));
      } else { setVisual(BUIT); demostra(t); }
    } else if (q.tipus === 'triar') {
      const claus = objectesA(e, q.zonaComptar).filter(o => !q.nomesNous || !e.marcats.includes(o.id)).map(o => `o${o.id}`);
      setVisual({ ...BUIT, destacada: [q.zonaComptar] });
      if (n === 1) veu.parla([q.ajuda]);
      else compta(t, claus).then(() => { if (n >= 3 && t === torn.current) setVisual(v => ({ ...v, resalta: q.correcta })); });
    } else if (q.tipus === 'comparar') {
      setVisual({ ...BUIT, destacada: q.opcions });
      if (n === 1) veu.parla([q.ajuda]);
      else {
        // Contar cada grupo por separado; en el último nivel se señala el que tiene más.
        (async () => {
          for (const z of q.opcions) {
            if (t !== torn.current) return;
            setVisual(v => ({ ...v, destacada: [z], insignies: {} }));
            await compta(t, objectesA(e, z).map(o => `o${o.id}`));
            await espera(500);
          }
          if (t === torn.current) setVisual(v => ({ ...v, insignies: {}, destacada: n >= 3 ? [q.correcta] : q.opcions }));
        })();
      }
    } else if (q.tipus === 'memory') {
      veu.parla([q.ajuda]);
      setMostraCartes(true);
      setTimeout(() => { if (t === torn.current) setMostraCartes(false); }, 1800 + 300 * n);
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
    setMostraCartes(false);
    const t = ++torn.current;
    veu.instrueix([p.veu]).then(ok => {
      if (ok && t === torn.current && missio.illa === 0 && missio.nivell === 0 && missio.pas === 0 && !tutorialVist && !sensedemo && muntat.current) {
        api.marcaTutorial();
        demostra(t);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missio.pas, missio.illa, missio.nivell]);

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
    if (esUltimPas(m)) api.acaba(r.estat.premi);
    else api.posaMissio(aplica(ara, { t: 'seguent' }));
  };

  /* ---------- Memory ---------- */
  const giraCarta = async (i: number) => {
    if (ocupat.current) return;
    const m = missioRef.current;
    const n = aplica(m, { t: 'girar', i });
    if (n === m) return;
    interromp();
    api.posaMissio(n);
    const carta = n.cartes[i];
    if (n.girades.length === 2) {
      // No son pareja: se ven un momento y se vuelven a tapar. No es un error.
      ocupat.current = true;
      await veu.parla([`n${carta.valor}`]);
      await espera(900);
      api.posaMissio(aplica(missioRef.current, { t: 'tapar' }));
      ocupat.current = false;
    } else if (carta.feta) {
      // Pareja: se puede seguir jugando mientras lo dice; solo la última espera para pasar al premio.
      const dit = veu.parla([`n${carta.valor}`, 'bosc-parella']);
      if (n.cartes.every(c => c.feta)) {
        ocupat.current = true;
        await dit;
        ocupat.current = false;
        confirmar();
      }
    } else {
      veu.parla([`n${carta.valor}`]);
    }
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
  const tria = (valor: number | string) => {
    if (ocupat.current) return;
    interromp();
    netejaAjuda();
    api.posaMissio(aplica(missioRef.current, { t: 'triar', valor }));
  };
  const tocaPoma = (o: Objecte) => {
    if (p.tipus === 'comparar') { tria(o.zona); return; }
    const sel = seleccio !== null ? missioRef.current.objectes.find(x => x.id === seleccio) : undefined;
    // Tocar un objeto que ya está en el destino equivale a tocar el destino.
    if (sel && sel.id !== o.id && o.zona === altraZona(sel)) { setSeleccio(null); mou(sel.id, o.zona); return; }
    setSeleccio(seleccio === o.id ? null : o.id);
  };
  const tocaZona = (z: ZonaId) => {
    if (ocupat.current) return;
    if (p.tipus === 'comparar') { tria(z); return; }
    if (seleccio === null) return;
    const sel = missioRef.current.objectes.find(x => x.id === seleccio);
    if (!sel || altraZona(sel) !== z) return;
    setSeleccio(null);
    mou(sel.id, z);
  };

  const gest = useRef<{ pid: number; o: Objecte; x0: number; y0: number; mogut: boolean; el: HTMLElement } | null>(null);
  const baixa = (e: RPointerEvent<HTMLButtonElement>, o: Objecte) => {
    if (ocupat.current || missio.fase !== 'joc') return;
    if (p.tipus === 'comparar') { e.preventDefault(); tria(o.zona); return; }
    if (p.tipus !== 'moure') return;
    if (gest.current) {
      // Si otro dedo ya tocaba un objeto sin moverlo, el nuevo toque toma el relevo.
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
      // El objeto se eleva sobre el dedo para que se vea.
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
      // Soltar fuera devuelve el objeto: no es un error matemático.
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
  for (const z of Object.keys(ancores.current) as ZonaId[]) if (!visibles.has(z)) ancores.current[z] = null;
  const selObj = seleccio !== null ? missio.objectes.find(o => o.id === seleccio) : undefined;
  const destacades = new Set<ZonaId>([...visual.destacada, arrossega, selObj ? altraZona(selObj) : null].filter(Boolean) as ZonaId[]);
  const triadaZona = p.tipus === 'comparar' ? (missio.triada as ZonaId | null) : null;
  const mostraConfirma = missio.fase === 'joc' && p.tipus !== 'memory'
    && (p.tipus === 'moure' ? missio.moguts > 0 : missio.triada !== null);
  const equacio: Terme[] | undefined = missio.fase === 'exit' && p.equacioOk ? p.equacioOk : p.equacioInicial;
  const forats = visual.forats ?? (p.tipus === 'moure' && p.forats && missio.fase === 'joc' ? { zona: p.desti, n: p.objectiu } : null);
  const simbolObjecte = (o: Objecte) => (illa === 'tresor' && missio.marcats.includes(o.id) ? 'moneda-plata' : OBJECTE[illa]);

  const zona = (z: ZonaId) => {
    const u = ZONA_UI[z];
    return (
      <section key={z} className={`zona zona-${u.area}${destacades.has(z) ? ' destacada' : ''}${triadaZona === z ? ' triada' : ''}`}
        data-zona={z} onClick={() => tocaZona(z)}>
        {u.area === 'principal' && <Equacio termes={equacio} />}
        {u.mariner && <Dibuix className="mariner" id="mariner" w={220} h={300} />}
        <div className={`ancora ${u.cls}`} style={{ aspectRatio: `${u.w} / ${u.h}` }} ref={el => { ancores.current[z] = el; }}>
          <Dibuix id={u.simbol} w={u.w} h={u.h} />
        </div>
      </section>
    );
  };

  return (
    <main id="escena" className={`escena illa-${illa}`} ref={arrel}>
      <Dibuix className="fons fons-h" id={`${FONS[illa]}-h`} w={1180} h={820} par="xMidYMax slice" />
      <Dibuix className="fons fons-v" id={`${FONS[illa]}-v`} w={390} h={844} par="xMidYMax slice" />
      <div ref={sonda} className="sonda-poma" />

      <div className="taulell" onClick={e => { if (e.target === e.currentTarget) setSeleccio(null); }}>
        {p.visibles.map(zona)}

        {p.tipus === 'triar' && (
          <div className="targetes">
            {p.opcions.map(v => (
              <button key={v} className={`targeta${missio.triada === v ? ' triada' : ''}${visual.resalta === v ? ' resaltada' : ''}`} aria-label={String(v)}
                onClick={() => tria(v)}>
                <span className="grup">{Array.from({ length: v }, (_, i) => <Dibuix key={i} id={OBJECTE[illa]} w={100} h={100} />)}</span>
                <span className="xifra">{v}</span>
                <svg className="marca" viewBox="0 0 48 48"><use href="#i-check" /></svg>
              </button>
            ))}
          </div>
        )}
        {p.tipus === 'premi' && (
          <div className="banderins">
            {missio.opcionsPremi.map(b => (
              <button key={b} className={`targeta targeta-banderi${missio.triada === b ? ' triada' : ''}${visual.resalta === 'totes' ? ' resaltada' : ''}`} aria-label={b}
                onClick={() => tria(b)}>
                <Premi id={b} />
                <svg className="marca" viewBox="0 0 48 48"><use href="#i-check" /></svg>
              </button>
            ))}
          </div>
        )}
        {p.tipus === 'memory' && (
          <Memory cartes={missio.cartes} girades={missio.girades} mostraTot={mostraCartes} onGira={giraCarta} />
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
        {forats && Array.from({ length: forats.n }, (_, i) => {
          const t = transf(centre(forats.zona, i));
          return <div key={`f${i}`} className="forat" style={{ transform: t }}>{visual.insignies[`f${i}`] && <span className="insignia">{visual.insignies[`f${i}`]}</span>}</div>;
        })}
        {geo && missio.objectes.filter(o => visibles.has(o.zona)).map(o => {
          const t = transf(centre(o.zona, o.placa));
          return (
            <button key={o.id} className={`poma${seleccio === o.id ? ' seleccionada' : ''}`} aria-label={simbolObjecte(o)} data-t={t} style={{ transform: t }}
              onPointerDown={e => baixa(e, o)}>
              <Peca id={simbolObjecte(o)} />
              {visual.insignies[`o${o.id}`] && <span className="insignia">{visual.insignies[`o${o.id}`]}</span>}
            </button>
          );
        })}
        {visual.fantasma && (
          <div className="fantasma" style={{ transform: transf(visual.fantasma) }}>
            <Peca id={OBJECTE[illa]} />
            <svg className="pota" viewBox="0 0 60 60"><use href="#i-pota" /></svg>
          </div>
        )}
      </div>
    </main>
  );
}

/** Premio en su tarjeta: las banderas con su palo; el resto, centrado. */
export function Premi({ id }: { id: string }) {
  if (BANDERINS.includes(id)) {
    return <svg viewBox="0 0 100 120"><rect x="10" y="4" width="7" height="112" rx="3" fill="#53331F" /><use href={`#${id}`} x="17" y="10" width="80" height="50" /></svg>;
  }
  return <svg viewBox="0 0 100 100"><use href={`#${id}`} width="100" height="100" /></svg>;
}

function Equacio({ termes }: { termes?: Terme[] }) {
  return (
    <div className={`equacio${termes ? '' : ' buida'}`} aria-live="polite">
      {termes?.map((x, i) => typeof x === 'number'
        ? <span key={i} className="terme">{x}<span className="punts">{Array.from({ length: x }, (_, k) => <i key={k} />)}</span></span>
        : x === '?' ? <span key={i} className="terme"><span className="interrogant">?</span><span className="punts" /></span>
        : <span key={i}>{x}</span>)}
    </div>
  );
}
