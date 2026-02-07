/**
 * Image Display Component (ENH-4: Path C)
 *
 * Renders image thumbnails within chat messages.
 * Supports click-to-expand and evidence type badge.
 *
 * FIX (Session 19): Images are fetched with auth headers and rendered as blob URLs
 * since the /url endpoint requires Bearer token authentication.
 */

import { useState, useEffect } from 'react';

export interface ChatImage {
  id: string;
  url: string;
  filename: string;
  evidenceType: string;
  caption?: string;
}

interface ImageDisplayProps {
  images: ChatImage[];
  token?: string; // Auth token for fetching images
}

const EVIDENCE_COLORS: Record<string, string> = {
  CHECKPOINT: 'bg-blue-500/20 text-blue-300',
  GATE_PROOF: 'bg-green-500/20 text-green-300',
  SCREENSHOT: 'bg-amber-500/20 text-amber-300',
  DIAGRAM: 'bg-purple-500/20 text-purple-300',
  GENERAL: 'bg-gray-500/20 text-gray-300',
};

export function ImageDisplay({ images, token }: ImageDisplayProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});

  // Fetch images with auth and create blob URLs
  useEffect(() => {
    if (!token || !images.length) return;

    const controller = new AbortController();
    const fetchImages = async () => {
      const urls: Record<string, string> = {};
      const errors: Record<string, boolean> = {};

      await Promise.all(
        images.map(async (img) => {
          try {
            const response = await fetch(img.url, {
              headers: { Authorization: `Bearer ${token}` },
              signal: controller.signal,
            });
            if (response.ok) {
              const blob = await response.blob();
              urls[img.id] = URL.createObjectURL(blob);
            } else {
              errors[img.id] = true;
            }
          } catch {
            errors[img.id] = true;
          }
        })
      );

      setBlobUrls(urls);
      setLoadErrors(errors);
    };

    fetchImages();

    return () => {
      controller.abort();
      // Cleanup blob URLs
      Object.values(blobUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images, token]);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-2">
        {images.map((img) => (
          <div key={img.id} className="relative group cursor-pointer" onClick={() => setExpanded(img.id)}>
            {loadErrors[img.id] ? (
              <div className="w-[100px] h-[75px] bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-400">Load failed</span>
              </div>
            ) : blobUrls[img.id] ? (
              <img
                src={blobUrls[img.id]}
                alt={img.caption || img.filename}
                className="max-w-[200px] max-h-[150px] object-cover rounded-lg border border-gray-600/50"
              />
            ) : (
              <div className="w-[100px] h-[75px] bg-gray-700 rounded-lg flex items-center justify-center animate-pulse">
                <span className="text-xs text-gray-400">Loading...</span>
              </div>
            )}
            <div
              className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-medium ${
                EVIDENCE_COLORS[img.evidenceType] || EVIDENCE_COLORS.GENERAL
              }`}
            >
              {img.evidenceType}
            </div>
            {img.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-xs text-gray-200 px-2 py-1 rounded-b-lg truncate">
                {img.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setExpanded(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const img = images.find((i) => i.id === expanded);
              if (!img) return null;
              const imgSrc = blobUrls[img.id];
              return (
                <>
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={img.caption || img.filename}
                      className="max-w-full max-h-[85vh] object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-64 h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">Image not available</span>
                    </div>
                  )}
                  <div className="mt-2 text-center">
                    {img.caption && <p className="text-sm text-gray-300">{img.caption}</p>}
                    <p className="text-xs text-gray-500 mt-1">{img.filename}</p>
                  </div>
                  <button
                    onClick={() => setExpanded(null)}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-600"
                  >
                    x
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}

export default ImageDisplay;
