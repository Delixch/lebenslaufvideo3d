import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'ÜBER MICH', href: '#about', id: 'about' },
  { name: 'PROJEKTE', href: '#work', id: 'work' },
  { name: 'SKILLS', href: '#skills', id: 'skills' },
  { name: 'ERFAHRUNG', href: '#experience', id: 'experience' },
  { name: 'KONTAKT', href: '#contact', id: 'contact' },
];

const HEADER_OFFSET = 80;
const SETTLE_TRIES = 10;
const SETTLE_STEP_MS = 150;
const DRIFT_TOLERANCE = 8;

/**
 * Sprung zu einem Abschnitt, der nachkorrigiert.
 *
 * Beim allerersten Aufruf steht das Layout noch nicht: iOS klappt die
 * Adressleiste ein, Schriften und Bilder setzen sich, das Overlay blendet aus.
 * Ein einmaliger Sprung landet dann zu hoch — beim zweiten Tippen stimmt es,
 * weil inzwischen alles steht. Darum wird nach dem Sprung noch etwa anderthalb
 * Sekunden lang gemessen und bei Abweichung nachgezogen.
 */
const scrollToSection = (id: string): void => {
  const jump = () => {
    const element = document.getElementById(id);
    if (!element) {
      return 0;
    }

    const drift = element.getBoundingClientRect().top - HEADER_OFFSET;
    if (Math.abs(drift) > DRIFT_TOLERANCE) {
      window.scrollTo({ top: window.scrollY + drift, behavior: 'auto' });
    }

    return drift;
  };

  let tries = 0;
  const settle = () => {
    jump();
    tries += 1;
    if (tries < SETTLE_TRIES) {
      window.setTimeout(settle, SETTLE_STEP_MS);
    }
  };

  // Erst wenn das Overlay wirklich verschwunden ist, hat Messen einen Sinn.
  window.setTimeout(settle, 320);
};

interface HeaderProps {
  setIsHovered: (hovered: boolean) => void;
}

/**
 * Kopfzeile mit Sprungmarken. Der aktive Abschnitt wird beobachtet, damit
 * Navigation und Menü zeigen, wo man gerade steht — auf dem Handy als
 * Vollbild-Overlay, das aus dem Hamburger-Knopf aufgeblendet wird.
 */
