/* Locuciones: un único elemento de audio, de modo que nunca se solapan.
   El audio se activa con la primera interacción; no se depende de la reproducción automática. */

const espera = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

class Veu {
  private audio = new Audio();
  private torn = 0;
  private oients = new Set<() => void>();
  private instruccio: string[] = [];
  activada = false;
  /** Preferencia del adulto. Si está desactivada se respeta el ritmo, sin sonido. */
  habilitada = true;
  silenci = false;
  fallida = false;
  parlant = false;

  constructor() {
    this.audio.preload = 'auto';
  }

  subscriu(f: () => void): () => void {
    this.oients.add(f);
    return () => this.oients.delete(f);
  }
  private avisa() {
    this.oients.forEach(f => f());
  }
  private marcaFallida() {
    if (!this.fallida) {
      this.fallida = true;
      console.warn('[illes] El audio no se ha podido reproducir. Se mantienen el rótulo y la demostración visual.');
      this.avisa();
    }
  }

  /** Llamar dentro del primer gesto del usuario. */
  activa() {
    if (this.activada) return;
    this.activada = true;
    if (this.silenci) return;
    this.audio.src = 'audio/silenci.m4a';
    this.audio.play()?.catch(() => {});
  }

  private clip(nom: string, torn: number): Promise<void> {
    if (this.silenci || !this.habilitada) return espera(900);
    return new Promise(resol => {
      if (torn !== this.torn) return resol();
      let fet = false;
      const fi = () => {
        if (fet) return;
        fet = true;
        clearTimeout(t);
        this.audio.onended = this.audio.onerror = null;
        resol();
      };
      const t = setTimeout(fi, 10000);
      this.audio.onended = fi;
      this.audio.onerror = () => { this.marcaFallida(); fi(); };
      this.audio.src = `audio/${nom}.m4a`;
      this.audio.play()?.catch((e: DOMException) => {
        if (e.name === 'AbortError') return;
        // Antes del primer gesto no es un fallo: la instrucción se repetirá al tocar.
        if (e.name !== 'NotAllowedError' || this.activada) this.marcaFallida();
        fi();
      });
    });
  }

  calla() {
    this.torn++;
    this.audio.pause();
    if (this.parlant) { this.parlant = false; this.avisa(); }
  }

  /** Reproduce en orden. Devuelve false si otra locución lo ha interrumpido. */
  async parla(noms: string[]): Promise<boolean> {
    this.calla();
    const torn = this.torn;
    this.parlant = true;
    this.avisa();
    for (const n of noms) {
      if (torn !== this.torn) return false;
      await this.clip(n, torn);
    }
    if (torn !== this.torn) return false;
    this.parlant = false;
    this.avisa();
    return true;
  }

  /** Instrucción principal de la pantalla: es lo que repite el altavoz. */
  instrueix(noms: string[]): Promise<boolean> {
    this.instruccio = noms;
    return this.parla(noms);
  }
  repeteix(): Promise<boolean> {
    return this.parla(this.instruccio);
  }
}

export const veu = new Veu();
export { espera };
