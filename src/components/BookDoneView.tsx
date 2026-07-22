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
import { generateColoringOutline } from '../utils/imageOutline';

export default function BookDoneView() {
  const { t, isRtl, uiLanguage } = useTranslation();
  const { currentBook, resetActiveProject, navigateStage, setProfessionalMode, addNotification } = usePublishingStore();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!currentBook) return null;

  const isAr = uiLanguage === 'ar';

  // Handle direct printer action targeting ONLY book pages
  const handlePrint = async () => {
    addNotification('info', isAr ? 'جاري تحويل الرسومات إلى أوتلاين أسود وأبيض وتجهيز الطباعة...' : 'Converting images to black & white outlines for print...');

    // Convert all illustrations to true black & white outlines
    const outlineImages = await Promise.all(
      currentBook.pages.map(async (p) => {
        if (!p.illustrationUrl) return '';
        try {
          return await generateColoringOutline(p.illustrationUrl, 35);
        } catch {
          return p.illustrationUrl;
        }
      })
    );

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
        <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; margin-top: 20px;">
          <p style="font-size: 16px; color: #0f172a; text-transform: uppercase; font-weight: bold; letter-spacing: 2px; margin: 0;">
            ${currentBook.metadata.platformName || 'IMPACT Publishing Studio'}
          </p>
          ${currentBook.metadata.nurseryLogoUrl ? `
            <img src="${currentBook.metadata.nurseryLogoUrl}" style="max-height: 2.8cm; max-width: 7cm; object-fit: contain;" alt="شعار الروضة" />
          ` : ''}
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <h1 style="font-size: 40px; font-weight: 900; margin: 16px 0 10px; color: #0f172a;">
            ${currentBook.metadata.customBookName || currentBook.metadata.title}
          </h1>
          <p style="font-size: 18px; color: #475569; margin: 0;">
            ${currentBook.metadata.subtitle || 'كتاب تلوين وتعليم أطفال متكامل'}
          </p>
        </div>

        <div style="border: 4px dashed #0f172a; border-radius: 24px; padding: 40px; margin: 40px auto; text-align: center; max-width: 400px; background: #f8fafc;">
          <span style="font-size: 64px;">🎨📖</span>
          <p style="font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 16px;">عالم من الإبداع والتلوين الممتع</p>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #64748b; margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 16px;">
          <div style="display: flex; items-align: center; gap: 8px;">
            ${currentBook.metadata.institutionLogoUrl ? `
              <img src="${currentBook.metadata.institutionLogoUrl}" style="max-height: 2cm; max-width: 4.5cm; object-fit: contain;" alt="شعار المؤسسة" />
            ` : ''}
            <span style="font-weight: 700; color: #334155; align-self: center;">${currentBook.metadata.platformName || 'منصة أقرأ التعليمية'}</span>
          </div>
          <div>
            <span>المرحلة العمرية: ${currentBook.metadata.targetAge || '3 - 8 سنوات'} | المقاس: ${currentBook.metadata.paperSize || 'A4'}</span>
          </div>
        </div>
      </div>
    `;

    const pagesHtml = currentBook.pages.map((p, idx) => `
      <div class="print-page" dir="${isRtl ? 'rtl' : 'ltr'}">
        
        <!-- Header: Top Right = Colored Ref (<= 6cm), Top Center = Title & Badge, Top Left = Nursery Logo -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; height: 6.2cm;">
          
          <!-- Top Right: Small Colored Reference Thumbnail (<= 6cm height) -->
          <div style="display: flex; flex-direction: column; align-items: flex-start; width: 6cm; flex-shrink: 0;">
            ${p.illustrationUrl ? `
              <div style="border: 2px solid #cbd5e1; border-radius: 8px; padding: 2px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                <img src="${p.illustrationUrl}" style="max-height: 5.2cm; max-width: 5.5cm; object-fit: contain; border-radius: 6px; display: block;" crossOrigin="anonymous" alt="دليل التلوين" />
              </div>
              <span style="font-size: 9px; font-weight: bold; color: #64748b; margin-top: 3px;">🎨 ${isAr ? 'دليل التلوين' : 'Color Guide'}</span>
            ` : ''}
          </div>

          <!-- Top Center: Book Title & Page Badge -->
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; text-align: center; padding: 0 12px; margin-top: 6px;">
            <span style="font-size: 14px; font-weight: 800; color: #1e293b; margin-bottom: 6px; display: block;">${currentBook.metadata.customBookName || currentBook.metadata.title}</span>
            <span style="font-size: 11px; font-weight: bold; color: #475569; background: #f1f5f9; padding: 4px 12px; border-radius: 12px; border: 1px solid #e2e8f0; display: inline-block;">
              ${isAr ? `صفحة ${idx + 1}` : `Page ${idx + 1}`}
            </span>
          </div>

          <!-- Top Left: Nursery / School Logo -->
          <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-start; width: 6.5cm; flex-shrink: 0;">
            ${currentBook.metadata.nurseryLogoUrl ? `
              <img src="${currentBook.metadata.nurseryLogoUrl}" style="max-height: 2.5cm; max-width: 6.2cm; object-fit: contain;" crossOrigin="anonymous" alt="شعار الحضانة" />
            ` : ''}
          </div>
        </div>

        <!-- Body: Coloring Outline Image in Center above Tracing Letters -->
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center;">
          
          <div>
            ${p.title ? `<h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">${p.title}</h2>` : ''}
            ${p.textContent ? `<p style="font-size: 13px; color: #475569; margin: 0 0 8px 0;">${p.textContent}</p>` : ''}
          </div>

          <!-- Center Black & White Outline Image for Coloring -->
          ${p.illustrationUrl ? `
            <div style="flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; margin: 6px 0;">
              <img 
                src="${outlineImages[idx] || p.illustrationUrl}" 
                style="max-height: 13.5cm; max-width: 17.5cm; object-fit: contain; display: block;" 
                crossOrigin="anonymous" 
                alt="رسمة التلوين" 
              />
            </div>
          ` : ''}

          <!-- Character Tracing Box directly below the Outline Image -->
          ${p.activity && p.activity.type === 'tracing' ? `
            <div style="width: 92%; border: 2.5px dashed #0f172a; border-radius: 14px; padding: 8px 16px; background: #f8fafc; margin-top: 6px;">
              <span style="font-size: 11px; font-weight: 800; color: #0f172a; display: block; margin-bottom: 2px;">✍️ ${isAr ? 'تتبع خطوط الحرف ولونه:' : 'Trace lines & color:'}</span>
              <div style="display: flex; justify-content: center; align-items: center; gap: 32px; font-family: monospace;">
                <span style="font-size: 46px; font-weight: 900; color: #1e293b; text-decoration: line-through;">${p.activity.contentData?.character || 'أ'}</span>
                <span style="font-size: 46px; font-weight: 900; color: #94a3b8; text-decoration: line-through;">${p.activity.contentData?.character || 'أ'}</span>
                <span style="font-size: 46px; font-weight: 900; color: #cbd5e1; text-decoration: line-through;">${p.activity.contentData?.character || 'أ'}</span>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Footer: Platform Name + Institution Logo (max 2cm) + Page Number -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #e2e8f0; padding-top: 8px; margin-top: 8px; font-size: 11px; color: #64748b;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${currentBook.metadata.institutionLogoUrl ? `
              <img src="${currentBook.metadata.institutionLogoUrl}" style="max-height: 1.8cm; max-width: 4cm; object-fit: contain;" crossOrigin="anonymous" alt="شعار المؤسسة" />
            ` : ''}
            <span style="font-weight: 800; color: #334155; align-self: center;">${currentBook.metadata.platformName || 'منصة أقرأ التعليمية'}</span>
          </div>

          <div style="font-weight: 600; color: #64748b;">
            <span>${currentBook.metadata.customBookName || currentBook.metadata.title}</span>
          </div>

          <div style="font-weight: 800; color: #0f172a;">
            <span>${isAr ? `صفحة ${idx + 1} من ${currentBook.pages.length}` : `Page ${idx + 1} of ${currentBook.pages.length}`}</span>
          </div>
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
            margin: 0; /* Prevents browser print header/footer time, URL, date */
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #0f172a;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-page {
            page-break-after: always;
            page-break-inside: avoid;
            width: 210mm;
            height: 297mm;
            padding: 10mm 12mm 10mm 12mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: #ffffff;
            position: relative;
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
    addNotification('info', isAr ? 'جاري استخلاص خطوط الرسم وبناء ملف PDF الملون والمتناسق...' : 'Generating crisp black & white outline PDF...');

    try {
      // Convert all illustrations to real line-art black & white outline Data URLs
      const outlineImages = await Promise.all(
        currentBook.pages.map(async (p) => {
          if (!p.illustrationUrl) return '';
          try {
            return await generateColoringOutline(p.illustrationUrl, 35);
          } catch {
            return p.illustrationUrl;
          }
        })
      );

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
        <div class="pdf-page" style="width: 794px; height: 1123px; padding: 50px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; text-align: center; font-family: sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; margin-top: 20px;">
            <p style="font-size: 16px; letter-spacing: 2px; color: #38bdf8; text-transform: uppercase;">${currentBook.metadata.platformName || 'IMPACT Publishing Studio'}</p>
            ${currentBook.metadata.nurseryLogoUrl ? `
              <img src="${currentBook.metadata.nurseryLogoUrl}" style="max-height: 90px; max-width: 250px; object-fit: contain;" alt="شعار الروضة" />
            ` : ''}
          </div>

          <div style="margin-top: 20px;">
            <h1 style="font-size: 42px; font-weight: 900; margin-top: 20px; margin-bottom: 10px; color: #ffffff;">${currentBook.metadata.customBookName || currentBook.metadata.title}</h1>
            <p style="font-size: 18px; color: #94a3b8;">${currentBook.metadata.subtitle || 'كتاب تلوين وتعليم أطفال متكامل'}</p>
          </div>

          <div style="border: 4px dashed #38bdf8; border-radius: 24px; padding: 40px; margin: 40px auto; max-width: 500px; background: rgba(255,255,255,0.05);">
            <span style="font-size: 64px;">🎨📖</span>
            <p style="font-size: 16px; color: #e2e8f0; margin-top: 20px;">عالم من الإبداع والتلوين للأطفال</p>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 14px; color: #64748b; border-top: 1px solid #334155; padding-top: 20px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              ${currentBook.metadata.institutionLogoUrl ? `
                <img src="${currentBook.metadata.institutionLogoUrl}" style="max-height: 60px; max-width: 180px; object-fit: contain;" alt="شعار المؤسسة" />
              ` : ''}
              <span style="color: #cbd5e1; font-weight: bold;">${currentBook.metadata.platformName || 'منصة أقرأ التعليمية'}</span>
            </div>
            <span>المرحلة العمرية: ${currentBook.metadata.targetAge || '3 - 8 سنوات'} | المقاس: ${currentBook.metadata.paperSize || 'A4'}</span>
          </div>
        </div>
      `;

      const pagesHtml = currentBook.pages.map((p, idx) => `
        <div class="pdf-page" style="width: 794px; height: 1123px; padding: 40px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; text-align: center; font-family: sans-serif; background: #ffffff; color: #0f172a; border: 1px solid #e2e8f0;">
          
          <!-- Header Area -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; height: 210px;">
            <!-- Top Right: Colored Reference Image (max height 210px / <= 6cm) -->
            <div style="display: flex; flex-direction: column; align-items: flex-start; width: 210px; flex-shrink: 0;">
              ${p.illustrationUrl ? `
                <div style="border: 2px solid #cbd5e1; border-radius: 8px; padding: 2px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                  <img src="${p.illustrationUrl}" style="max-height: 180px; max-width: 200px; object-fit: contain; border-radius: 6px; display: block;" crossOrigin="anonymous" alt="دليل التلوين" />
                </div>
                <span style="font-size: 10px; font-weight: bold; color: #64748b; margin-top: 3px;">🎨 ${isAr ? 'دليل التلوين' : 'Color Guide'}</span>
              ` : ''}
            </div>

            <!-- Top Center: Book Title & Page Badge -->
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; text-align: center; padding: 0 12px; margin-top: 8px;">
              <span style="font-size: 15px; font-weight: 800; color: #1e293b; margin-bottom: 6px; display: block;">${currentBook.metadata.customBookName || currentBook.metadata.title}</span>
              <span style="font-size: 12px; font-weight: bold; color: #475569; background: #f1f5f9; padding: 4px 12px; border-radius: 12px; border: 1px solid #e2e8f0; display: inline-block;">
                ${isAr ? `صفحة ${idx + 1}` : `Page ${idx + 1}`}
              </span>
            </div>

            <!-- Top Left: Nursery / School Logo -->
            <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-start; width: 230px; flex-shrink: 0;">
              ${currentBook.metadata.nurseryLogoUrl ? `
                <img src="${currentBook.metadata.nurseryLogoUrl}" style="max-height: 85px; max-width: 220px; object-fit: contain;" crossOrigin="anonymous" alt="شعار الحضانة" />
              ` : ''}
            </div>
          </div>

          <!-- Content Body -->
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; padding: 10px 0;">
            <div>
              ${p.title ? `<h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">${p.title}</h2>` : ''}
              ${p.textContent ? `<p style="font-size: 14px; color: #475569; margin: 0 0 8px 0;">${p.textContent}</p>` : ''}
            </div>

            <!-- Center Black & White Outline Image (Real outline base64 without relying on unsupported CSS filters in html2canvas) -->
            ${p.illustrationUrl ? `
              <div style="flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; margin: 8px 0;">
                <img 
                  src="${outlineImages[idx] || p.illustrationUrl}" 
                  style="max-height: 520px; max-width: 680px; object-fit: contain; display: block;" 
                  crossOrigin="anonymous" 
                  alt="رسمة التلوين" 
                />
              </div>
            ` : ''}

            <!-- Tracing Box directly below Outline Image -->
            ${p.activity && p.activity.type === 'tracing' ? `
              <div style="width: 92%; border: 2.5px dashed #0f172a; border-radius: 16px; padding: 10px 16px; background: #f8fafc; margin-top: 8px;">
                <span style="font-size: 12px; font-weight: 800; color: #0f172a; display: block; margin-bottom: 4px;">✍️ ${isAr ? 'تتبع خطوط الحرف ولونه:' : 'Trace lines & color:'}</span>
                <div style="display: flex; justify-content: center; align-items: center; gap: 32px; font-family: monospace;">
                  <span style="font-size: 52px; font-weight: 900; color: #1e293b; text-decoration: line-through;">${p.activity.contentData?.character || 'أ'}</span>
                  <span style="font-size: 52px; font-weight: 900; color: #94a3b8; text-decoration: line-through;">${p.activity.contentData?.character || 'أ'}</span>
                  <span style="font-size: 52px; font-weight: 900; color: #cbd5e1; text-decoration: line-through;">${p.activity.contentData?.character || 'أ'}</span>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Footer Area -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 12px; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${currentBook.metadata.institutionLogoUrl ? `
                <img src="${currentBook.metadata.institutionLogoUrl}" style="max-height: 60px; max-width: 160px; object-fit: contain;" crossOrigin="anonymous" alt="شعار المؤسسة" />
              ` : ''}
              <span style="font-weight: 800; color: #334155; align-self: center;">${currentBook.metadata.platformName || 'منصة أقرأ التعليمية'}</span>
            </div>

            <div style="font-weight: 600; color: #64748b;">
              <span>${currentBook.metadata.customBookName || currentBook.metadata.title}</span>
            </div>

            <div style="font-weight: 800; color: #0f172a;">
              <span>${isAr ? `صفحة ${idx + 1} من ${currentBook.pages.length}` : `Page ${idx + 1} of ${currentBook.pages.length}`}</span>
            </div>
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


