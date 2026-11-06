import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  ambIntent, carrega, completaMissio, desa, illaActual, illaCompleta, nivellPer, nou, type Avis, type Desat,
} from './logica/desat';
import { NIVELLS_ILLA, aplica, clipsMissio, esUltimPas, inicia, pasActual, type EstatMissio, type Intent } from './logica/missio';
import { veu } from './audio/veu';
import * as rendiment from './rendiment';
import Barra from './ui/Barra';
import Port from './ui/Port';
import Mapa from './ui/Mapa';
import Escena from './ui/Escena';
import Adults from './ui/Adults';

function magatzem(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  try {
    const k = '__illes_prova';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return localStorage;
  } catch {
    const m = new Map<string, string>();
    return { getItem: k => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: k => void m.delete(k) };
  }
}

/** Una partida que se quedó en el momento de éxito continúa en el paso siguiente. */
function normalitza(d: Desat): Desat {
  const m = d.missio;
  if (!m || m.fase !== 'exit') return d;
  if (esUltimPas(m)) return completaMissio(d, m.premi);
  return { ...d, missio: aplica(m, { t: 'seguent' }) };
}

export interface Api {
  posaMissio(e: EstatMissio): void;
  registra(i: Intent): void;
  marcaTutorial(): void;
  acaba(premi: string | null): void;
}

type Vista = 'port' | 'mapa' | 'joc';

export default function App({ sensedemo }: { sensedemo: boolean }) {
  const [mag] = useState(magatzem);
  const [carregat] = useState(() => carrega(mag));
  const [desat, setDesat] = useState<Desat>(() => normalitza(carregat.desat));
  const [avis, setAvis] = useState<Avis>(carregat.avis);
  const [desatOk, setDesatOk] = useState(true);
  const [vista, setVista] = useState<Vista>('port');
  /** Al volver al mapa tras una misión: premio nuevo y, si se completó la isla, el viaje del barco. */
  const [arribada, setArribada] = useState<{ premi: string | null; navega: { de: number; a: number } | null } | null>(null);
  const [adults, setAdults] = useState(false);
  const desatRef = useRef(desat);
  desatRef.current = desat;

  const estatVeu = useSyncExternalStore(
    f => veu.subscriu(f),
    () => `${veu.parlant ? 1 : 0}${veu.fallida ? 1 : 0}`,
  );

  useEffect(() => { setDesatOk(desa(mag, desat)); }, [desat, mag]);
  useEffect(() => { veu.habilitada = desat.preferencies.veu; }, [desat.preferencies.veu]);

  // Voz de la misión siguiente, descargada por adelantado.
  const actual = illaActual(desat);
  const properaIlla = desat.missio?.illa ?? actual;
  const properNivell = desat.missio?.nivell ?? nivellPer(desat, actual);
  useEffect(() => { veu.precarrega(['silenci', ...clipsMissio(properaIlla, properNivell)]); }, [properaIlla, properNivell]);

  // Medidor de tirones por pantalla.
  const on = vista === 'joc' && desat.missio ? `isla ${desat.missio.illa + 1} · nivel ${desat.missio.nivell + 1}` : vista === 'mapa' ? 'mapa' : 'puerto';
  useEffect(() => { rendiment.comenca(on); return () => rendiment.acaba(); }, [on]);

  // Primer gesto: activa el audio y, si no ha empezado nada, repite la instrucción.
  useEffect(() => {
    const f = () => {
      veu.activa();
      setTimeout(() => { if (!veu.parlant && !document.hidden) veu.repeteix(); }, 300);
    };
    document.addEventListener('pointerdown', f, { capture: true, once: true });
    return () => document.removeEventListener('pointerdown', f, { capture: true });
  }, []);
  useEffect(() => {
    const f = () => { if (document.hidden) veu.calla(); };
    document.addEventListener('visibilitychange', f);
    return () => document.removeEventListener('visibilitychange', f);
  }, []);

  const api: Api = {
    posaMissio: useCallback((e: EstatMissio) => setDesat(d => ({ ...d, missio: e })), []),
    registra: useCallback((i: Intent) => setDesat(d => ambIntent(d, i)), []),
    marcaTutorial: useCallback(() => setDesat(d => ({ ...d, tutorialVist: true })), []),
    acaba: useCallback((premi: string | null) => {
      const d = desatRef.current;
      const abans = illaActual(d);
      const despres = completaMissio(d, premi);
      const ara = illaActual(despres);
      setDesat(despres);
      setArribada({ premi, navega: ara !== abans && illaCompleta(despres, abans) ? { de: abans, a: ara } : null });
      setVista('mapa');
    }, []),
  };

  const entraIlla = (i: number) => {
    setDesat(d => {
      const n = normalitza(d);
      if (n.missio && n.missio.illa === i) return n;
      return { ...n, missio: inicia(i, nivellPer(n, i), n.premis) };
    });
    setArribada(null);
    setVista('joc');
  };
  const casa = () => {
    veu.calla();
    setDesat(d => normalitza(d));
    setArribada(null);
    setVista(v => (v === 'joc' ? 'mapa' : 'port'));
  };

  (window as unknown as { __illes: unknown }).__illes = {
    desat: () => desatRef.current,
    vista: () => vista,
  };

  const missio = desat.missio;
  const pas = vista === 'joc' && missio ? pasActual(missio) : null;
  const rotul = pas ? pas.rotul : vista === 'mapa' ? 'On anem?' : 'Salpem?';
  const moment = pas ? (pas.tipus === 'premi' ? 'premi' : pas.id) : vista;

  return (
    <div className="app" data-moment={moment}>
      {vista === 'port' && <Port banderi={desat.banderiActiu} veuInicial="port" alzaBanderi={false} onEntra={() => { setArribada(null); setVista('mapa'); }} />}
      {vista === 'mapa' && <Mapa desat={desat} navega={arribada?.navega ?? null} premiNou={arribada?.premi ?? null} onIlla={entraIlla} />}
      {vista === 'joc' && missio && <Escena key={`${missio.illa}-${missio.nivell}`} missio={missio} tutorialVist={desat.tutorialVist} sensedemo={sensedemo} api={api} />}
      <Barra
        rotul={rotul}
        mostraCasa={vista !== 'port'}
        onCasa={casa}
        parlant={estatVeu[0] === '1'}
        fallida={estatVeu[1] === '1'}
        onAdults={() => { veu.calla(); setAdults(true); }}
      />
      {adults && (
        <Adults
          desat={desat}
          avis={avis}
          desatOk={desatOk}
          veuFallida={estatVeu[1] === '1'}
          onTanca={() => { setAdults(false); setAvis('cap'); }}
          onCanvia={setDesat}
          onNivell={(illa, nivell) => {
            // Deja preparada esa misión (al tocar la isla empieza) y abre las islas anteriores; no borra progreso.
            setDesat(d => ({
              ...d,
              progres: d.progres.map((p, j) => (j < illa ? Math.max(p, NIVELLS_ILLA) : p)),
              missio: inicia(illa, nivell, d.premis),
            }));
            setArribada(null); setVista('mapa'); setAdults(false); setAvis('cap');
          }}
          onReiniciaMissio={() => { setDesat(d => ({ ...d, missio: null })); setArribada(null); setVista('mapa'); }}
          onEsborraTot={() => { setDesat(nou()); setArribada(null); setVista('port'); }}
        />
      )}
      <div className="gra" aria-hidden="true" />
      <div className="segell-maqueta" aria-hidden="true">veu provisional</div>
    </div>
  );
}
