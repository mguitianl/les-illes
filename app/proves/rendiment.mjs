// Mide la fluidez del arrastre con la CPU ralentizada (aprox. un móvil modesto). Requiere `npm run build`.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
const PORT = 8125;
const srv = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 1500));
const b = await chromium.launch();
for (const [nom, w, h] of [['móvil vertical', 390, 664], ['iPad horizontal', 1180, 820]]) {
  const c = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: 3 });
  const p = await c.newPage();
  const cdp = await c.newCDPSession(p);
  await p.goto(`http://localhost:${PORT}/?silenci&sensedemo`);
  await p.waitForTimeout(400);
  await p.locator('#port-cistella').click();
  await p.waitForTimeout(800);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  const poma = p.locator('.poma').first();
  const r = await poma.boundingBox();
  const dest = await p.locator('.zona[data-zona="cistella"] .ancora').boundingBox();
  await p.evaluate(() => { window.__f = []; let t = performance.now(); const f = n => { window.__f.push(n - t); t = n; window.__raf = requestAnimationFrame(f); }; window.__raf = requestAnimationFrame(f); });
  const x0 = r.x + r.width / 2, y0 = r.y + r.height / 2, x1 = dest.x + dest.width / 2, y1 = dest.y + dest.height / 2;
  for (let k = 0; k < 3; k++) {
    await p.mouse.move(x0, y0); await p.mouse.down();
    for (let i = 1; i <= 40; i++) await p.mouse.move(x0 + (x1 - x0) * i / 40, y0 + (y1 - y0) * i / 40);
    for (let i = 40; i >= 0; i--) await p.mouse.move(x0 + (x1 - x0) * i / 40, y0 + (y1 - y0) * i / 40);
    await p.mouse.up(); await p.waitForTimeout(300);
  }
  const f = await p.evaluate(() => { cancelAnimationFrame(window.__raf); return window.__f.slice(2); });
  f.sort((a, b) => a - b);
  const med = f[Math.floor(f.length / 2)], p95 = f[Math.floor(f.length * .95)];
  const lents = f.filter(x => x > 34).length;
  console.log(`${nom}: ${f.length} fotogramas · mediana ${med.toFixed(1)} ms · p95 ${p95.toFixed(1)} ms · >34 ms: ${lents}`);
  await c.close();
}
await b.close(); srv.kill();
