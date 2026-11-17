/**
 * Universal Client-Side Image Optimizer for Chanakya Yuvak Mandal
 * 
 * Automatically compresses large smartphone camera photos (5MB - 15MB)
 * down to crisp, optimized Full HD images (~180KB - 350KB) before uploading
 * to Cloudinary. Saves up to 96% of free storage quota!
 */
export async function compressImage(
  file: File,
  maxDimension = 1920,
  quality = 0.85
): Promise<File> {
  // If it's not an image (e.g. video) or is SVG/GIF, return as-is
  if (
    !file.type.startsWith('image/') ||
    file.type === 'image/svg+xml' ||
    file.type === 'image/gif'
  ) {
    return file;
  }

  // If already under 250KB, no need to compress further
  if (file.size <= 250 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Proportional scale down to maxDimension (default 1920px Full HD)
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as optimized JPEG
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compressed size is larger, keep original file
              resolve(file);
              return;
            }

            const cleanName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
            const optimizedFile = new File([blob], cleanName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            console.log(
              `⚡ Storage Saved: Compressed ${(file.size / 1024 / 1024).toFixed(2)} MB -> ${(
                optimizedFile.size / 1024
              ).toFixed(1)} KB (${Math.round((1 - optimizedFile.size / file.size) * 100)}% quota saved)`
            );

            resolve(optimizedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
