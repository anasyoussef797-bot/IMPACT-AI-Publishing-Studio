/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePublishingStore } from '../store/publishingStore';
import { useTranslation } from '../localization';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle, RefreshCw, ArrowRight, ArrowLeft, BarChart3, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function QualityReviewView() {
  const { t } = useTranslation();
  const { currentBook, runQualityPreflight, navigateStage, isPreflightLoading } = usePublishingStore();

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
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-mono text-xs font-semibold rounded shadow transition"
          >
            <RefreshCw className={`w-4 h-4 ${isPreflightLoading ? 'animate-spin' : ''}`} />
            {isPreflightLoading ? t('ai_status_preflight') : t('run_preflight_btn')}
          </button>

          <button
            onClick={handleProceedToExport}
            disabled={!report || isPreflightLoading}
            title={t('tooltip_next_stage_btn')}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-sans text-xs font-semibold rounded shadow transition"
          >
            {t('next_step')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preflight scoring dashboard */}
      {report ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Grade Core */}
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

            {/* Verification Tag */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded text-xs font-semibold uppercase">
              <CheckCircle className="w-4 h-4" />
              {t('preflight_pass')}
            </div>
          </div>

          {/* Sub Criteria breakdowns */}
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

          {/* Checklist entries */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400">
              {t('technical_audit_checklist')}
            </h4>

            <div className="space-y-3">
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
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 border rounded shadow-xs flex items-start gap-3.5 bg-white ${statusColor}`}
                  >
                    <StatusIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs uppercase font-mono font-bold text-slate-800">
                        {chk.name}
                      </h5>
                      <p className="text-xs text-slate-500 font-sans leading-relaxed mt-1">
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
