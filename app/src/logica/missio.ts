/* Misiones de cada isla: contenido declarativo y transiciones puras.
   La animación y el audio no forman parte de este módulo. */
import { afegeix, compte, esValid, transfereix, type Objecte, type Recompte, type ZonaId } from './quantitats';
import {
  ILLES, NIVELLS_BADIA, NIVELLS_BERENAR, NIVELLS_BOSC, NIVELLS_ILLA, NIVELLS_TRESOR, PREMIS, TRESOR_AMB_FORATS,
  clau, rotul, type Cara, type IllaId,
} from './textos';

export type Habilitat = 'recompte' | 'suma' | 'resta' | 'comparar' | 'falta' | 'memoria' | 'estetica';
export type TipusAjuda = 'cap' | 'senyalar' | 'comptar' | 'demostrar';
export const AJUDES: readonly TipusAjuda[] = ['cap', 'senyalar', 'comptar', 'demostrar'];
export type Terme = number | '+' | '−' | '=' | '?';
export const BANDERINS = PREMIS.berenar;
export type Banderi = string;
export { ILLES, NIVELLS_ILLA, PREMIS, type IllaId };
export const N_ILLES = ILLES.length;

interface PasBase {
  id: string;
  rotul: string;
  veu: string;
  ajuda: string;
  ok: string;
  habilitat: Habilitat;
  /** Zonas que se ven en este paso. */
  visibles: ZonaId[];
  /** Zonas que se vacían al entrar (p. ej. el primer cofre se lo llevan). */
  retira?: ZonaId[];
  /** Objetos que aparecen al entrar en el paso. */
  nous?: Recompte;
  /** Objetos que ya estaban (se dibujan distintos de los que añade Nicole). */
  nousMarcats?: Recompte;
  /** Huecos de la cantidad objetivo visibles desde el principio. */
  forats?: boolean;
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
  /** Contar solo los objetos no marcados (los que ha puesto Nicole). */
  nomesNous?: boolean;
}
export interface PasComparar extends PasBase {
  tipus: 'comparar';
  opcions: ZonaId[];
  correcta: ZonaId;
}
export interface PasMemory extends PasBase {
  tipus: 'memory';
  parelles: number;
  a: Cara;
  b: Cara;
}
export interface PasPremi extends PasBase {
  tipus: 'premi';
}
export type Pas = PasMoure | PasTriar | PasComparar | PasMemory | PasPremi;

export interface Carta { valor: number; cara: Cara; feta: boolean }

/** Objeto que se mueve en cada isla. */
export const OBJECTE: Record<IllaId, string> = { berenar: 'poma', badia: 'tortuga', tresor: 'moneda', bosc: 'poma' };

const PREMI_PAS: Record<IllaId, { rotul: string; veu: string; ok: string }> = {
  berenar: { rotul: 'Tria una bandera per al vaixell', veu: 'banderi', ok: 'ok-banderi' },
  badia: { rotul: 'Tria una petxina', veu: 'badia-premi', ok: 'ok-badia-premi' },
  tresor: { rotul: 'Tria un tresor', veu: 'tresor-premi', ok: 'ok-tresor-premi' },
  bosc: { rotul: 'Tria una papallona', veu: 'bosc-premi', ok: 'ok-bosc-premi' },
};
const premi = (illa: IllaId): PasPremi => ({
  id: 'premi', tipus: 'premi', ...PREMI_PAS[illa], ajuda: 'a-premi', habilitat: 'estetica', visibles: [], quantitats: [],
});
const ordre = <T>(parell: boolean, a: T, b: T): T[] => (parell ? [a, b] : [b, a]);

