import React, { useState, useRef } from 'react';
import { GradientButton } from './';

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  onImageRemove: () => void;
  preview: string | null;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  preview,
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelect(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  if (preview) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden border border-white/10">
        <img
          src={preview}
          alt="Preview"
          className="w-full h-64 object-cover"
        />
        <button
          onClick={onImageRemove}
          disabled={disabled}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center text-white transition-colors disabled:opacity-50"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full rounded-xl border-2 border-dashed transition-colors ${
        dragActive
          ? 'border-purple-500 bg-purple-500/10'
          : 'border-white/20 bg-white/5'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
      <div className="p-8 text-center">
        <div className="text-4xl mb-3">📷</div>
        <p className="text-sm text-gray-400 mb-2">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-500">
          PNG, JPG, GIF up to 5MB
        </p>
      </div>
    </div>
  );
};
