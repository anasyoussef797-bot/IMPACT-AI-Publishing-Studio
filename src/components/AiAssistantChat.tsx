/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { usePublishingStore } from '../store/publishingStore';
import { useTranslation } from '../localization';
import { Send, Sparkles, Trash2, Compass, Cpu, MessageSquare, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AiAssistantChat() {
  const { t } = useTranslation();
  const { 
    chatMessages, 
    isChatLoading, 
    sendChatMessage, 
    clearChat, 
    currentBook,
    uiLanguage 
  } = usePublishingStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isRtl = uiLanguage === 'ar';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isChatLoading) return;
    const msg = input;
    setInput('');
    await sendChatMessage(msg);
  };

  const handleSuggest = async (suggestion: string) => {
    if (isChatLoading) return;
    await sendChatMessage(suggestion);
  };

  const ArabicSuggestions = [
    {
      text: 'أريد كتاب تلوين للحيوانات باللغة العربية مع خطوط تتبع للأطفال',
      label: '🎨 كتاب تلوين حيوانات'
    },
    {
      text: 'صمم لي كتاب رياضيات تفاعلي باللغة العربية لتعليم العد للأطفال',
      label: '🔢 كتاب رياضيات أرقام'
    },
    {
      text: 'أنشئ كتاب لتتبع الحروف العربية والكلمات البسيطة',
      label: '✍️ كتاب تتبع حروف'
    }
  ];

  const EnglishSuggestions = [
    {
      text: 'Create a preschool coloring book about space with cute illustration guides',
      label: '🚀 Space Coloring Book'
    },
    {
      text: 'Generate a kindergarten math book about shapes and counting 1 to 10',
      label: '📐 Math & Shapes Book'
    },
    {
      text: 'Design a phonics tracing book in English for early learners',
      label: '🔤 Phonics Tracing Book'
    }
  ];

  const suggestions = isRtl ? ArabicSuggestions : EnglishSuggestions;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl" id="ai-assistant-chat">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Sparkles className="w-4 h-4 animate-pulse text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
              {isRtl ? 'مساعد الإنتاج الذكي' : 'AI Production Copilot'}
            </h3>
            <p className="text-[10px] text-slate-400">
              {isRtl ? 'تصميم وضبط عمليات النشر فوري' : 'Automated pre-press pipeline synthesis'}
            </p>
          </div>
        </div>
        
        <button
          onClick={clearChat}
          title={isRtl ? 'إعادة ضبط المحادثة' : 'Reset Conversation'}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[250px] bg-slate-900 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            const msgRtl = /[\u0600-\u06FF]/.test(msg.text);

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  dir={msgRtl ? 'rtl' : 'ltr'}
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-brand-600 text-white rounded-br-none'
                      : 'bg-slate-950 border border-slate-800/80 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line font-sans">{msg.text}</p>
                  <span className="text-[9px] text-slate-500 block mt-1.5 text-right opacity-80 font-mono">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isChatLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-slate-950 border border-slate-800 rounded-xl rounded-bl-none px-4 py-3 text-xs text-slate-400 shadow-sm flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 animate-spin text-brand-400" />
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestion Chips */}
      {chatMessages.length <= 1 && (
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center gap-1 mb-2">
            <Compass className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
              {isRtl ? 'نماذج سريعة للتجربة:' : 'Quick Templates:'}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {suggestions.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggest(chip.text)}
                disabled={isChatLoading}
                className="w-full text-left px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 hover:text-white rounded border border-slate-800/60 text-[10px] font-sans font-medium transition flex items-center justify-between"
              >
                <span className="truncate">{chip.label}</span>
                <span className="text-[8px] text-slate-500 font-mono">Run</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isChatLoading}
          placeholder={isRtl ? 'صف كتابك المفضل للبدء تلقائياً...' : 'Describe your book to start production...'}
          className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-brand-500 focus:border-transparent placeholder-slate-500 bg-slate-900/60 transition"
        />
        <button
          type="submit"
          disabled={!input.trim() || isChatLoading}
          className="p-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg shadow transition"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
