import { Fragment, useState } from 'react';
import type { Avis, Desat } from '../logica/desat';
import { ILLES, NIVELLS_ILLA, passosDe, pasActual, type TipusAjuda } from '../logica/missio';
import { NIVELLS_BADIA, NIVELLS_BERENAR, NIVELLS_BOSC, NIVELLS_TRESOR, TRESOR_AMB_FORATS } from '../logica/textos';
import { esborra as esborraRendiment, registres } from '../rendiment';

const PARAULES = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
function nomPas(id: string, q: number[] = []): string {
  const [a, b] = q;
  switch (id) {
    case 'recull': return `Recoger ${a}`;
    case 'afegeix': return `Añadir ${b} (${a} + ${b})`;
    case 'total': return `¿Cuántas hay? (${a} + ${b})`;
    case 'dona': return `Entregar ${b} de ${a}`;
    case 'queden': return `¿Cuántas quedan? (${a} − ${b})`;
    case 'puja': return `Subir ${a} a la barca`;
    case 'mes': return `¿Dónde hay más? (${a} y ${b})`;
    case 'baixa': return `Bajar ${b} de ${a}`;
    case 'omple': return `Completar el cofre (${a} + ? = ${b})`;
    case 'falten': return `¿Cuántas faltaban? (${a} + ? = ${b})`;
    case 'parelles': return `Memory de ${a} parejas`;
    case 'premi': case 'banderi': return 'Elegir premio';
    default: return id;
  }
}
const NOM_ILLA = ['Berenar (sumar y restar)', 'Badia (contar, comparar y restar)', 'Tresor (lo que falta)', 'Bosc (memory de cantidades)'];
const CARA: Record<string, string> = { grup: 'manzanas', xifra: 'cifra', punts: 'puntos' };
function descripcioNivell(illa: number, n: number): string {
  switch (ILLES[illa]) {
    case 'berenar': { const [a, b, c] = NIVELLS_BERENAR[n]; return `${a} + ${b} = ${a + b} · ${a + b} − ${c} = ${a + b - c}`; }
    case 'badia': { const [t, p, b] = NIVELLS_BADIA[n]; return `suben ${p} de ${t} · ${p} − ${b} = ${p - b}`; }
    case 'tresor': return NIVELLS_TRESOR[n].map(([t, k]) => `${k} + ? = ${t}`).join(' · ') + (TRESOR_AMB_FORATS[n] ? '' : ' (sin huecos)');
    default: { const { parelles, a, b } = NIVELLS_BOSC[n]; return `${parelles} parejas: ${CARA[a]} = ${CARA[b]}`; }
  }
}
const NOM_BANDERI: Record<string, string> = {
  'banderi-poma': 'coral con manzana', 'banderi-estel': 'azul con estrella', 'banderi-cor': 'amarillo con corazón',
  'banderi-lluna': 'noche con luna', 'banderi-peix': 'verde con pez', 'banderi-ona': 'olas',
  'petxina-rosa': 'concha rosa', 'petxina-blava': 'concha azul', 'petxina-caragol': 'caracola', 'petxina-estel': 'estrella de mar',
  'tresor-corona': 'corona', 'tresor-collaret': 'collar', 'tresor-perla': 'perla', 'tresor-anell': 'anillo',
  'papallona-groga': 'mariposa amarilla', 'papallona-blava': 'mariposa azul', 'papallona-vermella': 'mariposa roja', 'papallona-verda': 'mariposa verde',
};
const NOM_AJUDA: Record<TipusAjuda, string> = { cap: 'Ninguna', senyalar: 'Señalar', comptar: 'Contar juntos', demostrar: 'Demostración' };
const NOM_AVIS: Partial<Record<Avis, string>> = {
  danyat: 'Los datos guardados estaban dañados. Se ha empezado de nuevo y se ha conservado una copia en este navegador.',
  'missio-reiniciada': 'La partida en curso no era coherente y se ha reiniciado. Los premios se conservan.',
};

interface Props {
  desat: Desat;
  avis: Avis;
  desatOk: boolean;
  veuFallida: boolean;
  onTanca(): void;
  onCanvia(f: (d: Desat) => Desat): void;
  onNivell(illa: number, nivell: number): void;
  onReiniciaMissio(): void;
  onEsborraTot(): void;
}

