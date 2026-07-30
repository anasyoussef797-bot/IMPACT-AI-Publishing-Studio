import React, { useState } from 'react';
import { ActivityWorksheetConfig, ActivityBlock } from '../types';
import { createDefaultActivityWorksheet } from '../utils/defaultActivityTemplates';
import { Plus, Trash2, ArrowUp, ArrowDown, LayoutGrid, Palette, Image as ImageIcon, Sparkles, Type, Link as LinkIcon, Check, Wand2, Pencil } from 'lucide-react';

interface Props {
  config?: ActivityWorksheetConfig;
  onChange: (updated: ActivityWorksheetConfig) => void;
  isAr?: boolean;
}

const COLOR_OPTIONS = [
  { id: 'blue', label: 'أزرق', border: '#3b82f6', bg: '#eff6ff' },
  { id: 'yellow', label: 'أصفر', border: '#f59e0b', bg: '#fffbeb' },
  { id: 'green', label: 'أخضر', border: '#10b981', bg: '#f0fdf4' },
  { id: 'purple', label: 'بنفسجي', border: '#8b5cf6', bg: '#faf5ff' },
  { id: 'orange', label: 'برتقالي', border: '#f97316', bg: '#fff7ed' },
  { id: 'teal', label: 'تركوازي', border: '#14b8a6', bg: '#f0fdfa' },
  { id: 'pink', label: 'وردي', border: '#ec4899', bg: '#fdf2f8' },
  { id: 'slate', label: 'رمادي', border: '#64748b', bg: '#f8fafc' }
];

const ICON_OPTIONS = [
  { id: 'search', label: 'عدسة / انظر 🔍' },
  { id: 'crayon', label: 'تلوين 🖍️' },
  { id: 'pencil', label: 'قلم / تتبع ✏️' },
  { id: 'link', label: 'مطابقة / وصل 🔗' },
  { id: 'chat', label: 'محادثة / قل 💬' },
  { id: 'count', label: 'عد / أرقام 🔢' },
  { id: 'star', label: 'نجمة ⭐' }
];

