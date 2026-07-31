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
    <div className="w-full h-full flex flex-col bg-white p-2.5 sm:p-3 rounded-xl shadow-xs overflow-hidden border border-slate-100 select-none">
      
      {/* Top Header Banner (Compact & Optional) */}
      {(config.showHeader !== false && config.headerSize !== 'hidden') && (
        <div 
          className={`w-full rounded-xl mb-2 flex items-center justify-between text-white shadow-xs transition-all ${
            config.headerSize === 'large' 
              ? 'py-2.5 px-4' 
              : config.headerSize === 'medium' 
                ? 'py-2 px-3' 
                : 'py-1 px-2.5' // compact default
          }`}
          style={{ backgroundColor: config.headerThemeColor || '#2563eb' }}
        >
          <div className="flex items-center gap-1.5 text-sm">
            <span>✏️</span>
            <span>⭐</span>
          </div>
          <div className="text-center">
            <h2 className={`font-extrabold leading-tight tracking-wide ${
              config.headerSize === 'large' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
            }`}>
              {isAr ? (config.headerTitleAr || 'ورقة نشاط ممتعة للأطفال') : (config.headerTitleEn || 'Kindergarten Activity Worksheet')}
            </h2>
            {(config.headerTitleEn || config.headerTitleAr) && config.headerSize !== 'compact' && (
              <p className="text-[9px] sm:text-[10px] text-blue-100 font-medium">
                {isAr ? (config.headerTitleEn || 'Kindergarten Activity Worksheet') : (config.headerTitleAr || 'ورقة نشاط ممتعة للأطفال')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span>☁️</span>
            <span>🎨</span>
          </div>
        </div>
      )}

      {/* Main Blocks Grid Layout - NO SCROLLBARS (overflow-hidden) */}
      <div 
        className={`flex-1 grid gap-2 overflow-hidden ${
          config.gridCols === 1 
            ? 'grid-cols-1' 
            : config.gridCols === 3 
              ? 'grid-cols-1 sm:grid-cols-3' 
              : 'grid-cols-1 sm:grid-cols-2'
        }`}
      >
        {config.blocks.map((block) => {
          const theme = COLOR_MAP[block.borderColor || 'blue'] || COLOR_MAP.blue;
          const isFullWidth = block.widthSpan === 'full';

          return (
            <div
              key={block.id}
              className={`rounded-xl p-2 sm:p-2.5 flex flex-col justify-between overflow-hidden transition-all ${
                isFullWidth ? 'sm:col-span-2' : 'sm:col-span-1'
              }`}
              style={{
                backgroundColor: block.bgColor || theme.bg,
                borderColor: theme.border,
                borderWidth: block.borderStyle === 'thick' ? '3px' : '2px',
                borderStyle: block.borderStyle === 'dashed' ? 'dashed' : 'solid',
                minHeight: block.minHeight ? `${block.minHeight}px` : '130px'
              }}
            >
              {/* Block Header Badge Pill */}
              <div className="flex items-center justify-between mb-1">
                <div 
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                  style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
                >
                  {renderIcon(block.icon)}
                  <span>{block.title || 'Activity'}</span>
                </div>
                {block.borderStyle === 'dashed' && (
                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    ✂️ تتبع الخطوط
                  </span>
                )}
              </div>

              {/* Sub Instruction */}
              {(block.instructionAr || block.instructionEn) && (
                <div className="mb-1 text-right">
                  {block.instructionAr && (
                    <p className="text-[11px] font-bold text-slate-800 leading-snug">
                      {block.instructionAr}
                    </p>
                  )}
                  {block.instructionEn && (
                    <p className="text-[9px] text-slate-500 font-medium">
                      {block.instructionEn}
                    </p>
                  )}
                </div>
              )}

              {/* Inner Content Body */}
              <div className="flex-1 flex flex-col items-center justify-center my-0.5 w-full overflow-hidden">
                
                {/* Content Type: Image */}
                {block.contentType === 'image' && block.imageUrl && (
                  <div className="w-full flex flex-col items-center justify-center overflow-hidden">
                    <img 
                      src={block.imageUrl} 
                      alt={block.title} 
                      style={{ maxHeight: block.imageHeightPx ? `${block.imageHeightPx}px` : '80px' }}
                      className="max-w-full object-contain rounded-lg"
                      crossOrigin="anonymous"
                    />
                    {block.textAr && (
                      <span className="text-[11px] font-bold text-slate-700 mt-0.5 truncate max-w-full">
                        {block.textAr}
                      </span>
                    )}
                  </div>
                )}

                {/* Content Type: Tracing */}
                {block.contentType === 'tracing' && (
                  <div className="w-full flex flex-col items-center justify-center py-1 px-2 bg-white/60 rounded-lg border border-dashed border-slate-300 overflow-hidden">
                    {block.imageUrl ? (
                      <img 
                        src={block.imageUrl} 
                        alt="Tracing" 
                        style={{ maxHeight: block.imageHeightPx ? `${block.imageHeightPx}px` : '70px' }}
                        className="max-w-full object-contain opacity-80 filter grayscale"
                      />
                    ) : (
                      <div className="text-center">
                        <span className="text-xl font-mono font-extrabold tracking-widest text-slate-400 border-b-2 border-dashed border-slate-400 pb-0.5">
                          {block.tracingText || 'أ أ أ'}
                        </span>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">تتبع الحرف / الشكل</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Content Type: Matching */}
                {block.contentType === 'matching' && block.matchingPairs && block.matchingPairs.length > 0 && (
                  <div className="w-full space-y-1 py-0.5 overflow-hidden">
                    {block.matchingPairs.map((pair, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] font-bold text-slate-700 bg-white/80 p-1 rounded-lg border border-slate-200/80">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-brand-700 truncate max-w-[45%]">{pair.left}</span>
                        <span className="text-slate-300 font-mono text-[9px]">┈┈►</span>
                        <span className="bg-brand-50 text-brand-800 px-1.5 py-0.5 rounded truncate max-w-[45%]">{pair.right}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Content Type: Text or Hybrid */}
                {(block.contentType === 'text' || (!block.imageUrl && block.contentType !== 'matching' && block.contentType !== 'tracing')) && (
                  <div className="w-full text-center p-1.5 bg-white/70 rounded-lg border border-slate-200/60 overflow-hidden">
                    {block.textAr && (
                      <p className="text-[11px] font-bold text-slate-800 whitespace-pre-line leading-relaxed">
                        {block.textAr}
                      </p>
                    )}
                    {block.textEn && (
                      <p className="text-[10px] font-medium text-slate-600 mt-0.5 whitespace-pre-line">
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

      {/* Optional Bottom Footer Banner (Off by default as requested) */}
      {config.showFooter && (
        <div className="mt-1.5 py-1 px-3 bg-gradient-to-r from-amber-50 via-yellow-100 to-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-[10px] font-bold text-amber-900 shadow-2xs">
          <span>⭐ {config.footerTextAr || 'أحسنت! عمل رائع في التعلم!'}</span>
          <span className="font-mono text-[9px] text-amber-700">{config.footerTextEn || 'You did it! Great job!'} 🌟</span>
        </div>
      )}

    </div>
  );
};
