/**
 * Image Upload Component (ENH-4: Path C)
 *
 * Allows users to attach images to chat messages.
 * Validates file type/size, shows preview, supports evidence classification.
 */

import { useState, useRef } from 'react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export type EvidenceType = 'GENERAL' | 'CHECKPOINT' | 'GATE_PROOF' | 'SCREENSHOT' | 'DIAGRAM';

export interface PendingImage {
  file: File;
  preview: string;
  evidenceType: EvidenceType;
  caption: string;
}

interface ImageUploadProps {
  images: PendingImage[];
  onAdd: (image: PendingImage) => void;
  onRemove: (index: number) => void;
  onClear: () => void;
  disabled?: boolean;
  maxImages?: number;
}

const EVIDENCE_LABELS: Record<EvidenceType, string> = {
  GENERAL: 'General',
  CHECKPOINT: 'Checkpoint',
  GATE_PROOF: 'Gate Proof',
  SCREENSHOT: 'Screenshot',
  DIAGRAM: 'Diagram',
};

export function ImageUpload({
  images,
  onAdd,
  onRemove,
  onClear,
  disabled = false,
  maxImages = 5,
}: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Unsupported type: ${file.type}`);
      return;
    }

    if (file.size > MAX_SIZE) {
      setError(`File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB (max 10 MB)`);
      return;
    }

    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const preview = URL.createObjectURL(file);
    onAdd({ file, preview, evidenceType: 'GENERAL', caption: '' });

    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      {/* Attached images row */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img.preview}
                alt={img.file.name}
                className="w-16 h-16 object-cover rounded-lg border border-gray-600"
              />
              <button
                onClick={() => onRemove(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove"
              >
                x
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-gray-300 text-center py-0.5 rounded-b-lg truncate px-1">
                {EVIDENCE_LABELS[img.evidenceType]}
              </div>
            </div>
          ))}

          {images.length > 1 && (
            <button
              onClick={onClear}
              className="text-xs text-gray-500 hover:text-red-400 self-center ml-1"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-xs text-red-400 mb-1">{error}</div>
      )}

      {/* Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || images.length >= maxImages}
        className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title="Attach image"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Image
        {images.length > 0 && <span className="text-gray-500">({images.length})</span>}
      </button>
    </div>
  );
}

export default ImageUpload;
