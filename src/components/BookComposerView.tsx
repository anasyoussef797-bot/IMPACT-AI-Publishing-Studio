/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { usePublishingStore } from '../store/publishingStore';
import { useTranslation } from '../localization';
import { BookOpen, Plus, Trash2, ArrowRight, Sparkles, Wand2, Type as FontIcon, PenTool, Layout, Image, Layers, HelpCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Page, LayoutType } from '../types';

export default function BookComposerView() {
  const { t } = useTranslation();
  const { 
    currentBook, 
    addBlankPage, 
    updatePage, 
    deletePage, 
    generatePageAsset, 
    generatePageText, 
    navigateStage, 
    isAiGenerating, 
    aiStatusMessage 
  } = usePublishingStore();

  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  // Auto select first page on load
  useEffect(() => {
    if (currentBook && currentBook.pages.length > 0 && !selectedPageId) {
      setSelectedPageId(currentBook.pages[0].id);
    }
  }, [currentBook, selectedPageId]);

  if (!currentBook) return null;

  const activePage = currentBook.pages.find(p => p.id === selectedPageId) || currentBook.pages[0];

  const handleLayoutChange = (val: LayoutType) => {
    if (activePage) {
      updatePage(activePage.id, { layoutType: val });
    }
  };

  const handleTitleChange = (val: string) => {
    if (activePage) {
      updatePage(activePage.id, { title: val });
    }
  };

  const handleTextChange = (val: string) => {
    if (activePage) {
      updatePage(activePage.id, { textContent: val });
    }
  };

  const [illustrationPrompt, setIllustrationPrompt] = useState('');
  const handleIllustrationTrigger = async () => {
    if (activePage && illustrationPrompt.trim()) {
      const artType = activePage.layoutType === 'coloring' ? 'coloring' : 'illustration';
      await generatePageAsset(activePage.id, illustrationPrompt, artType);
      setIllustrationPrompt('');
    }
  };

  const [writerDescription, setWriterDescription] = useState('');
  const handleWriterTrigger = async () => {
    if (activePage && writerDescription.trim()) {
      await generatePageText(activePage.id, writerDescription);
      setWriterDescription('');
    }
  };

  const handleActivityTypeChange = (type: any) => {
    if (activePage) {
      const currentActivity = activePage.activity || { id: `act-${Date.now()}`, type: 'tracing', instructions: '', difficulty: 'easy' };
      updatePage(activePage.id, {
        activity: {
          ...currentActivity,
          type
        }
      });
    }
  };

  const handleActivityInstructionsChange = (instructions: string) => {
    if (activePage) {
      const currentActivity = activePage.activity || { id: `act-${Date.now()}`, type: 'tracing', instructions: '', difficulty: 'easy' };
      updatePage(activePage.id, {
        activity: {
          ...currentActivity,
          instructions
        }
      });
    }
  };

  const handleActivityDifficultyChange = (difficulty: any) => {
    if (activePage) {
      const currentActivity = activePage.activity || { id: `act-${Date.now()}`, type: 'tracing', instructions: '', difficulty: 'easy' };
      updatePage(activePage.id, {
        activity: {
          ...currentActivity,
          difficulty
        }
      });
    }
  };

  const handleAddPage = () => {
    addBlankPage();
    setTimeout(() => {
      if (currentBook.pages.length > 0) {
        setSelectedPageId(currentBook.pages[currentBook.pages.length - 1].id);
      }
    }, 100);
  };

  const handleProceedToPreflight = () => {
    navigateStage('quality-review');
  };

  const getHumanizedStatusMessage = (msg: string) => {
    if (msg.includes('generating') || msg.includes('Generating')) return 'Preparing your book...';
    if (msg.includes('validation') || msg.includes('preflight')) return 'Reviewing educational quality...';
    if (msg.includes('analysis') || msg.includes('consistency')) return 'Improving page consistency...';
    if (msg.includes('prompt') || msg.includes('Prompt') || msg.includes('Preparing')) return 'Preparing creative instructions...';
    if (msg.includes('illustration') || msg.includes('images') || msg.includes('Creating')) return 'Creating illustrations...';
    if (msg.includes('PDF') || msg.includes('print')) return 'Preparing print-ready files...';
    return msg || 'Analyzing page coordinates...';
  };

  return (
    <div className="space-y-8" id="book-composer-view">
      
      {/* View Header */}
      <div className="bg-white border border-neutral-border p-6 rounded shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2 mb-1.5">
            <BookOpen className="w-5 h-5 text-brand-500" />
            {t('composer_header')}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            {t('composer_desc')}
          </p>
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={() => navigateStage('plan-review')}
            title={t('tooltip_prev_stage_btn')}
            className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('review_outline_btn')}
          </button>
          
          <button
            onClick={handleProceedToPreflight}
            disabled={currentBook.pages.length === 0}
            title={t('tooltip_next_stage_btn')}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-sans text-xs font-semibold rounded shadow transition"
          >
            {t('review_preflight_btn')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Composer Layout Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Pages Sorter list (2 cols) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
              {t('trim_pages')}
            </h3>
            <button
              onClick={handleAddPage}
              className="p-1 hover:bg-brand-50 text-brand-600 hover:text-brand-700 rounded transition"
              title={t('tooltip_add_page_btn')}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {currentBook.pages.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPageId(p.id)}
                title={t('tooltip_select_page_btn')}
                className={`w-full text-left p-3 border rounded text-xs transition flex items-center justify-between ${
                  activePage?.id === p.id 
                    ? 'border-brand-500 bg-brand-50/30 text-brand-800 font-semibold' 
                    : 'border-neutral-border hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-slate-100 rounded-sm flex items-center justify-center font-mono font-bold text-[10px] text-slate-500">
                    {p.pageNumber}
                  </span>
                  <span className="truncate max-w-[100px]">{p.title || t('untitled_page')}</span>
                </span>
                
                <span className="text-[9px] uppercase font-mono text-slate-400 font-semibold bg-slate-100 px-1 py-0.5 rounded-xs">
                  {p.layoutType.split('-')[0]}
                </span>
              </button>
            ))}
            
            <button
              onClick={handleAddPage}
              title={t('tooltip_add_page_btn')}
              className="w-full py-4 border-2 border-dashed border-neutral-border text-slate-400 hover:text-brand-500 hover:border-brand-300 rounded text-xs font-sans font-medium flex flex-col items-center justify-center gap-1 bg-white hover:bg-brand-50/5 transition"
            >
              <Plus className="w-4 h-4" />
              {t('add_trim_page_btn')}
            </button>
          </div>
        </div>

        {/* Center Column: Interactive Graphic Trim Preview (6 cols) */}
        <div className="xl:col-span-6 space-y-4">
          <h3 className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
            {t('prepress_print_preview_title')}
          </h3>

          {activePage ? (
            <div className="bg-slate-100 border border-neutral-border p-6 rounded flex items-center justify-center min-h-[480px] relative">
              
              {/* Paper bounding container styled with standard cropping rulers */}
              <div 
                className="bg-white border-2 border-neutral-border shadow-md relative overflow-hidden transition-all duration-300"
                style={{
                  width: '340px',
                  height: '440px',
                  borderColor: '#c5c2ba'
                }}
              >
                {/* Safe margin zone dashed bounding box */}
                <div className="absolute inset-4 border border-dashed border-rose-300/40 pointer-events-none flex items-center justify-center">
                  <div className="absolute top-1 right-2 text-[8px] font-mono text-rose-300/70 select-none">{t('safe_margin_limits_guide')}</div>
                </div>

                {/* Bleed outline ruler guide */}
                <div className="absolute inset-1.5 border border-dashed border-cyan-400/40 pointer-events-none">
                  <div className="absolute bottom-1 left-2 text-[8px] font-mono text-cyan-400/70 select-none">{t('bleed_guide_text')}</div>
                </div>

                {/* Page Numbering Footers */}
                <div className="absolute bottom-3 left-0 right-0 text-center text-[10px] font-mono font-bold text-slate-400">
                  {activePage.pageNumber}
                </div>

                {/* Simulated page layouts depending on selection */}
                <div className="p-8 h-full flex flex-col justify-between select-none">
                  
                  {/* TITLE PAGE LAYOUT */}
                  {activePage.layoutType === 'title' && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                      {activePage.illustrationUrl && (
                        <img 
                          src={activePage.illustrationUrl} 
                          alt="Layout illustration" 
                          referrerPolicy="no-referrer"
                          className="w-32 h-32 object-cover rounded shadow-xs" 
                        />
                      )}
                      <div className="space-y-1">
                        <h4 className="text-lg font-display font-bold text-brand-700 tracking-tight leading-snug">
                          {activePage.title || t('untitled_page')}
                        </h4>
                        <p className="text-xs text-slate-500 font-sans max-w-[200px] leading-relaxed mx-auto">
                          {activePage.textContent || 'Your story content goes here.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* FULL ILLUSTRATION LAYOUT */}
                  {activePage.layoutType === 'full-illustration' && (
                    <div className="h-full flex flex-col items-center justify-between text-center space-y-4">
                      <div className="w-full flex-1 bg-slate-50 rounded border border-neutral-border overflow-hidden relative flex items-center justify-center">
                        {activePage.illustrationUrl ? (
                          <img 
                            src={activePage.illustrationUrl} 
                            alt="Layout illustration" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="flex flex-col items-center p-4">
                            <Image className="w-8 h-8 text-slate-300 mb-2" />
                            <span className="text-[10px] text-slate-400 font-mono">{t('no_illustration_generated')}</span>
                          </div>
                        )}
                      </div>
                      <h4 className="text-sm font-display font-bold text-brand-700">
                        {activePage.title || t('untitled_page')}
                      </h4>
                    </div>
                  )}

                  {/* TEXT & ILLUSTRATION / TRACING / COLORING / ACTIVITY LAYOUTS */}
                  {activePage.layoutType !== 'title' && activePage.layoutType !== 'full-illustration' && (
                    <div className="h-full flex flex-col justify-between space-y-4">
                      <div className="flex gap-3">
                        {activePage.illustrationUrl && (
                          <img 
                            src={activePage.illustrationUrl} 
                            alt="Layout illustration" 
                            referrerPolicy="no-referrer"
                            className="w-20 h-20 object-cover rounded border border-neutral-border flex-shrink-0" 
                          />
                        )}
                        <div>
                          <h4 className="text-xs font-display font-bold text-brand-700 tracking-tight">
                            {activePage.title || t('untitled_page')}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-sans line-clamp-4 leading-relaxed mt-1">
                            {activePage.textContent || 'Your story content goes here.'}
                          </p>
                        </div>
                      </div>

                      {/* Display Activity elements if configured */}
                      {activePage.activity && (
                        <div className="p-3 bg-slate-50 border border-neutral-border rounded">
                          <span className="text-[8px] uppercase font-mono text-brand-700 font-bold block mb-1">
                            {t('classroom_activity')} [{activePage.activity.type.toUpperCase()}]
                          </span>
                          <p className="text-[10px] text-slate-600 font-sans leading-relaxed">
                            {activePage.activity.instructions || t('no_instructions_provided')}
                          </p>
                          
                          {/* Tracing lines simulator */}
                          {activePage.activity.type === 'tracing' && (
                            <div className="mt-2 h-8 border border-dashed border-slate-300 rounded flex items-center justify-center">
                              <span className="text-lg font-display text-slate-300 tracking-widest line-through">A B C D E</span>
                            </div>
                          )}

                          {/* Coloring simulator placeholder */}
                          {activePage.activity.type === 'coloring' && (
                            <div className="mt-2 h-8 border border-neutral-border bg-white rounded flex items-center justify-center">
                              <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">🎨 {t('palette_coloring_boundaries')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

              {/* Delete Active Page Floating Badge */}
              <button
                onClick={() => {
                  if (activePage) {
                    deletePage(activePage.id);
                  }
                }}
                className="absolute top-4 right-4 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-neutral-border p-2 rounded shadow transition"
                title={t('tooltip_delete_page_btn')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 border border-neutral-border p-20 rounded text-center text-slate-400">
              {t('no_pages_initialized_yet')}
            </div>
          )}
        </div>

        {/* Right Column: Page Editorial Customization Suite (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          <h3 className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
            {t('editorial_controls')}
          </h3>

          {activePage ? (
            <div className="space-y-6">
              
              {/* Layout Properties */}
              <div className="bg-white border border-neutral-border p-5 rounded shadow-xs space-y-4">
                <h4 className="text-xs uppercase font-mono font-bold text-slate-500 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <Layout className="w-4 h-4 text-brand-500" />
                  {t('layout_specifications')}
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'title', label: t('cover_title_page') },
                    { type: 'text-illustration', label: t('text_plate') },
                    { type: 'full-illustration', label: t('full_page_image') },
                    { type: 'activity', label: t('interactive_activity') },
                    { type: 'tracing', label: t('writing_tracing') },
                    { type: 'coloring', label: t('coloring_sheet') },
                  ].map((lay) => (
                    <button
                      key={lay.type}
                      onClick={() => handleLayoutChange(lay.type as LayoutType)}
                      title={t('tooltip_calibration_btn')}
                      className={`p-2 border text-[10px] rounded text-left font-sans transition flex items-center justify-between ${
                        activePage.layoutType === lay.type
                          ? 'border-brand-500 bg-brand-50/20 text-brand-800 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      {lay.label}
                    </button>
                  ))}
                </div>

                {/* Page Title text input */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                    {t('trim_page_header')}
                  </label>
                  <input
                    type="text"
                    value={activePage.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder={t('page_title_placeholder')}
                    className="w-full px-3 py-2 border border-neutral-border rounded text-xs focus:outline-hidden bg-neutral-background"
                  />
                </div>
              </div>

              {/* Educational content editor */}
              <div className="bg-white border border-neutral-border p-5 rounded shadow-xs space-y-4">
                <h4 className="text-xs uppercase font-mono font-bold text-slate-500 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <FontIcon className="w-4 h-4 text-brand-500" />
                  {t('syllabus_copywriter')}
                </h4>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                    {t('field_syllabus_plan')}
                  </label>
                  <textarea
                    rows={3}
                    value={activePage.textContent || ''}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder={t('page_text_placeholder')}
                    className="w-full px-3 py-2 border border-neutral-border rounded text-xs focus:outline-hidden bg-neutral-background resize-none leading-relaxed"
                  />
                </div>

                {/* Prompt generator write button */}
                <div className="pt-2">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                    {t('instruct_editorial_writer')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={writerDescription}
                      onChange={(e) => setWriterDescription(e.target.value)}
                      placeholder={t('writer_prompt_placeholder')}
                      className="flex-1 px-3 py-2 border border-neutral-border rounded text-xs bg-neutral-background focus:outline-hidden"
                    />
                    <button
                      onClick={handleWriterTrigger}
                      disabled={isAiGenerating || !writerDescription.trim()}
                      title={t('tooltip_ai_draft_text_btn')}
                      className="px-3 bg-brand-50 text-brand-700 border border-brand-100 hover:bg-brand-500 hover:text-white rounded text-xs font-bold transition flex items-center gap-1"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      {t('draft_btn')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Art Direction Console (Illustrator) */}
              <div className="bg-white border border-neutral-border p-5 rounded shadow-xs space-y-4">
                <h4 className="text-xs uppercase font-mono font-bold text-slate-500 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <Image className="w-4 h-4 text-brand-500" />
                  {t('art_director_desk')}
                </h4>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                    {t('plate_art_guidelines')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={illustrationPrompt}
                      onChange={(e) => setIllustrationPrompt(e.target.value)}
                      placeholder={t('art_prompt_placeholder')}
                      className="flex-1 px-3 py-2 border border-neutral-border rounded text-xs bg-neutral-background focus:outline-hidden"
                    />
                    <button
                      onClick={handleIllustrationTrigger}
                      disabled={isAiGenerating || !illustrationPrompt.trim()}
                      title={t('tooltip_ai_commission_art_btn')}
                      className="px-3 bg-brand-50 text-brand-700 border border-brand-100 hover:bg-brand-500 hover:text-white rounded text-xs font-bold transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {t('commission_btn')}
                    </button>
                  </div>
                </div>

                {activePage.illustrationPrompt && (
                  <div className="bg-slate-50 border border-neutral-border p-2.5 rounded text-[10px] text-slate-500 font-sans leading-relaxed">
                    <span className="font-mono font-bold text-slate-400 block mb-0.5">{t('active_art_direction')}</span>
                    "{activePage.illustrationPrompt}"
                  </div>
                )}
              </div>

              {/* Classroom Activity Builder */}
              {(activePage.layoutType === 'activity' || activePage.layoutType === 'tracing' || activePage.layoutType === 'coloring') && (
                <div className="bg-white border border-neutral-border p-5 rounded shadow-xs space-y-4">
                  <h4 className="text-xs uppercase font-mono font-bold text-slate-500 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                    <PenTool className="w-4 h-4 text-brand-500" />
                    {t('activity_builder')}
                  </h4>

                  <div className="space-y-3">
                    {/* Activity Type selection */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                        {t('activity_type_label')}
                      </label>
                      <select
                        value={activePage.activity?.type || 'tracing'}
                        onChange={(e) => handleActivityTypeChange(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-neutral-border rounded text-xs bg-neutral-background focus:outline-hidden"
                      >
                        <option value="tracing">{t('opt_tracing_letters')}</option>
                        <option value="coloring">{t('opt_coloring_page')}</option>
                        <option value="match-up">{t('opt_matching_pairs')}</option>
                        <option value="fill-blank">{t('opt_fill_blank')}</option>
                        <option value="math-problems">{t('opt_math_problems')}</option>
                      </select>
                    </div>

                    {/* Pupil Instructions */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                        {t('activity_instruction')}
                      </label>
                      <textarea
                        rows={2}
                        value={activePage.activity?.instructions || ''}
                        onChange={(e) => handleActivityInstructionsChange(e.target.value)}
                        placeholder={t('pupil_instructions_placeholder')}
                        className="w-full px-3 py-2 border border-neutral-border rounded text-xs focus:outline-hidden bg-neutral-background resize-none leading-relaxed"
                      />
                    </div>

                    {/* Difficulty */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                        {t('grading_difficulty_range')}
                      </label>
                      <div className="flex gap-2">
                        {['easy', 'medium', 'hard'].map((diff) => (
                          <button
                            key={diff}
                            onClick={() => handleActivityDifficultyChange(diff)}
                            title={t('tooltip_difficulty_btn')}
                            className={`flex-1 py-1 text-[10px] font-sans font-semibold rounded border uppercase transition ${
                              activePage.activity?.difficulty === diff
                                ? 'bg-brand-50 border-brand-300 text-brand-800'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <p className="text-xs text-slate-400">{t('initialize_pages_control_placeholder')}</p>
          )}
        </div>

      </div>

      {/* Humanized AI Overlay Loading Spinner Block */}
      {isAiGenerating && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs z-50 flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-neutral-border p-8 rounded shadow-2xl flex flex-col items-center max-w-sm text-center"
          >
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h4 className="text-sm font-display font-bold text-slate-800 mb-1">
              {getHumanizedStatusMessage(aiStatusMessage)}
            </h4>
            <p className="text-[11px] text-slate-400 font-sans">
              {t('ai_overlay_patience_desc')}
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
