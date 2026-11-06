/* Islas, niveles y frases. Sin dependencias: lo usa también eines/generar-audio.mjs para crear los clips.
   Cada isla tiene su escenario, su reto y su premio. Los niveles van de menos a más dentro de la isla. */

export const ILLES = ['berenar', 'badia', 'tresor', 'bosc'] as const;
export type IllaId = (typeof ILLES)[number];
export const NIVELLS_ILLA = 4;

/** Berenar: [recoger, añadir, entregar]. Total hasta 5. */
export const NIVELLS_BERENAR: readonly (readonly [number, number, number])[] = [
  [3, 1, 2], // 3 + 1 = 4 · 4 − 2 = 2 (la misión de observación)
  [2, 2, 1], // 4 · 3
  [3, 2, 4], // 5 · 1
  [2, 3, 2], // 5 · 3
];
/** Badia: [tortugas en la roca, suben a la barca, bajan a la playa]. */
export const NIVELLS_BADIA: readonly (readonly [number, number, number])[] = [
  [5, 3, 1], // barca 3 · roca 2 · quedan 2
  [5, 2, 1], // roca tiene más · quedan 1
  [5, 4, 2], // quedan 2
  [6, 4, 3], // quedan 1
];
/** Tresor: dos cofres por nivel, cada uno [se abre con, ya tiene]. Sin huecos guía en los niveles 3 y 4. */
export const NIVELLS_TRESOR: readonly (readonly [readonly [number, number], readonly [number, number]])[] = [
  [[3, 2], [4, 3]],
  [[4, 2], [5, 3]],
  [[5, 2], [6, 4]],
  [[6, 3], [5, 1]],
];
export const TRESOR_AMB_FORATS = [true, true, false, false];
/** Bosc: parejas de memory. Tipos de carta: grupo de manzanas, cifra o puntos de dado. */
export type Cara = 'grup' | 'xifra' | 'punts';
export const NIVELLS_BOSC: readonly { parelles: number; a: Cara; b: Cara }[] = [
  { parelles: 3, a: 'grup', b: 'grup' },
  { parelles: 4, a: 'grup', b: 'xifra' },
  { parelles: 5, a: 'punts', b: 'grup' },
  { parelles: 6, a: 'xifra', b: 'punts' },
];

/** Premios de cada isla, por orden en que se ofrecen. */
export const PREMIS: Record<IllaId, readonly string[]> = {
  berenar: ['banderi-poma', 'banderi-estel', 'banderi-cor', 'banderi-lluna', 'banderi-peix', 'banderi-ona'],
  badia: ['petxina-rosa', 'petxina-blava', 'petxina-caragol', 'petxina-estel'],
  tresor: ['tresor-corona', 'tresor-collaret', 'tresor-perla', 'tresor-anell'],
  bosc: ['papallona-groga', 'papallona-blava', 'papallona-vermella', 'papallona-verda'],
};

const NOMBRES = ['zero', 'una', 'dues', 'tres', 'quatre', 'cinc', 'sis'];
const n = (x: number) => NOMBRES[x];
const N = (x: number) => n(x)[0].toUpperCase() + n(x).slice(1);
const de = (x: number, sing: string, plur: string) => (x === 1 ? `una ${sing}` : `${n(x)} ${plur}`);
const pomes = (x: number) => de(x, 'poma', 'pomes');
const tortugues = (x: number) => de(x, 'tortuga', 'tortugues');
const monedes = (x: number) => de(x, 'moneda', 'monedes');

