"use client";

import React, { useState } from "react";
import { Eye, Download, X } from "lucide-react";

interface TableImageProps {
  src?: string;
  alt?: string;
  fallbackText?: string;
  className?: string;
}

export function TableImage({
  src,
  alt = "Image",
  fallbackText,
  className = "h-12 w-12",
}: TableImageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!src) return;
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = alt;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, "_blank");
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxOpen(true);
  };

  return (
    <>
      <div
        className={`relative group rounded overflow-hidden bg-muted border border-border flex-shrink-0 ${className}`}
      >
        {src ? (
          <>
            <img src={src} alt={alt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={handleView}
                className="p-1 bg-white/20 hover:bg-white/40 rounded transition-colors"
                title="View"
              >
                <Eye className="h-3 w-3 text-white" />
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="p-1 bg-white/20 hover:bg-white/40 rounded transition-colors"
                title="Download"
              >
                <Download className="h-3 w-3 text-white" />
              </button>
            </div>
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-primary/10 dark:bg-primary/20">
            <span className="text-xs font-semibold text-primary">
              {fallbackText?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[300] bg-black/92 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 bg-white/10 hover:bg-white/25 rounded-full transition-colors"
              title="Download"
            >
              <Download className="h-5 w-5 text-white" />
            </button>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 bg-white/10 hover:bg-white/25 rounded-full transition-colors"
              title="Close"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
          <img
            src={src}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
