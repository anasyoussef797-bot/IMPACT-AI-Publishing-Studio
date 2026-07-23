import React, { useState, useRef } from 'react';
import { usePublishingStore } from '../store/publishingStore';
import { useTranslation } from '../localization';
import { FileUp, Loader2, Check, X, BookOpen, Layers, Sparkles, Image as ImageIcon, Upload, Printer } from 'lucide-react';
import { parsePdfFile, ParsedPdfPage } from '../utils/pdfImporter';

interface PdfImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PdfImportModal({ isOpen, onClose }: PdfImportModalProps) {
  const { uiLanguage, isRtl } = useTranslation();
  const { initializeNewBook, setPages, updateBookMetadata, addNotification } = usePublishingStore();

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [extractedPages, setExtractedPages] = useState<ParsedPdfPage[]>([]);

  // Metadata overrides for imported book
  const [customBookName, setCustomBookName] = useState('');
  const [nurseryLogoUrl, setNurseryLogoUrl] = useState('');
  const [institutionLogoUrl, setInstitutionLogoUrl] = useState('');
  const [platformName, setPlatformName] = useState('منصة أقرأ التعليمية');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nurseryLogoRef = useRef<HTMLInputElement>(null);
  const instLogoRef = useRef<HTMLInputElement>(null);

