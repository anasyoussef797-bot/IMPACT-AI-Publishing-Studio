import React, { useRef } from 'react';
import { Page, PageImageItem } from '../types';
import { 
  Type, AlignRight, AlignCenter, AlignLeft, AlignJustify, 
  Palette, Sliders, Image as ImageIcon, Plus, Trash2, Scissors, Move, ZoomIn 
} from 'lucide-react';

interface Props {
  page: Page;
  onChange: (updates: Partial<Page>) => void;
  isAr?: boolean;
}

export const TextPageEditor: React.FC<Props> = ({ page, onChange, isAr = true }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to handle image addition to page.pageImages
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const b64 = evt.target?.result as string;
      if (!b64) return;

      const currentImages = page.pageImages || [];
      const newImg: PageImageItem = {
        id: 'img_' + Date.now(),
        url: b64,
        scale: 100,
        scaleX: 100,
        scaleY: 100,
        offsetX: 0,
        offsetY: 0,
        widthCm: 12.0,
        heightCm: 10.0,
      };

      onChange({
        pageImages: [...currentImages, newImg],
        illustrationUrl: page.illustrationUrl || b64,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUpdateImage = (imgId: string, updates: Partial<PageImageItem>) => {
    const currentImages = page.pageImages || [];
    const updated = currentImages.map((item) =>
      item.id === imgId ? { ...item, ...updates } : item
    );
    onChange({ pageImages: updated });
  };

  const handleDeleteImage = (imgId: string) => {
    const currentImages = page.pageImages || [];
    const updated = currentImages.filter((item) => item.id !== imgId);
    onChange({ pageImages: updated });
  };

  const pageImages = page.pageImages || (page.illustrationUrl ? [{
    id: 'img_default',
    url: page.illustrationUrl,
    scale: page.imageScale || 100,
    scaleX: page.imageScaleX || 100,
    scaleY: page.imageScaleY || 100,
    offsetX: page.imageOffsetX || 0,
    offsetY: page.imageOffsetY || 0,
    widthCm: 14.0,
    heightCm: 12.0,
  }] : []);

  return (
    <div className="space-y-4 text-slate-800 text-xs dir-rtl" dir="rtl">
      
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 p-3 rounded-xl flex items-center justify-between shadow-2xs">
        <div>
          <h4 className="font-bold text-sky-900 text-xs flex items-center gap-1.5">
            <Type className="w-4 h-4 text-sky-600" />
            {isAr ? 'إعدادات وتنسيق الصفحة النصية (قصة / شرح / تعليمات)' : 'Text Page Settings & Formatting'}
          </h4>
          <p className="text-[10px] text-sky-700 mt-0.5">
            {isAr ? 'مرونة كاملة في التحكم بحجم ولون وتنسيق الخطوط وإضافة صور مقاسة بالسنتيمتر.' : 'Full control over text sizing, colors, line heights, and cm-measured images.'}
          </p>
        </div>
      </div>

      {/* 1. Title Settings */}
      <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-3 shadow-2xs">
        <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-brand-500" />
          {isAr ? 'عنوان الصفحة' : 'Page Title'}
        </label>
        <input 
          type="text" 
          value={page.title || ''} 
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-brand-500"
          placeholder={isAr ? 'عنوان الصفحة (مثال: قصة الأسد الأرنب)...' : 'Page Title...'}
        />

        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-slate-600">{isAr ? 'حجم الخط:' : 'Font Size:'}</span>
              <span className="text-[10px] text-brand-600 font-mono font-bold">{page.titleSize || 26}px</span>
            </div>
            <input 
              type="range" 
              min="14" 
              max="44" 
              value={page.titleSize || 26} 
              onChange={(e) => onChange({ titleSize: Number(e.target.value) })}
              className="w-full accent-brand-600 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">{isAr ? 'لون العنوان:' : 'Title Color:'}</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={page.titleColor || '#0f172a'} 
                onChange={(e) => onChange({ titleColor: e.target.value })}
                className="w-8 h-8 p-0.5 border border-slate-300 rounded cursor-pointer bg-white"
              />
              <span className="text-[10px] font-mono text-slate-500">{page.titleColor || '#0f172a'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Body Text Settings & Rich Typography */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-brand-500" />
            {isAr ? 'المحتوى النصي الرئيسي وتنسيق السطور' : 'Body Text & Line Formatting'}
          </label>
        </div>

        <textarea 
          rows={6}
          value={page.textContent || ''} 
          onChange={(e) => onChange({ textContent: e.target.value })}
          className="w-full p-2.5 border border-slate-300 rounded-lg text-xs leading-relaxed font-sans focus:ring-2 focus:ring-brand-500"
          placeholder={isAr ? 'اكتب المحتوى النصي للقصة أو الشرح هنا...' : 'Enter body text content here...'}
        />

        {/* Font Size Selector (Full Range 8px to 36px) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-700">{isAr ? 'حجم الخط الدقيق (8px - 36px):' : 'Font Size (8px - 36px):'}</span>
            <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
              {page.textSize || 14}px
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="8" 
              max="36" 
              value={page.textSize || 14} 
              onChange={(e) => onChange({ textSize: Number(e.target.value) })}
              className="w-full accent-brand-600 cursor-pointer"
            />
            <input 
              type="number"
              min="8"
              max="36"
              value={page.textSize || 14}
              onChange={(e) => onChange({ textSize: Math.max(8, Math.min(36, Number(e.target.value) || 14)) })}
              className="w-14 p-1 border border-slate-300 rounded text-center text-xs font-mono font-bold"
            />
          </div>

          <div className="flex items-center gap-1 flex-wrap pt-1">
            {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => onChange({ textSize: sz })}
                className={`px-2 py-1 text-[10px] font-bold rounded border transition ${
                  (page.textSize || 14) === sz 
                    ? 'bg-brand-600 text-white border-brand-600' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Line Height / Spacing (تباعد الأسطر) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-700">{isAr ? 'تباعد الأسطر (Line Spacing):' : 'Line Height:'}</span>
            <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
              {page.lineHeight || 1.6}x
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1">
            {[
              { val: 1.0, labelAr: '1.0مضغوط', labelEn: '1.0' },
              { val: 1.3, labelAr: '1.3عادي', labelEn: '1.3' },
              { val: 1.6, labelAr: '1.6مريح', labelEn: '1.6' },
              { val: 1.9, labelAr: '1.9واسع', labelEn: '1.9' },
              { val: 2.2, labelAr: '2.2تباعد', labelEn: '2.2' },
            ].map((lh) => (
              <button
                key={lh.val}
                type="button"
                onClick={() => onChange({ lineHeight: lh.val })}
                className={`py-1 px-1 text-center font-bold text-[10px] rounded border transition ${
                  (page.lineHeight || 1.6) === lh.val
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isAr ? lh.labelAr : lh.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Text Alignment (محاذاة النص) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <span className="block text-[11px] font-bold text-slate-700">{isAr ? 'محاذاة الفقرات والسطور:' : 'Text Alignment:'}</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { align: 'right', icon: AlignRight, labelAr: 'يمين', labelEn: 'Right' },
              { align: 'center', icon: AlignCenter, labelAr: 'وسط', labelEn: 'Center' },
              { align: 'left', icon: AlignLeft, labelAr: 'يسار', labelEn: 'Left' },
              { align: 'justify', icon: AlignJustify, labelAr: 'ضبط الجانبين', labelEn: 'Justify' },
            ].map((item) => {
              const IconComp = item.icon;
              const isSelected = (page.textAlign || 'right') === item.align;
              return (
                <button
                  key={item.align}
                  type="button"
                  onClick={() => onChange({ textAlign: item.align as any })}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition flex items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <IconComp className="w-3 h-3" />
                  {isAr ? item.labelAr : item.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Weight (سماكة الخط) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <span className="block text-[11px] font-bold text-slate-700">{isAr ? 'سماكة وبروز النص:' : 'Font Weight:'}</span>
          <div className="grid grid-cols-4 gap-1">
            {[
              { wt: 'normal', labelAr: 'عادي', labelEn: 'Normal' },
              { wt: 'medium', labelAr: 'متوسط', labelEn: 'Medium' },
              { wt: 'semibold', labelAr: 'شبه عريض', labelEn: 'Semibold' },
              { wt: 'bold', labelAr: 'عريض', labelEn: 'Bold' },
            ].map((w) => (
              <button
                key={w.wt}
                type="button"
                onClick={() => onChange({ fontWeight: w.wt as any })}
                className={`py-1 px-1 text-center font-bold text-[10px] rounded border transition ${
                  (page.fontWeight || 'normal') === w.wt
                    ? 'bg-amber-500 text-slate-950 border-amber-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isAr ? w.labelAr : w.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Text Color (لون الخط) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <span className="block text-[11px] font-bold text-slate-700">{isAr ? 'لون الكلمات والنص:' : 'Body Text Color:'}</span>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { color: '#334155', name: 'رمادي داكن' },
                { color: '#0f172a', name: 'أسود داكن' },
                { color: '#1e3a8a', name: 'أزرق كحلي' },
                { color: '#dc2626', name: 'أحمر' },
                { color: '#15803d', name: 'أخضر' },
                { color: '#7c3aed', name: 'بنفسجي' },
                { color: '#b45309', name: 'بني' },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => onChange({ textColor: c.color })}
                  className={`w-6 h-6 rounded-full border transition-transform ${
                    (page.textColor || '#334155') === c.color 
                      ? 'scale-110 ring-2 ring-brand-500 ring-offset-1 border-white shadow-xs' 
                      : 'border-slate-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>

            <div className="flex items-center gap-1">
              <input 
                type="color" 
                value={page.textColor || '#334155'} 
                onChange={(e) => onChange({ textColor: e.target.value })}
                className="w-7 h-7 p-0.5 border border-slate-300 rounded cursor-pointer bg-white"
              />
              <span className="text-[10px] font-mono text-slate-500">{page.textColor || '#334155'}</span>
            </div>
          </div>
        </div>

        {/* Background Card & Padding */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ textBgCard: !page.textBgCard })}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
              page.textBgCard 
                ? 'bg-brand-50 border-brand-500 text-brand-800 shadow-xs' 
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            {page.textBgCard ? '✓ بطاقة خلفية بيضاء' : 'بدون بطاقة خلفية'}
          </button>

          <button
            type="button"
            onClick={() => {
              const currentPad = page.textPadding || 16;
              const nextPad = currentPad === 12 ? 16 : currentPad === 16 ? 24 : 12;
              onChange({ textPadding: nextPad });
            }}
            className="py-2 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            {isAr ? `الهامش الداخلي: ${page.textPadding || 16}px` : `Padding: ${page.textPadding || 16}px`}
          </button>
        </div>
      </div>

      {/* 3. Image Manager with CM Measurements for Text Pages */}
      <div className="bg-white border border-purple-200 p-3.5 rounded-xl space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-purple-100 pb-2">
          <div className="flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-purple-600" />
            <h4 className="font-bold text-purple-900 text-xs">
              {isAr ? 'إضافة صور وتحديد أحجامها بالسنتيمتر (cm)' : 'Add Images with CM Measurements'}
            </h4>
          </div>
          <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
            A4 (21cm x 29.7cm)
          </span>
        </div>

        {/* Upload Trigger Button */}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleImageUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isAr ? '📷 رفع صورة جديدة للصفحة النصية' : '📷 Upload Image to Text Page'}
        </button>

        {/* List of Page Images with CM Sizing & Moving */}
        {pageImages.length > 0 ? (
          <div className="space-y-3">
            {pageImages.map((img, idx) => {
              const widthCm = img.widthCm || Math.round((14.0 * (img.scale || 100) * (img.scaleX || 100)) / 10000 * 10) / 10;
              const heightCm = img.heightCm || Math.round((12.0 * (img.scale || 100) * (img.scaleY || 100)) / 10000 * 10) / 10;

              return (
                <div key={img.id} className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src={img.url} 
                        alt={`Image ${idx + 1}`} 
                        className="w-10 h-10 object-cover rounded-lg border border-purple-300" 
                      />
                      <div>
                        <span className="text-xs font-bold text-purple-900">
                          {isAr ? `صورة رقم ${idx + 1}` : `Image #${idx + 1}`}
                        </span>
                        <span className="text-[10px] block font-mono font-extrabold text-purple-700">
                          📐 {widthCm} سم × {heightCm} سم
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                      title={isAr ? 'حذف الصورة' : 'Delete Image'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Centimeter Dimension Inputs */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-200/60">
                    <div>
                      <label className="block text-[10px] font-bold text-purple-900 mb-1">
                        {isAr ? 'العرض بالسنتيمتر (cm):' : 'Width (cm):'}
                      </label>
                      <div className="flex items-center gap-1">
                        <input 
                          type="number"
                          step="0.5"
                          min="1"
                          max="21"
                          value={widthCm}
                          onChange={(e) => {
                            const newW = Number(e.target.value) || 10;
                            // Calculate required scaleX
                            const newScaleX = Math.round((newW / 14.0) * 100);
                            handleUpdateImage(img.id, { widthCm: newW, scaleX: newScaleX });
                          }}
                          className="w-full p-1.5 bg-white border border-purple-300 rounded text-center text-xs font-mono font-bold text-purple-900"
                        />
                        <span className="text-[10px] font-bold text-purple-700">سم</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-purple-900 mb-1">
                        {isAr ? 'الارتفاع بالسنتيمتر (cm):' : 'Height (cm):'}
                      </label>
                      <div className="flex items-center gap-1">
                        <input 
                          type="number"
                          step="0.5"
                          min="1"
                          max="29"
                          value={heightCm}
                          onChange={(e) => {
                            const newH = Number(e.target.value) || 10;
                            const newScaleY = Math.round((newH / 12.0) * 100);
                            handleUpdateImage(img.id, { heightCm: newH, scaleY: newScaleY });
                          }}
                          className="w-full p-1.5 bg-white border border-purple-300 rounded text-center text-xs font-mono font-bold text-purple-900"
                        />
                        <span className="text-[10px] font-bold text-purple-700">سم</span>
                      </div>
                    </div>
                  </div>

                  {/* Positioning Offsets X / Y */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-purple-800 mb-0.5">
                        <span>{isAr ? 'تحريك أفقي X:' : 'Move X:'}</span>
                        <span className="font-mono text-[9px]">{img.offsetX || 0}px</span>
                      </div>
                      <input 
                        type="range"
                        min="-200"
                        max="200"
                        value={img.offsetX || 0}
                        onChange={(e) => handleUpdateImage(img.id, { offsetX: Number(e.target.value) })}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-purple-800 mb-0.5">
                        <span>{isAr ? 'تحريك رأسي Y:' : 'Move Y:'}</span>
                        <span className="font-mono text-[9px]">{img.offsetY || 0}px</span>
                      </div>
                      <input 
                        type="range"
                        min="-200"
                        max="200"
                        value={img.offsetY || 0}
                        onChange={(e) => handleUpdateImage(img.id, { offsetY: Number(e.target.value) })}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[10px] text-slate-400 text-center py-2">
            {isAr ? 'لا توجد صور مضافة في هذه الصفحة النصية حتى الآن.' : 'No images added to this text page yet.'}
          </p>
        )}
      </div>

      {/* 4. Extra Callout Note Box */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-2 shadow-2xs">
        <label className="block font-bold text-slate-800 text-xs">{isAr ? 'صندوق ملاحظة إضافية (Callout Box)' : 'Extra Callout Box'}</label>
        <textarea 
          rows={3}
          value={page.extraText || ''} 
          onChange={(e) => onChange({ extraText: e.target.value })}
          className="w-full p-2 border border-slate-300 rounded-lg text-xs leading-relaxed"
          placeholder={isAr ? '💡 ملاحظة للمربي أو إرشادات إضافية...' : '💡 Extra notes or guidance...'}
        />
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onChange({ extraTextBgCard: !page.extraTextBgCard })}
            className={`py-1 px-3 rounded-lg border text-[11px] font-bold transition ${
              page.extraTextBgCard ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            {page.extraTextBgCard ? '✓ صندوق بارز مُميّز' : 'بدون صندوق بارز'}
          </button>
        </div>
      </div>

    </div>
  );
};
