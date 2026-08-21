import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Project {
  number: string;
  title: string;
  category: string;
  description: string;
  githubUrl: string;
  tech: string[];
  metrics: { label: string; value: string }[];
}

const projects: Project[] = [
  {
    number: '01',
    title: 'Adnan Aydin \u2014 3D Portfolio',
    category: 'ECHTZEIT-3D / WEB-ERLEBNIS',
    description:
      'Mein eigener Auftritt: eine einzige Three.js-Szene trägt Partikeltypografie, eine Sternbild-Navigation durch die Projekte, GLSL-Shader und scroll-getriebene Kamerafahrten. Geometrie entsteht im Web Worker, damit die Seite auch auf dem Handy flüssig bleibt.',
    githubUrl: 'https://adnanlebenslauf.vercel.app/',
    tech: [
      'TypeScript',
      'Three.js',
      'WebGL',
      'GLSL',
      'GSAP',
      'ScrollTrigger',
      'Web Workers',
      'Vite',
      'SCSS',
    ],
    metrics: [
      { label: 'SZENE', value: 'Ein einziges Canvas' },
      { label: 'PHYSIK', value: 'Verlet-Seil in Echtzeit' },
      { label: 'AUFBAU', value: 'Entity Component System' },
    ],
  },
  {
    number: '02',
    title: 'ADNAN 3D',
    category: 'KÜNSTLICHE INTELLIGENZ / WISSENSPLATTFORM',
    description:
      'Lern- und Lehrplattform rund um künstliche Intelligenz: Prompts, Serverbefehle und experimentelle Arbeiten sind gesammelt und nachvollziehbar aufbereitet. Bewusst als Werkstatt gebaut — ausprobieren, festhalten, weitergeben.',
    githubUrl: 'https://adnanwalk.vercel.app/',
    tech: [
      'TypeScript',
      'Supabase',
      'Prompt Engineering',
      'Server Administration',
      'Vite',
      'Responsive Design',
    ],
    metrics: [
      { label: 'INHALT', value: 'Prompts & Befehle' },
      { label: 'DATEN', value: 'Supabase' },
      { label: 'ZWECK', value: 'Lernen & Lehren' },
    ],
  },
  {
    number: '03',
    title: 'Happy Beck',
    category: 'GASTRONOMIE / FIRMENAUFTRITT',
    description:
      'Webauftritt einer Schweizer Bäckerei: Sortiment, Filialen und Öffnungszeiten in einem schnellen, mobil zuerst gedachten Auftritt. Live im Einsatz und täglich von Kundschaft benutzt.',
    githubUrl: 'https://superonline.ch',
    tech: ['React', 'TypeScript', 'Material UI', 'Responsive Web Design'],
    metrics: [
      { label: 'KUNDE', value: 'Bäckerei Happy AG' },
      { label: 'FOKUS', value: 'Mobil zuerst' },
      { label: 'STATUS', value: 'Live' },
    ],
  },
  {
    number: '04',
    title: 'SAZCAR GmbH',
    category: 'AUTOWERKSTATT / FIRMENAUFTRITT',
    description:
      'Homepage einer Zürcher Autowerkstatt: Dienstleistungen, Standort und Kontakt auf einen glance. Schlank gebaut, damit die Seite auch auf dem Handy in Sekunden steht.',
    githubUrl: 'https://sazcar.ch',
    tech: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
    metrics: [
      { label: 'KUNDE', value: 'SAZCAR GmbH, Zürich' },
      { label: 'UMFANG', value: 'Auftritt & Kontakt' },
      { label: 'STATUS', value: 'Live' },
    ],
  },
  {
    number: '05',
    title: 'Eren Aydin \u2014 Bewerbungsportfolio',
    category: 'PERSÖNLICHES PORTFOLIO / LEHRSTELLE',
    description:
      'Interaktives Bewerbungsportfolio für meinen Sohn zum Lehrbeginn 2026. Scroll-getriebene Animationen führen durch Person, Schulweg und Projekte — mobil zuerst gedacht, damit es auch auf älteren Geräten schnell lädt.',
    githubUrl: 'https://erenaydin.ch',
    tech: ['TypeScript', 'GSAP', 'ScrollTrigger', 'SCSS', 'Vite', 'Motion Design'],
    metrics: [
      { label: 'ANLASS', value: 'Lehrbeginn 2026' },
      { label: 'AUFBAU', value: 'Scroll-Erzählung' },
      { label: 'STATUS', value: 'Live' },
    ],
  },
  {
    number: '06',
    title: 'Portfolie EAydin',
    category: 'PERSÖNLICHES PORTFOLIO',
    description:
      'Meine erste Arbeit nach vielen Jahren zurück im Web: ein eigenes Portfolio, gebaut, um wieder in die aktuelle Front-End-Welt hineinzukommen. Aufbau, Layout und Animationen sind von Hand gesetzt, ohne Baukasten.',
    githubUrl: 'https://erenworks.vercel.app/',
    tech: ['HTML', 'CSS', 'SCSS', 'JavaScript', 'Responsive Design', 'Motion Design'],
    metrics: [
      { label: 'JAHR', value: '2025' },
      { label: 'ANLASS', value: 'Rückkehr ins Web' },
      { label: 'AUFBAU', value: 'Alles von Hand' },
    ],
  },
  {
    number: '07',
    title: 'iPhone Shortcuts',
    category: 'CREATIVE WEB DEVELOPMENT',
    description:
      'Eine 2025 entstandene Webseite, inspiriert von den iPhone-Kurzbefehlen. Interaktive Karten in einem klaren, modernen Layout — das Projekt stiess bei vielen Leuten auf Interesse.',
    githubUrl: 'https://superonline.vercel.app/',
    tech: ['React', 'Tailwind CSS', 'JavaScript', 'HTML', 'CSS', 'Responsive Design'],
    metrics: [
      { label: 'JAHR', value: '2025' },
      { label: 'IDEE', value: 'iPhone-Kurzbefehle' },
      { label: 'KERN', value: 'Interaktive Karten' },
    ],
  },
  {
    number: '08',
    title: 'Vokabeltrainer',
    category: 'BILDUNG / KI-GESTÜTZTES LERNEN',
    description:
      'Webseite für Sekundar- und Primarschüler zum Vokabeltraining: Schüler fotografieren eine Seite aus ihrem Lehrbuch, und mithilfe von KI entstehen daraus Lernkarten. Das Projekt wurde nie ganz fertiggestellt.',
    githubUrl: 'https://vokabel-hazel.vercel.app/',
    tech: ['React', 'Tailwind CSS', 'JavaScript', 'AI Integration', 'Responsive Design'],
    metrics: [
      { label: 'JAHR', value: '2024' },
      { label: 'FÜR', value: 'Schulkinder' },
      { label: 'STATUS', value: 'Unvollendet' },
    ],
  },
  {
    number: '09',
    title: 'Portfolie',
    category: 'PERSÖNLICHES PORTFOLIO',
    description:
      'Eines meiner ersten Projekte, entstanden 2024. Damals hatte ich noch wenig Erfahrung und bin mit der Unterstützung eines türkischen Entwicklers vorangekommen — der Anfang von allem, was danach kam.',
    githubUrl: 'https://lebenslauf-xi.vercel.app/',
    tech: ['React', 'Tailwind CSS', 'JavaScript', 'HTML', 'CSS'],
    metrics: [
      { label: 'JAHR', value: '2024' },
      { label: 'ROLLE', value: 'Erste Schritte' },
      { label: 'HILFE', value: 'Mit Mentor gebaut' },
    ],
  },
];

