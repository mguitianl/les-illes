/* Niveles y frases. Sin dependencias: lo usa también eines/generar-audio.mjs para crear los clips.
   Cada nivel es [recoger, añadir, entregar]. El total nunca pasa de 5 (ver diseño, §8). */

export const NIVELLS: readonly (readonly [number, number, number])[] = [
  [3, 1, 2], // 3 + 1 = 4 · 4 − 2 = 2 (la misión de observación)
  [2, 1, 1], // 3 · 2
  [2, 2, 1], // 4 · 3
  [1, 2, 2], // 3 · 1
  [3, 2, 1], // 5 · 4
  [4, 1, 3], // 5 · 2
  [2, 3, 2], // 5 · 3
  [1, 3, 3], // 4 · 1
  [3, 2, 4], // 5 · 1
  [2, 2, 3], // 4 · 1
];

const NOMBRES = ['zero', 'una', 'dues', 'tres', 'quatre', 'cinc'];
const n = (x: number) => NOMBRES[x];
const N = (x: number) => n(x)[0].toUpperCase() + n(x).slice(1);
const pomes = (x: number) => (x === 1 ? 'una poma' : `${n(x)} pomes`);

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
};

/** Rótulos: lo mismo que dice la voz, sin punto final. */
export const rotul = {
  recull: (a: number) => `Posa ${pomes(a)} a la cistella`,
  afegeix: (b: number) => `N'hem trobat ${n(b)} més`,
  dona: (c: number) => `Dona ${pomes(c)} al mariner`,
};

const FIXES: Record<string, string> = {
  port: 'Preparem el berenar? Toca la cistella.',
  continuem: 'Continuem el berenar? Toca la cistella.',
  final: 'El berenar està a punt. Fins aviat!',
  total: 'Quantes pomes tenim ara?',
  queden: 'Quantes pomes queden a la cistella?',
  banderi: 'El berenar està a punt. Tria una bandera per al vaixell.',
  'demo-cistella': 'Mira. Agafa una poma i porta-la a la cistella. Si vols, la pots tornar.',
  'demo-safata': 'Mira. Agafa una poma i porta-la a la safata. Si vols, la pots tornar.',
  'ok-banderi': 'Que bonica! La posem al vaixell.',
  'a-port': 'Toca la cistella.',
  'a-mira': 'Mira la cistella.',
  'a-banderi': 'Toca una bandera.',
  comptem: 'Comptem-les.',
};
export const NUMEROS = [1, 2, 3, 4, 5].map(x => [`n${x}`, `${N(x)}.`] as const);

/** Todas las frases que necesitan los niveles: clave del clip → texto. */
export function frases(): Record<string, string> {
  const f: Record<string, string> = { ...FIXES };
  for (const [a, b, c] of NIVELLS) {
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
  return f;
}
