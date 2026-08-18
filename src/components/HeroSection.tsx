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

// Web Audio API Sentezleyicisi: Arızalı neon sokak lambası uğultusu ve kıvılcım patlamaları üretir
class NeonBuzzSynth {
  private ctx: AudioContext | null = null;
  private humOsc: OscillatorNode | null = null;
  private buzzOsc: OscillatorNode | null = null;
  private humGain: GainNode | null = null;

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();
  }

  // Kıvılcım Çatırtısı (Beyaz gürültü ve frekans kaymalı çıtırtı)
  public playSpark(timeOffset: number = 0) {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + timeOffset;

    // 1. Beyaz gürültü (Statik patlama)
    const bufferSize = this.ctx.sampleRate * 0.04; // 40ms gürültü
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1200, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.05, now + 0.003); // Hızlı atak
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035); // Hızlı sönüm

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.05);

    // 2. Kıvılcım Pop Sesi (Çıtırtı tınısı)
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    popOsc.type = 'triangle';
    popOsc.frequency.setValueAtTime(180, now);
    popOsc.frequency.linearRampToValueAtTime(30, now + 0.025);

    popGain.gain.setValueAtTime(0, now);
    popGain.gain.linearRampToValueAtTime(0.09, now + 0.002);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    popOsc.connect(popGain);
    popGain.connect(this.ctx.destination);

    popOsc.start(now);
    popOsc.stop(now + 0.03);
  }

  // Sürekli Neon Uğultusu (50Hz şebeke gürültüsü ve harmonikler)
  public startHum() {
    this.init();
    if (!this.ctx) return;
    if (this.humOsc) return; // Zaten uğulduyor

    const now = this.ctx.currentTime;

    // 50Hz temel sinüs dalgası
    this.humOsc = this.ctx.createOscillator();
    this.humOsc.type = 'sine';
    this.humOsc.frequency.setValueAtTime(50, now);

    // 100Hz metalik cızırtı harmonisi
    this.buzzOsc = this.ctx.createOscillator();
    this.buzzOsc.type = 'sawtooth';
    this.buzzOsc.frequency.setValueAtTime(100, now);

    // İçi boş eski lamba hissi veren filtre
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(140, now);
    filter.Q.setValueAtTime(1.8, now);

    this.humGain = this.ctx.createGain();
    this.humGain.gain.setValueAtTime(0, now);
    // Kıvılcımlardan sonra yavaşça arkaya otursun (düşük ses)
    this.humGain.gain.linearRampToValueAtTime(0.005, now + 1.8);

    this.humOsc.connect(filter);
    this.buzzOsc.connect(filter);
    filter.connect(this.humGain);
    this.humGain.connect(this.ctx.destination);

    this.humOsc.start(now);
    this.buzzOsc.start(now);
  }

  // Uğultuyu durdur (fade out ile yumuşak kesim)
  public stopHum() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.humGain) {
      try {
        this.humGain.gain.setValueAtTime(this.humGain.gain.value, now);
        this.humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      } catch (e) {}
    }
    setTimeout(() => {
      try {
        this.humOsc?.stop();
        this.buzzOsc?.stop();
      } catch (e) {}
      this.humOsc = null;
      this.buzzOsc = null;
      this.humGain = null;
    }, 500);
  }
}

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

  // Video saniyesine duyarlı telefon gösterim ve dumanla yok olma (smoke dissolve) tetikleyicisi
  const [showPhone, setShowPhone] = useState(false);
  const [isVideoDissolved, setIsVideoDissolved] = useState(false);
  const soundPlayedRef = useRef(false);

  // Aus hero-lamp.png ausgemessen: Mitte des Laternenglases und seine Breite,
  // jeweils als Anteil am Bild.
  const BULB_X = 0.471;
  const BULB_Y = 0.047;
  const BULB_SIZE = 0.055;
  // Bildausschnitt: 0.5 = mittig, groesser = weiter rechts im Bild. Damit
  // ruecken Laterne und Mann nach links und die leere Flaeche schrumpft.
  const IMAGE_FOCUS_X = 0.92;

  const lampImageRef = useRef<HTMLImageElement | null>(null);
  const [lampCoords, setLampCoords] = useState({
    top: '16%',
    left: '45.6%',
    right: 'auto',
    width: '60px',
    height: '60px',
  });

  useEffect(() => {
    // Nicht am Fenster rechnen, sondern am Bild selbst: der Container wird
    // skaliert und verschoben, und object-cover schneidet je nach Seitenformat
    // anders zu. Die eigene Groesse des <img> kennt beides bereits.
    const handleResize = () => {
      const image = lampImageRef.current;
      if (!image || !image.naturalWidth) {
        return;
      }

      const box = image.getBoundingClientRect();
      const parent = image.parentElement?.getBoundingClientRect();
      const imageRatio = image.naturalWidth / image.naturalHeight;
      const boxRatio = box.width / box.height;

      let renderedW: number;
      let renderedH: number;
      if (boxRatio >= imageRatio) {
        renderedW = box.width;
        renderedH = box.width / imageRatio;
      } else {
        renderedH = box.height;
        renderedW = box.height * imageRatio;
      }

      // Offsets relativ zum Container, in dem die Leuchtpunkte liegen.
      const originX = box.left - (parent?.left ?? 0) + (box.width - renderedW) * IMAGE_FOCUS_X;
      const originY = box.top - (parent?.top ?? 0) + (box.height - renderedH) / 2;

      setLampCoords({
        top: `${originY + BULB_Y * renderedH}px`,
        left: `${originX + BULB_X * renderedW}px`,
        right: 'auto',
        width: `${BULB_SIZE * renderedW}px`,
        height: `${BULB_SIZE * renderedW}px`,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // İlk yüklemede çalıştır
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Neon Uğultu ve Kıvılcım Sentezleyici Ref'leri
  const neonSynthRef = useRef<NeonBuzzSynth | null>(null);

  // Sentezleyiciyi oluştur
  useEffect(() => {
    neonSynthRef.current = new NeonBuzzSynth();
    return () => {
      neonSynthRef.current?.stopHum();
    };
  }, []);

  // Lamba yandığında sürekli uğultuyu ve pır-pır kıvılcım seslerini yöneten döngü
  useEffect(() => {
    if (!isVideoDissolved) return;

    // Eğer sitenin sesi başlangıçta açıksa uğultuyu başlat
    const isSoundEnabled = (window as any).isSiteSoundEnabled;
    if (isSoundEnabled) {
      neonSynthRef.current?.startHum();
    }

    const playLoopSparks = () => {
      const isSoundEnabledNow = (window as any).isSiteSoundEnabled;
      if (!isSoundEnabledNow || !neonSynthRef.current) return;

      // 10 saniyelik lampFlicker CSS animasyonundaki pır-pır anlarıyla milisaniyelik senkronize ses kıvılcımları
      // Başlangıç Kıvılcımları (0s - 2.4s)
      neonSynthRef.current.playSpark(0.0);
      neonSynthRef.current.playSpark(0.5);
      neonSynthRef.current.playSpark(0.8);
      neonSynthRef.current.playSpark(1.2);
      neonSynthRef.current.playSpark(1.4);
      neonSynthRef.current.playSpark(1.8);
      neonSynthRef.current.playSpark(2.1);

      // Ortadaki Güç Düşüşü Pır-pırları (5.0s - 5.4s)
      neonSynthRef.current.playSpark(5.0);
      neonSynthRef.current.playSpark(5.15);
      neonSynthRef.current.playSpark(5.3);

      // Sondaki Çift Kıvılcımlar (8.6s - 8.8s)
      neonSynthRef.current.playSpark(8.6);
      neonSynthRef.current.playSpark(8.8);
    };

    // İlk yandığı an kıvılcımları fırlat
    if (isSoundEnabled) {
      playLoopSparks();
    }

    // 10 saniyede bir döngü şeklinde kıvılcımları tekrarla (CSS keyframe süresiyle eşzamanlı)
    const interval = setInterval(playLoopSparks, 10000);

    // Global ses açma/kapama durumunu dinle (AmbientSound tıklandığında hum sesini sustur veya başlat)
    const handleGlobalToggle = (e: Event) => {
      const isEnabled = (e as CustomEvent).detail;
      if (neonSynthRef.current) {
        if (isEnabled) {
          neonSynthRef.current.startHum();
          // Ses yeni açıldıysa kıvılcımları anında bir kere tetikle
          playLoopSparks();
        } else {
          neonSynthRef.current.stopHum();
        }
      }
    };

    window.addEventListener('siteSoundToggle', handleGlobalToggle);

    return () => {
      clearInterval(interval);
      window.removeEventListener('siteSoundToggle', handleGlobalToggle);
      neonSynthRef.current?.stopHum();
    };
  }, [isVideoDissolved]);

  // Web Audio API ile tamamen kodla üretilen fütüristik hologram beliriş sesi (woosh & chime)
  const playHologramSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;

      // 1. Sweeping Oscillator (Woosh Efekti)
      const osc1 = ctx.createOscillator();
      const gainNode1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(80, now);
      osc1.frequency.exponentialRampToValueAtTime(700, now + 0.45);
      osc1.frequency.exponentialRampToValueAtTime(300, now + 1.0);
      
      gainNode1.gain.setValueAtTime(0, now);
      gainNode1.gain.linearRampToValueAtTime(0.06, now + 0.2);
      gainNode1.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      // 2. Chime Oscillator (Yüksek Altın Tınılı Çınlama)
      const osc2 = ctx.createOscillator();
      const gainNode2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(200, now);
      osc2.frequency.exponentialRampToValueAtTime(950, now + 0.4);
      osc2.frequency.exponentialRampToValueAtTime(523.25, now + 1.2); // Do Notası

      gainNode2.gain.setValueAtTime(0, now);
      gainNode2.gain.linearRampToValueAtTime(0.08, now + 0.35);
      gainNode2.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc1.connect(gainNode1);
      osc2.connect(gainNode2);
      gainNode1.connect(ctx.destination);
      gainNode2.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.4);
      osc2.stop(now + 1.4);
    } catch (e) {
      console.warn("Hologram ses sentezleyici hatası:", e);
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    
    // Parmak şıklatma videosunun 7.4. saniyesinde telefonu göster ve kalıcı yap (bir daha yok olmasın)
    if (video.currentTime >= 7.4) {
      setShowPhone(true);
      setIsVideoDissolved(true); // Adam duman/sis efektiyle yok olmaya başlar
      
      // Ses seviyesini kontrol et: Eğer video sesi açık idiyse, hologram sesini çal
      const wasSoundActive = !video.muted;
      
      // Yürüyüş adım seslerini (videonun sesini) anında kapat
      video.muted = true;

      // Hologram ses efektini bir kez çal
      if (!soundPlayedRef.current) {
        soundPlayedRef.current = true;
        if (wasSoundActive) {
          playHologramSound();
        }
      }
    }
  };

  return (
    <section className="relative w-screen h-screen overflow-hidden bg-black text-[#E8DFD8] font-sans selection:bg-[#cbb59d] selection:text-black cursor-none">
      <style>{`
        @keyframes lampFlicker {
          /* 0s - 2.4s: Initial Broken Neon Sparks (hizli yanip sonme) */
          0% {
            opacity: 0;
            transform: scale(0.92);
            filter: blur(14px) brightness(0);
            box-shadow: none;
          }
          5% {
            opacity: 0.95;
            transform: scale(1.02);
            filter: blur(6px) brightness(1.2);
            box-shadow: 0 0 50px rgba(234,179,8,0.8), 0 0 100px rgba(234,179,8,0.4);
          }
          8% {
            opacity: 0.05;
            transform: scale(0.95);
            filter: blur(12px) brightness(0.1);
            box-shadow: 0 0 10px rgba(234,179,8,0.1);
          }
          12% {
            opacity: 0.9;
            transform: scale(1.0);
            filter: blur(7.5px) brightness(1.0);
            box-shadow: 0 0 45px rgba(234,179,8,0.7), 0 0 90px rgba(234,179,8,0.3);
          }
          14% {
            opacity: 0;
            transform: scale(0.93);
            filter: blur(13px) brightness(0);
            box-shadow: none;
          }
          18% {
            opacity: 0.98;
            transform: scale(1.03);
            filter: blur(5px) brightness(1.3);
            box-shadow: 0 0 60px rgba(234,179,8,0.95), 0 0 115px rgba(234,179,8,0.5);
          }
          21% {
            opacity: 0.15;
            transform: scale(0.96);
            filter: blur(10px) brightness(0.2);
            box-shadow: 0 0 20px rgba(234,179,8,0.2);
          }
          24% {
            opacity: 1;
            transform: scale(1.0);
            filter: blur(7px) brightness(1.0);
            box-shadow: 0 0 50px rgba(234,179,8,0.8), 0 0 100px rgba(234,179,8,0.4);
          }
          
          /* 24% - 50%: Stable Glow */
          35% {
            opacity: 0.96;
            transform: scale(1);
            filter: blur(7.5px) brightness(1.0);
            box-shadow: 0 0 48px rgba(234,179,8,0.78), 0 0 98px rgba(234,179,8,0.38);
          }
          42% {
            opacity: 0.98;
            transform: scale(1.01);
            filter: blur(7px) brightness(1.03);
            box-shadow: 0 0 52px rgba(234,179,8,0.82), 0 0 102px rgba(234,179,8,0.42);
          }
          
          /* 50% - 55%: Sudden Power Dip / Flicker (gider gelir) */
          50% {
            opacity: 0.95;
            transform: scale(1);
            filter: blur(7.5px) brightness(1.0);
            box-shadow: 0 0 48px rgba(234,179,8,0.78), 0 0 98px rgba(234,179,8,0.38);
          }
          51% {
            opacity: 0.1;
            transform: scale(0.96);
            filter: blur(11px) brightness(0.2);
            box-shadow: 0 0 15px rgba(234,179,8,0.15);
          }
          52% {
            opacity: 0.85;
            transform: scale(1.01);
            filter: blur(8px) brightness(0.9);
            box-shadow: 0 0 42px rgba(234,179,8,0.68), 0 0 88px rgba(234,179,8,0.28);
          }
          53% {
            opacity: 0.03;
            transform: scale(0.94);
            filter: blur(12px) brightness(0.05);
            box-shadow: none;
          }
          54% {
            opacity: 0.93;
            transform: scale(1.02);
            filter: blur(6px) brightness(1.15);
            box-shadow: 0 0 55px rgba(234,179,8,0.88), 0 0 108px rgba(234,179,8,0.45);
          }
          55% {
            opacity: 1;
            transform: scale(1);
            filter: blur(7px) brightness(1.0);
            box-shadow: 0 0 50px rgba(234,179,8,0.8), 0 0 100px rgba(234,179,8,0.4);
          }
          
          /* 55% - 85%: Stable Glow */
          70% {
            opacity: 0.97;
            transform: scale(1);
            filter: blur(7px) brightness(1.0);
            box-shadow: 0 0 50px rgba(234,179,8,0.8), 0 0 100px rgba(234,179,8,0.4);
          }
          78% {
            opacity: 0.95;
            transform: scale(0.99);
            filter: blur(7.5px) brightness(0.98);
            box-shadow: 0 0 47px rgba(234,179,8,0.76), 0 0 96px rgba(234,179,8,0.36);
          }
          
          /* 85% - 90%: Quick Double Flicker */
          85% {
            opacity: 0.96;
            transform: scale(1);
            filter: blur(7px) brightness(1.0);
            box-shadow: 0 0 48px rgba(234,179,8,0.78), 0 0 98px rgba(234,179,8,0.38);
          }
          86% {
            opacity: 0.15;
            transform: scale(0.95);
            filter: blur(10px) brightness(0.22);
            box-shadow: 0 0 18px rgba(234,179,8,0.18);
          }
          87% {
            opacity: 0.98;
            transform: scale(1.02);
            filter: blur(6.5px) brightness(1.1);
            box-shadow: 0 0 54px rgba(234,179,8,0.86), 0 0 104px rgba(234,179,8,0.44);
          }
          88% {
            opacity: 0.12;
            transform: scale(0.95);
            filter: blur(11px) brightness(0.18);
            box-shadow: 0 0 15px rgba(234,179,8,0.15);
          }
          89% {
            opacity: 1;
            transform: scale(1);
            filter: blur(7px) brightness(1.0);
            box-shadow: 0 0 50px rgba(234,179,8,0.8), 0 0 100px rgba(234,179,8,0.4);
          }
          
          /* 90% - 100%: Stable End State */
          100% {
            opacity: 0.96;
            transform: scale(1);
            filter: blur(7px) brightness(1.0);
            box-shadow: 0 0 50px rgba(234,179,8,0.8), 0 0 100px rgba(234,179,8,0.4);
          }
        }
      `}</style>
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
          <>
            {/* Arka Planda Sabit Duran Sokak Lambalı und Pozlu Görsel */}
            <div 
              className={`absolute inset-0 h-full w-full overflow-hidden transition-all duration-[2000ms] ease-out origin-top-right ${
                isVideoDissolved 
                  ? 'opacity-100 scale-[0.94] translate-y-[6vh] blur-0' 
                  : 'opacity-0 scale-[0.91] translate-y-[8vh] blur-[15px] pointer-events-none'
              }`}
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 18%, rgba(0,0,0,0.8) 38%, #000 55%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 18%, rgba(0,0,0,0.8) 38%, #000 55%)',
              }}
            >
              {/* Sabit Görsel - Ortalanmış konumda */}
              <img 
                ref={lampImageRef}
                onLoad={() => window.dispatchEvent(new Event('resize'))}
                src="/hero-lamp.png" 
                alt="Adnan Aydin - Final"
                className="h-full w-full object-cover"
                style={{ objectPosition: `${IMAGE_FOCUS_X * 100}% center` }}
              />

              {/* Altın Sarısı Yanan Sokak Lambası Glow Efekti (Kodla Yanma) */}
              <div 
                className={`absolute pointer-events-none transition-all duration-[2000ms] ease-in-out ${
                  isVideoDissolved 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-90 blur-sm'
                }`}
                style={{
                  // Sokak lambasının ampul koordinatı (görselin merkezinden yatay olarak hizalanmış responsive konum)
                  top: lampCoords.top,
                  right: lampCoords.right,
                  left: lampCoords.left,
                  width: lampCoords.width,
                  height: lampCoords.height,
                  transform: isVideoDissolved ? 'translate(-50%, -50%)' : 'scale(0.9) translate(-50%, -50%)',
                  // Natriumdampflampe: warmweisser Kern, der ueber Bernstein
                  // ausblutet — nicht das satte Postgelb von vorher.
                  // Strassenlaternen brennen fast weiss; das Warme kommt erst
                  // im Abfall dazu, nicht schon im Kern.
                  background:
                    'radial-gradient(circle, rgba(255,253,248,0.98) 0%, rgba(255,250,236,0.82) 16%, rgba(252,240,214,0.5) 34%, rgba(240,220,180,0.26) 52%, rgba(214,180,130,0.1) 72%, rgba(160,130,90,0.03) 88%, transparent 100%)',
                  borderRadius: '50%',
                  mixBlendMode: 'screen',
                  animation: isVideoDissolved ? 'lampFlicker 6s infinite ease-in-out' : 'none',
                }}
              />

              {/* Lichthof: traegt die Helligkeit in die Umgebung, ohne zu leuchten */}
              <div
                className={`absolute pointer-events-none transition-all duration-[2000ms] ease-in-out ${
                  isVideoDissolved ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  top: lampCoords.top,
                  left: lampCoords.left,
                  width: `calc(${lampCoords.width} * 2.8)`,
                  height: `calc(${lampCoords.width} * 2.8)`,
                  transform: 'translate(-50%, -50%)',
                  background:
                    'radial-gradient(circle, rgba(255,251,240,0.16) 0%, rgba(248,238,214,0.09) 20%, rgba(226,206,170,0.045) 42%, rgba(180,158,124,0.02) 64%, rgba(120,104,80,0.008) 82%, transparent 100%)',
                  borderRadius: '50%',
                  mixBlendMode: 'screen',
                  filter: 'blur(18px)',
                  animation: isVideoDissolved ? 'lampFlicker 6s infinite ease-in-out' : 'none',
                }}
              />
            </div>

            {/* Ön Plandaki Yürüyen Adam Videosu (Süre dolunca sisle yok olur) - Ortalanmış konumda */}
            <div
              className={`absolute inset-0 h-full w-full overflow-hidden transition-all duration-[2200ms] ease-out origin-center ${
                isVideoDissolved 
                  ? 'opacity-0 scale-[0.98] blur-[30px] pointer-events-none' 
                  : 'opacity-100 scale-100 blur-0'
              }`}
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
                className="h-full w-full object-cover object-center scale-[0.94] origin-top-right translate-y-[6vh]"
              />
            </div>
          </>
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
                  initial={{ opacity: 0, y: 25, scale: 0.82, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 20, scale: 0.88, filter: 'blur(3px)' }}
                  transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
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
                  <div className={`relative w-[170px] h-[340px] rounded-[2rem] p-[3px] border-[3px] bg-[#0A0806] overflow-hidden transition-all duration-300 ${
                    isPhoneHovered 
                      ? 'border-[#D4AF37] shadow-[0_25px_60px_rgba(0,0,0,1),0_0_25px_rgba(212,175,55,0.22)]' 
                      : 'border-[#C99E5D] shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_15px_rgba(201,158,93,0.15)]'
                  }`}>
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