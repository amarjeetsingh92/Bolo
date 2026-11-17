import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Volume2 } from "lucide-react";

export default function ImageWithFallback({
  src,
  alt = "",
  className = "",
  aspectRatio = "aspect-square",
  priority = false,
  fallbackSrc
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  // Reset state whenever the source prop changes
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
    setHasTriedFallback(false);
  }, [src]);

  const handleImageError = () => {
    // If we haven't tried the fallbackSrc yet and one is provided, try it!
    if (!hasTriedFallback && fallbackSrc && fallbackSrc !== currentSrc) {
      setHasTriedFallback(true);
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
      return;
    }

    // Both failed or no fallback available
    setIsLoading(false);
    setHasError(true);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  if (hasError || !currentSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-6 text-center select-none bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-200 ${aspectRatio} ${className}`}
        style={{ borderRadius: "1.25rem" }}
      >
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-2 shadow-sm">
          <ImageIcon className="w-7 h-7 text-amber-500" />
        </div>
        <span className="text-base font-extrabold text-amber-900 tracking-tight">
          {alt || "Learning Word"}
        </span>
        <span className="text-[11px] font-semibold text-amber-600/80 mt-1 flex items-center gap-1">
          <Volume2 className="w-3 h-3" /> Tap to hear pronunciation
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 skeleton-shimmer flex items-center justify-center bg-slate-100 z-10">
          <ImageIcon className="w-8 h-8 text-slate-300 animate-pulse" />
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
