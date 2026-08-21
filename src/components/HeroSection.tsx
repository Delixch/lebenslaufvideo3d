import React, { useState, useEffect, useRef } from 'react';
import { LampMoths } from './LampMoths';
import { LampBuzz } from './LampBuzz';
import { LampMenu } from './LampMenu';
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
// Laptop-Format: breit, aber flach. object-cover schneidet dort oben und
// unten je rund 60px weg — genug, um die Spitze der Laterne zu kappen und
// den Kopf des Mannes in die Menuezeile zu heben.
const FLAT_QUERY = '(min-width: 768px) and (max-height: 860px)';

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
  // Die Buehnenschicht liegt `fixed` ueber dem ganzen Fenster und blieb bisher
  // den kompletten Scroll ueber stehen: zwei Videos in Dauerschleife, ein
  // bildschirmfuellendes Foto mit Maske und die Scheine der Laterne wurden
  // hinter jedem Abschnitt weitergezeichnet. Sichtbar ist davon nichts, sobald
  // der Hero oben aus dem Bild ist.
  const heroRef = useRef<HTMLElement | null>(null);
  const buehneRef = useRef<HTMLDivElement | null>(null);
  const [heroImBild, setHeroImBild] = useState(true);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const [isFlat, setIsFlat] = useState(() => window.matchMedia(FLAT_QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const query = window.matchMedia(FLAT_QUERY);
    const update = () => setIsFlat(query.matches);
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

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) {
      return;
    }

    // Zwei Waechter nebeneinander, absichtlich. Sie schalten die Schicht ab,
    // sobald der Hero durch ist - das Durchscheinen im Uebergang beseitigen
    // sie nicht, wohl aber den schlimmen Fall, dass die Schicht noch unter
    // dem Kontaktformular steht.
    //
    // Der Beobachter allein reichte nicht: unter iOS meldet er sich beim
    // Schwungscrollen zu spaet, und dann stand die Schicht noch beim
    // Kontaktformular. Ein Scroll-Waechter allein reichte auch nicht - beim
    // ersten Versuch hing er an requestAnimationFrame, und genau das wird
    // unter iOS waehrend des Schwungs ausgehungert, also lief er nie. Der
    // Zaehler steht deshalb jetzt unmittelbar im scroll-Ereignis: teuer ist
    // das nicht, gelesen wird nur window.scrollY, und selbst wenn iOS die
    // Ereignisse grob zusammenfasst, kommt am Ende des Schwungs eines an.
    const beobachter = new IntersectionObserver(
      ([eintrag]) => setHeroImBild(eintrag.isIntersecting),
      { rootMargin: '8% 0px' },
    );
    beobachter.observe(hero);

    const pruefe = () => {
      const hoehe = hero.offsetHeight || window.innerHeight;
      if (window.scrollY > hoehe * 1.05) {
        setHeroImBild(false);
      }
    };

    pruefe();
    window.addEventListener('scroll', pruefe, { passive: true });
    window.addEventListener('resize', pruefe, { passive: true });
    return () => {
      beobachter.disconnect();
      window.removeEventListener('scroll', pruefe);
      window.removeEventListener('resize', pruefe);
    };
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

  // Videos in der Buehnenschicht anhalten, sobald sie niemand mehr sieht.
  //
  // Zwei Bedingungen, und die zweite kam aus Adnans Beobachtung:
  //  - Der Hero ist aus dem Bild.
  //  - Das Video hat sich aufgeloest. Ab Sekunde 7.4 uebernimmt das Standbild
  //    hero-lamp.webp, das Video steht auf Deckkraft 0 - lief mit `loop` aber
  //    endlos weiter und wurde in jedem Bild dekodiert und komponiert,
  //    waehrend niemand es sah.
  //
  // Warum das wichtig ist: auf dem iPhone gibt es dieses Problem nicht, weil
  // dort `mobile.mp4` ohne `loop` laeuft und per `onEnded` einfach endet - ein
  // beendetes Video dekodiert nicht mehr, die Schicht steht still. Auf dem
  // iPad lief bisher dieselbe Endlosschleife wie auf dem Desktop, nur ohne
  // dessen Reserven. Damit laeuft der Desktop-Zweig jetzt genauso ruhig aus
  // wie der Handy-Zweig.
  //
  // Ausblenden allein genuegt nicht; ein Video hoert erst mit pause() auf zu
  // dekodieren. Das Video im Handyrahmen ist nicht betroffen - es liegt
  // ausserhalb dieser Schicht und ist sichtbar.
  useEffect(() => {
    const buehne = buehneRef.current;
    if (!buehne) {
      return;
    }

    const wirdGebraucht = heroImBild && !isVideoDissolved;

    buehne.querySelectorAll('video').forEach((video) => {
      if (wirdGebraucht) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [heroImBild, isMobile, isVideoDissolved]);

  // Aus hero-lamp.png ausgemessen: Mitte des Laternenglases und seine Breite,
  // jeweils als Anteil am Bild.
  // Beide Bilder wurden einzeln ausgemessen; das Handybild ist hochkant und
  // zeigt die Laterne weiter oben rechts.
  const BULB_X = isMobile ? 0.670 : 0.457;
  // 0.150 ist die Mitte des Glases, aus hero-lamp.png ausgemessen. Vorher
  // stand hier 0.099, also die Oberkante — der Wert glich aus, dass der
  // Schein um seine linke obere Ecke statt um seine Mitte sass. Dieser
  // Ausgleich war eine halbe Scheinbreite und haengt damit an der
  // Fenstergroesse; auf anderen Formaten rutschte das Licht deshalb aus
  // der Laterne, mal zur einen, mal zur anderen Seite.
  const BULB_Y = isMobile ? 0.159 : 0.150;
  const BULB_SIZE = isMobile ? 0.075 : 0.055;
  // Bildausschnitt: 0.5 = mittig, groesser = weiter rechts im Bild. Damit
  // ruecken Laterne und Mann nach links und die leere Flaeche schrumpft.
  const IMAGE_FOCUS_X = isMobile ? 0.5 : 0.92;
  // 0.5 = mittig, kleiner = weiter oben im Bild.
  const IMAGE_FOCUS_Y = !isMobile && isFlat ? 0.06 : 0.5;

  const lampImageRef = useRef<HTMLImageElement | null>(null);
  const lampCoreRef = useRef<HTMLDivElement | null>(null);
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

      // Bewusst offsetWidth statt getBoundingClientRect: der Rahmen um das Bild
      // traegt scale und translate. Ein Rect liefert Bildschirmpixel, also die
      // bereits skalierten Masse — die Leuchtpunkte liegen aber im selben
      // Rahmen und werden dort in unskalierten Pixeln gesetzt und erst danach
      // mitskaliert. Beides gemischt schob den Schein je nach Seitenformat um
      // mehrere Dutzend Pixel aus der Laterne heraus, mal nach links, mal nach
      // rechts. offsetWidth kennt die Transformation nicht und liegt damit im
      // selben Raum wie top und left weiter unten.
      const boxW = image.offsetWidth;
      const boxH = image.offsetHeight;
      const imageRatio = image.naturalWidth / image.naturalHeight;
      const boxRatio = boxW / boxH;

      let renderedW: number;
      let renderedH: number;
      if (boxRatio >= imageRatio) {
        renderedW = boxW;
        renderedH = boxW / imageRatio;
      } else {
        renderedH = boxH;
        renderedW = boxH * imageRatio;
      }

      // Offsets relativ zum Container, in dem die Leuchtpunkte liegen.
      const originX = image.offsetLeft + (boxW - renderedW) * IMAGE_FOCUS_X;
      const originY = image.offsetTop + (boxH - renderedH) * IMAGE_FOCUS_Y;

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
  }, [BULB_X, BULB_Y, BULB_SIZE, IMAGE_FOCUS_X, IMAGE_FOCUS_Y]);

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
    
    // Der Auftritt haengt am Fingerschnippen kurz vor Schluss, nicht an einer
    // festen Sekunde: sonst loest ein kuerzerer Schnitt den Moment nie aus.
    const cue = video.duration ? Math.max(0.4, video.duration - 0.45) : 7.4;

    if (video.currentTime >= cue) {
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

  // Laternenlicht, Falter und Brummen: identisch fuer Handy und Desktop, nur
  // die ausgemessenen Koordinaten unterscheiden sich.
  // Auf dem Handy brennt die Laterne erst, wenn jemand sie einschaltet; am
  // Desktop geht sie wie bisher mit dem Aufloesen des Videos an.
  const [lampOn, setLampOn] = useState(false);
  const lampLit = isMobile ? isVideoDissolved && lampOn : isVideoDissolved;

  const lampLight = (
    <>
  {/* Altın Sarısı Yanan Sokak Lambası Glow Efekti (Kodla Yanma) */}
  <div 
    ref={lampCoreRef}
    className={`absolute pointer-events-none transition-all duration-[2000ms] ease-in-out ${
      lampLit 
        ? 'opacity-100 scale-100' 
        : 'opacity-0 scale-90 blur-sm'
    }`}
    style={{
      transitionDuration: isMobile ? '320ms' : '2000ms',
      // Sokak lambasının ampul koordinatı (görselin merkezinden yatay olarak hizalanmış responsive konum)
      top: lampCoords.top,
      right: lampCoords.right,
      left: lampCoords.left,
      width: lampCoords.width,
      height: lampCoords.height,
      transform: lampLit ? 'translate(-50%, -50%)' : 'scale(0.9) translate(-50%, -50%)',
      // Natriumdampflampe: warmweisser Kern, der ueber Bernstein
      // ausblutet — nicht das satte Postgelb von vorher.
      // Strassenlaternen brennen fast weiss; das Warme kommt erst
      // im Abfall dazu, nicht schon im Kern.
      background:
        'radial-gradient(circle, rgba(255,255,253,0.98) 0%, rgba(255,253,246,0.84) 16%, rgba(252,248,236,0.54) 34%, rgba(244,238,222,0.28) 52%, rgba(226,216,196,0.11) 72%, rgba(190,180,160,0.03) 88%, transparent 100%)',
      borderRadius: '50%',
      mixBlendMode: 'screen',
      animation: lampLit ? 'lampFlicker 6s infinite ease-in-out' : 'none',
    }}
  />

  {/* Lichthof: traegt die Helligkeit in die Umgebung, ohne zu leuchten */}
  <div
    className={`absolute pointer-events-none transition-all duration-[2000ms] ease-in-out ${
      lampLit ? 'opacity-100' : 'opacity-0'
    }`}
    style={{
      transitionDuration: isMobile ? '320ms' : '2000ms',
      top: lampCoords.top,
      left: lampCoords.left,
      width: `calc(${lampCoords.width} * 4.0)`,
      height: `calc(${lampCoords.width} * 4.0)`,
      transform: 'translate(-50%, -50%)',
      // Weiss statt Gold und weit auslaufend: ein kleiner, satter
      // Kreis liest sich sonst als Ring statt als Licht.
      background:
        'radial-gradient(circle, rgba(255,255,252,0.11) 0%, rgba(252,250,244,0.07) 14%, rgba(246,242,232,0.045) 28%, rgba(236,230,216,0.028) 42%, rgba(220,212,196,0.016) 56%, rgba(196,188,172,0.008) 70%, rgba(160,152,138,0.003) 84%, transparent 100%)',
      borderRadius: '50%',
      mixBlendMode: 'screen',
      filter: 'blur(55px)',
      // Nach unten ausblenden: der Mann steht vor der Laterne, das
      // Licht darf nicht ueber ihm liegen.
      maskImage:
        'linear-gradient(to bottom, #000 0%, #000 38%, rgba(0,0,0,0.45) 62%, transparent 86%)',
      WebkitMaskImage:
        'linear-gradient(to bottom, #000 0%, #000 38%, rgba(0,0,0,0.45) 62%, transparent 86%)',
      animation: lampLit ? 'haloBreathe 6s infinite ease-in-out' : 'none',
    }}
  />

  {/* Nachtfalter im Laternenglas */}
  {/*
    lampCoords zeigt auf die Mitte des Glases — so lesen es der Lichthof und
    das Lampenmenue mit ihrem translate(-50%, -50%) auch. Frueher schrieb
    jeder Schritt von lampFlicker ein eigenes `transform: scale(...)` und
    loeschte damit die Zentrierung des Scheins; der lag dann um eine halbe
    Breite versetzt, und die Falter zielten mit demselben Versatz hinterher.
    Die Schritte tragen die Verschiebung jetzt selbst, also zielen die Falter
    wieder direkt auf die Mitte.
  */}
  <LampMoths
    centerX={parseFloat(lampCoords.left)}
    centerY={parseFloat(lampCoords.top)}
    bulbSize={parseFloat(lampCoords.width)}
    active={lampLit}
  />

  {/* Netzbrummen und Knistern, synchron zum Flackern */}
  <LampBuzz active={lampLit} flickerTarget={lampCoreRef} />
    </>
  );

  return (
    <section
      ref={heroRef}
      className="relative w-screen h-screen overflow-hidden bg-black text-[#E8DFD8] font-sans selection:bg-[#cbb59d] selection:text-black cursor-none"
      style={{
        // Gleicher Startzeitpunkt wie das Flackern der Laterne, damit beide
        // Animationen im selben Frame anlaufen.
        animation: lampLit ? 'lampIntensity 6s infinite ease-in-out' : 'none',
      }}
    >
      <style>{`
        /* Laptop-Hoehen (z. B. 1536x730): my-auto drueckt den Inhalt sonst
           nach oben unter die Kopfzeile — ADNAN. verschwindet dann hinter
           ICH BAUE. Die Ueberschrift haengt hier deshalb zusaetzlich an der
           Bildschirmhoehe, nicht nur an der Breite, und der Inhaltsblock
           haelt Abstand zur Kopfzeile. */
        @media (min-width: 768px) and (max-height: 860px) {
          .hero-headline { font-size: clamp(3.25rem, min(7vw, 14.2vh), 7.8rem); }
          .hero-content { padding-top: 6.75rem; }
        }

        /* Die Kopfzeile sitzt mittig und wandert mit der Fensterbreite; Text und
           Knoepfe darunter hatten feste Pixelmasse. Auf 1564px endet der Absatz
           deshalb kurz vor UEBER MICH, auf 1283px lief er bis unter PROJEKTE.
           Umbruchbreite und Schriftgrade haengen hier an der Fensterbreite und
           wachsen stetig mit, statt in Stufen zu springen. Die obere Grenze ist
           der bisherige Wert, breite Schirme bleiben also unveraendert. */
        @media (min-width: 1024px) {
          /* Alle Werte laufen von 1283px bis 1500px hoch und stehen ab 1500px
             genau auf den bisherigen Zahlen — breite Schirme aendern sich also
             nicht, schmale wachsen stetig mit statt in Stufen zu springen. */
          .hero-copy {
            max-width: clamp(20rem, calc(50vw - 17rem), 32rem);
            font-size: clamp(11.5px, calc(0.9217vw - 0.33px), 13.5px);
          }

          .hero-eyebrow { font-size: clamp(11px, calc(0.4608vw + 5.088px), 12px); }

          .hero-cta { gap: clamp(0.75rem, calc(5.53vw - 58.95px), 1.5rem); }

          .hero-cta a {
            font-size: clamp(10px, calc(0.4608vw + 4.088px), 11px);
            padding-top: 0.875rem;
            padding-bottom: 0.875rem;
            padding-left: clamp(1.25rem, calc(3.6866vw - 27.3px), 1.75rem);
            padding-right: clamp(1.25rem, calc(3.6866vw - 27.3px), 1.75rem);
          }
        }

        @media (min-width: 768px) and (max-height: 700px) {
          .hero-content { padding-top: 5.75rem; padding-bottom: 1.5rem; }
        }

        @media (min-width: 768px) and (max-height: 860px) {
          .hero-phone-scale { transform: translate(24px, 12px) scale(0.82); }
        }

        @media (min-width: 768px) and (max-height: 780px) {
          .hero-phone-scale { transform: translate(40px, 24px) scale(0.7); }
        }

        @media (min-width: 768px) and (max-height: 680px) {
          .hero-phone-scale { transform: translate(56px, 36px) scale(0.58); }
        }

        @keyframes haloBreathe {
          0%, 100% { opacity: 0.85; }
          8% { opacity: 0.35; }
          14% { opacity: 0.95; }
          52% { opacity: 0.5; }
          58% { opacity: 0.9; }
          86% { opacity: 0.45; }
          92% { opacity: 0.88; }
        }

        /* Laterne und Menueblase haengen an derselben Zahl, damit sie als ein
           Licht flackern und nicht als zwei Objekte. */
        @property --lamp-intensity {
          syntax: '<number>';
          inherits: true;
          initial-value: 1;
        }

        @keyframes lampIntensity {
          0% { --lamp-intensity: 0; }
          5% { --lamp-intensity: 0.95; }
          9% { --lamp-intensity: 0.05; }
          14% { --lamp-intensity: 0.9; }
          20% { --lamp-intensity: 0; }
          26% { --lamp-intensity: 0.98; }
          40% { --lamp-intensity: 1; }
          50% { --lamp-intensity: 0.86; }
          53% { --lamp-intensity: 1; }
          56% { --lamp-intensity: 0.9; }
          70% { --lamp-intensity: 1; }
          86% { --lamp-intensity: 0.88; }
          90% { --lamp-intensity: 1; }
          94% { --lamp-intensity: 0.92; }
          100% { --lamp-intensity: 1; }
        }

        @keyframes lampFlicker {
          /* 0s - 2.4s: Initial Broken Neon Sparks (hizli yanip sonme) */
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.92);
            filter: blur(14px) brightness(0);
          }
          5% {
            opacity: 0.95;
            transform: translate(-50%, -50%) scale(1.02);
            filter: blur(6px) brightness(1.2);
          }
          8% {
            opacity: 0.05;
            transform: translate(-50%, -50%) scale(0.95);
            filter: blur(12px) brightness(0.1);
          }
          12% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(1.0);
            filter: blur(7.5px) brightness(1.0);
          }
          14% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.93);
            filter: blur(13px) brightness(0);
          }
          18% {
            opacity: 0.98;
            transform: translate(-50%, -50%) scale(1.03);
            filter: blur(5px) brightness(1.3);
          }
          21% {
            opacity: 0.15;
            transform: translate(-50%, -50%) scale(0.96);
            filter: blur(10px) brightness(0.2);
          }
          24% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.0);
            filter: blur(7px) brightness(1.0);
          }
          
          /* 24% - 50%: Stable Glow */
          35% {
            opacity: 0.96;
            transform: translate(-50%, -50%) scale(1);
            filter: blur(7.5px) brightness(1.0);
          }
          42% {
            opacity: 0.98;
            transform: translate(-50%, -50%) scale(1.01);
            filter: blur(7px) brightness(1.03);
          }
          
          /* 50% - 55%: Sudden Power Dip / Flicker (gider gelir) */
          50% {
            opacity: 0.95;
            transform: translate(-50%, -50%) scale(1);
            filter: blur(7.5px) brightness(1.0);
          }
          51% {
            opacity: 0.1;
            transform: translate(-50%, -50%) scale(0.96);
            filter: blur(11px) brightness(0.2);
          }
          52% {
            opacity: 0.85;
            transform: translate(-50%, -50%) scale(1.01);
            filter: blur(8px) brightness(0.9);
          }
          53% {
            opacity: 0.03;
            transform: translate(-50%, -50%) scale(0.94);
            filter: blur(12px) brightness(0.05);
          }
          54% {
            opacity: 0.93;
            transform: translate(-50%, -50%) scale(1.02);
            filter: blur(6px) brightness(1.15);
          }
          55% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
            filter: blur(7px) brightness(1.0);
          }
          
          /* 55% - 85%: Stable Glow */
          70% {
            opacity: 0.97;
            transform: translate(-50%, -50%) scale(1);
            filter: blur(7px) brightness(1.0);
          }
          78% {
            opacity: 0.95;
            transform: translate(-50%, -50%) scale(0.99);
            filter: blur(7.5px) brightness(0.98);
          }
          
          /* 85% - 90%: Quick Double Flicker */
          85% {
            opacity: 0.96;
            transform: translate(-50%, -50%) scale(1);
            filter: blur(7px) brightness(1.0);
          }
          86% {
            opacity: 0.15;
            transform: translate(-50%, -50%) scale(0.95);
            filter: blur(10px) brightness(0.22);
          }
          87% {
            opacity: 0.98;
            transform: translate(-50%, -50%) scale(1.02);
            filter: blur(6.5px) brightness(1.1);
          }
          88% {
            opacity: 0.12;
            transform: translate(-50%, -50%) scale(0.95);
            filter: blur(11px) brightness(0.18);
          }
          89% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
            filter: blur(7px) brightness(1.0);
          }
          /* Ohne diesen Schritt laeuft transform am Ende jedes Durchlaufs auf
             den Grundwert des Elements zu — und das ist translate(-50%, -50%).
             Der Schein rutschte dadurch in der letzten halben Sekunde jedes
             Zyklus um eine halbe Kernbreite nach links oben und wieder zurueck,
             waehrend die Falter stehen blieben. */
          100% {
            opacity: 0.96;
            transform: translate(-50%, -50%) scale(1);
            filter: blur(7px) brightness(1.0);
          }
        }

        @keyframes lampFlickerMobile {
          0% { opacity: 0; }
          5% { opacity: 0.95; }
          8% { opacity: 0.05; }
          12% { opacity: 0.9; }
          14% { opacity: 0; }
          18% { opacity: 0.98; }
          21% { opacity: 0.15; }
          24% { opacity: 1; }
          35% { opacity: 0.96; }
          42% { opacity: 0.98; }
          50% { opacity: 0.95; }
          51% { opacity: 0.1; }
          52% { opacity: 0.85; }
          53% { opacity: 0.03; }
          54% { opacity: 0.93; }
          55% { opacity: 1; }
          70% { opacity: 0.97; }
          78% { opacity: 0.95; }
          85% { opacity: 0.96; }
          86% { opacity: 0.15; }
          87% { opacity: 0.98; }
          88% { opacity: 0.12; }
          89% { opacity: 1; }
          100% { opacity: 0.96; }
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

      {/* ================= 2. BUEHNENSCHICHT ================= */}
      {/*
        `absolute` statt `fixed`, und das ist der Kern: eine feste Schicht
        entkommt dem overflow-hidden ihres Abschnitts und liegt dann den
        ganzen Scroll ueber unter der Seite. Unter iOS zeichnet Safari beim
        Schwungscrollen kachelweise; ist eine Kachel fuer den neuen
        Scrollstand noch nicht gerastert, scheint durch sie hindurch, was
        darunter liegt — hier also das Hero-Foto, mitten im Abschnitt
        darunter und mit der harten Kachelkante als Verraeter.

        Ein z-index hilft dagegen nicht: er ordnet nur, was gezeichnet wird,
        und eine nicht gerasterte Kachel wird eben nicht gezeichnet. Nur wenn
        die Schicht dort gar nicht erst existiert, kann sie auch nicht
        durchscheinen. Der Abschnitt ist h-screen und overflow-hidden, also
        deckt sie bei Scrollstand 0 unveraendert das Fenster und wird ab da
        sauber abgeschnitten.

        Preis: der Hintergrund bleibt beim Weiterscrollen nicht mehr stehen,
        sondern faehrt mit. Genau dieses Stehenbleiben hatte Adnan zuvor als
        "Hintergrund haengt" gemeldet.
      */}
      <div
        ref={buehneRef}
        className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black flex items-center justify-end"
        style={{
          // Haelt die beiden Videos an, sobald der Hero aus dem Bild ist.
          visibility: heroImBild ? 'visible' : 'hidden',
        }}
      >
        {/* Desktop Video — landscape, right-aligned */}
        {/* Nur ein Element im DOM: autoPlay laedt auch versteckte Videos komplett,
            display:none haette den zweiten Clip trotzdem heruntergeladen. */}
        {/* Maske liegt auf einem Wrapper-Div, nicht auf dem <video> selbst:
            Chrome rendert CSS-Masken auf Video-Elementen oft erst, sobald ein
            dekodiertes Frame da ist — waehrend des Poster-Zustands (langsames
            Netz, preload="metadata") blieb das Foto davor unmaskiert und
            bildschirmfuellend stehen, der Text dahinter unsichtbar. */}
        {isMobile ? (
          <>
            {/* Standbild hinter dem Video, taucht beim Aufloesen auf */}
            <div
              className={`absolute inset-0 h-full w-full overflow-hidden transition-all duration-[2000ms] ease-out ${
                isVideoDissolved
                  ? 'opacity-100 scale-100 blur-0'
                  : 'opacity-0 scale-[0.97] blur-[15px] pointer-events-none'
              }`}
              style={{
                maskImage: 'linear-gradient(to bottom, #000 42%, rgba(0,0,0,0.55) 68%, transparent 92%)',
                WebkitMaskImage: 'linear-gradient(to bottom, #000 42%, rgba(0,0,0,0.55) 68%, transparent 92%)',
              }}
            >
              {/* SÖNÜK RESİM (Lamp OFF image) - her zaman tabanda durur */}
              <img
                ref={lampImageRef}
                onLoad={() => window.dispatchEvent(new Event('resize'))}
                src="/mobilstopimages.jpg"
                alt="Adnan Aydin"
                className="h-full w-full object-cover object-[50%_top]"
              />

              {/* YANIK RESİM (Lamp ON image) - lamba açıkken üstüne biner ve gerçekçi ışıkları titretir */}
              <img
                src="/mobilstopimages_on.jpg"
                alt="Adnan Aydin Lamba Açık"
                className={`absolute inset-0 h-full w-full object-cover object-[50%_top] transition-opacity pointer-events-none ${
                  lampLit ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  transitionDuration: '320ms',
                  animation: lampLit ? 'lampFlickerMobile 6s infinite ease-in-out' : 'none',
                }}
              />

              {lampLight}
            </div>

            {/* Video darueber: laeuft einmal und verschwindet im Nebel */}
            <div
              className={`absolute inset-0 h-full w-full overflow-hidden transition-all duration-[2200ms] ease-out ${
                isVideoDissolved
                  ? 'opacity-0 scale-[0.98] blur-[30px] pointer-events-none'
                  : 'opacity-100 scale-100 blur-0'
              }`}
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
                playsInline
                preload="auto"
                onEnded={() => setIsVideoDissolved(true)}
                className="h-full w-full object-cover object-[50%_top]"
              />
            </div>
          </>
        ) : (
          <>
            {/* Arka Planda Sabit Duran Sokak Lambalı und Pozlu Görsel */}
            <div 
              className={`absolute inset-0 h-full w-full overflow-hidden transition-all duration-[2000ms] ease-out origin-top-right ${
                isVideoDissolved 
                  ? 'opacity-100 scale-[0.94] translate-y-[max(4.5rem,6vh)] blur-0' 
                  : 'opacity-0 scale-[0.91] translate-y-[max(6rem,8vh)] blur-[15px] pointer-events-none'
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
                src="/hero-lamp.webp" 
                alt="Adnan Aydin - Final"
                className="h-full w-full object-cover"
                style={{ objectPosition: `${IMAGE_FOCUS_X * 100}% ${IMAGE_FOCUS_Y * 100}%` }}
              />

              {lampLight}
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
                src="/videos/111.mp4"
                poster={HERO_POSTER}
                autoPlay
                muted
                playsInline
                preload="auto"
                onTimeUpdate={handleTimeUpdate}
                className="h-full w-full object-cover scale-[0.94] origin-top-right translate-y-[max(4.5rem,6vh)]"
                style={{ objectPosition: `50% ${IMAGE_FOCUS_Y * 100}%` }}
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
      <div className="hero-content relative z-10 flex flex-col justify-between h-full w-full px-6 sm:px-12 lg:px-16 pt-6 pb-8 pointer-events-none">
        


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
                className="hero-headline text-6xl sm:text-7xl md:text-8xl lg:text-[7.2rem] xl:text-[7.8rem] tracking-tight uppercase leading-[0.83]"
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
                className="hero-eyebrow text-[10px] sm:text-[11px] md:text-xs font-normal tracking-[0.28em] uppercase text-[#C4B29E]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                WEB-ENTWICKLER <span className="text-[#8C6D4F] mx-1">•</span> 3D &amp; MOTION <span className="text-[#8C6D4F] mx-1">•</span> ZÜRICH
              </p>
            </motion.div>

            {/* 3-Line Description */}
            <motion.div
              variants={fadeUpVariants}
              className="hero-copy text-xs sm:text-sm md:text-[13.5px] font-normal text-[#EAD8C7] leading-[1.8] tracking-wide max-w-lg mb-6 space-y-1"
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
              className="hero-cta flex flex-row items-center gap-4 sm:gap-6"
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
                  {/* Der Rahmen misst feste 170x340px. Auf einem hohen Schirm
                      steht der Mann fast 1000px hoch, da wirkt das Handy klein.
                      Auf Laptop-Hoehen schrumpft der Mann mit dem Bild, das
                      Handy aber nicht — es wurde groesser als er und klebte an
                      seiner Schulter. Diese Huelle zieht es entsprechend der
                      Bildschirmhoehe zusammen und rueckt es nach rechts weg. */}
                  <div className="hero-phone-scale flex flex-col items-center">
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
                      {/*
                        Dieser Clip ist 2.3 MB gross und laeuft in einem Kasten
                        von 164x334 Punkten — er muesste in der Groesse neu
                        kodiert werden. Was hier geht: der Rahmen haengt an
                        `showPhone` und wird erst bei Sekunde 7.4 eingehaengt,
                        und der Beobachter weiter oben haelt das Video an,
                        sobald der Hero aus dem Bild ist.
                      */}
                      <video
                        src="/videos/mobilvideoana.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                      {/* Glass glare effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none z-20" />
                    </div>
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

      {/* Die Laterne schaltet auf dem Handy das Menue. Sie sitzt bewusst ausser-
          halb der Bildebene, sonst deckt die Schlagzeile die Blase zu. */}
      {isMobile && (
        <LampMenu coords={lampCoords} active={isVideoDissolved} onToggle={setLampOn} />
      )}
    </section>
  );
};

export default HeroSection;