export const clau = {
  recull: (a: number) => `recull-${a}`,
  aRecull: (a: number) => `a-recull-${a}`,
  okRecull: (a: number) => `ok-recull-${a}`,
  afegeix: (a: number, b: number) => `afegeix-${a}-${b}`,
  aAfegeix: (b: number) => `a-afegeix-${b}`,
  okAfegeix: (b: number) => `ok-afegeix-${b}`,
  okTotal: (a: number, b: number) => `ok-total-${a}-${b}`,
  dona: (c: number) => `dona-${c}`,
  aDona: (c: number) => `a-dona-${c}`,
  okDona: (c: number) => `ok-dona-${c}`,
  okQueden: (r: number) => `ok-queden-${r}`,
  puja: (x: number) => `badia-puja-${x}`,
  aPuja: (x: number) => `a-badia-puja-${x}`,
  okPuja: (x: number) => `ok-badia-puja-${x}`,
  okMes: (z: string) => `ok-badia-mes-${z}`,
  baixa: (x: number) => `badia-baixa-${x}`,
  aBaixa: (x: number) => `a-badia-baixa-${x}`,
  okBaixa: (x: number) => `ok-badia-baixa-${x}`,
  okBadiaQueden: (t: number, b: number) => `ok-badia-queden-${t}-${b}`,
  omple: (primer: boolean, t: number, k: number) => `tresor-omple${primer ? '' : '2'}-${t}-${k}`,
  aOmple: (t: number) => `a-tresor-omple-${t}`,
  okOmple: (t: number) => `ok-tresor-omple-${t}`,
  okFalten: (k: number, t: number) => `ok-tresor-falten-${k}-${t}`,
};

/** Rótulos: lo mismo que dice la voz, más corto si hace falta. */
export const rotul = {
  recull: (a: number) => `Posa ${pomes(a)} a la cistella`,
  afegeix: (b: number) => `N'hem trobat ${n(b)} més`,
  dona: (c: number) => `Dona ${pomes(c)} al mariner`,
  puja: (x: number) => `Puja ${tortugues(x)} a la barca`,
  baixa: (x: number) => `Fes baixar ${tortugues(x)} a la platja`,
  omple: (t: number) => `Aquest cofre s'obre amb ${monedes(t)}`,
};

const FIXES: Record<string, string> = {
  port: 'Salpem? Toca el timó.',
  'a-port': 'Toca el timó.',
  mapa: "On anem? Toca l'illa del vaixell.",
  'a-mapa': "Toca l'illa on és el vaixell.",
  'mapa-nova': 'Molt bé! Anem cap a una illa nova!',
  'mapa-premi': 'Molt bé! Mira el teu premi.',
  // Berenar
  total: 'Quantes pomes tenim ara?',
  queden: 'Quantes pomes queden a la cistella?',
  banderi: 'El berenar està a punt. Tria una bandera per al vaixell.',
  'demo-cistella': 'Mira. Agafa una poma i porta-la a la cistella. Si vols, la pots tornar.',
  'demo-safata': 'Mira. Agafa una poma i porta-la a la safata. Si vols, la pots tornar.',
  'ok-banderi': 'Que bonica! La posem al vaixell.',
  'a-mira': 'Mira la cistella.',
  'a-premi': 'Toca el que més t\'agradi.',
  comptem: 'Comptem-les.',
  // Badia
  'badia-mes': "On n'hi ha més, a la barca o a la roca?",
  'a-badia-mes': "Mira la barca i la roca. Toca on n'hi ha més.",
  'badia-queden': 'Quantes tortugues queden a la barca?',
  'a-badia-mira': 'Mira la barca.',
  'demo-barca': 'Mira. Agafa una tortuga i porta-la a la barca. Si vols, la pots tornar.',
  'demo-platja': 'Mira. Agafa una tortuga i porta-la a la platja.',
  'badia-premi': "Les tortugues et regalen una petxina. Tria'n una.",
  'ok-badia-premi': 'Que bonica! La guardem.',
  // Tresor
  'tresor-quantes': 'Quantes monedes hi has posat?',
  'a-tresor-mira': 'Mira les monedes noves del cofre.',
  'demo-cofre': 'Mira. Agafa una moneda i posa-la al cofre. Si vols, la pots tornar.',
  'tresor-premi': 'Els cofres s\'obren! Tria un tresor.',
  'ok-tresor-premi': 'Quin tresor més bonic!',
  // Bosc
  'bosc-1': 'Busca dues cartes iguals. Toca una carta i després una altra.',
  'bosc-2': 'Busca les parelles: les pomes i el número.',
  'bosc-3': 'Busca les parelles: els punts i les pomes.',
  'bosc-4': 'Busca les parelles: el número i els punts.',
  'a-bosc': 'Mira bé. Les cartes es giren un moment.',
  'bosc-parella': 'Parella!',
  'bosc-no': 'Aquestes no són iguals. Torna-ho a provar.',
  'bosc-fet': 'Totes les parelles! Molt bé.',
  'bosc-premi': "Les papallones del bosc volen venir amb nosaltres. Tria'n una.",
  'ok-bosc-premi': 'Ja vola amb nosaltres!',
};
export const NUMEROS = [1, 2, 3, 4, 5, 6].map(x => [`n${x}`, `${N(x)}.`] as const);

