import { useEffect, useState } from 'react';
import type { Carta } from '../logica/missio';
import { Dibuix } from '../art/Dibuix';

/** Posición de los puntos de un dado (en %), para 1 a 6. */
const DAU: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
  6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]],
};

function Cara({ c }: { c: Carta }) {
  if (c.cara === 'xifra') return <span className="cara-xifra">{c.valor}</span>;
  if (c.cara === 'punts') {
    return <span className="cara-punts">{DAU[c.valor].map(([x, y], i) => <i key={i} style={{ left: `${x}%`, top: `${y}%` }} />)}</span>;
  }
  return <span className={`cara-grup n${c.valor}`}>{Array.from({ length: c.valor }, (_, i) => <Dibuix key={i} id="poma" w={100} h={100} />)}</span>;
}

function useHoritzontal() {
  const q = () => window.matchMedia('(orientation: landscape)').matches;
  const [h, setH] = useState(q);
  useEffect(() => {
    const f = () => setH(q());
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return h;
}

interface Props { cartes: Carta[]; girades: number[]; mostraTot: boolean; onGira(i: number): void }

/** Memory de cantidades: cartas boca abajo con hojas; se emparejan las que valen lo mismo. */
export default function Memory({ cartes, girades, mostraTot, onGira }: Props) {
  const horitzontal = useHoritzontal();
  const n = cartes.length;
  const cols = horitzontal ? (n <= 6 ? 3 : n <= 8 ? 4 : n <= 10 ? 5 : 4) : (n <= 6 ? 2 : 3);
  return (
    <div className="memory" style={{ ['--cols' as string]: cols, ['--files' as string]: Math.ceil(n / cols) }}>
      {cartes.map((c, i) => {
        const vista = c.feta || girades.includes(i) || mostraTot;
        return (
          <button key={i} className={`carta${vista ? ' girada' : ''}${c.feta ? ' feta' : ''}`} aria-label={vista ? String(c.valor) : 'Carta'}
            onClick={() => onGira(i)}>
            {/* Una sola cara a la vez: el giro 3D con caras ocultas falla en Safari y pesa más. */}
            {vista
              ? <span key="cara" className="carta-cara"><Cara c={c} /></span>
              : <span key="revers" className="carta-revers"><Dibuix id="fulla" w={100} h={100} /></span>}
          </button>
        );
      })}
    </div>
  );
}
