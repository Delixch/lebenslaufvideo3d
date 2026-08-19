import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects } from '../lib/projects';
import { LampMoths } from './LampMoths';

/**
 * Lage des Bildschirms auf dem Hintergrundbild, in Prozent der Buehne, dazu die
 * Drehung, mit der die Flaeche auf den aufgeklappten Deckel gelegt wird. Alle
 * Feinjustage passiert hier — sonst nirgends.
 */
const SCREEN_QUAD = {
  topLeft: [0.2032, 0.3871],
  topRight: [0.4791, 0.4087],
  bottomRight: [0.5248, 0.7063],
  bottomLeft: [0.2413, 0.7661],
} as const;

/** Aufloesung der Flaeche, die auf den Deckel gelegt wird. */
const PANEL = { width: 1440, height: 900 };


/**
 * Loest ein lineares Gleichungssystem per Gauss-Elimination.
 */
const solve = (matrix: number[][], rhs: number[]): number[] => {
  const size = rhs.length;
  const rows = matrix.map((row, index) => [...row, rhs[index]]);

  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) {
        pivot = row;
      }
    }
    [rows[column], rows[pivot]] = [rows[pivot], rows[column]];

    for (let row = 0; row < size; row += 1) {
      if (row === column) {
        continue;
      }
      const factor = rows[row][column] / rows[column][column];
      for (let k = column; k <= size; k += 1) {
        rows[row][k] -= factor * rows[column][k];
      }
    }
  }

  return rows.map((row, index) => row[size] / row[index]);
};

/**
 * Projektive Abbildung eines Rechtecks auf vier beliebige Eckpunkte, als
 * matrix3d. Damit liegt die Flaeche exakt auf dem Deckel, statt per Augenmass
 * gedreht zu werden.
 */
const quadTransform = (
  width: number,
  height: number,
  corners: number[][],
): string => {
  const source = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];

  const rows: number[][] = [];
  const rhs: number[] = [];

  source.forEach(([x, y], index) => {
    const [u, v] = corners[index];
    rows.push([x, y, 1, 0, 0, 0, -x * u, -y * u]);
    rhs.push(u);
    rows.push([0, 0, 0, x, y, 1, -x * v, -y * v]);
    rhs.push(v);
  });

  const [a, b, c, d, e, f, g, h] = solve(rows, rhs);

  // Spaltenweise, wie CSS es erwartet.
  return `matrix3d(${a}, ${d}, 0, ${g}, ${b}, ${e}, 0, ${h}, 0, 0, 1, 0, ${c}, ${f}, 0, 1)`;
};

/** Mitte des Laternenglases im Hintergrundbild. */
const LAMP = [0.8022, 0.1395] as const;

/**
 * Die Projekte auf der Strassenbuehne: ein aufgeklapptes Notebook, in dem das
 * jeweilige Projekt selbst laeuft, daneben seine Angaben. Die Laterne im
 * Hintergrund flackert am selben --lamp-intensity wie die im Hero.
 */
