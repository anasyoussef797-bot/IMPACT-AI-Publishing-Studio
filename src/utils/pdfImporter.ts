import * as pdfjsLib from 'pdfjs-dist';

// Set worker source to CDN to avoid bundler worker configuration complexities
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface ParsedPdfPage {
  pageNumber: number;
  title: string;
  imageDataUrl: string;
}

export async function parsePdfFile(file: File, onProgress?: (current: number, total: number) => void): Promise<ParsedPdfPage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const parsedPages: ParsedPdfPage[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (onProgress) {
      onProgress(i, totalPages);
    }
    const page = await pdf.getPage(i);
    
    // Scale up for high DPI print quality (2.0 scale)
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
      canvas: canvas as unknown as HTMLCanvasElement
    }).promise;

    const imageDataUrl = canvas.toDataURL('image/png');

    parsedPages.push({
      pageNumber: i,
      title: `صفحة المجلد ${i}`,
      imageDataUrl,
    });
  }

  return parsedPages;
}
