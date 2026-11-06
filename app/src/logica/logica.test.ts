import { describe, expect, it } from 'vitest';
import { afegeix, compte, esValid, placaLliure, transfereix, type Objecte } from './quantitats';
import { N_ILLES, NIVELLS_ILLA, PASSOS, acabada, clipsMissio, passos, triaPremis, aplica, confirma, esEstatValid, inicia, pasActual, type EstatMissio } from './missio';
import { CLAU, CLAU_DANYAT, MAX_INTENTS, desbloquejada, illaActual, migra, nivellPer, valida, type Desat, ambIntent, carrega, completaMissio, desa, nou } from './desat';

const ids = (e: EstatMissio, z: string) => e.objectes.filter(o => o.zona === z).map(o => o.id);
const total = (e: EstatMissio) => e.objectes.length;

function mou(e: EstatMissio, de: string, a: string, n: number): EstatMissio {
  for (let i = 0; i < n; i++) e = aplica(e, { t: 'moure', id: ids(e, de)[0], zona: a as never });
  return e;
}
function ok(e: EstatMissio): EstatMissio {
  const r = confirma(e);
  expect(r.correcte).toBe(true);
  return aplica(r.estat, { t: 'seguent' });
}

describe('motor de cantidades', () => {
  it('cada objeto está en un solo lugar y se conserva el total', () => {
    let o: Objecte[] = afegeix([], { arbre: 5 });
    for (let i = 0; i < 5; i++) o = transfereix(o, i, 'cistella')!;
    expect(compte(o, 'cistella')).toBe(5);
    expect(compte(o, 'arbre')).toBe(0);
    expect(o.length).toBe(5);
    expect(esValid(o)).toBe(true);
  });
  it('trasladar dos veces el mismo objeto al mismo sitio no duplica', () => {
    const o = afegeix([], { arbre: 2 });
    const a = transfereix(o, 0, 'cistella')!;
    expect(transfereix(a, 0, 'cistella')).toBeNull();
    expect(compte(a, 'cistella')).toBe(1);
  });
  it('no admite destinos llenos ni objetos inexistentes', () => {
    const o = afegeix([], { terra: 3, arbre: 1 });
    expect(transfereix(o, 3, 'terra')).toBeNull();
    expect(transfereix(o, 99, 'cistella')).toBeNull();
  });
  it('reutiliza la primera plaza libre', () => {
    let o = afegeix([], { arbre: 3 });
    o = transfereix(o, 0, 'cistella')!; o = transfereix(o, 1, 'cistella')!;
    o = transfereix(o, 0, 'arbre')!;
    expect(placaLliure(o, 'cistella')).toBe(0);
  });
  it('detecta estados incoherentes', () => {
    expect(esValid([{ id: 0, zona: 'cistella', placa: 0 }, { id: 1, zona: 'cistella', placa: 0 }])).toBe(false);
    expect(esValid([{ id: 0, zona: 'cistella', placa: 0 }, { id: 0, zona: 'arbre', placa: 1 }])).toBe(false);
    expect(esValid([{ id: 0, zona: 'mar', placa: 0 }])).toBe(false);
    expect(esValid([{ id: 0, zona: 'terra', placa: 3 }])).toBe(false);
  });
});

