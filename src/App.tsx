/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePublishingStore } from './store/publishingStore';
import { useTranslation } from './localization';
import DashboardCatalog from './components/DashboardCatalog';
import PrepressWorkspace from './components/PrepressWorkspace';
import NotificationToast from './components/NotificationToast';
import { Globe } from 'lucide-react';

export default function App() {
  const { t, uiLanguage, dir } = useTranslation();
  const { 
    currentBook, 
    setUiLanguage
  } = usePublishingStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-slate-800 font-sans antialiased selection:bg-brand-100 selection:text-brand-900" dir={dir}>
      
      {/* Global studio navbar with Rich Dark Navy theme */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-display font-black text-lg tracking-tight select-none shadow-sm">
            I
          </div>
          <div>
            <h1 className="text-sm font-display font-black text-white tracking-wider uppercase leading-none">
              IMPACT
            </h1>
            <span className="text-[10px] font-mono tracking-widest text-indigo-300 font-bold uppercase block mt-0.5">
              Publishing Studio
            </span>
          </div>
        </div>

        {/* Top Controls: Global UI Translation menus */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 border border-slate-700 bg-slate-800/80 rounded px-2.5 py-1 text-xs" title={t('tooltip_language_selector')}>
            <Globe className="w-3.5 h-3.5 text-slate-300" />
            <select
              value={uiLanguage}
              onChange={(e) => setUiLanguage(e.target.value as any)}
              className="bg-transparent focus:outline-hidden text-slate-200 font-semibold cursor-pointer text-xs"
            >
              <option value="en" className="text-slate-900">English</option>
              <option value="ar" className="text-slate-900">العربية (AR)</option>
              <option value="fr" className="text-slate-900">Français</option>
              <option value="de" className="text-slate-900">Deutsch</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-xs font-mono">
            <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] uppercase font-bold text-slate-300">
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
    </div>
  );
}

