import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'ÜBER MICH', href: '#about' },
  { name: 'PROJEKTE', href: '#work' },
  { name: 'SKILLS', href: '#skills' },
  { name: 'ERFAHRUNG', href: '#experience' },
  { name: 'KONTAKT', href: '#contact' },
];

interface HeaderProps {
  setIsHovered: (hovered: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setIsHovered }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Navigation Bar */}
      <header
        className={`fixed md:absolute top-0 md:top-auto left-0 md:left-auto w-full flex items-center justify-between px-6 md:px-16 py-5 md:py-6 pointer-events-auto z-50 transition-all duration-300 ${
          isScrolled
            ? 'max-md:bg-[#0A0806]/95 max-md:backdrop-blur-md max-md:border-b max-md:border-[#8C6D4F]/15 max-md:shadow-lg max-md:shadow-black/20'
            : 'max-md:bg-transparent max-md:border-b max-md:border-transparent'
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

        {/* Navigation Links (Desktop) */}
        <nav
          className="hidden md:flex items-center space-x-8 lg:space-x-10 text-[11px] tracking-[0.28em] font-light uppercase text-[#C4B5A5] absolute left-1/2 -translate-x-1/2"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative group py-1 transition-colors duration-300 hover:text-[#FFF5EB]"
            >
              {item.name}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4AF37]/50 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right Action (Desktop/Mobile) & Hamburger Button */}
        <div className="flex items-center space-x-4 ml-auto md:ml-0">
          <a
            href="#contact"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group flex items-center space-x-2 text-[11px] tracking-[0.24em] font-light uppercase py-2 px-4 border border-[#8C6D4F]/50 hover:border-[#D4AF37] text-[#EAD8C7] transition-all duration-300 backdrop-blur-sm"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <span>REDEN WIR</span>
            <span className="transform transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-xs">
              ↗
            </span>
          </a>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex md:hidden flex-col justify-center items-center w-10 h-10 rounded-full border border-[#8C6D4F]/30 bg-[#120F0C]/60 hover:border-[#D4AF37]/50 active:border-[#D4AF37] z-50 relative focus:outline-none transition-colors pointer-events-auto cursor-pointer"
            aria-label="Toggle Menu"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="w-5 h-4 flex flex-col justify-between relative">
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 7.25 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-5 h-[1.5px] bg-[#EAD8C7] block origin-center"
              />
              <motion.span
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="w-5 h-[1.5px] bg-[#EAD8C7] block origin-center"
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -7.25 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-5 h-[1.5px] bg-[#EAD8C7] block origin-center"
              />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Slide-Down Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="fixed top-0 left-0 w-full h-[70vh] bg-[#0A0908]/98 backdrop-blur-2xl border-b border-[#D4AF37]/15 shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-40 flex flex-col justify-between px-8 py-10 pt-28 pointer-events-auto"
            style={{
              background: 'radial-gradient(circle at center, rgba(212,175,55,0.05) 0%, transparent 70%), #0A0908',
            }}
          >
            {/* Navigation Links inside Mobile Menu */}
            <div className="flex flex-col items-center space-y-6 my-auto">
              {navItems.map((item, idx) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + idx * 0.06, duration: 0.4, ease: 'easeOut' }}
                  className="group text-lg font-light tracking-[0.25em] text-[#C4B5A5] hover:text-[#D4AF37] transition-colors duration-300 py-1 cursor-pointer"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <span className="text-[#D4AF37] mr-3 text-xs font-mono">0{idx + 1} //</span>
                  <span className="relative">
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
                  </span>
                </motion.a>
              ))}
            </div>

            {/* Mobile CTA inside Mobile Menu */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + navItems.length * 0.06, duration: 0.4, ease: 'easeOut' }}
              className="flex justify-center w-full mt-4"
            >
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group flex items-center space-x-2 text-[11px] tracking-[0.24em] font-light uppercase py-3.5 px-8 border border-[#8C6D4F]/50 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 text-[#EAD8C7] transition-all duration-300 backdrop-blur-sm cursor-pointer"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <span>REDEN WIR</span>
                <span className="transform transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-xs">
                  ↗
                </span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
