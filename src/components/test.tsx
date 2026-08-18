import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ScrollStack, { ScrollStackItem } from './ScrollStack';

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
      'Mein eigener Auftritt: eine einzige Three.js-Szene tr\u00e4gt Partikeltypografie, eine Sternbild-Navigation durch die Projekte, GLSL-Shader und scroll-getriebene Kamerafahrten. Geometrie entsteht im Web Worker, damit die Seite auch auf dem Handy fl\u00fcssig bleibt.',
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
    category: 'K\u00dcNSTLICHE INTELLIGENZ / WISSENSPLATTFORM',
    description:
      'Lern- und Lehrplattform rund um k\u00fcnstliche Intelligenz: Prompts, Serverbefehle und experimentelle Arbeiten sind gesammelt und nachvollziehbar aufbereitet. Bewusst als Werkstatt gebaut \u2014 ausprobieren, festhalten, weitergeben.',
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
      'Webauftritt einer Schweizer B\u00e4ckerei: Sortiment, Filialen und \u00d6ffnungszeiten in einem schnellen, mobil zuerst gedachten Auftritt. Live im Einsatz und t\u00e4glich von Kundschaft benutzt.',
    githubUrl: 'https://superonline.ch',
    tech: ['React', 'TypeScript', 'Material UI', 'Responsive Web Design'],
    metrics: [
      { label: 'KUNDE', value: 'B\u00e4ckerei Happy AG' },
      { label: 'FOKUS', value: 'Mobil zuerst' },
      { label: 'STATUS', value: 'Live' },
    ],
  },
  {
    number: '04',
    title: 'SAZCAR GmbH',
    category: 'AUTOWERKSTATT / FIRMENAUFTRITT',
    description:
      'Homepage einer Z\u00fcrcher Autowerkstatt: Dienstleistungen, Standort und Kontakt auf einen Blick. Schlank gebaut, damit die Seite auch auf dem Handy in Sekunden steht.',
    githubUrl: 'https://sazcar.ch',
    tech: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
    metrics: [
      { label: 'KUNDE', value: 'SAZCAR GmbH, Z\u00fcrich' },
      { label: 'UMFANG', value: 'Auftritt & Kontakt' },
      { label: 'STATUS', value: 'Live' },
    ],
  },
  {
    number: '05',
    title: 'Eren Aydin \u2014 Bewerbungsportfolio',
    category: 'PERS\u00d6NLICHES PORTFOLIO / LEHRSTELLE',
    description:
      'Interaktives Bewerbungsportfolio f\u00fcr meinen Sohn zum Lehrbeginn 2026. Scroll-getriebene Animationen f\u00fchren durch Person, Schulweg und Projekte \u2014 mobil zuerst gedacht, damit es auch auf \u00e4lteren Ger\u00e4ten schnell l\u00e4dt.',
    githubUrl: 'https://erenaydin.ch',
    tech: ['TypeScript', 'GSAP', 'ScrollTrigger', 'SCSS', 'Vite', 'Motion Design'],
    metrics: [
      { label: 'ANLASS', value: 'Lehrbeginn 2026' },
      { label: 'AUFBAU', value: 'Scroll-Erz\u00e4hlung' },
      { label: 'STATUS', value: 'Live' },
    ],
  },
  {
    number: '06',
    title: 'Portfolie EAydin',
    category: 'PERS\u00d6NLICHES PORTFOLIO',
    description:
      'Meine erste Arbeit nach vielen Jahren zur\u00fcck im Web: ein eigenes Portfolio, gebaut, um wieder in die aktuelle Front-End-Welt hineinzukommen. Aufbau, Layout und Animationen sind von Hand gesetzt, ohne Baukasten.',
    githubUrl: 'https://erenworks.vercel.app/',
    tech: ['HTML', 'CSS', 'SCSS', 'JavaScript', 'Responsive Design', 'Motion Design'],
    metrics: [
      { label: 'JAHR', value: '2025' },
      { label: 'ANLASS', value: 'R\u00fcckkehr ins Web' },
      { label: 'AUFBAU', value: 'Alles von Hand' },
    ],
  },
  {
    number: '07',
    title: 'iPhone Shortcuts',
    category: 'CREATIVE WEB DEVELOPMENT',
    description:
      'Eine 2025 entstandene Webseite, inspiriert von den iPhone-Kurzbefehlen. Interaktive Karten in einem klaren, modernen Layout \u2014 das Projekt stiess bei vielen Leuten auf Interesse.',
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
    category: 'BILDUNG / KI-GEST\u00dcTZTES LERNEN',
    description:
      'Webseite f\u00fcr Sekundar- und Primarsch\u00fcler zum Vokabeltraining: Sch\u00fcler fotografieren eine Seite aus ihrem Lehrbuch, und mithilfe von KI entstehen daraus Lernkarten. Das Projekt wurde nie ganz fertiggestellt.',
    githubUrl: 'https://vokabel-hazel.vercel.app/',
    tech: ['React', 'Tailwind CSS', 'JavaScript', 'AI Integration', 'Responsive Design'],
    metrics: [
      { label: 'JAHR', value: '2024' },
      { label: 'F\u00dcR', value: 'Schulkinder' },
      { label: 'STATUS', value: 'Unvollendet' },
    ],
  },
  {
    number: '09',
    title: 'Portfolie',
    category: 'PERS\u00d6NLICHES PORTFOLIO',
    description:
      'Eines vanished metMentor',
    githubUrl: 'https://lebenslauf-xi.vercel.app/',
    tech: ['React', 'Tailwind CSS', 'JavaScript', 'HTML', 'CSS'],
    metrics: [
      { label: 'JAHR', value: '2024' },
      { label: 'ROLLE', value: 'Erste Schritte' },
      { label: 'HILFE', value: 'Mit Mentor gebaut' },
    ],
  },
];