/** Barrera contra aperturas accidentales: no es una autenticación segura. */
function Porta({ onObre, onTanca }: { onObre(): void; onTanca(): void }) {
  const [codi] = useState(() => {
    const ds: number[] = [];
    while (ds.length < 3) { const d = 1 + Math.floor(Math.random() * 9); if (!ds.includes(d)) ds.push(d); }
    return ds;
  });
  const [entrat, setEntrat] = useState<number[]>([]);
  const prem = (d: number) => {
    const n = [...entrat, d];
    if (codi[n.length - 1] !== d) { setEntrat([]); return; }
    if (n.length === codi.length) onObre(); else setEntrat(n);
  };
  return (
    <div className="adults porta" role="dialog" aria-label="Acceso para adultos">
      <h2>Zona de adultos</h2>
      <p>Pulsa en orden: <strong>{codi.map(d => PARAULES[d]).join(', ')}</strong></p>
      <div className="teclat">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
          <button key={d} className={entrat.includes(d) ? 'premut' : ''} onClick={() => prem(d)}>{d}</button>
        ))}
      </div>
      <button className="enllac" onClick={onTanca}>Volver al juego</button>
    </div>
  );
}

export default function Adults(props: Props) {
  const [obert, setObert] = useState(false);
  const [confirmant, setConfirmant] = useState<null | 'missio' | 'tot'>(null);
  if (!obert) return <Porta onObre={() => setObert(true)} onTanca={props.onTanca} />;
  const { desat, avis, desatOk, veuFallida, onTanca, onCanvia } = props;
  const intents = [...desat.intents].reverse().slice(0, 40);
  const independents = desat.intents.filter(i => i.independent && i.habilitat !== 'estetica').length;
  const ambAjuda = desat.intents.filter(i => !i.independent && i.habilitat !== 'estetica').length;
  const missio = desat.missio;

  return (
    <div className="adults" role="dialog" aria-label="Zona de adultos">
      <div className="adults-cap">
        <h2>Zona de adultos</h2>
        <button className="boto-text" onClick={onTanca}>Volver al juego</button>
      </div>

      {(NOM_AVIS[avis] || !desatOk || veuFallida) && (
        <section className="avisos">
          {NOM_AVIS[avis] && <p>{NOM_AVIS[avis]}</p>}
          {!desatOk && <p>No se ha podido guardar en este navegador (quizá navegación privada o sin espacio). La partida se perderá al cerrar.</p>}
          {veuFallida && <p>El audio no se ha podido reproducir en este dispositivo. El juego sigue con el rótulo y las demostraciones visuales.</p>}
        </section>
      )}

      <section>
        <h3>Resumen</h3>
        <dl className="resum">
          <dt>Misiones completadas</dt><dd>{desat.missionsCompletades}</dd>
          <dt>Partida en curso</dt><dd>{missio ? `Isla ${missio.illa + 1}, nivel ${missio.nivell + 1} · paso ${missio.pas + 1} de ${passosDe(missio).length}: ${nomPas(pasActual(missio)?.id ?? '', pasActual(missio)?.quantitats)}` : 'Ninguna'}</dd>
          {ILLES.map((_, i) => <Fragment key={i}><dt>{NOM_ILLA[i]}</dt><dd>{desat.progres[i]} de {NIVELLS_ILLA} niveles</dd></Fragment>)}
          <dt>Pasos resueltos sin ayuda</dt><dd>{independents}</dd>
          <dt>Pasos resueltos con ayuda</dt><dd>{ambAjuda}</dd>
          <dt>Premios</dt><dd>{desat.premis.length ? desat.premis.map(b => NOM_BANDERI[b] ?? b).join(', ') : 'Todavía ninguno'}</dd>
        </dl>
        <p className="nota">Son registros de lo que ha pasado, no una medida de capacidad. Una sesión no demuestra aprendizaje.</p>
      </section>

      <section>
        <h3>Últimos pasos</h3>
        {intents.length === 0 ? <p>Todavía no hay registros.</p> : (
          <div className="taula-scroll">
            <table>
              <thead><tr><th>Cuándo</th><th>Isla · nivel</th><th>Paso</th><th>Respuesta</th><th>Primera respuesta</th><th>Ayuda</th></tr></thead>
              <tbody>
                {intents.map((i, k) => (
                  <tr key={k}>
                    <td>{new Date(i.data).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{(i.illa ?? 0) + 1} · {(i.nivell ?? 0) + 1}</td>
                    <td>{nomPas(i.pas, i.quantitats)}</td>
                    <td>{i.habilitat === 'estetica' ? '—' : String(i.resposta)}</td>
                    <td>{i.habilitat === 'estetica' || i.primeraResposta === i.resposta ? '—' : String(i.primeraResposta)}</td>
                    <td>{NOM_AJUDA[i.ajuda]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3>Islas y niveles</h3>
        <p className="nota">Cada isla tiene 4 niveles, de más fácil a más difícil. Al completar los 4 se abre la siguiente en el mapa. Elegir un nivel lo deja preparado: empieza al tocar esa isla en el mapa. No borra el progreso.</p>
        {ILLES.map((_, il) => (
          <div key={il} className="illa-nivells">
            <h4>{il + 1}. {NOM_ILLA[il]}</h4>
            <div className="nivells">
              {Array.from({ length: NIVELLS_ILLA }, (_, n) => (
                <button key={n} className={`nivell${missio && missio.illa === il && missio.nivell === n ? ' actiu' : ''}`}
                  onClick={() => props.onNivell(il, n)}>
                  <strong>Nivel {n + 1}{n < desat.progres[il] ? ' ✓' : ''}</strong><span>{descripcioNivell(il, n)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <Rendiment />

      <section>
        <h3>Ajustes</h3>
        <label className="interruptor">
          <input type="checkbox" checked={desat.preferencies.veu}
            onChange={e => onCanvia(d => ({ ...d, preferencies: { ...d.preferencies, veu: e.target.checked } }))} />
          Voz de las instrucciones
        </label>
        <p className="nota">La voz actual es provisional (síntesis de macOS). Todavía no hay efectos ni música.</p>
      </section>

      <section>
        <h3>Notas de observación</h3>
        <textarea value={desat.notes} placeholder="Opcional: lo que te llame la atención al verla jugar."
          onChange={e => { const v = e.target.value; onCanvia(d => ({ ...d, notes: v })); }} />
      </section>

      <section>
        <h3>Progreso</h3>
        {confirmant === null && (
          <div className="accions">
            <button className="boto-text" onClick={() => setConfirmant('missio')} disabled={!missio}>Reiniciar la misión</button>
            <button className="boto-text perill" onClick={() => setConfirmant('tot')}>Borrar todo el progreso</button>
          </div>
        )}
        {confirmant === 'missio' && (
          <div className="accions"><span>La misión vuelve al principio. Los banderines se conservan.</span>
            <button className="boto-text" onClick={() => { props.onReiniciaMissio(); setConfirmant(null); }}>Sí, reiniciar</button>
            <button className="boto-text" onClick={() => setConfirmant(null)}>Cancelar</button></div>
        )}
        {confirmant === 'tot' && (
          <div className="accions"><span>Se borran la partida, los banderines, los registros y las notas.</span>
            <button className="boto-text perill" onClick={() => { props.onEsborraTot(); setConfirmant(null); }}>Sí, borrar todo</button>
            <button className="boto-text" onClick={() => setConfirmant(null)}>Cancelar</button></div>
        )}
      </section>

      <section>
        <h3>Dónde se guarda</h3>
        <ul className="nota">
          <li>Solo en este dispositivo y en esta dirección web. El móvil y el iPad tienen partidas separadas.</li>
          <li>El icono de la pantalla de inicio guarda aparte de Safari: conviene usar siempre el mismo acceso.</li>
          <li>Borrar los datos de Safari borra la partida. Safari también puede borrar los datos de webs que no se abren en varios días; desde la pantalla de inicio es menos probable.</li>
          <li>La web publicada y la del Mac en la red local son partidas distintas.</li>
        </ul>
      </section>
    </div>
  );
}

/** Tirones medidos en este dispositivo: sirve para saber si el juego va lento en el iPad o el móvil. */
function Rendiment() {
  const [rs, setRs] = useState(registres);
  const ultims = [...rs].reverse().slice(0, 15);
  return (
    <section>
      <h3>Fluidez en este dispositivo</h3>
      <p className="nota">Cada pantalla cuenta los tirones (fotogramas de más de 50 ms). Unos pocos por minuto es normal; decenas indican que el dispositivo va justo.</p>
      {ultims.length === 0 ? <p>Todavía no hay mediciones.</p> : (
        <div className="taula-scroll">
          <table>
            <thead><tr><th>Cuándo</th><th>Pantalla</th><th>Duración</th><th>Tirones</th><th>Por minuto</th><th>Peor</th></tr></thead>
            <tbody>
              {ultims.map((r, k) => (
                <tr key={k}>
                  <td>{new Date(r.quan).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{r.on}</td>
                  <td>{r.segons} s</td>
                  <td>{r.tirons} de {r.fotogrames}</td>
                  <td>{r.segons ? Math.round((r.tirons * 60) / r.segons) : '—'}</td>
                  <td>{r.pitjor} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="nota">{navigator.userAgent}</p>
      {ultims.length > 0 && <button className="boto-text" onClick={() => { esborraRendiment(); setRs([]); }}>Borrar mediciones</button>}
    </section>
  );
}
