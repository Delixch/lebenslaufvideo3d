import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import watermarkImg from '../assets/watermark.webp';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.2,
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};



// TEST: DESKTOP_CLIP/MOBILE_CLIP voruebergehend ungenutzt (Video entfernt).
const HERO_POSTER = '/hero-poster.jpg';

interface HeroSectionProps {
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
}

const MOBILE_QUERY = '(max-width: 767px)';

export const HeroSection: React.FC<HeroSectionProps> = ({ isHovered, setIsHovered }) => {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 3D Phone Mockup Physics and States
  const phoneRef = useRef<HTMLDivElement>(null);
  const [isPhoneHovered, setIsPhoneHovered] = useState(false);
  const phoneMouseX = useMotionValue(0);
  const phoneMouseY = useMotionValue(0);

  const phoneRotateX = useSpring(useTransform(phoneMouseY, [-0.5, 0.5], [14, -14]), { damping: 22, stiffness: 180 });
  const phoneRotateY = useSpring(useTransform(phoneMouseX, [-0.5, 0.5], [-14, 14]), { damping: 22, stiffness: 180 });

  const handlePhoneMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!phoneRef.current) return;
    const rect = phoneRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    phoneMouseX.set(x);
    phoneMouseY.set(y);
  };

  const handlePhoneMouseLeave = () => {
    setIsPhoneHovered(false);
    phoneMouseX.set(0);
    phoneMouseY.set(0);
  };

  // Video saniyesine duyarlı telefon gösterim tetikleyicisi
  const [showPhone, setShowPhone] = useState(false);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    // Parmak şıklatma videosunun 7.0. saniyesinde telefonu göster, döngü başa sardığında gizle
    if (video.currentTime >= 7.0) {
      setShowPhone(true);
    } else {
      setShowPhone(false);
    }
  };

  return (
    <section className="relative w-screen h-screen overflow-hidden bg-black text-[#E8DFD8] font-sans selection:bg-[#cbb59d] selection:text-black cursor-none">
      {/* ================= 1. MINIMAL CUSTOM CURSOR ================= */}
      {cursorPos.x >= 0 && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-50 rounded-full border border-[#D4AF37]/40 flex items-center justify-center backdrop-blur-[1px]"
          animate={{
            x: cursorPos.x - (isHovered ? 24 : 5),
            y: cursorPos.y - (isHovered ? 24 : 5),
            width: isHovered ? 48 : 10,
            height: isHovered ? 48 : 10,
            backgroundColor: isHovered ? 'rgba(212, 175, 55, 0.1)' : 'rgba(235, 215, 195, 0.95)',
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 0.5 }}
        />
      )}

      {/* ================= 2. FIXED VIDEO LAYER ================= */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black flex items-center justify-end">
        {/* Desktop Video — landscape, right-aligned */}
        {/* Nur ein Element im DOM: autoPlay laedt auch versteckte Videos komplett,
            display:none haette den zweiten Clip trotzdem heruntergeladen. */}
        {/* Maske liegt auf einem Wrapper-Div, nicht auf dem <video> selbst:
            Chrome rendert CSS-Masken auf Video-Elementen oft erst, sobald ein
            dekodiertes Frame da ist — waehrend des Poster-Zustands (langsames
            Netz, preload="metadata") blieb das Foto davor unmaskiert und
            bildschirmfuellend stehen, der Text dahinter unsichtbar. */}
        {isMobile ? (
          <div
            className="absolute inset-0 h-full w-full overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to bottom, #000 42%, rgba(0,0,0,0.55) 68%, transparent 92%)',
              WebkitMaskImage: 'linear-gradient(to bottom, #000 42%, rgba(0,0,0,0.55) 68%, transparent 92%)',
            }}
          >
            <video
              src="/videos/mobile.mp4"
              poster={HERO_POSTER}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="h-full w-full object-cover object-[50%_top]"
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 h-full w-full overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 18%, rgba(0,0,0,0.8) 38%, #000 55%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 18%, rgba(0,0,0,0.8) 38%, #000 55%)',
            }}
          >
            <video
              src="/videos/333.mp4"
              poster={HERO_POSTER}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              className="h-full w-full object-cover object-[100%_top] scale-[0.94] origin-top-right translate-y-[6vh]"
            />
          </div>
        )}

        {/* Seamless Soft Left Edge Blend */}
        <div className="absolute inset-y-0 left-0 hidden w-2/5 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none md:block" />

        {/* ================= 3. ANIMATED WATERMARK EMBLEM ================= */}
        <div className="absolute bottom-6 right-6 lg:bottom-10 lg:right-12 pointer-events-none flex items-center justify-center z-10">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-36 h-36 bg-black/85 rounded-full blur-xl" />

            <motion.div
              animate={{
                y: [-3, 3, -3],
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative flex items-center justify-center"
            >
              <img
                src={watermarkImg}
                alt=""
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className="w-28 h-28 lg:w-32 lg:h-32 object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.25)]"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ================= 4. CONTENT LAYER ================= */}
      <div className="relative z-10 flex flex-col justify-between h-full w-full px-6 sm:px-12 lg:px-16 pt-6 pb-8 pointer-events-none">
        


        {/* Main Hero Row */}
        <div className="relative flex flex-col md:flex-row items-center justify-between w-full pt-4 pb-2 my-auto">
          
          {/* LEFT: Balanced Headline & Actions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-[37rem] xl:max-w-[40rem] pointer-events-auto z-20"
          >
            {/* Massive Condensed Headline */}
            <motion.div variants={fadeUpVariants} className="relative mb-3.5 select-none">
              <h1
                className="text-6xl sm:text-7xl md:text-8xl lg:text-[7.2rem] xl:text-[7.8rem] tracking-tight uppercase leading-[0.83]"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {/* Line 1: I BUILD */}
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#D5CBC0] to-[#605448] drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
                  ICH BAUE
                </span>

                {/* Line 2: DIGITAL */}
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#F7E7C4] via-[#C99E5D] to-[#543B1A] drop-shadow-[0_8px_25px_rgba(201,158,93,0.35)]">
                  DIGITALE
                </span>

                {/* Line 3: EXPERIENCES */}
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#DFBE8A] via-[#9B7640] to-[#342410] drop-shadow-[0_10px_30px_rgba(155,118,64,0.4)]">
                  ERLEBNISSE
                </span>
              </h1>
            </motion.div>

            {/* Subtitle Technologies */}
            <motion.div variants={fadeUpVariants} className="mb-4">
              <p
                className="text-[10px] sm:text-[11px] md:text-xs font-normal tracking-[0.28em] uppercase text-[#C4B29E]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                WEB-ENTWICKLER <span className="text-[#8C6D4F] mx-1">•</span> 3D &amp; MOTION <span className="text-[#8C6D4F] mx-1">•</span> ZÜRICH
              </p>
            </motion.div>

            {/* 3-Line Description */}
            <motion.div
              variants={fadeUpVariants}
              className="text-xs sm:text-sm md:text-[13.5px] font-light text-[#A8988B] leading-[1.8] tracking-wide max-w-lg mb-6 space-y-1"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <p>
                Ich verwandle Ideen in Websites, die man sich merkt.
                <br />
                Gestaltung und Code aus einer Hand — von der Skizze bis zum Deployment.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUpVariants}
              className="flex flex-row items-center gap-4 sm:gap-6"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {/* Explore My Work CTA */}
              <motion.a
                href="#work"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.02 }}
                className="relative inline-flex items-center space-x-3 px-6 sm:px-7 py-3.5 border border-[#8C6D4F] bg-[#120F0C]/80 hover:border-[#D4AF37] text-[#EAD8C7] hover:text-[#FFF5EB] text-[11px] font-medium tracking-[0.24em] uppercase transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.18)]"
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8D7C5]/40 to-transparent pointer-events-none" />
                <span>MEINE ARBEIT</span>
                <span className="transform transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-xs">
                  ↗
                </span>
              </motion.a>

              {/* Download Resume Button */}
              <motion.a
                href="mailto:adnan.aydin@bluewin.ch"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.02 }}
                className="relative inline-flex items-center space-x-2 px-6 sm:px-7 py-3.5 border border-[#8C6D4F]/40 hover:border-[#8C6D4F] text-[#BFA895] hover:text-[#EAD8C7] text-[11px] font-medium tracking-[0.24em] uppercase transition-all duration-300"
              >
                <span>E-MAIL SCHREIBEN</span>
                <span className="transform transition-transform duration-300 group-hover:translate-y-0.5 text-xs">
                  ↓
                </span>
              </motion.a>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN: 3D Phone Mockup + Quote & Signature */}
          <div className="hidden lg:flex flex-row items-center gap-10 xl:gap-14 pr-16 xl:pr-24 mr-2 z-20">
            {/* Phone Mockup with 3D Tilt, synchronized to show on finger snap */}
            <AnimatePresence>
              {showPhone && (
                <motion.div
                  ref={phoneRef}
                  style={{ 
                    rotateX: phoneRotateX, 
                    rotateY: phoneRotateY, 
                    transformStyle: 'preserve-3d',
                    perspective: 1000 
                  }}
                  onMouseMove={handlePhoneMouseMove}
                  onMouseEnter={() => {
                    setIsPhoneHovered(true);
                    setIsHovered(true); // Enlarge the custom cursor
                  }}
                  onMouseLeave={handlePhoneMouseLeave}
                  initial={{ opacity: 0, y: 40, scale: 0.85, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(4px)' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex flex-col items-center pointer-events-auto cursor-pointer"
                >
                  {/* Text above the phone */}
                  <div className="flex flex-col items-center mb-2.5 text-center select-none">
                    <span className="text-[8px] font-semibold tracking-[0.3em] uppercase text-[#D4AF37] animate-pulse">
                      • MOBIL UYUMLU / MOBILE READY
                    </span>
                    <span className="text-[8.5px] font-medium tracking-[0.2em] uppercase text-[#A8988B] mt-0.5">
                      FÜR ALLE GERÄTE OPTIMIERT
                    </span>
                  </div>

                  {/* Phone Outer Frame */}
                  <div className="relative w-[170px] h-[340px] rounded-[2rem] p-[3px] border-[3px] border-[#C99E5D] bg-[#0A0806] shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_15px_rgba(201,158,93,0.15)] overflow-hidden transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[0_25px_60px_rgba(0,0,0,1),0_0_25px_rgba(212,175,55,0.22)]">
                    {/* Dynamic Notch */}
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-3 bg-black rounded-full z-30 pointer-events-none" />

                    {/* Inner Screen */}
                    <div className="w-full h-full rounded-[1.65rem] overflow-hidden bg-black relative z-10">
                      <video
                        src="/videos/mobilvideoana.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover"
                      />
                      {/* Glass glare effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none z-20" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quote & Signature Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-start select-none"
            >
              {/* Quote Mark */}
              <span className="text-xl text-[#C99E5D] leading-none font-serif mb-2">
                “
              </span>

              {/* Compact Two-Line Statement */}
              <div 
                className="text-[9.5px] font-medium tracking-[0.24em] uppercase text-[#E0D3C5] space-y-1 mb-3"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <p>SIEBENMAL FALLEN,</p>
                <p>ACHTMAL AUFSTEHEN.</p>
              </div>

              {/* Gold Accent Line */}
              <div className="w-28 h-[1px] bg-gradient-to-r from-[#D4AF37] via-[#E8D7C5]/70 to-transparent shadow-[0_0_8px_rgba(212,175,55,0.4)] mb-2" />

              {/* Fine Monoline Calligraphy Signature */}
              <div 
                className="text-[2.2rem] text-[#D8AB64] font-normal leading-none -ml-0.5"
                style={{ 
                  fontFamily: "'Herr Von Muellerhoff', 'Allura', cursive",
                  letterSpacing: '0.04em',
                }}
              >
                Adnan
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Spacer */}
        <div className="h-2" />
      </div>
    </section>
  );
};

export default HeroSection;