export const ActivityWorksheetEditor: React.FC<Props> = ({ config, onChange, isAr = true }) => {
  const currentConfig: ActivityWorksheetConfig = config || createDefaultActivityWorksheet();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(currentConfig.blocks[0]?.id || null);

  const updateHeader = (fields: Partial<ActivityWorksheetConfig>) => {
    onChange({
      ...currentConfig,
      ...fields
    });
  };

  const updateBlock = (blockId: string, updates: Partial<ActivityBlock>) => {
    const newBlocks = currentConfig.blocks.map(b => 
      b.id === blockId ? { ...b, ...updates } : b
    );
    onChange({
      ...currentConfig,
      blocks: newBlocks
    });
  };

  const handleAddBlock = () => {
    const newBlock: ActivityBlock = {
      id: `block-${Date.now()}`,
      title: `Activity ${currentConfig.blocks.length + 1}`,
      icon: 'pencil',
      borderColor: COLOR_OPTIONS[currentConfig.blocks.length % COLOR_OPTIONS.length].id,
      bgColor: COLOR_OPTIONS[currentConfig.blocks.length % COLOR_OPTIONS.length].bg,
      borderStyle: 'solid',
      widthSpan: 'half',
      minHeight: 180,
      instructionAr: 'أدخل التوجيه أو التعليمات هنا.',
      instructionEn: 'Enter instructions here.',
      contentType: 'text',
      textAr: 'محتوى نصي أو تدريبي'
    };
    const updatedBlocks = [...currentConfig.blocks, newBlock];
    onChange({ ...currentConfig, blocks: updatedBlocks });
    setSelectedBlockId(newBlock.id);
  };

  const handleDeleteBlock = (blockId: string) => {
    const updatedBlocks = currentConfig.blocks.filter(b => b.id !== blockId);
    onChange({ ...currentConfig, blocks: updatedBlocks });
    if (selectedBlockId === blockId) {
      setSelectedBlockId(updatedBlocks[0]?.id || null);
    }
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentConfig.blocks.length) return;
    const blocks = [...currentConfig.blocks];
    const temp = blocks[index];
    blocks[index] = blocks[targetIndex];
    blocks[targetIndex] = temp;
    onChange({ ...currentConfig, blocks });
  };

  const applyTemplate = (templateType: 'kindergarten6' | 'grid4' | 'rows3') => {
    if (templateType === 'kindergarten6') {
      onChange(createDefaultActivityWorksheet());
    } else if (templateType === 'grid4') {
      onChange({
        headerTitleAr: 'أنشطة التفكير والملاحظة',
        headerTitleEn: '4-Activity Learning Grid',
        headerSubtitle: 'تلوين، مطابقة، وعد الأشكال',
        headerThemeColor: '#059669',
        footerTextAr: 'ممتاز! عمل رائع جداً',
        footerTextEn: 'Awesome Work!',
        blocks: [
          { id: 'b1', title: 'Activity 1 - LOOK', icon: 'search', borderColor: 'blue', bgColor: '#f0f9ff', widthSpan: 'half', minHeight: 190, instructionAr: 'انظر للصورة وركّز.', contentType: 'image', imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500&auto=format&fit=crop&q=80' },
          { id: 'b2', title: 'Activity 2 - COLOR', icon: 'crayon', borderColor: 'yellow', bgColor: '#fffbeb', widthSpan: 'half', minHeight: 190, instructionAr: 'لون العناصر بدقة.', contentType: 'tracing', tracingText: 'رسمة التلوين' },
          { id: 'b3', title: 'Activity 3 - COUNT', icon: 'count', borderColor: 'green', bgColor: '#f0fdf4', widthSpan: 'half', minHeight: 190, instructionAr: 'عد الأشخاص والحيوانات.', contentType: 'text', textAr: '1 • 2 • 3 • 4' },
          { id: 'b4', title: 'Activity 4 - MATCH', icon: 'link', borderColor: 'purple', bgColor: '#faf5ff', widthSpan: 'half', minHeight: 190, instructionAr: 'صل الكلمة بالصورة المناسبة.', contentType: 'matching', matchingPairs: [{ left: 'كلب / Dog', right: 'طعام الكلب' }, { left: 'قطة / Cat', right: 'سمكة' }] }
        ]
      });
    } else if (templateType === 'rows3') {
      onChange({
        headerTitleAr: 'نشاط الأسطر الممتعة',
        headerTitleEn: '3-Step Horizontal Rows',
        headerThemeColor: '#7c3aed',
        footerTextAr: 'واصل الإبداع والتعلم!',
        footerTextEn: 'Keep up the great work!',
        blocks: [
          { id: 'b1', title: 'الخطوة 1 - انظر واقرأ (READ)', icon: 'search', borderColor: 'blue', bgColor: '#f0f9ff', widthSpan: 'full', minHeight: 160, instructionAr: 'اقرأ المفردات التالية وتعرّف عليها.', contentType: 'text', textAr: 'مَدْرَسَة • SCHOOL • طَالِب • STUDENT' },
          { id: 'b2', title: 'الخطوة 2 - تتبع واكتب (TRACE)', icon: 'pencil', borderColor: 'orange', bgColor: '#fff7ed', borderStyle: 'dashed', widthSpan: 'full', minHeight: 160, instructionAr: 'تتبع الحروف والنصوص المتقطعة.', contentType: 'tracing', tracingText: 'مَدْرَسَتِي الجَمِيلَة' },
          { id: 'b3', title: 'الخطوة 3 - لون وعبّر (COLOR)', icon: 'crayon', borderColor: 'pink', bgColor: '#fdf2f8', widthSpan: 'full', minHeight: 160, instructionAr: 'لون المشهد بألوانك المفضلة.', contentType: 'tracing', tracingText: 'منظر التلوين' }
        ]
      });
    }
  };

  const selectedBlock = currentConfig.blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="space-y-4 text-slate-800 text-xs dir-rtl" dir="rtl">
      
      {/* Quick Templates Picker */}
      <div className="bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 p-3 rounded-xl shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-brand-900 flex items-center gap-1.5 text-xs">
            <Wand2 className="w-4 h-4 text-brand-600" />
            نماذج أوراق الأنشطة الجاهزة (كالبند والرياض)
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => applyTemplate('kindergarten6')}
            className="p-2 bg-white hover:bg-brand-100/50 border border-brand-200 rounded-lg font-bold text-brand-800 text-[11px] text-center transition flex flex-col items-center gap-1 shadow-2xs"
          >
            <LayoutGrid className="w-4 h-4 text-brand-600" />
            <span>6 مربعات أنشطة (مثل الصور)</span>
          </button>

          <button
            onClick={() => applyTemplate('grid4')}
            className="p-2 bg-white hover:bg-emerald-100/50 border border-emerald-200 rounded-lg font-bold text-emerald-800 text-[11px] text-center transition flex flex-col items-center gap-1 shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>4 مربعات متوازية (2x2)</span>
          </button>

          <button
            onClick={() => applyTemplate('rows3')}
            className="p-2 bg-white hover:bg-purple-100/50 border border-purple-200 rounded-lg font-bold text-purple-800 text-[11px] text-center transition flex flex-col items-center gap-1 shadow-2xs"
          >
            <Type className="w-4 h-4 text-purple-600" />
            <span>3 أسطر مستطيلة أفقية</span>
          </button>
        </div>
      </div>

      {/* Sheet Header Customizer */}
      <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-2">
        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
          <span>🎨</span> عنوان وشريط ورقة النشاط (العلوية والسنبلة)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">العنوان بالعربية</label>
            <input 
              type="text" 
              value={currentConfig.headerTitleAr || ''} 
              onChange={(e) => updateHeader({ headerTitleAr: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-500"
              placeholder="ورقة نشاط ممتعة..."
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">العنوان بالإنجليزية</label>
            <input 
              type="text" 
              value={currentConfig.headerTitleEn || ''} 
              onChange={(e) => updateHeader({ headerTitleEn: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-500"
              placeholder="Activity Worksheet..."
            />
          </div>
        </div>
      </div>

      {/* Blocks Management Section */}
      <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
            <LayoutGrid className="w-4 h-4 text-brand-600" />
            مربعات ومستطيلات الأنشطة ({currentConfig.blocks.length})
          </span>
          <button
            onClick={handleAddBlock}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition flex items-center gap-1 text-[11px] shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة مستطيل جديد
          </button>
        </div>

        {/* List of Block Pills */}
        <div className="flex flex-wrap gap-1.5">
          {currentConfig.blocks.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => setSelectedBlockId(b.id)}
              className={`px-3 py-1.5 rounded-lg border font-bold text-[11px] flex items-center gap-1.5 transition ${
                selectedBlockId === b.id 
                  ? 'border-brand-500 bg-brand-50 text-brand-800 ring-2 ring-brand-400/30' 
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{idx + 1}.</span>
              <span>{b.title || 'Activity'}</span>
            </button>
          ))}
        </div>

        {/* Selected Block Details Form */}
        {selectedBlock ? (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 text-xs">
                تعديل المربع: <span className="text-brand-600">{selectedBlock.title}</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMoveBlock(currentConfig.blocks.findIndex(b => b.id === selectedBlock.id), 'up')}
                  className="p-1 hover:bg-slate-200 text-slate-600 rounded"
                  title="تحريك لأعلى"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveBlock(currentConfig.blocks.findIndex(b => b.id === selectedBlock.id), 'down')}
                  className="p-1 hover:bg-slate-200 text-slate-600 rounded"
                  title="تحريك لأسفل"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteBlock(selectedBlock.id)}
                  className="p-1 hover:bg-red-100 text-red-600 rounded transition"
                  title="حذف هذا المربع"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Block Title & Icon */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">عنوان النشاط (Badge)</label>
                <input 
                  type="text" 
                  value={selectedBlock.title || ''} 
                  onChange={(e) => updateBlock(selectedBlock.id, { title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-brand-500"
                  placeholder="Activity 1 - LOOK..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">أيقونة الشارة</label>
                <select
                  value={selectedBlock.icon || 'pencil'}
                  onChange={(e) => updateBlock(selectedBlock.id, { icon: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                >
                  {ICON_OPTIONS.map(ico => (
                    <option key={ico.id} value={ico.id}>{ico.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Block Layout Size & Border Color */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">عرض المستطيل</label>
                <select
                  value={selectedBlock.widthSpan || 'half'}
                  onChange={(e) => updateBlock(selectedBlock.id, { widthSpan: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="half">نصف الصفحة (1/2)</option>
                  <option value="full">عرض كامل (100%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">لون الإطار</label>
                <select
                  value={selectedBlock.borderColor || 'blue'}
                  onChange={(e) => {
                    const selectedColorObj = COLOR_OPTIONS.find(c => c.id === e.target.value);
                    updateBlock(selectedBlock.id, { 
                      borderColor: e.target.value,
                      bgColor: selectedColorObj?.bg || selectedBlock.bgColor
                    });
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                >
                  {COLOR_OPTIONS.map(col => (
                    <option key={col.id} value={col.id}>{col.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">نمط الإطار</label>
                <select
                  value={selectedBlock.borderStyle || 'solid'}
                  onChange={(e) => updateBlock(selectedBlock.id, { borderStyle: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="solid">متصل عادي</option>
                  <option value="dashed">متقطع (تتبع/قص)</option>
                  <option value="thick">إطار عريض</option>
                </select>
              </div>
            </div>

            {/* Sub Instructions */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">التوجيه (عربي)</label>
                <input 
                  type="text" 
                  value={selectedBlock.instructionAr || ''} 
                  onChange={(e) => updateBlock(selectedBlock.id, { instructionAr: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold"
                  placeholder="انظر إلى الصورة..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">التوجيه (إنجليزي)</label>
                <input 
                  type="text" 
                  value={selectedBlock.instructionEn || ''} 
                  onChange={(e) => updateBlock(selectedBlock.id, { instructionEn: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold"
                  placeholder="Look at the picture..."
                />
              </div>
            </div>

            {/* Block Inner Content Type */}
            <div className="space-y-2 border-t border-slate-200 pt-2">
              <label className="block text-[10px] font-bold text-slate-700">نوع المحتوى داخل المربع</label>
              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => updateBlock(selectedBlock.id, { contentType: 'image' })}
                  className={`p-1.5 rounded border text-[10px] font-bold flex flex-col items-center gap-1 transition ${
                    selectedBlock.contentType === 'image' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>صورة</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateBlock(selectedBlock.id, { contentType: 'text' })}
                  className={`p-1.5 rounded border text-[10px] font-bold flex flex-col items-center gap-1 transition ${
                    selectedBlock.contentType === 'text' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>نص / مفردات</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateBlock(selectedBlock.id, { contentType: 'tracing' })}
                  className={`p-1.5 rounded border text-[10px] font-bold flex flex-col items-center gap-1 transition ${
                    selectedBlock.contentType === 'tracing' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>تتبع خطوط</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateBlock(selectedBlock.id, { contentType: 'matching' })}
                  className={`p-1.5 rounded border text-[10px] font-bold flex flex-col items-center gap-1 transition ${
                    selectedBlock.contentType === 'matching' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>مطابقة</span>
                </button>
              </div>

              {/* Dynamic Content Inputs */}
              {selectedBlock.contentType === 'image' && (
                <div className="space-y-1.5 mt-2 bg-white p-2 rounded-lg border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-600">رابط الصورة (Image URL)</label>
                  <input 
                    type="text" 
                    value={selectedBlock.imageUrl || ''} 
                    onChange={(e) => updateBlock(selectedBlock.id, { imageUrl: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                    placeholder="https://..."
                  />
                  <input 
                    type="text" 
                    value={selectedBlock.textAr || ''} 
                    onChange={(e) => updateBlock(selectedBlock.id, { textAr: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                    placeholder="العنوان أو التعليق أسفل الصورة..."
                  />
                </div>
              )}

              {selectedBlock.contentType === 'tracing' && (
                <div className="space-y-1.5 mt-2 bg-white p-2 rounded-lg border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-600">النص المتقطع للتتبع</label>
                  <input 
                    type="text" 
                    value={selectedBlock.tracingText || ''} 
                    onChange={(e) => updateBlock(selectedBlock.id, { tracingText: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                    placeholder="Head / رأس"
                  />
                </div>
              )}

              {selectedBlock.contentType === 'text' && (
                <div className="space-y-1.5 mt-2 bg-white p-2 rounded-lg border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-600">النص العربي (مفردات/نقاط)</label>
                  <textarea 
                    rows={2}
                    value={selectedBlock.textAr || ''} 
                    onChange={(e) => updateBlock(selectedBlock.id, { textAr: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs leading-relaxed"
                    placeholder="• Head / رأس..."
                  />
                </div>
              )}

              {selectedBlock.contentType === 'matching' && (
                <div className="space-y-1.5 mt-2 bg-white p-2 rounded-lg border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">عناصر الوصل / المطابقة (Left ➔ Right)</label>
                  {(selectedBlock.matchingPairs || []).map((pair, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-1 text-xs">
                      <input 
                        type="text" 
                        value={pair.left} 
                        onChange={(e) => {
                          const pairs = [...(selectedBlock.matchingPairs || [])];
                          pairs[pIdx] = { ...pairs[pIdx], left: e.target.value };
                          updateBlock(selectedBlock.id, { matchingPairs: pairs });
                        }}
                        className="flex-1 p-1 border rounded text-[11px]"
                        placeholder="العنصر 1"
                      />
                      <span className="text-slate-400 font-bold">➔</span>
                      <input 
                        type="text" 
                        value={pair.right} 
                        onChange={(e) => {
                          const pairs = [...(selectedBlock.matchingPairs || [])];
                          pairs[pIdx] = { ...pairs[pIdx], right: e.target.value };
                          updateBlock(selectedBlock.id, { matchingPairs: pairs });
                        }}
                        className="flex-1 p-1 border rounded text-[11px]"
                        placeholder="العنصر المقابل"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const pairs = [...(selectedBlock.matchingPairs || [])];
                      pairs.push({ left: 'عنصر جديد', right: 'المطابق' });
                      updateBlock(selectedBlock.id, { matchingPairs: pairs });
                    }}
                    className="text-[10px] font-bold text-brand-600 hover:underline pt-1 block"
                  >
                    + إضافة زوج مطابقة جديد
                  </button>
                </div>
              )}

            </div>
          </div>
        ) : (
          <p className="text-center text-slate-400 py-4 font-semibold">اختر مستطيلاً من القائمة أعلاه لتعديله أو انقر إضافة مستطيل جديد</p>
        )}
      </div>

    </div>
  );
};
