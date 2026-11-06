#!/usr/bin/env node
// Genera los clips PROVISIONALES con la voz catalana de macOS (Montse) a partir de app/src/logica/textos.ts.
// No es la locución final. Uso: node eines/generar-audio.mjs   (Node 23.6 o posterior, macOS)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { frases, NUMEROS } from '../app/src/logica/textos.ts';

const desti = join(dirname(fileURLToPath(import.meta.url)), '../app/public/audio');
const tmp = mkdtempSync(join(tmpdir(), 'illes-'));
const gen = (nom, text, rate = 165) => {
  const aiff = join(tmp, `${nom}.aiff`);
  execFileSync('say', ['-v', 'Montse', '-r', String(rate), '-o', aiff, text]);
  execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '64000', aiff, join(desti, `${nom}.m4a`)]);
};
const totes = frases();
for (const [nom, text] of Object.entries(totes)) gen(nom, text);
for (const [nom, text] of NUMEROS) gen(nom, text, 140);
const s = join(tmp, 's.aiff');
execFileSync('say', ['-v', 'Montse', '-o', s, '[[slnc 150]]']);
execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', s, join(desti, 'silenci.m4a')]);
// Borra clips que ya no se usan.
const valids = new Set([...Object.keys(totes), ...NUMEROS.map(([n]) => n), 'silenci']);
for (const f of readdirSync(desti)) if (f.endsWith('.m4a') && !valids.has(f.slice(0, -4))) rmSync(join(desti, f));
rmSync(tmp, { recursive: true });
console.log(`${valids.size} clips en ${desti}`);
