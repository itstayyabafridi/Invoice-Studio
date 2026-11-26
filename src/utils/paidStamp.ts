export const PAID_STAMP_SRC = '/assets/aistudio/image_15dcf99e.png';

let cachedStampPromise: Promise<string> | null = null;

/**
 * Loads the uploaded PAID stamp image and strips its neutral gray/white
 * checkerboard background so the distressed red rubber stamp renders cleanly
 * with true alpha transparency on both the live A4 preview and PDF export.
 */
export function getCleanPaidStampDataUrl(): Promise<string> {
  if (cachedStampPromise) {
    return cachedStampPromise;
  }

  cachedStampPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(PAID_STAMP_SRC);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const width = img.naturalWidth || 525;
        const height = img.naturalHeight || 380;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(PAID_STAMP_SRC);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a === 0) continue;

          // Checkerboard & distress gaps are neutral grays/whites (R ≈ G ≈ B).
          // Red rubber stamp ink has strong red dominance over green & blue.
          const maxOther = Math.max(g, b);
          const redExcess = r - maxOther;

          if (redExcess <= 14) {
            data[i + 3] = 0;
          } else {
            const strength = Math.min(1, (redExcess - 14) / 165);
            data[i] = Math.min(255, Math.round(215 + 22 * strength));
            data[i + 1] = Math.round(24 - 6 * strength);
            data[i + 2] = Math.round(32 - 8 * strength);
            data[i + 3] = Math.min(255, Math.round(strength * 255));
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(PAID_STAMP_SRC);
      }
    };
    img.onerror = () => resolve(PAID_STAMP_SRC);
    img.src = PAID_STAMP_SRC;
  });

  return cachedStampPromise;
}
