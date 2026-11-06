import { useEffect, useState } from 'react';
import { veu } from '../audio/veu';
import { ILLES, NIVELLS_ILLA, PREMIS } from '../logica/missio';
import { desbloquejada, illaActual, illaCompleta, type Desat } from '../logica/desat';
import { Dibuix } from '../art/Dibuix';

/** Posiciones en el mapa (coordenadas del viewBox), horizontal y vertical. */
const DISPOSICIO = {
  h: { vb: '0 0 1180 820', port: [120, 690], illa: [260, 190], vaixell: [150, 117], llocs: [[340, 560], [560, 320], [830, 560], [1010, 300]] },
  v: { vb: '0 0 390 844', port: [70, 790], illa: [170, 124], vaixell: [92, 72], llocs: [[255, 662], [125, 512], [270, 362], [130, 214]] },
} as const;

interface Props {
  desat: Desat;
  /** Si hay que navegar de una isla a otra al entrar (al completar una isla). */
  navega: { de: number; a: number } | null;
  premiNou: string | null;
  onIlla(i: number): void;
}

function useOrientacio(): 'h' | 'v' {
  const q = () => (window.matchMedia('(orientation: landscape)').matches ? 'h' : 'v');
  const [o, setO] = useState<'h' | 'v'>(q);
  useEffect(() => {
    const f = () => setO(q());
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return o;
}

export default function Mapa({ desat, navega, premiNou, onIlla }: Props) {
  const o = useOrientacio();
  const d = DISPOSICIO[o];
  const actual = illaActual(desat);
  const [vaixellA, setVaixellA] = useState(navega ? navega.de : actual);
  const [pica, setPica] = useState(0);

  useEffect(() => {
    if (navega) {
      veu.instrueix(['mapa-nova', 'mapa']);
      const t = setTimeout(() => setVaixellA(navega.a), 700);
      return () => clearTimeout(t);
    }
    veu.instrueix(premiNou ? ['mapa-premi', 'mapa'] : ['mapa']);
    return undefined;
    // Solo al entrar en el mapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [iw, ih] = d.illa;
  const [vw, vh] = d.vaixell;
  const [vx, vy] = d.llocs[vaixellA];
  const ruta = [d.port, ...d.llocs].map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');

  const toca = (i: number) => {
    if (desbloquejada(desat, i)) { veu.calla(); onIlla(i); return; }
    // Una isla que todavía no se ha abierto: se señala la del barco.
    setPica(k => k + 1);
    veu.parla(['a-mapa']);
  };

  return (
    <main id="mapa" className="escena">
      <Dibuix className="fons fons-h" id="fons-mapa-h" w={1180} h={820} par="xMidYMid slice" />
      <Dibuix className="fons fons-v" id="fons-mapa-v" w={390} h={844} par="xMidYMid slice" />
      <svg className="mapa-capa" viewBox={d.vb} preserveAspectRatio="xMidYMid meet">
        <path d={ruta} className="ruta" />
        {ILLES.map((id, i) => {
          const [x, y] = d.llocs[i];
          const oberta = desbloquejada(desat, i);
          const premis = PREMIS[id].filter(p => desat.premis.includes(p));
          const estat = !oberta ? 'tancada' : i === actual && !illaCompleta(desat, i) ? 'actual' : illaCompleta(desat, i) ? 'feta' : 'oberta';
          return (
            <g key={id} className={`illa-mapa ${estat}`} data-illa={id} transform={`translate(${x - iw / 2} ${y - ih / 2})`}
              role="button" aria-label={`Illa ${i + 1}`} onClick={() => toca(i)}>
              <rect x={-10} y={-20} width={iw + 20} height={ih + 50} fill="transparent" />
              {estat === 'actual' && <ellipse key={pica} className="anell" cx={iw / 2} cy={ih * 0.72} rx={iw * 0.56} ry={ih * 0.32} />}
              <use href={`#illa-${id}`} width={iw} height={ih} />
              {!oberta && <use className="boira" href="#nuvol" x={iw * 0.05} y={ih * 0.35} width={iw * 0.9} height={ih * 0.3} />}
              <g className="progres">
                {Array.from({ length: NIVELLS_ILLA }, (_, k) => (
                  <circle key={k} cx={iw / 2 + (k - 1.5) * iw * 0.09} cy={ih + iw * 0.06} r={iw * 0.028} className={k < desat.progres[i] ? 'fet' : ''} />
                ))}
              </g>
              {premis.map((p, k) => (
                <use key={p} href={`#${p}`} className={p === premiNou ? 'premi-nou' : ''}
                  x={iw / 2 + (k - (premis.length - 1) / 2) * iw * 0.16 - iw * 0.07} y={-iw * 0.1} width={iw * 0.14} height={iw * 0.14} />
              ))}
            </g>
          );
        })}
        <g className="vaixell-mapa" style={{ transform: `translate(${vx - iw / 2 - vw * 0.75}px, ${vy + ih * 0.05}px)` }}>
          <use href="#vaixell" width={vw} height={vh} />
        </g>
      </svg>
    </main>
  );
}
