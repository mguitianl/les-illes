import { useRef } from 'react';
import { veu } from '../audio/veu';

interface Props {
  rotul: string;
  mostraCasa: boolean;
  onCasa(): void;
  parlant: boolean;
  fallida: boolean;
  onAdults(): void;
}

/** Controles estables. Mantener pulsado el rótulo 2 s abre la puerta de adultos. */
export default function Barra({ rotul, mostraCasa, onCasa, parlant, fallida, onAdults }: Props) {
  const temps = useRef<number | undefined>(undefined);
  const inicia = () => { temps.current = window.setTimeout(onAdults, 2000); };
  const atura = () => clearTimeout(temps.current);
  return (
    <header className="barra">
      <button id="casa" className="boto" aria-label="Torna al port" onClick={onCasa} style={{ visibility: mostraCasa ? 'visible' : 'hidden' }}>
        <svg viewBox="0 0 48 48"><use href="#i-illa" /></svg>
      </button>
      <p id="rotul" className="rotul" onPointerDown={inicia} onPointerUp={atura} onPointerLeave={atura} onPointerCancel={atura}>
        {rotul}
      </p>
      <button id="altaveu" className={`boto${parlant ? ' parlant' : ''}${fallida ? ' sense-veu' : ''}`} aria-label="Repeteix" onClick={() => veu.repeteix()}>
        <svg viewBox="0 0 48 48"><use href="#i-altaveu" /></svg>
      </button>
    </header>
  );
}
