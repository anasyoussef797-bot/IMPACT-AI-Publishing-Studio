import React from 'react';
import { ActivityWorksheetConfig, ActivityBlock } from '../types';
import { Pencil, Search, Link as LinkIcon, MessageSquare, Star, Sparkles, Hash, Palette } from 'lucide-react';

interface Props {
  config?: ActivityWorksheetConfig;
  isAr?: boolean;
}

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; badgeBg: string; badgeText: string }> = {
  blue: { border: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8', badgeBg: '#dbeafe', badgeText: '#1e40af' },
  yellow: { border: '#f59e0b', bg: '#fffbeb', text: '#b45309', badgeBg: '#fef3c7', badgeText: '#92400e' },
  green: { border: '#10b981', bg: '#f0fdf4', text: '#047857', badgeBg: '#d1fae5', badgeText: '#065f46' },
  purple: { border: '#8b5cf6', bg: '#faf5ff', text: '#6d28d9', badgeBg: '#ede9fe', badgeText: '#5b21b6' },
  orange: { border: '#f97316', bg: '#fff7ed', text: '#c2410c', badgeBg: '#ffedd5', badgeText: '#9a3412' },
  teal: { border: '#14b8a6', bg: '#f0fdfa', text: '#0f766e', badgeBg: '#ccfbf1', badgeText: '#115e59' },
  pink: { border: '#ec4899', bg: '#fdf2f8', text: '#be185d', badgeBg: '#fce7f3', badgeText: '#9d174d' },
  slate: { border: '#64748b', bg: '#f8fafc', text: '#334155', badgeBg: '#e2e8f0', badgeText: '#1e293b' }
};

export const ActivityWorksheetView: React.FC<Props> = ({ config, isAr = true }) => {
  if (!config || !config.blocks || config.blocks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
        <Sparkles className="w-12 h-12 text-brand-400 mb-2 animate-bounce" />
        <h4 className="font-bold text-slate-700 text-base">ورقة أنشطة فارغة</h4>
        <p className="text-xs text-slate-500 mt-1">أضف مستطيلات ومربعات الأنشطة من اللوحة الجانبية للبدء!</p>
      </div>
    );
  }

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'pencil': return <Pencil className="w-4 h-4" />;
      case 'crayon': return <Palette className="w-4 h-4" />;
      case 'search': return <Search className="w-4 h-4" />;
      case 'link': return <LinkIcon className="w-4 h-4" />;
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      case 'count': return <Hash className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white p-3 sm:p-4 rounded-xl shadow-xs overflow-hidden border border-slate-100 select-none">
      
      {/* Top Header Banner */}
      <div 
        className="w-full py-2.5 px-4 rounded-2xl mb-3 flex items-center justify-between text-white shadow-xs"
        style={{ backgroundColor: config.headerThemeColor || '#2563eb' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">✏️</span>
          <span className="text-lg">⭐</span>
        </div>
        <div className="text-center">
          <h2 className="font-extrabold text-sm sm:text-base leading-tight tracking-wide">
            {isAr ? (config.headerTitleAr || 'ورقة نشاط ممتعة للأطفال') : (config.headerTitleEn || 'Kindergarten Activity Worksheet')}
          </h2>
          {(config.headerTitleEn || config.headerTitleAr) && (
            <p className="text-[10px] sm:text-xs text-blue-100 font-medium">
              {isAr ? (config.headerTitleEn || 'Kindergarten Activity Worksheet') : (config.headerTitleAr || 'ورقة نشاط ممتعة للأطفال')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">☁️</span>
          <span className="text-lg">🎨</span>
        </div>
      </div>

      {/* Main Blocks Grid Layout */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-0.5">
        {config.blocks.map((block) => {
          const theme = COLOR_MAP[block.borderColor || 'blue'] || COLOR_MAP.blue;
          const isFullWidth = block.widthSpan === 'full';

          return (
            <div
              key={block.id}
              className={`rounded-2xl p-3 flex flex-col justify-between transition-all ${
                isFullWidth ? 'sm:col-span-2' : 'sm:col-span-1'
              }`}
              style={{
                backgroundColor: block.bgColor || theme.bg,
                borderColor: theme.border,
                borderWidth: block.borderStyle === 'thick' ? '3px' : '2px',
                borderStyle: block.borderStyle === 'dashed' ? 'dashed' : 'solid',
                minHeight: block.minHeight ? `${block.minHeight}px` : '180px'
              }}
            >
              {/* Block Header Badge Pill */}
              <div className="flex items-center justify-between mb-2">
                <div 
                  className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
                >
                  {renderIcon(block.icon)}
                  <span>{block.title || 'Activity'}</span>
                </div>
                {block.borderStyle === 'dashed' && (
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    ✂️ تتبع الخطوط
                  </span>
                )}
              </div>

              {/* Sub Instruction */}
              {(block.instructionAr || block.instructionEn) && (
                <div className="mb-2 text-right">
                  {block.instructionAr && (
                    <p className="text-xs font-bold text-slate-800 leading-snug">
                      {block.instructionAr}
                    </p>
                  )}
                  {block.instructionEn && (
                    <p className="text-[10px] text-slate-500 font-medium">
                      {block.instructionEn}
                    </p>
                  )}
                </div>
              )}

              {/* Inner Content Body */}
              <div className="flex-1 flex flex-col items-center justify-center my-1 w-full">
                
                {/* Content Type: Image */}
                {block.contentType === 'image' && block.imageUrl && (
                  <div className="w-full flex flex-col items-center justify-center">
                    <img 
                      src={block.imageUrl} 
                      alt={block.title} 
                      className="max-h-28 max-w-full object-contain rounded-lg"
                      crossOrigin="anonymous"
                    />
                    {block.textAr && (
                      <span className="text-xs font-bold text-slate-700 mt-1">
                        {block.textAr}
                      </span>
                    )}
                  </div>
                )}

                {/* Content Type: Tracing */}
                {block.contentType === 'tracing' && (
                  <div className="w-full flex flex-col items-center justify-center py-2 bg-white/60 rounded-xl border border-dashed border-slate-300">
                    {block.imageUrl ? (
                      <img 
                        src={block.imageUrl} 
                        alt="Tracing" 
                        className="max-h-24 max-w-full object-contain opacity-80 filter grayscale"
                      />
                    ) : (
                      <div className="text-center">
                        <span className="text-2xl font-mono font-extrabold tracking-widest text-slate-400 border-b-2 border-dashed border-slate-400 pb-1">
                          {block.tracingText || 'أ أ أ'}
                        </span>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">تتبع الحرف / الشكل</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Content Type: Matching */}
                {block.contentType === 'matching' && block.matchingPairs && block.matchingPairs.length > 0 && (
                  <div className="w-full space-y-2 py-1">
                    {block.matchingPairs.map((pair, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs font-bold text-slate-700 bg-white/80 p-1.5 rounded-lg border border-slate-200/80">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-brand-700">{pair.left}</span>
                        <span className="text-slate-300 font-mono text-[10px]">┈┈┈►</span>
                        <span className="bg-brand-50 text-brand-800 px-2 py-0.5 rounded">{pair.right}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Content Type: Text or Hybrid */}
                {(block.contentType === 'text' || (!block.imageUrl && block.contentType !== 'matching' && block.contentType !== 'tracing')) && (
                  <div className="w-full text-center p-2 bg-white/70 rounded-xl border border-slate-200/60">
                    {block.textAr && (
                      <p className="text-xs font-bold text-slate-800 whitespace-pre-line leading-relaxed">
                        {block.textAr}
                      </p>
                    )}
                    {block.textEn && (
                      <p className="text-[11px] font-medium text-slate-600 mt-1 whitespace-pre-line">
                        {block.textEn}
                      </p>
                    )}
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Banner */}
      <div className="mt-2 py-1.5 px-3 bg-gradient-to-r from-amber-50 via-yellow-100 to-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-[11px] font-bold text-amber-900 shadow-2xs">
        <span>⭐ {config.footerTextAr || 'أحسنت! عمل رائع في التعلم!'}</span>
        <span className="font-mono text-[10px] text-amber-700">{config.footerTextEn || 'You did it! Great job!'} 🌟</span>
      </div>

    </div>
  );
};
