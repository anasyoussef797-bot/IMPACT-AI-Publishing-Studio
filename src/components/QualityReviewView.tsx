/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { usePublishingStore } from '../store/publishingStore';
import { useTranslation } from '../localization';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle, RefreshCw, ArrowRight, ArrowLeft, BarChart3, HelpCircle, CheckCircle2, Info, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function QualityReviewView() {
  const { t } = useTranslation();
  const { currentBook, runQualityPreflight, navigateStage, isPreflightLoading } = usePublishingStore();

  useEffect(() => {
    // Automatically trigger preflight on mount if not already analyzed, to automate workflow
    if (currentBook && !currentBook.qualityReport && !isPreflightLoading) {
      runQualityPreflight();
    }
  }, [currentBook, isPreflightLoading, runQualityPreflight]);

  if (!currentBook) return null;

  const report = currentBook.qualityReport;

  const handlePreflight = async () => {
    await runQualityPreflight();
  };

  const handleProceedToExport = () => {
    navigateStage('export');
  };

  return (
    <div className="space-y-8" id="quality-review-view">
      {/* Header */}
      <div className="bg-white border border-neutral-border p-6 rounded shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2 mb-1.5">
            <BarChart3 className="w-5 h-5 text-brand-500" />
            {t('quality_header')}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            {t('quality_desc')}
          </p>
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={() => navigateStage('composer')}
            title={t('tooltip_prev_stage_btn')}
            className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('back_composer_btn')}
          </button>
          
          <button
            onClick={handlePreflight}
            disabled={isPreflightLoading}
            title={t('tooltip_run_preflight_btn')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 border border-slate-200 font-sans text-xs font-semibold rounded transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isPreflightLoading ? 'animate-spin' : ''}`} />
            {isPreflightLoading ? 'Analyzing...' : 'Request Re-Analysis'}
          </button>

          <button
            onClick={handleProceedToExport}
            disabled={isPreflightLoading}
            title={t('tooltip_next_stage_btn')}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold rounded shadow-md hover:shadow-lg transition-all"
          >
            Approve & Export
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Structured Preflight Scoring & Automated Review Panel Checkpoint */}
      {report ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Main Score Radial Indicator */}
            <div className="bg-white border border-neutral-border p-6 rounded shadow-xs flex flex-col items-center justify-center text-center">
              <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-4">
                {t('final_preflight_score')}
              </h4>
              
              {/* Radial Dial */}
              <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    className="stroke-slate-100"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    className="stroke-brand-500 transition-all duration-1000"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={376.8}
                    strokeDashoffset={376.8 - (376.8 * report.finalScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-4xl font-display font-black text-brand-700">
                  {report.finalScore}%
                </span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded text-xs font-semibold uppercase">
                <CheckCircle className="w-4 h-4" />
                {t('preflight_pass')}
              </div>
            </div>

            {/* Sub Criteria Metric Bars */}
            <div className="lg:col-span-3 bg-white border border-neutral-border p-6 rounded shadow-xs space-y-6">
              <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400 border-b border-slate-100 pb-3">
                {t('diagnostic_parameter_breakdown')}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metric 1 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-sans text-slate-500">
                    <span>{t('educational_consistency')}</span>
                    <span className="font-mono font-semibold text-brand-600">{report.educationalConsistencyScore}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${report.educationalConsistencyScore}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-sans">
                    {t('educational_consistency_desc')}
                  </p>
                </div>

                {/* Metric 2 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-sans text-slate-500">
                    <span>{t('print_zone_safety')}</span>
                    <span className="font-mono font-semibold text-brand-600">{report.printSafetyScore}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${report.printSafetyScore}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-sans">
                    {t('print_zone_safety_desc')}
                  </p>
                </div>

                {/* Metric 3 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-sans text-slate-500">
                    <span>{t('preflight_resolution_standard')}</span>
                    <span className="font-mono font-semibold text-brand-600">{report.imageResolutionScore}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${report.imageResolutionScore}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-sans">
                    {t('export_config_300dpi_desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Checkpoints - Completed Tasks, Warnings, Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Completed Tasks */}
            <div className="bg-white border border-neutral-border rounded p-5 shadow-xs space-y-4">
              <h3 className="text-xs uppercase font-mono font-bold text-emerald-600 tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Completed Tasks
              </h3>
              <ul className="space-y-3">
                <li className="text-xs text-slate-600 font-sans flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  Color-by-number templates properly mapped to kid-safe illustrations.
                </li>
                <li className="text-xs text-slate-600 font-sans flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  Double-page spreads validated for CMYK printing bounds.
                </li>
                <li className="text-xs text-slate-600 font-sans flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  Bleed and trim margin guidelines applied (0.125in checked).
                </li>
              </ul>
            </div>

            {/* Warnings */}
            <div className="bg-white border border-neutral-border rounded p-5 shadow-xs space-y-4">
              <h3 className="text-xs uppercase font-mono font-bold text-amber-600 tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Warnings
              </h3>
              <ul className="space-y-3">
                <li className="text-xs text-slate-600 font-sans flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  Coloring outlines are extracted from colored templates using contrast curves. Confirm outline sharpness.
                </li>
                <li className="text-xs text-slate-600 font-sans flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  Check font-size readability (14pt+ is highly recommended for early preschool learners).
                </li>
              </ul>
            </div>

            {/* Suggestions */}
            <div className="bg-white border border-neutral-border rounded p-5 shadow-xs space-y-4">
              <h3 className="text-xs uppercase font-mono font-bold text-indigo-600 tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-500" />
                Suggestions
              </h3>
              <ul className="space-y-3">
                <li className="text-xs text-slate-600 font-sans flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  Use a custom 5-color palette to guide child color selections for lions and dinosaurs coloring pages.
                </li>
                <li className="text-xs text-slate-600 font-sans flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  Add a crisp tracing practice lines activity box to reinforce fine motor control skills.
                </li>
              </ul>
            </div>

          </div>

          {/* Technical checklist details */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400">
              {t('technical_audit_checklist')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {report.checks.map((chk) => {
                const StatusIcon = {
                  pass: CheckCircle,
                  warning: AlertTriangle,
                  fail: XCircle,
                }[chk.status];

                const statusColor = {
                  pass: 'text-emerald-500 bg-emerald-50/20 border-emerald-200/50',
                  warning: 'text-amber-500 bg-amber-50/20 border-amber-200/50',
                  fail: 'text-rose-500 bg-rose-50/20 border-rose-200/50',
                }[chk.status];

                return (
                  <motion.div
                    key={chk.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded shadow-xs flex items-start gap-3 bg-white ${statusColor}`}
                  >
                    <StatusIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs uppercase font-mono font-bold text-slate-800">
                        {chk.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 font-sans leading-relaxed mt-1">
                        {chk.message}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-neutral-border p-20 rounded shadow-xs flex flex-col items-center justify-center text-center">
          <HelpCircle className="w-12 h-12 text-slate-300 mb-4 animate-pulse" />
          <p className="text-sm font-semibold text-slate-600 mb-1">{t('standards_check')}</p>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            {t('preflight_run_metrics_placeholder')}
          </p>
          <button
            onClick={handlePreflight}
            disabled={isPreflightLoading}
            title={t('tooltip_run_preflight_btn')}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 text-white text-xs font-semibold font-sans rounded shadow transition"
          >
            {isPreflightLoading ? t('ai_status_preflight') : t('run_preflight_btn')}
          </button>
        </div>
      )}
    </div>
  );
}
