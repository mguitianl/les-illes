/* Guardado local versionado. Solo lo mínimo, sin datos personales. */
import { BANDERINS, N_NIVELLS, esEstatValid, type Banderi, type EstatMissio, type Intent } from './missio';

export const CLAU = 'illes-nicole';
export const CLAU_DANYAT = 'illes-nicole-danyat';
export const VERSIO = 2;
export const MAX_INTENTS = 200;

export interface Desat {
  versio: typeof VERSIO;
  preferencies: { veu: boolean };
  missio: EstatMissio | null;
  /** Nivel con el que empieza la próxima misión. */
  nivell: number;
  /** Adornos conseguidos; no se pierden al reiniciar una actividad. */
  adorns: Banderi[];
  banderiActiu: Banderi | null;
  tutorialVist: boolean;
  missionsCompletades: number;
  intents: Intent[];
  notes: string;
}

export type Avis = 'cap' | 'nou' | 'danyat' | 'missio-reiniciada';

export const nou = (): Desat => ({
  versio: VERSIO, preferencies: { veu: true }, missio: null, nivell: 0, adorns: [], banderiActiu: null,
  tutorialVist: false, missionsCompletades: 0, intents: [], notes: '',
});

type Magatzem = Pick<Storage, 'getItem' | 'setItem'>;

/** Migraciones de versiones anteriores. Cada entrada transforma la versión n en la n+1. */
const MIGRACIONS: Record<number, (d: Record<string, unknown>) => Record<string, unknown>> = {
  // v2: niveles. La partida en curso era del primer nivel; la siguiente misión pasa al nivel 2.
  1: d => {
    const m = d.missio as Record<string, unknown> | null | undefined;
    const fetes = Number.isInteger(d.missionsCompletades) ? (d.missionsCompletades as number) : 0;
    return { ...d, versio: 2, nivell: Math.min(fetes, 1), missio: m && typeof m === 'object' ? { ...m, nivell: 0 } : m ?? null };
  },
};

export function migra(d: Record<string, unknown>): Record<string, unknown> | null {
  let v = d.versio;
  let out = d;
  while (typeof v === 'number' && v < VERSIO) {
    const m = MIGRACIONS[v];
    if (!m) return null;
    out = m(out);
    v = out.versio;
  }
  return v === VERSIO ? out : null;
}

const esBanderi = (x: unknown): x is Banderi => (BANDERINS as readonly unknown[]).includes(x);

export function valida(raw: unknown): { desat: Desat; avis: Avis } | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const d = migra(raw as Record<string, unknown>);
  if (!d) return null;
  const base = nou();
  const pref = d.preferencies as Desat['preferencies'] | undefined;
  const out: Desat = {
    ...base,
    preferencies: { veu: typeof pref?.veu === 'boolean' ? pref.veu : true },
    adorns: Array.isArray(d.adorns) ? [...new Set(d.adorns.filter(esBanderi))] : [],
    banderiActiu: esBanderi(d.banderiActiu) ? d.banderiActiu : null,
    nivell: Number.isInteger(d.nivell) && (d.nivell as number) >= 0 && (d.nivell as number) < N_NIVELLS ? (d.nivell as number) : 0,
    tutorialVist: d.tutorialVist === true,
    missionsCompletades: Number.isInteger(d.missionsCompletades) ? (d.missionsCompletades as number) : 0,
    intents: Array.isArray(d.intents) ? (d.intents as Intent[]).filter(i => i && typeof i.pas === 'string').slice(-MAX_INTENTS) : [],
    notes: typeof d.notes === 'string' ? d.notes : '',
  };
  if (d.missio === null || d.missio === undefined) return { desat: out, avis: 'cap' };
  if (esEstatValid(d.missio)) return { desat: { ...out, missio: d.missio }, avis: 'cap' };
  // La partida en curso no es coherente: se reinicia la misión y se conserva el resto.
  return { desat: out, avis: 'missio-reiniciada' };
}

export function carrega(m: Magatzem): { desat: Desat; avis: Avis } {
  let raw: string | null = null;
  try {
    raw = m.getItem(CLAU);
  } catch {
    return { desat: nou(), avis: 'danyat' };
  }
  if (raw === null) return { desat: nou(), avis: 'nou' };
  let r: { desat: Desat; avis: Avis } | null = null;
  try {
    r = valida(JSON.parse(raw));
  } catch {
    r = null;
  }
  if (r) return r;
  try {
    m.setItem(CLAU_DANYAT, raw); // copia para no perder nada
  } catch { /* sin espacio: se ignora */ }
  return { desat: nou(), avis: 'danyat' };
}

export function desa(m: Magatzem, d: Desat): boolean {
  try {
    m.setItem(CLAU, JSON.stringify(d));
    return true;
  } catch {
    return false;
  }
}

export function ambIntent(d: Desat, i: Intent): Desat {
  return { ...d, intents: [...d.intents, i].slice(-MAX_INTENTS) };
}

/** Al terminar: suma la misión, pasa al nivel siguiente y guarda el banderín sin duplicar premios.
    Después del último nivel se vuelve a empezar la lista. */
export function completaMissio(d: Desat, b: Banderi | null): Desat {
  const actual = d.missio?.nivell ?? d.nivell;
  return {
    ...d,
    missio: null,
    nivell: (actual + 1) % N_NIVELLS,
    missionsCompletades: d.missionsCompletades + 1,
    adorns: b && !d.adorns.includes(b) ? [...d.adorns, b] : d.adorns,
    banderiActiu: b ?? d.banderiActiu,
  };
}
