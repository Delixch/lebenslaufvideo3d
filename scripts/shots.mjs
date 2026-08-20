/**
 * Standbilder der Projektseiten fuer die Notebook-Buehne.
 *
 * Die Buehne zeigt normalerweise nur ein Bild im Bildschirm; die echte Seite
 * wird erst geladen, wenn jemand sie bedienen will. Dieses Skript holt die
 * Bilder: ein kopfloses Chrome faehrt jede Projektseite an, wartet, bis sich
 * die Animationen gesetzt haben, und legt einen Schnappschuss ab.
 *
 *   node scripts/shots.mjs            alle Projekte
 *   node scripts/shots.mjs 03 07      nur diese beiden
 *   SETTLE_MS=20000 node ...          laenger warten
 *
 * Gesteuert wird ueber das DevTools-Protokoll statt ueber `--screenshot`:
 * Die drei 3D-Projekte zeigen erst einen Ladevorhang, und der verschwindet
 * nur, wenn die Seite echte Zeit bekommt — mit `--virtual-time-budget` bleibt
 * der Vorhang stehen.
 *
 * Die Bilder landen in public/shots/<Nummer>.webp und gehen mit ins Repo —
 * sie gehoeren zum Auftritt, nicht zum Build.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Innenmasse des Bildschirms in der Buehne (siehe PANEL in ProjectsStage). */
const SHOT = { width: 1800, height: 1125 };

/** Ruhezeit nach dem Laden, bevor der Auslöser klickt. */
const SETTLE_MS = Number(process.env.SETTLE_MS) || 6000;

/**
 * Projekte, die erst eine WebGL-Szene aufbauen: deren Ladevorhang faellt nicht
 * nach ein paar Sekunden, sondern erst wenn die Szene wirklich steht.
 */
const SLOW = new Set(['07', '08', '09']);
const SLOW_MS = Number(process.env.SLOW_MS) || 70000;

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].filter(Boolean);

const findChrome = () => {
  const chrome = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
  if (!chrome) {
    throw new Error('Kein Chrome gefunden. Pfad ueber CHROME_PATH setzen.');
  }
  return chrome;
};

/**
 * Die Projektliste ist TypeScript, das Skript laeuft in nacktem Node — statt
 * einer Build-Stufe reicht hier das Ablesen der beiden Felder.
 */
const readProjects = () => {
  const source = readFileSync(path.join(root, 'src/lib/projects.ts'), 'utf8');
  const entries = [...source.matchAll(/number:\s*'(\d+)'[\s\S]*?githubUrl:\s*'([^']+)'/g)];

  if (!entries.length) {
    throw new Error('In src/lib/projects.ts keine Projekte gefunden.');
  }

  return entries.map(([, number, url]) => ({ number, url }));
};

/** Chrome schreibt seinen Port erst, wenn er wirklich lauscht. */
const waitForPort = async (profile) => {
  const marker = path.join(profile, 'DevToolsActivePort');

  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (existsSync(marker)) {
      const port = readFileSync(marker, 'utf8').split('\n')[0].trim();
      if (port) {
        return port;
      }
    }
    await delay(200);
  }

  throw new Error('Chrome hat keinen DevTools-Port gemeldet.');
};

/** Duenne Huelle um das DevTools-Protokoll: senden, warten, zuhoeren. */
const connect = async (socketUrl) => {
  const socket = new WebSocket(socketUrl);
  const pending = new Map();
  const listeners = new Map();

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);

    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(new Error(message.error.message)) : resolve(message.result);
      return;
    }

    listeners.get(message.method)?.forEach((listener) => listener(message.params));
  });

  let counter = 0;

  return {
    send: (method, params = {}) =>
      new Promise((resolve, reject) => {
        counter += 1;
        pending.set(counter, { resolve, reject });
        socket.send(JSON.stringify({ id: counter, method, params }));
      }),
    once: (method) =>
      new Promise((resolve) => {
        const listener = (params) => {
          listeners.get(method).delete(listener);
          resolve(params);
        };
        if (!listeners.has(method)) {
          listeners.set(method, new Set());
        }
        listeners.get(method).add(listener);
      }),
    close: () => socket.close(),
  };
};

const wanted = process.argv.slice(2);
const projects = readProjects().filter(
  (project) => !wanted.length || wanted.includes(project.number),
);

mkdirSync(path.join(root, 'public/shots'), { recursive: true });
const profile = mkdtempSync(path.join(tmpdir(), 'buehne-shots-'));

const chrome = spawn(
  findChrome(),
  [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    `--window-size=${SHOT.width},${SHOT.height}`,
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--force-device-scale-factor=1',
    // Ohne GPU bleibt WebGL tot und die 3D-Projekte zeigen nur ihren
    // Ladevorhang. SwiftShader rechnet die Szene auf der CPU.
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

let session;

try {
  const port = await waitForPort(profile);
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((target) => target.type === 'page');

  if (!page) {
    throw new Error('Chrome hat keine Seite geoeffnet.');
  }

  session = await connect(page.webSocketDebuggerUrl);
  await session.send('Page.enable');
  await session.send('Emulation.setDeviceMetricsOverride', {
    width: SHOT.width,
    height: SHOT.height,
    deviceScaleFactor: 1,
    mobile: false,
  });

  for (const project of projects) {
    process.stdout.write(`${project.number}  ${project.url}\n`);

    try {
      const loaded = session.once('Page.loadEventFired');
      await session.send('Page.navigate', { url: project.url });
      await Promise.race([loaded, delay(45000)]);
      await delay(SLOW.has(project.number) ? SLOW_MS : SETTLE_MS);

      const { data } = await session.send('Page.captureScreenshot', { format: 'png' });
      const target = path.join(root, 'public/shots', `${project.number}.webp`);
      const { size } = await sharp(Buffer.from(data, 'base64'))
        .resize(SHOT.width, SHOT.height, { fit: 'cover', position: 'top' })
        .webp({ quality: 74, effort: 6 })
        .toFile(target);

      process.stdout.write(
        `    ${path.relative(root, target)}  ${Math.round(size / 1024)} kB\n`,
      );
    } catch (error) {
      process.stdout.write(`    fehlgeschlagen: ${error.message.split('\n')[0]}\n`);
    }
  }
} finally {
  session?.close();
  chrome.kill();
  await delay(400);
  rmSync(profile, { recursive: true, force: true });
}
