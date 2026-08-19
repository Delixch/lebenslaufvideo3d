import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects } from '../lib/projects';

/**
 * Lage des Bildschirms auf dem Hintergrundbild, in Prozent der Buehne, dazu die
 * Drehung, mit der die Flaeche auf den aufgeklappten Deckel gelegt wird. Alle
 * Feinjustage passiert hier — sonst nirgends.
 */
const SCREEN_QUAD = {
  topLeft: [0.1829, 0.2529],
  topRight: [0.5895, 0.3032],
  bottomRight: [0.5969, 0.6103],
  bottomLeft: [0.2267, 0.7045],
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
const LAMP = [0.795, 0.075] as const;

/**
 * Die Projekte auf der Strassenbuehne: ein aufgeklapptes Notebook, in dem das
 * jeweilige Projekt selbst laeuft, daneben seine Angaben. Die Laterne im
 * Hintergrund flackert am selben --lamp-intensity wie die im Hero.
 */
export const ProjectsStage: React.FC = () => {
  const [index, setIndex] = useState(0);
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
      const ratio = plate.naturalWidth / plate.naturalHeight;
      const boxRatio = box.width / box.height;

      const drawnW = boxRatio >= ratio ? box.width : box.height * ratio;
      const drawnH = boxRatio >= ratio ? box.width / ratio : box.height;
      const originX = (box.width - drawnW) / 2;
      const originY = (box.height - drawnH) / 2;

      const toStage = ([fx, fy]: readonly number[]) => [
        originX + fx * drawnW,
        originY + fy * drawnH,
      ];

      setTransform(
        quadTransform(PANEL.width, PANEL.height, [
          toStage(SCREEN_QUAD.topLeft),
          toStage(SCREEN_QUAD.topRight),
          toStage(SCREEN_QUAD.bottomRight),
          toStage(SCREEN_QUAD.bottomLeft),
        ]),
      );

      const [lampX, lampY] = toStage(LAMP);
      setLamp({ left: `${lampX}px`, top: `${lampY}px` });
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const step = useCallback((delta: number) => {
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
      className="relative hidden h-screen w-full overflow-hidden bg-black md:block"
      style={{ animation: 'lampIntensity 6s infinite ease-in-out' }}
    >
      <img
        ref={plateRef}
        src="/projekt-buehne.jpg"
        alt=""
        onLoad={() => window.dispatchEvent(new Event('resize'))}
        className="absolute inset-0 h-full w-full object-cover"
      />
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

      <div className="absolute left-[3.5vw] top-[8vh] max-w-[22vw]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-[#C99E5D]">
          Ausgewählte
        </p>
        <h2
          className="mt-2 text-[5.2vw] uppercase leading-[0.82] text-transparent"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            backgroundImage: 'linear-gradient(to bottom, #FFFFFF, #D5CBC0 55%, #6A5C50)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
          }}
        >
          Projekte
        </h2>
        <p className="mt-5 text-[13px] font-light leading-relaxed text-[#A8988B]">
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
              <div className="relative h-full w-[56%] overflow-hidden bg-[#0B0A09]">
                <iframe
                  key={project.githubUrl}
                  src={project.githubUrl}
                  title={project.title}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin"
                  className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
                  style={{ width: '250%', height: '250%', transform: 'scale(0.4)' }}
                />
                {/* Faellt auf eine Karte zurueck, falls eine Seite das Einbetten
                    verbietet: sie liegt darunter und bleibt dann sichtbar. */}
                <div className="pointer-events-none absolute inset-0 -z-10 flex items-end bg-gradient-to-br from-[#1A1512] to-[#0A0908] p-6">
                  <span
                    className="text-[1.6vw] uppercase leading-none text-[#C99E5D]"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {project.title}
                  </span>
                </div>
              </div>

              <div className="flex h-full w-[44%] flex-col justify-center gap-3 bg-[#0A0908] px-[2.2vw]">
                <p className="text-[0.62vw] font-semibold uppercase tracking-[0.34em] text-[#C99E5D]">
                  {project.number} / Projekt
                </p>
                <h3
                  className="text-[2vw] uppercase leading-[0.9] text-[#F3E7D8]"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {project.title}
                </h3>
                <p className="text-[0.6vw] font-semibold uppercase tracking-[0.3em] text-[#8C6D4F]">
                  {project.category}
                </p>

                <p className="mt-1 text-[0.68vw] font-light leading-relaxed text-[#A8988B]">
                  {project.description}
                </p>

                <span className="my-1 block h-px w-full bg-[#8C6D4F]/40" />

                <p className="text-[0.55vw] font-semibold uppercase tracking-[0.3em] text-[#8C6D4F]">
                  Verwendete Technologien
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {project.tech.slice(0, 6).map((tech) => (
                    <span
                      key={tech}
                      className="text-[0.58vw] font-semibold uppercase tracking-[0.18em] text-[#D5CBC0]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-between border border-[#C99E5D]/60 px-[1.2vw] py-[0.7vw] text-[0.6vw] font-semibold uppercase tracking-[0.3em] text-[#F3E7D8] transition-colors hover:border-[#D4AF37] hover:text-[#F7E7C4]"
                >
                  Projekt öffnen <span aria-hidden="true">↗</span>
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute right-[2.5vw] top-[7vh] flex flex-col items-end gap-4">
        <p className="text-[13px] tracking-[0.3em] text-[#C99E5D]">
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

      <div className="absolute bottom-[7vh] left-[3.5vw] flex flex-col gap-3">
        <div className="flex gap-3">
          {[-1, 1].map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => step(delta)}
              aria-label={delta < 0 ? 'Vorheriges Projekt' : 'Nächstes Projekt'}
              className="flex h-11 w-11 items-center justify-center border border-[#8C6D4F]/60 text-[#D5CBC0] transition-colors hover:border-[#D4AF37] hover:text-[#F7E7C4]"
            >
              {delta < 0 ? '‹' : '›'}
            </button>
          ))}
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8C6D4F]">
          Oder verwenden Sie
          <br />
          die Pfeiltasten
        </p>
      </div>

      <div className="absolute bottom-[6vh] left-1/2 w-[36vw] -translate-x-1/2">
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
    </section>
  );
};
