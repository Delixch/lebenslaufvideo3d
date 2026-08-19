import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects } from '../lib/projects';
import { LampMoths } from './LampMoths';

const SCREEN_QUAD = {
  topLeft: [0.1033, 0.1275],
  topRight: [0.7731, 0.1197],
  bottomRight: [0.7731, 0.7899],
  bottomLeft: [0.1006, 0.788],
} as const;

const PANEL = { width: 1440, height: 900 };

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
  return `matrix3d(${a}, ${d}, 0, ${g}, ${b}, ${e}, 0, ${h}, 0, 0, 1, 0, ${c}, ${f}, 0, 1)`;
};

const LAMP = [0.855, 0.178] as const;

export const ProjectsStage: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [corners, setCorners] = useState<number[][]>([
    [...SCREEN_QUAD.topLeft],
    [...SCREEN_QUAD.topRight],
    [...SCREEN_QUAD.bottomRight],
    [...SCREEN_QUAD.bottomLeft],
  ]);
  const aligning = false;
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fill, setFill] = useState(0);

  useEffect(() => {
    if (loaded) {
      setFill(100);
      return;
    }

    setFill(4);
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
  const stageRef = useRef<HTMLElement | null>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const watcher = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.15 },
    );

    watcher.observe(stage);
    return () => watcher.disconnect();
  }, []);

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
                Math.round(((pointer.clientX - shiftX - box.left) / box.width) * 10000) / 10000,
                Math.round(((pointer.clientY - shiftY - box.top) / box.height) * 10000) / 10000,
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

  useEffect(() => {
    if (!live) {
      return;
    }

    const anchor = window.scrollY;
    const hold = () => {
      if (Math.abs(window.scrollY - anchor) > 1) {
        window.scrollTo(0, anchor);
      }
    };

    const release = (event: WheelEvent) => {
      if (!(event.target as HTMLElement)?.closest('iframe')) {
        setLive(false);
      }
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('scroll', hold, { passive: true });
    window.addEventListener('wheel', release, { passive: true });

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('scroll', hold);
      window.removeEventListener('wheel', release);
    };
  }, [live]);

  const step = useCallback((delta: number) => {
    setLive(false);
    setLoaded(false);
    setIndex((current) => (current + delta + projects.length) % projects.length);
  }, []);

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

      if (event.key === 'Escape') {
        setLive(false);
        return;
      }

      if (live) {
        return;
      }

      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aligning, live, nudge, step]);

  return (
    <section
      ref={stageRef}
      id="work-stage"
      onPointerDown={(event) => {
        if (live && !(event.target as HTMLElement).closest('iframe')) {
          setLive(false);
        }
      }}
      className="hidden md:block relative w-full bg-black text-[#E8DFD8] font-sans selection:bg-[#cbb59d] selection:text-black pt-8 pb-32 px-6 sm:px-12 lg:px-20"
      style={{ animation: onScreen ? 'lampIntensity 6s infinite ease-in-out' : 'none' }}
    >
      <div className="absolute top-1/4 left-1/3 w-[36rem] h-[36rem] bg-[#D4AF37]/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#8C6D4F]/5 rounded-full blur-[170px] pointer-events-none" />

      {/* 1. SERVER'IN BAŞLIK VE LAYOUT YAPISI */}
      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center space-x-4 mb-5"
        >
          <span
            className="text-[11px] font-medium tracking-[0.35em] uppercase text-[#D4AF37]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            02 / AUSGEWÄHLTE ARBEITEN
          </span>
          <div className="w-20 h-[1px] bg-gradient-to-r from-[#D4AF37]/80 via-[#8C6D4F]/40 to-transparent" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16"
        >
          <h2
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-tight uppercase leading-[0.85] select-none"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#D5CBC0] to-[#605448] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              AUSGEWÄHLTE ARBEITEN.
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#F7E7C4] via-[#C99E5D] to-[#543B1A] drop-shadow-[0_8px_25px_rgba(201,158,93,0.35)]">
              MIT HAND GEBAUT.
            </span>
          </h2>

          <p
            className="text-xs sm:text-sm font-light text-[#A8988B] max-w-sm mt-4 md:mt-0 leading-relaxed"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Wählen Sie ein Projekt aus, um es direkt im Notebook zu bedienen.
          </p>
        </motion.div>

        {/* 2. RESPONSIVE VE GENİŞ İNTERAKTİF LAPTOP STAGE İÇERİĞİ */}
        {/* Die Buehne bricht aus der Textbreite aus: sie ist ein Bild und darf
            das ganze Fenster nutzen, begrenzt nur durch die Fensterhoehe. */}
        <div className="mt-10 flex w-[92vw] max-w-[1700px] -translate-x-1/2 justify-center left-1/2 relative">
          <div
            className="relative w-full"
            style={
              aligning
                ? {
                    transform: `scale(${zoom})`,
                    transformOrigin: `${(corners[0][0] + corners[2][0]) * 50}% ${(corners[0][1] + corners[2][1]) * 50}%`,
                  }
                : undefined
            }
          >
            <img
              ref={plateRef}
              src="/ipad-buehne.png"
              alt=""
              onLoad={() => window.dispatchEvent(new Event('resize'))}
              className="block w-full h-auto"
            />

            <div className="absolute inset-0" style={{ containerType: 'size' }}>
              {/* Lamba Işığı ve Fısıltısı */}
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
                  filter: 'blur(38px)',
                  willChange: 'opacity',
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
                  filter: 'blur(16px)',
                  opacity: 'calc(0.45 + var(--lamp-intensity, 1) * 0.55)',
                }}
              />

              {/* Falter Moths */}
              <LampMoths centerX={bulb.x} centerY={bulb.y} bulbSize={bulb.size} active={onScreen && bulb.size > 1} />

              {/* Laptop Screen Area */}
              <div
                className="absolute left-0 top-0 overflow-hidden"
                style={{
                  width: `${PANEL.width}px`,
                  height: `${PANEL.height}px`,
                  transformOrigin: '0 0',
                  transform,
                  background: '#080706',
                  borderRadius: '24px',
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
                              className={`absolute left-0 top-0 z-10 origin-top-left border-0 transition-opacity duration-500 ${
                                live ? '' : 'pointer-events-none'
                              }`}
                              style={{
                                width: '250%',
                                height: '250%',
                                transform: 'scale(0.4)',
                                opacity: loaded ? 1 : 0,
                              }}
                            />
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

                  {!live && (
                    <button
                      type="button"
                      onClick={() => setLive(true)}
                      aria-label="Projekt im Bildschirm bedienen"
                      className="group absolute inset-0 z-20 flex items-end justify-end p-[2cqw] outline-none focus:outline-none"
                    >
                      <span className="rounded-full border border-[#C99E5D]/60 bg-black/70 px-[1.2cqw] py-[0.5cqh] text-[0.7cqw] font-semibold uppercase tracking-[0.28em] text-[#EAD8C7] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                        Zum Bedienen klicken
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Side Project Info Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={project.number}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-[1.5cqw] top-1/2 flex w-[23cqw] -translate-y-1/2 flex-col gap-3 border border-[#8C6D4F]/45 bg-[#0A0908]/85 px-[1.8cqw] py-[2.4cqh] backdrop-blur-md"
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

              {/* Right Side Dots Navigation */}
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

              {/* Bottom Left Navigation Arrows */}
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

              {/* Bottom Center Progress Bar */}
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

              {/* Active Control Mode Indicator */}
              {live && (
                <span className="pointer-events-none absolute left-1/2 top-[3cqh] z-40 -translate-x-1/2 rounded-full border border-[#C99E5D]/50 bg-black/75 px-[1.4cqw] py-[0.6cqh] text-[0.7cqw] font-semibold uppercase tracking-[0.3em] text-[#EAD8C7]">
                  Bedienung aktiv · Esc beendet
                </span>
              )}

              {/* Water Glass Loading Indicator */}
              <div
                className="pointer-events-none absolute z-30 transition-opacity duration-700"
                style={{
                  left: '2%',
                  top: '58%',
                  width: '6.4cqw',
                  height: '21cqh',
                  opacity: loaded ? 0 : 1,
                }}
              >
                <div
                  className="relative h-full w-full overflow-hidden"
                  style={{
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

                <span
                  className="absolute inset-x-[-30%] bottom-[-12%] h-[22%] rounded-[50%]"
                  style={{
                    background:
                      'radial-gradient(closest-side, rgba(234,179,8,0.35), transparent 70%)',
                    filter: 'blur(3px)',
                  }}
                />
              </div>

              {/* Aligning Corner Grips */}
              {aligning && (
                <>
                  {corners.map((corner, which) => {
                    const away = 0;
                    const shiftX = 0;
                    const shiftY = 0;

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
        </div>
      </div>
    </section>
  );
};

export default ProjectsStage;