describe('misión', () => {
  it('recorrido completo: 3, +1 = 4, entregar 2 de 4 deja 2 y 2', () => {
    let e = inicia();
    expect(pasActual(e)!.id).toBe('recull');
    e = ok(mou(e, 'arbre', 'cistella', 3));
    expect(pasActual(e)!.id).toBe('afegeix');
    expect(compte(e.objectes, 'cistella')).toBe(3);
    expect(compte(e.objectes, 'terra')).toBe(1);
    e = ok(mou(e, 'terra', 'cistella', 1));
    expect(compte(e.objectes, 'cistella')).toBe(4);
    e = ok(aplica(e, { t: 'triar', valor: 4 }));
    e = ok(mou(e, 'cistella', 'safata', 2));
    expect(compte(e.objectes, 'cistella')).toBe(2);
    expect(compte(e.objectes, 'safata')).toBe(2);
    e = ok(aplica(e, { t: 'triar', valor: 2 }));
    expect(aplica(e, { t: 'triar', valor: 'banderi-cor' }).triada).toBeNull();
    e = aplica(e, { t: 'triar', valor: 'banderi-estel' });
    const r = confirma(e);
    expect(r.estat.premi).toBe('banderi-estel');
    e = aplica(r.estat, { t: 'seguent' });
    expect(acabada(e)).toBe(true);
    // Las manzanas que quedan en el árbol siguen allí: nada desaparece.
    expect(total(e)).toBe(6);
  });
  it('con demasiadas no avanza, sube la ayuda y se puede devolver', () => {
    let e = mou(inicia(), 'arbre', 'cistella', 4);
    const r = confirma(e);
    expect(r.correcte).toBe(false);
    expect(r.estat.nivellAjuda).toBe(1);
    expect(r.estat.primeraResposta).toBe(4);
    e = mou(r.estat, 'cistella', 'arbre', 1);
    const r2 = confirma(e);
    expect(r2.correcte).toBe(true);
    expect(r2.intent!.independent).toBe(false);
    expect(r2.intent!.ajuda).toBe('senyalar');
    expect(r2.intent!.primeraResposta).toBe(4);
  });
  it('ayuda y demostración no cuentan como acierto independiente', () => {
    let e = mou(inicia(), 'arbre', 'cistella', 3);
    e = aplica(aplica(aplica(e, { t: 'ajuda' }), { t: 'ajuda' }), { t: 'ajuda' });
    const r = confirma(e);
    expect(r.intent!.ajuda).toBe('demostrar');
    expect(r.intent!.independent).toBe(false);
    expect(aplica(e, { t: 'ajuda' }).nivellAjuda).toBe(3);
  });
  it('acierto sin ayuda es independiente', () => {
    const r = confirma(mou(inicia(), 'arbre', 'cistella', 3));
    expect(r.intent).toMatchObject({ independent: true, ajuda: 'cap', habilitat: 'recompte', resposta: 3 });
  });
  it('no se puede mover a zonas ajenas al paso ni durante el éxito', () => {
    const e = inicia();
    expect(aplica(e, { t: 'moure', id: 0, zona: 'safata' })).toBe(e);
    const exit = confirma(mou(e, 'arbre', 'cistella', 3)).estat;
    expect(aplica(exit, { t: 'moure', id: ids(exit, 'cistella')[0], zona: 'arbre' })).toBe(exit);
  });
  it('confirmar dos veces seguidas no registra dos intentos', () => {
    const r = confirma(mou(inicia(), 'arbre', 'cistella', 3));
    const r2 = confirma(r.estat);
    expect(r2.intent).toBeUndefined();
    expect(r2.estat).toBe(r.estat);
  });
  it('las tarjetas solo aceptan sus opciones; sin elección no hay respuesta', () => {
    let e = ok(mou(inicia(), 'arbre', 'cistella', 3));
    e = ok(mou(e, 'terra', 'cistella', 1));
    expect(confirma(e).estat).toBe(e);
    expect(aplica(e, { t: 'triar', valor: 7 }).triada).toBeNull();
    const r = confirma(aplica(e, { t: 'triar', valor: 3 }));
    expect(r.correcte).toBe(false);
  });
  it('restas ordinarias del recorrido: nunca resultado negativo', () => {
    for (const p of PASSOS) {
      if (p.habilitat === 'resta' && p.equacioOk?.length === 5) {
        const [a, , b, , c] = p.equacioOk as number[];
        expect(a).toBeGreaterThanOrEqual(b);
        expect(c).toBe(a - b);
      }
    }
  });
  it('la respuesta correcta no siempre ocupa la misma posición', () => {
    const pos = PASSOS.filter(p => p.tipus === 'triar').map(p => p.tipus === 'triar' && p.opcions.indexOf(p.correcta));
    expect(new Set(pos).size).toBeGreaterThan(1);
  });
  it('berenar: cada nivel se puede completar y sus cantidades son coherentes', () => {
    for (let n = 0; n < NIVELLS_ILLA; n++) {
      let e = inicia(0, n);
      const [rec, afe, tot, don, que, pre] = passos(0, n);
      if (rec.tipus !== 'moure' || afe.tipus !== 'moure' || tot.tipus !== 'triar' || don.tipus !== 'moure' || que.tipus !== 'triar' || pre.tipus !== 'premi') throw new Error('orden');
      e = ok(mou(e, 'arbre', 'cistella', rec.objectiu));
      const b = compte(e.objectes, 'terra');
      e = ok(mou(e, 'terra', 'cistella', b));
      expect(compte(e.objectes, 'cistella')).toBe(afe.objectiu);
      expect(tot.correcta).toBe(rec.objectiu + b);
      e = ok(aplica(e, { t: 'triar', valor: tot.correcta }));
      e = ok(mou(e, 'cistella', 'safata', don.objectiu));
      expect(compte(e.objectes, 'cistella')).toBe(que.correcta);
      expect(que.correcta).toBeGreaterThan(0);
      e = ok(aplica(e, { t: 'triar', valor: que.correcta }));
      e = ok(aplica(e, { t: 'triar', valor: e.opcionsPremi[1] }));
      expect(acabada(e)).toBe(true);
    }
  });
  it('badia: subir, comparar, bajar y contar las que quedan', () => {
    for (let n = 0; n < NIVELLS_ILLA; n++) {
      let e = inicia(1, n);
      const [puja, mes, baixa, queden] = passos(1, n);
      if (puja.tipus !== 'moure' || mes.tipus !== 'comparar' || baixa.tipus !== 'moure' || queden.tipus !== 'triar') throw new Error('orden');
      const totals = compte(e.objectes, 'roca');
      e = ok(mou(e, 'roca', 'barca', puja.objectiu));
      const [b, r] = [compte(e.objectes, 'barca'), compte(e.objectes, 'roca')];
      expect(b).not.toBe(r);
      expect(mes.correcta).toBe(b > r ? 'barca' : 'roca');
      const mal = confirma(aplica(e, { t: 'triar', valor: mes.correcta === 'barca' ? 'roca' : 'barca' }));
      expect(mal.correcte).toBe(false);
      e = ok(aplica(mal.estat, { t: 'triar', valor: mes.correcta }));
      e = ok(mou(e, 'barca', 'platja', baixa.objectiu));
      expect(compte(e.objectes, 'barca')).toBe(queden.correcta);
      e = ok(aplica(e, { t: 'triar', valor: queden.correcta }));
      e = ok(aplica(e, { t: 'triar', valor: e.opcionsPremi[0] }));
      expect(acabada(e)).toBe(true);
      expect(total(e)).toBe(totals);
    }
  });
  it('tresor: las monedas que ya estaban quedan marcadas y se cuenta lo que falta', () => {
    for (let n = 0; n < NIVELLS_ILLA; n++) {
      let e = inicia(2, n);
      for (let cofre = 0; cofre < 2; cofre++) {
        const omple = pasActual(e)!, falten = passos(2, n)[e.pas + 1];
        if (omple.tipus !== 'moure' || falten.tipus !== 'triar') throw new Error('orden');
        const ja = compte(e.objectes, 'cofre');
        expect(e.marcats.length).toBe(ja);
        expect(e.objectes.filter(o => o.zona === 'cofre').every(o => e.marcats.includes(o.id))).toBe(true);
        expect(compte(e.objectes, 'sorra')).toBe(5);
        e = ok(mou(e, 'sorra', 'cofre', omple.objectiu - ja));
        expect(falten.correcta).toBe(omple.objectiu - ja);
        expect(e.objectes.filter(o => o.zona === 'cofre' && !e.marcats.includes(o.id)).length).toBe(falten.correcta);
        e = ok(aplica(e, { t: 'triar', valor: falten.correcta }));
      }
      e = ok(aplica(e, { t: 'triar', valor: e.opcionsPremi[0] }));
      expect(acabada(e)).toBe(true);
    }
  });
  it('bosc: memory con parejas de la misma cantidad; tapar las que no son pareja', () => {
    let semilla = 7;
    const aleatori = () => ((semilla = (semilla * 9301 + 49297) % 233280) / 233280);
    for (let n = 0; n < NIVELLS_ILLA; n++) {
      let e = inicia(3, n, [], aleatori);
      const p = pasActual(e)!;
      if (p.tipus !== 'memory') throw new Error('memory');
      expect(e.cartes.length).toBe(p.parelles * 2);
      expect(confirma(e).estat).toBe(e);
      // Una pareja incorrecta queda girada hasta que se tapa; no cuenta como error.
      const i = 0, j = e.cartes.findIndex((c, k) => k !== 0 && c.valor !== e.cartes[0].valor);
      e = aplica(aplica(e, { t: 'girar', i }), { t: 'girar', i: j });
      expect(e.girades).toEqual([i, j]);
      expect(aplica(e, { t: 'girar', i: 1 })).toBe(e);
      e = aplica(e, { t: 'tapar' });
      for (let v = 1; v <= p.parelles; v++) {
        const [a, b] = e.cartes.map((c, k) => [c, k] as const).filter(([c]) => c.valor === v).map(([, k]) => k);
        e = aplica(aplica(e, { t: 'girar', i: a }), { t: 'girar', i: b });
      }
      expect(e.cartes.every(c => c.feta)).toBe(true);
      const r = confirma(e);
      expect(r.correcte && r.intent!.independent && r.intent!.habilitat === 'memoria').toBe(true);
      e = ok(aplica(aplica(r.estat, { t: 'seguent' }), { t: 'triar', valor: e.opcionsPremi[0] }));
      expect(acabada(e)).toBe(true);
    }
  });
  it('premios: se ofrecen dos que todavía no tiene', () => {
    expect(triaPremis(1, [])).toEqual(['petxina-rosa', 'petxina-blava']);
    expect(triaPremis(1, ['petxina-rosa'])).toEqual(['petxina-blava', 'petxina-caragol']);
    expect(new Set(triaPremis(1, ['petxina-rosa', 'petxina-blava', 'petxina-caragol', 'petxina-estel'])).size).toBe(2);
  });
  it('hay audio para cada clip que pide una misión', async () => {
    const { frases } = await import('./textos');
    const f = frases();
    // @ts-expect-error: el proyecto no instala los tipos de Node; la prueba corre en Node.
    const { existsSync } = await import('node:fs');
    for (let i = 0; i < N_ILLES; i++) for (let n = 0; n < NIVELLS_ILLA; n++) for (const c of clipsMissio(i, n)) {
      expect(f[c] ?? (/^n\d$/.test(c) ? 'ok' : undefined), c).toBeDefined();
      expect(existsSync(new URL(`../../public/audio/${c}.m4a`, import.meta.url)), `${c}.m4a`).toBe(true);
    }
  });
  it('valida estados guardados', () => {
    expect(esEstatValid(inicia())).toBe(true);
    expect(esEstatValid({ ...inicia(), pas: 99 })).toBe(false);
    expect(esEstatValid({ ...inicia(), nivell: 99 })).toBe(false);
    expect(esEstatValid({ ...inicia(), illa: 9 })).toBe(false);
    expect(esEstatValid({ ...inicia(), objectes: [{ id: 0, zona: 'cistella', placa: 9 }] })).toBe(false);
  });
});

