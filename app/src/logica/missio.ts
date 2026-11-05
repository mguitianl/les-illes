/* Misión «El berenar de la tripulació»: contenido declarativo y transiciones puras.
   La animación y el audio no forman parte de este módulo. */
import { afegeix, compte, esValid, transfereix, type Objecte, type Recompte, type ZonaId } from './quantitats';

export type Habilitat = 'recompte' | 'suma' | 'resta' | 'estetica';
export type TipusAjuda = 'cap' | 'senyalar' | 'comptar' | 'demostrar';
export const AJUDES: readonly TipusAjuda[] = ['cap', 'senyalar', 'comptar', 'demostrar'];
export type Terme = number | '+' | '−' | '=';
export const BANDERINS = ['banderi-poma', 'banderi-estel'] as const;
export type Banderi = (typeof BANDERINS)[number];

interface PasBase {
  id: string;
  rotul: string;
  veu: string;
  ajuda: string;
  ok: string;
  habilitat: Habilitat;
  /** Zonas que se ven en este paso. */
  visibles: ZonaId[];
  /** Objetos que aparecen al entrar en el paso. */
  nous?: Recompte;
  equacioInicial?: Terme[];
  equacioOk?: Terme[];
  quantitats: number[];
}
export interface PasMoure extends PasBase {
  tipus: 'moure';
  origen: ZonaId;
  desti: ZonaId;
  /** Cantidad que debe haber en el destino al confirmar. */
  objectiu: number;
  demo: string;
}
export interface PasTriar extends PasBase {
  tipus: 'triar';
  opcions: number[];
  correcta: number;
  zonaComptar: ZonaId;
}
export interface PasBanderi extends PasBase {
  tipus: 'banderi';
  opcions: readonly Banderi[];
}
export type Pas = PasMoure | PasTriar | PasBanderi;

export const PASSOS: readonly Pas[] = [
  {
    id: 'recull', tipus: 'moure', rotul: 'Posa tres pomes a la cistella', veu: 'recull', ajuda: 'a-recull',
    ok: 'ok-recull', demo: 'demo-cistella', habilitat: 'recompte', origen: 'arbre', desti: 'cistella',
    objectiu: 3, nous: { arbre: 5 }, visibles: ['arbre', 'cistella'], quantitats: [3],
  },
  {
    id: 'afegeix', tipus: 'moure', rotul: "N'hem trobat una més", veu: 'afegeix', ajuda: 'a-afegeix',
    ok: 'ok-afegeix', demo: 'demo-cistella', habilitat: 'suma', origen: 'terra', desti: 'cistella',
    objectiu: 4, nous: { terra: 1 }, visibles: ['terra', 'cistella'], equacioOk: [3, '+', 1], quantitats: [3, 1],
  },
  {
    // El resultado de la suma se muestra solo después de responder.
    id: 'total', tipus: 'triar', rotul: 'Quantes pomes tenim ara?', veu: 'total', ajuda: 'a-mira',
    ok: 'ok-total', habilitat: 'suma', opcions: [4, 3], correcta: 4, zonaComptar: 'cistella',
    visibles: ['terra', 'cistella'], equacioInicial: [3, '+', 1], equacioOk: [3, '+', 1, '=', 4], quantitats: [3, 1],
  },
  {
    id: 'dona', tipus: 'moure', rotul: 'Dona dues pomes al mariner', veu: 'dona', ajuda: 'a-dona',
    ok: 'ok-dona', demo: 'demo-safata', habilitat: 'resta', origen: 'cistella', desti: 'safata',
    objectiu: 2, visibles: ['safata', 'cistella'], equacioOk: [4, '−', 2], quantitats: [4, 2],
  },
  {
    id: 'queden', tipus: 'triar', rotul: 'Quantes pomes queden a la cistella?', veu: 'queden', ajuda: 'a-mira',
    ok: 'ok-queden', habilitat: 'resta', opcions: [4, 2], correcta: 2, zonaComptar: 'cistella',
    visibles: ['safata', 'cistella'], equacioInicial: [4, '−', 2], equacioOk: [4, '−', 2, '=', 2], quantitats: [4, 2],
  },
  {
    id: 'banderi', tipus: 'banderi', rotul: 'Tria una bandera per al vaixell', veu: 'banderi', ajuda: 'a-banderi',
    ok: 'ok-banderi', habilitat: 'estetica', opcions: BANDERINS, visibles: [], quantitats: [],
  },
];

export interface EstatMissio {
  /** Índice del paso; PASSOS.length significa misión terminada. */
  pas: number;
  objectes: Objecte[];
  nivellAjuda: number;
  errors: number;
  primeraResposta: number | string | null;
  triada: number | string | null;
  moguts: number;
  fase: 'joc' | 'exit';
  banderi: Banderi | null;
}