export const MobileProjectsSection: React.FC = () => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && !window.matchMedia('(min-width: 1200px)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1200px)');
    const update = () => setIsMobile(!query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null); // Hepsi kapalı gelsin

  if (!isMobile) return null;

  return (
    <section
      className="relative z-10 w-full bg-black text-[#E8DFD8] font-sans selection:bg-[#cbb59d] selection:text-black pt-8 pb-24 fluid-gutter block min-[1200px]:hidden"
    >
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center space-x-4 mb-5"
        >
          <span
            className="fluid-eyebrow font-medium tracking-[0.35em] uppercase text-[#D4AF37]"
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
          className="flex flex-col mb-12"
        >
          <h2
            className="fluid-display fluid-display-liste tracking-tight uppercase leading-[1.0] select-none mb-4"
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
            className="fluid-body font-normal text-[#EAD8C7] leading-relaxed"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Jedes Projekt ist echte Arbeit für echte Menschen — keine Übungsaufgabe.
          </p>
        </motion.div>

        <div className="flex flex-col space-y-4">
          {projects.map((project, idx) => {
            const isOpen = expandedIndex === idx;
            return (
              <div
                id={`mobile-project-${idx}`}
                key={project.title}
                className="border rounded-xl bg-[#0E0C0A] overflow-hidden transition-all duration-500 scroll-mt-20"
                style={{
                  borderColor: isOpen ? '#D4AF37' : 'rgba(140, 109, 79, 0.3)',
                  boxShadow: isOpen ? '0 10px 30px rgba(212, 175, 55, 0.04)' : 'none',
                }}
              >
                <button
                  onClick={() => {
                    const nextIndex = isOpen ? null : idx;
                    setExpandedIndex(nextIndex);
                    if (nextIndex !== null) {
                      setTimeout(() => {
                        const element = document.getElementById(`mobile-project-${idx}`);
                        if (element) {
                          const elementRect = element.getBoundingClientRect();
                          const absoluteElementTop = elementRect.top + window.scrollY;
                          const offset = 80; // Sticky header offset
                          window.scrollTo({
                            top: absoluteElementTop - offset,
                            behavior: 'smooth',
                          });
                        }
                      }, 320);
                    }
                  }}
                  className="w-full text-left fluid-pad flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70 focus-visible:ring-inset cursor-pointer"
                >
                  <div className="flex flex-col space-y-1.5 pr-4">
                    <div className="flex items-center space-x-2 text-[10px] font-mono tracking-[0.2em]">
                      <span className="text-[#D4AF37] font-bold">{project.number} //</span>
                      <span className="text-[#A8988B] uppercase">{project.category}</span>
                    </div>
                    <h3
                      className="fluid-title tracking-tight text-white uppercase font-normal leading-[1.1]"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      {project.title}
                    </h3>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full border border-[#8C6D4F]/40 flex items-center justify-center text-xs text-[#EAD8C7] flex-shrink-0 transition-colors"
                    style={{ borderColor: isOpen ? '#D4AF37' : 'rgba(140, 109, 79, 0.3)' }}
                  >
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isOpen ? '−' : '＋'}
                    </motion.span>
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 pt-2 border-t border-[#8C6D4F]/15 flex flex-col space-y-6">
                        <p
                          className="fluid-body font-light text-[#BDB0A4] leading-relaxed"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.tech.map((t) => (
                            <span
                              key={t}
                              className="px-2.5 py-1 text-[9px] font-medium tracking-[0.16em] uppercase rounded-sm border border-[#8C6D4F]/40 bg-[#16120E] text-[#E8D7C5]"
                              style={{ fontFamily: "'Montserrat', sans-serif" }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#8C6D4F] block">
                            // ARCHITECTURE METRICS
                          </span>
                          {project.metrics.map((m) => (
                            <div
                              key={m.label}
                              className="p-3 rounded-sm border border-[#8C6D4F]/25 bg-[#050403] flex items-center justify-between text-[10px]"
                            >
                              <span className="font-mono text-[#A8988B]">{m.label}</span>
                              <span className="font-mono font-medium text-[#F7E7C4]">{m.value}</span>
                            </div>
                          ))}
                        </div>
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-2 w-full py-3 border border-[#8C6D4F] bg-[#16120E] hover:border-[#D4AF37] hover:bg-[#D4AF37] text-[#EAD8C7] hover:text-black text-[10px] font-medium tracking-[0.24em] uppercase transition-all duration-300 cursor-pointer"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          <span>SEITE ANSEHEN</span>
                          <span className="text-xs">↗</span>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