export const Header: React.FC<HeaderProps> = ({ setIsHovered }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(1, window.scrollY / height) : 0);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Aktiver Abschnitt: der oberste, der die Bildschirmmitte kreuzt.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );

    navItems.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Solange das Menü offen ist, soll die Seite dahinter nicht mitscrollen.
  // Mobilde Safari kaydırma kilitlenme hatasını engellemek için geçici olarak devre dışı bırakıldı.
  /*
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);
  */

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full flex items-center justify-between px-6 md:px-16 py-5 md:py-6 pointer-events-auto z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0A0806]/95 backdrop-blur-md border-b border-[#8C6D4F]/15'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <a
          href="#"
          onClick={() => setMenuOpen(false)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="text-xs sm:text-sm font-semibold tracking-[0.35em] uppercase text-[#EAD8C7] hover:opacity-75 transition-opacity"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          ADNAN.
        </a>

        {/* Desktop-Navigation mit aktivem Zustand */}
        <nav
          className="hidden md:flex items-center space-x-8 lg:space-x-10 text-[11px] tracking-[0.28em] font-light uppercase absolute left-1/2 -translate-x-1/2"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {navItems.map((item) => {
            const active = activeId === item.id;
            return (
              <a
                key={item.name}
                href={item.href}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative group py-1 transition-colors duration-300 ${
                  active ? 'text-[#F7E7C4]' : 'text-[#C4B5A5] hover:text-[#FFF5EB]'
                }`}
              >
                {item.name}
                <span
                  className={`absolute -bottom-0.5 left-0 h-[1px] bg-gradient-to-r from-[#D4AF37] to-[#F7E7C4] transition-all duration-500 ${
                    active ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
                {active && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute -left-3 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.9)]"
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center space-x-4 ml-auto md:ml-0">
          <a
            href="#contact"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group hidden sm:flex items-center space-x-2 text-[11px] tracking-[0.24em] font-light uppercase py-2 px-4 border border-[#8C6D4F]/50 hover:border-[#D4AF37] text-[#EAD8C7] transition-all duration-300 relative overflow-hidden"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <span>REDEN WIR</span>
            <span className="text-xs transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#8C6D4F] via-[#D4AF37] to-[#F7E7C4] transition-all duration-500 group-hover:w-full" />
          </a>

          {/* Hamburger: Linien werden zum Kreuz, ein Ring pulst beim Öffnen */}
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="relative z-[60] flex md:hidden h-11 w-11 flex-col items-center justify-center rounded-full border border-[#8C6D4F]/40 bg-[#120F0C]/70 transition-colors active:border-[#D4AF37]"
            aria-label={menuOpen ? 'Menü schliessen' : 'Menü öffnen'}
            aria-expanded={menuOpen}
          >
            <motion.span
              animate={
                menuOpen
                  ? { opacity: 1, scale: 1.18, borderColor: 'rgba(212,175,55,0.65)' }
                  : { opacity: 0, scale: 0.8, borderColor: 'rgba(212,175,55,0)' }
              }
              transition={{ duration: 0.4 }}
              className="absolute inset-0 rounded-full border"
            />
            <div className="relative flex h-4 w-5 flex-col justify-between">
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 7.25 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="block h-[1.5px] w-5 origin-center bg-[#EAD8C7]"
              />
              <motion.span
                animate={menuOpen ? { opacity: 0, x: 12 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="block h-[1.5px] w-5 origin-center bg-[#EAD8C7]"
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -7.25 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="block h-[1.5px] w-5 origin-center bg-[#EAD8C7]"
              />
            </div>
          </button>
        </div>

        {/* Lesefortschritt als feine Goldlinie */}
        <span
          className="absolute bottom-0 left-0 h-[1.5px] bg-gradient-to-r from-[#8C6D4F] via-[#D4AF37] to-[#F7E7C4] md:hidden"
          style={{ width: `${progress * 100}%` }}
        />
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: 'circle(0% at calc(100% - 2.6rem) 2.6rem)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 2.6rem) 2.6rem)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 2.6rem) 2.6rem)' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[55] flex flex-col justify-center px-8 md:hidden"
            style={{
              background:
                'radial-gradient(120% 80% at 85% 8%, rgba(212,175,55,0.10) 0%, transparent 60%), #060504',
            }}
          >
            <nav className="flex flex-col gap-1">
              {/* Home Link (Startseite) for Mobile with Gold Home Icon */}
              <motion.a
                key="home-mobile"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                  setMenuOpen(false);
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  });
                }}
                initial={{ opacity: 0, x: -28, filter: 'blur(6px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{
                  delay: 0.12,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative flex items-baseline gap-4 py-3"
              >
                <span className="font-mono text-[10px] tracking-[0.3em] text-[#8C6D4F]">
                  00
                </span>
                <span
                  className="text-4xl uppercase leading-none tracking-tight text-[#C4B5A5] group-active:text-[#FFF5EB] flex items-center gap-3"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  STARTSEITE
                  <svg
                    className="w-6 h-6 text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </span>
                <span className="absolute bottom-1 left-0 h-[1px] w-0 bg-gradient-to-r from-[#D4AF37]/70 to-transparent transition-all duration-500 group-active:w-full" />
              </motion.a>

              {navItems.map((item, index) => {
                const active = activeId === item.id;
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    onClick={(event) => {
                      event.preventDefault();
                      setMenuOpen(false);
                      if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                      }
                      scrollToSection(item.id);
                    }}
                    initial={{ opacity: 0, x: -28, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    transition={{
                      delay: 0.18 + index * 0.07,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group relative flex items-baseline gap-4 py-3"
                  >
                    <span
                      className={`font-mono text-[10px] tracking-[0.3em] transition-colors duration-300 ${
                        active ? 'text-[#F7E7C4]' : 'text-[#8C6D4F]'
                      }`}
                    >
                      0{index + 1}
                    </span>
                    <span
                      className={`text-4xl uppercase leading-none tracking-tight transition-colors duration-300 ${
                        active
                          ? 'bg-gradient-to-b from-[#F7E7C4] via-[#C99E5D] to-[#7A5A28] bg-clip-text text-transparent'
                          : 'text-[#C4B5A5] group-active:text-[#FFF5EB]'
                      }`}
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      {item.name}
                    </span>
                    {active && (
                      <motion.span
                        layoutId="menu-marker"
                        className="absolute -left-4 top-1/2 h-8 w-[2px] -translate-y-1/2 bg-gradient-to-b from-[#D4AF37] to-transparent shadow-[0_0_12px_rgba(212,175,55,0.8)]"
                      />
                    )}
                    <span className="absolute bottom-1 left-0 h-[1px] w-0 bg-gradient-to-r from-[#D4AF37]/70 to-transparent transition-all duration-500 group-active:w-full" />
                  </motion.a>
                );
              })}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + navItems.length * 0.07, duration: 0.5 }}
              className="mt-12 border-t border-[#8C6D4F]/25 pt-6"
            >
              <a
                href="mailto:adnan.aydin@bluewin.ch"
                onClick={() => setMenuOpen(false)}
                className="block text-sm tracking-[0.2em] text-[#EAD8C7]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                adnan.aydin@bluewin.ch
              </a>
              <p
                className="mt-2 text-[10px] uppercase tracking-[0.3em] text-[#8C6D4F]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Zürich · Schweiz
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
