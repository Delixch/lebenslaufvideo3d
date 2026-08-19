import React, { useState, useRef, useEffect } from 'react';

export const TestCalibrate: React.FC = () => {
  // Start with user's last calibrated values
  const [offsetX, setOffsetX] = useState(-1.0);
  const [offsetY, setOffsetY] = useState(7.0);
  const [scaleX, setScaleX] = useState(1.0045);
  const [scaleY, setScaleY] = useState(1.0045);
  const [linkScales, setLinkScales] = useState(false);
  const [opacity, setOpacity] = useState(0.5);
  
  // Blend mode: 'opacity' or 'difference'
  const [blendMode, setBlendMode] = useState<'opacity' | 'difference'>('difference');

  // Live test mode toggles lights on and off to simulate final user experience
  const [lightsOn, setLightsOn] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Dragging states
  const [isDraggingMove, setIsDraggingMove] = useState(false);
  const [isDraggingScaleX, setIsDraggingScaleX] = useState(false);
  const [isDraggingScaleY, setIsDraggingScaleY] = useState(false);

  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offsetStart, setOffsetStart] = useState({ x: 0, y: 0 });
  
  const [scaleXStart, setScaleXStart] = useState(1);
  const [scaleXStartDistance, setScaleXStartDistance] = useState(1);
  
  const [scaleYStart, setScaleYStart] = useState(1);
  const [scaleYStartDistance, setScaleYStartDistance] = useState(1);

  // Global mouse listeners for smooth dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const displayScale = rect.width / 1024; // exact current visual scale

      if (isDraggingMove) {
        const dx = (e.clientX - dragStart.x) / displayScale;
        const dy = (e.clientY - dragStart.y) / displayScale;
        setOffsetX(parseFloat((offsetStart.x + dx).toFixed(1)));
        setOffsetY(parseFloat((offsetStart.y + dy).toFixed(1)));
      }

      if (isDraggingScaleX) {
        const startDist = scaleXStartDistance || 1;
        const currentDist = Math.abs(e.clientX - centerX) / displayScale;
        const newScaleX = scaleXStart * (currentDist / startDist);
        const finalScaleX = parseFloat(Math.max(0.5, Math.min(2.0, newScaleX)).toFixed(5));
        setScaleX(finalScaleX);
        if (linkScales) {
          setScaleY(finalScaleX);
        }
      }

      if (isDraggingScaleY) {
        const startDist = scaleYStartDistance || 1;
        const currentDist = Math.abs(e.clientY - centerY) / displayScale;
        const newScaleY = scaleYStart * (currentDist / startDist);
        const finalScaleY = parseFloat(Math.max(0.5, Math.min(2.0, newScaleY)).toFixed(5));
        setScaleY(finalScaleY);
        if (linkScales) {
          setScaleX(finalScaleY);
        }
      }
    };

    const handlePointerUp = () => {
      setIsDraggingMove(false);
      setIsDraggingScaleX(false);
      setIsDraggingScaleY(false);
    };

    if (isDraggingMove || isDraggingScaleX || isDraggingScaleY) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [
    isDraggingMove,
    isDraggingScaleX,
    isDraggingScaleY,
    dragStart,
    offsetStart,
    scaleXStart,
    scaleXStartDistance,
    scaleYStart,
    scaleYStartDistance,
    linkScales
  ]);

  const startMoveDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingMove(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setOffsetStart({ x: offsetX, y: offsetY });
  };

  const startScaleXDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    setIsDraggingScaleX(true);
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const displayScale = rect.width / 1024;
    const dist = (Math.abs(e.clientX - centerX)) / displayScale;
    setScaleXStartDistance(dist);
    setScaleXStart(scaleX);
  };

  const startScaleYDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    setIsDraggingScaleY(true);
    const rect = containerRef.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const displayScale = rect.width / 1024;
    const dist = (Math.abs(e.clientY - centerY)) / displayScale;
    setScaleYStartDistance(dist);
    setScaleYStart(scaleY);
  };

  const changeScaleX = (delta: number) => {
    setScaleX((s) => {
      const val = parseFloat(Math.max(0.5, Math.min(2.0, s + delta)).toFixed(5));
      if (linkScales) setScaleY(val);
      return val;
    });
  };

  const changeScaleY = (delta: number) => {
    setScaleY((s) => {
      const val = parseFloat(Math.max(0.5, Math.min(2.0, s + delta)).toFixed(5));
      if (linkScales) setScaleX(val);
      return val;
    });
  };

  // Determine current style states based on live test mode
  const currentBlendMode = lightsOn ? 'normal' : (blendMode === 'difference' ? 'difference' : 'normal');

  return (
    <div className="h-screen w-full bg-[#050505] text-[#EAD8C7] font-sans flex flex-col md:flex-row items-center justify-center p-6 gap-8 overflow-hidden select-none">
      
      <style>{`
        @keyframes testLampIntensity {
          0% { opacity: 0.35; }
          5% { opacity: 0.95; }
          9% { opacity: 0.4; }
          14% { opacity: 0.9; }
          26% { opacity: 0.98; }
          50% { opacity: 0.86; }
          53% { opacity: 1; }
          70% { opacity: 1; }
          86% { opacity: 0.88; }
          100% { opacity: 1; }
        }
        @keyframes testMouseGlow {
          0%, 100% { opacity: 0.94; }
          42% { opacity: 0.98; }
          43% { opacity: 0.85; }
          44% { opacity: 0.98; }
          45% { opacity: 0.90; }
          46% { opacity: 1; }
          78% { opacity: 0.96; }
          79% { opacity: 0.82; }
          80% { opacity: 0.98; }
          81% { opacity: 0.88; }
          82% { opacity: 1; }
        }
        .test-lamp-glow {
          animation: testLampIntensity 6s infinite ease-in-out;
        }
        .test-mouse-glow {
          animation: testMouseGlow 8s infinite ease-in-out;
        }
      `}</style>

      {/* SOL SÜTUN: GÖRSEL ALANI */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="mb-4 text-center max-w-md">
          <h2 className="text-lg font-bold uppercase tracking-wider text-[#D4AF37]">
            Görsel Kalibratör (Yan Yana Görünüm)
          </h2>
          <p className="text-[11px] text-[#A8988B] mt-1 leading-relaxed">
            Hizalamayı test etmek için **görsele tıklayıp** ışıkları yakıp söndürün.
            Eşitleme yaparken ise **Fark (Difference)** modunu kullanın.
          </p>
        </div>

        {/* 1024x766 boyutundaki orijinal alanın CSS scale ile küçültülmesi (Yüzde 55) */}
        <div 
          className="relative flex items-center justify-center overflow-visible border border-[#8C6D4F]/30 bg-black shadow-2xl rounded"
          style={{ width: '563px', height: '421px' }}
        >
          <div 
            ref={containerRef}
            className="absolute origin-center w-[1024px] h-[766px]"
            style={{ transform: 'scale(0.55)' }}
          >
            {/* Alt Katman: Işıksız Arka Plan */}
            <img
              src="/ipad-buehne.png?v=8"
              alt="Base"
              className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-85"
            />

            {/* Üst Katman: Işıklı Arka Plan */}
            <img
              src="/ipad-buehne-on.png?v=8"
              alt="Overlay"
              className={`absolute inset-0 w-full h-full pointer-events-none select-none transition-opacity duration-300 ${
                lightsOn ? 'test-mouse-glow' : ''
              }`}
              style={{
                opacity: lightsOn ? 1.0 : (blendMode === 'opacity' ? opacity : (currentBlendMode === 'difference' ? 1.0 : 0.0)),
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${scaleX}, ${scaleY})`,
                transformOrigin: '50% 50%',
                mixBlendMode: currentBlendMode
              }}
            />

            {/* Sokak Lambası Glow Efekti (Işıklar Açıkken Animatik Yanar) */}
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-500 ${
                lightsOn ? 'opacity-100 test-lamp-glow' : 'opacity-0'
              }`}
              style={{
                left: '85.5%',
                top: '17.8%',
                width: '180px',
                height: '180px',
                background:
                  'radial-gradient(circle, rgba(255,255,252,0.18) 0%, rgba(252,250,244,0.10) 25%, rgba(246,242,232,0.05) 50%, transparent 100%)',
                mixBlendMode: 'screen',
                filter: 'blur(10px)',
              }}
            />

            {/* Sadece Kalibrasyon Modundayken (Işıklar Kapalıyken) Yeşil Kollar Görünür */}
            {!lightsOn && (
              <>
                {/* YEŞİL DAİRE 1: Taşıma Kolu (Merkezde) */}
                <div
                  onPointerDown={startMoveDrag}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex h-16 w-16 cursor-move items-center justify-center rounded-full border-2 border-white bg-[#39FF6A] text-[10px] font-bold text-black shadow-[0_0_25px_rgba(57,255,106,0.9)] transition-transform hover:scale-115 active:scale-95"
                >
                  TAŞI (X/Y)
                </div>

                {/* YEŞİL DAİRE 2: Genişlik Esnetme Kolu (Sağ Kenar Ortada) */}
                <div
                  onPointerDown={startScaleXDrag}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-50 flex h-16 w-16 cursor-ew-resize items-center justify-center rounded-full border-2 border-white bg-[#39FF6A] text-[10px] font-bold text-black shadow-[0_0_25px_rgba(57,255,106,0.9)] transition-transform hover:scale-115 active:scale-95"
                >
                  EN (X)
                </div>

                {/* YEŞİL DAİRE 3: Yükseklik Esnetme Kolu (Alt Kenar Ortada) */}
                <div
                  onPointerDown={startScaleYDrag}
                  className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-50 flex h-16 w-16 cursor-ns-resize items-center justify-center rounded-full border-2 border-white bg-[#39FF6A] text-[10px] font-bold text-black shadow-[0_0_25px_rgba(57,255,106,0.9)] transition-transform hover:scale-115 active:scale-95"
                >
                  BOY (Y)
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SAĞ SÜTUN: AYAR PANELI */}
      <div className="w-[360px] flex flex-col gap-4 border border-[#8C6D4F]/40 bg-[#0A0908]/95 p-5 rounded shadow-xl max-h-[90vh] overflow-y-auto">
        
        {/* Canlı Test Modu Butonu */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
            Canlı Test (Live Preview)
          </span>
          <button
            onClick={() => setLightsOn((prev) => !prev)}
            className={`w-full py-2.5 rounded border text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              lightsOn
                ? 'border-[#39FF6A] bg-[#39FF6A]/10 text-[#39FF6A] shadow-[0_0_12px_rgba(57,255,106,0.2)] animate-pulse'
                : 'border-[#8C6D4F]/50 bg-black/60 text-[#EAD8C7] hover:border-[#D4AF37] hover:text-[#F7E7C4]'
            }`}
          >
            {lightsOn ? 'IŞIKLARI SÖNDÜR (Test Kapat)' : 'IŞIKLARI YAK (Canlı Test Et)'}
          </button>
        </div>

        {/* Görsel Mod Seçimi (Sadece Işıklar kapalıyken ayar için görünür) */}
        {!lightsOn && (
          <div className="flex flex-col gap-2 border-t border-[#8C6D4F]/20 pt-3">
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
              Hizalama Modu (Blend Mode)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setBlendMode('difference')}
                className={`flex-1 py-1.5 text-xs rounded border transition-all ${
                  blendMode === 'difference'
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#F7E7C4] font-semibold'
                    : 'border-[#8C6D4F]/30 bg-black/40 text-[#A8988B] hover:border-[#8C6D4F]/60'
                }`}
              >
                Fark (Difference)
              </button>
              <button
                onClick={() => setBlendMode('opacity')}
                className={`flex-1 py-1.5 text-xs rounded border transition-all ${
                  blendMode === 'opacity'
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#F7E7C4] font-semibold'
                    : 'border-[#8C6D4F]/30 bg-black/40 text-[#A8988B] hover:border-[#8C6D4F]/60'
                }`}
              >
                Şeffaflık (Opacity)
              </button>
            </div>
          </div>
        )}

        {/* Şeffaflık Butonları */}
        {!lightsOn && blendMode === 'opacity' && (
          <div className="flex flex-col gap-1.5 bg-black/30 p-2 border border-[#8C6D4F]/10 rounded">
            <span className="text-[11px] text-[#A8988B] font-mono mb-1">Üst Katman Şeffaflığı (Opacity)</span>
            <div className="flex items-center gap-1.5 justify-between">
              <button
                type="button"
                onClick={() => setOpacity((o) => parseFloat(Math.max(0.05, o - 0.1).toFixed(2)))}
                className="bg-black border border-[#8C6D4F]/40 px-2.5 py-1 rounded text-xs hover:border-[#D4AF37] font-semibold"
              >
                -10%
              </button>
              <button
                type="button"
                onClick={() => setOpacity((o) => parseFloat(Math.max(0.05, o - 0.05).toFixed(2)))}
                className="bg-black border border-[#8C6D4F]/40 px-2 py-1 rounded text-xs hover:border-[#D4AF37] text-amber-500 font-semibold"
              >
                -5%
              </button>
              <span className="flex-1 text-center font-mono font-bold text-[#39FF6A] text-xs">
                {(opacity * 100).toFixed(0)}%
              </span>
              <button
                type="button"
                onClick={() => setOpacity((o) => parseFloat(Math.min(1.0, o + 0.05).toFixed(2)))}
                className="bg-black border border-[#8C6D4F]/40 px-2 py-1 rounded text-xs hover:border-[#D4AF37] text-amber-500 font-semibold"
              >
                +5%
              </button>
              <button
                type="button"
                onClick={() => setOpacity((o) => parseFloat(Math.min(1.0, o + 0.1).toFixed(2)))}
                className="bg-black border border-[#8C6D4F]/40 px-2.5 py-1 rounded text-xs hover:border-[#D4AF37] font-semibold"
              >
                +10%
              </button>
            </div>
          </div>
        )}

        {/* POZİSYON AYARLARI (Sadece Işıklar kapalıyken ayar için görünür) */}
        {!lightsOn && (
          <div className="flex flex-col gap-3 border-t border-[#8C6D4F]/20 pt-3">
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
              Yön Ayarları (Position)
            </span>

            {/* Shift X */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[#A8988B] font-mono">Yatay Kaydırma (X)</span>
              <div className="flex items-center gap-1.5 justify-between bg-black/40 p-1.5 border border-[#8C6D4F]/20 rounded">
                <button
                  type="button"
                  onClick={() => setOffsetX((x) => parseFloat((x - 5).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/30 px-2 py-0.5 rounded text-xs hover:border-[#D4AF37] font-semibold"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => setOffsetX((x) => parseFloat((x - 1).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/30 px-1.5 py-0.5 rounded text-xs hover:border-[#D4AF37]"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => setOffsetX((x) => parseFloat((x - 0.1).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/30 px-1.5 py-0.5 rounded text-xs hover:border-[#D4AF37] text-amber-500 font-semibold"
                >
                  -0.1
                </button>
                
                <span className="flex-1 text-center font-mono font-bold text-[#39FF6A] text-xs">
                  {offsetX}px
                </span>
                
                <button
                  type="button"
                  onClick={() => setOffsetX((x) => parseFloat((x + 0.1).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/30 px-1.5 py-0.5 rounded text-xs hover:border-[#D4AF37] text-amber-500 font-semibold"
                >
                  +0.1
                </button>
                <button
                  type="button"
                  onClick={() => setOffsetX((x) => parseFloat((x + 1).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/30 px-1.5 py-0.5 rounded text-xs hover:border-[#D4AF37]"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => setOffsetX((x) => parseFloat((x + 5).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/30 px-2 py-0.5 rounded text-xs hover:border-[#D4AF37] font-semibold"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Shift Y */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[#A8988B] font-mono">Dikey Kaydırma (Y)</span>
              <div className="flex items-center gap-1.5 justify-between bg-black/40 p-1.5 border border-[#8C6D4F]/20 rounded">
                <button
                  type="button"
                  onClick={() => setOffsetY((y) => parseFloat((y - 5).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/30 px-2 py-0.5 rounded text-xs hover:border-[#D4AF37] font-semibold"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => setOffsetY((y) => parseFloat((y - 1).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/30 px-1.5 py-0.5 rounded text-xs hover:border-[#D4AF37]"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => setOffsetY((y) => parseFloat((y - 0.1).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/30 px-1.5 py-0.5 rounded text-xs hover:border-[#D4AF37] text-amber-500 font-semibold"
                >
                  -0.1
                </button>
                
                <span className="flex-1 text-center font-mono font-bold text-[#39FF6A] text-xs">
                  {offsetY}px
                </span>
                
                <button
                  type="button"
                  onClick={() => setOffsetY((y) => parseFloat((y + 0.1).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/30 px-1.5 py-0.5 rounded text-xs hover:border-[#D4AF37] text-amber-500 font-semibold"
                >
                  +0.1
                </button>
                <button
                  type="button"
                  onClick={() => setOffsetY((y) => parseFloat((y + 1).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/30 px-1.5 py-0.5 rounded text-xs hover:border-[#D4AF37]"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => setOffsetY((y) => parseFloat((y + 5).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/30 px-2 py-0.5 rounded text-xs hover:border-[#D4AF37] font-semibold"
                >
                  +5
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ESNETME / ÖLÇEK AYARLARI (Sadece Işıklar kapalıyken ayar için görünür) */}
        {!lightsOn && (
          <div className="flex flex-col gap-3 border-t border-[#8C6D4F]/20 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                Esnetme Ayarları (Scale)
              </span>
              <label className="flex items-center gap-1 cursor-pointer text-[9px] text-amber-500">
                <input
                  type="checkbox"
                  checked={linkScales}
                  onChange={(e) => setLinkScales(e.target.checked)}
                  className="accent-[#D4AF37]"
                />
                <span>ZİNCİRLE</span>
              </label>
            </div>

            {/* Scale X */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[#A8988B] font-mono">Enine Genişlik (Scale X)</span>
              <div className="flex items-center gap-1.5 justify-between bg-black/40 p-1.5 border border-[#8C6D4F]/20 rounded">
                <button
                  type="button"
                  onClick={() => changeScaleX(-0.005)}
                  className="bg-black border border-[#8C6D4F]/30 px-2 py-0.5 rounded text-[10px] hover:border-[#D4AF37] font-semibold"
                >
                  -5k
                </button>
                <button
                  type="button"
                  onClick={() => changeScaleX(-0.001)}
                  className="bg-black border border-[#8C6D4F]/30 px-1.5 py-0.5 rounded text-[10px] hover:border-[#D4AF37]"
                >
                  -1k
                </button>
                <button
                  type="button"
                  onClick={() => changeScaleX(-0.0001)}
                  className="bg-black border border-[#8C6D4F]/30 px-1.5 py-0.5 rounded text-[10px] hover:border-[#D4AF37] text-amber-500 font-semibold"
                >
                  -0.1k
                </button>
                
                <span className="flex-1 text-center font-mono font-bold text-[#39FF6A] text-[11px] min-w-[65px]">
                  {scaleX.toFixed(5)}
                </span>
                
                <button
                  type="button"
                  onClick={() => changeScaleX(0.0001)}
                  className="bg-black border border-[#8C6D4F]/30 px-1.5 py-0.5 rounded text-[10px] hover:border-[#D4AF37] text-amber-500 font-semibold"
                >
                  +0.1k
                </button>
                <button
                  type="button"
                  onClick={() => changeScaleX(0.001)}
                  className="bg-black border border-[#8C6D4F]/30 px-1.5 py-0.5 rounded text-[10px] hover:border-[#D4AF37]"
                >
                  +1k
                </button>
                <button
                  type="button"
                  onClick={() => changeScaleX(0.005)}
                  className="bg-black border border-[#8C6D4F]/30 px-2 py-0.5 rounded text-[10px] hover:border-[#D4AF37] font-semibold"
                >
                  +5k
                </button>
              </div>
            </div>

            {/* Scale Y */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[#A8988B] font-mono">Boyuna Yükseklik (Scale Y)</span>
              <div className="flex items-center gap-1.5 justify-between bg-black/40 p-1.5 border border-[#8C6D4F]/20 rounded">
                <button
                  type="button"
                  onClick={() => changeScaleY(-0.005)}
                  className="bg-black border border-[#8C6D4F]/30 px-2 py-0.5 rounded text-[10px] hover:border-[#D4AF37] font-semibold"
                >
                  -5k
                </button>
                <button
                  type="button"
                  onClick={() => changeScaleY(-0.001)}
                  className="bg-black border border-[#8C6D4F]/30 px-1.5 py-0.5 rounded text-[10px] hover:border-[#D4AF37]"
                >
                  -1k
                </button>
                <button
                  type="button"
                  onClick={() => changeScaleY(-0.0001)}
                  className="bg-black border border-[#8C6D4F]/30 px-1.5 py-0.5 rounded text-[10px] hover:border-[#D4AF37] text-amber-500 font-semibold"
                >
                  -0.1k
                </button>
                
                <span className="flex-1 text-center font-mono font-bold text-[#39FF6A] text-[11px] min-w-[65px]">
                  {scaleY.toFixed(5)}
                </span>
                
                <button
                  type="button"
                  onClick={() => changeScaleY(0.0001)}
                  className="bg-black border border-[#8C6D4F]/30 px-1.5 py-0.5 rounded text-[10px] hover:border-[#D4AF37] text-amber-500 font-semibold"
                >
                  +0.1k
                </button>
                <button
                  type="button"
                  onClick={() => changeScaleY(0.001)}
                  className="bg-black border border-[#8C6D4F]/30 px-1.5 py-0.5 rounded text-[10px] hover:border-[#D4AF37]"
                >
                  +1k
                </button>
                <button
                  type="button"
                  onClick={() => changeScaleY(0.005)}
                  className="bg-black border border-[#8C6D4F]/30 px-2 py-0.5 rounded text-[10px] hover:border-[#D4AF37] font-semibold"
                >
                  +5k
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ALINACAK KOD VE SIFIRLA */}
        <div className="flex flex-col gap-2 border-t border-[#8C6D4F]/20 pt-3">
          <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-semibold">
            Kopyalanacak Hizalama Kodunuz
          </span>
          <pre className="bg-black/60 border border-[#8C6D4F]/20 p-2.5 rounded text-[11px] text-[#39FF6A] select-all font-mono break-all leading-tight">
            {`offsetX: ${offsetX}, offsetY: ${offsetY}, scaleX: ${scaleX}, scaleY: ${scaleY}`}
          </pre>
          <button
            type="button"
            onClick={() => {
              setOffsetX(-1.0);
              setOffsetY(7.0);
              setScaleX(1.0045);
              setScaleY(1.0045);
            }}
            className="w-full border border-[#8C6D4F]/50 py-1.5 text-xs rounded hover:border-[#D4AF37] active:bg-white/5 transition-all text-[#EAD8C7]"
          >
            Sıfırla (Başlangıç)
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCalibrate;
