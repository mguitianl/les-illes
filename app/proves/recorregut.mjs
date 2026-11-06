// Prueba de recorrido completo en navegador (Chromium y WebKit de escritorio, tamaño iPad y móvil).
// Requiere `npm run build` y `npx playwright install webkit chromium`. No sustituye a la prueba en un iPad real.
import { chromium, webkit } from 'playwright';
import { spawn } from 'node:child_process';

const PORT = 8124;
const srv = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 1500));
const URL = `http://localhost:${PORT}/?silenci&sensedemo`;
let fallos = 0;
const ok = (c, m) => { if (!c) fallos++; console.log((c ? 'OK    ' : 'FALLO ') + m); };

const dispositius = [['iPad horizontal', 1180, 820], ['móvil vertical', 390, 664], ['iPad vertical', 820, 1180]];
for (const [nomMotor, motor] of [['webkit', webkit], ['chromium', chromium]]) {
  const b = await motor.launch();
  for (const [dev, w, h] of dispositius) {
    console.log(`--- ${nomMotor} · ${dev}`);
    const c = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true });
    const p = await c.newPage();
    p.on('pageerror', e => ok(false, 'error de página: ' + e.message));
    const d = () => p.evaluate(() => __illes.desat());
    const cnt = async z => (await d()).missio.objectes.filter(o => o.zona === z).length;
    const pas = async () => { const m = (await d()).missio; return m ? ['recull', 'afegeix', 'total', 'dona', 'queden', 'premi'][m.pas] : null; };
    const espera = ms => p.waitForTimeout(ms);
    const pomaEn = async (z, i = 0) => {
      const m = (await d()).missio;
      const vis = await p.$$eval('.zona', els => els.map(e => e.dataset.zona));
      const visibles = m.objectes.filter(o => vis.includes(o.zona));
      const objs = visibles.filter(o => o.zona === z).sort((a, b) => a.placa - b.placa);
      return p.locator('.poma').nth(visibles.indexOf(objs[i]));
    };
    const centre = async l => { const r = await l.boundingBox(); return [r.x + r.width / 2, r.y + r.height / 2]; };
    const arrossega = async (l, [tx, ty]) => { const [x, y] = await centre(l); await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move((x + tx) / 2, (y + ty) / 2, { steps: 5 }); await p.mouse.move(tx, ty, { steps: 5 }); await p.mouse.up(); await espera(350); };
    const zona = z => p.locator(`.zona[data-zona="${z}"] .ancora`);
    const eq = async () => (await p.locator('.equacio').innerText()).replace(/\s/g, '');
    const confirma = async () => { await p.locator('#confirma').tap(); await espera(200); };
    const passa = async () => { await confirma(); await espera(1800); };

    await p.goto(URL); await espera(300);
    const triaNivell = async n => {
      const r = await p.locator('#rotul').boundingBox();
      await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await p.mouse.down(); await espera(2200); await p.mouse.up();
      const PAR = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
      for (const w of (await p.locator('.porta strong').innerText()).split(', ')) await p.locator('.teclat button', { hasText: String(PAR.indexOf(w)) }).tap();
      await p.locator('.nivell').nth(n).tap(); await espera(400);
    };
    const illa = async nom => { await p.locator(`.illa-mapa[data-illa="${nom}"]`).tap({ force: true }); await espera(500); };
    ok(await p.evaluate(() => __illes.vista()) === 'port', 'arranca en el puerto');
    await p.locator('#port-timo').tap(); await espera(500);
    ok(await p.evaluate(() => __illes.vista()) === 'mapa', 'el timón lleva al mapa');
    await illa('badia');
    ok(await p.evaluate(() => __illes.vista()) === 'mapa' && (await d()).missio === null, 'una isla cerrada no se abre');
    await illa('berenar');
    ok(await pas() === 'recull' && await cnt('arbre') === 5, 'la cesta empieza la misión con 5 manzanas en el árbol');
    // Soltar fuera devuelve sin contar nada
    await arrossega(await pomaEn('arbre'), [6, h - 6]);
    ok(await cnt('arbre') === 5 && (await d()).missio.moguts === 0, 'soltar fuera no cuenta');
    await arrossega(await pomaEn('arbre'), await centre(zona('cistella')));
    ok(await cnt('cistella') === 1, 'arrastre al destino');
    await (await pomaEn('arbre')).tap(); await espera(150);
    await p.locator('.zona[data-zona="cistella"]').tap({ position: { x: 10, y: 10 } }); await espera(300);
    ok(await cnt('cistella') === 2, 'toque en manzana y toque en destino');
    await (await pomaEn('arbre')).tap(); await espera(150);
    await p.evaluate(() => { const z = document.querySelector('.zona[data-zona="cistella"]'); z.click(); z.click(); z.click(); }); await espera(300);
    ok(await cnt('cistella') === 3, 'toques repetidos: una sola transferencia');
    await (await pomaEn('arbre')).tap(); await (await pomaEn('cistella')).tap(); await espera(300);
    ok(await cnt('cistella') === 4, 'tocar una manzana del destino equivale a tocar el destino');
    await confirma(); await espera(300);
    ok(await pas() === 'recull' && await p.locator('.forat').count() === 3, 'con 4 no avanza y muestra 3 huecos');
    await arrossega(await pomaEn('cistella', 3), await centre(zona('arbre')));
    ok(await cnt('cistella') === 3 && await cnt('arbre') === 2, 'se puede devolver; total conservado');
    // Recargar a mitad de paso
    await p.reload(); await espera(400);
    await p.locator('#port-timo').tap(); await espera(400); await illa('berenar');
    ok(await pas() === 'recull' && await cnt('cistella') === 3 && await cnt('arbre') === 2, 'recargar conserva cantidades');
    await p.setViewportSize({ width: h, height: w }); await espera(400);
    ok(await cnt('cistella') === 3, 'girar conserva cantidades');
    await p.setViewportSize({ width: w, height: h }); await espera(400);
    await passa();
    ok(await pas() === 'afegeix' && await cnt('cistella') === 3 && await cnt('terra') === 1, 'añadir: 3 en la cesta y 1 encontrada');
    await arrossega(await pomaEn('terra'), await centre(zona('cistella')));
    await passa();
    ok(await pas() === 'total' && await eq() === '3+1', 'pregunta del total sin revelar el resultado');
    await p.locator('.targeta', { hasText: '3' }).tap(); await confirma();
    ok(await pas() === 'total', 'respuesta 3: no avanza, sin castigo');
    await p.locator('.targeta', { hasText: '4' }).tap(); await confirma();
    ok(await eq() === '3+1=4', '3 + 1 = 4 tras responder');
    await espera(1800);
    ok(await pas() === 'dona' && await cnt('cistella') === 4, 'entregar: 4 en la cesta');
    // Ayuda en la merienda: tres niveles sin cambiar cantidades
    const abans = JSON.stringify((await d()).missio.objectes);
    await p.locator('#boto-ajuda').tap(); await espera(200);
    ok(await p.locator('.forat').count() === 2 && await p.locator('.zona.destacada').count() === 1, 'ayuda 1: señala la bandeja y 2 huecos');
    await p.locator('#boto-ajuda').tap(); await espera(4000);
    ok(await p.locator('.insignia').count() === 2, 'ayuda 2: cuenta los huecos, una vez cada uno');
    await p.locator('#boto-ajuda').tap(); await espera(1200);
    ok(await p.locator('.fantasma').count() === 1, 'ayuda 3: demostración');
    ok(JSON.stringify((await d()).missio.objectes) === abans, 'la ayuda no altera las cantidades');
    await espera(3800);
    for (let i = 0; i < 2; i++) await arrossega(await pomaEn('cistella'), await centre(zona('safata')));
    ok(await cnt('cistella') === 2 && await cnt('safata') === 2, 'entregar 2 de 4 deja 2 y 2');
    await passa();
    ok(await pas() === 'queden' && await eq() === '4−2', 'pregunta de cuántas quedan sin revelar el resultado');
    await p.locator('.targeta', { hasText: '2' }).tap(); await confirma();
    ok(await eq() === '4−2=2', '4 − 2 = 2 tras responder');
    await espera(1800);
    ok(await pas() === 'premi', 'elegir banderín');
    await p.locator('.targeta-banderi').nth(1).tap(); await passa();
    const fi = await d();
    ok(await p.evaluate(() => __illes.vista()) === 'mapa' && fi.missio === null, 'al acabar vuelve al mapa');
    ok(fi.banderiActiu === 'banderi-estel' && fi.premis.length === 1 && fi.progres[0] === 1, 'premio ganado y nivel 1 completado');
    ok(await p.locator('.premi-nou').count() === 1 && await p.locator('.illa-mapa[data-illa="berenar"] .progres .fet').count() === 1, 'el mapa muestra el premio y el progreso');
    await illa('berenar');
    ok((await d()).missio.nivell === 1 && (await p.locator('#rotul').innerText()).includes('dues pomes'), 'la misión siguiente es el nivel 2');
    const indep = Object.fromEntries(fi.intents.map(i => [i.pas, i.independent]));
    ok(fi.intents.length === 6 && indep.recull === false && indep.total === false && indep.dona === false && indep.afegeix === true && indep.queden === true,
      'registro: con ayuda en recoger, total y entregar; sin ayuda en añadir y quedan');
    // Zona de adultos
    const r = await p.locator('#rotul').boundingBox();
    await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await p.mouse.down(); await espera(2200); await p.mouse.up();
    const text = await p.locator('.porta strong').innerText();
    const PAR = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    for (const w of text.split(', ')) await p.locator('.teclat button', { hasText: String(PAR.indexOf(w)) }).tap();
    ok(await p.locator('.adults h3', { hasText: 'Resumen' }).count() === 1, 'zona de adultos con pulsación larga y código');
    ok(await p.locator('.adults .taula-scroll').first().locator('tbody tr').count() === 6, 'muestra los 6 pasos registrados');
    // Badia, nivel 1: el adulto la deja preparada.
    await p.locator('.nivell').nth(4).tap(); await espera(400);
    ok(await p.evaluate(() => __illes.vista()) === 'mapa' && await p.locator('.adults').count() === 0, 'elegir nivel cierra la zona de adultos y lleva al mapa');
    await illa('badia');
    ok((await d()).missio.illa === 1 && await cnt('roca') === 5, 'badia: cinco tortugas en la roca');
    for (let i = 0; i < 3; i++) await arrossega(await pomaEn('roca'), await centre(zona('barca')));
    await passa();
    await p.locator('.zona[data-zona="roca"]').tap({ position: { x: 6, y: 6 } }); await confirma();
    ok((await d()).missio.pas === 1 && (await d()).missio.nivellAjuda === 1, 'badia: elegir la roca (2) no avanza y ofrece ayuda');
    await (await pomaEn('barca')).tap(); await confirma(); await espera(1800);
    ok((await d()).missio.pas === 2, 'badia: tocar una tortuga de la barca elige la barca (3 > 2)');
    await arrossega(await pomaEn('barca'), await centre(zona('platja'))); await passa();
    ok(await eq() === '3−1' && await cnt('barca') === 2, 'badia: 3 − 1 sin revelar el resultado');
    await p.locator('.targeta', { hasText: '2' }).tap(); await confirma(); await espera(1800);
    await p.locator('.targeta-banderi').nth(0).tap(); await passa();
    ok((await d()).premis.includes('petxina-rosa') && (await d()).progres[1] === 1, 'badia: concha ganada');
    // Tresor nivel 1: dos cofres; las monedas que ya estaban son de plata.
    await illa('tresor');
    ok((await d()).missio === null, 'tresor cerrado hasta completar la badia');
    await triaNivell(8); await illa('tresor');
    ok((await d()).missio.illa === 2 && await p.locator('.poma[aria-label="moneda-plata"]').count() === 2 && await p.locator('.forat').count() === 3, 'tresor: 2 de plata y 3 huecos');
    await arrossega(await pomaEn('sorra'), await centre(zona('cofre'))); await passa();
    ok(await eq() === '2+?=3', 'tresor: 2 + ? = 3');
    await p.locator('.targeta[aria-label="1"]').tap(); await confirma();
    ok(await eq() === '2+1=3', 'tresor: faltaba 1');
    await espera(1800);
    ok(await p.locator('.poma[aria-label="moneda-plata"]').count() === 3 && await cnt('sorra') === 5, 'tresor: segundo cofre con 3 de plata y arena llena');
    await p.locator('#casa').tap(); await espera(400);
    // Bosc nivel 1: memory de 3 parejas.
    await triaNivell(12); await illa('bosc');
    const cs = (await d()).missio.cartes;
    ok(cs.length === 6 && await p.locator('.carta.girada').count() === 0, 'bosc: 6 cartas tapadas');
    const a0 = 0, noPar = cs.findIndex((c, k) => k > 0 && c.valor !== cs[0].valor);
    await p.locator('.carta').nth(a0).tap(); await p.locator('.carta').nth(noPar).tap(); await espera(400);
    ok(await p.locator('.carta.girada').count() === 2, 'bosc: dos cartas distintas se ven');
    await espera(2200);
    ok(await p.locator('.carta.girada').count() === 0, 'bosc: y se vuelven a tapar');
    for (let v = 1; v <= 3; v++) {
      const [x, y] = cs.map((c, k) => [c, k]).filter(([c]) => c.valor === v).map(([, k]) => k);
      await p.locator('.carta').nth(x).tap(); await espera(200); await p.locator('.carta').nth(y).tap(); await espera(300);
    }
    await espera(3500);
    ok((await d()).missio.pas === 1 && (await d()).intents.at(-1).habilitat === 'memoria', 'bosc: todas las parejas llevan al premio');
    // Datos dañados
    await p.evaluate(() => localStorage.setItem('illes-nicole', '{dañado'));
    await p.reload(); await espera(300);
    const r2 = await p.locator('#rotul').boundingBox();
    await p.mouse.move(r2.x + r2.width / 2, r2.y + r2.height / 2); await p.mouse.down(); await espera(2200); await p.mouse.up();
    for (const w of (await p.locator('.porta strong').innerText()).split(', ')) await p.locator('.teclat button', { hasText: String(PAR.indexOf(w)) }).tap();
    ok((await p.locator('.avisos').innerText()).includes('dañados'), 'datos dañados: aviso al adulto y partida nueva');
    ok(await p.evaluate(() => localStorage.getItem('illes-nicole-danyat')) === '{dañado', 'se conserva copia de los datos dañados');
    await c.close();
  }
  await b.close();
}
srv.kill();
console.log(fallos ? `\n${fallos} FALLOS` : '\nTodo OK');
process.exit(fallos ? 1 : 0);
