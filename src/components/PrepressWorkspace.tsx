/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePublishingStore } from '../store/publishingStore';
import { useTranslation } from '../localization';
import { 
  FolderOpen, History, Terminal, Settings, ShieldCheck, Printer, FileCheck, Cpu, 
  ToggleLeft, ToggleRight, LayoutGrid, ChevronLeft, ChevronRight, X, Sparkles, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Sub view imports
import BookPlanningView from './BookPlanningView';
import BookPlanReviewView from './BookPlanReviewView';
import BookComposerView from './BookComposerView';
import QualityReviewView from './QualityReviewView';
import PrintExportView from './PrintExportView';
import BookDoneView from './BookDoneView';
import AiAssistantChat from './AiAssistantChat';
import SimpleWorkspaceView from './SimpleWorkspaceView';

export default function PrepressWorkspace() {
  const { t, isRtl, dir } = useTranslation();
  const { 
    currentBook, 
    currentStage, 
    isProfessionalMode, 
    setProfessionalMode,
    showSettingsPanel,
    toggleSettingsPanel,
    activePanel,
    setActivePanel,
    resetActiveProject,
    booksList
  } = usePublishingStore();

  if (!currentBook) return null;

  // Render active step
  const renderStageView = () => {
    if (!isProfessionalMode && currentStage !== 'done') {
      return <SimpleWorkspaceView />;
    }
    switch (currentStage) {
      case 'planning':
        return <BookPlanningView />;
      case 'plan-review':
        return <BookPlanReviewView />;
      case 'composer':
        return <BookComposerView />;
      case 'quality-review':
        return <QualityReviewView />;
      case 'export':
        return <PrintExportView />;
      case 'done':
        return <BookDoneView />;
      default:
        return <BookPlanningView />;
    }
  };

  // Professional side tabs definitions
  const sidePanels = [
    { id: 'assistant', icon: Sparkles, title: 'AI Copilot' },
    { id: 'preflight', icon: ShieldCheck, title: t('quality_dashboard') },
    { id: 'assets', icon: FolderOpen, title: t('asset_manager') },
    { id: 'versions', icon: History, title: t('version_history') },
    { id: 'prompts', icon: Terminal, title: t('prompt_history') },
    { id: 'print', icon: Printer, title: t('print_settings') },
    { id: 'licensing', icon: FileCheck, title: t('licensing') },
    { id: 'providers', icon: Cpu, title: t('ai_providers') },
  ] as const;

  return (
    <div className="h-full flex flex-col bg-neutral-background" id="prepress-workspace" dir={dir}>
      
      {/* Workspace Top Control bar */}
      <div className="bg-white border-b border-neutral-border py-3 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Active Project Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetActiveProject}
            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200 rounded transition"
            title={t('tooltip_return_catalog_btn')}
          >
            <LogOut className="w-4 h-4 rotate-180" />
          </button>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block mb-0.5">Active Editorial Volume</span>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-display font-bold text-slate-800 leading-none">{currentBook.metadata.title}</h2>
              <span className="px-1.5 py-0.5 bg-slate-100 text-[9px] font-mono rounded text-slate-500 uppercase">{currentBook.metadata.language}</span>
            </div>
          </div>
        </div>

        {/* Workspace mode selectors */}
        <div className="flex items-center gap-4">
          {/* Simple vs Professional toggle */}
          <div className="flex items-center gap-2 border-r border-slate-100 pr-4 mr-1">
            <span className="text-xs text-slate-500 font-sans">{t('professional_mode')}</span>
            <button
              onClick={() => setProfessionalMode(!isProfessionalMode)}
              title={t('tooltip_mode_toggle_btn')}
              className="text-brand-500 hover:text-brand-600 transition p-0.5"
            >
              {isProfessionalMode ? (
                <ToggleRight className="w-8 h-8 text-brand-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-300" />
              )}
            </button>
          </div>

          {/* Quick Actions Panel button */}
          {isProfessionalMode && (
            <button
              onClick={() => toggleSettingsPanel()}
              title={t('tooltip_panels_toggle_btn')}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs font-sans font-semibold transition ${
                showSettingsPanel 
                  ? 'bg-brand-50 border-brand-200 text-brand-700' 
                  : 'bg-white border-neutral-border text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Pre-press Panels
            </button>
          )}
        </div>
      </div>

      {/* Main split: Workspace vs Collapsible Panels */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Core workspace content view */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {renderStageView()}
        </div>

        {/* OVERLAY PANEL: Professional Panels drawer */}
        <AnimatePresence>
          {isProfessionalMode && showSettingsPanel && (
            <motion.div
              initial={{ opacity: 0, x: isRtl ? -320 : 320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? -320 : 320 }}
              className="absolute lg:relative top-0 bottom-0 right-0 w-80 bg-white border-l border-neutral-border shadow-xl lg:shadow-none flex flex-col z-40 overflow-hidden"
              style={{
                borderLeftColor: '#e2e0db'
              }}
            >
              {/* Header inside Panel */}
              <div className="p-4 border-b border-neutral-border flex items-center justify-between bg-neutral-background">
                <span className="text-xs uppercase font-mono tracking-wider font-bold text-slate-500">
                  Pre-press Panel Suite
                </span>
                <button
                  onClick={() => toggleSettingsPanel(false)}
                  title={t('tooltip_panels_toggle_btn')}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sidebar tab links */}
              <div className="flex border-b border-neutral-border overflow-x-auto divide-x divide-slate-100 flex-shrink-0">
                {sidePanels.map((panel) => {
                  const Icon = panel.icon;
                  const isActive = activePanel === panel.id;
                  return (
                    <button
                      key={panel.id}
                      onClick={() => setActivePanel(panel.id)}
                      className={`flex-1 min-w-[50px] py-3 flex flex-col items-center justify-center gap-1.5 text-center transition ${
                        isActive 
                          ? 'bg-brand-50/50 text-brand-700 border-b-2 border-brand-500' 
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/30'
                      }`}
                      title={panel.title}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[9px] font-mono font-bold uppercase block scale-90">{panel.id}</span>
                    </button>
                  );
                })}
              </div>

              {/* Panel Bodies depending on active selection */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-600">
                
                {/* AI CO-PILOT ASSISTANT PANEL */}
                {activePanel === 'assistant' && (
                  <div className="h-[480px]">
                    <AiAssistantChat />
                  </div>
                )}

                {/* PREFLIGHT SCORING PANEL */}
                {activePanel === 'preflight' && (
                  <div className="space-y-4">
                    <h4 className="font-display font-bold text-slate-800 text-sm">{t('quality_dashboard')}</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Live pre-flight diagnostics estimating CMYK densities, bleeding bounds, and resolution parameters.
                    </p>
                    
                    {currentBook.qualityReport ? (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-medium text-slate-500">Overall Preflight Rating</span>
                          <span className="font-mono font-bold text-brand-600">{currentBook.qualityReport.finalScore}%</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-medium text-slate-500">Linguistic Consistency</span>
                          <span className="font-mono font-bold text-brand-600">{currentBook.qualityReport.educationalConsistencyScore}%</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-medium text-slate-500">Print Safety Margins</span>
                          <span className="font-mono font-bold text-brand-600">{currentBook.qualityReport.printSafetyScore}%</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-medium text-slate-500">Resolution Standard</span>
                          <span className="font-mono font-bold text-brand-600">{currentBook.qualityReport.imageResolutionScore}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-400">
                        Run pre-press flight check to view metrics.
                      </div>
                    )}
                  </div>
                )}

                {/* ASSET MANAGER PANEL */}
                {activePanel === 'assets' && (
                  <div className="space-y-4">
                    <h4 className="font-display font-bold text-slate-800 text-sm">{t('asset_manager')}</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      High-density vector and raster illustrations initialized in the current project scope.
                    </p>

                    {currentBook.assets.length === 0 ? (
                      <p className="text-slate-400 py-6 text-center">No assets archived in project directory.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {currentBook.assets.map((as) => (
                          <div key={as.id} className="border border-slate-200 rounded p-1.5 bg-slate-50 overflow-hidden relative group">
                            <img src={as.url} alt={as.name} referrerPolicy="no-referrer" className="w-full h-20 object-cover rounded-xs" />
                            <span className="text-[9px] font-mono truncate block text-slate-500 mt-1">{as.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* VERSION HISTORY PANEL */}
                {activePanel === 'versions' && (
                  <div className="space-y-4">
                    <h4 className="font-display font-bold text-slate-800 text-sm">{t('version_history')}</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Committed publishing revision timelines with author sign-offs.
                    </p>

                    <div className="space-y-3 pt-2">
                      <div className="border-l-2 border-brand-500 pl-3 relative">
                        <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-brand-500" />
                        <span className="text-[10px] font-mono text-slate-400 block">Today, 22:15</span>
                        <h5 className="font-semibold text-slate-800">Preflight Release 1.2</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">Bleed adjustments saved by lead redactor.</p>
                      </div>

                      <div className="border-l-2 border-slate-200 pl-3 relative">
                        <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-mono text-slate-400 block">Yesterday, 14:10</span>
                        <h5 className="font-semibold text-slate-700">Curriculum Approved</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">Advisory panel signed syllabus plan.</p>
                      </div>

                      <div className="border-l-2 border-slate-200 pl-3 relative">
                        <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-mono text-slate-400 block">15 July, 09:30</span>
                        <h5 className="font-semibold text-slate-700">Project Commissioned</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">Empty shell initialized under Montessori guidelines.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PROMPT CACHE PANEL */}
                {activePanel === 'prompts' && (
                  <div className="space-y-4">
                    <h4 className="font-display font-bold text-slate-800 text-sm">{t('prompt_history')}</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Secure instructions cached during page content drafting or asset generation.
                    </p>

                    <div className="space-y-2 pt-2 font-mono text-[10px]">
                      <div className="bg-slate-50 border border-slate-100 p-2 rounded">
                        <span className="text-[8px] text-brand-600 font-bold uppercase block mb-1">ILLUSTRATION TARGET</span>
                        "Minimalist clean black and white outline vector drawing, coloring book style..."
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-2 rounded">
                        <span className="text-[8px] text-indigo-600 font-bold uppercase block mb-1">WRITING INSTRUCTION</span>
                        "Composed 3 sentence short story on Counting Apples fitting preschool demographic parameters..."
                      </div>
                    </div>
                  </div>
                )}

                {/* PRINT SETTINGS PANEL */}
                {activePanel === 'print' && (
                  <div className="space-y-4">
                    <h4 className="font-display font-bold text-slate-800 text-sm">{t('print_settings')}</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Offset mechanical calibration constraints.
                    </p>

                    <div className="space-y-2 pt-2 text-[11px]">
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500">Bleed size limits</span>
                        <span className="font-mono font-semibold">0.125 in (3.175 mm)</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500">Trim size bounds</span>
                        <span className="font-mono font-semibold">8.5" x 11.0" Letter</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500">DPI enforce boundary</span>
                        <span className="font-mono font-semibold">300 DPI Vector Scale</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-500">Color target spaces</span>
                        <span className="font-mono font-semibold">GRACoL Coated C1</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* LICENSING PANEL */}
                {activePanel === 'licensing' && (
                  <div className="space-y-4">
                    <h4 className="font-display font-bold text-slate-800 text-sm">{t('licensing')}</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Legal copyrights, licensing tags, and publisher records.
                    </p>

                    <div className="space-y-2 pt-2 text-[11px]">
                      <p className="bg-slate-50 border border-slate-100 p-2.5 rounded text-slate-600">
                        All generated book content, lessons schemas, and vector designs belong fully to <b>{currentBook.metadata.author || 'Licensed Publisher'}</b> under active educational volume distributions.
                      </p>
                      <div className="flex justify-between border-b border-slate-100 py-1">
                        <span className="text-slate-500">Copyright status</span>
                        <span className="font-mono text-[10px] text-emerald-600 font-semibold uppercase">Registered</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 py-1">
                        <span className="text-slate-500">Linguistic license</span>
                        <span className="font-mono text-[10px]">CC-BY-NC-4.0</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ADVANCED PROVIDERS / PLUGIN INFRA */}
                {activePanel === 'providers' && (
                  <div className="space-y-4">
                    <h4 className="font-display font-bold text-slate-800 text-sm">{t('ai_providers')}</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Choose publishing engines and models. Pluggable framework supports custom weights.
                    </p>

                    <div className="space-y-2 pt-2">
                      <div>
                        <span className="text-[9px] uppercase font-mono text-slate-400 block mb-1">Curriculum writing LLM</span>
                        <select className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-hidden">
                          <option>Gemini 3.5 Flash (Latest)</option>
                          <option>Gemini 3.1 Pro (Preview)</option>
                          <option>Claude 3.5 Sonnet</option>
                          <option>Local Llama-3 (8B Instruct)</option>
                        </select>
                      </div>

                      <div className="pt-2">
                        <span className="text-[9px] uppercase font-mono text-slate-400 block mb-1">Illustration model plate</span>
                        <select className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-hidden">
                          <option>Imagen 3 / Nano banana (Vite)</option>
                          <option>Stable Diffusion XL (Base)</option>
                          <option>Flux Schnell (Local)</option>
                          <option>Midjourney v6 API</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
