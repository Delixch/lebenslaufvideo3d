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
      <div className="mt-8 flex flex-col gap-6 border border-[#8C6D4F]/40 bg-[#0A0908]/95 p-6 rounded shadow-xl w-full max-w-[900px]">
        
        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Sol Kolon */}
          <div className="flex flex-col gap-4">
            {/* Shift X (Sola/Sağa) */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#A8988B]">Yatay Kaydırma (Shift X)</span>
                <span className="text-[#39FF6A] font-mono">{offsetX}px</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOffsetX((x) => parseFloat((x - 0.5).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/35 px-2 py-0.5 rounded text-xs hover:border-[#D4AF37]"
                >
                  -0.5
                </button>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="0.5"
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseFloat(e.target.value))}
                  className="flex-1 accent-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={() => setOffsetX((x) => parseFloat((x + 0.5).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/35 px-2 py-0.5 rounded text-xs hover:border-[#D4AF37]"
                >
                  +0.5
                </button>
              </div>
            </div>

            {/* Shift Y (Yukarı/Aşağı) */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#A8988B]">Dikey Kaydırma (Shift Y)</span>
                <span className="text-[#39FF6A] font-mono">{offsetY}px</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOffsetY((y) => parseFloat((y - 0.5).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/35 px-2 py-0.5 rounded text-xs hover:border-[#D4AF37]"
                >
                  -0.5
                </button>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="0.5"
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseFloat(e.target.value))}
                  className="flex-1 accent-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={() => setOffsetY((y) => parseFloat((y + 0.5).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/35 px-2 py-0.5 rounded text-xs hover:border-[#D4AF37]"
                >
                  +0.5
                </button>
              </div>
            </div>
          </div>

          {/* Sağ Kolon */}
          <div className="flex flex-col gap-4">
            {/* Scale (Boyutlandırma) */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#A8988B]">Resim Boyutu (Scale)</span>
                <span className="text-[#39FF6A] font-mono">{scale.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setScale((s) => parseFloat((s - 0.001).toFixed(4)))}
                  className="bg-black border border-[#8C6D4F]/35 px-2 py-0.5 rounded text-xs hover:border-[#D4AF37]"
                >
                  -0.001
                </button>
                <input
                  type="range"
                  min="0.80"
                  max="1.20"
                  step="0.0005"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="flex-1 accent-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={() => setScale((s) => parseFloat((s + 0.001).toFixed(4)))}
                  className="bg-black border border-[#8C6D4F]/35 px-2 py-0.5 rounded text-xs hover:border-[#D4AF37]"
                >
                  +0.001
                </button>
              </div>
            </div>

            {/* Şeffaflık (Opacity) */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#A8988B]">Üst Katman Şeffaflığı (Opacity)</span>
                <span className="text-[#39FF6A] font-mono">{(opacity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Alt Satır: Değer Çıktısı ve Reset */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t border-[#8C6D4F]/20 pt-4 mt-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
              Kopyalanacak Kod Değerleri
            </span>
            <pre className="bg-black/60 border border-[#8C6D4F]/20 px-4 py-2 rounded text-sm text-[#39FF6A] select-all font-mono">
              {`offsetX: ${offsetX}, offsetY: ${offsetY}, scale: ${scale}`}
            </pre>
          </div>

          <button
            type="button"
            onClick={() => {
              setOffsetX(0);
              setOffsetY(0);
              setScale(1.0);
            }}
            className="border border-[#8C6D4F]/50 px-4 py-2 text-xs rounded hover:border-[#D4AF37] active:bg-white/5 transition-all text-[#EAD8C7]"
          >
            Tüm Değerleri Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCalibrate;
