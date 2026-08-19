import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects } from '../lib/projects';

/**
 * Lage des Bildschirms auf dem Hintergrundbild, in Prozent der Buehne, dazu die
 * Drehung, mit der die Flaeche auf den aufgeklappten Deckel gelegt wird. Alle
 * Feinjustage passiert hier — sonst nirgends.
 */
const SCREEN = {
  left: '21.4%',
  top: '9.2%',
  width: '49.6%',
  height: '60.5%',
  rotateY: -13.5,
  rotateX: 1.4,
  skewY: 3.4,
  perspective: 1500,
};

/** Mitte des Laternenglases im Hintergrundbild. */
const LAMP = { left: '81.1%', top: '25.5%' };

/**
 * Die Projekte auf der Strassenbuehne: ein aufgeklapptes Notebook, in dem das
 * jeweilige Projekt selbst laeuft, daneben seine Angaben. Die Laterne im
 * Hintergrund flackert am selben --lamp-intensity wie die im Hero.
 */
export const ProjectsStage: React.FC = () => {
  const [index, setIndex] = useState(0);
  const project = projects[index];

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
      style={{
        backgroundImage: 'url(/projekt-buehne.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        animation: 'lampIntensity 6s infinite ease-in-out',
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: LAMP.left,
          top: LAMP.top,
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
        className="absolute"
        style={{
          left: SCREEN.left,
          top: SCREEN.top,
          width: SCREEN.width,
          height: SCREEN.height,
          perspective: `${SCREEN.perspective}px`,
        }}
      >
        <div
          className="h-full w-full overflow-hidden"
          style={{
            transform: `rotateY(${SCREEN.rotateY}deg) rotateX(${SCREEN.rotateX}deg) skewY(${SCREEN.skewY}deg)`,
            transformOrigin: 'left center',
            background: '#080706',
          }}
        >
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