const MobileProjectsStaticList: React.FC<{ projects: Project[] }> = ({ projects }) => {
  return (
    <div className="flex flex-col space-y-6 md:hidden">
      {projects.map((project) => (
        <div
          key={project.title}
          className="border rounded-xl bg-[#0E0C0A] p-6 overflow-hidden border-[#8C6D4F]/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2 text-[10px] font-mono tracking-[0.2em]">
              <span className="text-[#D4AF37] font-bold">{project.number} //</span>
              <span className="text-[#A8988B] uppercase">{project.category}</span>
            </div>
            
            <h3
              className="text-2xl sm:text-3xl tracking-tight text-white uppercase font-normal leading-[1.1]"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {project.title}
            </h3>

            <p
              className="text-xs sm:text-sm font-light text-[#BDB0A4] leading-relaxed"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
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

            <div className="space-y-2 pt-2">
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
              className="flex items-center justify-center space-x-2 w-full py-3 border border-[#8C6D4F] bg-[#16120E] hover:border-[#D4AF37] hover:bg-[#D4AF37] text-[#EAD8C7] hover:text-black text-[10px] font-medium tracking-[0.24em] uppercase transition-all duration-300 mt-2 cursor-pointer"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <span>SEITE ANSEHEN</span>
              <span className="text-xs">↗</span>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ProjectsSection: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    setIsMobile(query.matches);
    const update = () => setIsMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return (
    <section
      id="work"
      className="relative w-full bg-black text-[#E8DFD8] font-sans selection:bg-[#cbb59d] selection:text-black pt-20 pb-32 px-6 sm:px-12 lg:px-20 scroll-mt-20 md:scroll-mt-0"
    >
      <div className="absolute top-1/4 left-1/3 w-[36rem] h-[36rem] bg-[#D4AF37]/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#8C6D4F]/5 rounded-full blur-[170px] pointer-events-none" />

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
            Jedes Projekt ist echte Arbeit für echte Menschen — keine Übungsaufgabe.
          </p>
        </motion.div>

        {isMobile ? (
          <MobileProjectsStaticList projects={projects} />
        ) : (
          <ScrollStack
            itemDistance={20}
            itemScale={0.035}
            itemStackDistance={28}
            stackPosition="15%"
            scaleEndPosition="6%"
            baseScale={0.88}
            useWindowScroll={true}
          >
            {projects.map((project) => (
              <ScrollStackItem key={project.title}>
                <div className="relative w-full rounded-2xl border border-[#8C6D4F]/50 bg-[#0E0C0A] p-8 sm:p-12 shadow-[0_25px_70px_rgba(0,0,0,0.98)] group overflow-hidden transition-colors duration-500 hover:border-[#D4AF37]">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/80 to-transparent" />

                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]/60 group-hover:border-[#D4AF37] transition-colors" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]/60 group-hover:border-[#D4AF37] transition-colors" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]/60 group-hover:border-[#D4AF37] transition-colors" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]/60 group-hover:border-[#D4AF37] transition-colors" />

                  <span
                    className="absolute -bottom-6 -right-3 text-8xl sm:text-9xl font-bold text-[#EAD8C7]/5 select-none pointer-events-none leading-none"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {project.number}
                  </span>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
                    <div className="lg:col-span-7 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-4">
                          <span className="text-xs font-mono font-bold text-[#D4AF37]">
                            {project.number} //
                          </span>
                          <span className="text-[10.5px] font-mono tracking-[0.25em] uppercase text-[#A8988B]">
                            {project.category}
                          </span>
                        </div>

                        <h3
                          className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white mb-4 group-hover:text-[#F7E7C4] transition-colors uppercase leading-[0.9]"
                          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                          {project.title}
                        </h3>

                        <p
                          className="text-xs sm:text-sm md:text-[14px] font-light text-[#BDB0A4] leading-[1.85] tracking-wide mb-8 max-w-2xl"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          {project.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-6 border-t border-[#8C6D4F]/25">
                        {project.tech.map((t) => (
                          <span
                            key={t}
                            className="px-3 py-1 text-[10px] font-medium tracking-[0.16em] uppercase rounded-sm border border-[#8C6D4F]/40 bg-[#16120E] text-[#E8D7C5] group-hover:border-[#D4AF37]/50 transition-all duration-300"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6 lg:pl-6 lg:border-l lg:border-[#8C6D4F]/25">
                      <div className="space-y-3">
                        <span className="text-[9.5px] font-mono tracking-[0.25em] uppercase text-[#8C6D4F] block mb-2">
                          // ARCHITECTURE METRICS
                        </span>
                        {project.metrics.map((m) => (
                          <div
                            key={m.label}
                            className="p-3.5 rounded-sm border border-[#8C6D4F]/25 bg-[#050403] flex items-center justify-between"
                          >
                            <span className="text-[10px] font-mono text-[#A8988B]">
                              {m.label}
                            </span>
                            <span className="text-[11px] font-mono font-medium text-[#F7E7C4]">
                              {m.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center space-x-3 px-6 py-3.5 border border-[#8C6D4F] bg-[#16120E] hover:border-[#D4AF37] hover:bg-[#D4AF37] text-[#EAD8C7] hover:text-black text-[11px] font-medium tracking-[0.24em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        <span>SEITE ANSEHEN</span>
                        <span className="text-xs">↗</span>
                      </a>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