export const ProjectsStage: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  // Ausrichthilfe: mit ?align an der Adresse haengen vier Griffe an den Ecken
  // des Bildschirms. Wer sie zieht, sieht unten die fertigen Zahlen zum
  // Einsetzen — damit ist Schaetzen aus Bildschirmfotos vorbei.
  const [corners, setCorners] = useState<number[][]>([
    [...SCREEN_QUAD.topLeft],
    [...SCREEN_QUAD.topRight],
    [...SCREEN_QUAD.bottomRight],
    [...SCREEN_QUAD.bottomLeft],
  ]);
  const aligning =
    typeof window !== 'undefined' && window.location.search.includes('align');
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fill, setFill] = useState(0);

  // Der Ladestand als Glas auf dem Pflaster: es fuellt sich, solange die Seite
  // im Deckel laedt, und leert sich aus dem Bild, sobald sie steht. Die Fuellung
  // kriecht nur bis knapp unter den Rand — den Rest gibt erst das Laden frei.
  useEffect(() => {
    if (loaded) {
      setFill(100);
      return;
    }

    setFill(4);
    // Langsam und mit abnehmendem Tempo bis knapp unter drei Viertel: voll wird
    // das Glas erst, wenn die Seite wirklich steht — sonst luegt die Anzeige.
    const timer = window.setInterval(() => {
      setFill((current) => (current < 74 ? current + (74 - current) * 0.035 + 0.25 : current));
    }, 220);

    return () => window.clearInterval(timer);
  }, [loaded, index]);
  const project = projects[index];
  const plateRef = useRef<HTMLImageElement | null>(null);
  const [transform, setTransform] = useState<string>('');
  const [lamp, setLamp] = useState({ left: '81%', top: '25%' });
  const [bulb, setBulb] = useState({ x: 0, y: 0, size: 40 });

  // Das Bild wird beschnitten dargestellt; ohne diese Rechnung sitzen die
  // Eckpunkte irgendwo, sobald sich das Fensterformat aendert.
  useEffect(() => {
    const measure = () => {
      const plate = plateRef.current;
      if (!plate || !plate.naturalWidth) {
        return;
      }

      const box = plate.getBoundingClientRect();

      const toStage = ([fx, fy]: readonly number[]) => [fx * box.width, fy * box.height];

      setTransform(quadTransform(PANEL.width, PANEL.height, corners.map(toStage)));

      const [lampX, lampY] = toStage(LAMP);
      setLamp({ left: `${lampX}px`, top: `${lampY}px` });
      setBulb({ x: lampX, y: lampY, size: box.width * 0.028 });
    };

    measure();

    // Der Beobachter ist der eigentliche Ausloeser: das Bild bekommt seine
    // endgueltige Groesse erst nach dem Laden, und ohne ihn bliebe die
    // Abbildung auf dem Stand von davor.
    const observer = new ResizeObserver(measure);
    if (plateRef.current) {
      observer.observe(plateRef.current);
    }

    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [corners]);

  const dragCorner = (which: number) => (event: React.PointerEvent) => {
    event.preventDefault();
    const plate = plateRef.current;
    if (!plate) {
      return;
    }

    const away = 76;
    const shiftX = which === 0 || which === 3 ? -away : away;
    const shiftY = which === 0 || which === 1 ? -away : away;

    const move = (pointer: PointerEvent) => {
      const box = plate.getBoundingClientRect();
      setCorners((current) =>
        current.map((corner, index) =>
          index === which
            ? [
                Math.round(((pointer.clientX - shiftX - box.left) / box.width) * 10000) /
                  10000,
                Math.round(((pointer.clientY - shiftY - box.top) / box.height) * 10000) /
                  10000,
              ]
            : corner,
        ),
      );
    };

    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
  };

  const step = useCallback((delta: number) => {
    setLoaded(false);
    setIndex((current) => (current + delta + projects.length) % projects.length);
  }, []);

  // Eine Ecke um Pixel verschieben — von Hand ziehen trifft keine Millimeter.
  const nudge = useCallback(
    (dx: number, dy: number) => {
      const plate = plateRef.current;
      if (!plate) {
        return;
      }

      const box = plate.getBoundingClientRect();
      setCorners((current) =>
        current.map((corner, index) =>
          index === active
            ? [
                Math.round((corner[0] + dx / box.width) * 10000) / 10000,
                Math.round((corner[1] + dy / box.height) * 10000) / 10000,
              ]
            : corner,
        ),
      );
    },
    [active],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (aligning) {
        const stride = event.shiftKey ? 10 : 1;
        const moves: Record<string, [number, number]> = {
          ArrowLeft: [-stride, 0],
          ArrowRight: [stride, 0],
          ArrowUp: [0, -stride],
          ArrowDown: [0, stride],
        };

        if (moves[event.key]) {
          event.preventDefault();
          nudge(...moves[event.key]);
          return;
        }

        if (event.key >= '1' && event.key <= '4') {
          setActive(Number(event.key) - 1);
        }

        return;
      }

      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aligning, nudge, step]);

  return (
    <section
      id="work-stage"
      className="relative hidden h-screen w-full items-center justify-center overflow-hidden bg-black md:flex"
      style={{ animation: 'lampIntensity 6s infinite ease-in-out' }}
    >
      {/* Eine Buehne im Format des Bildes: sie passt immer ganz ins Fenster,
          und alles darin rechnet in Prozent dieser Flaeche. Damit kann nichts
          ueberstehen, egal wie das Fenster steht. */}
      <div
        className="relative inline-block"
        style={
          aligning
            ? {
                // Eigene Lupe statt Browser-Zoom: der Deckel bleibt in der
                // Mitte, und die Bruchteile gelten unveraendert weiter.
                transform: `scale(${zoom})`,
                transformOrigin: `${(corners[0][0] + corners[2][0]) * 50}% ${
                  (corners[0][1] + corners[2][1]) * 50
                }%`,
              }
            : undefined
        }
      >
        {/* Das Bild selbst spannt die Buehne auf: begrenzt durch Breite und
            Hoehe des Fensters, also immer vollstaendig sichtbar. Alles andere
            liegt absolut darin und rechnet in Prozent davon. */}
        <img
          ref={plateRef}
          src="/projekt-buehne.jpg"
          alt=""
          onLoad={() => window.dispatchEvent(new Event('resize'))}
          className="block h-auto w-auto max-h-[86svh] max-w-[96vw]"
        />

        {/* Messgroesse fuer alles darin: cqw und cqh beziehen sich ab hier auf
            die Buehne, nicht auf das Fenster. Die Groesse selbst darf nicht am
            Wrapper haengen, sonst faellt der durch die Groessen-Containment auf
            null zusammen. */}
        <div className="absolute inset-0" style={{ containerType: 'size' }}>
      {/* Dasselbe Licht wie im Hero: weisser Kern, weit auslaufender weisser
          Hof, dazu nur ein Hauch Widerschein auf dem Pflaster. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: lamp.left,
          top: lamp.top,
          width: '5.6cqw',
          height: '5.6cqw',
          background:
            'radial-gradient(circle, rgba(255,255,253,0.98) 0%, rgba(255,253,246,0.84) 16%, rgba(252,248,236,0.54) 34%, rgba(244,238,222,0.28) 52%, rgba(226,216,196,0.11) 72%, rgba(190,180,160,0.03) 88%, transparent 100%)',
          mixBlendMode: 'screen',
          filter: 'blur(7px)',
          opacity: 'calc(0.55 + var(--lamp-intensity, 1) * 0.45)',
        }}
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: lamp.left,
          top: lamp.top,
          width: '22cqw',
          height: '22cqw',
          background:
            'radial-gradient(circle, rgba(255,255,252,0.11) 0%, rgba(252,250,244,0.07) 14%, rgba(246,242,232,0.045) 28%, rgba(236,230,216,0.028) 42%, rgba(220,212,196,0.016) 56%, rgba(196,188,172,0.008) 70%, rgba(160,152,138,0.003) 84%, transparent 100%)',
          mixBlendMode: 'screen',
          filter: 'blur(55px)',
          opacity: 'calc(0.6 + var(--lamp-intensity, 1) * 0.4)',
        }}
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
        style={{
          left: lamp.left,
          top: '88%',
          width: '26cqw',
          height: '9cqh',
          background:
            'radial-gradient(closest-side, rgba(255,232,190,0.18), rgba(214,168,100,0.07) 55%, transparent 84%)',
          mixBlendMode: 'screen',
          filter: 'blur(22px)',
          opacity: 'calc(0.45 + var(--lamp-intensity, 1) * 0.55)',
        }}
      />

      {/* Nachtfalter um die Laterne */}
      <LampMoths centerX={bulb.x} centerY={bulb.y} bulbSize={bulb.size} active={bulb.size > 1} />

      <div className="absolute left-[3.5cqw] top-[7cqh] max-w-[22cqw]">
        <p className="text-[0.85cqw] font-semibold uppercase tracking-[0.42em] text-[#C99E5D]">
          Ausgewählte
        </p>
        <h2
          className="mt-2 text-[5.2cqw] uppercase leading-[0.82] text-transparent"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            backgroundImage: 'linear-gradient(to bottom, #FFFFFF, #D5CBC0 55%, #6A5C50)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
          }}
        >
          Projekte
        </h2>
        <p className="mt-[1.4cqh] text-[0.95cqw] font-light leading-relaxed text-[#A8988B]">
          Interaktive Projektauswahl. Verwenden Sie die Pfeiltasten oder die
          Schaltflächen, um zwischen den Projekten zu wechseln.
        </p>
        <span className="mt-6 block h-px w-16 bg-[#C99E5D]/70" />
      </div>

      <div
        className="absolute left-0 top-0 overflow-hidden"
        style={{
          width: `${PANEL.width}px`,
          height: `${PANEL.height}px`,
          transformOrigin: '0 0',
          transform,
          background: '#080706',
          borderRadius: '26px',
          opacity: transform ? 1 : 0,
        }}
      >
        <div className="h-full w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={project.number}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-full w-full"
            >
              <div className="relative h-full w-full overflow-hidden bg-[#0B0A09]">
                {aligning ? (
                  // Beim Ausrichten zaehlt Sichtbarkeit, nicht Inhalt: ein
                  // schwarzes Portfolio auf einem schwarzen Deckel laesst sich
                  // nicht einpassen.
                  <div
                    className="absolute inset-0"
                    style={{ background: '#FFFFFF', boxShadow: 'inset 0 0 0 6px #1B6FE0' }}
                  />
                ) : (
                  <>
                    <iframe
                    key={project.githubUrl}
                    src={project.githubUrl}
                    title={project.title}
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    referrerPolicy="no-referrer"
                    onLoad={() => window.setTimeout(() => setLoaded(true), 900)}
                    className="pointer-events-none absolute left-0 top-0 z-10 origin-top-left border-0 transition-opacity duration-500"
                    style={{
                      width: '250%',
                      height: '250%',
                      transform: 'scale(0.4)',
                      // Erst zeigen, wenn die Seite wirklich steht: sonst blitzt
                      // ihr weisser Ladezustand im Deckel auf.
                      opacity: loaded ? 1 : 0,
                    }}
                  />
                    {/* Faellt auf eine Karte zurueck, falls eine Seite das
                        Einbetten verbietet. */}
                    <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-br from-[#1A1512] to-[#0A0908] p-6">
                      <span
                        className="text-[1.4cqw] uppercase leading-none text-[#C99E5D]"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                      {project.title}
                      </span>
                    </div>
                  </>
                )}
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
              <motion.div
          key={project.number}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-[3cqw] top-1/2 flex w-[23cqw] -translate-y-1/2 flex-col gap-3 border border-[#8C6D4F]/45 bg-[#0A0908]/85 px-[1.8cqw] py-[2.4cqh] backdrop-blur-md"
        >
                <p className="text-[0.72cqw] font-semibold uppercase tracking-[0.34em] text-[#C99E5D]">
                  {project.number} / Projekt
                </p>
                <h3
                  className="text-[2cqw] uppercase leading-[0.9] text-[#F3E7D8]"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {project.title}
                </h3>
                <p className="text-[0.7cqw] font-semibold uppercase tracking-[0.3em] text-[#8C6D4F]">
                  {project.category}
                </p>

                <p className="mt-1 text-[0.82cqw] font-light leading-relaxed text-[#A8988B]">
                  {project.description}
                </p>

                <span className="my-1 block h-px w-full bg-[#8C6D4F]/40" />

                <p className="text-[0.65cqw] font-semibold uppercase tracking-[0.3em] text-[#8C6D4F]">
                  Verwendete Technologien
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {project.tech.slice(0, 6).map((tech) => (
                    <span
                      key={tech}
                      className="text-[0.7cqw] font-semibold uppercase tracking-[0.18em] text-[#D5CBC0]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-between border border-[#C99E5D]/60 px-[1.1cqw] py-[1.1cqh] text-[0.7cqw] font-semibold uppercase tracking-[0.3em] text-[#F3E7D8] transition-colors hover:border-[#D4AF37] hover:text-[#F7E7C4]"
                >
                  Projekt öffnen <span aria-hidden="true">↗</span>
                </a>
              </motion.div>
      </AnimatePresence>

      <div className="absolute right-[2.5cqw] top-[6cqh] flex flex-col items-end gap-4">
        <p className="text-[0.9cqw] tracking-[0.3em] text-[#C99E5D]">
          {project.number} / {String(projects.length).padStart(2, '0')}
        </p>
        <div className="flex flex-col gap-2">
          {projects.map((entry, dot) => (
            <button
              key={entry.number}
              type="button"
              onClick={() => setIndex(dot)}
              aria-label={`Projekt ${entry.number}`}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                dot === index ? 'bg-[#D4AF37]' : 'bg-[#8C6D4F]/40'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-[6cqh] left-[3.5cqw] flex flex-col gap-3">
        <div className="flex gap-3">
          {[-1, 1].map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => step(delta)}
              aria-label={delta < 0 ? 'Vorheriges Projekt' : 'Nächstes Projekt'}
              className="flex h-[3.4cqh] w-[2.2cqw] items-center justify-center border border-[#8C6D4F]/60 text-[#D5CBC0] transition-colors hover:border-[#D4AF37] hover:text-[#F7E7C4]"
            >
              {delta < 0 ? '‹' : '›'}
            </button>
          ))}
        </div>
        <p className="text-[0.7cqw] font-semibold uppercase tracking-[0.3em] text-[#8C6D4F]">
          Oder verwenden Sie
          <br />
          die Pfeiltasten
        </p>
      </div>

      <div className="absolute bottom-[5cqh] left-1/2 w-[34cqw] -translate-x-1/2">
        <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C99E5D]">
          Verwenden Sie die Pfeiltasten
        </p>
        <div className="relative h-px w-full bg-[#8C6D4F]/30">
          <span
            className="absolute -top-[3px] h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-[#D4AF37] transition-all duration-500"
            style={{ left: `${((index + 0.5) / projects.length) * 100}%` }}
          />
        </div>
      </div>

        {/* Wasserglas auf dem Pflaster als Ladeanzeige */}
        <div
          className="pointer-events-none absolute z-30 transition-opacity duration-700"
          style={{
            // Links neben dem Notebook auf dem Pflaster, etwa halb so hoch wie
            // das Geraet.
            left: '7.5%',
            top: '58%',
            width: '6.4cqw',
            height: '21cqh',
            opacity: loaded ? 0 : 1,
          }}
        >
          <div
            className="relative h-full w-full overflow-hidden"
            style={{
              // Ein Glas verjuengt sich nach unten.
              clipPath: 'polygon(6% 0%, 94% 0%, 82% 100%, 18% 100%)',
              background:
                'linear-gradient(100deg, rgba(255,246,230,0.16) 0%, rgba(255,246,230,0.05) 40%, rgba(255,246,230,0.14) 100%)',
              border: '1px solid rgba(255,236,200,0.35)',
              backdropFilter: 'blur(1px)',
            }}
          >
            <div
              className="absolute inset-x-0 bottom-0 transition-[height] duration-500 ease-out"
              style={{
                height: `${fill}%`,
                background:
                  'linear-gradient(to bottom, rgba(255,206,130,0.95), rgba(212,148,58,0.9) 45%, rgba(150,92,28,0.92))',
                boxShadow: '0 0 12px rgba(234,179,8,0.5)',
              }}
            >
              <span className="absolute inset-x-0 top-0 h-[6%] bg-[rgba(255,244,214,0.9)]" />
            </div>
          </div>

          {/* Widerschein auf dem nassen Stein */}
          <span
            className="absolute inset-x-[-30%] bottom-[-12%] h-[22%] rounded-[50%]"
            style={{
              background:
                'radial-gradient(closest-side, rgba(234,179,8,0.35), transparent 70%)',
              filter: 'blur(3px)',
            }}
          />
        </div>

        {aligning && (
          <>
            {corners.map((corner, which) => {
              // Der Griff sitzt zwei Zentimeter neben der Ecke, damit die Hand
              // nicht verdeckt, was sie gerade einpassen soll. Der kleine Punkt
              // markiert die Ecke selbst.
              const away = 76;
              const shiftX = which === 0 || which === 3 ? -away : away;
              const shiftY = which === 0 || which === 1 ? -away : away;

              return (
                <React.Fragment key={which}>
                  <span
                    onPointerDown={(event) => {
                      setActive(which);
                      dragCorner(which)(event);
                    }}
                    className={`absolute z-50 flex h-8 w-8 cursor-grab items-center justify-center rounded-full border-2 text-[10px] font-bold text-black shadow-[0_0_0_4px_rgba(0,0,0,0.6)] ${
                      which === active
                        ? 'border-white bg-[#39FF6A]'
                        : 'border-white/60 bg-[#39FF6A]/45'
                    }`}
                    style={{
                      left: `${corner[0] * 100}%`,
                      top: `${corner[1] * 100}%`,
                      transform: `translate(calc(-50% + ${shiftX}px), calc(-50% + ${shiftY}px))`,
                    }}
                  >
                    {which + 1}
                  </span>
                </React.Fragment>
              );
            })}
            <div className="fixed bottom-[9.5rem] right-4 z-[60] grid grid-cols-3 gap-1">
              {[
                ['', '↑', ''],
                ['←', String(active + 1), '→'],
                ['', '↓', ''],
              ]
                .flat()
                .map((label, cell) => {
                  const moves: Record<number, [number, number]> = {
                    1: [0, -1],
                    3: [-1, 0],
                    5: [1, 0],
                    7: [0, 1],
                  };

                  if (!moves[cell]) {
                    return (
                      <span
                        key={cell}
                        className="flex h-9 w-9 items-center justify-center text-[12px] font-bold text-[#39FF6A]"
                      >
                        {label}
                      </span>
                    );
                  }

                  return (
                    <button
                      key={cell}
                      type="button"
                      onClick={() => nudge(...moves[cell])}
                      className="h-9 w-9 rounded border border-[#39FF6A]/70 bg-black/80 text-[14px] text-[#39FF6A] active:bg-[#39FF6A]/25"
                    >
                      {label}
                    </button>
                  );
                })}
            </div>

            <div className="fixed bottom-[16rem] right-4 z-[60] flex flex-col gap-1">
              {[
                ['+', 0.25],
                ['−', -0.25],
              ].map(([label, delta]) => (
                <button
                  key={label as string}
                  type="button"
                  onClick={() =>
                    setZoom((current) =>
                      Math.min(6, Math.max(1, current + (delta as number))),
                    )
                  }
                  className="h-9 w-9 rounded border border-[#39FF6A]/70 bg-black/80 text-[16px] text-[#39FF6A] active:bg-[#39FF6A]/25"
                >
                  {label as string}
                </button>
              ))}
              <span className="text-center text-[11px] text-[#39FF6A]">{zoom}x</span>
            </div>

            <pre className="fixed bottom-4 right-4 z-[60] select-all bg-black/90 p-3 text-[12px] leading-tight text-[#39FF6A]">
              {`topLeft: [${corners[0]}],
topRight: [${corners[1]}],
bottomRight: [${corners[2]}],
bottomLeft: [${corners[3]}],`}
            </pre>
          </>
        )}
        </div>
      </div>
    </section>
  );
};