  const isAr = uiLanguage === 'ar';

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      addNotification('error', isAr ? 'يرجى اختيار ملف بصيغة PDF فقط' : 'Please select a PDF file');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);
    setProgress({ current: 0, total: 0 });

    try {
      addNotification('info', isAr ? 'جاري قراءة واستخراج صفحات ملف الـ PDF...' : 'Reading PDF pages...');
      
      const pages = await parsePdfFile(selectedFile, (current, total) => {
        setProgress({ current, total });
      });

      setExtractedPages(pages);
      setCustomBookName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      addNotification('success', isAr ? `تم استخراج ${pages.length} صفحة بنجاح من كتاب PDF!` : `Extracted ${pages.length} pages successfully!`);
    } catch (err) {
      console.error('PDF parsing error:', err);
      addNotification('error', isAr ? 'فشل استخراج ملف PDF. قد يكون الملف محمياً أو غير صالح.' : 'Failed to parse PDF file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'nursery' | 'institution') => {
    const uploadFile = e.target.files?.[0];
    if (!uploadFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'nursery') {
        setNurseryLogoUrl(dataUrl);
      } else {
        setInstitutionLogoUrl(dataUrl);
      }
      addNotification('success', isAr ? 'تم رفع الشعار بنجاح!' : 'Logo uploaded successfully!');
    };
    reader.readAsDataURL(uploadFile);
  };

  const handleConfirmImport = () => {
    if (extractedPages.length === 0) return;

    const bookTitle = customBookName.trim() || file?.name || 'كتاب PDF مستورد';

    // 1. Initialize new book metadata
    initializeNewBook({
      title: bookTitle,
      customBookName: bookTitle,
      subtitle: 'كتاب معدل ومستورد من PDF جاهز للطباعة',
      author: 'محرر الاستوديو',
      ageGroup: 'preschool',
      bookType: 'arabic',
      language: 'ar',
      targetCurriculum: 'traditional',
      pedagogicalGoal: 'تعديل شعارات وتفاصيل الكتاب وتصديره أو طباعته',
      paperSize: 'A4',
      dimensions: { width: 210, height: 297, unit: 'mm' },
      bleed: 3,
      margin: 10,
      nurseryLogoUrl,
      institutionLogoUrl,
      platformName
    });

    // 2. Map parsed PDF pages into store pages
    const newPages = extractedPages.map((p, index) => ({
      id: `imported-pdf-page-${index + 1}-${Date.now()}`,
      pageNumber: index + 1,
      title: `صفحة ${index + 1}`,
      layoutType: 'coloring' as const,
      illustrationUrl: p.imageDataUrl,
      textContent: '',
      colorsUsed: ['#e11d48', '#2563eb', '#16a34a', '#ca8a04', '#ea580c'],
      activity: {
        type: 'none' as const
      }
    }));

    setPages(newPages);

    addNotification('success', isAr ? 'تم استيراد الكتاب بنجاح للبيئة النشطة! يمكنك الآن تعديل اللوجو والعناوين وطباعته أو تصديره.' : 'Book imported successfully! You can now edit logos and print.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div 
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 overflow-hidden flex flex-col max-h-[90vh]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {isAr ? '📂 استيراد وتعديل كتاب PDF جاهز' : '📂 Import & Edit Existing PDF Book'}
              </h2>
              <p className="text-xs text-slate-500">
                {isAr ? 'قم برفع أي كتاب PDF لتعديل اللوجو، الاسم، إضافة صفحات، ثم طباعته أو تصديره' : 'Upload any PDF book to edit logos, title, details, and export to PDF or print'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          
          {/* Step 1: Upload Box */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
          >
            <FileUp className="w-10 h-10 text-indigo-500 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm font-bold text-slate-700">
                {file ? file.name : (isAr ? 'انقر هنا لرفع ملف كتاب PDF من جهازك' : 'Click here to upload a PDF file')}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {file ? (isAr ? `الحجم: ${(file.size / (1024 * 1024)).toFixed(2)} ميجابايت` : `Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`) : (isAr ? 'يدعم جميع كتب الروضة والتلوين بصيغة PDF' : 'Supports all PDF books')}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Loading state */}
          {isProcessing && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-center gap-3 text-slate-600 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span>
                {isAr ? `جاري معالجة الصفحات واستخراج الصور: (${progress.current} من ${progress.total})` : `Processing pages: (${progress.current} of ${progress.total})`}
              </span>
            </div>
          )}

          {/* Extracted pages summary & customization fields */}
          {extractedPages.length > 0 && !isProcessing && (
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-4 h-4 text-emerald-600" />
                  {isAr ? `تم استخراج ${extractedPages.length} صفحة جاهزة للتعديل` : `Extracted ${extractedPages.length} pages`}
                </span>
                <span className="text-slate-400 font-mono">A4 Portrait</span>
              </div>

              {/* Grid thumbnail preview */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {extractedPages.map((p) => (
                  <div key={p.pageNumber} className="relative aspect-[1/1.4] border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                    <img src={p.imageDataUrl} alt={p.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 px-1 bg-slate-900/80 text-white text-[9px] font-mono rounded">
                      {p.pageNumber}
                    </span>
                  </div>
                ))}
              </div>

              {/* Customization Controls for Imported PDF */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  {isAr ? 'تخصيص تفاصيل وشعارات الكتاب المستورد:' : 'Customize Imported Book Details & Logos:'}
                </h4>

                {/* 1. Book Title */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                    {isAr ? 'عنوان الكتاب الجديد / المحدث:' : 'New Book Title:'}
                  </label>
                  <input
                    type="text"
                    value={customBookName}
                    onChange={(e) => setCustomBookName(e.target.value)}
                    placeholder={isAr ? 'أدخل عنوان الكتاب...' : 'Enter book title...'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-hidden text-right font-bold"
                  />
                </div>

                {/* 2. Nursery Logo (Top Left) */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                    {isAr ? '🏫 شعار الحضانة / الروضة (يظهر في الجانب الأيسر العلوي لكافة الصفحات):' : '🏫 Nursery Logo (Top Left on all pages):'}
                  </label>
                  <div className="flex items-center gap-2">
                    {nurseryLogoUrl && (
                      <div className="w-9 h-9 border border-slate-200 rounded-lg overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                        <img src={nurseryLogoUrl} alt="Nursery Logo" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <input
                      type="text"
                      value={nurseryLogoUrl}
                      onChange={(e) => setNurseryLogoUrl(e.target.value)}
                      placeholder={isAr ? 'رابط شعار الحضانة أو ارفعه بملف...' : 'Nursery logo URL...'}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-hidden text-right"
                    />
                    <button
                      type="button"
                      onClick={() => nurseryLogoRef.current?.click()}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {isAr ? 'رفع' : 'Upload'}
                    </button>
                    <input
                      ref={nurseryLogoRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleLogoUpload(e, 'nursery')}
                    />
                  </div>
                </div>

                {/* 3. Institution / Publisher Logo */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                    {isAr ? '🏛️ شعار الناشر / المؤسسة (يظهر أسفل كل صفحة):' : '🏛️ Institution Logo (Footer):'}
                  </label>
                  <div className="flex items-center gap-2">
                    {institutionLogoUrl && (
                      <div className="w-9 h-9 border border-slate-200 rounded-lg overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                        <img src={institutionLogoUrl} alt="Institution Logo" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <input
                      type="text"
                      value={institutionLogoUrl}
                      onChange={(e) => setInstitutionLogoUrl(e.target.value)}
                      placeholder={isAr ? 'رابط شعار المؤسسة...' : 'Institution logo URL...'}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-hidden text-right"
                    />
                    <button
                      type="button"
                      onClick={() => instLogoRef.current?.click()}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {isAr ? 'رفع' : 'Upload'}
                    </button>
                    <input
                      ref={instLogoRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleLogoUpload(e, 'institution')}
                    />
                  </div>
                </div>

                {/* 4. Platform / Publisher Name */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                    {isAr ? 'اسم المنصة / دار النشر (التذييل السفلي):' : 'Publisher Name (Footer):'}
                  </label>
                  <input
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    placeholder={isAr ? 'اسم دار النشر...' : 'Publisher name...'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-hidden text-right"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={extractedPages.length === 0 || isProcessing}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-white shadow-md transition ${
              extractedPages.length > 0 && !isProcessing
                ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {isAr ? 'استيراد الكتاب وفتح محرر التعديل' : 'Import Book to Studio'}
          </button>
        </div>

      </div>
    </div>
  );
}
