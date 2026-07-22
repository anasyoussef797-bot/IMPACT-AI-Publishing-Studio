/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { usePublishingStore } from '../store/publishingStore';
import { useTranslation } from '../localization';
import { 
  BookOpen, Plus, Trash2, Printer, Sparkles, Image as ImageIcon, Upload, 
  ChevronLeft, ChevronRight, PenTool, Layout, Wand2, Type, Check,
  AlertCircle, Star, Palette, HelpCircle, ArrowLeftRight, Search, 
  RefreshCw, Scissors, Settings, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SimpleWorkspaceView() {
  const { t, isRtl, uiLanguage } = useTranslation();
  const { 
    currentBook, 
    addBlankPage, 
    updatePage, 
    deletePage, 
    generatePageAsset, 
    isAiGenerating, 
    aiStatusMessage,
    synthesizePrintPackage,
    addNotification,
    setProfessionalMode,
    updateBookMetadata
  } = usePublishingStore();

  // Selected Page State
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  
  // Tabs State (page customization vs book/print settings)
  const [activeConfigTab, setActiveConfigTab] = useState<'page' | 'book'>('page');

  // Page Customization States
  const [aiPrompt, setAiPrompt] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customText, setCustomText] = useState('');
  const [tracingChar, setTracingChar] = useState('أ');
  const [enableTracing, setEnableTracing] = useState(false);
  
  // Book Metadata & Layout States (Arabic-first)
  const [customBookName, setCustomBookName] = useState('');
  const [platformName, setPlatformName] = useState('');
  const [institutionLogoUrl, setInstitutionLogoUrl] = useState('');
  const [nurseryLogoUrl, setNurseryLogoUrl] = useState('');
  const [targetPages, setTargetPages] = useState(72);
  const [paperSize, setPaperSize] = useState<'A4' | 'A3' | 'Letter' | 'Custom'>('A4');
  const [paperWidth, setPaperWidth] = useState(21);
  const [paperHeight, setPaperHeight] = useState(29.7);
  const [paperUnit, setPaperUnit] = useState<'cm' | 'in' | 'mm'>('cm');

  const instLogoInputRef = useRef<HTMLInputElement>(null);
  const nurseryLogoInputRef = useRef<HTMLInputElement>(null);

  // Search Engine States
  const [searchQuery, setSearchQuery] = useState('');
  const [directImageUrl, setDirectImageUrl] = useState('');
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [webSearchResults, setWebSearchResults] = useState<Array<{ name: string; url: string; prompt: string }>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAr = uiLanguage === 'ar';

  const handleApplyDirectUrl = () => {
    if (!directImageUrl.trim() || !activePage) return;
    updatePage(activePage.id, {
      illustrationUrl: directImageUrl.trim(),
      layoutType: 'coloring'
    });
    setDirectImageUrl('');
    addNotification('success', isAr ? 'تمت إضافة الصورة من الرابط المباشر بنجاح!' : 'Image added successfully!');
  };

  // Kids smart outline & color palette states
  const [outlineDataUrl, setOutlineDataUrl] = useState<string | null>(null);
  const [isProcessingOutline, setIsProcessingOutline] = useState(false);
  const [outlineThreshold, setOutlineThreshold] = useState(40);
  const [useSmartOutline, setUseSmartOutline] = useState(true);
  
  // Current active page's custom kid colors (default to standard crayon colors)
  const [colorsUsed, setColorsUsed] = useState<string[]>(['#e11d48', '#2563eb', '#16a34a', '#ca8a04', '#ea580c']);

  // 12 High-Quality children coloring template presets (Curated Children-friendly outlines)
  const CURATED_GALLERY = [
    {
      nameAr: 'أسد لطيف',
      nameEn: 'Cute Lion',
      keywords: ['أسد', 'حيوان', 'lion', 'animal', 'بر', 'وحش'],
      url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&q=80&w=400',
      prompt: 'Minimalist clean black-and-white outline vector drawing of a cute friendly lion, coloring page style'
    },
    {
      nameAr: 'أرنب دافئ',
      nameEn: 'Cute Rabbit',
      keywords: ['أرنب', 'حيوان', 'rabbit', 'animal', 'فرو'],
      url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=400',
      prompt: 'Simple outline drawing of a cute sweet rabbit sitting, children coloring page'
    },
    {
      nameAr: 'رائد فضاء صغير',
      nameEn: 'Little Astronaut',
      keywords: ['رائد', 'فضاء', 'astronaut', 'space', 'قمر', 'نجوم'],
      url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=400',
      prompt: 'Simple outline drawing of a cute little astronaut on the moon, coloring page'
    },
    {
      nameAr: 'صاروخ فضائي',
      nameEn: 'Space Rocket',
      keywords: ['صاروخ', 'فضاء', 'rocket', 'space', 'طيران'],
      url: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=400',
      prompt: 'Cartoon space rocket flying in the sky, thick black borders, coloring sheet'
    },
    {
      nameAr: 'ديناصور وديع',
      nameEn: 'Friendly Dino',
      keywords: ['ديناصور', 'حيوان', 'dino', 'dinosaur', 'تنين'],
      url: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&q=80&w=400',
      prompt: 'Cute cartoon baby dinosaur playing, clean outline sketch, coloring page'
    },
    {
      nameAr: 'منزل دافئ',
      nameEn: 'Cozy House',
      keywords: ['منزل', 'بيت', 'house', 'home', 'حديقة'],
      url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=400',
      prompt: 'Simple sweet cartoon house with a garden, clean high contrast black lines, coloring book'
    },
    {
      nameAr: 'سيارة كرتونية',
      nameEn: 'Cartoon Car',
      keywords: ['سيارة', 'مركبة', 'car', 'vehicle', 'عجلات'],
      url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400',
      prompt: 'Cute simple cartoon car driving, coloring template, thick outlines'
    },
    {
      nameAr: 'طائرة أطفال',
      nameEn: 'Cartoon Airplane',
      keywords: ['طائرة', 'جو', 'airplane', 'plane', 'طيران'],
      url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=400',
      prompt: 'Simple outlines drawing of a toy airplane in the sky, coloring guide'
    },
    {
      nameAr: 'قطة هادئة',
      nameEn: 'Sweet Cat',
      keywords: ['قطة', 'حيوان', 'cat', 'animal', 'هرة'],
      url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
      prompt: 'Sweet outline drawing of a sleeping kitten, coloring page style'
    },
    {
      nameAr: 'فيل ذكي',
      nameEn: 'Friendly Elephant',
      keywords: ['فيل', 'حيوان', 'elephant', 'animal', 'غابة'],
      url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&q=80&w=400',
      prompt: 'Cartoon baby elephant with large ears, coloring page outlines'
    },
    {
      nameAr: 'زرافة طويلة',
      nameEn: 'Tall Giraffe',
      keywords: ['زرافة', 'حيوان', 'giraffe', 'animal', 'طويل'],
      url: 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&q=80&w=400',
      prompt: 'Cute cartoon giraffe vector line art drawing, children coloring sheet'
    },
    {
      nameAr: 'وردة جميلة',
      nameEn: 'Pretty Flower',
      keywords: ['وردة', 'زهرة', 'نبات', 'flower', 'plant', 'جميل'],
      url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=400',
      prompt: 'Simple sweet cartoon sunflower drawing, bold contrast outlines, coloring page'
    }
  ];

  // Synchronize Book-level metadata when the active book changes
  useEffect(() => {
    if (currentBook) {
      setCustomBookName(currentBook.metadata.customBookName || currentBook.metadata.title || '');
      setPlatformName(currentBook.metadata.platformName || '');
      setInstitutionLogoUrl(currentBook.metadata.institutionLogoUrl || '');
      setNurseryLogoUrl(currentBook.metadata.nurseryLogoUrl || '');
      setTargetPages(currentBook.metadata.targetPages || 72);
      
      const size = currentBook.metadata.paperSize || 'A4';
      setPaperSize(size);
      
      if (currentBook.metadata.customDimensions) {
        setPaperWidth(currentBook.metadata.customDimensions.width);
        setPaperHeight(currentBook.metadata.customDimensions.height);
        setPaperUnit(currentBook.metadata.customDimensions.unit);
      } else {
        // Fallback default sizes
        if (size === 'A4') {
          setPaperWidth(21);
          setPaperHeight(29.7);
          setPaperUnit('cm');
        } else if (size === 'A3') {
          setPaperWidth(29.7);
          setPaperHeight(42);
          setPaperUnit('cm');
        } else if (size === 'Letter') {
          setPaperWidth(8.5);
          setPaperHeight(11);
          setPaperUnit('in');
        }
      }
    }
  }, [currentBook]);

  // Handle active page auto-selection
  useEffect(() => {
    if (currentBook && currentBook.pages.length > 0 && !selectedPageId) {
      setSelectedPageId(currentBook.pages[0].id);
    }
  }, [currentBook, selectedPageId]);

  if (!currentBook) return null;

  const activePage = currentBook.pages.find(p => p.id === selectedPageId) || currentBook.pages[0];

  // Sync specific details when active page itself changes
  useEffect(() => {
    if (activePage) {
      setCustomTitle(activePage.title || '');
      setCustomText(activePage.textContent || '');
      setEnableTracing(!!activePage.activity && activePage.activity.type === 'tracing');
      setTracingChar(activePage.activity?.contentData?.character || 'أ');
      
      // Synchronize colors used
      if (activePage.colorsUsed && activePage.colorsUsed.length === 5) {
        setColorsUsed(activePage.colorsUsed);
      } else {
        setColorsUsed(['#e11d48', '#2563eb', '#16a34a', '#ca8a04', '#ea580c']);
      }
    }
  }, [selectedPageId, activePage]);

  // Kids smart outline extractor & dynamic color palette analyzer effect
  useEffect(() => {
    if (!activePage || !activePage.illustrationUrl) {
      setOutlineDataUrl(null);
      return;
    }

    let isMounted = true;
    setIsProcessingOutline(true);

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    
    // Use canvas bypass for standard Unsplash or external assets to avoid CORS issues
    if (activePage.illustrationUrl.startsWith('http') && !activePage.illustrationUrl.includes('localhost')) {
      img.src = `${activePage.illustrationUrl}${activePage.illustrationUrl.includes('?') ? '&' : '?'}cb=${Date.now()}`;
    } else {
      img.src = activePage.illustrationUrl;
    }
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (isMounted) {
            setOutlineDataUrl(activePage.illustrationUrl);
            setIsProcessingOutline(false);
          }
          return;
        }

        const maxDim = 500;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const len = data.length;

        // DYNAMIC COLOR PALETTE ANALYSIS: Extract 5 dominant vibrant colors from the image
        try {
          const colorCounts: { [hex: string]: number } = {};
          for (let i = 0; i < len; i += 32) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            if (a < 128) continue;
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            if (lum > 235 || lum < 20) continue; // Skip near white background or near black stroke lines
            const qr = Math.round(r / 32) * 32;
            const qg = Math.round(g / 32) * 32;
            const qb = Math.round(b / 32) * 32;
            const hex = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb).toString(16).slice(1)}`;
            colorCounts[hex] = (colorCounts[hex] || 0) + 1;
          }
          const sorted = Object.entries(colorCounts)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);

          if (sorted.length >= 2) {
            const defaults = ['#e11d48', '#2563eb', '#16a34a', '#ca8a04', '#ea580c'];
            const extracted = sorted.slice(0, 5);
            while (extracted.length < 5) {
              const fallback = defaults[extracted.length];
              if (!extracted.includes(fallback)) extracted.push(fallback);
              else extracted.push('#' + Math.floor(Math.random() * 16777215).toString(16));
            }
            if (isMounted) {
              setColorsUsed(extracted);
              if (activePage) {
                updatePage(activePage.id, { colorsUsed: extracted });
              }
            }
          }
        } catch (colorErr) {
          console.warn('Color extraction warning:', colorErr);
        }

        if (!useSmartOutline) {
          if (isMounted) {
            setOutlineDataUrl(null);
            setIsProcessingOutline(false);
          }
          return;
        }

        // SMART OUTLINE EXTRACTOR (3-Pass Gaussian + Sobel + Despeckle & Gap Closure)
        // Grayscale conversion
        const gray = new Uint8ClampedArray(w * h);
        for (let i = 0; i < len; i += 4) {
          gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }

        // Pass 1: 3x3 Weighted Gaussian Smoothing (eliminates speckle noise/dots)
        const smoothed = new Uint8ClampedArray(w * h);
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            const sum = 
              gray[(y - 1) * w + (x - 1)] + 2 * gray[(y - 1) * w + x] + gray[(y - 1) * w + (x + 1)] +
              2 * gray[y * w + (x - 1)] + 4 * gray[idx] + 2 * gray[y * w + (x + 1)] +
              gray[(y + 1) * w + (x - 1)] + 2 * gray[(y + 1) * w + x] + gray[(y + 1) * w + (x + 1)];
            smoothed[idx] = sum / 16;
          }
        }

        // Pass 2: Sobel Edge Magnitude Calculation
        const edgeBinary = new Uint8ClampedArray(w * h);
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            const val = smoothed[idx];

            if (val < 75) {
              edgeBinary[idx] = 1; // Pure black stroke
              continue;
            }
            if (val > 215) {
              edgeBinary[idx] = 0; // Pure white background
              continue;
            }

            const gx = 
              -1 * smoothed[(y - 1) * w + (x - 1)] + 1 * smoothed[(y - 1) * w + (x + 1)] +
              -2 * smoothed[y * w + (x - 1)] + 2 * smoothed[y * w + (x + 1)] +
              -1 * smoothed[(y + 1) * w + (x - 1)] + 1 * smoothed[(y + 1) * w + (x + 1)];

            const gy = 
              -1 * smoothed[(y - 1) * w + (x - 1)] - 2 * smoothed[(y - 1) * w + x] - 1 * smoothed[(y - 1) * w + (x + 1)] +
              1 * smoothed[(y + 1) * w + (x - 1)] + 2 * smoothed[(y + 1) * w + x] + 1 * smoothed[(y + 1) * w + (x + 1)];

            const grad = Math.sqrt(gx * gx + gy * gy);
            edgeBinary[idx] = grad > (outlineThreshold * 1.6) ? 1 : 0;
          }
        }

        // Pass 3: Despeckle (Remove isolated dots) + Gap Closure (Seal open lines)
        const output = ctx.createImageData(w, h);
        const outData = output.data;

        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            const val = edgeBinary[idx];

            let neighbors = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                if (edgeBinary[(y + dy) * w + (x + dx)] === 1) neighbors++;
              }
            }

            let isLine = false;
            if (val === 1) {
              isLine = neighbors >= 2; // Removes single isolated dot specks
            } else {
              isLine = neighbors >= 5; // Closes small open gaps
            }

            const color = isLine ? 0 : 255;
            const outIdx = idx * 4;
            outData[outIdx] = color;
            outData[outIdx + 1] = color;
            outData[outIdx + 2] = color;
            outData[outIdx + 3] = 255;
          }
        }

        // Pad borders with white
        for (let x = 0; x < w; x++) {
          const topIdx = x * 4;
          const botIdx = ((h - 1) * w + x) * 4;
          outData[topIdx] = outData[topIdx+1] = outData[topIdx+2] = 255; outData[topIdx+3] = 255;
          outData[botIdx] = outData[botIdx+1] = outData[botIdx+2] = 255; outData[botIdx+3] = 255;
        }
        for (let y = 0; y < h; y++) {
          const leftIdx = y * w * 4;
          const rightIdx = (y * w + w - 1) * 4;
          outData[leftIdx] = outData[leftIdx+1] = outData[leftIdx+2] = 255; outData[leftIdx+3] = 255;
          outData[rightIdx] = outData[rightIdx+1] = outData[rightIdx+2] = 255; outData[rightIdx+3] = 255;
        }

        ctx.putImageData(output, 0, 0);
        
        if (isMounted) {
          setOutlineDataUrl(canvas.toDataURL('image/png'));
          setIsProcessingOutline(false);
        }
      } catch (e) {
        console.warn('Canvas processing failed (likely CORS). Falling back to CSS filters.', e);
        if (isMounted) {
          setOutlineDataUrl(null);
          setIsProcessingOutline(false);
        }
      }
    };

    img.onerror = () => {
      if (isMounted) {
        setOutlineDataUrl(null);
        setIsProcessingOutline(false);
      }
    };

    return () => {
      isMounted = false;
    };
  }, [activePage?.id, activePage?.illustrationUrl, outlineThreshold, useSmartOutline]);

  const handleColorChange = (idx: number, val: string) => {
    const updated = [...colorsUsed];
    updated[idx] = val;
    setColorsUsed(updated);
    if (activePage) {
      updatePage(activePage.id, { colorsUsed: updated });
    }
  };

  const handleApplyPresetPalette = (presetColors: string[]) => {
    setColorsUsed(presetColors);
    if (activePage) {
      updatePage(activePage.id, { colorsUsed: presetColors });
      addNotification('success', isAr ? 'تم تطبيق لوحة الألوان الجاهزة!' : 'Preset color palette applied!');
    }
  };

  // Handle local image file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64Url = event.target?.result as string;
      if (activePage && b64Url) {
        updatePage(activePage.id, {
          illustrationUrl: b64Url,
          layoutType: 'coloring'
        });
        addNotification('success', isAr ? 'تم رفع الصورة وتحديث الصفحة بنجاح!' : 'Your coloring picture was uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyTemplate = (url: string, prompt: string) => {
    if (activePage) {
      updatePage(activePage.id, {
        illustrationUrl: url,
        illustrationPrompt: prompt,
        layoutType: 'coloring'
      });
      addNotification('success', isAr ? 'تم تطبيق القالب بنجاح!' : 'Template applied to page!');
    }
  };

  const handleGenerateAI = async () => {
    if (!activePage || !aiPrompt.trim()) return;
    addNotification('info', isAr ? 'جاري توليد رسمة التلوين بالذكاء الاصطناعي...' : 'Generating coloring page via AI...');
    await generatePageAsset(activePage.id, aiPrompt, 'coloring');
    setAiPrompt('');
  };

  // Save changes to current page
  const handleSaveChanges = () => {
    if (!activePage) return;
    
    const updates: Partial<typeof activePage> = {
      title: customTitle,
      textContent: customText,
      colorsUsed: colorsUsed
    };

    if (enableTracing) {
      updates.activity = {
        id: activePage.activity?.id || `act-${Date.now()}`,
        type: 'tracing',
        instructions: isAr 
          ? `تتبع خطوط الحرف الجميل (${tracingChar}) ثم لونه` 
          : `Trace the outlines of the letter (${tracingChar}) and color it`,
        difficulty: 'easy',
        contentData: { character: tracingChar }
      };
      updates.layoutType = 'tracing';
    } else if (activePage.layoutType === 'tracing') {
      updates.layoutType = 'coloring';
      updates.activity = undefined;
    }

    updatePage(activePage.id, updates);
    addNotification('success', isAr ? 'تم حفظ تعديلات الصفحة بنجاح!' : 'Page updates saved successfully!');
  };

  // Add standard new blank page
  const handleAddPage = () => {
    addBlankPage();
    addNotification('success', isAr ? 'تمت إضافة صفحة جديدة فارغة!' : 'New blank page added!');
    setTimeout(() => {
      if (currentBook.pages.length > 0) {
        setSelectedPageId(currentBook.pages[currentBook.pages.length - 1].id);
      }
    }, 100);
  };

  // Auto-complete to reach target pages limit
  const handleAutoCompletePages = () => {
    const currentCount = currentBook.pages.length;
    if (currentCount >= targetPages) {
      addNotification('warning', isAr ? 'الكتاب يحتوي بالفعل على عدد صفحات مساوٍ أو أكبر من المستهدف!' : 'The book already meets or exceeds the target page count!');
      return;
    }
    
    const needed = targetPages - currentCount;
    addNotification('info', isAr ? `جاري إكمال الكتاب وتوليد ${needed} صفحة للوصول للمستهدف المنهجي (${targetPages} صفحة)...` : `Generating ${needed} pages to reach target count of ${targetPages}...`);
    
    for (let i = 0; i < needed; i++) {
      addBlankPage();
    }
    
    addNotification('success', isAr ? `تمت إضافة ${needed} صفحة بنجاح! الكتاب الآن يحتوي على ${targetPages} صفحة.` : `Added ${needed} pages! The book now has ${targetPages} pages.`);
    
    if (currentBook.pages.length > 0) {
      setSelectedPageId(currentBook.pages[currentBook.pages.length - 1].id);
    }
  };

  // Handle logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'institution' | 'nursery') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (type === 'institution') {
        setInstitutionLogoUrl(result);
      } else {
        setNurseryLogoUrl(result);
      }
      addNotification('success', isAr ? 'تم رفع الشعار بنجاح!' : 'Logo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  // Handle Book Level Settings & Paper Size updates
  const handleSaveBookSettings = () => {
    const dimensions = {
      width: Number(paperWidth),
      height: Number(paperHeight),
      unit: paperUnit as 'in' | 'mm' | 'cm'
    };

    updateBookMetadata({
      customBookName,
      platformName,
      institutionLogoUrl,
      nurseryLogoUrl,
      targetPages: Number(targetPages),
      paperSize,
      customDimensions: dimensions as any
    });

    addNotification('success', isAr ? 'تم حفظ إعدادات الكتاب والمقاسات بنجاح!' : 'Book settings and dimensions saved successfully!');
  };

  const handlePaperSizeChange = (val: 'A4' | 'A3' | 'Letter' | 'Custom') => {
    setPaperSize(val);
    if (val === 'A4') {
      setPaperWidth(21);
      setPaperHeight(29.7);
      setPaperUnit('cm');
    } else if (val === 'A3') {
      setPaperWidth(29.7);
      setPaperHeight(42);
      setPaperUnit('cm');
    } else if (val === 'Letter') {
      setPaperWidth(8.5);
      setPaperHeight(11);
      setPaperUnit('in');
    }
  };

  // Dynamic Image Search Lens from Network & Local curated list
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setWebSearchResults([]);
    }
  };

  const executeImageSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingWeb(true);
    
    // Simulate real web fetching to provide an engaging progress experience
    setTimeout(() => {
      const q = searchQuery.toLowerCase().trim();
      
      // Look up our matching curated gallery items
      const curatedMatches = CURATED_GALLERY.filter(item => 
        item.nameAr.includes(q) || 
        item.nameEn.toLowerCase().includes(q) ||
        item.keywords.some(k => k.includes(q))
      );

      // Generate dynamic high-quality Unsplash children-friendly lineart drawing queries
      const webMatches = [
        {
          name: isAr ? `رسم تلوين: ${searchQuery} (1)` : `Coloring Art: ${searchQuery} (1)`,
          url: `https://images.unsplash.com/featured/400x400/?coloring-book,outline,cartoon,${encodeURIComponent(q)}`,
          prompt: `Kids black and white clean outlines vector coloring page of ${q}, white background`
        },
        {
          name: isAr ? `رسم تلوين: ${searchQuery} (2)` : `Coloring Art: ${searchQuery} (2)`,
          url: `https://images.unsplash.com/featured/400x400/?children,sketch,draw,${encodeURIComponent(q)}`,
          prompt: `Minimalist childrens coloring sheet outline drawing of ${q}, bold contours`
        },
        {
          name: isAr ? `رسم تلوين: ${searchQuery} (3)` : `Coloring Art: ${searchQuery} (3)`,
          url: `https://images.unsplash.com/featured/400x400/?vector,line-art,cartoon,${encodeURIComponent(q)}`,
          prompt: `Simple child coloring book graphic of ${q}, crisp outline sketch`
        }
      ];

      // Merge local matching and generated web results
      const merged = [
        ...curatedMatches.map(c => ({
          name: isAr ? c.nameAr : c.nameEn,
          url: c.url,
          prompt: c.prompt
        })),
        ...webMatches
      ];

      setWebSearchResults(merged);
      setIsSearchingWeb(false);
      addNotification('success', isAr ? `تم جلب ${merged.length} نتائج لـ "${searchQuery}" من الشبكة!` : `Fetched ${merged.length} outline sheets for "${searchQuery}" from the web!`);
    }, 650);
  };

  const handleExportAndPrint = async () => {
    addNotification('info', isAr ? 'جاري إعداد وتحضير ملفات الطباعة عالية الدقة...' : 'Preparing high-resolution print files...');
    await synthesizePrintPackage();
  };

  // Progress Bar percentage
  const totalPagesCount = currentBook.pages.length;
  const progressPercent = Math.min(100, Math.round((totalPagesCount / targetPages) * 100));

  return (
    <div className="space-y-6" id="simple-workspace-view">
      
      {/* Top Banner Alert / Easy Mode explanation */}
      <div className="bg-gradient-to-r from-amber-500/10 via-brand-500/5 to-transparent border border-amber-500/20 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 flex-shrink-0">
            <Palette className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 font-sans flex items-center gap-2">
              {isAr ? 'الوضع السريع والذكي لتصميم كتب التلوين للأطفال' : 'Smart Simple Coloring Book Studio'}
              <span className="px-2 py-0.5 bg-brand-500 text-white rounded-full text-[9px] font-mono tracking-wider font-semibold uppercase">{isAr ? 'سهل ونشط' : 'Easy Mode'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
              {isAr 
                ? 'مرحباً بك! هذا هو مجمع كتب التلوين والأنشطة المبسط. هنا يمكنك إضافة صفحات جديدة، توليد صور تلوين رائعة بالذكاء الاصطناعي بلمسة واحدة، أو رفع صور من جهازك مباشرة، وتصدير الكتاب للطباعة فوراً كملف PDF احترافي.' 
                : 'Welcome! This is the simplified coloring book composer. Add pages, generate child-safe coloring outline sheets using AI, or upload your own pictures from your computer instantly, then export the completed book to print!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setProfessionalMode(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
            title={isAr ? 'تبديل للوضع الاحترافي' : 'Switch to Professional Mode'}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            {isAr ? 'التبديل للوضع المتقدم' : 'Switch to Advanced Mode'}
          </button>
        </div>
      </div>

      {/* Main Studio split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Pages List (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
              {isAr ? 'صفحات وفصول الكتاب:' : 'Book Pages:'} ({totalPagesCount})
            </span>
            <button
              onClick={handleAddPage}
              className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100/80 px-2.5 py-1 rounded transition"
              title={isAr ? 'إضافة صفحة تلوين جديدة' : 'Add new page'}
            >
              <Plus className="w-3.5 h-3.5" />
              {isAr ? 'إضافة صفحة' : 'Add Page'}
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 max-h-[580px] overflow-y-auto pr-1">
            {/* Prominent Add Page Card placed at the top */}
            <button
              onClick={handleAddPage}
              className="w-full py-3.5 px-4 border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-xl flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-100/80 transition shadow-xs group"
            >
              <Plus className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold font-sans">{isAr ? '➕ أضف صفحة جديدة للكتاب' : '➕ Add New Page to Book'}</span>
            </button>

            {currentBook.pages.map((p) => {
              const isActive = activePage?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPageId(p.id)}
                  className={`w-full text-right p-3 border rounded-xl transition flex flex-col md:flex-row items-center gap-3 relative overflow-hidden group ${
                    isActive 
                      ? 'border-brand-500 bg-brand-50/20 shadow-xs ring-1 ring-brand-500' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-12 h-14 bg-slate-50 border border-slate-200 rounded flex-shrink-0 overflow-hidden relative flex items-center justify-center">
                    {p.illustrationUrl ? (
                      <img 
                        src={p.illustrationUrl} 
                        alt={p.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale brightness-125 contrast-125" 
                      />
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-slate-400">{p.pageNumber}</span>
                    )}
                    <span className="absolute bottom-0 right-0 left-0 bg-slate-900/60 text-white font-mono text-[8px] text-center">
                      {p.pageNumber}
                    </span>
                  </div>
                  <div className="text-right flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">
                      {p.title || (isAr ? 'صفحة غير معنونة' : 'Untitled Page')}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-sans truncate mt-0.5 leading-none">
                      {p.layoutType === 'tracing' ? (isAr ? '✍️ تتبع ولون' : '✍️ Trace & Color') : (isAr ? '🎨 رسمة تلوين' : '🎨 Coloring Page')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Column: Interactive Page Sheet Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
              {isAr ? 'استعراض صفحة الرسم المباشرة:' : 'Live Sheet Preview:'}
            </span>
            {activePage && (
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {isAr ? `الصفحة رقم ${activePage.pageNumber}` : `Page ${activePage.pageNumber}`}
              </span>
            )}
          </div>

          {activePage ? (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative shadow-2xl flex flex-col items-center justify-center">
              
              {/* Paper bounding container styled with standard cropping rulers */}
              <div 
                className="bg-white rounded-lg shadow-2xl relative overflow-hidden transition-all duration-300 border-4 border-white aspect-[3/4] w-full max-w-[350px]"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
              >
                {/* Safe margin zone dashed bounding box */}
                <div className="absolute inset-4 border border-dashed border-rose-300/30 pointer-events-none flex items-center justify-center">
                  <span className="absolute top-1 left-2 text-[8px] font-mono text-rose-300/40 select-none">حدود الأمان (Safe Zone)</span>
                </div>

                {/* Bleed line guide */}
                <div className="absolute inset-2 border border-dashed border-cyan-400/20 pointer-events-none">
                  <span className="absolute bottom-1 right-2 text-[8px] font-mono text-cyan-400/30 select-none">هامش القص (Bleed Limits)</span>
                </div>

                {/* Real-time Fixed Header (اسم الكتاب) */}
                <div className="absolute top-4 left-6 right-6 flex items-center justify-between border-b border-slate-100 pb-1.5 text-[10px] font-bold text-slate-400 select-none" dir="rtl">
                  <span>📖 {customBookName || (isAr ? 'كتاب التلوين التعليمي' : 'Coloring Workbook')}</span>
                  <span className="font-mono text-[9px]">A4</span>
                </div>

                {/* Real-time Fixed Footer (اسم المنصة) */}
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[9px] font-bold text-slate-400 select-none" dir="rtl">
                  <span>🌟 {platformName || (isAr ? 'منصة التعليم والنشاط' : 'Smart Kids Platform')}</span>
                  <span className="font-mono text-xs">{activePage.pageNumber}</span>
                </div>

                {/* Sheet Content container */}
                <div className="px-6 pt-11 pb-11 h-full flex flex-col justify-between select-none text-right" dir={isRtl ? 'rtl' : 'ltr'}>
                  
                  {/* Top Page Header / Instruction */}
                  <div className="mt-2">
                    <h3 className="text-sm font-display font-extrabold text-slate-900 tracking-tight leading-none mb-1">
                      {activePage.title || (isAr ? 'عنوان الصفحة' : 'Page Title')}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                      {activePage.textContent || (isAr ? 'تعليمات للأطفال أو حكمة مفيدة...' : 'Syllabus instruction or caption...')}
                    </p>
                  </div>

                  {/* Dual Image Illustration Concept */}
                  <div className="flex-1 my-3 bg-slate-50 rounded-xl border border-slate-200/80 overflow-hidden relative flex items-center justify-center">
                    {activePage.illustrationUrl ? (
                      <div className="w-full h-full relative">
                        {isProcessingOutline ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-10">
                            <RefreshCw className="w-6 h-6 text-brand-500 animate-spin mb-1" />
                            <span className="text-[9px] text-slate-400 font-bold">{isAr ? 'جاري استخلاص خطوط الرسم...' : 'Extracting outlines...'}</span>
                          </div>
                        ) : null}

                        {/* 1. Large Copy: Clean Black & White outline drawing for coloring */}
                        <img 
                          src={outlineDataUrl || activePage.illustrationUrl} 
                          alt="Coloring outline" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain mix-blend-multiply"
                          style={!outlineDataUrl ? { filter: 'grayscale(100%) contrast(1000%) brightness(130%)' } : {}}
                        />

                        {/* 2. Small Copy: Floating original colored preview to assist color choice */}
                        <div className="absolute top-2 right-2 w-14 h-18 bg-white border-2 border-brand-500 rounded-lg shadow-lg overflow-hidden flex flex-col items-center z-20 animate-fade-in">
                          <div className="bg-brand-500 text-white text-[7px] font-sans font-bold w-full text-center py-0.5 leading-none select-none">
                            {isAr ? 'دليل الألوان' : 'Color Guide'}
                          </div>
                          <img 
                            src={activePage.illustrationUrl} 
                            alt="Original colored reference" 
                            referrerPolicy="no-referrer"
                            className="w-full h-12 object-cover" 
                          />
                        </div>

                        {/* Visual Grayscale Sketch Enhancer Filter Overlay */}
                        <div className="absolute inset-0 pointer-events-none border border-slate-200/30 rounded-xl" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center p-4 text-center space-y-2">
                        <Palette className="w-10 h-10 text-slate-300 mb-1 animate-pulse" />
                        <span className="text-xs text-slate-600 font-bold">{isAr ? 'الصفحة فارغة حالياً' : 'Empty Coloring Sheet'}</span>
                        <p className="text-[10px] text-slate-400 leading-normal max-w-[200px]">
                          {isAr ? 'اختر قالباً، أو ابحث في الويب، أو ولد رسمة بالذكاء الاصطناعي، أو ارفع صورة' : 'Select a preset, search web, generate via AI, or upload an image.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Optional Dash Alphabet Tracing Guides */}
                  {activePage.activity && activePage.activity.type === 'tracing' && (
                    <div className="p-3 bg-brand-50/20 border-2 border-dashed border-brand-300 rounded-xl text-center my-2 select-none">
                      <span className="text-[10px] font-mono font-extrabold text-brand-600 block mb-1 uppercase tracking-wider">
                        {isAr ? '✍️ مستشار تتبع خطوط الحروف (حجم كبير للتلوين والتتبع)' : '✍️ Large Practice Tracing Character'}
                      </span>
                      <div className="h-16 md:h-20 border-2 border-dashed border-slate-300 rounded-xl bg-white flex items-center justify-center gap-6 px-4">
                        <span className="text-4xl md:text-5xl font-display font-black text-slate-400 tracking-[0.2em] line-through select-none">
                          {activePage.activity.contentData?.character || 'أ'}
                        </span>
                        <span className="text-4xl md:text-5xl font-display font-black text-slate-300/60 tracking-[0.2em] line-through select-none">
                          {activePage.activity.contentData?.character || 'أ'}
                        </span>
                        <span className="text-4xl md:text-5xl font-display font-black text-slate-300/30 tracking-[0.2em] line-through select-none">
                          {activePage.activity.contentData?.character || 'أ'}
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Float delete page button */}
              <button
                onClick={() => deletePage(activePage.id)}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl shadow-lg transition-all hover:scale-105"
                title={isAr ? 'حذف هذه الصفحة نهائياً' : 'Delete Page'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-20 rounded-2xl text-center text-slate-500">
              {isAr ? 'يرجى تحديد أو إنشاء صفحة للبدء' : 'Please select or create a page to begin.'}
            </div>
          )}
        </div>

        {/* Right Column: Intelligent Dual Panel Control (4 cols) */}
        <div className="lg:col-span-4 space-y-6 text-right">
          
          {/* Quick Export Button */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center space-y-3 shadow-xl">
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              {isAr ? 'إصدار وتجهيز الكتاب المكتمل:' : 'Compile Finished Book:'}
            </h4>
            <button
              onClick={handleExportAndPrint}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-bold text-xs rounded-xl shadow-xl hover:shadow-emerald-500/10 hover:scale-[1.02] transition-all"
              title={isAr ? 'طباعة وتنزيل الكتاب بصيغة PDF احترافي' : 'Print & Download PDF Coloring Book'}
            >
              <Printer className="w-4 h-4" />
              {isAr ? '🖨️ طباعة وتنزيل كـ ملف PDF جاهز' : '🖨️ Print & Download (PDF)'}
            </button>
          </div>

          {/* Config Panel Tab switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveConfigTab('page')}
              className={`flex-1 py-2 text-xs font-bold font-sans rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeConfigTab === 'page'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              {isAr ? 'خصائص الصفحة' : 'Page Config'}
            </button>
            <button
              onClick={() => setActiveConfigTab('book')}
              className={`flex-1 py-2 text-xs font-bold font-sans rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeConfigTab === 'book'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              {isAr ? 'إعدادات الكتاب والمنهج' : 'Book Settings'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeConfigTab === 'page' ? (
              <motion.div
                key="page-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                {activePage ? (
                  <>
                    {/* Image Source Selection with Search lens */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
                      <h4 className="text-xs uppercase font-mono font-bold text-slate-500 tracking-wider flex items-center justify-end gap-1.5 border-b border-slate-100 pb-2.5">
                        {isAr ? 'إضافة صورة التلوين للصفحة' : 'Page Drawing / Image Source'}
                        <ImageIcon className="w-4 h-4 text-brand-500" />
                      </h4>

                      {/* File Upload Trigger */}
                      <div className="space-y-2">
                        <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                          {isAr ? 'الخيار الأول: ارفع صورة تلوين من جهازك مباشرة:' : 'Option 1: Upload a local picture file:'}
                        </span>
                        
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-xl bg-slate-50/50 hover:bg-brand-50/10 text-slate-600 hover:text-brand-600 font-bold text-xs flex items-center justify-center gap-2 transition"
                        >
                          <Upload className="w-4 h-4" />
                          {isAr ? 'اختر صورة من الكمبيوتر للرفع 📁' : 'Choose Picture File from Computer 📁'}
                        </button>
                      </div>

                      {/* AI Outline Generator Box */}
                      <div className="space-y-2 pt-1 border-t border-slate-100">
                        <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mt-2">
                          {isAr ? 'الخيار الثاني: توليد رسمة تلوين ذكية بالذكاء الاصطناعي:' : 'Option 2: Generate coloring outline via AI:'}
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder={isAr ? 'مثال: أسد يلعب كرة القدم، رسم كرتوني بسيط...' : 'E.g. cute lion playing football, simple outline style...'}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:outline-hidden"
                          />
                          <button
                            onClick={handleGenerateAI}
                            disabled={isAiGenerating || !aiPrompt.trim()}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            {isAr ? 'توليد' : 'Create'}
                          </button>
                        </div>
                      </div>

                      {/* Searchable Web Gallery Section (عدسة بحث مطورة + بنترست) */}
                      <div className="space-y-3 pt-1 border-t border-slate-100">
                        <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mt-2">
                          {isAr ? 'الخيار الثالث: ابحث واجلب أي صورة من الويب والشبكة:' : 'Option 3: Search and bring any illustration from the web:'}
                        </span>
                        
                        {/* Search Input Box with Lens icon */}
                        <form onSubmit={executeImageSearch} className="flex gap-1.5 relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder={isAr ? 'اكتب كلمة للبحث (مثال: أرنب، سيارة، فضاء)...' : 'Search coloring (e.g. rabbit, car, space)...'}
                            className="flex-1 pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:outline-hidden text-right"
                          />
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <button
                            type="submit"
                            disabled={isSearchingWeb || !searchQuery.trim()}
                            className="px-3 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-lg transition flex items-center gap-1"
                          >
                            {isSearchingWeb ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                            {isAr ? 'بحث' : 'Search'}
                          </button>
                        </form>

                        {/* Pinterest Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const q = searchQuery.trim() || 'رسومات تلوين أطفال';
                            window.open(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q + ' coloring page')}`, '_blank');
                          }}
                          className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <span>📌 {isAr ? `فتح Pinterest وإكمال البحث عن "${searchQuery || 'تلوين'}"` : 'Open & Search on Pinterest'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        {/* Direct URL paste from Pinterest */}
                        <div className="flex gap-1.5 pt-1">
                          <input
                            type="url"
                            value={directImageUrl}
                            onChange={(e) => setDirectImageUrl(e.target.value)}
                            placeholder={isAr ? 'أو الصق رابط صورة مباشرة من بنترست/الويب...' : 'Or paste direct image URL from Pinterest...'}
                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] bg-slate-50/50 text-right"
                          />
                          <button
                            type="button"
                            onClick={handleApplyDirectUrl}
                            disabled={!directImageUrl.trim()}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 text-white text-xs font-bold rounded-lg transition"
                          >
                            {isAr ? 'إضافة' : 'Add'}
                          </button>
                        </div>

                        {/* Search results list / Curated defaults */}
                        <div className="max-h-40 overflow-y-auto pt-1.5 pr-0.5 space-y-1">
                          {webSearchResults.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                              {webSearchResults.map((tmpl, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleApplyTemplate(tmpl.url, tmpl.prompt)}
                                  className="border border-slate-200 hover:border-brand-500 p-1 rounded-xl overflow-hidden bg-slate-50 relative group transition"
                                  title={tmpl.name}
                                >
                                  <img 
                                    src={tmpl.url} 
                                    alt={tmpl.name} 
                                    referrerPolicy="no-referrer"
                                    className="w-full h-11 object-cover rounded-lg group-hover:scale-105 transition" 
                                  />
                                  <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[8px] text-center py-0.5 truncate font-sans">
                                    {tmpl.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : searchQuery.trim() ? (
                            <p className="text-[10px] text-slate-400 text-center py-4">
                              {isAr ? 'اضغط على زر "بحث" للجلب أو أعد فتح Pinterest بالزر الأحمر...' : 'Click Search or use the Pinterest button above...'}
                            </p>
                          ) : (
                            // Default gallery list (6 templates)
                            <div className="grid grid-cols-3 gap-2">
                              {CURATED_GALLERY.slice(0, 6).map((tmpl, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleApplyTemplate(tmpl.url, tmpl.prompt)}
                                  className="border border-slate-200 hover:border-brand-500 p-1 rounded-xl overflow-hidden bg-slate-50 relative group transition"
                                  title={isAr ? tmpl.nameAr : tmpl.nameEn}
                                >
                                  <img 
                                    src={tmpl.url} 
                                    alt={isAr ? tmpl.nameAr : tmpl.nameEn} 
                                    referrerPolicy="no-referrer"
                                    className="w-full h-11 object-cover rounded-lg group-hover:scale-105 transition" 
                                  />
                                  <span className="absolute bottom-0 inset-x-0 bg-slate-900/60 text-white text-[8px] text-center py-0.5 truncate font-sans">
                                    {isAr ? tmpl.nameAr : tmpl.nameEn}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Kids Smart Outline Extractor Controls */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
                      <h4 className="text-xs uppercase font-mono font-bold text-slate-500 tracking-wider flex items-center justify-end gap-1.5 border-b border-slate-100 pb-2.5">
                        {isAr ? 'منقّي خطوط التلوين الذكي' : 'Kids Smart Outline Extractor'}
                        <Wand2 className="w-4 h-4 text-brand-500" />
                      </h4>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-sans text-slate-600 font-semibold">
                          {isAr ? 'تفعيل منقّي الخطوط التلقائي للطفل:' : 'Enable kids outline extractor:'}
                        </span>
                        <input
                          type="checkbox"
                          checked={useSmartOutline}
                          onChange={(e) => setUseSmartOutline(e.target.checked)}
                          className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                        />
                      </div>

                      {useSmartOutline && (
                        <div className="space-y-2 pt-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span className="font-mono text-xs">{outlineThreshold}</span>
                            <span>{isAr ? 'حساسية سماكة خطوط التلوين:' : 'Outline sensitivity:'}</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="100"
                            value={outlineThreshold}
                            onChange={(e) => setOutlineThreshold(Number(e.target.value))}
                            className="w-full accent-brand-500"
                          />
                          <p className="text-[9px] text-slate-400 text-right leading-normal">
                            {isAr 
                              ? '💡 اسحب للتحكم في وضوح وسماكة الخطوط؛ القيمة الأقل تزيد من إبراز أدق تفاصيل الرسمة.' 
                              : '💡 Drag to control outline thickness; lower values reveal more detailed drawing contours.'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Title & Instructions text edits */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
                      <h4 className="text-xs uppercase font-mono font-bold text-slate-500 tracking-wider flex items-center justify-end gap-1.5 border-b border-slate-100 pb-2.5">
                        {isAr ? 'الكتابة وتنسيق النصوص' : 'Page Titles & Typography'}
                        <Type className="w-4 h-4 text-brand-500" />
                      </h4>

                      {/* Page Title */}
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                          {isAr ? 'عنوان الصفحة (مثال: الأسد الشجاع):' : 'Page Heading / Label:'}
                        </label>
                        <input
                          type="text"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          placeholder={isAr ? 'أدخل اسماً للصفحة...' : 'E.g. Brave Little Lion...'}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:outline-hidden text-right"
                        />
                      </div>

                      {/* Text Content */}
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                          {isAr ? 'النص التوجيهي أو الحكمة المصاحبة للطفل:' : 'Syllabus Story / Instruction Text:'}
                        </label>
                        <textarea
                          rows={2}
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          placeholder={isAr ? 'مثال: حرف الألف يرمز لملك الغابة...' : 'Explain the drawing details...'}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:outline-hidden resize-none leading-relaxed text-right"
                        />
                      </div>
                    </div>

                    {/* Tracing Activity Guide */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
                      <h4 className="text-xs uppercase font-mono font-bold text-slate-500 tracking-wider flex items-center justify-end gap-1.5 border-b border-slate-100 pb-2.5">
                        {isAr ? 'مستشار تتبع خطوط الحروف' : 'Alphabet Letter Tracing Practice'}
                        <PenTool className="w-4 h-4 text-brand-500" />
                      </h4>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-sans text-slate-600 font-semibold">
                          {isAr ? 'تفعيل خطوط تتبع الحروف للأطفال بالصفحة:' : 'Enable tracing lines on this page:'}
                        </span>
                        <input
                          type="checkbox"
                          checked={enableTracing}
                          onChange={(e) => setEnableTracing(e.target.checked)}
                          className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                        />
                      </div>

                      {enableTracing && (
                        <div className="space-y-3 pt-1">
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                              {isAr ? 'الحرف أو الكلمة المراد تتبعها (مثال: أ أو ب أو ج):' : 'Letter or word to trace:'}
                            </label>
                            <input
                              type="text"
                              value={tracingChar}
                              onChange={(e) => setTracingChar(e.target.value)}
                              placeholder={isAr ? 'أدخل حرفاً أو كلمة...' : 'E.g. A, B, C...'}
                              maxLength={15}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:outline-hidden text-center font-bold font-display"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Save All Changes */}
                    <button
                      onClick={handleSaveChanges}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:scale-[1.01]"
                    >
                      {isAr ? '💾 حفظ التعديلات وتحديث الصفحة' : '💾 Save Changes & Update Page'}
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                    {isAr ? 'حدد صفحة من اليسار لتعديلها' : 'Select a page to configure properties.'}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="book-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                {/* 1. Target Page Count controls & Progress */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
                  <h4 className="text-xs uppercase font-mono font-bold text-slate-500 tracking-wider flex items-center justify-end gap-1.5 border-b border-slate-100 pb-2.5">
                    {isAr ? 'التحكم في عدد صفحات المنهج' : 'Curriculum Page Target'}
                    <BookOpen className="w-4 h-4 text-brand-500" />
                  </h4>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                      {isAr ? 'عدد صفحات الكتاب المستهدف:' : 'Target Page Count:'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={300}
                      value={targetPages}
                      onChange={(e) => setTargetPages(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:outline-hidden text-center font-bold"
                    />
                  </div>

                  {/* Progress Indicators */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">{progressPercent}%</span>
                      <span className="text-slate-400 font-sans">
                        {isAr ? `المستوى الحالي: ${totalPagesCount} / ${targetPages} صفحة` : `Status: ${totalPagesCount} of ${targetPages} pages`}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {totalPagesCount < targetPages ? (
                      <div className="pt-2 space-y-2 text-right">
                        <div className="flex items-start gap-1.5 text-[10px] text-amber-600 leading-snug">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <span>
                            {isAr 
                              ? `تنبيه المنهج: عدد الصفحات الحالي أقل من المستهدف بـ (${targetPages - totalPagesCount}) صفحة.` 
                              : `Curriculum Notice: You are (${targetPages - totalPagesCount}) pages short of your goal.`}
                          </span>
                        </div>

                        {/* Bulk Auto-fill action */}
                        <button
                          type="button"
                          onClick={handleAutoCompletePages}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3 h-3" />
                          {isAr ? `⚡ إكمال الصفحات المتبقية تلقائياً (${targetPages - totalPagesCount})` : `⚡ Auto-Generate Remaining Pages (${targetPages - totalPagesCount})`}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold justify-end">
                        <Check className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تم الوصول لمستهدف المنهج بالكامل!' : 'Curriculum target fully met!'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Fixed Headers and Footers config (اسم الكتاب واسم المنصة) */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
                  <h4 className="text-xs uppercase font-mono font-bold text-slate-500 tracking-wider flex items-center justify-end gap-1.5 border-b border-slate-100 pb-2.5">
                    {isAr ? 'ترويسة وتذييل الصفحات الثابتة' : 'Fixed Header & Footer Info'}
                    <Type className="w-4 h-4 text-brand-500" />
                  </h4>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                      {isAr ? 'اسم الكتاب (ثابت في الترويسة العلوية لكل صفحة):' : 'Book Name (Header):'}
                    </label>
                    <input
                      type="text"
                      value={customBookName}
                      onChange={(e) => setCustomBookName(e.target.value)}
                      placeholder={isAr ? 'مثال: كتاب الحروف والأنشطة' : 'Workbook name...'}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:outline-hidden text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
                      {isAr ? 'اسم المنصة (ثابت في التذييل السفلي لكل صفحة):' : 'Platform Name (Footer):'}
                    </label>
                    <input
                      type="text"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      placeholder={isAr ? 'مثال: منصة أقرأ التعليمية' : 'Platform name...'}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:outline-hidden text-right"
                    />
                  </div>

                  {/* 🖼️ Logos Upload Section */}
                  <div className="border-t border-slate-100 pt-3 space-y-4">
                    {/* Nursery / School Logo */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                        {isAr ? '🏫 شعار الروضة / الحضانة (يظهر أعلى منتصف الصفحة):' : '🏫 Nursery / School Logo (Top Center):'}
                      </label>
                      <div className="flex items-center gap-2">
                        {nurseryLogoUrl && (
                          <div className="w-10 h-10 border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center flex-shrink-0">
                            <img src={nurseryLogoUrl} alt="Nursery Logo" className="max-w-full max-h-full object-contain" />
                          </div>
                        )}
                        <input
                          type="text"
                          value={nurseryLogoUrl}
                          onChange={(e) => setNurseryLogoUrl(e.target.value)}
                          placeholder={isAr ? 'رابط شعار الحضانة مصفوفاً...' : 'Nursery logo URL...'}
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:outline-hidden text-right"
                        />
                        <button
                          type="button"
                          onClick={() => nurseryLogoInputRef.current?.click()}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {isAr ? 'رفع' : 'Upload'}
                        </button>
                        <input
                          ref={nurseryLogoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLogoUpload(e, 'nursery')}
                        />
                      </div>
                    </div>

                    {/* Institution / Publisher Logo */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                        {isAr ? '🏛️ شعار المؤسسة / الناشر (يظهر أسفل كل صفحة - أقسى 2 سم):' : '🏛️ Institution Logo (Footer - max 2cm):'}
                      </label>
                      <div className="flex items-center gap-2">
                        {institutionLogoUrl && (
                          <div className="w-10 h-10 border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center flex-shrink-0">
                            <img src={institutionLogoUrl} alt="Institution Logo" className="max-w-full max-h-full object-contain" />
                          </div>
                        )}
                        <input
                          type="text"
                          value={institutionLogoUrl}
                          onChange={(e) => setInstitutionLogoUrl(e.target.value)}
                          placeholder={isAr ? 'رابط شعار المؤسسة...' : 'Institution logo URL...'}
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:outline-hidden text-right"
                        />
                        <button
                          type="button"
                          onClick={() => instLogoInputRef.current?.click()}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {isAr ? 'رفع' : 'Upload'}
                        </button>
                        <input
                          ref={instLogoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLogoUpload(e, 'institution')}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Paper Size Select and Dimension Controls */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
                  <h4 className="text-xs uppercase font-mono font-bold text-slate-500 tracking-wider flex items-center justify-end gap-1.5 border-b border-slate-100 pb-2.5">
                    {isAr ? 'التحكم في مقاسات الورق' : 'Paper Dimension Suite'}
                    <Scissors className="w-4 h-4 text-brand-500" />
                  </h4>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                      {isAr ? 'مقاس الورقة المطلوب:' : 'Paper Size Preset:'}
                    </label>
                    <select
                      value={paperSize}
                      onChange={(e) => handlePaperSizeChange(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:outline-hidden text-right font-bold"
                    >
                      <option value="A4">{isAr ? 'A4 (21 x 29.7 سم)' : 'A4 (21 x 29.7 cm)'}</option>
                      <option value="A3">{isAr ? 'A3 (29.7 x 42 سم)' : 'A3 (29.7 x 42 cm)'}</option>
                      <option value="Letter">{isAr ? 'Letter (8.5 x 11 بوصة)' : 'Letter (8.5 x 11 in)'}</option>
                      <option value="Custom">{isAr ? 'مقاس مخصص...' : 'Custom Dimensions...'}</option>
                    </select>
                  </div>

                  {/* If Custom Size is selected, show inputs */}
                  {paperSize === 'Custom' && (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-3">
                      <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider text-right">
                        {isAr ? 'خصائص ومقاسات الورق الخاصة:' : 'Custom Sheet Parameters:'}
                      </span>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[9px] font-mono text-slate-400 font-semibold mb-1">
                            {isAr ? 'الارتفاع:' : 'Height:'}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={paperHeight}
                            onChange={(e) => setPaperHeight(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-bold text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-400 font-semibold mb-1">
                            {isAr ? 'العرض:' : 'Width:'}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={paperWidth}
                            onChange={(e) => setPaperWidth(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-bold text-center"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-slate-400 font-semibold mb-1">
                          {isAr ? 'وحدة القياس:' : 'Dimension Unit:'}
                        </label>
                        <select
                          value={paperUnit}
                          onChange={(e) => setPaperUnit(e.target.value as any)}
                          className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded-lg text-xs text-right"
                        >
                          <option value="cm">{isAr ? 'سنتيمتر (سم)' : 'Centimeters (cm)'}</option>
                          <option value="in">{isAr ? 'بوصة (بوصة)' : 'Inches (in)'}</option>
                          <option value="mm">{isAr ? 'مليمتر (مم)' : 'Millimeters (mm)'}</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Save All Book Level Configurations */}
                <button
                  onClick={handleSaveBookSettings}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:scale-[1.01]"
                >
                  {isAr ? '💾 حفظ المقاسات وإعدادات المنهج' : '💾 Save Print & Curriculum Settings'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
