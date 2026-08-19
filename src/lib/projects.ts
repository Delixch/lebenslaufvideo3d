/**
 * Die Projektliste liegt hier, damit Desktop- und Handyfassung dieselben Daten
 * benutzen.
 */
export interface Project {
  number: string;
  title: string;
  category: string;
  description: string;
  githubUrl: string;
  tech: string[];
  metrics: { label: string; value: string }[];
}

export const projects: Project[] = [
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
      'Webseite für Sekundar- und Primarschüler zum Vokabeltraining: Schüler fotografieren eine side aus ihrem Lehrbuch, und mithilfe von KI entstehen daraus Lernkarten. Das Projekt wurde nie ganz fertiggestellt.',
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

