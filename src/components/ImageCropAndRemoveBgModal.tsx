import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Check, Crop, Wand2, RotateCw, RefreshCw, Sliders, 
  FlipHorizontal, Eye, Image as ImageIcon, Sparkles, Scissors, Layers 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onApply: (newImageDataUrl: string) => void;
  isAr?: boolean;
}

export const ImageCropAndRemoveBgModal: React.FC<Props> = ({
  isOpen,
  onClose,
  imageUrl,
  onApply,
  isAr = true,
}) => {
  const [activeTab, setActiveTab] = useState<'crop' | 'bg_remove' | 'adjust'>('crop');
  const [workingImage, setWorkingImage] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<string>('');

  // Crop Box state in percentage relative to image dimensions (0 to 100)
  const [cropBox, setCropBox] = useState({ top: 10, left: 10, width: 80, height: 80 });
  const [aspectRatio, setAspectRatio] = useState<'free' | '1:1' | '4:3' | '16:9' | '3:4'>('free');

  // Background Removal options
  const [bgTolerance, setBgTolerance] = useState<number>(30); // 10% to 60%
  const [removeMode, setRemoveMode] = useState<'outer_edges' | 'all_white'>('outer_edges');
  const [isProcessingBg, setIsProcessingBg] = useState<boolean>(false);

  // Rotation & Adjustment
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  // Dragging Crop Handles
  const [draggingHandle, setDraggingHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; box: typeof cropBox }>({
    x: 0, y: 0, box: { top: 10, left: 10, width: 80, height: 80 }
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (isOpen && imageUrl) {
      setOriginalImage(imageUrl);
      setWorkingImage(imageUrl);
      setCropBox({ top: 5, left: 5, width: 90, height: 90 });
      setRotationAngle(0);
      setBrightness(100);
      setContrast(100);
    }
  }, [isOpen, imageUrl]);

  if (!isOpen || !workingImage) return null;

  // Handle Crop handle dragging relative to the actual rendered image dimensions
  const handleMouseDown = (handle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingHandle(handle);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      box: { ...cropBox }
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingHandle || !imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dxPercent = ((e.clientX - dragStart.x) / rect.width) * 100;
    const dyPercent = ((e.clientY - dragStart.y) / rect.height) * 100;

    let { top, left, width, height } = dragStart.box;

    if (draggingHandle === 'move') {
      top = Math.max(0, Math.min(100 - height, top + dyPercent));
      left = Math.max(0, Math.min(100 - width, left + dxPercent));
    } else {
      if (draggingHandle.includes('n')) {
        const newTop = Math.max(0, Math.min(top + height - 5, top + dyPercent));
        height = height + (top - newTop);
        top = newTop;
      }
      if (draggingHandle.includes('s')) {
        height = Math.max(5, Math.min(100 - top, height + dyPercent));
      }
      if (draggingHandle.includes('w')) {
        const newLeft = Math.max(0, Math.min(left + width - 5, left + dxPercent));
        width = width + (left - newLeft);
        left = newLeft;
      }
      if (draggingHandle.includes('e')) {
        width = Math.max(5, Math.min(100 - left, width + dxPercent));
      }
    }

    setCropBox({ top, left, width, height });
  };

  const handleMouseUp = () => {
    setDraggingHandle(null);
  };

  // Perform Crop on Canvas
  const handleApplyCrop = () => {
    const img = new Image();
    if (workingImage.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const sourceX = Math.max(0, Math.floor((cropBox.left / 100) * img.naturalWidth));
        const sourceY = Math.max(0, Math.floor((cropBox.top / 100) * img.naturalHeight));
        const sourceW = Math.min(img.naturalWidth - sourceX, Math.floor((cropBox.width / 100) * img.naturalWidth));
        const sourceH = Math.min(img.naturalHeight - sourceY, Math.floor((cropBox.height / 100) * img.naturalHeight));

        canvas.width = Math.max(1, sourceW);
        canvas.height = Math.max(1, sourceH);

        ctx.drawImage(
          img,
          sourceX, sourceY, sourceW, sourceH,
          0, 0, canvas.width, canvas.height
        );

        const croppedUrl = canvas.toDataURL('image/png');
        setWorkingImage(croppedUrl);
        setCropBox({ top: 2, left: 2, width: 96, height: 96 });
      } catch (err) {
        console.error('Crop failed:', err);
      }
    };
    img.onerror = (e) => console.error('Image load failed for crop', e);
    img.src = workingImage;
  };

  // Perform Background Removal (White / Light Colors to Transparent PNG)
  const handleRemoveBackground = () => {
    setIsProcessingBg(true);
    setTimeout(() => {
      const img = new Image();
      if (workingImage.startsWith('http')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setIsProcessingBg(false);
            return;
          }

          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;

          ctx.drawImage(img, 0, 0);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          const w = canvas.width;
          const h = canvas.height;

          // Threshold tolerance calculation (0-255)
          const threshold = 255 - (bgTolerance * 2.55);

          const isWhitePixel = (r: number, g: number, b: number, a: number) => {
            if (a === 0) return true;
            const minVal = Math.min(r, g, b);
            const maxDiff = Math.max(r, g, b) - Math.min(r, g, b);
            // High brightness and low color variance = white/light background
            return minVal >= threshold && maxDiff < (bgTolerance * 1.5 + 25);
          };

          if (removeMode === 'all_white') {
            // Turn all light/white pixels transparent
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const a = data[i + 3];
              if (isWhitePixel(r, g, b, a)) {
                data[i + 3] = 0; // Alpha transparent
              }
            }
          } else {
            // Flood Fill Outer Edge Background removal (preserves inner white details)
            const visited = new Uint8Array(w * h);
            const queue: number[] = [];

            const isWhite = (idx: number) => {
              const px = idx * 4;
              return isWhitePixel(data[px], data[px + 1], data[px + 2], data[px + 3]);
            };

            // Seed outer border pixels
            for (let x = 0; x < w; x++) {
              queue.push(x); // top edge
              queue.push((h - 1) * w + x); // bottom edge
            }
            for (let y = 0; y < h; y++) {
              queue.push(y * w); // left edge
              queue.push(y * w + (w - 1)); // right edge
            }

            while (queue.length > 0) {
              const idx = queue.pop()!;
              if (visited[idx]) continue;
              visited[idx] = 1;

              if (isWhite(idx)) {
                data[idx * 4 + 3] = 0; // Make transparent

                const x = idx % w;
                const y = Math.floor(idx / w);

                if (x > 0 && !visited[idx - 1]) queue.push(idx - 1);
                if (x < w - 1 && !visited[idx + 1]) queue.push(idx + 1);
                if (y > 0 && !visited[idx - w]) queue.push(idx - w);
                if (y < h - 1 && !visited[idx + w]) queue.push(idx + w);
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
          const resultPng = canvas.toDataURL('image/png');
          setWorkingImage(resultPng);
          setIsProcessingBg(false);
        } catch (err) {
          console.error('BG removal failed:', err);
          setIsProcessingBg(false);
        }
      };
      img.onerror = () => {
        setIsProcessingBg(false);
      };
      img.src = workingImage;
    }, 50);
  };

  // Perform Rotation
  const handleRotate = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      const rotatedUrl = canvas.toDataURL('image/png');
      setWorkingImage(rotatedUrl);
    };
    img.src = workingImage;
  };

  // Apply Brightness & Contrast
  const handleApplyAdjustments = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(img, 0, 0);

      const adjustedUrl = canvas.toDataURL('image/png');
      setWorkingImage(adjustedUrl);
    };
    img.src = workingImage;
  };

  // Save & Apply back to app
  const handleFinalSave = () => {
    onApply(workingImage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {isAr ? 'محرر قص وتعديل الصورة وإزالة الخلفية' : 'Image Crop & Background Removal Editor'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'قم بقص الصورة، إزالة الخلفية البيضاء، أو تعديل السطوع قبل الوضع بالصفحة' : 'Crop, make PNG transparent, and adjust image before placing on page'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
          
          {/* Main Interactive Canvas Area */}
          <div 
            className="md:col-span-8 bg-slate-950/90 p-6 flex flex-col items-center justify-center relative overflow-hidden select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Transparent Checkered Pattern Container */}
            <div 
              ref={containerRef}
              className="relative max-w-full max-h-[480px] flex items-center justify-center rounded-xl overflow-hidden shadow-2xl border border-white/10 p-2"
              style={{
                backgroundImage: 'radial-gradient(#ffffff 15%, transparent 15%), radial-gradient(#ffffff 15%, transparent 15%)',
                backgroundPosition: '0 0, 10px 10px',
                backgroundSize: '20px 20px',
                backgroundColor: '#1e293b'
              }}
            >
              <div className="relative inline-block max-w-full max-h-[460px]">
                <img
                  ref={imgRef}
                  src={workingImage}
                  alt="Image to edit"
                  className="max-w-full max-h-[460px] object-contain pointer-events-none select-none block"
                />

                {/* Crop Box Overlay */}
                {activeTab === 'crop' && (
                  <div
                    className="absolute border-2 border-brand-400 bg-brand-500/15 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] cursor-move z-30"
                    style={{
                      top: `${cropBox.top}%`,
                      left: `${cropBox.left}%`,
                      width: `${cropBox.width}%`,
                      height: `${cropBox.height}%`,
                    }}
                    onMouseDown={(e) => handleMouseDown('move', e)}
                  >
                    {/* Grid Lines inside crop box */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                      <div className="border-r border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-b border-white" />
                    </div>

                    {/* Handles (4 Corners + 4 Sides) */}
                    {/* Corners */}
                    <div onMouseDown={(e) => handleMouseDown('nw', e)} className="absolute -top-2 -left-2 w-4 h-4 bg-brand-400 border-2 border-white rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform" />
                    <div onMouseDown={(e) => handleMouseDown('ne', e)} className="absolute -top-2 -right-2 w-4 h-4 bg-brand-400 border-2 border-white rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform" />
                    <div onMouseDown={(e) => handleMouseDown('sw', e)} className="absolute -bottom-2 -left-2 w-4 h-4 bg-brand-400 border-2 border-white rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform" />
                    <div onMouseDown={(e) => handleMouseDown('se', e)} className="absolute -bottom-2 -right-2 w-4 h-4 bg-brand-400 border-2 border-white rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform" />

                    {/* Sides */}
                    <div onMouseDown={(e) => handleMouseDown('n', e)} className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-brand-400 border border-white rounded-full cursor-ns-resize shadow-md hover:scale-125 transition-transform" />
                    <div onMouseDown={(e) => handleMouseDown('s', e)} className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-brand-400 border border-white rounded-full cursor-ns-resize shadow-md hover:scale-125 transition-transform" />
                    <div onMouseDown={(e) => handleMouseDown('w', e)} className="absolute top-1/2 -left-2 -translate-y-1/2 w-3 h-8 bg-brand-400 border border-white rounded-full cursor-ew-resize shadow-md hover:scale-125 transition-transform" />
                    <div onMouseDown={(e) => handleMouseDown('e', e)} className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-8 bg-brand-400 border border-white rounded-full cursor-ew-resize shadow-md hover:scale-125 transition-transform" />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Canvas Helper hint */}
            <div className="mt-3 text-[11px] text-slate-400 font-bold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {activeTab === 'crop' && (isAr ? 'اسحب المقابض بقوة الفأرة لتحديد حدود قص الصورة.' : 'Drag handles to frame crop area.')}
              {activeTab === 'bg_remove' && (isAr ? 'يتم تحويل الخلفيات الفاتحة أو البيضاء إلى PNG شفاف.' : 'Bright backgrounds convert to transparent PNG.')}
              {activeTab === 'adjust' && (isAr ? 'عدّل التدوير والسطوع لتحسين جودة الطباعة.' : 'Adjust rotation and brightness.')}
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="md:col-span-4 bg-slate-50 p-5 border-r border-slate-200 flex flex-col justify-between space-y-4">
            
            {/* Navigation Tabs */}
            <div className="space-y-4">
              <div className="flex bg-slate-200/80 p-1 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('crop')}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'crop' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Crop className="w-4 h-4" />
                  {isAr ? 'قص وتحديد' : 'Crop'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('bg_remove')}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'bg_remove' ? 'bg-white text-purple-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wand2 className="w-4 h-4" />
                  {isAr ? 'إزالة الخلفية' : 'Remove BG'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('adjust')}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'adjust' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  {isAr ? 'تعديل' : 'Adjust'}
                </button>
              </div>

              {/* Tab 1: Crop Controls */}
              {activeTab === 'crop' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      {isAr ? 'نسب القص الجاهزة (Presets):' : 'Aspect Ratio Presets:'}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'free', labelAr: 'حر (Free)', labelEn: 'Free' },
                        { id: '1:1', labelAr: 'مربع (1:1)', labelEn: '1:1 Square' },
                        { id: '4:3', labelAr: '4:3 افقي', labelEn: '4:3 Landscape' },
                        { id: '3:4', labelAr: '3:4 طولي', labelEn: '3:4 Portrait' },
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setAspectRatio(preset.id as any);
                            if (preset.id === '1:1') setCropBox({ top: 10, left: 10, width: 80, height: 80 });
                            if (preset.id === '4:3') setCropBox({ top: 15, left: 5, width: 90, height: 67.5 });
                            if (preset.id === '3:4') setCropBox({ top: 5, left: 15, width: 70, height: 90 });
                            if (preset.id === 'free') setCropBox({ top: 5, left: 5, width: 90, height: 90 });
                          }}
                          className={`py-2 px-2 text-xs font-bold rounded-xl border transition ${
                            aspectRatio === preset.id
                              ? 'bg-brand-500 text-white border-brand-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isAr ? preset.labelAr : preset.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyCrop}
                    className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <Scissors className="w-4 h-4" />
                    {isAr ? 'تطبيق قص الجزء المحدد الآن' : 'Apply Selected Crop Area'}
                  </button>
                </div>
              )}

              {/* Tab 2: Remove Background Controls */}
              {activeTab === 'bg_remove' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-purple-50/80 border border-purple-200 p-3 rounded-2xl text-right text-xs text-purple-900 space-y-1.5">
                    <div className="font-extrabold flex items-center gap-1.5 text-purple-700">
                      <Wand2 className="w-4 h-4 text-purple-600" />
                      {isAr ? 'إزالة الخلفية إلى PNG شفاف:' : 'Make Transparent PNG:'}
                    </div>
                    <p className="text-[11px] leading-relaxed text-purple-800">
                      {isAr 
                        ? 'تتيح لك هذه الأداة تفريغ الخلفيات البيضاء أو الفاتحة ليصبح العنصر شفافاً تماماً ويندمج مع كراسة التلوين.'
                        : 'Converts white or light solid backgrounds into transparent PNG for clean embedding.'}
                    </p>
                  </div>

                  {/* Mode Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {isAr ? 'نطاق إزالة الخلفية:' : 'Removal Scope:'}
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setRemoveMode('outer_edges')}
                        className={`p-2.5 text-xs font-bold rounded-xl border text-right transition flex items-center justify-between ${
                          removeMode === 'outer_edges'
                            ? 'bg-purple-600 text-white border-purple-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{isAr ? 'تفريغ الخلفية الخارجية فقط (حماية التفاصيل الداخلية)' : 'Outer Edge BG Only (Protect Inner Details)'}</span>
                        <Check className={`w-4 h-4 ${removeMode === 'outer_edges' ? 'opacity-100' : 'opacity-0'}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setRemoveMode('all_white')}
                        className={`p-2.5 text-xs font-bold rounded-xl border text-right transition flex items-center justify-between ${
                          removeMode === 'all_white'
                            ? 'bg-purple-600 text-white border-purple-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{isAr ? 'تفريغ كل المساحات البيضاء بالكامل' : 'All White Pixels Everywhere'}</span>
                        <Check className={`w-4 h-4 ${removeMode === 'all_white' ? 'opacity-100' : 'opacity-0'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Sensitivity Tolerance Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded text-[11px]">{bgTolerance}%</span>
                      <span>{isAr ? 'حساسية درجة اللون الأبيض:' : 'Whiteness Tolerance:'}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={bgTolerance}
                      onChange={(e) => setBgTolerance(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isProcessingBg}
                    onClick={handleRemoveBackground}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-md"
                  >
                    {isProcessingBg ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {isAr ? 'بدء إزالة الخلفية وتحويل إلى PNG' : 'Remove Background Now'}
                  </button>
                </div>
              )}

              {/* Tab 3: Adjustments */}
              {activeTab === 'adjust' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleRotate}
                      className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 text-slate-700"
                    >
                      <RotateCw className="w-4 h-4 text-brand-500" />
                      {isAr ? 'تدوير 90°' : 'Rotate 90°'}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="font-mono">{brightness}%</span>
                      <span>{isAr ? 'السطوع (Brightness):' : 'Brightness:'}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-brand-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="font-mono">{contrast}%</span>
                      <span>{isAr ? 'التباين (Contrast):' : 'Contrast:'}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-brand-500 cursor-pointer"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyAdjustments}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-2xl transition flex items-center justify-center gap-2"
                  >
                    <Sliders className="w-4 h-4" />
                    {isAr ? 'تطبيق السطوع والتباين' : 'Apply Adjustments'}
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => setWorkingImage(originalImage)}
                className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {isAr ? 'إعادة الصورة لحالتها الأصلية' : 'Reset to Original Image'}
              </button>

              <button
                type="button"
                onClick={handleFinalSave}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Check className="w-5 h-5" />
                {isAr ? 'اعتماد الصورة وتطبيقها في الصفحة' : 'Save & Place on Page'}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
