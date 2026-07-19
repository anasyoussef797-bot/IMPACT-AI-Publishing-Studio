/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePublishingStore } from '../store/publishingStore';
import { useTranslation } from '../localization';
import { ShieldCheck, GraduationCap, Award, Palette, CheckCircle2, ChevronRight, FileCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function BookPlanReviewView() {
  const { t } = useTranslation();
  const { currentBook, approvePlan, navigateStage } = usePublishingStore();
  const [loading, setLoading] = useState(false);

  if (!currentBook) return null;

  const handleApprove = () => {
    setLoading(true);
    setTimeout(() => {
      approvePlan();
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8" id="book-plan-review-view">
      {/* Header */}
      <div className="bg-white border border-neutral-border p-6 rounded shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            {t('review_header')}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            {t('review_desc')}
          </p>
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={() => navigateStage('planning')}
            title={t('tooltip_prev_stage_btn')}
            className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('modify_syllabus_btn')}
          </button>
          
          <button
            onClick={handleApprove}
            disabled={loading}
            title={t('tooltip_approve_plan_btn')}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold rounded shadow-md hover:shadow-lg transition-all"
          >
            <FileCheck className="w-4 h-4" />
            {loading ? t('consulting_board') : t('approve_plan_btn')}
          </button>
        </div>
      </div>

      {/* Advisory Desks Panel Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Desk 1: Curriculum Designer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-neutral-border rounded p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 flex-shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-display font-bold text-slate-800 leading-tight">
                  {t('panel_curriculum_designer')}
                </h4>
                <span className="text-[10px] font-mono font-medium text-indigo-600 uppercase">{t('board_certification_desk')}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans mb-4">
              "{t('curriculum_designer_critique')}"
            </p>

            <ul className="space-y-2 text-[11px] text-slate-500 font-sans">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {t('chapters_count', { count: currentBook.chapters.length })}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {t('field_lang')}: <b>{currentBook.metadata.language.toUpperCase()}</b>
              </li>
            </ul>
          </div>
          
          <div className="pt-4 border-t border-slate-100 mt-6 text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">
            {t('syllabus_approved_stamp')}
          </div>
        </motion.div>

        {/* Desk 2: Educational Expert */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-neutral-border rounded p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-display font-bold text-slate-800 leading-tight">
                  {t('panel_educational_expert')}
                </h4>
                <span className="text-[10px] font-mono font-medium text-emerald-600 uppercase">{t('cognitive_load_desk')}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans mb-4">
              "{t('educational_expert_critique')}"
            </p>

            <ul className="space-y-2 text-[11px] text-slate-500 font-sans">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {t('field_age')}: {t(`age_${currentBook.metadata.ageGroup}`)}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {t('measurable_milestones')}: {t('milestones_mapped')}
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6 text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">
            {t('pedagogics_approved_stamp')}
          </div>
        </motion.div>

        {/* Desk 3: Art Director */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border border-neutral-border rounded p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-display font-bold text-slate-800 leading-tight">
                  {t('panel_art_director')}
                </h4>
                <span className="text-[10px] font-mono font-medium text-amber-600 uppercase">{t('visual_layout_desk')}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans mb-4">
              "{t('art_director_critique')}"
            </p>

            <ul className="space-y-2 text-[11px] text-slate-500 font-sans">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {t('field_dimensions')}: {currentBook.metadata.dimensions.width} x {currentBook.metadata.dimensions.height} {currentBook.metadata.dimensions.unit}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {t('bleed_guide_text')}: {currentBook.metadata.bleed}in
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6 text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">
            {t('graphics_approved_stamp')}
          </div>
        </motion.div>

      </div>

      {/* Book Summary Card */}
      <div className="bg-neutral-background border border-neutral-border rounded p-6">
        <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold mb-4">{t('commissioned_syllabus_summary')}</h4>
        <div className="divide-y divide-slate-100">
          {currentBook.chapters.map((ch, i) => (
            <div key={ch.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-slate-400">0{i + 1}</span>
                <span className="font-display font-bold text-slate-800">{ch.title}</span>
                <span className="text-[10px] text-slate-400 font-sans line-clamp-1">— {ch.description}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-brand-50 text-brand-700 font-mono text-[10px] rounded">{t('chapters_label')} {ch.pageRange[0]}-{ch.pageRange[1]}</span>
                <span className="text-[10px] font-mono text-slate-400">{ch.learningObjectives.length} {t('measurable_milestones')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