export interface Intent {
  data: string;
  pas: string;
  habilitat: Habilitat;
  quantitats: number[];
  resposta: number | string;
  primeraResposta: number | string;
  ajuda: TipusAjuda;
  /** Solo es independiente si no hubo ninguna ayuda ni respuesta previa incorrecta. */
  independent: boolean;
  completat: true;
}

export const pasActual = (e: EstatMissio): Pas | null => PASSOS[e.pas] ?? null;
export const acabada = (e: EstatMissio): boolean => e.pas >= PASSOS.length;

function entra(e: EstatMissio, pas: number): EstatMissio {
  const p = PASSOS[pas];
  return {
    ...e,
    pas,
    objectes: p?.nous ? afegeix(e.objectes, p.nous) : e.objectes,
    nivellAjuda: 0, errors: 0, primeraResposta: null, triada: null, moguts: 0, fase: 'joc',
  };
}

export function inicia(): EstatMissio {
  return entra({ pas: 0, objectes: [], nivellAjuda: 0, errors: 0, primeraResposta: null, triada: null, moguts: 0, fase: 'joc', banderi: null }, 0);
}

export function respostaActual(e: EstatMissio): number | string | null {
  const p = pasActual(e);
  if (!p) return null;
  return p.tipus === 'moure' ? compte(e.objectes, p.desti) : e.triada;
}

export function esCorrecta(e: EstatMissio): boolean {
  const p = pasActual(e);
  if (!p) return false;
  if (p.tipus === 'moure') return compte(e.objectes, p.desti) === p.objectiu;
  if (p.tipus === 'triar') return e.triada === p.correcta;
  return (BANDERINS as readonly string[]).includes(String(e.triada));
}

export type Accio =
  | { t: 'moure'; id: number; zona: ZonaId }
  | { t: 'triar'; valor: number | string }
  | { t: 'ajuda' }
  | { t: 'seguent' };

export function aplica(e: EstatMissio, a: Accio): EstatMissio {
  const p = pasActual(e);
  if (!p) return e;
  switch (a.t) {
    case 'moure': {
      if (e.fase !== 'joc' || p.tipus !== 'moure') return e;
      const o = e.objectes.find(x => x.id === a.id);
      const permeses = [p.origen, p.desti];
      if (!o || !permeses.includes(o.zona) || !permeses.includes(a.zona)) return e;
      const nous = transfereix(e.objectes, a.id, a.zona);
      return nous ? { ...e, objectes: nous, moguts: e.moguts + 1 } : e;
    }
    case 'triar': {
      if (e.fase !== 'joc' || p.tipus === 'moure') return e;
      const valid = p.tipus === 'triar' ? p.opcions.includes(a.valor as number) : (p.opcions as readonly string[]).includes(String(a.valor));
      return valid ? { ...e, triada: a.valor } : e;
    }
    case 'ajuda':
      return e.fase === 'joc' ? { ...e, nivellAjuda: Math.min(e.nivellAjuda + 1, 3) } : e;
    case 'seguent':
      return e.fase === 'exit' ? entra(e, e.pas + 1) : e;
  }
}

/** Confirmar: si es correcto pasa a «éxito» y devuelve el intento; si no, sube un nivel de ayuda. */
export function confirma(e: EstatMissio, ara = new Date()): { estat: EstatMissio; correcte: boolean; intent?: Intent } {
  const p = pasActual(e);
  if (!p || e.fase !== 'joc') return { estat: e, correcte: false };
  const resposta = respostaActual(e);
  if (resposta === null) return { estat: e, correcte: false };
  const primera = e.primeraResposta ?? resposta;
  if (!esCorrecta(e)) {
    return { estat: { ...e, errors: e.errors + 1, primeraResposta: primera, nivellAjuda: Math.min(e.nivellAjuda + 1, 3) }, correcte: false };
  }
  const intent: Intent = {
    data: ara.toISOString(), pas: p.id, habilitat: p.habilitat, quantitats: p.quantitats,
    resposta, primeraResposta: primera, ajuda: AJUDES[e.nivellAjuda], independent: e.nivellAjuda === 0 && e.errors === 0,
    completat: true,
  };
  const banderi = p.tipus === 'banderi' ? (resposta as Banderi) : e.banderi;
  return { estat: { ...e, fase: 'exit', primeraResposta: primera, banderi }, correcte: true, intent };
}

export function esEstatValid(x: unknown): x is EstatMissio {
  if (!x || typeof x !== 'object') return false;
  const e = x as EstatMissio;
  return Number.isInteger(e.pas) && e.pas >= 0 && e.pas <= PASSOS.length
    && esValid(e.objectes)
    && Number.isInteger(e.nivellAjuda) && e.nivellAjuda >= 0 && e.nivellAjuda <= 3
    && Number.isInteger(e.errors) && Number.isInteger(e.moguts)
    && (e.fase === 'joc' || e.fase === 'exit')
    && (e.banderi === null || (BANDERINS as readonly string[]).includes(e.banderi));
}
