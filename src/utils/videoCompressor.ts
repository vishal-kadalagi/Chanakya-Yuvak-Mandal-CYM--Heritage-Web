/**
 * In-browser Video Compressor for Chanakya Yuvak Mandal Public Website & Admin Dashboard
 * Compresses oversized phone/camera recordings (100MB - 500MB+) into crisp, web-optimized 720p/1080p
 * videos under 50-80 MB so they upload smoothly to Cloudinary without exceeding the 100 MB limit.
 */

export interface CompressionOptions {
  maxDimension?: number;
  targetBitrate?: number;
  onProgress?: (percent: number) => void;
}

export async function compressVideoInBrowser(
  file: File,
  options?: CompressionOptions
): Promise<File> {
  const maxDimension = options?.maxDimension || 1280; // 720p HD (fast and compact)
  const targetBitrate = options?.targetBitrate || 2500000; // 2.5 Mbps crisp web quality
  const onProgress = options?.onProgress;

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadedmetadata = async () => {
      try {
        let width = video.videoWidth || 1280;
        let height = video.videoHeight || 720;

        // Downscale maintaining aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        // Ensure even dimensions
        width = width % 2 === 0 ? width : width - 1;
        height = height % 2 === 0 ? height : height - 1;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          throw new Error('Canvas 2D context unavailable');
        }

        const stream = canvas.captureStream(30);

        // Capture audio from video if present
        let audioCtx: AudioContext | null = null;
        try {
          const AudioCtxClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioCtxClass) {
            audioCtx = new AudioCtxClass();
            const source = audioCtx.createMediaElementSource(video);
            const dest = audioCtx.createMediaStreamDestination();
            source.connect(dest);
            const audioTracks = dest.stream.getAudioTracks();
            if (audioTracks.length > 0) {
              stream.addTrack(audioTracks[0]);
            }
          }
        } catch (audioErr) {
          console.warn('Audio capture bypassed for video compression:', audioErr);
        }

        // Determine best supported codec
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp8';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4';
        }

        const recorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
          videoBitsPerSecond: targetBitrate,
        });

        const recordedChunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunks.push(e.data);
          }
        };

        let isRunning = true;
        const renderLoop = () => {
          if (!isRunning) return;
          ctx.drawImage(video, 0, 0, width, height);
          if (onProgress && video.duration) {
            const p = Math.min(99, Math.round((video.currentTime / video.duration) * 100));
            onProgress(p);
          }
          requestAnimationFrame(renderLoop);
        };

        recorder.onstop = () => {
          URL.revokeObjectURL(objectUrl);
          audioCtx?.close().catch(() => {});
          const finalBlob = new Blob(recordedChunks, { type: recorder.mimeType || 'video/webm' });
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const extension = recorder.mimeType?.includes('mp4') ? '.mp4' : '.webm';
          const compressedFile = new File([finalBlob], `${baseName}-web-hd${extension}`, {
            type: finalBlob.type,
            lastModified: Date.now(),
          });
          onProgress?.(100);
          resolve(compressedFile);
        };

        recorder.start(1000);
        renderLoop();

        video.onended = () => {
          isRunning = false;
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        };

        video.onerror = (e) => {
          isRunning = false;
          if (recorder.state === 'recording') recorder.stop();
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Video playback error during compression: ' + e));
        };

        await video.play();
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read video file for compression: ' + e));
    };
  });
}
