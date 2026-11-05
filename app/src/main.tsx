import { createRoot } from 'react-dom/client';
import { SPRITE } from './art/sprite';
import { veu } from './audio/veu';
import App from './App';
import './estil.css';

const params = new URLSearchParams(location.search);
veu.silenci = params.has('silenci');

document.body.insertAdjacentHTML('afterbegin', SPRITE);

// Táctil: sin zoom con dos dedos ni doble toque, sin menú contextual.
for (const t of ['gesturestart', 'gesturechange', 'dblclick', 'contextmenu']) {
  document.addEventListener(t, e => e.preventDefault(), { passive: false });
}
// Pide al navegador que no borre los datos guardados si es posible.
navigator.storage?.persist?.().catch(() => {});

createRoot(document.getElementById('app')!).render(<App sensedemo={params.has('sensedemo')} />);
