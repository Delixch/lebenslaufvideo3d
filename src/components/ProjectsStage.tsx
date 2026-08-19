import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects } from '../lib/projects';

/**
 * Lage des Bildschirms auf dem Hintergrundbild, in Prozent der Buehne, dazu die
 * Drehung, mit der die Flaeche auf den aufgeklappten Deckel gelegt wird. Alle
 * Feinjustage passiert hier — sonst nirgends.
 */
const SCREEN_QUAD = {
  topLeft: [0.2062, 0.3971],
  topRight: [0.4771, 0.4157],
  bottomRight: [0.5236, 0.7101],
  bottomLeft: [0.2422, 0.7598],
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
const LAMP = [0.797, 0.055] as const;

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
  const project = projects[index];
  const plateRef = useRef<HTMLImageElement | null>(null);
  const [transform, setTransform] = useState<string>('');
  const [lamp, setLamp] = useState({ left: '81%', top: '25%' });

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

    const move = (pointer: PointerEvent) => {
      const box = plate.getBoundingClientRect();
      setCorners((current) =>
        current.map((corner, index) =>
          index === which
            ? [
                Math.round(((pointer.clientX - box.left) / box.width) * 10000) / 10000,
                Math.round(((pointer.clientY - box.top) / box.height) * 10000) / 10000,
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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  return (
    <section
      id="work-stage"
      className="relative hidden h-screen w-full items-center justify-center overflow-hidden bg-black md:flex"
      style={{ animation: 'lampIntensity 6s infinite ease-in-out' }}
    >
      {/* Eine Buehne im Format des Bildes: sie passt immer ganz ins Fenster,
          und alles darin rechnet in Prozent dieser Flaeche. Damit kann nichts
          ueberstehen, egal wie das Fenster steht. */}
      <div className="relative inline-block">
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
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: lamp.left,
          top: lamp.top,
          width: '26vw',
          height: '26vw',
          background:
            'radial-gradient(circle, rgba(255,214,140,0.34) 0%, rgba(240,182,96,0.16) 26%, rgba(196,134,68,0.07) 48%, transparent 76%)',
          mixBlendMode: 'screen',
          filter: 'blur(28px)',
          opacity: 'calc(0.75 + var(--lamp-intensity, 1) * 0.25)',
        }}
      />

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
                    style={{
                      background:
                        'repeating-conic-gradient(#F7E7C4 0% 25%, #8C3B1E 0% 50%) 0 0 / 12% 12%',
                      boxShadow: 'inset 0 0 0 10px #1B6FE0',
                    }}
                  >
                    {[
                      'left-0 top-0',
                      'right-0 top-0',
                      'right-0 bottom-0',
                      'left-0 bottom-0',
                    ].map((place) => (
                      <span
                        key={place}
                        className={`absolute h-[8%] w-[6%] bg-[#0A0908] ${place}`}
                      />
                    ))}
                  </div>
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

        {aligning && (
          <>
            {corners.map((corner, which) => (
              <span
                key={which}
                onPointerDown={dragCorner(which)}
                className="absolute z-50 h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-[#D4AF37] bg-black/60"
                style={{ left: `${corner[0] * 100}%`, top: `${corner[1] * 100}%` }}
              />
            ))}
            <pre className="absolute bottom-2 left-2 z-50 bg-black/80 p-3 text-[11px] leading-tight text-[#D4AF37]">
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