/** Todas las frases: clave del clip → texto. */
export function frases(): Record<string, string> {
  const f: Record<string, string> = { ...FIXES };
  for (const [a, b, c] of NIVELLS_BERENAR) {
    const s = a + b, r = s - c;
    f[clau.recull(a)] = `${rotul.recull(a)}.`;
    f[clau.aRecull(a)] = `Volem ${pomes(a)}. Mira la cistella.`;
    f[clau.okRecull(a)] = `Has posat ${pomes(a)} a la cistella.`;
    f[clau.afegeix(a, b)] = `En tenim ${n(a)}. N'hem trobat ${n(b)} més. ${b === 1 ? 'Posa-la' : 'Posa-les'} a la cistella.`;
    f[clau.aAfegeix(b)] = b === 1 ? 'Posa la poma a la cistella.' : `Posa les ${n(b)} pomes a la cistella.`;
    f[clau.okAfegeix(b)] = b === 1 ? 'Has posat la poma a la cistella.' : `Has posat les ${n(b)} pomes a la cistella.`;
    f[clau.okTotal(a, b)] = `Sí. ${N(a)} i ${n(b)}, ${n(s)}. Ara en tenim ${n(s)}.`;
    f[clau.dona(c)] = `${rotul.dona(c)}.`;
    f[clau.aDona(c)] = `Volem donar ${pomes(c)}. Mira la safata.`;
    f[clau.okDona(c)] = `N'has donat ${n(c)} al mariner.`;
    f[clau.okQueden(r)] = r === 1 ? 'Sí. A la cistella en queda una.' : `Sí. A la cistella en queden ${n(r)}.`;
  }
  for (const [, puja, baixa] of NIVELLS_BADIA) {
    const r = puja - baixa;
    f[clau.puja(puja)] = `Hi ha tortugues a la roca. ${rotul.puja(puja)}.`;
    f[clau.aPuja(puja)] = `Volem ${tortugues(puja)} a la barca. Mira la barca.`;
    f[clau.okPuja(puja)] = puja === 1 ? 'Ha pujat una tortuga.' : `Han pujat ${tortugues(puja)}.`;
    f[clau.baixa(baixa)] = `Arribem a la platja. ${rotul.baixa(baixa)}.`;
    f[clau.aBaixa(baixa)] = `Porta ${tortugues(baixa)} a la platja.`;
    f[clau.okBaixa(baixa)] = baixa === 1 ? "N'ha baixat una." : `N'han baixat ${n(baixa)}.`;
    f[clau.okBadiaQueden(puja, baixa)] = `Sí. ${N(puja)} menys ${n(baixa)}, ${n(r)}. A la barca en ${r === 1 ? 'queda una' : `queden ${n(r)}`}.`;
  }
  f[clau.okMes('barca')] = "Sí! A la barca n'hi ha més.";
  f[clau.okMes('roca')] = "Sí! A la roca n'hi ha més.";
  NIVELLS_TRESOR.forEach(cofres => cofres.forEach(([t, k], i) => {
    const falta = t - k;
    f[clau.omple(i === 0, t, k)] = `${i === 0 ? '' : 'Mira, un altre cofre! '}${rotul.omple(t)}. Ja n'hi ha ${n(k)}. Posa les que falten.`;
    f[clau.aOmple(t)] = `El cofre vol ${monedes(t)}. Compta les que hi ha.`;
    f[clau.okOmple(t)] = `Ja n'hi ha ${n(t)}!`;
    f[clau.okFalten(k, t)] = `Sí. ${N(k)} i ${n(falta)}, ${n(t)}. En ${falta === 1 ? 'faltava una' : `faltaven ${n(falta)}`}.`;
  }));
  return f;
}
