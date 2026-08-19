import React, { useState, useRef, useEffect } from 'react';

export const TestCalibrate: React.FC = () => {
  // Start with user's last calibrated values
  const [offsetX, setOffsetX] = useState(-1.0);
  const [offsetY, setOffsetY] = useState(7.0);
  const [scaleX, setScaleX] = useState(1.0045);
  const [scaleY, setScaleY] = useState(1.0045);
  const [linkScales, setLinkScales] = useState(false);
  const [opacity, setOpacity] = useState(0.5);

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

      if (isDraggingMove) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        setOffsetX(parseFloat((offsetStart.x + dx).toFixed(1)));
        setOffsetY(parseFloat((offsetStart.y + dy).toFixed(1)));
      }

      if (isDraggingScaleX) {
        const startDist = scaleXStartDistance || 1;
        const currentDist = Math.abs(e.clientX - centerX);
        const newScaleX = scaleXStart * (currentDist / startDist);
        const finalScaleX = parseFloat(Math.max(0.5, Math.min(2.0, newScaleX)).toFixed(5));
        setScaleX(finalScaleX);
        if (linkScales) {
          setScaleY(finalScaleX);
        }
      }

      if (isDraggingScaleY) {
        const startDist = scaleYStartDistance || 1;
        const currentDist = Math.abs(e.clientY - centerY);
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
    const dist = Math.abs(e.clientX - centerX);
    setScaleXStartDistance(dist);
    setScaleXStart(scaleX);
  };

  const startScaleYDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    setIsDraggingScaleY(true);
    const rect = containerRef.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const dist = Math.abs(e.clientY - centerY);
    setScaleYStartDistance(dist);
    setScaleYStart(scaleY);
  };

  // Helper helper to update scaleX/scaleY with optional link
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

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#EAD8C7] font-sans flex flex-col items-center justify-center p-8 select-none overflow-auto">
      <div className="mb-6 text-center max-w-xl">
        <h2 className="text-xl font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
          Gelişmiş Görsel Esnetme & Hizalama
        </h2>
        <p className="text-xs text-[#A8988B] leading-relaxed">
          Işıklı resmi tam oturtmak için yeşil daireleri sürükleyin veya aşağıdaki hassas yön butonlarını tıklayın.
          Genişlik (Scale X) ve Yükseklik (Scale Y) oranlarını bağımsız esnetebilirsiniz.
        </p>
      </div>

      {/* 2. ETKİLEŞİMLİ GÖRSEL ALANI */}
      <div 
        ref={containerRef}
        className="relative w-[92vw] max-w-[1200px] border border-[#8C6D4F]/30 bg-black shadow-2xl rounded"
      >
        {/* Alt Katman: Işıksız Arka Plan */}
        <img
          src="/ipad-buehne.png?v=3"
          alt="Base"
          className="block w-full h-auto pointer-events-none select-none opacity-80"
        />

        {/* Üst Katman: Işıklı Arka Plan (Esnetilebilir) */}
        <img
          src="/ipad-buehne-on.png?v=3"
          alt="Overlay"
          className="absolute left-0 top-0 w-full h-auto pointer-events-none select-none"
          style={{
            opacity: opacity,
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${scaleX}, ${scaleY})`,
            transformOrigin: '50% 50%',
            mixBlendMode: 'normal'
          }}
        />

        {/* YEŞİL DAİRE 1: Taşıma Kolu (Merkezde) */}
        <div
          onPointerDown={startMoveDrag}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex h-14 w-14 cursor-move items-center justify-center rounded-full border-2 border-white bg-[#39FF6A] text-[9px] font-bold text-black shadow-[0_0_20px_rgba(57,255,106,0.8)] transition-transform hover:scale-110 active:scale-95"
          title="Sürükleyerek Taşı"
        >
          TAŞI (X/Y)
        </div>

        {/* YEŞİL DAİRE 2: Genişlik Esnetme Kolu (Sağ Kenar Ortada) */}
        <div
          onPointerDown={startScaleXDrag}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-50 flex h-14 w-14 cursor-ew-resize items-center justify-center rounded-full border-2 border-white bg-[#39FF6A] text-[9px] font-bold text-black shadow-[0_0_20px_rgba(57,255,106,0.8)] transition-transform hover:scale-110 active:scale-95"
          title="Yatay Esnet (Scale X)"
        >
          EN (X)
        </div>

        {/* YEŞİL DAİRE 3: Yükseklik Esnetme Kolu (Alt Kenar Ortada) */}
        <div
          onPointerDown={startScaleYDrag}
          className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-50 flex h-14 w-14 cursor-ns-resize items-center justify-center rounded-full border-2 border-white bg-[#39FF6A] text-[9px] font-bold text-black shadow-[0_0_20px_rgba(57,255,106,0.8)] transition-transform hover:scale-110 active:scale-95"
          title="Dikey Esnet (Scale Y)"
        >
          BOY (Y)
        </div>
      </div>

      {/* 3. KONTROL PANELİ */}
      <div className="mt-12 flex flex-col gap-6 border border-[#8C6D4F]/40 bg-[#0A0908]/95 p-6 rounded shadow-xl w-full max-w-[950px]">
        
        {/* Sliders & Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
          {/* Sol Kolon: Pozisyon (Shift X & Y) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold border-b border-[#8C6D4F]/20 pb-1">
              Pozisyon İnce Ayarı (Translation)
            </h3>

            {/* Shift X */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#A8988B]">Yatay Kaydırma (Shift X)</span>
                <span className="text-[#39FF6A]">{offsetX}px</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOffsetX((x) => parseFloat((x - 1).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/35 px-2 py-1 rounded text-[11px] hover:border-[#D4AF37]"
                >
                  -1
                </button>
                <button
                  onClick={() => setOffsetX((x) => parseFloat((x - 0.1).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/35 px-2 py-1 rounded text-[11px] hover:border-[#D4AF37] text-amber-500"
                >
                  -0.1
                </button>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="0.1"
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseFloat(e.target.value))}
                  className="flex-1 mx-2 accent-[#D4AF37]"
                />
                <button
                  onClick={() => setOffsetX((x) => parseFloat((x + 0.1).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/35 px-2 py-1 rounded text-[11px] hover:border-[#D4AF37] text-amber-500"
                >
                  +0.1
                </button>
                <button
                  onClick={() => setOffsetX((x) => parseFloat((x + 1).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/35 px-2 py-1 rounded text-[11px] hover:border-[#D4AF37]"
                >
                  +1
                </button>
              </div>
            </div>

            {/* Shift Y */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#A8988B]">Dikey Kaydırma (Shift Y)</span>
                <span className="text-[#39FF6A]">{offsetY}px</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOffsetY((y) => parseFloat((y - 1).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/35 px-2 py-1 rounded text-[11px] hover:border-[#D4AF37]"
                >
                  -1
                </button>
                <button
                  onClick={() => setOffsetY((y) => parseFloat((y - 0.1).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/35 px-2 py-1 rounded text-[11px] hover:border-[#D4AF37] text-amber-500"
                >
                  -0.1
                </button>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="0.1"
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseFloat(e.target.value))}
                  className="flex-1 mx-2 accent-[#D4AF37]"
                />
                <button
                  onClick={() => setOffsetY((y) => parseFloat((y + 0.1).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/35 px-2 py-1 rounded text-[11px] hover:border-[#D4AF37] text-amber-500"
                >
                  +0.1
                </button>
                <button
                  onClick={() => setOffsetY((y) => parseFloat((y + 1).toFixed(1)))}
                  className="bg-black border border-[#8C6D4F]/35 px-2 py-1 rounded text-[11px] hover:border-[#D4AF37]"
                >
                  +1
                </button>
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Boyut / Esnetme (Scale X & Y) */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#8C6D4F]/20 pb-1">
              <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                Esnetme ve Ölçek Ayarı (Scale)
              </h3>
              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-amber-500">
                <input
                  type="checkbox"
                  checked={linkScales}
                  onChange={(e) => setLinkScales(e.target.checked)}
                  className="accent-[#D4AF37]"
                />
                <span>EN/BOY KİLİTLE</span>
              </label>
            </div>

            {/* Scale X */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#A8988B]">Yatay Genişlik (Scale X)</span>
                <span className="text-[#39FF6A]">{scaleX.toFixed(5)}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => changeScaleX(-0.005)}
                  className="bg-black border border-[#8C6D4F]/35 px-1.5 py-1 rounded text-[10px] hover:border-[#D4AF37]"
                >
                  -0.005
                </button>
                <button
                  onClick={() => changeScaleX(-0.0001)}
                  className="bg-black border border-[#8C6D4F]/35 px-1.5 py-1 rounded text-[10px] hover:border-[#D4AF37] text-amber-500 font-bold"
                >
                  -0.0001
                </button>
                <input
                  type="range"
                  min="0.80"
                  max="1.20"
                  step="0.0001"
                  value={scaleX}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setScaleX(val);
                    if (linkScales) setScaleY(val);
                  }}
                  className="flex-1 mx-2 accent-[#D4AF37]"
                />
                <button
                  onClick={() => changeScaleX(0.0001)}
                  className="bg-black border border-[#8C6D4F]/35 px-1.5 py-1 rounded text-[10px] hover:border-[#D4AF37] text-amber-500 font-bold"
                >
                  +0.0001
                </button>
                <button
                  onClick={() => changeScaleX(0.005)}
                  className="bg-black border border-[#8C6D4F]/35 px-1.5 py-1 rounded text-[10px] hover:border-[#D4AF37]"
                >
                  +0.005
                </button>
              </div>
            </div>

            {/* Scale Y */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#A8988B]">Dikey Yükseklik (Scale Y)</span>
                <span className="text-[#39FF6A]">{scaleY.toFixed(5)}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => changeScaleY(-0.005)}
                  className="bg-black border border-[#8C6D4F]/35 px-1.5 py-1 rounded text-[10px] hover:border-[#D4AF37]"
                >
                  -0.005
                </button>
                <button
                  onClick={() => changeScaleY(-0.0001)}
                  className="bg-black border border-[#8C6D4F]/35 px-1.5 py-1 rounded text-[10px] hover:border-[#D4AF37] text-amber-500 font-bold"
                >
                  -0.0001
                </button>
                <input
                  type="range"
                  min="0.80"
                  max="1.20"
                  step="0.0001"
                  value={scaleY}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setScaleY(val);
                    if (linkScales) setScaleX(val);
                  }}
                  className="flex-1 mx-2 accent-[#D4AF37]"
                />
                <button
                  onClick={() => changeScaleY(0.0001)}
                  className="bg-black border border-[#8C6D4F]/35 px-1.5 py-1 rounded text-[10px] hover:border-[#D4AF37] text-amber-500 font-bold"
                >
                  +0.0001
                </button>
                <button
                  onClick={() => changeScaleY(0.005)}
                  className="bg-black border border-[#8C6D4F]/35 px-1.5 py-1 rounded text-[10px] hover:border-[#D4AF37]"
                >
                  +0.005
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Satır: Şeffaflık, Değerler ve Reset */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-t border-[#8C6D4F]/20 pt-6 mt-2">
          
          {/* Şeffaflık (Opacity) */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#A8988B]">Üst Katman Şeffaflığı:</span>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-32 accent-[#D4AF37]"
            />
            <span className="text-xs text-[#39FF6A] font-mono">{(opacity * 100).toFixed(0)}%</span>
          </div>

          {/* Kopyalanacak Değer Çıktısı */}
          <div className="flex flex-col gap-1 items-center md:items-start">
            <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-semibold">
              Kopyalanacak Hizalama Değerleri
            </span>
            <pre className="bg-black/60 border border-[#8C6D4F]/20 px-4 py-2 rounded text-xs text-[#39FF6A] select-all font-mono">
              {`offsetX: ${offsetX}, offsetY: ${offsetY}, scaleX: ${scaleX}, scaleY: ${scaleY}`}
            </pre>
          </div>

          <button
            type="button"
            onClick={() => {
              setOffsetX(-1.0);
              setOffsetY(7.0);
              setScaleX(1.0045);
              setScaleY(1.0045);
            }}
            className="border border-[#8C6D4F]/50 px-4 py-2 text-xs rounded hover:border-[#D4AF37] active:bg-white/5 transition-all text-[#EAD8C7]"
          >
            Sıfırla (Başlangıç)
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCalibrate;
