/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePublishingStore } from '../store/publishingStore';
import { useTranslation } from '../localization';
import { ShieldCheck, GraduationCap, Award, Palette, CheckCircle2, ChevronRight, FileCheck, ArrowLeft, RefreshCw, AlertTriangle, AlertCircle, Info, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function BookPlanReviewView() {
  const { t } = useTranslation();
  const { currentBook, approvePlan, navigateStage, generateChaptersAI, isAiGenerating } = usePublishingStore();
  const [loading, setLoading] = useState(false);

  if (!currentBook) return null;

  const handleApprove = () => {
    setLoading(true);
    setTimeout(() => {
      approvePlan();
      setLoading(false);
    }, 1500);
  };

  const handleRegenerate = async () => {
    await generateChaptersAI();
  };

  return (
    <div className="space-y-8" id="book-plan-review-view">
      {/* Header */}
      <div className="bg-white border border-neutral-border p-6 rounded shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
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
            onClick={handleRegenerate}
            disabled={isAiGenerating}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 border border-slate-200 font-sans text-xs font-semibold rounded transition-all"
            title="Request AI to regenerate curriculum chapters"
          >
            <RefreshCw className={`w-4 h-4 ${isAiGenerating ? 'animate-spin' : ''}`} />
            {isAiGenerating ? 'Regenerating...' : 'Request Regeneration'}
          </button>
          
          <button
            onClick={handleApprove}
            disabled={loading || isAiGenerating}
            title={t('tooltip_approve_plan_btn')}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-sans text-xs font-semibold rounded shadow-md hover:shadow-lg transition-all"
          >
            <FileCheck className="w-4 h-4" />
            {loading ? t('consulting_board') : t('approve_plan_btn')}
          </button>
        </div>
      </div>

      {/* Structured AI Review Panel Checkpoint (Status, Completed Tasks, Warnings, Suggestions) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left column: Status Card & Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-neutral-border rounded p-5 shadow-xs text-center space-y-4">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">
              Editorial Status
            </span>
            <div className="py-4 bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center">
              <span className="relative flex h-3 w-3 mb-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-sans font-extrabold text-emerald-800 uppercase tracking-tight">
                Plan Auto-Drafted
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold mt-1">Ready for Approval</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              The AI Co-pilot has fully compiled the initial curriculum planning, age-group layouts, and learning checkpoints under active Montessori target parameters.
            </p>

            <button
              onClick={handleRegenerate}
              disabled={isAiGenerating}
              className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 text-xs font-mono font-bold rounded flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {isAiGenerating ? 'Consulting board...' : 'Regenerate Syllabus'}
            </button>
          </div>

          <div className="bg-brand-50/50 border border-brand-100 p-5 rounded-xl space-y-1">
            <span className="text-[9px] uppercase font-mono font-bold text-brand-700 tracking-wider block">Scope Target</span>
            <p className="text-xs text-brand-800 font-sans leading-relaxed">
              Curriculum aligned to <b>Montessori Early Grades</b>. Target length is {currentBook.metadata.targetPages || 72} pages.
            </p>
          </div>
        </div>

        {/* Right column: Task Lists, Warnings, Suggestions */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Completed Tasks Box */}
          <div className="bg-white border border-neutral-border rounded p-5 shadow-xs space-y-4">
            <h3 className="text-xs uppercase font-mono font-bold text-emerald-600 tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Completed Tasks
            </h3>
            <ul className="space-y-3">
              <li className="text-xs text-slate-600 font-sans flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                Syllabus targets successfully parsed for Montessori child learning milestones.
              </li>
              <li className="text-xs text-slate-600 font-sans flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                Age group parameters calibrated for target range: <b>{t(`age_${currentBook.metadata.ageGroup}`)}</b>.
              </li>
              <li className="text-xs text-slate-600 font-sans flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                Checkpoints mapped: {currentBook.chapters.length} chapters across {currentBook.chapters[currentBook.chapters.length - 1]?.pageRange[1] || 12} content pages.
              </li>
            </ul>
          </div>

          {/* Warnings Box */}
          <div className="bg-white border border-neutral-border rounded p-5 shadow-xs space-y-4">
            <h3 className="text-xs uppercase font-mono font-bold text-amber-600 tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Warnings
            </h3>
            <ul className="space-y-3">
              <li className="text-xs text-slate-600 font-sans flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                Vocabulary density might be slightly advanced for the youngest age demographics on chapter 3.
              </li>
              <li className="text-xs text-slate-600 font-sans flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                Check that double-page illustration layouts are bounded inside safe trim limits (0.125in bleed bounds).
              </li>
            </ul>
          </div>

          {/* Suggestions Box */}
          <div className="bg-white border border-neutral-border rounded p-5 shadow-xs space-y-4">
            <h3 className="text-xs uppercase font-mono font-bold text-indigo-600 tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-500" />
              Suggestions
            </h3>
            <ul className="space-y-3">
              <li className="text-xs text-slate-600 font-sans flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                Incorporate letter-tracing activities for alphabetic recognition in early chapters.
              </li>
              <li className="text-xs text-slate-600 font-sans flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                Configure a dedicated 5-color coloring crayon palette to guide child sensory interaction on coloring sheets.
              </li>
            </ul>
          </div>

        </div>

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
