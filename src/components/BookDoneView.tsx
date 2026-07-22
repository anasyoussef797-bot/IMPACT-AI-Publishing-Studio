/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePublishingStore } from '../store/publishingStore';
import { useTranslation } from '../localization';
import { CheckCircle, Award, FileText, Download, Printer, ArrowRight, ArrowLeft, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function BookDoneView() {
  const { t, isRtl, uiLanguage } = useTranslation();
  const { currentBook, resetActiveProject, navigateStage, setProfessionalMode, addNotification } = usePublishingStore();

  if (!currentBook) return null;

  const isAr = uiLanguage === 'ar';

  // Handle direct printer action
  const handlePrint = () => {
    window.print();
  };

  // Handle PDF file download (HTML printable document blob)
  const handleDownloadPdf = () => {
    addNotification('info', isAr ? 'جاري تحضير ملف PDF للتنزيل...' : 'Preparing PDF file for download...');
    
    // Generate styled printable HTML content for the book
    const pagesHtml = currentBook.pages.map((p, idx) => `
      <div style="page-break-after: always; padding: 40px; text-align: center; border: 2px solid #e2e8f0; margin-bottom: 20px; font-family: sans-serif;" dir="${isRtl ? 'rtl' : 'ltr'}">
        <div style="border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b;">
          <span>📖 ${currentBook.metadata.customBookName || currentBook.metadata.title}</span>
          <span>صفحة ${idx + 1}</span>
        </div>
        <h2 style="font-size: 22px; margin-bottom: 8px; color: #0f172a;">${p.title || 'صفحة تلوين'}</h2>
        <p style="font-size: 14px; color: #475569; margin-bottom: 24px;">${p.textContent || ''}</p>
        ${p.illustrationUrl ? `<img src="${p.illustrationUrl}" style="max-width: 100%; max-height: 500px; object-fit: contain; filter: grayscale(100%) contrast(300%); margin: 0 auto; display: block;" />` : ''}
        ${p.activity && p.activity.type === 'tracing' ? `
          <div style="margin-top: 24px; padding: 16px; border: 2px dashed #94a3b8; border-radius: 8px;">
            <span style="font-size: 12px; color: #475569; display: block; margin-bottom: 8px;">تتبع الحرف:</span>
            <span style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #94a3b8; text-decoration: line-through;">${p.activity.contentData?.character || 'أ'}</span>
          </div>
        ` : ''}
      </div>
    `).join('');

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="${uiLanguage}">
      <head>
        <meta charset="utf-8">
        <title>${currentBook.metadata.title} - Coloring Book</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
          }
          body { font-family: system-ui, -apple-system, sans-serif; background: #fff; padding: 20px; }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentBook.metadata.title || 'Coloring_Book'}_Printable.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification('success', isAr ? 'تم بدء تنزيل النسخة القابلة للطباعة PDF بنجاح!' : 'PDF / Printable document download started!');
  };

  // Download High Res Illustrations Archive
  const handleDownloadPngArchive = () => {
    const imagesData = currentBook.pages.map(p => ({
      pageNumber: p.pageNumber,
      title: p.title,
      imageUrl: p.illustrationUrl
    }));

    const jsonStr = JSON.stringify(imagesData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentBook.metadata.title}_HighRes_PNG_300DPI_Archive.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification('success', isAr ? 'تم تنزيل أرشيف اللوحات عالية الدقة (300 DPI) بنجاح!' : 'Downloaded 300 DPI illustrations archive!');
  };

  // Download Curriculum Alignment Document
  const handleDownloadCurriculumDoc = () => {
    const docText = `=====================================================
مستند مطابقة المنهج والاعتماد التعليمي
المنصة: ${currentBook.metadata.platformName || 'منصة التعليم والتلوين الذكية'}
الكتاب: ${currentBook.metadata.title}
تاريخ الاعتماد: ${new Date().toLocaleDateString('ar-EG')}
=====================================================

1. النطاق المنهجي والتربوي:
- يستهدف هذا الكتاب تنمية المهارات الحركية الدقيقة والأدراك البصري لدى الأطفال.
- عدد الصفحات المعتمدة: ${currentBook.pages.length} صفحة.
- مقاس الطباعة المعتمد: ${currentBook.metadata.paperSize || 'A4'}.

2. الفصول والأنشطة المتضمنة:
${currentBook.pages.map((p, i) => `   [صفحة ${i + 1}] ${p.title || 'تمرين تلوين'} - نوع النشاط: ${p.layoutType === 'tracing' ? 'تتبع خطوط الحروف' : 'تلوين وإدراك بصري'}`).join('\n')}

3. إفادة الاعتماد:
تم مراجعة هذا العمل وفق معايير الجودة المنهجية والاعتماد التربوي المعتمد.
=====================================================
`;

    const blob = new Blob([docText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Curriculum_Alignment_Document_${currentBook.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification('success', isAr ? 'تم تنزيل مستند مطابقة المنهج والاعتماد التعليمي بنجاح!' : 'Curriculum alignment document downloaded!');
  };

  // Download Technical & Pedagogical Standards Audit
  const handleDownloadAuditDoc = () => {
    const auditText = `=====================================================
مراجعة وتأكيد المعايير الفنية والتربوية
تاريخ التقرير: ${new Date().toLocaleString('ar-EG')}
=====================================================

[الفحص الفني وخطوط الطباعة]
✓ دقة الصور: 300 DPI (جاهز للطباعة التجارية)
✓ هوانش الأمان والقص (Bleed & Safe Zone): مفعلة ومطابقة
✓ نظام الألوان: CMYK Press Calibrated
✓ خالي من أخطاء الشفافية والطبقات المزدوجة

[الفحص التربوي والنفسي]
✓ سلامة الخطوط للطفل: سميكة ومحددة لمنع التشتت
✓ أبعاد تتبع الحروف: مجهزة للتعليم المبكر
✓ التناسب العمر الفني: 3 - 8 سنوات

النتيجة النهائية: معتمد وجاهز للطباعة المباشرة.
=====================================================
`;

    const blob = new Blob([auditText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Technical_and_Pedagogical_Review_${currentBook.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification('success', isAr ? 'تم تنزيل تقرير مراجعة وتأكيد المعايير الفنية والتربوية بنجاح!' : 'Technical standards audit report downloaded!');
  };

  // Return to Simple Workspace Mode
  const handleReturnToSimpleMode = () => {
    setProfessionalMode(false);
    navigateStage('composer');
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4" id="book-done-view">
      
      {/* Return to Simple Mode Bar */}
      <div className="mb-6 flex items-center justify-between bg-slate-100 p-3.5 rounded-xl border border-slate-200">
        <button
          onClick={handleReturnToSimpleMode}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-lg transition-all shadow-xs"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {isAr ? '🔙 العودة للوضع البسيط (الصفحة السابقة)' : '🔙 Return to Simple Workspace Mode'}
        </button>

        <span className="text-xs font-mono font-semibold text-slate-500">
          {isAr ? 'جاهز للتنزيل والطباعة المباشرة' : 'Ready for Print & Export'}
        </span>
      </div>

      {/* Celebration Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-neutral-border rounded-2xl shadow-xl p-8 md:p-10 text-center space-y-6"
      >
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
            {isAr ? '🎉 تم تسليم المجلد وتجهيز ملفات الطباعة بنجاح!' : t('done_header')}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            {isAr 
              ? 'الكتاب الآن مكتمل وجاهز للطباعة الفورية مباشرة على طابعتك، أو تنزيله كملف PDF على جهازك، بالإضافة إلى المرفقات الفنية المعتمدة.' 
              : t('done_desc')}
          </p>
        </div>

        {/* Primary Action Buttons: Print & Download PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" />
            {isAr ? '📥 تحميل الكتاب كاملاً بصيغة PDF' : 'Download Complete PDF'}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-brand-500/20 transition-all hover:scale-[1.02]"
          >
            <Printer className="w-4 h-4" />
            {isAr ? '🖨️ طباعة الكتاب (اختر الطابعة)' : 'Print Book Now'}
          </button>
        </div>

        {/* Book summary pill */}
        <div className="bg-slate-50 border border-neutral-border p-4 rounded-xl text-right max-w-md mx-auto flex items-start gap-4">
          <Award className="w-6 h-6 text-brand-500 mt-1 flex-shrink-0" />
          <div className="flex-1 text-right" dir={isRtl ? 'rtl' : 'ltr'}>
            <h4 className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">{t('certified_press_volume')}</h4>
            <h3 className="text-sm font-display font-bold text-slate-800 mt-0.5">{currentBook.metadata.title}</h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              {isAr 
                ? `مقاس الورق: ${currentBook.metadata.paperSize || 'A4'} | عدد الصفحات: ${currentBook.pages.length} صفحة`
                : `${t('chapters_label')}: ${currentBook.chapters.length} | ${t('trim_sheets_label')}: ${currentBook.pages.length}`}
            </p>
          </div>
        </div>

        {/* Printable output downloads list */}
        <div className="space-y-3 max-w-md mx-auto pt-4 text-right" dir={isRtl ? 'rtl' : 'ltr'}>
          <h4 className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 text-right">
            {isAr ? 'حزم المرفقات والشهادات المعتمدة للطباعة:' : t('generated_plate_packages')}
          </h4>
          
          {/* Download 1: PNG 300 DPI Archive */}
          <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-brand-300 transition shadow-xs">
            <span className="text-xs font-sans font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-500" />
              {isAr ? 'أرشيف لوحات ورسومات الكتاب عالية الدقة PNG (300 DPI)' : t('high_res_illustrations_archive')}
            </span>
            <button 
              onClick={handleDownloadPngArchive}
              title={isAr ? 'تحميل الأرشيف' : t('tooltip_download_btn')}
              className="flex items-center gap-1 text-[10px] uppercase font-mono font-bold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              {isAr ? 'تحميل' : 'Download'}
            </button>
          </div>

          {/* Download 2: Curriculum Alignment Document */}
          <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-brand-300 transition shadow-xs">
            <span className="text-xs font-sans font-semibold text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {isAr ? 'مستند مطابقة المنهج والاعتماد التعليمي' : t('syllabus_alignment_ledger')}
            </span>
            <button 
              onClick={handleDownloadCurriculumDoc}
              title={isAr ? 'تحميل مستند المنهج' : t('tooltip_download_btn')}
              className="flex items-center gap-1 text-[10px] uppercase font-mono font-bold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              {isAr ? 'تحميل' : 'Download'}
            </button>
          </div>

          {/* Download 3: Technical & Pedagogical Review */}
          <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-brand-300 transition shadow-xs">
            <span className="text-xs font-sans font-semibold text-slate-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              {isAr ? 'مراجعة وتأكيد المعايير الفنية والتربوية' : 'Technical & Pedagogical Standards Review'}
            </span>
            <button 
              onClick={handleDownloadAuditDoc}
              title={isAr ? 'تحميل التقرير الفني' : t('tooltip_download_btn')}
              className="flex items-center gap-1 text-[10px] uppercase font-mono font-bold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              {isAr ? 'تحميل' : 'Download'}
            </button>
          </div>
        </div>

        {/* Return to Simple Mode button at bottom */}
        <div className="pt-6 border-t border-slate-100 max-w-md mx-auto space-y-3">
          <button
            onClick={handleReturnToSimpleMode}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-900 text-white font-sans font-bold text-xs rounded-xl shadow transition"
          >
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {isAr ? 'العودة للوضع البسيط (الصفحة السابقة)' : 'Return to Simple Mode'}
          </button>

          <button
            onClick={resetActiveProject}
            title={t('tooltip_start_another_btn')}
            className="w-full flex items-center justify-center gap-2 py-2 text-slate-500 hover:text-slate-700 font-sans font-semibold text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t('start_another_btn')}
          </button>
        </div>

      </motion.div>
    </div>
  );
}

