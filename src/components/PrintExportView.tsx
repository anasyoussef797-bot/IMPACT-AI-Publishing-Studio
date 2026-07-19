/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePublishingStore } from '../store/publishingStore';
import { useTranslation } from '../localization';
import { Printer, Check, ArrowRight, ArrowLeft, Loader2, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function PrintExportView() {
  const { t } = useTranslation();
  const { currentBook, updateExportConfig, synthesizePrintPackage, navigateStage, isAiGenerating, aiStatusMessage } = usePublishingStore();

  if (!currentBook) return null;

  const config = currentBook.exportConfig || {
    cmykEnabled: true,
    highRes300Dpi: true,
    bleedIncluded: true,
    cropMarksEnabled: true,
    registrationMarksEnabled: false,
    colorBarsEnabled: false
  };

  const handleToggle = (key: keyof typeof config) => {
    updateExportConfig({ [key]: !config[key] });
  };

  const handleExport = async () => {
    await synthesizePrintPackage();
  };

  return (
    <div className="space-y-8" id="print-export-view">
      {/* Header */}
      <div className="bg-white border border-neutral-border p-6 rounded shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2 mb-1.5">
            <Printer className="w-5 h-5 text-brand-500" />
            {t('export_header')}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            {t('export_desc')}
          </p>
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={() => navigateStage('quality-review')}
            title={t('tooltip_prev_stage_btn')}
            className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('review_quality_btn')}
          </button>
          
          <button
            onClick={handleExport}
            disabled={isAiGenerating}
            title={t('tooltip_generate_pdf_btn')}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 text-white font-sans text-xs font-semibold rounded shadow-md hover:shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {isAiGenerating ? t('ai_status_preflight') : t('generate_pdf_btn')}
          </button>
        </div>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Toggle options controls (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-neutral-border p-6 rounded shadow-xs space-y-6">
          <h3 className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider border-b border-slate-100 pb-3">
            {t('press_calibration_options')}
          </h3>

          <div className="space-y-4">
            {/* Toggle 1 */}
            <button
              onClick={() => handleToggle('cmykEnabled')}
              title={t('tooltip_calibration_btn')}
              className="w-full flex items-start justify-between p-3.5 border border-slate-100 hover:bg-slate-50 rounded text-left transition"
            >
              <div className="max-w-[85%]">
                <h4 className="text-xs font-display font-bold text-slate-800">{t('export_config_cmyk')}</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">{t('export_config_cmyk_desc')}</p>
              </div>
              {config.cmykEnabled ? (
                <ToggleRight className="w-8 h-8 text-brand-500 flex-shrink-0" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-300 flex-shrink-0" />
              )}
            </button>

            {/* Toggle 2 */}
            <button
              onClick={() => handleToggle('highRes300Dpi')}
              title={t('tooltip_calibration_btn')}
              className="w-full flex items-start justify-between p-3.5 border border-slate-100 hover:bg-slate-50 rounded text-left transition"
            >
              <div className="max-w-[85%]">
                <h4 className="text-xs font-display font-bold text-slate-800">{t('export_config_300dpi')}</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">{t('export_config_300dpi_desc')}</p>
              </div>
              {config.highRes300Dpi ? (
                <ToggleRight className="w-8 h-8 text-brand-500 flex-shrink-0" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-300 flex-shrink-0" />
              )}
            </button>

            {/* Toggle 3 */}
            <button
              onClick={() => handleToggle('bleedIncluded')}
              title={t('tooltip_calibration_btn')}
              className="w-full flex items-start justify-between p-3.5 border border-slate-100 hover:bg-slate-50 rounded text-left transition"
            >
              <div className="max-w-[85%]">
                <h4 className="text-xs font-display font-bold text-slate-800">{t('export_config_bleed')}</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">{t('export_config_bleed_desc')}</p>
              </div>
              {config.bleedIncluded ? (
                <ToggleRight className="w-8 h-8 text-brand-500 flex-shrink-0" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-300 flex-shrink-0" />
              )}
            </button>

            {/* Toggle 4 */}
            <button
              onClick={() => handleToggle('cropMarksEnabled')}
              title={t('tooltip_calibration_btn')}
              className="w-full flex items-start justify-between p-3.5 border border-slate-100 hover:bg-slate-50 rounded text-left transition"
            >
              <div className="max-w-[85%]">
                <h4 className="text-xs font-display font-bold text-slate-800">{t('export_config_crop')}</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">{t('export_config_crop_desc')}</p>
              </div>
              {config.cropMarksEnabled ? (
                <ToggleRight className="w-8 h-8 text-brand-500 flex-shrink-0" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-300 flex-shrink-0" />
              )}
            </button>

            {/* Toggle 5 */}
            <button
              onClick={() => handleToggle('registrationMarksEnabled')}
              title={t('tooltip_calibration_btn')}
              className="w-full flex items-start justify-between p-3.5 border border-slate-100 hover:bg-slate-50 rounded text-left transition"
            >
              <div className="max-w-[85%]">
                <h4 className="text-xs font-display font-bold text-slate-800">{t('export_config_reg')}</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">{t('export_config_reg_desc')}</p>
              </div>
              {config.registrationMarksEnabled ? (
                <ToggleRight className="w-8 h-8 text-brand-500 flex-shrink-0" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-300 flex-shrink-0" />
              )}
            </button>

            {/* Toggle 6 */}
            <button
              onClick={() => handleToggle('colorBarsEnabled')}
              title={t('tooltip_calibration_btn')}
              className="w-full flex items-start justify-between p-3.5 border border-slate-100 hover:bg-slate-50 rounded text-left transition"
            >
              <div className="max-w-[85%]">
                <h4 className="text-xs font-display font-bold text-slate-800">{t('export_config_bars')}</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">{t('export_config_bars_desc')}</p>
              </div>
              {config.colorBarsEnabled ? (
                <ToggleRight className="w-8 h-8 text-brand-500 flex-shrink-0" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-300 flex-shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Pre-press Blueprint Preview Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-8 rounded shadow-inner flex flex-col items-center justify-center relative min-h-[480px]">
          <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-slate-500 absolute top-4 left-4">
            {t('prepress_panels')}
          </span>

          {/* Core Page Wrapper */}
          <div className="relative bg-white text-slate-900 shadow-2xl transition duration-300" style={{ width: '310px', height: '400px' }}>
            
            {/* OVERLAY: BLEED CYAN GUIDELINES */}
            {config.bleedIncluded && (
              <div className="absolute inset-2 border-2 border-cyan-400 pointer-events-none select-none z-10">
                <span className="absolute top-1 left-2 text-[8px] font-mono text-cyan-500 font-bold">{t('bleed_guide_text')}</span>
              </div>
            )}

            {/* OVERLAY: COLOR BARS */}
            {config.colorBarsEnabled && (
              <div className="absolute top-4 left-0 right-0 flex items-center justify-center gap-1 z-10">
                <span className="w-4 h-2.5 bg-cyan-500 block border border-slate-300" />
                <span className="w-4 h-2.5 bg-magenta-500 block border border-slate-300" style={{ backgroundColor: '#ec4899' }} />
                <span className="w-4 h-2.5 bg-yellow-400 block border border-slate-300" style={{ backgroundColor: '#eab308' }} />
                <span className="w-4 h-2.5 bg-slate-900 block border border-slate-300" />
                <span className="text-[7px] font-mono font-bold text-slate-400 ml-1">CMYK</span>
              </div>
            )}

            {/* OVERLAY: CROP MARKS */}
            {config.cropMarksEnabled && (
              <div className="absolute inset-0 pointer-events-none select-none z-20">
                {/* Top Left */}
                <span className="absolute top-0 left-0 w-4 h-0.5 bg-slate-900" />
                <span className="absolute top-0 left-0 w-0.5 h-4 bg-slate-900" />
                {/* Top Right */}
                <span className="absolute top-0 right-0 w-4 h-0.5 bg-slate-900" />
                <span className="absolute top-0 right-0 w-0.5 h-4 bg-slate-900" />
                {/* Bottom Left */}
                <span className="absolute bottom-0 left-0 w-4 h-0.5 bg-slate-900" />
                <span className="absolute bottom-0 left-0 w-0.5 h-4 bg-slate-900" />
                {/* Bottom Right */}
                <span className="absolute bottom-0 right-0 w-4 h-0.5 bg-slate-900" />
                <span className="absolute bottom-0 right-0 w-0.5 h-4 bg-slate-900" />
              </div>
            )}

            {/* OVERLAY: REGISTRATION TARGETS */}
            {config.registrationMarksEnabled && (
              <div className="absolute inset-y-0 -left-6 flex items-center justify-center pointer-events-none select-none z-20">
                <div className="w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center relative">
                  <span className="absolute top-0 bottom-0 left-2.5 w-0.5 bg-slate-900" />
                  <span className="absolute left-0 right-0 top-2.5 h-0.5 bg-slate-900" />
                </div>
              </div>
            )}
            {config.registrationMarksEnabled && (
              <div className="absolute inset-y-0 -right-6 flex items-center justify-center pointer-events-none select-none z-20">
                <div className="w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center relative">
                  <span className="absolute top-0 bottom-0 left-2.5 w-0.5 bg-slate-900" />
                  <span className="absolute left-0 right-0 top-2.5 h-0.5 bg-slate-900" />
                </div>
              </div>
            )}

            {/* Simulated Page Content */}
            <div className="p-8 h-full flex flex-col justify-between select-none">
              <div className="text-center pt-8">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
                  {t('trim_sheets_label')}
                </span>
                <h4 className="text-base font-display font-bold text-brand-700 tracking-tight leading-tight px-4 line-clamp-2">
                  {currentBook.metadata.title}
                </h4>
              </div>

              {/* Cover miniature overlay or graphic indicator */}
              <div className="flex-1 my-4 border border-dashed border-slate-200 bg-slate-50/50 rounded flex items-center justify-center">
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">{t('print_dpi_enforce_boundary')}</span>
              </div>

              <div className="text-center">
                <span className="text-[8px] font-mono text-slate-400">
                  {t('print_trim_size_bounds')}: {currentBook.metadata.dimensions.width}x{currentBook.metadata.dimensions.height} {currentBook.metadata.dimensions.unit}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Synthesis processing modal overlay */}
      {isAiGenerating && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-neutral-border p-8 rounded shadow-2xl flex flex-col items-center max-w-sm text-center animate-pulse"
          >
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
            <h4 className="text-sm font-display font-bold text-slate-800 mb-1">
              {t('ai_status_exporting')}
            </h4>
            <p className="text-[11px] text-slate-400 font-sans">
              {t('ai_status_synthesis')}
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
