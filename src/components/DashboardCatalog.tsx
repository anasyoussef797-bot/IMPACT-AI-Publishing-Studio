/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePublishingStore } from '../store/publishingStore';
import { useTranslation } from '../localization';
import { BookOpen, Plus, Trash2, Calendar, FileText, ChevronRight, GraduationCap, Scale, Globe, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { BookMetadata, BookType, BookLanguage } from '../types';

export default function DashboardCatalog() {
  const { t, isRtl } = useTranslation();
  const { booksList, selectBook, deleteBook, initializeNewBook } = usePublishingStore();
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [bookType, setBookType] = useState<BookType>('alphabet');
  const [language, setLanguage] = useState<BookLanguage>('en');
  const [ageGroup, setAgeGroup] = useState<BookMetadata['ageGroup']>('preschool');
  const [targetCurriculum, setTargetCurriculum] = useState<BookMetadata['targetCurriculum']>('montessori');
  const [pedagogicalGoal, setPedagogicalGoal] = useState('');
  const [dimensions, setDimensions] = useState({ width: 8.5, height: 11, unit: 'in' as const });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    initializeNewBook({
      title,
      subtitle: subtitle || undefined,
      author: author || undefined,
      bookType,
      language,
      ageGroup,
      targetCurriculum,
      pedagogicalGoal: pedagogicalGoal || 'Develop core cognitive skills aligned to standard levels.',
      dimensions,
      bleed: 0.125,
      margin: 0.5,
    });

    setIsOpen(false);
    // Reset form
    setTitle('');
    setSubtitle('');
    setAuthor('');
    setPedagogicalGoal('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12" id="dashboard-catalog">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-border pb-8 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-700 tracking-tight mb-2">
            {t('welcome_title')}
          </h1>
          <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
            {t('welcome_subtitle')}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          title={t('tooltip_new_project_btn')}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-sans font-medium text-sm rounded shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('new_project_btn')}
        </button>
      </div>

      {/* Books Grid */}
      {booksList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-neutral-border rounded bg-white text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-base font-medium text-slate-600 mb-1">{t('no_books_message')}</p>
          <p className="text-xs text-slate-400 mb-6 max-w-sm">Commission your first book using our educational planner setup.</p>
          <button
            onClick={() => setIsOpen(true)}
            title={t('tooltip_new_project_btn')}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs rounded transition"
          >
            {t('create_book_btn')}
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-xs uppercase tracking-widest font-mono font-semibold text-slate-400 mb-6">
            {t('recent_projects')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {booksList.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-white border border-neutral-border rounded hover:border-brand-500 shadow-sm hover:shadow transition-all overflow-hidden flex flex-col md:flex-row"
              >
                {/* Book Cover Splash */}
                <div className="w-full md:w-44 h-48 bg-slate-50 relative flex-shrink-0 flex items-center justify-center border-b md:border-b-0 md:border-r border-neutral-border overflow-hidden">
                  {book.metadata.coverImage ? (
                    <img
                      src={book.metadata.coverImage}
                      alt={book.metadata.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <BookOpen className="w-10 h-10 text-slate-300 mb-2" />
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">{book.metadata.bookType}</span>
                    </div>
                  )}
                  {/* Aspect Ratio Badge */}
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-brand-700/85 backdrop-blur-xs text-[10px] font-mono text-white rounded">
                    {book.metadata.dimensions.width}x{book.metadata.dimensions.height} {book.metadata.dimensions.unit}
                  </div>
                </div>

                {/* Content info */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono font-medium">
                        {t(`type_${book.metadata.bookType}`)}
                      </span>
                      <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded text-[10px] font-mono font-medium uppercase">
                        {book.metadata.language}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-display font-semibold text-slate-800 leading-snug group-hover:text-brand-500 transition mb-1">
                      {book.metadata.title}
                    </h3>
                    {book.metadata.subtitle && (
                      <p className="text-xs text-slate-400 font-sans line-clamp-1 mb-3">
                        {book.metadata.subtitle}
                      </p>
                    )}
                    
                    <p className="text-xs text-slate-500 font-sans line-clamp-2 leading-relaxed mb-4">
                      {book.metadata.pedagogicalGoal}
                    </p>
                  </div>

                  {/* Metadata and interactions */}
                  <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-2">
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {t('chapters_count', { count: book.chapters.length })}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {t('pages_count', { count: book.pages.length })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBook(book.id);
                        }}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                        title={t('tooltip_delete_book_btn')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => selectBook(book.id)}
                        title={t('tooltip_open_studio_btn')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white rounded text-xs font-sans font-semibold transition"
                      >
                        {t('open_studio_btn')}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Commission Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white border border-neutral-border rounded shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-border flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-slate-800">
                {t('dialog_title')}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                title={t('tooltip_cancel_modal')}
                className="text-slate-400 hover:text-slate-600 font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreate} className="p-6 space-y-6 flex-1">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                    {t('field_title')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Primary English Phonics Vocabulary Book"
                    className="w-full px-3 py-2 border border-neutral-border rounded text-sm focus:outline-hidden focus:border-brand-500 bg-neutral-background"
                  />
                </div>

                {/* Subtitle & Lead Director */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                      {t('field_subtitle')}
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. Volume 2: Advanced Trisyllabic Patterns"
                      className="w-full px-3 py-2 border border-neutral-border rounded text-sm focus:outline-hidden focus:border-brand-500 bg-neutral-background"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                      {t('field_author')}
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Dr. Arthur Pendelton"
                      className="w-full px-3 py-2 border border-neutral-border rounded text-sm focus:outline-hidden focus:border-brand-500 bg-neutral-background"
                    />
                  </div>
                </div>

                {/* Category & Language */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                      {t('field_type')}
                    </label>
                    <select
                      value={bookType}
                      onChange={(e) => setBookType(e.target.value as BookType)}
                      className="w-full px-3 py-2 border border-neutral-border rounded text-sm focus:outline-hidden focus:border-brand-500 bg-neutral-background"
                    >
                      <option value="alphabet">{t('type_alphabet')}</option>
                      <option value="numbers">{t('type_numbers')}</option>
                      <option value="phonics">{t('type_phonics')}</option>
                      <option value="arabic">{t('type_arabic')}</option>
                      <option value="english">{t('type_english')}</option>
                      <option value="french">{t('type_french')}</option>
                      <option value="german">{t('type_german')}</option>
                      <option value="coloring">{t('type_coloring')}</option>
                      <option value="tracing">{t('type_tracing')}</option>
                      <option value="logic">{t('type_logic')}</option>
                      <option value="math">{t('type_math')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                      {t('field_lang')}
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as BookLanguage)}
                      className="w-full px-3 py-2 border border-neutral-border rounded text-sm focus:outline-hidden focus:border-brand-500 bg-neutral-background"
                    >
                      <option value="en">English (EN)</option>
                      <option value="ar">العربية (AR)</option>
                      <option value="fr">Français (FR)</option>
                      <option value="de">Deutsch (DE)</option>
                    </select>
                  </div>
                </div>

                {/* Demographic & Curriculum */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                      {t('field_age')}
                    </label>
                    <select
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value as any)}
                      className="w-full px-3 py-2 border border-neutral-border rounded text-sm focus:outline-hidden focus:border-brand-500 bg-neutral-background"
                    >
                      <option value="toddlers">{t('age_toddlers')}</option>
                      <option value="preschool">{t('age_preschool')}</option>
                      <option value="early_grade">{t('age_early_grade')}</option>
                      <option value="middle_grade">{t('age_middle_grade')}</option>
                      <option value="teacher">{t('age_teacher')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                      {t('field_curriculum')}
                    </label>
                    <select
                      value={targetCurriculum}
                      onChange={(e) => setTargetCurriculum(e.target.value as any)}
                      className="w-full px-3 py-2 border border-neutral-border rounded text-sm focus:outline-hidden focus:border-brand-500 bg-neutral-background"
                    >
                      <option value="montessori">{t('curr_montessori')}</option>
                      <option value="british_national">{t('curr_british')}</option>
                      <option value="common_core">{t('curr_common_core')}</option>
                      <option value="pyp_ib">{t('curr_pyp_ib')}</option>
                      <option value="traditional">{t('curr_traditional')}</option>
                    </select>
                  </div>
                </div>

                {/* Dimensions Setup */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                    {t('field_dimensions')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Trim Width</span>
                      <input
                        type="number"
                        step="0.1"
                        value={dimensions.width}
                        onChange={(e) => setDimensions({ ...dimensions, width: parseFloat(e.target.value) || 8.5 })}
                        className="w-full px-3 py-2 border border-neutral-border rounded text-sm bg-neutral-background"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Trim Height</span>
                      <input
                        type="number"
                        step="0.1"
                        value={dimensions.height}
                        onChange={(e) => setDimensions({ ...dimensions, height: parseFloat(e.target.value) || 11 })}
                        className="w-full px-3 py-2 border border-neutral-border rounded text-sm bg-neutral-background"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Unit</span>
                      <select
                        value={dimensions.unit}
                        onChange={(e) => setDimensions({ ...dimensions, unit: e.target.value as 'in' | 'mm' })}
                        className="w-full px-3 py-2 border border-neutral-border rounded text-sm bg-neutral-background"
                      >
                        <option value="in">Inches (in)</option>
                        <option value="mm">Millimeters (mm)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pedagogical Description */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                    {t('field_goal')}
                  </label>
                  <textarea
                    rows={3}
                    value={pedagogicalGoal}
                    onChange={(e) => setPedagogicalGoal(e.target.value)}
                    placeholder="Describe specific student objectives, cognitive milestones, and mechanical learning outcomes."
                    className="w-full px-3 py-2 border border-neutral-border rounded text-sm focus:outline-hidden focus:border-brand-500 bg-neutral-background resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-neutral-border pt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title={t('tooltip_cancel_modal')}
                  className="px-4 py-2 border border-neutral-border hover:bg-slate-50 text-slate-700 text-xs font-sans font-semibold rounded transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  title={t('tooltip_new_project_btn')}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-sans font-semibold rounded shadow transition"
                >
                  {t('initialize_project')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
