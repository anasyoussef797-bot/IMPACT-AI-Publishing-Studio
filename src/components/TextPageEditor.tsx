import React from 'react';
import { Page } from '../types';
import { Type, AlignRight, AlignCenter, AlignLeft, Palette, Sparkles } from 'lucide-react';

interface Props {
  page: Page;
  onChange: (updates: Partial<Page>) => void;
  isAr?: boolean;
}

export const TextPageEditor: React.FC<Props> = ({ page, onChange, isAr = true }) => {
  return (
    <div className="space-y-4 text-slate-800 text-xs dir-rtl" dir="rtl">
      
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 p-3 rounded-xl flex items-center justify-between shadow-2xs">
        <div>
          <h4 className="font-bold text-sky-900 text-xs flex items-center gap-1.5">
            <Type className="w-4 h-4 text-sky-600" />
            إعدادات الصفحة النصية (قراءة / قصة / تعليمات)
          </h4>
          <p className="text-[10px] text-sky-700 mt-0.5">
            هذه الصفحة مخصصة للنصوص والقراءة فقط بدون رسمة تلوين.
          </p>
        </div>
      </div>

      {/* Title Settings */}
      <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-2">
        <label className="block font-bold text-slate-800 text-xs">عنوان الصفحة</label>
        <input 
          type="text" 
          value={page.title || ''} 
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-brand-500"
          placeholder="عنوان الصفحة..."
        />

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">حجم خط العنوان</label>
            <input 
              type="range" 
              min="18" 
              max="40" 
              value={page.titleSize || 26} 
              onChange={(e) => onChange({ titleSize: Number(e.target.value) })}
              className="w-full"
            />
            <span className="text-[10px] text-slate-500 font-mono block text-left">{page.titleSize || 26}px</span>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">لون العنوان</label>
            <input 
              type="color" 
              value={page.titleColor || '#0f172a'} 
              onChange={(e) => onChange({ titleColor: e.target.value })}
              className="w-full h-8 p-1 border border-slate-300 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Body Text Settings */}
      <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-2">
        <label className="block font-bold text-slate-800 text-xs">المحتوى النصي الرئيسي (القصة / الشرح)</label>
        <textarea 
          rows={5}
          value={page.textContent || ''} 
          onChange={(e) => onChange({ textContent: e.target.value })}
          className="w-full p-2.5 border border-slate-300 rounded-lg text-xs leading-relaxed font-sans focus:ring-2 focus:ring-brand-500"
          placeholder="اكتب المحتوى النصي هنا..."
        />

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">حجم الخط</label>
            <input 
              type="range" 
              min="12" 
              max="30" 
              value={page.textSize || 16} 
              onChange={(e) => onChange({ textSize: Number(e.target.value) })}
              className="w-full"
            />
            <span className="text-[10px] text-slate-500 font-mono block text-left">{page.textSize || 16}px</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">إطار/بطاقة خلفية للنص</label>
            <button
              type="button"
              onClick={() => onChange({ textBgCard: !page.textBgCard })}
              className={`w-full py-1.5 px-3 rounded-lg border text-xs font-bold transition ${
                page.textBgCard ? 'bg-brand-50 border-brand-500 text-brand-800' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              {page.textBgCard ? '✓ بطاقة مضللة مُفعلة' : 'بدون بطاقة خلفية'}
            </button>
          </div>
        </div>
      </div>

      {/* Extra Callout Note Box */}
      <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-2">
        <label className="block font-bold text-slate-800 text-xs">ملاحظة / صندوق نص إضافي (Callout Box)</label>
        <textarea 
          rows={3}
          value={page.extraText || ''} 
          onChange={(e) => onChange({ extraText: e.target.value })}
          className="w-full p-2 border border-slate-300 rounded-lg text-xs leading-relaxed"
          placeholder="💡 ملاحظة تربوية للمربي..."
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
