/* Medidor de tirones: cuenta los fotogramas lentos de cada pantalla para diagnosticar el iPad o el móvil.
   Solo guarda números en este dispositivo; se consulta en la zona de adultos. */

export interface Registre {
  quan: string;
  on: string;
  segons: number;
  fotogrames: number;
  /** Fotogramas de más de 50 ms (se nota como un tirón). */
  tirons: number;
  /** El peor fotograma, en ms. */
  pitjor: number;
}

const CLAU = 'illes-nicole-rendiment';
const MAX = 30;
let actual: Registre | null = null;
let raf = 0;
let ultim = 0;
let inici = 0;

function bucle(t: number) {
  if (actual && ultim && !document.hidden) {
    const dt = t - ultim;
    // Más de 1 s suele ser que la app ha estado en segundo plano: no es un tirón del juego.
    if (dt < 1000) {
      actual.fotogrames++;
      if (dt > 50) actual.tirons++;
      if (dt > actual.pitjor) actual.pitjor = Math.round(dt);
    }
  }
  ultim = document.hidden ? 0 : t;
  raf = requestAnimationFrame(bucle);
}

export function comenca(on: string) {
  acaba();
  actual = { quan: new Date().toISOString(), on, segons: 0, fotogrames: 0, tirons: 0, pitjor: 0 };
  inici = performance.now();
  ultim = 0;
  raf = requestAnimationFrame(bucle);
}

export function acaba() {
  cancelAnimationFrame(raf);
  const r = actual;
  actual = null;
  if (!r || r.fotogrames < 60) return;
  r.segons = Math.round((performance.now() - inici) / 1000);
  try {
    const llista = registres();
    llista.push(r);
    localStorage.setItem(CLAU, JSON.stringify(llista.slice(-MAX)));
  } catch { /* sin almacenamiento: se ignora */ }
}

export function registres(): Registre[] {
  try {
    const x = JSON.parse(localStorage.getItem(CLAU) ?? '[]');
    return Array.isArray(x) ? x : [];
  } catch {
    return [];
  }
}

export function esborra() {
  try { localStorage.removeItem(CLAU); } catch { /* ignora */ }
}
