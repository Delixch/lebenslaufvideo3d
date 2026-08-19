import React, { useState, useRef, useEffect } from 'react';

export const TestCalibrate: React.FC = () => {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [opacity, setOpacity] = useState(0.5);

  const containerRef = useRef<HTMLDivElement>(null);

  // Dragging states
  const [isDraggingMove, setIsDraggingMove] = useState(false);
  const [isDraggingScale, setIsDraggingScale] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offsetStart, setOffsetStart] = useState({ x: 0, y: 0 });
  const [scaleStart, setScaleStart] = useState(1);
  const [scaleStartDistance, setScaleStartDistance] = useState(1);

  // Global mouse listeners for smooth dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDraggingMove) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        setOffsetX(parseFloat((offsetStart.x + dx).toFixed(1)));
        setOffsetY(parseFloat((offsetStart.y + dy).toFixed(1)));
      }

      if (isDraggingScale && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const startDist = scaleStartDistance || 1;
        const currentDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
        const newScale = scaleStart * (currentDist / startDist);
        setScale(parseFloat(Math.max(0.5, Math.min(2.0, newScale)).toFixed(4)));
      }
    };

    const handlePointerUp = () => {
      setIsDraggingMove(false);
      setIsDraggingScale(false);
    };

    if (isDraggingMove || isDraggingScale) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingMove, isDraggingScale, dragStart, offsetStart, scaleStart, scaleStartDistance]);

  const startMoveDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingMove(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setOffsetStart({ x: offsetX, y: offsetY });
  };

  const startScaleDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    setIsDraggingScale(true);
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
    setScaleStartDistance(dist);
    setScaleStart(scale);
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#EAD8C7] font-sans flex flex-col items-center justify-center p-8 select-none overflow-auto">
      <div className="mb-6 text-center max-w-xl">
        <h2 className="text-xl font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
          Görsel Hizalama Kalibratörü
        </h2>
        <p className="text-xs text-[#A8988B] leading-relaxed">
          Işıklı fare görselini (üstteki şeffaf katman), ışıksız fare görselinin üzerine tam oturtun. 
          Görseli taşımak için <strong>ortadaki yeşil daireyi</strong>, boyutlandırmak (ölçeklemek) için ise <strong>sağ alt köşedeki yeşil daireyi</strong> sürükleyin.
        </p>
      </div>

      {/* 2. ETKİLEŞİMLİ GÖRSEL ALANI */}
      <div 
        ref={containerRef}
        className="relative w-[92vw] max-w-[1200px] border border-[#8C6D4F]/30 bg-black shadow-2xl rounded"
      >
        {/* Alt Katman: Işıksız Arka Plan */}
        <img
          src="/ipad-buehne.png"
          alt="Base"
          className="block w-full h-auto pointer-events-none select-none opacity-80"
        />

        {/* Üst Katman: Işıklı Arka Plan (Kaydırılabilir & Boyutlandırılabilir) */}
        <img
          src="/ipad-buehne-on.png"
          alt="Overlay"
          className="absolute left-0 top-0 w-full h-auto pointer-events-none select-none"
          style={{
            opacity: opacity,
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
            transformOrigin: '50% 50%',
            mixBlendMode: 'normal'
          }}
        />

        {/* YEŞİL DAİRE 1: Taşıma Kolu (Merkezde) */}
        <div
          onPointerDown={startMoveDrag}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex h-14 w-14 cursor-move items-center justify-center rounded-full border-2 border-white bg-[#39FF6A] text-[10px] font-bold text-black shadow-[0_0_20px_rgba(57,255,106,0.8)] transition-transform hover:scale-110 active:scale-95"
          title="Sürükleyerek Taşı"
        >
          TAŞI
        </div>

        {/* YEŞİL DAİRE 2: Boyutlandırma Kolu (Sağ Altta) */}
        <div
          onPointerDown={startScaleDrag}
          className="absolute right-4 bottom-4 z-50 flex h-14 w-14 cursor-se-resize items-center justify-center rounded-full border-2 border-white bg-[#39FF6A] text-[10px] font-bold text-black shadow-[0_0_20px_rgba(57,255,106,0.8)] transition-transform hover:scale-110 active:scale-95"
          title="Sürükleyerek Boyutlandır"
        >
          BOYUT
        </div>
      </div>

      {/* 3. KONTROL PANELİ */}
      <div className="mt-8 flex flex-col md:flex-row gap-6 items-center justify-between border border-[#8C6D4F]/40 bg-[#0A0908]/95 p-6 rounded shadow-xl w-full max-w-[800px]">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
            Canlı Değerler
          </span>
          <pre className="bg-black/60 border border-[#8C6D4F]/20 p-3 rounded text-sm text-[#39FF6A] select-all font-mono">
            {`offsetX: ${offsetX},
offsetY: ${offsetY},
scale: ${scale}`}
          </pre>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A8988B]">Şeffaflık:</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-24 accent-[#D4AF37]"
            />
            <span className="text-xs text-white">{(opacity * 100).toFixed(0)}%</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setOffsetX(0);
                setOffsetY(0);
                setScale(1.0);
              }}
              className="border border-[#8C6D4F]/50 px-3 py-1.5 text-xs rounded hover:border-[#D4AF37] active:bg-white/5 transition-all"
            >
              Sıfırla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCalibrate;
