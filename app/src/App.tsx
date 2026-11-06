import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ambIntent, carrega, completaMissio, desa, nou, type Avis, type Desat } from './logica/desat';
import { N_PASSOS, aplica, clipsNivell, inicia, pasActual, type Banderi, type EstatMissio, type Intent } from './logica/missio';
import { veu } from './audio/veu';
import Barra from './ui/Barra';
import Port from './ui/Port';
import Berenar from './ui/Berenar';
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
  if (m.pas >= N_PASSOS - 1) return completaMissio(d, m.banderi);
  return { ...d, missio: aplica(m, { t: 'seguent' }) };
}

export interface Api {
  posaMissio(e: EstatMissio): void;
  registra(i: Intent): void;
  marcaTutorial(): void;
  acaba(b: Banderi | null): void;
}

export default function App({ sensedemo }: { sensedemo: boolean }) {
  const [mag] = useState(magatzem);
  const [carregat] = useState(() => carrega(mag));
  const [desat, setDesat] = useState<Desat>(() => normalitza(carregat.desat));
  const [avis, setAvis] = useState<Avis>(carregat.avis);
  const [desatOk, setDesatOk] = useState(true);
  const [vista, setVista] = useState<'port' | 'berenar'>('port');
  const [final, setFinal] = useState(false);
  const [adults, setAdults] = useState(false);
  const desatRef = useRef(desat);
  desatRef.current = desat;

  const estatVeu = useSyncExternalStore(
    f => veu.subscriu(f),
    () => `${veu.parlant ? 1 : 0}${veu.fallida ? 1 : 0}`,
  );

  useEffect(() => { setDesatOk(desa(mag, desat)); }, [desat, mag]);
  useEffect(() => { veu.habilitada = desat.preferencies.veu; }, [desat.preferencies.veu]);
  const nivellActiu = desat.missio?.nivell ?? desat.nivell;
  useEffect(() => { veu.precarrega(['silenci', ...clipsNivell(nivellActiu)]); }, [nivellActiu]);

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
    acaba: useCallback((b: Banderi | null) => {
      setDesat(d => completaMissio(d, b));
      setFinal(true);
      setVista('port');
    }, []),
  };

  const entra = () => {
    setDesat(d => (d.missio ? normalitza(d) : { ...d, missio: inicia(d.nivell) }));
    setFinal(false);
    setVista('berenar');
  };
  const casa = () => {
    veu.calla();
    setDesat(d => normalitza(d));
    setVista('port');
  };

  (window as unknown as { __illes: unknown }).__illes = {
    desat: () => desatRef.current,
    vista: () => vista,
  };

  const missio = desat.missio;
  const pas = vista === 'berenar' && missio ? pasActual(missio) : null;
  const enCurs = !!missio;
  const rotul = pas ? pas.rotul : final ? 'El berenar està a punt' : enCurs ? 'Continuem el berenar?' : 'Preparem el berenar?';

  return (
    <div className="app" data-moment={pas ? pas.id : 'port'}>
      {vista === 'port' || !missio ? (
        <Port banderi={desat.banderiActiu} veuInicial={final ? 'final' : enCurs ? 'continuem' : 'port'} alzaBanderi={final} onEntra={entra} />
      ) : (
        <Berenar missio={missio} tutorialVist={desat.tutorialVist} sensedemo={sensedemo} api={api} />
      )}
      <Barra
        rotul={rotul}
        mostraCasa={vista === 'berenar'}
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
          onNivell={n => { setDesat(d => ({ ...d, nivell: n, missio: null })); setVista('port'); setFinal(false); }}
          onReiniciaMissio={() => { setDesat(d => ({ ...d, missio: null })); setVista('port'); setFinal(false); }}
          onEsborraTot={() => { setDesat(nou()); setVista('port'); setFinal(false); }}
        />
      )}
      <div className="gra" aria-hidden="true" />
      <div className="segell-maqueta" aria-hidden="true">veu provisional</div>
    </div>
  );
}
