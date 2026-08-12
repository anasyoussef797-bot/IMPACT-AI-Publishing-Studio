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
  RefreshCw, Scissors, Settings, ExternalLink, FileUp, Move, ZoomIn, ZoomOut, Sliders, Maximize2, Layers, X,
  EyeOff, Eraser, ShieldAlert, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PdfImportModal from './PdfImportModal';
import { Page, PageImageItem } from '../types';
import { ActivityWorksheetView } from './ActivityWorksheetView';
import { ActivityWorksheetEditor } from './ActivityWorksheetEditor';
import { TextPageEditor } from './TextPageEditor';
import { ImageCropAndRemoveBgModal } from './ImageCropAndRemoveBgModal';
import RedactionOverlayLayer from './RedactionOverlayLayer';

export default function SimpleWorkspaceView() {
  const { t, isRtl, uiLanguage } = useTranslation();
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const { 
    currentBook, 
    addBlankPage,
    addTextPage,
    addActivityPage, 
    updatePage, 
    deletePage, 
    generatePageAsset, 
    isAiGenerating, 
    aiStatusMessage,
    synthesizePrintPackage,
    addNotification,
    setProfessionalMode,
    updateBookMetadata,
    applyRedactionToAllPages
  } = usePublishingStore();

  // Selected Page State
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  
  // Auto sync redactions state
  const [autoSyncRedactions, setAutoSyncRedactions] = useState(false);
  
  // Tabs State (page customization vs book/print settings)
  const [activeConfigTab, setActiveConfigTab] = useState<'page' | 'book'>('page');

  // Page Customization States
  const [aiPrompt, setAiPrompt] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customText, setCustomText] = useState('');
  const [tracingChar, setTracingChar] = useState('أ');
  const [enableTracing, setEnableTracing] = useState(false);

  // Full Color & Custom Page Layout Controls
  const [imageScale, setImageScale] = useState(100);
  const [imageScaleX, setImageScaleX] = useState(100);
  const [imageScaleY, setImageScaleY] = useState(100);
  const [imageOffsetY, setImageOffsetY] = useState(0);
  const [imageOffsetX, setImageOffsetX] = useState(0);
  const [imageOpacity, setImageOpacity] = useState(100);
  
  // Interactive Mouse Dragging & Freeform Stretch/Compress States on Canvas
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });
  const [isResizingImage, setIsResizingImage] = useState(false);
  const [stretchDirection, setStretchDirection] = useState<'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se' | 'both' | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartScale, setResizeStartScale] = useState(100);
  const [resizeStartScaleX, setResizeStartScaleX] = useState(100);
  const [resizeStartScaleY, setResizeStartScaleY] = useState(100);
  const [isImageHovered, setIsImageHovered] = useState(false);

  // Pre-Insert & On-Page Image Crop & Remove BG Modal State
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');

  // Top Page Margin Control (0cm, 1.5cm, 3cm, 5cm)
  const [topMargin, setTopMargin] = useState<'0cm' | '1.5cm' | '3cm' | '5cm'>('3cm');
  
  // Title Typography Controls
  const [titleSize, setTitleSize] = useState(22);
  const [titleColor, setTitleColor] = useState('#0f172a');
  const [titlePosition, setTitlePosition] = useState<'top' | 'middle' | 'bottom' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>('top');
  const [titleBgCard, setTitleBgCard] = useState(false);
  
  // Body/Story Typography Controls
  const [textSize, setTextSize] = useState(14);
  const [textColor, setTextColor] = useState('#334155');
  const [textPosition, setTextPosition] = useState<'top' | 'middle' | 'bottom' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>('top');
  const [textBgCard, setTextBgCard] = useState(false);
  
  // Custom Extra Text Block Controls
  const [extraText, setExtraText] = useState('');
  const [extraTextSize, setExtraTextSize] = useState(14);
  const [extraTextColor, setExtraTextColor] = useState('#2563eb');
  const [extraTextPosition, setExtraTextPosition] = useState<'top' | 'middle' | 'bottom' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>('bottom');
  const [extraTextBgCard, setExtraTextBgCard] = useState(false);

  // Typography Controls Sub-Tab
  const [textControlSubTab, setTextControlSubTab] = useState<'title' | 'story' | 'extra'>('title');
  
  // Redaction / Shading Tool States
  const [isRedactionToolActive, setIsRedactionToolActive] = useState(false);
  const [activeRedactionColor, setActiveRedactionColor] = useState('#ffffff');

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

  // Multi-Image & Selected Image State
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [activeDragImgId, setActiveDragImgId] = useState<string | null>(null);
  const [activeResizeImgId, setActiveResizeImgId] = useState<string | null>(null);

  // Helper to get array of images on active page
  const getPageImages = (page: Page | null | undefined): PageImageItem[] => {
    if (!page) return [];
    if (page.pageImages && page.pageImages.length > 0) {
      return page.pageImages;
    }
    if (page.illustrationUrl) {
      return [{
        id: 'default_img',
        url: page.illustrationUrl,
        scale: page.imageScale || 100,
        scaleX: page.imageScaleX || 100,
        scaleY: page.imageScaleY || 100,
        offsetX: page.imageOffsetX || 0,
        offsetY: page.imageOffsetY || 0,
      }];
    }
    return [];
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAr = uiLanguage === 'ar';

  // Kids smart outline & color palette states
  const [outlineDataUrl, setOutlineDataUrl] = useState<string | null>(null);
  const [isProcessingOutline, setIsProcessingOutline] = useState(false);
  const [outlineThreshold, setOutlineThreshold] = useState(40);
  const [useSmartOutline, setUseSmartOutline] = useState(true);
  
  // Color guide & page frame options
  const [showColorGuide, setShowColorGuide] = useState<boolean>(true);
  const [colorGuideSize, setColorGuideSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [colorGuidePosition, setColorGuidePosition] = useState<'top-right' | 'top-left'>('top-right');
  const [showPageFrame, setShowPageFrame] = useState<boolean>(false);
  
  // Current active page's custom kid colors (default to standard crayon colors)
  const [colorsUsed, setColorsUsed] = useState<string[]>(['#e11d48', '#2563eb', '#16a34a', '#ca8a04', '#ea580c']);

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
  const isFullColorMode = currentBook.metadata.designMode === 'fullcolor';

  // Sync specific details when active page itself changes
  useEffect(() => {
    if (activePage) {
      setCustomTitle(activePage.title || '');
      setCustomText(activePage.textContent || '');
      setEnableTracing(!!activePage.activity && activePage.activity.type === 'tracing');
      setTracingChar(activePage.activity?.contentData?.character || 'أ');
      setImageScale(activePage.imageScale || 100);
      setImageScaleX(activePage.imageScaleX || 100);
      setImageScaleY(activePage.imageScaleY || 100);
      setImageOffsetY(activePage.imageOffsetY || 0);
      setImageOffsetX(activePage.imageOffsetX || 0);
      setImageOpacity(activePage.imageOpacity || 100);
      setTopMargin((activePage.topMargin as any) || '3cm');
      
      setTitleSize(activePage.titleSize || 22);
      setTitleColor(activePage.titleColor || '#0f172a');
      setTitlePosition(activePage.titlePosition || 'top');
      setTitleBgCard(activePage.titleBgCard || false);
      setTextSize(activePage.textSize || 14);
      setTextColor(activePage.textColor || '#334155');
      setTextPosition(activePage.textPosition || 'top');
      setTextBgCard(activePage.textBgCard || false);
      
      setExtraText(activePage.extraText || '');
      setExtraTextSize(activePage.extraTextSize || 14);
      setExtraTextColor(activePage.extraTextColor || '#2563eb');
      setExtraTextPosition(activePage.extraTextPosition || 'bottom');
      setExtraTextBgCard(activePage.extraTextBgCard || false);
      
      setOutlineThreshold(activePage.outlineThreshold ?? 40);
      setShowColorGuide(activePage.showColorGuide ?? true);
      setColorGuideSize(activePage.colorGuideSize ?? 'medium');
      setColorGuidePosition(activePage.colorGuidePosition ?? 'top-right');
      setShowPageFrame(activePage.showPageFrame ?? false);
      
      // Synchronize colors used
      if (activePage.colorsUsed && activePage.colorsUsed.length === 5) {
        setColorsUsed(activePage.colorsUsed);
      } else {
        setColorsUsed(['#e11d48', '#2563eb', '#16a34a', '#ca8a04', '#ea580c']);
      }
    }
  }, [selectedPageId, activePage]);

  // Window mouse listener for interactive canvas image dragging & freeform stretching
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activePage) return;

      if (isDraggingImage && activeDragImgId) {
        const dx = e.clientX - dragStartPos.x;
        const dy = e.clientY - dragStartPos.y;
        const newX = dragStartOffset.x + dx;
        const newY = dragStartOffset.y + dy;
        
        const currentImages = getPageImages(activePage);
        const updated = currentImages.map(img => 
          img.id === activeDragImgId ? { ...img, offsetX: newX, offsetY: newY } : img
        );
        updatePage(activePage.id, { pageImages: updated });
        setImageOffsetX(newX);
        setImageOffsetY(newY);
      } else if (isResizingImage && activeResizeImgId) {
        const dx = e.clientX - resizeStartPos.x;
        const dy = e.clientY - resizeStartPos.y;

        let newScaleX = resizeStartScaleX;
        let newScaleY = resizeStartScaleY;
        let newScale = resizeStartScale;

        if (stretchDirection === 'e') {
          newScaleX = Math.max(10, Math.min(500, resizeStartScaleX + dx));
          newScaleY = resizeStartScaleY;
        } else if (stretchDirection === 'w') {
          newScaleX = Math.max(10, Math.min(500, resizeStartScaleX - dx));
          newScaleY = resizeStartScaleY;
        } else if (stretchDirection === 's') {
          newScaleY = Math.max(10, Math.min(500, resizeStartScaleY + dy));
          newScaleX = resizeStartScaleX;
        } else if (stretchDirection === 'n') {
          newScaleY = Math.max(10, Math.min(500, resizeStartScaleY - dy));
          newScaleX = resizeStartScaleX;
        } else if (stretchDirection === 'se') {
          newScaleX = Math.max(10, Math.min(500, resizeStartScaleX + dx));
          newScaleY = Math.max(10, Math.min(500, resizeStartScaleY + dy));
        } else if (stretchDirection === 'sw') {
          newScaleX = Math.max(10, Math.min(500, resizeStartScaleX - dx));
          newScaleY = Math.max(10, Math.min(500, resizeStartScaleY + dy));
        } else if (stretchDirection === 'ne') {
          newScaleX = Math.max(10, Math.min(500, resizeStartScaleX + dx));
          newScaleY = Math.max(10, Math.min(500, resizeStartScaleY - dy));
        } else if (stretchDirection === 'nw') {
          newScaleX = Math.max(10, Math.min(500, resizeStartScaleX - dx));
          newScaleY = Math.max(10, Math.min(500, resizeStartScaleY - dy));
        } else {
          const distChange = Math.round((dx + dy) / 2);
          newScale = Math.max(10, Math.min(500, resizeStartScale + distChange));
          newScaleX = Math.max(10, Math.min(500, resizeStartScaleX + dx));
          newScaleY = Math.max(10, Math.min(500, resizeStartScaleY + dy));
        }

        const currentImages = getPageImages(activePage);
        const updated = currentImages.map(img => 
          img.id === activeResizeImgId ? { 
            ...img, 
            scale: newScale, 
            scaleX: newScaleX, 
            scaleY: newScaleY 
          } : img
        );
        updatePage(activePage.id, { pageImages: updated });
        setImageScale(newScale);
        setImageScaleX(newScaleX);
        setImageScaleY(newScaleY);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingImage) {
        setIsDraggingImage(false);
        setActiveDragImgId(null);
      }
      if (isResizingImage) {
        setIsResizingImage(false);
        setActiveResizeImgId(null);
      }
    };

    if (isDraggingImage || isResizingImage) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingImage, isResizingImage, activeDragImgId, activeResizeImgId, dragStartPos, dragStartOffset, resizeStartPos, resizeStartScale, resizeStartScaleX, resizeStartScaleY, stretchDirection, activePage]);

  const handleImageMouseDown = (e: React.MouseEvent, imgId?: string) => {
    e.preventDefault();
    let startX = imageOffsetX;
    let startY = imageOffsetY;
    if (imgId && activePage) {
      setSelectedImageId(imgId);
      setActiveDragImgId(imgId);
      const currentImages = getPageImages(activePage);
      const targetImg = currentImages.find(img => img.id === imgId);
      if (targetImg) {
        startX = targetImg.offsetX || 0;
        startY = targetImg.offsetY || 0;
      }
    }
    setIsDraggingImage(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setDragStartOffset({ x: startX, y: startY });
  };

  const handleResizeStart = (e: React.MouseEvent, dir: 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se' | 'both' = 'both', imgId?: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (imgId) {
      setSelectedImageId(imgId);
      setActiveResizeImgId(imgId);
    }
    setIsResizingImage(true);
    setStretchDirection(dir);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartScale(imageScale);
    setResizeStartScaleX(imageScaleX);
    setResizeStartScaleY(imageScaleY);
  };

  const handleAutoFitImage = () => {
    setImageScale(100);
    setImageScaleX(100);
    setImageScaleY(100);
    setImageOffsetX(0);
    setImageOffsetY(0);
    updatePageParam({ imageScale: 100, imageScaleX: 100, imageScaleY: 100, imageOffsetX: 0, imageOffsetY: 0 });
  };

  const handleAddOrUpdateImage = (newImageDataUrl: string, targetImgId?: string | null) => {
    if (!activePage) return;
    const currentImages = getPageImages(activePage);

    if (targetImgId && currentImages.some(img => img.id === targetImgId)) {
      const updated = currentImages.map(img => 
        img.id === targetImgId ? { ...img, url: newImageDataUrl } : img
      );
      updatePage(activePage.id, {
        pageImages: updated,
        illustrationUrl: updated[0]?.url || newImageDataUrl,
      });
    } else {
      const newImgItem: PageImageItem = {
        id: 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        url: newImageDataUrl,
        scale: 100,
        scaleX: 100,
        scaleY: 100,
        offsetX: 0,
        offsetY: 0,
      };
      const updated = [...currentImages, newImgItem];
      updatePage(activePage.id, {
        pageImages: updated,
        illustrationUrl: updated[0]?.url || newImageDataUrl,
        layoutType: 'coloring',
      });
      setSelectedImageId(newImgItem.id);
    }
  };

  const handleDeleteImage = (imgId: string) => {
    if (!activePage) return;
    const currentImages = getPageImages(activePage);
    const updated = currentImages.filter(img => img.id !== imgId);
    updatePage(activePage.id, {
      pageImages: updated,
      illustrationUrl: updated[0]?.url || '',
    });
    if (selectedImageId === imgId) {
      setSelectedImageId(updated[0]?.id || null);
    }
    addNotification('info', isAr ? 'تم حذف الصورة من الصفحة' : 'Image deleted from page');
  };

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

  // Handle local image file uploads with pre-placement crop & bg removal modal
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64Url = event.target?.result as string;
      if (activePage && b64Url) {
        // Clear editingImageId so this upload is treated as a brand NEW image
        setEditingImageId(null);
        setCropImageSrc(b64Url);
        setIsCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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

  // Quick helper for live parameter updates
  const updatePageParam = (updates: Partial<Page>) => {
    if (!activePage) return;
    updatePage(activePage.id, updates);
  };

  // Save changes to current page
  const handleSaveChanges = () => {
    if (!activePage) return;
    
    const updates: Partial<typeof activePage> = {
      title: customTitle,
      textContent: customText,
      colorsUsed: colorsUsed,
      imageScale,
      imageOffsetY,
      imageOffsetX,
      titleSize,
      titleColor,
      titlePosition,
      titleBgCard,
      textSize,
      textColor,
      textPosition,
      textBgCard,
      extraText,
      extraTextSize,
      extraTextColor,
      extraTextPosition,
      extraTextBgCard
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

  // Add standard new blank coloring page
  const handleAddPage = () => {
    addBlankPage();
    addNotification('success', isAr ? 'تمت إضافة صفحة تلوين جديدة!' : 'New coloring page added!');
    setTimeout(() => {
      if (currentBook.pages.length > 0) {
        setSelectedPageId(currentBook.pages[currentBook.pages.length - 1].id);
      }
    }, 100);
  };

  // Add text-only page
  const handleAddTextPage = () => {
    addTextPage();
    addNotification('success', isAr ? 'تمت إضافة صفحة نصية جديدة!' : 'New text page added!');
    setTimeout(() => {
      if (currentBook.pages.length > 0) {
        setSelectedPageId(currentBook.pages[currentBook.pages.length - 1].id);
      }
    }, 100);
  };

  // Add activity worksheet page (with customizable boxes/rectangles)
  const handleAddActivityPage = () => {
    addActivityPage();
    addNotification('success', isAr ? 'تمت إضافة صفحة أنشطة ورسومات جديدة!' : 'New activity worksheet page added!');
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
                ? 'مرحباً بك! هذا هو مجمع كتب التلوين والأنشطة المبسط. هنا يمكنك إضافة صفحات جديدة، ورفع صور من جهازك مباشرة أو رسم العناصر وتصميمها بسهولة، وتصدير الكتاب للطباعة فوراً كملف PDF احترافي.' 
                : 'Welcome! This is the simplified coloring book composer. Add pages, upload picture files from your computer, or design outlines directly, then export the completed book to print!'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs"
              title={isAr ? 'استيراد كتاب PDF وتعديل اللوجو والعنوان والطباعة' : 'Import & edit PDF book'}
            >
              <FileUp className="w-4 h-4" />
              {isAr ? '📂 استيراد وتعديل كتاب PDF' : '📂 Import & Edit PDF'}
            </button>

            <button
              onClick={() => setProfessionalMode(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
              title={isAr ? 'تبديل للوضع الاحترافي' : 'Switch to Professional Mode'}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              {isAr ? 'التبديل للوضع المتقدم' : 'Switch to Advanced Mode'}
            </button>
          </div>

          <button
            onClick={() => {
              const newMode = isFullColorMode ? 'coloring' : 'fullcolor';
              updateBookMetadata({ designMode: newMode });
              addNotification('info', newMode === 'fullcolor'
                ? (isAr ? 'تم الانتقال لـ وضع تصميم الكتب الملونة (ألوان حقيقية بالكامل) 🎨' : 'Switched to Full Color Mode 🎨')
                : (isAr ? 'تم الانتقال لـ وضع كتب التلوين (أوتلاين أسود وأبيض) 🖍️' : 'Switched to Coloring Book Mode 🖍️')
              );
            }}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-xs ${
              isFullColorMode
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white ring-2 ring-purple-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title={isAr ? 'تصميم كتب ملونة بدون تحويل لأوتلاين مع تحريك وتغيير حجم الصور والنصوص' : 'Full Color Design Mode'}
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            {isAr ? (isFullColorMode ? '✨ وضع تصميم الكتب الملونة (مفعّل)' : '🎨 وضع تصميم الكتب الملونة') : (isFullColorMode ? '✨ Full Color Mode (Active)' : '🎨 Full Color Book Mode')}
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
          </div>

          {/* Quick Page Type Creator Button Bar */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={handleAddPage}
              className="py-2 px-1 bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 rounded-lg text-brand-700 font-bold text-[10px] flex flex-col items-center justify-center gap-1 transition shadow-2xs"
              title={isAr ? 'إضافة صفحة رسم وتلوين جديدة' : 'Add Coloring Page'}
            >
              <Plus className="w-3.5 h-3.5 text-brand-600" />
              <span>{isAr ? 'صفحة تلوين' : 'Coloring Page'}</span>
            </button>

            <button
              onClick={handleAddTextPage}
              className="py-2 px-1 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-lg text-sky-700 font-bold text-[10px] flex flex-col items-center justify-center gap-1 transition shadow-2xs"
              title={isAr ? 'إضافة صفحة نصوص وقراءة فقط' : 'Add Text-Only Page'}
            >
              <Type className="w-3.5 h-3.5 text-sky-600" />
              <span>{isAr ? 'صفحة نصية' : 'Text Page'}</span>
            </button>

            <button
              onClick={handleAddActivityPage}
              className="py-2 px-1 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg text-purple-700 font-bold text-[10px] flex flex-col items-center justify-center gap-1 transition shadow-2xs"
              title={isAr ? 'إضافة صفحة أنشطة ومربعات متحكم بها' : 'Add Activity Worksheet Page'}
            >
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>{isAr ? 'صفحة أنشطة' : 'Activity Page'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 max-h-[580px] overflow-y-auto pr-1">

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
                        className={`w-full h-full object-cover ${isFullColorMode ? '' : 'grayscale brightness-125 contrast-125'}`} 
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
                      {isFullColorMode 
                        ? (isAr ? '🎨 صفحة ملونة' : '🎨 Full Color Page')
                        : (p.layoutType === 'tracing' ? (isAr ? '✍️ تتبع ولون' : '✍️ Trace & Color') : (isAr ? '🎨 رسمة تلوين' : '🎨 Coloring Page'))}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Column: Interactive Page Sheet Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
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

          {/* Redaction / Shading Control Bar */}
          {activePage && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 shadow-md">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRedactionToolActive(!isRedactionToolActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                    isRedactionToolActive
                      ? 'bg-amber-400 text-slate-950 font-extrabold ring-2 ring-amber-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                  }`}
                  title={isAr ? 'تفعيل أداة تظليل وإخفاء الأسطر أو العناصر' : 'Toggle Redaction / Shading Tool'}
                >
                  <EyeOff className="w-4 h-4" />
                  <span>{isRedactionToolActive ? (isAr ? 'أداة التظليل نشطة (انقر للإلغاء)' : 'Redaction Active') : (isAr ? 'أداة التظليل والإخفاء' : 'Redaction Tool')}</span>
                </button>

                {isRedactionToolActive && (
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
                    <span className="text-slate-400 font-bold px-1">{isAr ? 'اللون:' : 'Color:'}</span>
                    <button
                      type="button"
                      onClick={() => setActiveRedactionColor('#ffffff')}
                      className={`px-2 py-0.5 rounded font-bold border ${
                        activeRedactionColor === '#ffffff' ? 'bg-white text-slate-900 border-white font-extrabold' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      ⚪ {isAr ? 'أبيض (إخفاء)' : 'White'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveRedactionColor('#000000')}
                      className={`px-2 py-0.5 rounded font-bold border ${
                        activeRedactionColor === '#000000' ? 'bg-slate-950 text-white border-slate-700 font-extrabold' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      🖤 {isAr ? 'أسود' : 'Black'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveRedactionColor('#64748b')}
                      className={`px-2 py-0.5 rounded font-bold border ${
                        activeRedactionColor === '#64748b' ? 'bg-slate-600 text-white border-slate-500 font-extrabold' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      🩶 {isAr ? 'رمادي' : 'Gray'}
                    </button>
                  </div>
                )}
              </div>

              {activePage.redactionBlocks && activePage.redactionBlocks.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
                    🛡️ {activePage.redactionBlocks.length} {isAr ? 'تظليلاً' : 'shaded'}
                  </span>

                  {/* Apply To All Pages Button */}
                  <button
                    type="button"
                    onClick={() => {
                      applyRedactionToAllPages(activePage.redactionBlocks || []);
                      addNotification('success', isAr ? 'تم نسخ وتطبيق التظليل الحالي على كافة صفحات الكتاب بنجاح!' : 'Redaction applied to all pages!');
                    }}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-xs"
                    title={isAr ? 'تطبيق نفس التظليل والتغطية على كل صفحات الكتاب توفيراً للوقت' : 'Apply same redaction to all pages'}
                  >
                    <Copy className="w-3 h-3" />
                    <span>{isAr ? 'تطبيق على كل الصفحات' : 'Apply to All Pages'}</span>
                  </button>

                  {/* Auto-sync Switch */}
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300 bg-slate-900/90 px-2 py-0.5 rounded-lg border border-amber-500/30 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoSyncRedactions}
                      onChange={(e) => {
                        setAutoSyncRedactions(e.target.checked);
                        if (e.target.checked && activePage.redactionBlocks && activePage.redactionBlocks.length > 0) {
                          applyRedactionToAllPages(activePage.redactionBlocks);
                          addNotification('info', isAr ? 'تم تفعيل المزامنة التلقائية للتظليل على كل الصفحات' : 'Auto-sync redaction enabled');
                        }
                      }}
                      className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500 border-slate-700"
                    />
                    <span>{isAr ? '⚡ مزامنة تلقائية' : 'Auto-sync'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(isAr ? 'هل تريد مسح جميع المظلات المضافة على هذه الصفحة؟' : 'Clear all redactions on this page?')) {
                        updatePage(activePage.id, { redactionBlocks: [] });
                      }
                    }}
                    className="px-2 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/80 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                    title={isAr ? 'حذف جميع المظلات من هذه الصفحة' : 'Clear all redactions'}
                  >
                    <Eraser className="w-3 h-3" />
                    <span>{isAr ? 'مسح الكل' : 'Clear All'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activePage ? (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative shadow-2xl flex flex-col items-center justify-center">
              
              {/* Paper bounding container styled with standard cropping rulers */}
              <div 
                className={`bg-white relative overflow-hidden transition-all duration-300 aspect-[3/4] w-full max-w-[350px] ${
                  showPageFrame ? 'rounded-lg border-4 border-slate-200 shadow-2xl' : 'rounded-none border-0 shadow-2xl'
                }`}
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
              >
                {/* Redaction / Shading Interactive Layer */}
                <RedactionOverlayLayer
                  blocks={activePage.redactionBlocks || []}
                  onChange={(updatedBlocks) => {
                    updatePage(activePage.id, { redactionBlocks: updatedBlocks });
                    if (autoSyncRedactions) {
                      applyRedactionToAllPages(updatedBlocks);
                    }
                  }}
                  isEditing={isRedactionToolActive}
                  activeColor={activeRedactionColor}
                  isAr={isAr}
                />

                {/* Safe margin zone dashed bounding box (conditional) */}
                {showPageFrame && (
                  <>
                    <div className="absolute inset-4 border border-dashed border-rose-300/30 pointer-events-none flex items-center justify-center">
                      <span className="absolute top-1 left-2 text-[8px] font-mono text-rose-300/40 select-none">حدود الأمان (Safe Zone)</span>
                    </div>

                    <div className="absolute inset-2 border border-dashed border-cyan-400/20 pointer-events-none">
                      <span className="absolute bottom-1 right-2 text-[8px] font-mono text-cyan-400/30 select-none">هامش القص (Bleed Limits)</span>
                    </div>
                  </>
                )}

                {/* TOP-RIGHT MINI COLORED REFERENCE THUMBNAIL (النموذج الملون المصغر في أعلى اليمين) */}
                {(!isFullColorMode || activePage.layoutType === 'coloring') && showColorGuide && (getPageImages(activePage)[0]?.url || activePage.illustrationUrl) && (
                  <div 
                    className={`absolute z-30 flex flex-col items-center bg-white p-1 rounded-xl shadow-md border border-slate-200/90 pointer-events-auto transition-all hover:scale-105 ${
                      colorGuidePosition === 'top-left' ? 'top-3 left-3' : 'top-3 right-3'
                    }`}
                    style={{
                      width: colorGuideSize === 'small' ? '2.8cm' : colorGuideSize === 'large' ? '4.8cm' : '3.6cm',
                      maxHeight: '4.8cm'
                    }}
                    title={isAr ? 'النموذج الملون المصغر (دليل التلوين)' : 'Miniature Colored Reference Model'}
                  >
                    <div className="w-full bg-slate-900 text-amber-300 text-[8px] font-bold text-center py-0.5 rounded-t leading-none flex items-center justify-center gap-1 shadow-2xs shrink-0">
                      <span>🎨</span>
                      <span>{isAr ? 'دليل التلوين' : 'Color Guide'}</span>
                    </div>
                    <div className="w-full flex-1 flex items-center justify-center overflow-hidden p-0.5 bg-slate-50 rounded-b min-h-0">
                      <img 
                        src={getPageImages(activePage)[0]?.url || activePage.illustrationUrl} 
                        alt="Original Color Guide" 
                        referrerPolicy="no-referrer"
                        className="max-w-full max-h-full object-contain rounded"
                      />
                    </div>
                  </div>
                )}

                {/* Nursery Logo Overlay on canvas */}
                {(nurseryLogoUrl || currentBook?.metadata?.nurseryLogoUrl) && (
                  <div className="absolute top-2 left-3 z-20 pointer-events-none max-w-[90px] max-h-[40px] flex items-center justify-start">
                    <img 
                      src={nurseryLogoUrl || currentBook?.metadata?.nurseryLogoUrl} 
                      alt="شعار الحضانة" 
                      className="max-w-full max-h-[40px] object-contain drop-shadow-xs" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Institution Logo Overlay on canvas */}
                {(institutionLogoUrl || currentBook?.metadata?.institutionLogoUrl) && (
                  <div className="absolute bottom-2 left-3 z-20 pointer-events-none max-w-[80px] max-h-[35px] flex items-center justify-start">
                    <img 
                      src={institutionLogoUrl || currentBook?.metadata?.institutionLogoUrl} 
                      alt="شعار المؤسسة" 
                      className="max-w-full max-h-[35px] object-contain drop-shadow-xs" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Real-time Fixed Header (shows only if headers are enabled) */}
                {!activePage.hidePageHeaderFooter && (
                  <div className="absolute top-4 left-6 right-6 flex items-center justify-end border-b border-slate-100 pb-1.5 text-[10px] font-bold text-slate-400 select-none" dir="rtl">
                    <span className="font-mono text-[9px]">A4</span>
                  </div>
                )}

                {/* Real-time Fixed Footer (shows only if headers/footers are enabled) */}
                {!activePage.hidePageHeaderFooter && (
                  <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[9px] font-bold text-slate-400 select-none" dir="rtl">
                    <span>🌟 {platformName || (isAr ? 'منصة التعليم والنشاط' : 'Smart Kids Platform')}</span>
                    <span className="font-mono text-xs">{activePage.pageNumber}</span>
                  </div>
                )}

                {/* Sheet Content container */}
                <div 
                  className={`h-full flex flex-col justify-between select-none text-right relative overflow-hidden transition-all duration-200 ${
                    (activePage.hidePageHeaderFooter || activePage.fullBleedImage || topMargin === '0cm')
                      ? 'p-0'
                      : topMargin === '1.5cm' ? 'px-6 pb-6 pt-4' :
                        topMargin === '5cm' ? 'px-6 pb-6 pt-14' :
                        'px-6 pb-6 pt-7'
                  }`} 
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  
                  {activePage.layoutType === 'activity-worksheet' ? (
                    <ActivityWorksheetView config={activePage.activityWorksheet} isAr={isAr} />
                  ) : activePage.layoutType === 'text-only' ? (
                    <div className="w-full h-full flex flex-col justify-between p-5 bg-white rounded-xl select-none text-right overflow-y-auto max-h-full relative space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
                      <div>
                        {/* Page Title */}
                        {(customTitle || activePage.title) && (
                          <h2 
                            className="font-display font-extrabold tracking-tight leading-snug mb-3 text-center"
                            style={{ 
                              fontSize: `${titleSize || activePage.titleSize || 26}px`, 
                              color: titleColor || activePage.titleColor || '#0f172a' 
                            }}
                          >
                            {customTitle || activePage.title}
                          </h2>
                        )}
                        
                        {/* Body Text */}
                        {(customText || activePage.textContent) && (
                          <div 
                            className={`rounded-xl whitespace-pre-wrap transition-all ${textBgCard || activePage.textBgCard ? 'bg-slate-50 border border-slate-200/90 shadow-2xs' : ''}`}
                            style={{ padding: `${activePage.textPadding || 16}px` }}
                          >
                            <p 
                              style={{ 
                                fontSize: `${textSize || activePage.textSize || 14}px`, 
                                color: textColor || activePage.textColor || '#334155',
                                lineHeight: activePage.lineHeight || 1.6,
                                textAlign: (activePage.textAlign || 'right') as any,
                                fontWeight: activePage.fontWeight || 'normal',
                              }}
                            >
                              {customText || activePage.textContent}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Render Draggable Images on Text Page if present */}
                      {getPageImages(activePage).length > 0 && (
                        <div className="my-2 relative min-h-[160px] flex flex-wrap items-center justify-center gap-3">
                          {getPageImages(activePage).map((imgItem) => {
                            const isSelected = selectedImageId === imgItem.id || getPageImages(activePage).length === 1;
                            const imgScale = imgItem.scale || 100;
                            const imgScaleX = imgItem.scaleX || 100;
                            const imgScaleY = imgItem.scaleY || 100;
                            const imgOffsetX = imgItem.offsetX || 0;
                            const imgOffsetY = imgItem.offsetY || 0;
                            const imgOp = (imgItem.opacity ?? activePage.imageOpacity ?? 100) / 100;
                            const widthCm = imgItem.widthCm || Math.round((14.0 * (imgScale / 100) * (imgScaleX / 100)) * 10) / 10;
                            const heightCm = imgItem.heightCm || Math.round((12.0 * (imgScale / 100) * (imgScaleY / 100)) * 10) / 10;

                            return (
                              <div 
                                key={imgItem.id}
                                className={`relative flex items-center justify-center transition-shadow m-2 ${isSelected ? 'ring-2 ring-purple-500/80 ring-offset-2 rounded-lg' : 'hover:ring-1 hover:ring-purple-300 rounded-lg'}`}
                                style={{
                                  transform: `scale(${imgScale / 100}) scale(${imgScaleX / 100}, ${imgScaleY / 100}) translate(${imgOffsetX}px, ${imgOffsetY}px)`,
                                  opacity: imgOp,
                                  cursor: isDraggingImage && activeDragImgId === imgItem.id ? 'grabbing' : 'grab',
                                  touchAction: 'none',
                                  zIndex: imgItem.isWatermark ? 0 : 20
                                }}
                                onMouseDown={(e) => handleImageMouseDown(e, imgItem.id)}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImage(imgItem.id);
                                  }}
                                  className="absolute -top-3 -right-3 w-6 h-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-lg font-bold text-xs z-50"
                                  title={isAr ? 'حذف الصورة' : 'Delete'}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>

                                <img 
                                  src={imgItem.url} 
                                  alt="Text page image" 
                                  referrerPolicy="no-referrer"
                                  className="max-w-full max-h-[280px] object-contain pointer-events-none select-none rounded"
                                />

                                {/* CM Badge overlay */}
                                {isSelected && (
                                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-md z-50 whitespace-nowrap">
                                    📐 {widthCm} سم × {heightCm} سم
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Extra Callout Box */}
                      {(extraText || activePage.extraText) && (
                        <div className={`p-3.5 rounded-xl ${extraTextBgCard || activePage.extraTextBgCard ? 'bg-amber-50 border border-amber-300 text-amber-900 shadow-2xs' : 'text-blue-700'}`}>
                          <p className="font-bold text-xs whitespace-pre-wrap" style={{ fontSize: `${extraTextSize || activePage.extraTextSize || 13}px` }}>
                            {extraText || activePage.extraText}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* TOP SECTION: Elements placed at 'top' */}
                  <div className="space-y-1">
                    {(titlePosition === 'top' || !titlePosition) && (customTitle || activePage.title) && (
                      <div className={`transition-all text-center ${titleBgCard ? 'bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-slate-200/80 shadow-xs' : ''}`}>
                        <h3 
                          className="font-display font-extrabold tracking-tight leading-snug"
                          style={{ fontSize: `${titleSize || 22}px`, color: titleColor || '#0f172a' }}
                        >
                          {customTitle || activePage.title}
                        </h3>
                      </div>
                    )}

                    {textPosition === 'top' && (customText || activePage.textContent) && (
                      <div className={`transition-all text-center ${textBgCard ? 'bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-slate-200/80 shadow-xs' : ''}`}>
                        <p 
                          className="font-sans leading-relaxed whitespace-pre-wrap"
                          style={{ fontSize: `${textSize || 14}px`, color: textColor || '#334155' }}
                        >
                          {customText || activePage.textContent}
                        </p>
                      </div>
                    )}

                    {extraTextPosition === 'top' && (extraText || activePage.extraText) && (
                      <div className={`transition-all text-center ${extraTextBgCard ? 'bg-white/95 backdrop-blur-xs p-2 rounded-xl border border-slate-200/80 shadow-xs' : ''}`}>
                        <p 
                          className="font-sans font-bold leading-relaxed whitespace-pre-wrap"
                          style={{ fontSize: `${extraTextSize || 14}px`, color: extraTextColor || '#2563eb' }}
                        >
                          {extraText || activePage.extraText}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dual Image Illustration Concept / Full Color Image with Direct Canvas Mouse Drag & Resize */}
                  <div className={`flex-1 my-1 relative flex flex-col items-center justify-center overflow-hidden transition-all ${showPageFrame ? 'bg-slate-50/50 rounded-xl border border-slate-200/80' : 'bg-transparent border-0 rounded-none'}`}>
                    {/* Render Page Images */}
                    {getPageImages(activePage).length > 0 ? (
                      <div 
                        className="w-full h-full relative overflow-hidden flex flex-wrap items-center justify-center gap-4 group select-none p-4"
                        onMouseEnter={() => setIsImageHovered(true)}
                        onMouseLeave={() => setIsImageHovered(false)}
                      >
                        {/* On-canvas Quick Control Bar */}
                        <div className={`absolute top-2 left-1/2 -translate-x-1/2 z-30 transition-all duration-200 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-full shadow-xl border border-white/20 text-xs ${isImageHovered || isDraggingImage || isResizingImage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                          <span className="text-[10px] font-bold text-purple-300 flex items-center gap-1">
                            <Move className="w-3 h-3 animate-pulse" />
                            {isAr ? 'امسك واسحب أي صورة للتحريك والمط' : 'Drag & stretch any image'}
                          </span>
                          <span className="w-px h-3 bg-white/20" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (fileInputRef.current) fileInputRef.current.click();
                            }}
                            className="px-2 py-0.5 bg-brand-600 hover:bg-brand-500 text-white rounded-full text-[10px] font-bold transition flex items-center gap-1 shadow-xs"
                            title={isAr ? 'إضافة صورة جديدة للصفحة' : 'Add another image'}
                          >
                            <Plus className="w-3 h-3" />
                            {isAr ? 'إضافة صورة' : 'Add Image'}
                          </button>
                          <span className="w-px h-3 bg-white/20" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAutoFitImage();
                            }}
                            className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-[10px] font-bold transition flex items-center gap-1 shadow-xs"
                            title={isAr ? 'إعادة ضبط الأحجام' : 'Reset Fit'}
                          >
                            <Maximize2 className="w-3 h-3" />
                            {isAr ? 'إعادة ضبط' : 'Reset'}
                          </button>
                        </div>



                        {/* Draggable & Freeform Resizable Images List */}
                        {getPageImages(activePage).map((imgItem) => {
                          const isSelected = selectedImageId === imgItem.id || getPageImages(activePage).length === 1;
                          const imgScale = imgItem.scale || 100;
                          const imgScaleX = imgItem.scaleX || 100;
                          const imgScaleY = imgItem.scaleY || 100;
                          const imgOffsetX = imgItem.offsetX || 0;
                          const imgOffsetY = imgItem.offsetY || 0;
                          const imgOp = (imgItem.opacity ?? activePage.imageOpacity ?? 100) / 100;

                          return (
                            <div 
                              key={imgItem.id}
                              className={`relative max-w-full max-h-full flex items-center justify-center transition-shadow m-2 ${isSelected ? 'ring-2 ring-purple-500/80 ring-offset-2 rounded-lg' : 'hover:ring-1 hover:ring-purple-300 rounded-lg'}`}
                              style={{
                                transform: `scale(${imgScale / 100}) scale(${imgScaleX / 100}, ${imgScaleY / 100}) translate(${imgOffsetX}px, ${imgOffsetY}px)`,
                                opacity: imgOp,
                                cursor: isDraggingImage && activeDragImgId === imgItem.id ? 'grabbing' : 'grab',
                                touchAction: 'none'
                              }}
                              onMouseDown={(e) => handleImageMouseDown(e, imgItem.id)}
                            >
                              {/* Delete (X) button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteImage(imgItem.id);
                                }}
                                className="absolute -top-3 -right-3 w-6 h-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-lg font-bold text-xs z-50 transition-transform hover:scale-110"
                                title={isAr ? 'حذف هذه الصورة (X)' : 'Delete image'}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>

                              {/* Crop & Remove BG button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingImageId(imgItem.id);
                                  setCropImageSrc(imgItem.url);
                                  setIsCropModalOpen(true);
                                }}
                                className="absolute -top-3 -left-3 px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full flex items-center justify-center gap-1 shadow-lg font-bold text-[10px] z-50 transition-transform hover:scale-110"
                                title={isAr ? 'قص الصورة وتفريغ خلفيتها' : 'Crop & Clean BG'}
                              >
                                <Scissors className="w-3 h-3" />
                                {isAr ? 'قص/تفريغ' : 'Crop'}
                              </button>

                              {isFullColorMode ? (
                                <img 
                                  src={imgItem.url} 
                                  alt={activePage.title || 'Page illustration'} 
                                  referrerPolicy="no-referrer"
                                  className="max-w-full max-h-[580px] object-contain pointer-events-none select-none rounded"
                                />
                              ) : (
                                <>
                                  {isProcessingOutline && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-10">
                                      <RefreshCw className="w-6 h-6 text-brand-500 animate-spin mb-1" />
                                      <span className="text-[9px] text-slate-400 font-bold">{isAr ? 'جاري استخلاص خطوط الرسم...' : 'Extracting outlines...'}</span>
                                    </div>
                                  )}

                                  <img 
                                    src={outlineDataUrl && imgItem.id === getPageImages(activePage)[0]?.id ? outlineDataUrl : imgItem.url} 
                                    alt="Coloring outline" 
                                    referrerPolicy="no-referrer"
                                    className="max-w-full max-h-[580px] object-contain mix-blend-multiply pointer-events-none select-none"
                                    style={(!outlineDataUrl || imgItem.id !== getPageImages(activePage)[0]?.id) ? { filter: 'grayscale(100%) contrast(1000%) brightness(130%)' } : {}}
                                  />
                                </>
                              )}

                              {/* 8 Freeform Handles (Corners + Sides) */}
                              {isSelected && (
                                <>
                                  {/* Corners */}
                                  <div 
                                    onMouseDown={(e) => handleResizeStart(e, 'nw', imgItem.id)}
                                    className="absolute -top-2 -left-2 w-4 h-4 bg-purple-600 border-2 border-white rounded-full shadow-lg cursor-nwse-resize z-40 hover:scale-125 transition-transform"
                                    title={isAr ? 'تغيير الحجم (أعلى يسار)' : 'Resize Corner (NW)'}
                                  />
                                  <div 
                                    onMouseDown={(e) => handleResizeStart(e, 'ne', imgItem.id)}
                                    className="absolute -top-2 -right-2 w-4 h-4 bg-purple-600 border-2 border-white rounded-full shadow-lg cursor-nesw-resize z-40 hover:scale-125 transition-transform"
                                    title={isAr ? 'تغيير الحجم (أعلى يمين)' : 'Resize Corner (NE)'}
                                  />
                                  <div 
                                    onMouseDown={(e) => handleResizeStart(e, 'sw', imgItem.id)}
                                    className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-600 border-2 border-white rounded-full shadow-lg cursor-nesw-resize z-40 hover:scale-125 transition-transform"
                                    title={isAr ? 'تغيير الحجم (أسفل يسار)' : 'Resize Corner (SW)'}
                                  />
                                  <div 
                                    onMouseDown={(e) => handleResizeStart(e, 'se', imgItem.id)}
                                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-purple-600 border-2 border-white rounded-full shadow-lg cursor-nwse-resize z-40 hover:scale-125 transition-transform"
                                    title={isAr ? 'تغيير الحجم (أسفل يمين)' : 'Resize Corner (SE)'}
                                  />

                                  {/* Freeform Side Stretch Handles */}
                                  <div 
                                    onMouseDown={(e) => handleResizeStart(e, 'n', imgItem.id)}
                                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 h-3 bg-amber-500 border border-white rounded-full shadow-lg cursor-ns-resize z-40 hover:scale-110 transition-transform flex items-center justify-center"
                                    title={isAr ? 'مط/كمش رأسي من الأعلى' : 'Vertical Stretch (N)'}
                                  />
                                  <div 
                                    onMouseDown={(e) => handleResizeStart(e, 's', imgItem.id)}
                                    className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-10 h-3 bg-amber-500 border border-white rounded-full shadow-lg cursor-ns-resize z-40 hover:scale-110 transition-transform flex items-center justify-center"
                                    title={isAr ? 'مط/كمش رأسي من الأسفل' : 'Vertical Stretch (S)'}
                                  />
                                  <div 
                                    onMouseDown={(e) => handleResizeStart(e, 'w', imgItem.id)}
                                    className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-3 h-10 bg-amber-500 border border-white rounded-full shadow-lg cursor-ew-resize z-40 hover:scale-110 transition-transform flex items-center justify-center"
                                    title={isAr ? 'مط/كمش أفقي من اليسار' : 'Horizontal Stretch (W)'}
                                  />
                                  <div 
                                    onMouseDown={(e) => handleResizeStart(e, 'e', imgItem.id)}
                                    className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-3 h-10 bg-amber-500 border border-white rounded-full shadow-lg cursor-ew-resize z-40 hover:scale-110 transition-transform flex items-center justify-center"
                                    title={isAr ? 'مط/كمش أفقي من اليمين' : 'Horizontal Stretch (E)'}
                                  />

                                  {/* Floating Centimeter Dimensions Badge */}
                                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-white/20 shadow-lg z-50 whitespace-nowrap pointer-events-none">
                                    📐 {imgItem.widthCm || (Math.round((14.0 * (imgScale / 100) * (imgScaleX / 100)) * 10) / 10)} سم × {imgItem.heightCm || (Math.round((12.0 * (imgScale / 100) * (imgScaleY / 100)) * 10) / 10)} سم
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center p-4 text-center space-y-2">
                        <Palette className="w-10 h-10 text-slate-300 mb-1 animate-pulse" />
                        <span className="text-xs text-slate-600 font-bold">{isAr ? 'الصفحة فارغة حالياً' : 'Empty Page'}</span>
                        <p className="text-[10px] text-slate-400 leading-normal max-w-[200px]">
                          {isAr ? 'اختر صورة من الكمبيوتر أو ولد رسمة بالذكاء الاصطناعي' : 'Upload an image from your computer or generate via AI.'}
                        </p>
                      </div>
                    )}

                    {/* OVERLAY POSITIONS inside central frame */}
                    {/* 1. Title Overlay */}
                    {(customTitle || activePage.title) && titlePosition && titlePosition !== 'top' && titlePosition !== 'bottom' && (
                      <div 
                        className={`transition-all ${
                          titlePosition === 'top-right' ? 'absolute top-3 right-3 z-20 max-w-[45%]' :
                          titlePosition === 'top-left' ? 'absolute top-3 left-3 z-20 max-w-[45%]' :
                          titlePosition === 'bottom-right' ? 'absolute bottom-3 right-3 z-20 max-w-[45%]' :
                          titlePosition === 'bottom-left' ? 'absolute bottom-3 left-3 z-20 max-w-[45%]' :
                          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center max-w-[85%]'
                        } ${titleBgCard ? 'bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80 shadow-md' : ''}`}
                      >
                        <h3 
                          className="font-display font-extrabold tracking-tight leading-snug"
                          style={{ fontSize: `${titleSize || 22}px`, color: titleColor || '#0f172a' }}
                        >
                          {customTitle || activePage.title}
                        </h3>
                      </div>
                    )}

                    {/* 2. Story Text Overlay */}
                    {(customText || activePage.textContent) && textPosition && textPosition !== 'top' && textPosition !== 'bottom' && (
                      <div 
                        className={`transition-all ${
                          textPosition === 'top-right' ? 'absolute top-3 right-3 z-20 max-w-[45%]' :
                          textPosition === 'top-left' ? 'absolute top-3 left-3 z-20 max-w-[45%]' :
                          textPosition === 'bottom-right' ? 'absolute bottom-3 right-3 z-20 max-w-[45%]' :
                          textPosition === 'bottom-left' ? 'absolute bottom-3 left-3 z-20 max-w-[45%]' :
                          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center max-w-[85%]'
                        } ${textBgCard ? 'bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80 shadow-md' : ''}`}
                      >
                        <p 
                          className="font-sans leading-relaxed whitespace-pre-wrap font-semibold"
                          style={{ fontSize: `${textSize || 14}px`, color: textColor || '#334155' }}
                        >
                          {customText || activePage.textContent}
                        </p>
                      </div>
                    )}

                    {/* 3. Extra Text Overlay */}
                    {(extraText || activePage.extraText) && extraTextPosition && extraTextPosition !== 'top' && extraTextPosition !== 'bottom' && (
                      <div 
                        className={`transition-all ${
                          extraTextPosition === 'top-right' ? 'absolute top-3 right-3 z-20 max-w-[45%]' :
                          extraTextPosition === 'top-left' ? 'absolute top-3 left-3 z-20 max-w-[45%]' :
                          extraTextPosition === 'bottom-right' ? 'absolute bottom-3 right-3 z-20 max-w-[45%]' :
                          extraTextPosition === 'bottom-left' ? 'absolute bottom-3 left-3 z-20 max-w-[45%]' :
                          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center max-w-[85%]'
                        } ${extraTextBgCard ? 'bg-white/95 backdrop-blur-xs p-2 rounded-xl border border-slate-200/80 shadow-md' : ''}`}
                      >
                        <p 
                          className="font-sans font-bold leading-relaxed whitespace-pre-wrap"
                          style={{ 
                            fontSize: `${extraTextSize || 14}px`, 
                            color: extraTextColor || '#2563eb' 
                          }}
                        >
                          {extraText || activePage.extraText}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM SECTION: Elements placed at 'bottom' */}
                  <div className="space-y-1">
                    {titlePosition === 'bottom' && (customTitle || activePage.title) && (
                      <div className={`transition-all text-center ${titleBgCard ? 'bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-slate-200/80 shadow-xs' : ''}`}>
                        <h3 
                          className="font-display font-extrabold tracking-tight leading-snug"
                          style={{ fontSize: `${titleSize || 22}px`, color: titleColor || '#0f172a' }}
                        >
                          {customTitle || activePage.title}
                        </h3>
                      </div>
                    )}

                    {textPosition === 'bottom' && (customText || activePage.textContent) && (
                      <div className={`transition-all text-center ${textBgCard ? 'bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-slate-200/80 shadow-xs' : ''}`}>
                        <p 
                          className="font-sans leading-relaxed whitespace-pre-wrap"
                          style={{ fontSize: `${textSize || 14}px`, color: textColor || '#334155' }}
                        >
                          {customText || activePage.textContent}
                        </p>
                      </div>
                    )}

                    {extraTextPosition === 'bottom' && (extraText || activePage.extraText) && (
                      <div className={`transition-all text-center ${extraTextBgCard ? 'bg-white/95 backdrop-blur-xs p-2 rounded-xl border border-slate-200/80 shadow-xs' : ''}`}>
                        <p 
                          className="font-sans font-bold leading-relaxed whitespace-pre-wrap"
                          style={{ fontSize: `${extraTextSize || 14}px`, color: extraTextColor || '#2563eb' }}
                        >
                          {extraText || activePage.extraText}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM FEATURE BAR: Tracing Box + Color Guide Frame (Optional, off by default) */}
                  {(activePage.showColoringActivityBox || (activePage.activity && activePage.activity.type === 'tracing')) && (
                    <div className="mt-2 pt-2 border-t border-slate-100/80 flex items-stretch justify-between gap-3 select-none" dir={isAr ? 'rtl' : 'ltr'}>
                      {/* 1. Tracing Box (or Spacer if Tracing is Disabled) */}
                      <div className="flex-1 min-w-0">
                        {activePage.activity && activePage.activity.type === 'tracing' ? (
                          <div className="p-2 bg-brand-50/20 border-2 border-dashed border-brand-300 rounded-xl text-center h-full flex flex-col justify-center">
                            <span className="text-[10px] font-mono font-extrabold text-brand-600 block mb-1 uppercase tracking-wider">
                              {isAr ? '✍️ مستشار تتبع خطوط الحروف (حجم كبير للتلوين والتتبع)' : '✍️ Large Practice Tracing Character'}
                            </span>
                            <div className="h-14 md:h-16 border-2 border-dashed border-slate-300 rounded-xl bg-white flex items-center justify-center gap-4 md:gap-6 px-2">
                              <span className="text-3xl md:text-4xl font-display font-black text-slate-400 tracking-[0.2em] line-through select-none">
                                {activePage.activity.contentData?.character || 'أ'}
                              </span>
                              <span className="text-3xl md:text-4xl font-display font-black text-slate-300/60 tracking-[0.2em] line-through select-none">
                                {activePage.activity.contentData?.character || 'أ'}
                              </span>
                              <span className="text-3xl md:text-4xl font-display font-black text-slate-300/30 tracking-[0.2em] line-through select-none">
                                {activePage.activity.contentData?.character || 'أ'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 bg-slate-50/40 border border-dashed border-slate-200/80 rounded-xl text-center flex items-center justify-center h-full min-h-[70px]">
                            <span className="text-[10px] font-bold text-slate-400 font-sans">
                              {isAr ? '✨ مساحة التلوين والأنشطة المكملة' : '✨ Coloring & Practice Area'}
                            </span>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                  </>
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
                  activePage.layoutType === 'activity-worksheet' ? (
                    <ActivityWorksheetEditor 
                      config={activePage.activityWorksheet} 
                      onChange={(updated) => updatePage(activePage.id, { activityWorksheet: updated })} 
                      isAr={isAr} 
                    />
                  ) : activePage.layoutType === 'text-only' ? (
                    <TextPageEditor 
                      page={activePage} 
                      onChange={(updates) => updatePage(activePage.id, updates)} 
                      isAr={isAr} 
                    />
                  ) : (
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

                      {/* Active Images list on current page */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center">
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                            {isAr ? 'الصور الموجودة في هذه الصفحة:' : 'Images on this page:'}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {getPageImages(activePage).length}
                          </span>
                        </div>

                        {getPageImages(activePage).length > 0 ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                            {getPageImages(activePage).map((img, idx) => (
                              <div 
                                key={img.id}
                                className={`flex items-center justify-between p-2 rounded-xl border transition ${selectedImageId === img.id ? 'border-brand-500 bg-brand-50/20' : 'border-slate-200 bg-slate-50'}`}
                              >
                                <div 
                                  className="flex items-center gap-2 cursor-pointer flex-1"
                                  onClick={() => setSelectedImageId(img.id)}
                                >
                                  <img 
                                    src={img.url} 
                                    alt={`Image ${idx + 1}`} 
                                    className="w-9 h-9 object-cover rounded-lg border border-slate-200"
                                  />
                                  <span className="text-xs font-bold text-slate-700">
                                    {isAr ? `صورة رقم ${idx + 1}` : `Image #${idx + 1}`}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingImageId(img.id);
                                      setCropImageSrc(img.url);
                                      setIsCropModalOpen(true);
                                    }}
                                    className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition"
                                    title={isAr ? 'قص وتفريغ الخلفية' : 'Crop & Clean BG'}
                                  >
                                    <Scissors className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteImage(img.id)}
                                    className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                                    title={isAr ? 'حذف الصورة (X)' : 'Delete image'}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 text-center py-2">
                            {isAr ? 'لا توجد صور في هذه الصفحة حالياً' : 'No images on this page yet.'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Full Page Layout & Bleed Toggle Panel */}
                    <div className="bg-white border border-indigo-200 p-4 rounded-2xl shadow-xs space-y-3">
                      <h4 className="text-xs uppercase font-mono font-bold text-indigo-700 tracking-wider flex items-center justify-end gap-1.5 border-b border-indigo-100 pb-2">
                        {isAr ? 'تنسيق هيكل الصفحة والطباعة' : 'Page Layout & Bleed Controls'}
                        <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                      </h4>

                      {/* Mode selection: Full Page (100%) vs Framed */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            const isCurrentlyFull = activePage.hidePageHeaderFooter && activePage.fullBleedImage;
                            updatePageParam({
                              hidePageHeaderFooter: !isCurrentlyFull,
                              fullBleedImage: !isCurrentlyFull,
                              topMargin: !isCurrentlyFull ? '0cm' : '1.5cm'
                            });
                            setTopMargin(!isCurrentlyFull ? '0cm' : '1.5cm');
                          }}
                          className={`w-full p-3 rounded-xl border text-right transition flex items-center justify-between gap-2 font-bold text-xs ${
                            activePage.hidePageHeaderFooter && activePage.fullBleedImage
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{activePage.hidePageHeaderFooter && activePage.fullBleedImage ? '✅' : '🖼️'}</span>
                            <div className="text-right">
                              <div>{isAr ? 'صفحة كاملة 100% (بدون هوامش أو هيدر إجباري)' : 'Full Page Bleed (100% Size)'}</div>
                              <div className="text-[10px] font-normal opacity-80 mt-0.5">
                                {isAr ? 'عرض الرسمة بالحجم الكامل وإلغاء صفحة داخل صفحة' : 'Full image view without nested borders'}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                            {activePage.hidePageHeaderFooter && activePage.fullBleedImage ? (isAr ? 'مفعل' : 'Active') : (isAr ? 'إطار' : 'Framed')}
                          </span>
                        </button>

                        {/* Optional Activity / Coloring space checkbox */}
                        <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition">
                          <span className="text-xs font-bold text-slate-700 text-right flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            {isAr ? 'إظهار مساحة التلوين والأنشطة أسفل الصفحة' : 'Show Bottom Practice / Coloring Box'}
                          </span>
                          <input
                            type="checkbox"
                            checked={!!activePage.showColoringActivityBox}
                            onChange={(e) => updatePageParam({ showColoringActivityBox: e.target.checked })}
                            className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-slate-300"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Top Margin Control Box */}
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-2.5">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-brand-500" />
                          {isAr ? 'الهامش العلوي للصفحة (Top Margin):' : 'Page Top Margin:'}
                        </span>
                        <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">{topMargin}</span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { val: '0cm', labelAr: 'بدون (0)', labelEn: '0 cm' },
                          { val: '1.5cm', labelAr: '1.5 سم', labelEn: '1.5 cm' },
                          { val: '3cm', labelAr: '3 سم', labelEn: '3 cm' },
                          { val: '5cm', labelAr: '5 سم', labelEn: '5 cm' },
                        ].map((m) => (
                          <button
                            key={m.val}
                            type="button"
                            onClick={() => {
                              setTopMargin(m.val as any);
                              updatePageParam({ topMargin: m.val as any });
                            }}
                            className={`py-1.5 px-1 text-center font-bold text-xs rounded-xl border transition ${
                              topMargin === m.val
                                ? 'bg-brand-500 text-white border-brand-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isAr ? m.labelAr : m.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Unified Image, Outline & Coloring Book Control Panel */}
                    <div className="bg-white border border-purple-200 p-5 rounded-2xl shadow-xs space-y-4">
                      
                      {/* Section Header */}
                      <h4 className="text-xs uppercase font-mono font-bold text-purple-800 tracking-wider flex items-center justify-between border-b border-purple-100 pb-2.5">
                        <span className="flex items-center gap-1.5">
                          <Palette className="w-4 h-4 text-purple-600" />
                          {isAr ? 'أدوات التلوين والأوتلاين وحجم الصورة' : 'Coloring, Outline & Image Controls'}
                        </span>
                      </h4>

                      {/* 1. Design Mode Selector (Full Color vs Coloring Outline) */}
                      <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl space-y-2">
                        <label className="block text-xs font-bold text-purple-900 text-right">
                          {isAr ? '🎨 نمط تصميم الكتاب:' : '🎨 Book Design Mode:'}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              updateBookMetadata({ designMode: 'fullcolor' });
                            }}
                            className={`py-2 px-2 text-center text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                              isFullColorMode
                                ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span>🎨</span>
                            <span>{isAr ? 'صورة ملونة بالكامل' : 'Full Color'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              updateBookMetadata({ designMode: 'coloring' });
                            }}
                            className={`py-2 px-2 text-center text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                              !isFullColorMode
                                ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span>✏️</span>
                            <span>{isAr ? 'مفرغ للتلوين (Outline)' : 'Coloring Outline'}</span>
                          </button>
                        </div>
                      </div>

                      {/* 2. Kids Smart Outline Extractor (Line Thickness & Sensitivity) */}
                      {!isFullColorMode && (
                        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                          <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                            <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                              <Wand2 className="w-4 h-4 text-amber-600" />
                              {isAr ? 'منقّي وسماكة خطوط التلوين الأسود:' : 'Black Line Outline Converter:'}
                            </span>
                            <input
                              type="checkbox"
                              checked={useSmartOutline}
                              onChange={(e) => setUseSmartOutline(e.target.checked)}
                              className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500 cursor-pointer"
                            />
                          </div>

                          {useSmartOutline && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-[11px] font-bold text-amber-900">
                                <span className="font-mono text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-extrabold">{outlineThreshold}</span>
                                <span>{isAr ? 'سماكة ووضوح خطوط الرسم الأسود:' : 'Line Thickness & Sensitivity:'}</span>
                              </div>
                              <input
                                type="range"
                                min="5"
                                max="100"
                                value={outlineThreshold}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setOutlineThreshold(val);
                                  updatePageParam({ outlineThreshold: val });
                                }}
                                className="w-full accent-amber-600 cursor-pointer"
                              />
                              <div className="flex justify-between text-[9px] font-bold text-amber-800">
                                <span>{isAr ? 'خطوط عريضة بارزة (100)' : 'Thick Bold Lines'}</span>
                                <span>{isAr ? 'خطوط دقيقة (5)' : 'Fine Detail Lines'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. Mini Colored Reference Model (النموذج الملون المصغر للتوجيه في أعلى اليمين) */}
                      {!isFullColorMode && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span>🖼️</span>
                              {isAr ? 'النموذج الملون المصغر (في أعلى اليمين):' : 'Mini Colored Reference Model (Top-Right):'}
                            </span>
                            <input
                              type="checkbox"
                              checked={showColorGuide}
                              onChange={(e) => {
                                setShowColorGuide(e.target.checked);
                                updatePageParam({ showColorGuide: e.target.checked });
                              }}
                              className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500 cursor-pointer"
                            />
                          </div>

                          {showColorGuide && (
                            <div className="space-y-2 pt-1 border-t border-slate-200/80">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1 text-right">
                                    {isAr ? 'الحجم (Size):' : 'Size:'}
                                  </label>
                                  <select
                                    value={colorGuideSize}
                                    onChange={(e) => {
                                      const sz = e.target.value as any;
                                      setColorGuideSize(sz);
                                      updatePageParam({ colorGuideSize: sz });
                                    }}
                                    className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 text-right"
                                  >
                                    <option value="small">{isAr ? 'صغير (2.8 سم)' : 'Small (2.8 cm)'}</option>
                                    <option value="medium">{isAr ? 'متوسط (3.6 سم)' : 'Medium (3.6 cm)'}</option>
                                    <option value="large">{isAr ? 'كبير (4.8 سم)' : 'Large (4.8 cm)'}</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1 text-right">
                                    {isAr ? 'الموقع (Position):' : 'Position:'}
                                  </label>
                                  <select
                                    value={colorGuidePosition}
                                    onChange={(e) => {
                                      const pos = e.target.value as any;
                                      setColorGuidePosition(pos);
                                      updatePageParam({ colorGuidePosition: pos });
                                    }}
                                    className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 text-right"
                                  >
                                    <option value="top-right">{isAr ? 'أعلى اليمين' : 'Top Right'}</option>
                                    <option value="top-left">{isAr ? 'أعلى اليسار' : 'Top Left'}</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 4. Page Layout Freedom (صفحة حرة بدون إطارات إجبارية) */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div className="text-right">
                          <span className="block text-xs font-bold text-slate-800">
                            {isAr ? 'إظهار إطار حدود الصفحة:' : 'Show Page Border Frame:'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {isAr ? 'الافتراضي صفحة حرة بدون إطارات إجبارية' : 'Default is free page without forced frame'}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={showPageFrame}
                          onChange={(e) => {
                            setShowPageFrame(e.target.checked);
                            updatePageParam({ showPageFrame: e.target.checked });
                          }}
                          className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500 cursor-pointer"
                        />
                      </div>

                      {/* 5. Crop & Remove BG Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setCropImageSrc(activePage?.illustrationUrl || '');
                          setIsCropModalOpen(true);
                        }}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Scissors className="w-4 h-4" />
                        {isAr ? '✂️ قص وتعديل الصورة وإزالة الخلفية (PNG)' : '✂️ Crop & Remove Background (PNG)'}
                      </button>

                      {/* Quick Action: Auto Fit to Page */}
                      <button
                        type="button"
                        onClick={handleAutoFitImage}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Maximize2 className="w-4 h-4" />
                        {isAr ? '⚡ ضبط تلقائي لحجم الصورة على الصفحة' : '⚡ Auto-fit Image to Page'}
                      </button>

                      {/* Centimeter Dimensions Direct Controls */}
                      <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                        <label className="block text-xs font-bold text-purple-900 text-right">
                          {isAr ? '📐 تحديد الأبعاد بالسنتيمتر (cm):' : '📐 Centimeter Dimensions (cm):'}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="block text-[10px] text-purple-800 font-bold mb-0.5 text-right">
                              {isAr ? 'العرض (cm):' : 'Width (cm):'}
                            </span>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number"
                                step="0.5"
                                min="1"
                                max="21"
                                value={(14.0 * (imageScale / 100) * (imageScaleX / 100)).toFixed(1)}
                                onChange={(e) => {
                                  const wCm = Number(e.target.value) || 10;
                                  const newScaleX = Math.round((wCm / (14.0 * (imageScale / 100))) * 100);
                                  setImageScaleX(newScaleX);
                                  updatePageParam({ imageScaleX: newScaleX });
                                }}
                                className="w-full p-1.5 bg-white border border-purple-300 rounded text-center text-xs font-mono font-bold text-purple-900"
                              />
                              <span className="text-[10px] font-bold text-purple-700">سم</span>
                            </div>
                          </div>

                          <div>
                            <span className="block text-[10px] text-purple-800 font-bold mb-0.5 text-right">
                              {isAr ? 'الارتفاع (cm):' : 'Height (cm):'}
                            </span>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number"
                                step="0.5"
                                min="1"
                                max="29"
                                value={(12.0 * (imageScale / 100) * (imageScaleY / 100)).toFixed(1)}
                                onChange={(e) => {
                                  const hCm = Number(e.target.value) || 10;
                                  const newScaleY = Math.round((hCm / (12.0 * (imageScale / 100))) * 100);
                                  setImageScaleY(newScaleY);
                                  updatePageParam({ imageScaleY: newScaleY });
                                }}
                                className="w-full p-1.5 bg-white border border-purple-300 rounded text-center text-xs font-mono font-bold text-purple-900"
                              />
                              <span className="text-[10px] font-bold text-purple-700">سم</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Image Scale Slider (Uniform) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                          <span className="font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-xs">{imageScale}%</span>
                          <span className="flex items-center gap-1">
                            <ZoomIn className="w-3.5 h-3.5 text-purple-500" />
                            {isAr ? 'التكبير والتصغير الشامل (Overall Scale):' : 'Overall Scale:'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="300"
                          value={imageScale}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setImageScale(val);
                            updatePageParam({ imageScale: val });
                          }}
                          className="w-full accent-purple-600 cursor-pointer"
                        />
                      </div>

                      {/* Freeform Horizontal Stretch X Slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                          <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs">{imageScaleX}%</span>
                          <span className="flex items-center gap-1">
                            <Sliders className="w-3.5 h-3.5 text-amber-600" />
                            {isAr ? 'المط / الكمش الأفقي (Horizontal Stretch X):' : 'Horizontal Stretch (X):'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="300"
                          value={imageScaleX}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setImageScaleX(val);
                            updatePageParam({ imageScaleX: val });
                          }}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>

                      {/* Freeform Vertical Stretch Y Slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                          <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs">{imageScaleY}%</span>
                          <span className="flex items-center gap-1">
                            <Sliders className="w-3.5 h-3.5 text-amber-600" />
                            {isAr ? 'المط / الكمش الرأسي (Vertical Stretch Y):' : 'Vertical Stretch (Y):'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="300"
                          value={imageScaleY}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setImageScaleY(val);
                            updatePageParam({ imageScaleY: val });
                          }}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>

                      {/* Reset Button */}
                      <button
                        type="button"
                        onClick={handleAutoFitImage}
                        className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-purple-200"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        {isAr ? 'إعادة ضبط حجم ونسب الصورة للأصل' : 'Reset Image Scale & Aspect'}
                      </button>
                    </div>

                    {/* Title & Instructions & Extra Text edits */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-1.5">
                          <Type className="w-4 h-4 text-brand-500" />
                          <h4 className="text-xs uppercase font-mono font-bold text-slate-700 tracking-wider">
                            {isAr ? 'الكتابة وتنسيق النصوص' : 'Page Titles & Typography'}
                          </h4>
                        </div>
                      </div>

                      {/* Sub-tabs for Title vs Story Text vs Extra Text */}
                      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setTextControlSubTab('title')}
                          className={`py-1.5 rounded-lg transition ${
                            textControlSubTab === 'title'
                              ? 'bg-white text-brand-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          📌 {isAr ? 'العنوان' : 'Title'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setTextControlSubTab('story')}
                          className={`py-1.5 rounded-lg transition ${
                            textControlSubTab === 'story'
                              ? 'bg-white text-brand-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          📖 {isAr ? 'النص التوجيهي' : 'Story Text'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setTextControlSubTab('extra')}
                          className={`py-1.5 rounded-lg transition ${
                            textControlSubTab === 'extra'
                              ? 'bg-white text-brand-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          ➕ {isAr ? 'نص إضافي' : 'Extra Text'}
                        </button>
                      </div>

                      {/* SUB-TAB 1: TITLE CONTROLS */}
                      {textControlSubTab === 'title' && (
                        <div className="space-y-3.5 animate-fade-in">
                          {/* Page Title Input */}
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1 text-right">
                              {isAr ? 'عنوان الصفحة (مثال: الأسد الشجاع):' : 'Page Heading / Title:'}
                            </label>
                            <input
                              type="text"
                              value={customTitle}
                              onChange={(e) => {
                                setCustomTitle(e.target.value);
                                updatePageParam({ title: e.target.value });
                              }}
                              placeholder={isAr ? 'أدخل اسماً للصفحة...' : 'E.g. Brave Little Lion...'}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:outline-hidden text-right"
                            />
                          </div>

                          {/* Title Font Size Selector */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-xs text-brand-600 font-bold">{titleSize}px</span>
                              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                                {isAr ? 'حجم خط العنوان الرئيسي:' : 'Title Font Size:'}
                              </label>
                            </div>
                            <div className="grid grid-cols-6 gap-1">
                              {[14, 18, 22, 28, 36, 44].map((sz) => (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => {
                                    setTitleSize(sz);
                                    updatePageParam({ titleSize: sz });
                                  }}
                                  className={`py-1.5 text-[11px] font-bold rounded-lg transition border ${
                                    titleSize === sz
                                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {sz}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Title Color Picker */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold text-right">
                              {isAr ? 'لون خط العنوان:' : 'Title Color:'}
                            </label>
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {[
                                  { color: '#0f172a', name: 'أسود' },
                                  { color: '#1e3a8a', name: 'أزرق داكن' },
                                  { color: '#dc2626', name: 'أحمر' },
                                  { color: '#15803d', name: 'أخضر' },
                                  { color: '#7c3aed', name: 'بنفسجي' },
                                  { color: '#b45309', name: 'بني' },
                                  { color: '#ea580c', name: 'برتقالي' },
                                  { color: '#ffffff', name: 'أبيض' }
                                ].map((item) => (
                                  <button
                                    key={item.color}
                                    type="button"
                                    onClick={() => {
                                      setTitleColor(item.color);
                                      updatePageParam({ titleColor: item.color });
                                    }}
                                    className={`w-6 h-6 rounded-full border transition-transform ${
                                      titleColor === item.color ? 'scale-110 ring-2 ring-brand-500 ring-offset-1 border-white shadow-xs' : 'border-slate-300'
                                    }`}
                                    style={{ backgroundColor: item.color }}
                                    title={item.name}
                                  />
                                ))}
                              </div>

                              {/* Custom Color Input */}
                              <input
                                type="color"
                                value={titleColor}
                                onChange={(e) => {
                                  setTitleColor(e.target.value);
                                  updatePageParam({ titleColor: e.target.value });
                                }}
                                className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                                title={isAr ? 'اختر لوناً مخصصاً للعنوان' : 'Pick custom color'}
                              />
                            </div>
                          </div>

                          {/* Title Independent Position Selector */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold text-right">
                              {isAr ? 'موقع العنوان على الصفحة (منفصل):' : 'Title Position on Sheet (Independent):'}
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {[
                                { pos: 'top-right', labelAr: '↗️ أعلى اليمين', labelEn: 'Top Right' },
                                { pos: 'top', labelAr: '⬆️ أعلى الوسط', labelEn: 'Top Center' },
                                { pos: 'top-left', labelAr: '↖️ أعلى اليسار', labelEn: 'Top Left' },
                                { pos: 'middle', labelAr: '↕️ المنتصف', labelEn: 'Center Overlay' },
                                { pos: 'bottom-right', labelAr: '↘️ أسفل اليمين', labelEn: 'Bottom Right' },
                                { pos: 'bottom', labelAr: '⬇️ أسفل الوسط', labelEn: 'Bottom Center' },
                                { pos: 'bottom-left', labelAr: '↙️ أسفل اليسار', labelEn: 'Bottom Left' }
                              ].map((item) => (
                                <button
                                  key={item.pos}
                                  type="button"
                                  onClick={() => {
                                    const p = item.pos as any;
                                    setTitlePosition(p);
                                    updatePageParam({ titlePosition: p });
                                  }}
                                  className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition border text-center ${
                                    titlePosition === item.pos
                                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {isAr ? item.labelAr : item.labelEn}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Title Background Box Toggle */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className="text-xs font-sans text-slate-600 font-semibold">
                              {isAr ? 'خلفية بيضاء مظللة خلف العنوان:' : 'White card background behind title:'}
                            </span>
                            <input
                              type="checkbox"
                              checked={titleBgCard}
                              onChange={(e) => {
                                setTitleBgCard(e.target.checked);
                                updatePageParam({ titleBgCard: e.target.checked });
                              }}
                              className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* SUB-TAB 2: STORY/GUIDE TEXT CONTROLS */}
                      {textControlSubTab === 'story' && (
                        <div className="space-y-3.5 animate-fade-in">
                          {/* Text Content Area */}
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1 text-right">
                              {isAr ? 'النص التوجيهي أو القصة المصاحبة:' : 'Syllabus Story / Instruction Text:'}
                            </label>
                            <textarea
                              rows={2}
                              value={customText}
                              onChange={(e) => {
                                setCustomText(e.target.value);
                                updatePageParam({ textContent: e.target.value });
                              }}
                              placeholder={isAr ? 'اكتب نصاً للصفحة...' : 'Explain the drawing details...'}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:outline-hidden resize-none leading-relaxed text-right"
                            />
                          </div>

                          {/* Text Font Size Selector */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-xs text-brand-600 font-bold">{textSize}px</span>
                              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                                {isAr ? 'حجم خط النص التوجيهي:' : 'Body Text Size:'}
                              </label>
                            </div>
                            <div className="grid grid-cols-5 gap-1">
                              {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32].map((sz) => (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => {
                                    setTextSize(sz);
                                    updatePageParam({ textSize: sz });
                                  }}
                                  className={`py-1.5 text-[10px] font-bold rounded-lg transition border ${
                                    textSize === sz
                                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {sz}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Line Height Control */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold text-right">
                              {isAr ? 'تباعد الأسطر (Line Spacing):' : 'Line Height:'}
                            </label>
                            <div className="grid grid-cols-5 gap-1">
                              {[
                                { val: 1.0, label: '1.0' },
                                { val: 1.3, label: '1.3' },
                                { val: 1.6, label: '1.6' },
                                { val: 1.9, label: '1.9' },
                                { val: 2.2, label: '2.2' },
                              ].map((lh) => (
                                <button
                                  key={lh.val}
                                  type="button"
                                  onClick={() => {
                                    updatePageParam({ lineHeight: lh.val });
                                  }}
                                  className={`py-1 text-[10px] font-bold rounded-lg transition border ${
                                    (activePage.lineHeight || 1.6) === lh.val
                                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {lh.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Text Color Picker */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold text-right">
                              {isAr ? 'لون النص التوجيهي:' : 'Body Text Color:'}
                            </label>
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {[
                                  { color: '#334155', name: 'رمادي داكن' },
                                  { color: '#0f172a', name: 'أسود' },
                                  { color: '#1e3a8a', name: 'أزرق داكن' },
                                  { color: '#dc2626', name: 'أحمر' },
                                  { color: '#15803d', name: 'أخضر' },
                                  { color: '#7c3aed', name: 'بنفسجي' },
                                  { color: '#b45309', name: 'بني' },
                                  { color: '#ffffff', name: 'أبيض' }
                                ].map((item) => (
                                  <button
                                    key={item.color}
                                    type="button"
                                    onClick={() => {
                                      setTextColor(item.color);
                                      updatePageParam({ textColor: item.color });
                                    }}
                                    className={`w-6 h-6 rounded-full border transition-transform ${
                                      textColor === item.color ? 'scale-110 ring-2 ring-brand-500 ring-offset-1 border-white shadow-xs' : 'border-slate-300'
                                    }`}
                                    style={{ backgroundColor: item.color }}
                                    title={item.name}
                                  />
                                ))}
                              </div>

                              {/* Custom Color Input */}
                              <input
                                type="color"
                                value={textColor}
                                onChange={(e) => {
                                  setTextColor(e.target.value);
                                  updatePageParam({ textColor: e.target.value });
                                }}
                                className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                                title={isAr ? 'اختر لوناً مخصصاً للنص' : 'Pick custom color'}
                              />
                            </div>
                          </div>

                          {/* Text Independent Position Selector */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold text-right">
                              {isAr ? 'موقع النص التوجيهي على الصفحة (منفصل):' : 'Story Text Position on Sheet (Independent):'}
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {[
                                { pos: 'top-right', labelAr: '↗️ أعلى اليمين', labelEn: 'Top Right' },
                                { pos: 'top', labelAr: '⬆️ أعلى الوسط', labelEn: 'Top Center' },
                                { pos: 'top-left', labelAr: '↖️ أعلى اليسار', labelEn: 'Top Left' },
                                { pos: 'middle', labelAr: '↕️ المنتصف', labelEn: 'Center Overlay' },
                                { pos: 'bottom-right', labelAr: '↘️ أسفل اليمين', labelEn: 'Bottom Right' },
                                { pos: 'bottom', labelAr: '⬇️ أسفل الوسط', labelEn: 'Bottom Center' },
                                { pos: 'bottom-left', labelAr: '↙️ أسفل اليسار', labelEn: 'Bottom Left' }
                              ].map((item) => (
                                <button
                                  key={item.pos}
                                  type="button"
                                  onClick={() => {
                                    const p = item.pos as any;
                                    setTextPosition(p);
                                    updatePageParam({ textPosition: p });
                                  }}
                                  className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition border text-center ${
                                    textPosition === item.pos
                                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {isAr ? item.labelAr : item.labelEn}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Text Background Box Toggle */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className="text-xs font-sans text-slate-600 font-semibold">
                              {isAr ? 'خلفية بيضاء مظللة خلف النص:' : 'White card background behind text:'}
                            </span>
                            <input
                              type="checkbox"
                              checked={textBgCard}
                              onChange={(e) => {
                                setTextBgCard(e.target.checked);
                                updatePageParam({ textBgCard: e.target.checked });
                              }}
                              className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* SUB-TAB 3: EXTRA CUSTOM TEXT CONTROLS */}
                      {textControlSubTab === 'extra' && (
                        <div className="space-y-3.5 animate-fade-in">
                          {/* Extra Text Input Area */}
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1 text-right">
                              {isAr ? 'نص إضافي مخصص (ملاحظات / اسم الطفل / تعليمات):' : 'Extra Custom Text:'}
                            </label>
                            <textarea
                              rows={2}
                              value={extraText}
                              onChange={(e) => {
                                setExtraText(e.target.value);
                                updatePageParam({ extraText: e.target.value });
                              }}
                              placeholder={isAr ? 'مثال: "اسم المبدع الصغير: ..."' : 'E.g. "Coloring by Little Artist..."'}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:outline-hidden resize-none leading-relaxed text-right font-medium"
                            />
                          </div>

                          {/* Extra Text Size Selector */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-xs text-brand-600 font-bold">{extraTextSize}px</span>
                              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                                {isAr ? 'حجم الخط للنص الإضافي:' : 'Extra Text Size:'}
                              </label>
                            </div>
                            <div className="grid grid-cols-6 gap-1">
                              {[12, 14, 18, 24, 32, 40].map((sz) => (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => {
                                    setExtraTextSize(sz);
                                    updatePageParam({ extraTextSize: sz });
                                  }}
                                  className={`py-1.5 text-[11px] font-bold rounded-lg transition border ${
                                    extraTextSize === sz
                                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {sz}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Extra Text Color Picker */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold text-right">
                              {isAr ? 'لون النص الإضافي:' : 'Extra Text Color:'}
                            </label>
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {[
                                  { color: '#2563eb', name: 'أزرق' },
                                  { color: '#0f172a', name: 'أسود' },
                                  { color: '#dc2626', name: 'أحمر' },
                                  { color: '#16a34a', name: 'أخضر' },
                                  { color: '#9333ea', name: 'بنفسجي' },
                                  { color: '#d97706', name: 'ذهبي' },
                                  { color: '#e11d48', name: 'وردي' },
                                  { color: '#ffffff', name: 'أبيض' }
                                ].map((item) => (
                                  <button
                                    key={item.color}
                                    type="button"
                                    onClick={() => {
                                      setExtraTextColor(item.color);
                                      updatePageParam({ extraTextColor: item.color });
                                    }}
                                    className={`w-6 h-6 rounded-full border transition-transform ${
                                      extraTextColor === item.color ? 'scale-110 ring-2 ring-brand-500 ring-offset-1 border-white shadow-xs' : 'border-slate-300'
                                    }`}
                                    style={{ backgroundColor: item.color }}
                                    title={item.name}
                                  />
                                ))}
                              </div>

                              {/* Custom Color Input */}
                              <input
                                type="color"
                                value={extraTextColor}
                                onChange={(e) => {
                                  setExtraTextColor(e.target.value);
                                  updatePageParam({ extraTextColor: e.target.value });
                                }}
                                className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                                title={isAr ? 'اختر لوناً مخصصاً' : 'Pick custom color'}
                              />
                            </div>
                          </div>

                          {/* Extra Text Position Selector */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold text-right">
                              {isAr ? 'موقع ومكان النص الإضافي:' : 'Extra Text Location:'}
                            </label>
                            <div className="grid grid-cols-2 gap-1">
                              {[
                                { pos: 'top-right', label: '↗️ أعلى اليمين' },
                                { pos: 'top', label: '⬆️ أعلى الوسط' },
                                { pos: 'top-left', label: '↖️ أعلى اليسار' },
                                { pos: 'middle', label: '↕️ المنتصف' },
                                { pos: 'bottom-right', label: '↘️ أسفل اليمين' },
                                { pos: 'bottom', label: '⬇️ أسفل الوسط' },
                                { pos: 'bottom-left', label: '↙️ أسفل اليسار' }
                              ].map((item) => (
                                <button
                                  key={item.pos}
                                  type="button"
                                  onClick={() => {
                                    const p = item.pos as any;
                                    setExtraTextPosition(p);
                                    updatePageParam({ extraTextPosition: p });
                                  }}
                                  className={`py-1.5 px-1 text-[10px] font-bold rounded-lg transition border text-center ${
                                    extraTextPosition === item.pos
                                      ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Extra Text Background Box Toggle */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className="text-xs font-sans text-slate-600 font-semibold">
                              {isAr ? 'إحاطة النص الإضافي ببطاقة مظللة:' : 'Card background for extra text:'}
                            </span>
                            <input
                              type="checkbox"
                              checked={extraTextBgCard}
                              onChange={(e) => {
                                setExtraTextBgCard(e.target.checked);
                                updatePageParam({ extraTextBgCard: e.target.checked });
                              }}
                              className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                            />
                          </div>
                        </div>
                      )}
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
                  )
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

      <PdfImportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

      <ImageCropAndRemoveBgModal
        isOpen={isCropModalOpen}
        onClose={() => {
          setIsCropModalOpen(false);
          setEditingImageId(null);
        }}
        imageUrl={cropImageSrc || activePage?.illustrationUrl || ''}
        isAr={isAr}
        onApply={(newImageDataUrl) => {
          if (activePage) {
            handleAddOrUpdateImage(newImageDataUrl, editingImageId);
            setEditingImageId(null);
            addNotification('success', isAr ? 'تم حفظ وتحديث الصورة وتفريغ خلفيتها بنجاح!' : 'Image cropped & applied successfully!');
          }
        }}
      />

    </div>
  );
}
