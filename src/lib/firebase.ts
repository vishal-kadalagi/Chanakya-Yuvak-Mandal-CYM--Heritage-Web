import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { compressImage } from "../utils/imageCompressor";

// Firebase Configuration (Loaded dynamically via Environment Variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_DEMO_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cym-public-website.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cym-public-website",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cym-public-website.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "112373466897",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:112373466897:web:demo",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-535W5L2DYC",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Cloudinary Configuration (Loaded dynamically via Environment Variables)
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo",
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "demo_preset",
};

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
}

// Cloudinary Limits: Free accounts hard-cap individual video uploads at exactly 100 MB (104,857,600 bytes)
export const MAX_CLOUDINARY_BYTES = 104857600; // 100 MB
const CHUNK_THRESHOLD_BYTES = 15 * 1024 * 1024; // 15 MB: use chunked upload for resilience
const CHUNK_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB chunk size

/**
 * Upload single chunk to Cloudinary REST API
 */
function uploadSingleChunk(
  chunkBlob: Blob,
  endpoint: string,
  uniqueId: string,
  contentRange: string,
  onChunkProgress?: (loaded: number, total: number) => void
): Promise<CloudinaryUploadResponse> {
  const formData = new FormData();
  formData.append('file', chunkBlob);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', 'cym_media');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);
    xhr.setRequestHeader('X-Unique-Upload-Id', uniqueId);
    xhr.setRequestHeader('Content-Range', contentRange);

    if (xhr.upload && onChunkProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onChunkProgress(e.loaded, e.total);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const resp = JSON.parse(xhr.responseText);
          resolve(resp);
        } catch (e) {
          reject(new Error('Failed to parse Cloudinary chunk response: ' + (e as Error).message));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData.error?.message || `Chunk upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Chunk upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during chunk upload. Retrying...'));
    };

    xhr.send(formData);
  });
}

/**
 * Upload large file to Cloudinary in sequential chunks with automatic retries
 */
async function uploadChunkedToCloudinary(
  file: File,
  endpoint: string,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResponse> {
  const uniqueId = `cym_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const totalSize = file.size;
  const totalChunks = Math.ceil(totalSize / CHUNK_SIZE_BYTES);
  let finalResponse: CloudinaryUploadResponse | null = null;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE_BYTES;
    const end = Math.min(start + CHUNK_SIZE_BYTES, totalSize);
    const chunkBlob = file.slice(start, end);
    const contentRange = `bytes ${start}-${end - 1}/${totalSize}`;

    // Retry loop for each chunk (up to 3 retries)
    let chunkSuccess = false;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await uploadSingleChunk(
          chunkBlob,
          endpoint,
          uniqueId,
          contentRange,
          (chunkLoaded, chunkTotal) => {
            if (onProgress) {
              const currentOverallLoaded = start + (chunkLoaded / chunkTotal) * (end - start);
              const percent = Math.min(99, Math.round((currentOverallLoaded / totalSize) * 100));
              onProgress(percent);
            }
          }
        );

        if (i === totalChunks - 1) {
          finalResponse = result;
        }
        chunkSuccess = true;
        break;
      } catch (err) {
        lastError = err as Error;
        // Stop retrying if Cloudinary explicitly rejects with account-level file size limit
        if (
          lastError.message.includes('File size too large') ||
          lastError.message.includes('Maximum is')
        ) {
          throw lastError;
        }
        if (attempt < 3) {
          await new Promise((res) => setTimeout(res, 1200 * attempt));
        }
      }
    }

    if (!chunkSuccess) {
      throw lastError || new Error(`Failed to upload chunk ${i + 1}/${totalChunks}`);
    }
  }

  onProgress?.(100);
  if (!finalResponse) {
    throw new Error('Upload finished but did not receive final Cloudinary asset metadata.');
  }
  return finalResponse;
}

/**
 * Upload an image or video file directly to Cloudinary using unsigned preset.
 * Automatically utilizes chunked upload for files >= 15 MB.
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; publicId: string; mediaType: 'image' | 'video' }> {
  const isVideo = file.type.startsWith('video/');

  // Check 100 MB ceiling early with helpful message
  if (file.size > MAX_CLOUDINARY_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `ಫೈಲ್ ಗಾತ್ರ ಮೀರಿದೆ (${sizeMB} MB). Cloudinary ಉಚಿತ ಪ್ಲಾನ್‌ನಲ್ಲಿ ಗರಿಷ್ಠ 100 MB ವರೆಗೆ ಮಾತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು. ದಯವಿಟ್ಟು ವೀಡಿಯೊವನ್ನು ಕುಗ್ಗಿಸಿ (Compress) ಅಥವಾ YouTube ಲಿಂಕ್ ಬಳಸಿ.`
    );
  }

  // Smart Pre-Compression: Shrink large photos to ~250KB before upload
  let fileToUpload = file;
  if (!isVideo) {
    try {
      fileToUpload = await compressImage(file, 1920, 0.85);
    } catch (compressionErr) {
      console.warn('Pre-upload compression skipped, using original:', compressionErr);
    }
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${isVideo ? 'video' : 'image'}/upload`;

  // For large files (>= 15 MB), use chunked upload
  if (fileToUpload.size >= CHUNK_THRESHOLD_BYTES) {
    const resp = await uploadChunkedToCloudinary(fileToUpload, endpoint, onProgress);
    return {
      url: resp.secure_url,
      publicId: resp.public_id,
      mediaType: isVideo ? 'video' : 'image',
    };
  }

  // Standard direct upload for files under 15 MB
  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', 'cym_media');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
          resolve({
            url: response.secure_url,
            publicId: response.public_id,
            mediaType: isVideo ? 'video' : 'image',
          });
        } catch (err) {
          reject(new Error('Failed to parse Cloudinary response: ' + (err as Error).message));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData.error?.message || `Cloudinary upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during Cloudinary upload. Please check your internet connection.'));
    };

    xhr.send(formData);
  });
}

