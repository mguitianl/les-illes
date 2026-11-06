/* Guardado local versionado. Solo lo mínimo, sin datos personales. */
import { BANDERINS, N_ILLES, NIVELLS_ILLA, PREMIS, esEstatValid, type EstatMissio, type Intent } from './missio';

export const CLAU = 'illes-nicole';
export const CLAU_DANYAT = 'illes-nicole-danyat';
export const VERSIO = 3;
export const MAX_INTENTS = 300;

export interface Desat {
  versio: typeof VERSIO;
  preferencies: { veu: boolean };
  missio: EstatMissio | null;
  /** Niveles completados en cada isla (0 a NIVELLS_ILLA). */
  progres: number[];
  /** Premios conseguidos; no se pierden al reiniciar una actividad. */
  premis: string[];
  banderiActiu: string | null;
  tutorialVist: boolean;
  missionsCompletades: number;
  intents: Intent[];
  notes: string;
}

export type Avis = 'cap' | 'nou' | 'danyat' | 'missio-reiniciada';

export const nou = (): Desat => ({
  versio: VERSIO, preferencies: { veu: true }, missio: null, progres: Array(N_ILLES).fill(0), premis: [], banderiActiu: null,
  tutorialVist: false, missionsCompletades: 0, intents: [], notes: '',
});

type Magatzem = Pick<Storage, 'getItem' | 'setItem'>;
type Cru = Record<string, unknown>;
const enter = (x: unknown, def = 0) => (Number.isInteger(x) ? (x as number) : def);

/** Migraciones de versiones anteriores. Cada entrada transforma la versión n en la n+1. */
const MIGRACIONS: Record<number, (d: Cru) => Cru> = {
  // v2: niveles del berenar.
  1: d => ({ ...d, versio: 2, nivell: Math.min(enter(d.missionsCompletades), 1), missio: null }),
  // v3: islas. Lo jugado cuenta como niveles del berenar; la partida a medias se descarta (cambió de forma).
  2: d => ({
    ...d, versio: 3, missio: null,
    progres: [Math.min(enter(d.missionsCompletades), NIVELLS_ILLA), ...Array(N_ILLES - 1).fill(0)],
    premis: Array.isArray(d.adorns) ? d.adorns : [],
  }),
};

export function migra(d: Cru): Cru | null {
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

const TOTS_PREMIS = new Set(Object.values(PREMIS).flat());
const esPremi = (x: unknown): x is string => typeof x === 'string' && TOTS_PREMIS.has(x);

export function valida(raw: unknown): { desat: Desat; avis: Avis } | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const d = migra(raw as Cru);
  if (!d) return null;
  const base = nou();
  const pref = d.preferencies as Desat['preferencies'] | undefined;
  const progres = Array.isArray(d.progres) ? d.progres : [];
  const out: Desat = {
    ...base,
    preferencies: { veu: typeof pref?.veu === 'boolean' ? pref.veu : true },
    progres: base.progres.map((_, i) => Math.max(0, Math.min(NIVELLS_ILLA, enter(progres[i])))),
    premis: Array.isArray(d.premis) ? [...new Set(d.premis.filter(esPremi))] : [],
    banderiActiu: esPremi(d.banderiActiu) && BANDERINS.includes(d.banderiActiu) ? d.banderiActiu : null,
    tutorialVist: d.tutorialVist === true,
    missionsCompletades: enter(d.missionsCompletades),
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

/* ---------- Mapa ---------- */

export const illaCompleta = (d: Desat, i: number) => d.progres[i] >= NIVELLS_ILLA;
/** Una isla se abre cuando la anterior está completa. */
export const desbloquejada = (d: Desat, i: number) => i === 0 || illaCompleta(d, i - 1);
/** Isla donde está el barco: la primera sin completar (o la última). */
export function illaActual(d: Desat): number {
  const i = d.progres.findIndex(p => p < NIVELLS_ILLA);
  return i < 0 ? N_ILLES - 1 : i;
}
/** Nivel que se juega al tocar una isla: el siguiente pendiente o, si ya está completa, uno cualquiera para repetir. */
export function nivellPer(d: Desat, i: number): number {
  return illaCompleta(d, i) ? d.missionsCompletades % NIVELLS_ILLA : d.progres[i];
}

/** Al terminar: suma la misión, avanza el progreso de la isla y guarda el premio sin duplicarlo. */
export function completaMissio(d: Desat, premi: string | null): Desat {
  const m = d.missio;
  const progres = [...d.progres];
  if (m) progres[m.illa] = Math.max(progres[m.illa], m.nivell + 1);
  return {
    ...d,
    missio: null,
    progres,
    missionsCompletades: d.missionsCompletades + 1,
    premis: premi && !d.premis.includes(premi) ? [...d.premis, premi] : d.premis,
    banderiActiu: premi && BANDERINS.includes(premi) ? premi : d.banderiActiu,
  };
}
