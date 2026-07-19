/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePublishingStore } from '../store/publishingStore';
import { useTranslation } from '../localization';
import { CheckCircle, Award, FileText, Download, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export default function BookDoneView() {
  const { t } = useTranslation();
  const { currentBook, resetActiveProject } = usePublishingStore();

  if (!currentBook) return null;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4" id="book-done-view">
      
      {/* Celebration Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-neutral-border rounded shadow-xl p-8 md:p-12 text-center space-y-6"
      >
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-xs">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
            {t('done_header')}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            {t('done_desc')}
          </p>
        </div>

        {/* Book summary pill */}
        <div className="bg-slate-50 border border-neutral-border p-4 rounded text-left max-w-md mx-auto flex items-start gap-4">
          <Award className="w-6 h-6 text-brand-500 mt-1 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-400">{t('certified_press_volume')}</h4>
            <h3 className="text-sm font-display font-bold text-slate-800 mt-0.5">{currentBook.metadata.title}</h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              {t('chapters_label')}: {currentBook.chapters.length} | {t('trim_sheets_label')}: {currentBook.pages.length}
            </p>
          </div>
        </div>

        {/* Printable output downloads list */}
        <div className="space-y-3 max-w-md mx-auto pt-4 text-left">
          <h4 className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">{t('generated_plate_packages')}</h4>
          
          {/* Download 1 */}
          <div className="flex items-center justify-between p-3 border border-slate-100 rounded hover:border-slate-200 transition">
            <span className="text-xs font-sans font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-500" />
              {t('cmyk_print_ready_pdf')}
            </span>
            <button 
              title={t('tooltip_download_btn')}
              className="flex items-center gap-1 text-[10px] uppercase font-mono font-bold text-brand-600 hover:text-brand-800"
            >
              <Download className="w-3.5 h-3.5" />
              {t('bleed_suffix')}
            </button>
          </div>

          {/* Download 2 */}
          <div className="flex items-center justify-between p-3 border border-slate-100 rounded hover:border-slate-200 transition">
            <span className="text-xs font-sans font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-500" />
              {t('high_res_illustrations_archive')}
            </span>
            <button 
              title={t('tooltip_download_btn')}
              className="flex items-center gap-1 text-[10px] uppercase font-mono font-bold text-brand-600 hover:text-brand-800"
            >
              <Download className="w-3.5 h-3.5" />
              {t('dpi_png_suffix')}
            </button>
          </div>

          {/* Download 3 */}
          <div className="flex items-center justify-between p-3 border border-slate-100 rounded hover:border-slate-200 transition">
            <span className="text-xs font-sans font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-500" />
              {t('syllabus_alignment_ledger')}
            </span>
            <button 
              title={t('tooltip_download_btn')}
              className="flex items-center gap-1 text-[10px] uppercase font-mono font-bold text-brand-600 hover:text-brand-800"
            >
              <Download className="w-3.5 h-3.5" />
              {t('standards_check')}
            </button>
          </div>
        </div>

        {/* Return action button */}
        <div className="pt-6 border-t border-slate-100 max-w-md mx-auto">
          <button
            onClick={resetActiveProject}
            title={t('tooltip_start_another_btn')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-600 text-white font-sans font-semibold text-xs rounded shadow transition"
          >
            <RefreshCw className="w-4 h-4" />
            {t('start_another_btn')}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
