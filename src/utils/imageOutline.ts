/**
 * Converts a color image URL into a high-contrast black & white line-art outline Data URL.
 * Works seamlessly with html2canvas and direct window printing.
 */
export async function generateColoringOutline(imageUrl: string, threshold = 35): Promise<string> {
  if (!imageUrl) return '';

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || img.width || 800;
        const h = img.naturalHeight || img.height || 800;
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imageUrl);

        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Step 1: Grayscale + Box Blur Smoothing
        const gray = new Uint8ClampedArray(w * h);
        for (let i = 0; i < data.length; i += 4) {
          gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }

        const smoothed = new Uint8ClampedArray(w * h);
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            smoothed[idx] = (
              gray[idx - w - 1] + gray[idx - w] + gray[idx - w + 1] +
              gray[idx - 1]     + gray[idx]     + gray[idx + 1] +
              gray[idx + w - 1] + gray[idx + w] + gray[idx + w + 1]
            ) / 9;
          }
        }

        // Step 2: Sobel Edge Detection
        const edgeBinary = new Uint8ClampedArray(w * h);
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            const gx =
              -1 * smoothed[(y - 1) * w + (x - 1)] + 1 * smoothed[(y - 1) * w + (x + 1)] +
              -2 * smoothed[y * w + (x - 1)]       + 2 * smoothed[y * w + (x + 1)] +
              -1 * smoothed[(y + 1) * w + (x - 1)] + 1 * smoothed[(y + 1) * w + (x + 1)];

            const gy =
              -1 * smoothed[(y - 1) * w + (x - 1)] - 2 * smoothed[(y - 1) * w + x] - 1 * smoothed[(y - 1) * w + (x + 1)] +
               1 * smoothed[(y + 1) * w + (x - 1)] + 2 * smoothed[(y + 1) * w + x] + 1 * smoothed[(y + 1) * w + (x + 1)];

            const grad = Math.sqrt(gx * gx + gy * gy);
            edgeBinary[idx] = grad > (threshold * 1.5) ? 1 : 0;
          }
        }

        // Step 3: Despeckle & Gap Closure
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
              isLine = neighbors >= 2;
            } else {
              isLine = neighbors >= 5;
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
          outData[topIdx] = outData[topIdx + 1] = outData[topIdx + 2] = 255; outData[topIdx + 3] = 255;
          outData[botIdx] = outData[botIdx + 1] = outData[botIdx + 2] = 255; outData[botIdx + 3] = 255;
        }
        for (let y = 0; y < h; y++) {
          const leftIdx = y * w * 4;
          const rightIdx = (y * w + w - 1) * 4;
          outData[leftIdx] = outData[leftIdx + 1] = outData[leftIdx + 2] = 255; outData[leftIdx + 3] = 255;
          outData[rightIdx] = outData[rightIdx + 1] = outData[rightIdx + 2] = 255; outData[rightIdx + 3] = 255;
        }

        ctx.putImageData(output, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        console.warn('Failed to convert image to outline:', e);
        resolve(imageUrl);
      }
    };

    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
}