function berenar(nivell: number): Pas[] {
  const [a, b, c] = NIVELLS_BERENAR[nivell];
  const s = a + b, r = s - c;
  // Posición de la respuesta correcta alterna entre niveles y entre las dos preguntas.
  const parell = nivell % 2 === 0;
  return [
    {
      id: 'recull', tipus: 'moure', rotul: rotul.recull(a), veu: clau.recull(a), ajuda: clau.aRecull(a),
      ok: clau.okRecull(a), demo: 'demo-cistella', habilitat: 'recompte', origen: 'arbre', desti: 'cistella',
      objectiu: a, nous: { arbre: 5 }, visibles: ['arbre', 'cistella'], quantitats: [a],
    },
    {
      id: 'afegeix', tipus: 'moure', rotul: rotul.afegeix(b), veu: clau.afegeix(a, b), ajuda: clau.aAfegeix(b),
      ok: clau.okAfegeix(b), demo: 'demo-cistella', habilitat: 'suma', origen: 'terra', desti: 'cistella',
      objectiu: s, nous: { terra: b }, visibles: ['terra', 'cistella'], equacioOk: [a, '+', b], quantitats: [a, b],
    },
    {
      // El resultado de la suma se muestra solo después de responder.
      id: 'total', tipus: 'triar', rotul: 'Quantes pomes tenim ara?', veu: 'total', ajuda: 'a-mira',
      ok: clau.okTotal(a, b), habilitat: 'suma', opcions: ordre(parell, s, a), correcta: s, zonaComptar: 'cistella',
      visibles: ['terra', 'cistella'], equacioInicial: [a, '+', b], equacioOk: [a, '+', b, '=', s], quantitats: [a, b],
    },
    {
      id: 'dona', tipus: 'moure', rotul: rotul.dona(c), veu: clau.dona(c), ajuda: clau.aDona(c),
      ok: clau.okDona(c), demo: 'demo-safata', habilitat: 'resta', origen: 'cistella', desti: 'safata',
      objectiu: c, visibles: ['safata', 'cistella'], equacioOk: [s, '−', c], quantitats: [s, c],
    },
    {
      id: 'queden', tipus: 'triar', rotul: 'Quantes pomes queden a la cistella?', veu: 'queden', ajuda: 'a-mira',
      ok: clau.okQueden(r), habilitat: 'resta', opcions: ordre(parell, s, r), correcta: r, zonaComptar: 'cistella',
      visibles: ['safata', 'cistella'], equacioInicial: [s, '−', c], equacioOk: [s, '−', c, '=', r], quantitats: [s, c],
    },
    premi('berenar'),
  ];
}

function badia(nivell: number): Pas[] {
  const [tot, puja, baixa] = NIVELLS_BADIA[nivell];
  const roca = tot - puja, r = puja - baixa;
  const mes: ZonaId = puja > roca ? 'barca' : 'roca';
  const parell = nivell % 2 === 0;
  return [
    {
      id: 'puja', tipus: 'moure', rotul: rotul.puja(puja), veu: clau.puja(puja), ajuda: clau.aPuja(puja),
      ok: clau.okPuja(puja), demo: 'demo-barca', habilitat: 'recompte', origen: 'roca', desti: 'barca',
      objectiu: puja, nous: { roca: tot }, visibles: ['roca', 'barca'], quantitats: [puja],
    },
    {
      id: 'mes', tipus: 'comparar', rotul: "On n'hi ha més?", veu: 'badia-mes', ajuda: 'a-badia-mes', ok: clau.okMes(mes),
      habilitat: 'comparar', opcions: ['roca', 'barca'], correcta: mes, visibles: ['roca', 'barca'], quantitats: [puja, roca],
    },
    {
      id: 'baixa', tipus: 'moure', rotul: rotul.baixa(baixa), veu: clau.baixa(baixa), ajuda: clau.aBaixa(baixa),
      ok: clau.okBaixa(baixa), demo: 'demo-platja', habilitat: 'resta', origen: 'barca', desti: 'platja',
      objectiu: baixa, visibles: ['platja', 'barca'], equacioOk: [puja, '−', baixa], quantitats: [puja, baixa],
    },
    {
      id: 'queden', tipus: 'triar', rotul: 'Quantes tortugues queden a la barca?', veu: 'badia-queden', ajuda: 'a-badia-mira',
      ok: clau.okBadiaQueden(puja, baixa), habilitat: 'resta', opcions: ordre(parell, puja, r), correcta: r, zonaComptar: 'barca',
      visibles: ['platja', 'barca'], equacioInicial: [puja, '−', baixa], equacioOk: [puja, '−', baixa, '=', r], quantitats: [puja, baixa],
    },
    premi('badia'),
  ];
}

