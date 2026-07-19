/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePublishingStore } from './store/publishingStore';
import { useTranslation } from './localization';
import DashboardCatalog from './components/DashboardCatalog';
import PrepressWorkspace from './components/PrepressWorkspace';
import NotificationToast from './components/NotificationToast';
import AiAssistantChat from './components/AiAssistantChat';
import { BookOpen, Globe, Laptop, Moon, Sun, HelpCircle, FileText, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { t, uiLanguage, dir } = useTranslation();
  const { currentBook, setUiLanguage } = usePublishingStore();
  const [showFloatChat, setShowFloatChat] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-slate-800 font-sans antialiased selection:bg-brand-100 selection:text-brand-900" dir={dir}>
      
      {/* Global studio navbar */}
      <header className="bg-white border-b border-neutral-border sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-500 rounded flex items-center justify-center text-white font-display font-black text-lg tracking-tight select-none shadow-xs">
            I
          </div>
          <div>
            <h1 className="text-sm font-display font-black text-slate-900 tracking-wider uppercase leading-none">
              IMPACT
            </h1>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase block mt-0.5">
              AI Publishing Studio
            </span>
          </div>
        </div>

        {/* Top Controls: Global UI Translation menus */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 border border-slate-200 bg-slate-50/50 rounded px-2.5 py-1 text-xs" title={t('tooltip_language_selector')}>
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={uiLanguage}
              onChange={(e) => setUiLanguage(e.target.value as any)}
              className="bg-transparent focus:outline-hidden text-slate-600 font-semibold cursor-pointer text-xs"
            >
              <option value="en">English</option>
              <option value="ar">العربية (AR)</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-xs font-mono">
            <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] uppercase font-bold text-slate-500">
              Desktop Edition v1.2
            </span>
          </div>
        </div>
      </header>

      {/* Main Container Core */}
      <main className="flex-1 flex flex-col">
        {currentBook ? (
          <PrepressWorkspace />
        ) : (
          <DashboardCatalog />
        )}
      </main>

      {/* Footer copyright */}
      <footer className="bg-white border-t border-neutral-border py-6 px-8 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-mono">
          &copy; 2026 IMPACT Educational Publishers Consortium Ltd. All rights reserved.
        </p>
        <div className="flex gap-6 font-sans">
          <a href="#dashboard-catalog" className="hover:text-slate-600">Rights & licensing</a>
          <a href="#dashboard-catalog" className="hover:text-slate-600">Educational Standards</a>
          <a href="#dashboard-catalog" className="hover:text-slate-600">Press Guidelines</a>
        </div>
      </footer>

      {/* Global visual alert triggers */}
      <NotificationToast />

      {/* Floating AI Assistant Copilot Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {showFloatChat && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-4 w-96 max-w-[calc(100vw-2rem)] h-[550px]"
            >
              <AiAssistantChat />
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setShowFloatChat(!showFloatChat)}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all ${
            showFloatChat 
              ? 'bg-rose-500 hover:bg-rose-600 text-white' 
              : 'bg-brand-500 hover:bg-brand-600 text-white hover:scale-105'
          }`}
          title={uiLanguage === 'ar' ? 'مساعد التحرير الذكي' : 'AI Editorial Copilot'}
        >
          {showFloatChat ? (
            <X className="w-5 h-5" />
          ) : (
            <Sparkles className="w-5 h-5 animate-pulse text-amber-200" />
          )}
        </button>
      </div>
    </div>
  );
}

