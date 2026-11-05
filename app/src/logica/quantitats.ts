/* Motor de cantidades: funciones puras e inmutables.
   Invariante: cada objeto está en una única zona y ocupa una única plaza. */

export const ZONES = ['arbre', 'terra', 'cistella', 'safata'] as const;
export type ZonaId = (typeof ZONES)[number];

export const CAPACITAT: Record<ZonaId, number> = { arbre: 5, terra: 1, cistella: 5, safata: 5 };

export interface Objecte {
  id: number;
  zona: ZonaId;
  placa: number;
}

export type Recompte = Partial<Record<ZonaId, number>>;

export const compte = (objs: readonly Objecte[], zona: ZonaId): number =>
  objs.filter(o => o.zona === zona).length;

export function placaLliure(objs: readonly Objecte[], zona: ZonaId): number {
  for (let i = 0; i < CAPACITAT[zona]; i++) {
    if (!objs.some(o => o.zona === zona && o.placa === i)) return i;
  }
  return -1;
}

/** Añade objetos nuevos a las zonas indicadas (p. ej. la manzana encontrada). */
export function afegeix(objs: readonly Objecte[], nous: Recompte): Objecte[] {
  const out = [...objs];
  let id = objs.reduce((m, o) => Math.max(m, o.id), -1) + 1;
  for (const z of ZONES) {
    for (let i = 0; i < (nous[z] ?? 0); i++) {
      const placa = placaLliure(out, z);
      if (placa < 0) throw new Error(`Zona ${z} plena`);
      out.push({ id: id++, zona: z, placa });
    }
  }
  return out;
}

/** Traslada un objeto. Devuelve null si no es válido: no existe, ya está allí o el destino está lleno. */
export function transfereix(objs: readonly Objecte[], id: number, zona: ZonaId): Objecte[] | null {
  const o = objs.find(x => x.id === id);
  if (!o || o.zona === zona) return null;
  const placa = placaLliure(objs, zona);
  if (placa < 0) return null;
  return objs.map(x => (x.id === id ? { id, zona, placa } : x));
}

/** Comprueba las invariantes; se usa también para validar una partida guardada. */
export function esValid(objs: unknown): objs is Objecte[] {
  if (!Array.isArray(objs)) return false;
  const ids = new Set<number>();
  const places = new Set<string>();
  for (const o of objs) {
    if (!o || typeof o !== 'object') return false;
    const { id, zona, placa } = o as Objecte;
    if (!Number.isInteger(id) || ids.has(id)) return false;
    if (!(ZONES as readonly string[]).includes(zona)) return false;
    if (!Number.isInteger(placa) || placa < 0 || placa >= CAPACITAT[zona]) return false;
    const k = `${zona}:${placa}`;
    if (places.has(k)) return false;
    ids.add(id);
    places.add(k);
  }
  return true;
}
