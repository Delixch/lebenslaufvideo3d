import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { navItems, scrollToSection } from '../lib/nav';
import { ArrowMark } from './LampMenu';

// Solange das Laternenmenue erprobt wird, bleibt der Hamburger aus.
const SHOW_HAMBURGER = false;

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

  // Close mobile header bubble menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-header-menu-container')) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('pointerdown', onPointer);
    return () => window.removeEventListener('pointerdown', onPointer);
  }, [menuOpen]);

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
          className="hidden md:flex items-center space-x-8 lg:space-x-10 text-[11px] tracking-[0.28em] font-medium uppercase absolute left-1/2 -translate-x-1/2"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {/* Home Link with Blinking Icon */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative group py-1 flex items-center justify-center text-[#C8B8A6] hover:text-[#FFF5EB] mr-6"
            title="Startseite"
          >
            <svg
              className="w-4.5 h-4.5 text-[#D4AF37] animate-pulse drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </a>

          {navItems.map((item) => {
            const active = activeId === item.id;
            return (
              <a
                key={item.name}
                href={item.href}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative group py-1 transition-colors duration-300 ${
                  active ? 'text-[#F7E7C4]' : 'text-[#C8B8A6] hover:text-[#FFF5EB]'
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

          {/* Mobile Scroll-Glow Menu Trigger (Only visible on mobile when scrolled down) */}
          <div className="relative md:hidden flex items-center mobile-header-menu-container">
            {isScrolled && (
              <>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="relative z-50 flex h-10 w-10 items-center justify-center pointer-events-auto"
                >
                  {!menuOpen && (
                    <>
                      <span className="absolute inset-0 bg-[#D4AF37]/35 rounded-full animate-ping pointer-events-none" />
                      <span className="absolute inset-[-4px] bg-[#D4AF37]/45 rounded-full animate-pulse blur-[4px] pointer-events-none" />
                    </>
                  )}
                  <ArrowMark
                    direction={menuOpen ? 'in' : 'out'}
                    tone={menuOpen ? 'rgba(18,8,2,1)' : 'rgba(255,195,50,1)'}
                    core={menuOpen ? 'rgba(0,0,0,1)' : 'rgba(255,245,210,1)'}
                  />
                </button>
                
                <AnimatePresence>
                  {menuOpen && (
                    <motion.nav
                      initial={{ opacity: 0, scale: 0.4, x: 20, y: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                      exit={{ opacity: 0, scale: 0.35, x: 24, y: -22 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="pointer-events-auto absolute right-0 top-12 w-[56vw] max-w-[232px] pb-14 pl-5 pr-14 pt-8 shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
                      style={{
                        transformOrigin: 'top right',
                        background:
                          'radial-gradient(130% 120% at 76% 20%, rgba(255,224,164,0.98) 0%, rgba(248,199,122,0.96) 26%, rgba(226,166,92,0.92) 50%, rgba(196,134,68,0.88) 72%, rgba(158,102,50,0.84) 88%, rgba(120,76,36,0.8) 100%)',
                        backdropFilter: 'blur(14px) saturate(120%)',
                        WebkitBackdropFilter: 'blur(14px) saturate(120%)',
                        border: '1px solid rgba(255,214,150,0.5)',
                        borderRadius: '58% 42% 34% 66% / 46% 62% 38% 54%',
                      }}
                    >
                      {/* Zipfel zur Ecke hin */}
                      <span
                        aria-hidden="true"
                        className="absolute right-3 -top-[7px] h-3.5 w-3.5 rotate-45"
                        style={{
                          background: 'rgba(255,224,164,0.98)',
                          borderLeft: '1px solid rgba(255,214,150,0.5)',
                          borderTop: '1px solid rgba(255,214,150,0.5)',
                        }}
                      />
                      
                      <motion.ul
                        className="flex origin-center flex-col gap-3"
                        exit={{ opacity: 0, scale: 0.62 }}
                        transition={{ duration: 0.16 }}
                      >
                        {navItems.map((item, index) => {
                          const active = activeId === item.id;
                          return (
                            <motion.li
                              key={item.id}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.06 + index * 0.045, duration: 0.25 }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuOpen(false);
                                  scrollToSection(item.id);
                                }}
                                className={`relative w-full text-right pr-5 text-[19px] uppercase tracking-[0.12em] transition-all duration-300 ${
                                  active 
                                    ? 'text-[#120A04] font-medium' 
                                    : 'text-[#3A2412]/80 font-normal hover:text-[#3A2412]'
                                }`}
                                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                              >
                                {item.name}
                                {active && (
                                  <motion.span
                                    layoutId="mobile-header-dot"
                                    className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#8C6D4F] shadow-[0_0_6px_rgba(140,109,79,0.9)]"
                                  />
                                )}
                              </button>
                            </motion.li>
                          );
                        })}
                      </motion.ul>
                    </motion.nav>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>

        {/* Lesefortschritt als feine Goldlinie */}
        <span
          className="absolute bottom-0 left-0 h-[1.5px] bg-gradient-to-r from-[#8C6D4F] via-[#D4AF37] to-[#F7E7C4] md:hidden"
          style={{ width: `${progress * 100}%` }}
        />
      </header>
    </>
  );
};
