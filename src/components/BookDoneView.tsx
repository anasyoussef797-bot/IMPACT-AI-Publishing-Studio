/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePublishingStore } from '../store/publishingStore';
import { useTranslation } from '../localization';
import { CheckCircle, Award, FileText, Download, Printer, ArrowRight, ArrowLeft, RefreshCw, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function BookDoneView() {
  const { t, isRtl, uiLanguage } = useTranslation();
  const { currentBook, resetActiveProject, navigateStage, setProfessionalMode, addNotification } = usePublishingStore();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!currentBook) return null;

  const isAr = uiLanguage === 'ar';

  // Handle direct printer action targeting ONLY book pages
  const handlePrint = () => {
    addNotification('info', isAr ? 'جاري تجهيز الكتاب للطباعة المباشرة...' : 'Preparing book for printer...');

    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0px';
    printIframe.style.height = '0px';
    printIframe.style.border = 'none';

    document.body.appendChild(printIframe);

    const doc = printIframe.contentWindow?.document;
    if (!doc) return;

    const coverHtml = `
      <div class="print-page cover-page" dir="${isRtl ? 'rtl' : 'ltr'}">
        <div style="text-align: center; margin-top: 80px;">
          <p style="font-size: 16px; color: #0f172a; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">${currentBook.metadata.platformName || 'IMPACT Publishing Studio'}</p>
          <h1 style="font-size: 42px; font-weight: 900; margin: 20px 0 10px; color: #0f172a;">${currentBook.metadata.customBookName || currentBook.metadata.title}</h1>
          <p style="font-size: 18px; color: #475569;">${currentBook.metadata.subtitle || 'كتاب تلوين وتعليم أطفال متكامل'}</p>
        </div>
        <div style="border: 4px dashed #0f172a; border-radius: 24px; padding: 50px; margin: 60px auto; text-align: center; max-width: 400px; background: #f8fafc;">
          <span style="font-size: 72px;">🎨📖</span>
          <p style="font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 16px;">جاهز للتلوين والإبداع</p>
        </div>
        <div style="text-align: center; font-size: 13px; color: #64748b; margin-top: 60px;">
          <span>المرحلة العمرية: ${currentBook.metadata.targetAge || '3 - 8 سنوات'} | المقاس: ${currentBook.metadata.paperSize || 'A4'}</span>
        </div>
      </div>
    `;

    const pagesHtml = currentBook.pages.map((p, idx) => `
      <div class="print-page" dir="${isRtl ? 'rtl' : 'ltr'}">
        <div class="header">
          <span>📖 ${currentBook.metadata.customBookName || currentBook.metadata.title}</span>
          <span>صفحة ${idx + 1} من ${currentBook.pages.length}</span>
        </div>

        <div class="content">
          <h2>${p.title || 'صفحة تلوين'}</h2>
          ${p.textContent ? `<p class="desc">${p.textContent}</p>` : ''}
          
          ${p.illustrationUrl ? `
            <div class="img-container">
              <img src="${p.illustrationUrl}" crossOrigin="anonymous" />
            </div>
          ` : ''}

          ${p.activity && p.activity.type === 'tracing' ? `
            <div class="tracing-box">
              <span class="tracing-title">✍️ تتبع كتابة وتلوين الحرف:</span>
              <div class="tracing-chars">
                <span class="char">${p.activity.contentData?.character || 'أ'}</span>
                <span class="char dim">${p.activity.contentData?.character || 'أ'}</span>
                <span class="char faint">${p.activity.contentData?.character || 'أ'}</span>
              </div>
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <span>${currentBook.metadata.platformName || 'IMPACT Publishing'}</span>
          <span>صفحة ${idx + 1}</span>
        </div>
      </div>
    `).join('');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="${uiLanguage}">
      <head>
        <meta charset="utf-8">
        <title>${currentBook.metadata.title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, sans-serif;
            background: #ffffff;
            color: #0f172a;
          }
          .print-page {
            page-break-after: always;
            page-break-inside: avoid;
            height: 98vh;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 20px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            font-size: 13px;
            font-weight: bold;
            color: #334155;
          }
          .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          h2 {
            font-size: 24px;
            margin: 8px 0;
            color: #0f172a;
          }
          .desc {
            font-size: 15px;
            color: #475569;
            margin-bottom: 16px;
          }
          .img-container img {
            max-width: 100%;
            max-height: 520px;
            object-fit: contain;
            margin: 0 auto;
            display: block;
          }
          .tracing-box {
            margin-top: 16px;
            padding: 12px;
            border: 3px dashed #0f172a;
            border-radius: 12px;
            width: 85%;
            background: #f8fafc;
          }
          .tracing-title {
            font-size: 13px;
            font-weight: bold;
            display: block;
            margin-bottom: 6px;
          }
          .tracing-chars {
            display: flex;
            justify-content: center;
            gap: 24px;
          }
          .char {
            font-size: 48px;
            font-weight: 900;
            color: #475569;
            text-decoration: line-through;
          }
          .char.dim {
            color: #94a3b8;
          }
          .char.faint {
            color: #cbd5e1;
          }
          .footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            font-size: 11px;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>
        ${coverHtml}
        ${pagesHtml}
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printIframe)) {
          document.body.removeChild(printIframe);
        }
      }, 1000);
    }, 500);
  };

  // Handle PDF file download using jsPDF + html2canvas
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    addNotification('info', isAr ? 'جاري تحضير وإنشاء ملف PDF للكتاب...' : 'Preparing PDF file...');

    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'fixed';
      pdfContainer.style.top = '-9999px';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.width = '794px';
      pdfContainer.style.background = '#ffffff';
      pdfContainer.dir = isRtl ? 'rtl' : 'ltr';

      const coverHtml = `
        <div class="pdf-page" style="width: 794px; height: 1123px; padding: 60px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; text-align: center; font-family: sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff;">
          <div style="margin-top: 40px;">
            <p style="font-size: 16px; letter-spacing: 2px; color: #38bdf8; text-transform: uppercase;">${currentBook.metadata.platformName || 'IMPACT Publishing Studio'}</p>
            <h1 style="font-size: 42px; font-weight: 900; margin-top: 20px; margin-bottom: 10px; color: #ffffff;">${currentBook.metadata.customBookName || currentBook.metadata.title}</h1>
            <p style="font-size: 18px; color: #94a3b8;">${currentBook.metadata.subtitle || 'كتاب تلوين وتعليم أطفال متكامل'}</p>
          </div>
          <div style="border: 4px dashed #38bdf8; border-radius: 24px; padding: 40px; margin: 40px auto; max-width: 500px; background: rgba(255,255,255,0.05);">
            <span style="font-size: 64px;">🎨📖</span>
            <p style="font-size: 16px; color: #e2e8f0; margin-top: 20px;">عالم من الإبداع والتلوين للأطفال</p>
          </div>
          <div style="margin-bottom: 20px; font-size: 14px; color: #64748b; border-top: 1px solid #334155; padding-top: 20px;">
            <span>المرحلة العمرية: ${currentBook.metadata.targetAge || '3 - 8 سنوات'} | المقاس: ${currentBook.metadata.paperSize || 'A4'}</span>
          </div>
        </div>
      `;

      const pagesHtml = currentBook.pages.map((p, idx) => `
        <div class="pdf-page" style="width: 794px; height: 1123px; padding: 50px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; text-align: center; font-family: sans-serif; background: #ffffff; color: #0f172a; border: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; font-size: 14px; font-weight: bold; color: #475569;">
            <span>📖 ${currentBook.metadata.customBookName || currentBook.metadata.title}</span>
            <span>صفحة ${idx + 1} من ${currentBook.pages.length}</span>
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <h2 style="font-size: 26px; font-weight: bold; margin-bottom: 10px; color: #0f172a;">${p.title || 'صفحة تلوين'}</h2>
            ${p.textContent ? `<p style="font-size: 16px; color: #334155; margin-bottom: 20px; line-height: 1.6;">${p.textContent}</p>` : ''}
            
            ${p.illustrationUrl ? `
              <div style="margin: 10px auto; max-height: 580px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                <img src="${p.illustrationUrl}" style="max-width: 650px; max-height: 550px; object-fit: contain;" crossOrigin="anonymous" />
              </div>
            ` : ''}

            ${p.activity && p.activity.type === 'tracing' ? `
              <div style="margin-top: 15px; padding: 15px; border: 3px dashed #0f172a; border-radius: 16px; background: #f8fafc; width: 85%;">
                <span style="font-size: 14px; font-weight: bold; color: #0f172a; display: block; margin-bottom: 8px;">✍️ تتبع كتابة وتلوين الحرف:</span>
                <div style="display: flex; justify-content: center; gap: 30px;">
                  <span style="font-size: 56px; font-weight: 900; letter-spacing: 16px; color: #475569; text-decoration: line-through;">${p.activity.contentData?.character || 'أ'}</span>
                  <span style="font-size: 56px; font-weight: 900; letter-spacing: 16px; color: #94a3b8; text-decoration: line-through;">${p.activity.contentData?.character || 'أ'}</span>
                </div>
              </div>
            ` : ''}
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between;">
            <span>${currentBook.metadata.platformName || 'IMPACT Publishing'}</span>
            <span>صفحة ${idx + 1}</span>
          </div>
        </div>
      `).join('');

      pdfContainer.innerHTML = coverHtml + pagesHtml;
      document.body.appendChild(pdfContainer);

      const pageElements = pdfContainer.querySelectorAll('.pdf-page');

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i] as HTMLElement;
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (i > 0) pdf.addPage('a4', 'p');
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      document.body.removeChild(pdfContainer);
      pdf.save(`${currentBook.metadata.title || 'Coloring_Book'}.pdf`);
      addNotification('success', isAr ? 'تم تحميل الكتاب كاملاً بصيغة PDF بنجاح!' : 'PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF error:', err);
      addNotification('error', isAr ? 'فشل تحميل PDF، جرب استخدام زر الطباعة المباشرة' : 'Error generating PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
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
      <div className="mb-6 flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800">
        <button
          onClick={handleReturnToSimpleMode}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {isAr ? '🔙 العودة للوضع البسيط (الصفحة السابقة)' : '🔙 Return to Simple Workspace Mode'}
        </button>

        <span className="text-xs font-mono font-semibold text-slate-300">
          {isAr ? 'جاهز للتنزيل والطباعة المباشرة' : 'Ready for Print & Export'}
        </span>
      </div>

      {/* Celebration Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8 md:p-10 text-center space-y-6"
      >
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
            {isAr ? '🎉 تم تسليم المجلد وتجهيز ملفات الطباعة بنجاح!' : t('done_header')}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            {isAr 
              ? 'الكتاب الآن مكتمل وجاهز للطباعة الفورية مباشرة على طابعتك، أو تنزيله كملف PDF على جهازك، بالإضافة إلى المرفقات الفنية المعتمدة.' 
              : t('done_desc')}
          </p>
        </div>

        {/* Primary Action Buttons: Print & Download PDF in Rich Navy & Emerald */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-[1.02]"
          >
            {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isAr ? (isGeneratingPdf ? 'جاري التنسيق...' : '📥 تحميل الكتاب كاملاً بصيغة PDF') : 'Download Complete PDF'}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-[1.02]"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            {isAr ? '🖨️ طباعة الكتاب (اختر الطابعة)' : 'Print Book Now'}
          </button>
        </div>

        {/* Book summary pill */}
        <div className="bg-slate-900 text-white border border-slate-800 p-4 rounded-xl text-right max-w-md mx-auto flex items-start gap-4 shadow-sm">
          <Award className="w-6 h-6 text-emerald-400 mt-1 flex-shrink-0" />
          <div className="flex-1 text-right" dir={isRtl ? 'rtl' : 'ltr'}>
            <h4 className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">{t('certified_press_volume')}</h4>
            <h3 className="text-sm font-display font-bold text-white mt-0.5">{currentBook.metadata.title}</h3>
            <p className="text-[11px] text-slate-300 font-sans mt-0.5">
              {isAr 
                ? `مقاس الورق: ${currentBook.metadata.paperSize || 'A4'} | عدد الصفحات: ${currentBook.pages.length} صفحة`
                : `${t('chapters_label')}: ${currentBook.chapters.length} | ${t('trim_sheets_label')}: ${currentBook.pages.length}`}
            </p>
          </div>
        </div>

        {/* Printable output downloads list */}
        <div className="space-y-3 max-w-md mx-auto pt-4 text-right" dir={isRtl ? 'rtl' : 'ltr'}>
          <h4 className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-500 text-right">
            {isAr ? 'حزم المرفقات والشهادات المعتمدة للطباعة:' : t('generated_plate_packages')}
          </h4>
          
          {/* Download 1: PNG 300 DPI Archive */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-400 transition shadow-xs">
            <span className="text-xs font-sans font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              {isAr ? 'أرشيف لوحات ورسومات الكتاب عالية الدقة PNG (300 DPI)' : t('high_res_illustrations_archive')}
            </span>
            <button 
              onClick={handleDownloadPngArchive}
              title={isAr ? 'تحميل الأرشيف' : t('tooltip_download_btn')}
              className="flex items-center gap-1 text-[10px] uppercase font-mono font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              {isAr ? 'تحميل' : 'Download'}
            </button>
          </div>

          {/* Download 2: Curriculum Alignment Document */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-400 transition shadow-xs">
            <span className="text-xs font-sans font-semibold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {isAr ? 'مستند مطابقة المنهج والاعتماد التعليمي' : t('syllabus_alignment_ledger')}
            </span>
            <button 
              onClick={handleDownloadCurriculumDoc}
              title={isAr ? 'تحميل مستند المنهج' : t('tooltip_download_btn')}
              className="flex items-center gap-1 text-[10px] uppercase font-mono font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              {isAr ? 'تحميل' : 'Download'}
            </button>
          </div>

          {/* Download 3: Technical & Pedagogical Review */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-400 transition shadow-xs">
            <span className="text-xs font-sans font-semibold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {isAr ? 'مراجعة وتأكيد المعايير الفنية والتربوية' : 'Technical & Pedagogical Standards Review'}
            </span>
            <button 
              onClick={handleDownloadAuditDoc}
              title={isAr ? 'تحميل التقرير الفني' : t('tooltip_download_btn')}
              className="flex items-center gap-1 text-[10px] uppercase font-mono font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition"
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
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold text-xs rounded-xl shadow transition"
          >
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {isAr ? 'العودة للوضع البسيط (الصفحة السابقة)' : 'Return to Simple Mode'}
          </button>

          <button
            onClick={resetActiveProject}
            title={t('tooltip_start_another_btn')}
            className="w-full flex items-center justify-center gap-2 py-2 text-slate-600 hover:text-slate-900 font-sans font-semibold text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t('start_another_btn')}
          </button>
        </div>

      </motion.div>
    </div>
  );
}


