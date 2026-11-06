import { useEffect, useRef, useState } from 'react';
import { veu } from '../audio/veu';
import type { Banderi } from '../logica/missio';
import { Dibuix } from '../art/Dibuix';

interface Props {
  banderi: Banderi | null;
  veuInicial: string;
  /** Al acabar la misión el banderín sube por la driza. */
  alzaBanderi: boolean;
  onEntra(): void;
}

// Posición de la driza del palo mayor en cada composición del fondo (coordenadas del viewBox).
const DRIZA = {
  h: { x: 813, y: 61, w: 68, h: 43, viewBox: '0 0 1180 820' },
  v: { x: 211.7, y: 280.7, w: 33, h: 21, viewBox: '0 0 390 844' },
};

export default function Port({ banderi, veuInicial, alzaBanderi, onEntra }: Props) {
  const cistella = useRef<HTMLButtonElement>(null);
  const [alzat, setAlzat] = useState(!alzaBanderi);

  useEffect(() => {
    veu.instrueix([veuInicial]);
    const t = setTimeout(() => setAlzat(true), 400);
    return () => clearTimeout(t);
  }, [veuInicial]);

  const ajuda = () => {
    const c = cistella.current;
    if (c) { c.classList.remove('resalta'); void c.offsetWidth; c.classList.add('resalta'); }
    veu.parla(['a-port']);
  };

  return (
    <main id="port" className="escena">
      <Dibuix className="fons fons-h" id="fons-port-h" w={1180} h={820} par="xMidYMax slice" />
      <Dibuix className="fons fons-v" id="fons-port-v" w={390} h={844} par="xMidYMax slice" />
      {banderi && (['h', 'v'] as const).map(o => {
        const d = DRIZA[o];
        return (
          <svg key={o} className={`fons fons-${o} banderi-vaixell${alzat ? ' alzat' : ''}`} viewBox={d.viewBox} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <use href={`#${banderi}`} x={d.x} y={d.y} width={d.w} height={d.h} />
          </svg>
        );
      })}
      <div className="port-moll">
        <button id="port-guineu" className="guineu-boto" aria-label="Ajuda" onClick={ajuda}>
          <Dibuix id="guineu-assenyala" w={250} h={250} />
        </button>
        <button ref={cistella} id="port-cistella" className="port-cistella" aria-label="Cistella: comença el berenar" onClick={onEntra}>
          <Dibuix id="cistella" w={400} h={290} />
        </button>
      </div>
    </main>
  );
}