function tresor(nivell: number): Pas[] {
  const forats = TRESOR_AMB_FORATS[nivell];
  const parell = nivell % 2 === 0;
  const passos: Pas[] = [];
  NIVELLS_TRESOR[nivell].forEach(([t, k], i) => {
    const falta = t - k;
    passos.push(
      {
        id: 'omple', tipus: 'moure', rotul: rotul.omple(t), veu: clau.omple(i === 0, t, k), ajuda: clau.aOmple(t),
        ok: clau.okOmple(t), demo: 'demo-cofre', habilitat: 'falta', origen: 'sorra', desti: 'cofre', objectiu: t,
        retira: ['sorra', 'cofre'], nous: { sorra: 5 }, nousMarcats: { cofre: k }, forats,
        visibles: ['sorra', 'cofre'], equacioInicial: [k, '+', '?', '=', t], quantitats: [k, t],
      },
      {
        id: 'falten', tipus: 'triar', rotul: 'Quantes monedes hi has posat?', veu: 'tresor-quantes', ajuda: 'a-tresor-mira',
        ok: clau.okFalten(k, t), habilitat: 'falta', opcions: ordre(parell === (i === 0), falta, t), correcta: falta,
        zonaComptar: 'cofre', nomesNous: true, visibles: ['sorra', 'cofre'],
        equacioInicial: [k, '+', '?', '=', t], equacioOk: [k, '+', falta, '=', t], quantitats: [k, t],
      },
    );
  });
  passos.push(premi('tresor'));
  return passos;
}

function bosc(nivell: number): Pas[] {
  const { parelles, a, b } = NIVELLS_BOSC[nivell];
  return [
    {
      id: 'parelles', tipus: 'memory', rotul: 'Busca les parelles', veu: `bosc-${nivell + 1}`, ajuda: 'a-bosc', ok: 'bosc-fet',
      habilitat: 'memoria', parelles, a, b, visibles: [], quantitats: [parelles],
    },
    premi('bosc'),
  ];
}

const GENERA: Record<IllaId, (n: number) => Pas[]> = { berenar, badia, tresor, bosc };
const TOTS = ILLES.map(i => Array.from({ length: NIVELLS_ILLA }, (_, n) => GENERA[i](n)));
export const passos = (illa: number, nivell: number): readonly Pas[] => TOTS[illa]?.[nivell] ?? TOTS[0][0];
/** Compatibilidad: la misión de observación (berenar, nivel 1). */
export const PASSOS = TOTS[0][0];

