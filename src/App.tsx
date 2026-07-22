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
import { BookOpen, Globe, Laptop, Moon, Sun, HelpCircle, FileText, Sparkles, X, Key, Cpu, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { t, uiLanguage, dir } = useTranslation();
  const { 
    currentBook, 
    setUiLanguage,
    customApiKey,
    aiProvider,
    customModel,
    setCustomApiKey,
    setAiProvider,
    setCustomModel,
    addNotification
  } = usePublishingStore();
  const [showFloatChat, setShowFloatChat] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);

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
              AI Publishing Studio
            </span>
          </div>
        </div>

        {/* Top Controls: Global UI Translation menus */}
        <div className="flex items-center gap-3">
          {/* API Keys Configuration Button & Popover */}
          <div className="relative">
            <button
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs font-sans font-bold transition cursor-pointer select-none ${
                customApiKey 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                  : 'bg-amber-50/50 border-amber-200 text-amber-700 hover:bg-amber-100/60 animate-pulse'
              }`}
              title={uiLanguage === 'ar' ? 'إعدادات مفتاح الـ API والذكاء الاصطناعي' : 'Configure AI Engine / API Key'}
            >
              <Key className="w-3.5 h-3.5" />
              <span>
                {uiLanguage === 'ar' ? 'مفتاح الـ API' : 'API Key'}
              </span>
              {customApiKey ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              )}
            </button>

            <AnimatePresence>
              {showKeyConfig && (
                <>
                  {/* Backdrop to close on outer click */}
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setShowKeyConfig(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className={`absolute z-50 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl p-4 text-xs ${
                      uiLanguage === 'ar' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                      <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-emerald-600" />
                        {uiLanguage === 'ar' ? 'إعدادات الذكاء الاصطناعي' : 'AI Engine Control'}
                      </h3>
                      <button 
                        onClick={() => setShowKeyConfig(false)} 
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Provider Selector */}
                      <div>
                        <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1 font-semibold">
                          {uiLanguage === 'ar' ? 'مزود الخدمة النشط' : 'Active Provider'}
                        </label>
                        <select 
                          value={aiProvider}
                          onChange={(e) => setAiProvider(e.target.value as any)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white text-slate-800 focus:outline-hidden focus:border-emerald-500 font-medium cursor-pointer"
                        >
                          <option value="gemini">Google Gemini (Recommended)</option>
                          <option value="openai">OpenAI (GPT & DALL-E)</option>
                          <option value="anthropic">Anthropic Claude</option>
                        </select>
                      </div>

                      {/* Model Selector */}
                      <div>
                        <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1 font-semibold">
                          {uiLanguage === 'ar' ? 'طراز النموذج (Model)' : 'AI Model Name'}
                        </label>
                        {aiProvider === 'gemini' && (
                          <select
                            value={customModel}
                            onChange={(e) => setCustomModel(e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white text-slate-800 focus:outline-hidden focus:border-emerald-500 font-mono"
                          >
                            <option value="gemini-3.5-flash">gemini-3.5-flash (Standard)</option>
                            <option value="gemini-2.5-flash">gemini-2.5-flash (Speedy)</option>
                            <option value="gemini-2.5-pro">gemini-2.5-pro (Creative)</option>
                            <option value="gemini-1.5-flash">gemini-1.5-flash (Classic Fast)</option>
                            <option value="gemini-1.5-pro">gemini-1.5-pro (Classic Pro)</option>
                          </select>
                        )}

                        {aiProvider === 'openai' && (
                          <select
                            value={customModel}
                            onChange={(e) => setCustomModel(e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white text-slate-800 focus:outline-hidden focus:border-emerald-500 font-mono"
                          >
                            <option value="gpt-4o-mini">gpt-4o-mini (Fast & Cheap)</option>
                            <option value="gpt-4o">gpt-4o (High Intelligence)</option>
                            <option value="gpt-4-turbo">gpt-4-turbo</option>
                          </select>
                        )}

                        {aiProvider === 'anthropic' && (
                          <select
                            value={customModel}
                            onChange={(e) => setCustomModel(e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white text-slate-800 focus:outline-hidden focus:border-emerald-500 font-mono"
                          >
                            <option value="claude-3-5-sonnet-latest">claude-3-5-sonnet-latest</option>
                            <option value="claude-3-5-haiku-20241022">claude-3-5-haiku</option>
                            <option value="claude-3-opus-20240229">claude-3-opus</option>
                          </select>
                        )}
                      </div>

                      {/* API Key Input and Paste Button */}
                      <div>
                        <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1 font-semibold">
                          {uiLanguage === 'ar' ? 'مفتاح الـ API الخاص بك' : 'Your Secret API Key'}
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="password"
                            placeholder={
                              aiProvider === 'gemini' 
                                ? 'AIzaSy...' 
                                : aiProvider === 'openai' 
                                ? 'sk-...' 
                                : 'sk-ant-...'
                            }
                            value={customApiKey}
                            onChange={(e) => setCustomApiKey(e.target.value)}
                            className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-xs font-mono focus:outline-hidden focus:border-emerald-500 bg-white animate-fade-in"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const text = await navigator.clipboard.readText();
                                if (text) {
                                  setCustomApiKey(text);
                                }
                              } catch (err) {
                                addNotification('error', uiLanguage === 'ar' ? 'يرجى لصق المفتاح يدوياً، لم نتمكن من الوصول للحافظة.' : 'Please paste key manually, clipboard permission denied.');
                              }
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded font-semibold transition-colors cursor-pointer"
                            title={uiLanguage === 'ar' ? 'لصق من الحافظة' : 'Paste from clipboard'}
                          >
                            {uiLanguage === 'ar' ? 'لصق' : 'Paste'}
                          </button>
                        </div>
                      </div>

                      {/* Clear button if key exists */}
                      {customApiKey && (
                        <button
                          onClick={() => {
                            setCustomApiKey('');
                            addNotification('info', uiLanguage === 'ar' ? 'تم حذف مفتاح الـ API المخصص.' : 'Custom API key removed.');
                          }}
                          className="w-full py-1 text-center text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent rounded font-medium transition cursor-pointer text-[10px]"
                        >
                          {uiLanguage === 'ar' ? 'حذف المفتاح والرجوع للوضع الافتراضي' : 'Clear custom key (Reset to default)'}
                        </button>
                      )}

                      {/* Info warning / status */}
                      <div className="p-2 bg-slate-50 border border-slate-100 rounded text-[10px] text-slate-500 leading-normal">
                        {customApiKey ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{uiLanguage === 'ar' ? 'يتم الآن استخدام مفتاح الـ API المخصص الخاص بك' : 'Your custom key is active!'}</span>
                          </div>
                        ) : (
                          <div className="flex items-start gap-1.5 text-amber-700">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>
                              {uiLanguage === 'ar' 
                                ? 'يتم استخدام المفتاح المشترك الافتراضي. لضمان عدم توقف الخدمة، يرجى وضع مفتاحك الخاص.' 
                                : 'Using the default shared key. Please paste your custom key to avoid shared rate limits.'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

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
              ? 'bg-rose-600 hover:bg-rose-700 text-white' 
              : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white hover:scale-105'
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

