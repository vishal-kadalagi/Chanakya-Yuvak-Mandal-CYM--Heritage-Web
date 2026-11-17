import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Check,
  RefreshCw,
  Crop,
} from 'lucide-react';

interface PhotoCropAdjustModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onApplyCrop: (croppedFile: File, previewUrl: string) => void;
  initialMemberName?: string;
}

export const PhotoCropAdjustModal: React.FC<PhotoCropAdjustModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onApplyCrop,
  initialMemberName = 'Member',
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset adjustments whenever a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  // Mouse / Touch Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore pointer release errors
    }
  };

  // Zoom handlers
  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(0.6, prev + delta), 4));
  };

  // Rotate 90 degrees
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset to original center
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Generate cropped high-res square/circle avatar file
  const handleConfirmCrop = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;

    // Ensure image is fully loaded before drawing to canvas
    if (!img.complete || img.naturalWidth === 0) {
      img.onload = () => handleConfirmCrop();
      return;
    }

    setIsProcessing(true);

    try {
      const outputSize = 600; // Crisp 600x600 px high-res portrait
      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill clean transparent/neutral background
      ctx.clearRect(0, 0, outputSize, outputSize);

      // Move to center of canvas
      ctx.save();
      ctx.translate(outputSize / 2, outputSize / 2);

      // Apply User's Rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Determine viewport ratio relative to preview container
      const previewApertureSize = 240; // The on-screen round guide box size in px
      const viewportRatio = outputSize / previewApertureSize;

      // Apply Drag Position Offset
      const scaledOffsetX = position.x * viewportRatio;
      const scaledOffsetY = position.y * viewportRatio;

      // Draw the image scaled
      const baseScale = Math.max(
        previewApertureSize / (img.naturalWidth || 600),
        previewApertureSize / (img.naturalHeight || 600)
      );

      const renderWidth = (img.naturalWidth || 600) * baseScale * scale * viewportRatio;
      const renderHeight = (img.naturalHeight || 600) * baseScale * scale * viewportRatio;

      // If rotation is 90 or 270, adjust swap offsets
      const rad = (rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const drawX = (scaledOffsetX * cos + scaledOffsetY * sin) - renderWidth / 2;
      const drawY = (-scaledOffsetX * sin + scaledOffsetY * cos) - renderHeight / 2;

      ctx.drawImage(img, drawX, drawY, renderWidth, renderHeight);
      ctx.restore();

      // Convert Canvas to High-Res JPEG File
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }

          const safeName = (initialMemberName || 'member').replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'member';
          const croppedFile = new File([blob], `${safeName}_portrait.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          const previewUrl = URL.createObjectURL(blob);
          onApplyCrop(croppedFile, previewUrl);
          setIsProcessing(false);
          onClose();
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.error('Failed to crop photo:', err);
      setIsProcessing(false);
    }
  }, [rotation, scale, position, initialMemberName, onApplyCrop, onClose]);

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-[#121215] border border-amber-400/40 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Crop & Adjust Member Photo
              </h3>
              <p className="text-[11px] text-neutral-400">
                ಫೋಟೋ ಹೊಂದಿಸಿ & ಕ್ರಾಪ್ ಮಾಡಿ • Drag, zoom & rotate to fit perfectly
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Aperture Area */}
        <div className="relative flex flex-col items-center justify-center">
          {/* Main 240px Guide Box */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-60 h-60 sm:w-64 sm:h-64 rounded-full overflow-hidden border-2 border-dashed border-amber-400/80 bg-black shadow-[0_0_30px_rgba(0,0,0,0.8)] cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
            title="Drag to reposition photo"
          >
            {/* The Image under transform */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop Source"
              draggable={false}
              crossOrigin={imageSrc?.startsWith('http') ? 'anonymous' : undefined}
              className="max-w-none pointer-events-none select-none transition-transform duration-75"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            />

            {/* Circular Vignette Overlay */}
            <div className="absolute inset-0 rounded-full border-4 border-amber-400/40 pointer-events-none shadow-inner" />

            {/* Center Reticle Crosshair */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
              <div className="w-8 h-[1px] bg-white" />
              <div className="h-8 w-[1px] bg-white absolute" />
            </div>
          </div>

          <p className="text-[11px] font-mono text-neutral-400 mt-2 flex items-center space-x-1.5">
            <Move className="w-3 h-3 text-amber-400" />
            <span>ಫೋಟೋ ಸರಿಸಲು ಎಳೆಯಿರಿ (Drag to adjust center)</span>
          </p>
        </div>

        {/* Adjust Controls Toolbar */}
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          {/* Zoom Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span className="font-semibold flex items-center space-x-1 text-amber-400">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Zoom / ಗಾತ್ರ:</span>
              </span>
              <span className="font-mono text-[11px] text-neutral-400 font-bold">
                {Math.round(scale * 100)}%
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleZoom(-0.15)}
                className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min="0.6"
                max="3.5"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-neutral-700 rounded-lg"
              />

              <button
                type="button"
                onClick={() => handleZoom(0.15)}
                className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Buttons: Rotate 90, Reset, Center */}
          <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-xs">
            <button
              type="button"
              onClick={handleRotate}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-400" />
              <span>ತಿರುಗಿಸಿ (Rotate 90°)</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ಮರುಹೊಂದಿಸಿ (Reset)</span>
            </button>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmCrop}
            disabled={isProcessing}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isProcessing ? 'Cropping...' : 'Apply & Save Photo (ಹೊಂದಿಸಿ)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
