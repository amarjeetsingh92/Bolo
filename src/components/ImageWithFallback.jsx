import React, { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";

export default function ImageWithFallback({
  src,
  alt = "",
  className = "",
  aspectRatio = "aspect-square",
  priority = false
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Critical fix: Reset error and loading state whenever the image src changes!
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  if (hasError || !src) {
    return (
      <div
        className={`fallback-box flex flex-col items-center justify-center p-6 text-center select-none bg-slate-100 ${aspectRatio} ${className}`}
        style={{
          borderRadius: "1.25rem",
        }}
      >
        <ImageIcon className="w-12 h-12 text-slate-400 mb-2 animate-pulse" />
        <span className="text-xs font-semibold text-slate-500">
          Loading picture...
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
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        loading={priority ? "eager" : "lazy"}
        onLoad={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