function memoria(inicial: Record<string, string> = {}) {
  const m = new Map(Object.entries(inicial));
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
}

describe('guardado', () => {
  it('guarda y recupera la partida a mitad de un paso', () => {
    const s = memoria();
    const missio = mou(inicia(), 'arbre', 'cistella', 2);
    desa(s, { ...nou(), missio });
    const r = carrega(s);
    expect(r.avis).toBe('cap');
    expect(r.desat.missio).toEqual(missio);
  });
  it('sin datos empieza de cero', () => {
    expect(carrega(memoria()).avis).toBe('nou');
  });
  it('datos dañados: copia de seguridad y partida nueva', () => {
    const s = memoria({ [CLAU]: '{no json' });
    const r = carrega(s);
    expect(r.avis).toBe('danyat');
    expect(r.desat).toEqual(nou());
    expect(s.m.get(CLAU_DANYAT)).toBe('{no json');
  });
  it('versión desconocida no se interpreta', () => {
    const r = carrega(memoria({ [CLAU]: JSON.stringify({ ...nou(), versio: 99 }) }));
    expect(r.avis).toBe('danyat');
  });
  it('misión incoherente: se reinicia la misión y se conservan los adornos', () => {
    const d = { ...nou(), premis: ['banderi-poma'], missio: { ...inicia(), objectes: [{ id: 0, zona: 'cistella', placa: 0 }, { id: 1, zona: 'cistella', placa: 0 }] } };
    const r = carrega(memoria({ [CLAU]: JSON.stringify(d) }));
    expect(r.avis).toBe('missio-reiniciada');
    expect(r.desat.missio).toBeNull();
    expect(r.desat.premis).toEqual(['banderi-poma']);
  });
  it('el historial de intentos está acotado', () => {
    let d = nou();
    const i = confirma(mou(inicia(), 'arbre', 'cistella', 3)).intent!;
    for (let k = 0; k < MAX_INTENTS + 20; k++) d = ambIntent(d, i);
    expect(d.intents.length).toBe(MAX_INTENTS);
  });
  it('repetir la misión no duplica premios', () => {
    let d = completaMissio(nou(), 'banderi-poma');
    d = completaMissio(d, 'banderi-poma');
    expect(d.premis).toEqual(['banderi-poma']);
    expect(d.missionsCompletades).toBe(2);
    d = completaMissio(d, 'banderi-estel');
    expect(d.banderiActiu).toBe('banderi-estel');
    expect(d.premis.length).toBe(2);
    d = completaMissio(d, 'petxina-rosa');
    expect(d.banderiActiu).toBe('banderi-estel');
  });
  it('mapa: completar los niveles de una isla abre la siguiente', () => {
    let d: Desat = nou();
    expect(illaActual(d)).toBe(0);
    expect(desbloquejada(d, 1)).toBe(false);
    for (let n = 0; n < NIVELLS_ILLA; n++) {
      expect(nivellPer(d, 0)).toBe(n);
      d = completaMissio({ ...d, missio: inicia(0, n) }, null);
    }
    expect(d.progres[0]).toBe(NIVELLS_ILLA);
    expect(illaActual(d)).toBe(1);
    expect(desbloquejada(d, 1)).toBe(true);
    // Repetir un nivel ya hecho no hace retroceder el progreso.
    d = completaMissio({ ...d, missio: inicia(0, 0) }, null);
    expect(d.progres[0]).toBe(NIVELLS_ILLA);
  });
  it('migra el formato 1 y el 2: lo jugado cuenta como niveles del berenar', () => {
    const v1 = { ...nou(), versio: 1, progres: undefined, premis: undefined, adorns: ['banderi-poma'], missionsCompletades: 2, missio: null };
    expect(migra(v1 as never)?.versio).toBe(3);
    const r = valida(v1);
    expect(r?.avis).toBe('cap');
    expect(r?.desat.progres).toEqual([2, 0, 0, 0]);
    expect(r?.desat.premis).toEqual(['banderi-poma']);
    const v2 = { versio: 2, preferencies: { veu: true }, nivell: 1, adorns: ['banderi-estel'], missionsCompletades: 1, missio: { pas: 2 }, intents: [], notes: 'x' };
    const r2 = valida(v2);
    expect(r2?.desat.missio).toBeNull();
    expect(r2?.desat.progres[0]).toBe(1);
    expect(r2?.desat.notes).toBe('x');
  });
  it('si el almacenamiento falla, desa lo indica sin romper', () => {
    expect(desa({ getItem: () => null, setItem: () => { throw new Error('quota'); } }, nou())).toBe(false);
  });
});
