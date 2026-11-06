/* Los dibujos estáticos se muestran como imágenes y no como SVG en línea.
   Safari rasteriza una imagen una sola vez; un SVG en línea con filtros se vuelve a pintar
   cada vez que algo se mueve por encima, y en el móvil eso hacía el juego lento. */
import { SPRITE } from './sprite';

const DEFS = SPRITE.slice(SPRITE.indexOf('>', SPRITE.indexOf('<svg')) + 1, SPRITE.lastIndexOf('</svg>'));
const cache = new Map<string, string>();

interface Opcions {
  /** preserveAspectRatio del dibujo. */
  par?: string;
  /** Margen en unidades del dibujo; con sombra integrada (solo las manzanas). */
  ombra?: number;
}

export function urlDibuix(id: string, w: number, h: number, { par = 'xMidYMid meet', ombra = 0 }: Opcions = {}): string {
  const k = `${id}|${w}|${h}|${par}|${ombra}`;
  let u = cache.get(k);
  if (!u) {
    const m = ombra;
    const filtre = m
      ? `<filter id="f-ombra" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="${m * 0.6}" stdDeviation="${m * 0.4}" flood-color="#241E14" flood-opacity=".35"/></filter>`
      : '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-m} ${-m} ${w + 2 * m} ${h + 2 * m}" preserveAspectRatio="${par}">${DEFS}<defs>${filtre}</defs>`
      + `<use href="#${id}" x="0" y="0" width="${w}" height="${h}"${m ? ' filter="url(#f-ombra)"' : ''}/></svg>`;
    u = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    cache.set(k, u);
  }
  return u;
}

interface Props extends Opcions {
  id: string;
  /** Tamaño del símbolo, como en su viewBox. */
  w: number;
  h: number;
  className?: string;
}

export function Dibuix({ id, w, h, className, ...o }: Props) {
  return <img className={className} src={urlDibuix(id, w, h, o)} alt="" draggable={false} decoding="async" />;
}

/** Manzana con su sombra ya pintada: la sombra no se recalcula al arrastrar. */
export const Poma = ({ className }: { className?: string }) => <Dibuix id="poma" w={100} h={100} ombra={4} className={className} />;
