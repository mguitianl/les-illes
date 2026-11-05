import { useState } from 'react';
import type { Avis, Desat } from '../logica/desat';
import { PASSOS, type TipusAjuda } from '../logica/missio';

const PARAULES = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const NOM_PAS: Record<string, string> = {
  recull: 'Recoger 3', afegeix: 'Añadir 1', total: '¿Cuántas hay? (3 + 1)',
  dona: 'Entregar 2 de 4', queden: '¿Cuántas quedan? (4 − 2)', banderi: 'Elegir banderín',
};
const NOM_AJUDA: Record<TipusAjuda, string> = { cap: 'Ninguna', senyalar: 'Señalar', comptar: 'Contar juntos', demostrar: 'Demostración' };
const NOM_AVIS: Partial<Record<Avis, string>> = {
  danyat: 'Los datos guardados estaban dañados. Se ha empezado de nuevo y se ha conservado una copia en este navegador.',
  'missio-reiniciada': 'La partida en curso no era coherente y se ha reiniciado. Los banderines se conservan.',
};

interface Props {
  desat: Desat;
  avis: Avis;
  desatOk: boolean;
  veuFallida: boolean;
  onTanca(): void;
  onCanvia(f: (d: Desat) => Desat): void;
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
          <dt>Partida en curso</dt><dd>{missio ? `Paso ${missio.pas + 1} de ${PASSOS.length}: ${NOM_PAS[PASSOS[missio.pas]?.id] ?? ''}` : 'Ninguna'}</dd>
          <dt>Pasos resueltos sin ayuda</dt><dd>{independents}</dd>
          <dt>Pasos resueltos con ayuda</dt><dd>{ambAjuda}</dd>
          <dt>Banderines</dt><dd>{desat.adorns.length ? desat.adorns.map(b => (b === 'banderi-poma' ? 'Coral con manzana' : 'Azul con estrella')).join(', ') : 'Todavía ninguno'}</dd>
        </dl>
        <p className="nota">Son registros de lo que ha pasado, no una medida de capacidad. Una sesión no demuestra aprendizaje.</p>
      </section>

      <section>
        <h3>Últimos pasos</h3>
        {intents.length === 0 ? <p>Todavía no hay registros.</p> : (
          <div className="taula-scroll">
            <table>
              <thead><tr><th>Cuándo</th><th>Paso</th><th>Respuesta</th><th>Primera respuesta</th><th>Ayuda</th></tr></thead>
              <tbody>
                {intents.map((i, k) => (
                  <tr key={k}>
                    <td>{new Date(i.data).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{NOM_PAS[i.pas] ?? i.pas}</td>
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
          <li>Si cambia la dirección del Mac en la red, el iPad lo trata como otra web y empieza de cero.</li>
        </ul>
      </section>
    </div>
  );
}