/** Clips de voz que puede necesitar una misión, para cargarlos antes de que hagan falta. */
export function clipsMissio(illa: number, nivell: number): string[] {
  const out = new Set(['port', 'mapa', 'a-mapa', 'mapa-nova', 'mapa-premi', 'comptem', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6']);
  for (const p of passos(illa, nivell)) {
    out.add(p.veu); out.add(p.ajuda); out.add(p.ok);
    if (p.tipus === 'moure') out.add(p.demo);
    if (p.tipus === 'memory') { out.add('bosc-parella'); out.add('bosc-no'); }
  }
  return [...out];
}

export interface EstatMissio {
  illa: number;
  nivell: number;
  /** Índice del paso; la longitud de la misión significa terminada. */
  pas: number;
  objectes: Objecte[];
  /** Ids de objetos que ya estaban en el recipiente (no los ha puesto Nicole). */
  marcats: number[];
  cartes: Carta[];
  /** Cartas giradas que todavía no forman pareja (como mucho dos). */
  girades: number[];
  /** Los dos premios que se ofrecen al final. */
  opcionsPremi: string[];
  nivellAjuda: number;
  errors: number;
  primeraResposta: number | string | null;
  triada: number | string | null;
  moguts: number;
  fase: 'joc' | 'exit';
  premi: string | null;
}

export interface Intent {
  data: string;
  illa?: number;
  nivell?: number;
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

export const passosDe = (e: EstatMissio) => passos(e.illa, e.nivell);
export const pasActual = (e: EstatMissio): Pas | null => passosDe(e)[e.pas] ?? null;
export const acabada = (e: EstatMissio): boolean => e.pas >= passosDe(e).length;
export const esUltimPas = (e: EstatMissio): boolean => e.pas === passosDe(e).length - 1;
export const illaId = (e: EstatMissio): IllaId => ILLES[e.illa] ?? 'berenar';

function entra(e: EstatMissio, pas: number): EstatMissio {
  const p = passosDe(e)[pas];
  let objectes = e.objectes;
  let marcats = e.marcats;
  if (p?.retira) {
    const fora = new Set(objectes.filter(o => p.retira!.includes(o.zona)).map(o => o.id));
    objectes = objectes.filter(o => !fora.has(o.id));
    marcats = marcats.filter(id => !fora.has(id));
  }
  if (p?.nous) objectes = afegeix(objectes, p.nous);
  if (p?.nousMarcats) {
    const abans = new Set(objectes.map(o => o.id));
    objectes = afegeix(objectes, p.nousMarcats);
    marcats = [...marcats, ...objectes.filter(o => !abans.has(o.id)).map(o => o.id)];
  }
  return {
    ...e, pas, objectes, marcats, girades: [],
    nivellAjuda: 0, errors: 0, primeraResposta: null, triada: null, moguts: 0, fase: 'joc',
  };
}

function barreja<T>(xs: T[], aleatori: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(aleatori() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Dos premios que todavía no tiene; si ya los tiene todos, dos cualesquiera. */
export function triaPremis(illa: number, tinguts: readonly string[], nivell = 0): string[] {
  const tots = PREMIS[ILLES[illa] ?? 'berenar'];
  const nous = tots.filter(p => !tinguts.includes(p));
  const base = nous.length >= 2 ? nous : [...nous, ...tots.filter(p => !nous.includes(p))];
  const desp = nous.length >= 2 ? 0 : (2 * nivell) % base.length;
  return [base[desp % base.length], base[(desp + 1) % base.length]];
}

export function inicia(illa = 0, nivell = 0, tinguts: readonly string[] = [], aleatori: () => number = Math.random): EstatMissio {
  const il = Number.isInteger(illa) && illa >= 0 && illa < N_ILLES ? illa : 0;
  const nv = Number.isInteger(nivell) && nivell >= 0 && nivell < NIVELLS_ILLA ? nivell : 0;
  let cartes: Carta[] = [];
  const mem = passos(il, nv).find(p => p.tipus === 'memory') as PasMemory | undefined;
  if (mem) {
    const valors = Array.from({ length: mem.parelles }, (_, i) => i + 1);
    cartes = barreja(valors.flatMap(v => [{ valor: v, cara: mem.a, feta: false }, { valor: v, cara: mem.b, feta: false }]), aleatori);
  }
  const base: EstatMissio = {
    illa: il, nivell: nv, pas: 0, objectes: [], marcats: [], cartes, girades: [], opcionsPremi: triaPremis(il, tinguts, nv),
    nivellAjuda: 0, errors: 0, primeraResposta: null, triada: null, moguts: 0, fase: 'joc', premi: null,
  };
  return entra(base, 0);
}

export function respostaActual(e: EstatMissio): number | string | null {
  const p = pasActual(e);
  if (!p) return null;
  if (p.tipus === 'moure') return compte(e.objectes, p.desti);
  if (p.tipus === 'memory') return e.cartes.every(c => c.feta) ? e.moguts : null;
  return e.triada;
}

export function esCorrecta(e: EstatMissio): boolean {
  const p = pasActual(e);
  if (!p) return false;
  switch (p.tipus) {
    case 'moure': return compte(e.objectes, p.desti) === p.objectiu;
    case 'triar': return e.triada === p.correcta;
    case 'comparar': return e.triada === p.correcta;
    case 'memory': return e.cartes.length > 0 && e.cartes.every(c => c.feta);
    case 'premi': return e.opcionsPremi.includes(String(e.triada));
  }
}

export type Accio =
  | { t: 'moure'; id: number; zona: ZonaId }
  | { t: 'triar'; valor: number | string }
  | { t: 'girar'; i: number }
  | { t: 'tapar' }
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
      if (e.fase !== 'joc') return e;
      let valid = false;
      if (p.tipus === 'triar') valid = p.opcions.includes(a.valor as number);
      else if (p.tipus === 'comparar') valid = (p.opcions as string[]).includes(String(a.valor));
      else if (p.tipus === 'premi') valid = e.opcionsPremi.includes(String(a.valor));
      return valid ? { ...e, triada: a.valor } : e;
    }
    case 'girar': {
      if (e.fase !== 'joc' || p.tipus !== 'memory') return e;
      const c = e.cartes[a.i];
      if (!c || c.feta || e.girades.includes(a.i) || e.girades.length >= 2) return e;
      const girades = [...e.girades, a.i];
      if (girades.length < 2) return { ...e, girades, moguts: e.moguts + 1 };
      const [x, y] = girades.map(i => e.cartes[i]);
      if (x.valor !== y.valor) return { ...e, girades, moguts: e.moguts + 1 };
      return { ...e, girades: [], moguts: e.moguts + 1, cartes: e.cartes.map((k, i) => (girades.includes(i) ? { ...k, feta: true } : k)) };
    }
    case 'tapar':
      return p.tipus === 'memory' && e.girades.length === 2 ? { ...e, girades: [] } : e;
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
    data: ara.toISOString(), illa: e.illa, nivell: e.nivell, pas: p.id, habilitat: p.habilitat, quantitats: p.quantitats,
    resposta, primeraResposta: primera, ajuda: AJUDES[e.nivellAjuda], independent: e.nivellAjuda === 0 && e.errors === 0,
    completat: true,
  };
  const premi = p.tipus === 'premi' ? String(resposta) : e.premi;
  return { estat: { ...e, fase: 'exit', primeraResposta: primera, premi }, correcte: true, intent };
}

export function esEstatValid(x: unknown): x is EstatMissio {
  if (!x || typeof x !== 'object') return false;
  const e = x as EstatMissio;
  return Number.isInteger(e.illa) && e.illa >= 0 && e.illa < N_ILLES
    && Number.isInteger(e.nivell) && e.nivell >= 0 && e.nivell < NIVELLS_ILLA
    && Number.isInteger(e.pas) && e.pas >= 0 && e.pas <= passos(e.illa, e.nivell).length
    && esValid(e.objectes)
    && Array.isArray(e.marcats) && Array.isArray(e.cartes) && Array.isArray(e.girades)
    && Array.isArray(e.opcionsPremi) && e.opcionsPremi.every(p => typeof p === 'string')
    && Number.isInteger(e.nivellAjuda) && e.nivellAjuda >= 0 && e.nivellAjuda <= 3
    && Number.isInteger(e.errors) && Number.isInteger(e.moguts)
    && (e.fase === 'joc' || e.fase === 'exit')
    && (e.premi === null || typeof e.premi === 'string');
}
