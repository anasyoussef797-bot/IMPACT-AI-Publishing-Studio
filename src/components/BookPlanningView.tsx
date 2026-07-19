/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { usePublishingStore } from '../store/publishingStore';
import { useTranslation } from '../localization';
import { Layers, Plus, Trash2, ArrowRight, Sparkles, BookOpen, GraduationCap, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Chapter } from '../types';

export default function BookPlanningView() {
  const { t } = useTranslation();
  const { currentBook, saveChapters, generateChaptersAI, navigateStage, isAiGenerating, aiStatusMessage } = usePublishingStore();

  const [chapters, setLocalChapters] = useState<Chapter[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newObjectives, setNewObjectives] = useState<string[]>([]);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(4);

  useEffect(() => {
    if (currentBook) {
      setLocalChapters(currentBook.chapters || []);
    }
  }, [currentBook]);

  if (!currentBook) return null;

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setNewObjectives([...newObjectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index: number) => {
    setNewObjectives(newObjectives.filter((_, i) => i !== index));
  };

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newChapter: Chapter = {
      id: `ch-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'No description provided.',
      learningObjectives: newObjectives.length > 0 ? newObjectives : ['Acquire target lesson milestones.'],
      pageRange: [startPage, endPage]
    };

    const updated = [...chapters, newChapter];
    setLocalChapters(updated);
    saveChapters(updated);

    // Reset inputs
    setNewTitle('');
    setNewDesc('');
    setNewObjectives([]);
    setStartPage(endPage + 1);
    setEndPage(endPage + 4);
  };

  const handleRemoveChapter = (id: string) => {
    const updated = chapters.filter(ch => ch.id !== id);
    setLocalChapters(updated);
    saveChapters(updated);
  };

  const handleTriggerAIEngine = async () => {
    await generateChaptersAI();
  };

  const handleProceedToReview = () => {
    navigateStage('plan-review');
  };

  return (
    <div className="space-y-8" id="book-planning-view">
      {/* View Header */}
      <div className="bg-white border border-neutral-border p-6 rounded shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2 mb-1.5">
            <Layers className="w-5 h-5 text-brand-500" />
            {t('planning_header')}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            {t('planning_desc')}
          </p>
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleTriggerAIEngine}
            disabled={isAiGenerating}
            title={t('tooltip_generate_chapters_btn')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-mono text-xs font-semibold rounded shadow transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            {isAiGenerating ? aiStatusMessage : t('generate_chapters_ai')}
          </button>

          <button
            onClick={handleProceedToReview}
            disabled={chapters.length < 1}
            title={t('tooltip_next_stage_btn')}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-sans text-xs font-semibold rounded shadow transition"
          >
            {t('next_step')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Objectives Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-50/50 border border-brand-100 p-5 rounded" title={t('field_curriculum')}>
          <span className="text-[10px] uppercase font-mono font-bold text-brand-700 tracking-wider block mb-1">{t('field_curriculum')}</span>
          <p className="text-sm font-sans font-semibold text-brand-800 uppercase">{t(`curr_${currentBook.metadata.targetCurriculum}`)}</p>
        </div>
        <div className="bg-brand-50/50 border border-brand-100 p-5 rounded" title={t('field_age')}>
          <span className="text-[10px] uppercase font-mono font-bold text-brand-700 tracking-wider block mb-1">{t('field_age')}</span>
          <p className="text-sm font-sans font-semibold text-brand-800 uppercase">{t(`age_${currentBook.metadata.ageGroup}`)}</p>
        </div>
        <div className="bg-brand-50/50 border border-brand-100 p-5 rounded" title={t('field_dimensions')}>
          <span className="text-[10px] uppercase font-mono font-bold text-brand-700 tracking-wider block mb-1">{t('field_dimensions')}</span>
          <p className="text-sm font-sans font-semibold text-brand-800">
            {currentBook.metadata.dimensions.width} x {currentBook.metadata.dimensions.height} {currentBook.metadata.dimensions.unit} (Bleed {currentBook.metadata.bleed}in)
          </p>
        </div>
      </div>

      {/* Main Form and Catalog Splitting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Outline Creation Form */}
        <div className="bg-white border border-neutral-border p-6 rounded shadow-xs space-y-6">
          <h3 className="text-sm uppercase font-mono font-bold text-slate-500 tracking-wider border-b border-neutral-border pb-3">
            {t('draft_curriculum_module')}
          </h3>

          <form onSubmit={handleAddChapter} className="space-y-4">
            <div>
              <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">{t('chapter_title_label')}</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t('cognitive_objectives_placeholder')}
                className="w-full px-3 py-2 border border-neutral-border rounded text-xs focus:outline-hidden bg-neutral-background"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">{t('pedagogical_description_label')}</label>
              <textarea
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={t('pedagogical_description_placeholder')}
                className="w-full px-3 py-2 border border-neutral-border rounded text-xs focus:outline-hidden bg-neutral-background resize-none"
              />
            </div>

            {/* Page Ranges */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">{t('start_page_label')}</label>
                <input
                  type="number"
                  value={startPage}
                  onChange={(e) => setStartPage(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-neutral-border rounded text-xs bg-neutral-background"
                />
              </div>
              <div>
                <label className="block text-xs font-sans font-semibold text-slate-600 mb-1">{t('end_page_label')}</label>
                <input
                  type="number"
                  value={endPage}
                  onChange={(e) => setEndPage(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-2 border border-neutral-border rounded text-xs bg-neutral-background"
                />
              </div>
            </div>

            {/* Learning Objectives Builders */}
            <div className="space-y-2">
              <label className="block text-xs font-sans font-semibold text-slate-600">{t('cognitive_objectives_label')}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder={t('cognitive_objectives_placeholder')}
                  className="flex-1 px-3 py-2 border border-neutral-border rounded text-xs bg-neutral-background focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddObjective}
                  title={t('tooltip_add_objective_btn')}
                  className="px-3 bg-brand-50 text-brand-700 hover:bg-brand-500 hover:text-white border border-brand-100 rounded text-xs font-bold transition"
                >
                  {t('add_btn')}
                </button>
              </div>

              {newObjectives.length > 0 && (
                <ul className="bg-slate-50 border border-neutral-border p-2 rounded divide-y divide-slate-200">
                  {newObjectives.map((obj, i) => (
                    <li key={i} className="py-1 text-slate-600 text-[11px] font-sans flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                        {obj}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(i)}
                        title={t('tooltip_remove_objective_btn')}
                        className="text-rose-500 hover:text-rose-700 text-[10px] px-1 font-bold"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="submit"
              title={t('tooltip_add_chapter_btn')}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-brand-50 hover:bg-brand-500 text-brand-700 hover:text-white border border-brand-200 rounded text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('add_chapter_btn')}
            </button>
          </form>
        </div>

        {/* Outline Catalog Layout */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
            {t('chapters_draft_title')}
          </h3>          {chapters.length === 0 ? (
            <div className="bg-white border border-neutral-border p-12 rounded flex flex-col items-center justify-center text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-500 mb-1">{t('no_chapters_outlined')}</p>
              <p className="text-xs text-slate-400 max-w-sm mb-4">{t('no_chapters_outlined_desc')}</p>
              <button
                onClick={handleTriggerAIEngine}
                disabled={isAiGenerating}
                title={t('tooltip_generate_chapters_btn')}
                className="px-4 py-2 bg-brand-50 border border-brand-100 hover:bg-brand-500 hover:text-white text-brand-700 text-xs font-semibold rounded transition"
              >
                {isAiGenerating ? t('consulting_board') : t('draft_via_board_btn')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {chapters.map((ch, idx) => (
                <motion.div
                  key={ch.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white border border-neutral-border p-5 rounded hover:border-brand-100 shadow-xs flex items-start gap-4"
                >
                  {/* Chapter Counter Shield */}
                  <div className="w-10 h-10 bg-brand-50 border border-brand-100 rounded flex items-center justify-center text-brand-700 font-display font-bold flex-shrink-0 text-sm">
                     {idx + 1}
                  </div>
 
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-display font-bold text-slate-800 leading-none">
                        {ch.title}
                      </h4>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-mono">
                          {t('chapters_label')} {ch.pageRange[0]} - {ch.pageRange[1]}
                        </span>
                        <button
                          onClick={() => handleRemoveChapter(ch.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                          title={t('tooltip_remove_chapter_btn')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
 
                    <p className="text-xs text-slate-500 font-sans leading-relaxed">
                      {ch.description}
                    </p>
 
                    {/* Objective Tags */}
                    {ch.learningObjectives && ch.learningObjectives.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[9px] uppercase font-mono font-semibold text-slate-400 block mb-1">{t('measurable_milestones')}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {ch.learningObjectives.map((obj, i) => (
                            <span key={i} className="text-[10px] bg-slate-50 border border-neutral-border px-2 py-0.5 text-slate-600 rounded-sm">
                              {obj}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
