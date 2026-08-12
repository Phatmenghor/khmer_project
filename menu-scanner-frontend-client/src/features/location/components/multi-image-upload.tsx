"use client";

import React, { useRef, useState } from "react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { SmartImage } from "@/components/shared/image/smart-image";
import { Label } from "@/components/ui/label";
import { showToast } from "@/components/shared/common/show-toast";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { uploadImage } from "@/services/spaces-service";
import { AppDefault } from "@/constants/app-resource/default/default";

interface MultiImageUploadProps {
  images: { imageUrl: string }[];
  onAdd: (url: string) => void;
  onRemove: (idx: number) => void;
  disabled?: boolean;
}

export function MultiImageUpload({
  images,
  onAdd,
  onRemove,
  disabled,
}: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const MAX_IMAGES = 5;
  const canAddMore = images.length < MAX_IMAGES && !isUploading;

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;

    if (images.length + files.length > MAX_IMAGES) {
      showToast.warning(`Maximum ${MAX_IMAGES} images allowed`);
    }

    const allowedFiles = files.slice(0, MAX_IMAGES - images.length);
    if (!allowedFiles.length) return;

    setIsUploading(true);

    try {
      for (const file of allowedFiles) {
        const result = await uploadImage(file, AppDefault.BUSINESS_ID);
        if (result?.url) {
          onAdd(result.url);
        }
      }
      showToast.success(`Successfully uploaded ${allowedFiles.length} photo${allowedFiles.length > 1 ? "s" : ""}`);
    } catch (err: any) {
      showToast.error(err.message || "Failed to upload image to DigitalOcean Spaces");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      {lightbox && (
        <div
          className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center backdrop-blur-xs"
          onClick={() => setLightbox(null)}
        >
          <div className="relative w-[90vw] h-[90vh] max-w-3xl">
            <SmartImage
              src={lightbox}
              alt="Preview"
              fill
              showSkeleton={false}
              objectFit="contain"
              containerClassName="rounded-2xl shadow-2xl"
            />
          </div>
          <CustomButton
            variant="unstyled"
            size="unstyled"
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-3 right-3 rounded-full bg-white/20 text-white p-1 hover:bg-white/40 transition-colors"
          >
            <X className="h-4 w-4" />
          </CustomButton>
        </div>
      )}

      <Label className="text-xs font-bold flex items-center gap-1.5">
        <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
        <span>Location Photos</span>
        <span className="text-muted-foreground text-xs font-normal">
          ({images.length}/{MAX_IMAGES})
        </span>
      </Label>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative aspect-square rounded-xl overflow-hidden border border-border/80 bg-muted cursor-pointer hover:opacity-90 transition-opacity shadow-2xs group"
            onClick={() => setLightbox(img.imageUrl)}
          >
            <SmartImage src={img.imageUrl} alt={`Location ${idx + 1}`} fill />
            {!disabled && !isUploading && (
              <CustomButton
                variant="unstyled"
                size="unstyled"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(idx);
                }}
                className="absolute top-1 right-1 rounded-full bg-destructive/90 text-white p-1 hover:bg-destructive transition-colors shadow-2xs opacity-90 group-hover:opacity-100"
              >
                <X className="h-2.5 w-2.5" />
              </CustomButton>
            )}
          </div>
        ))}

        {isUploading && (
          <div className="aspect-square rounded-xl border border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-1 text-primary animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-[10px] font-semibold">Uploading...</span>
          </div>
        )}

        {!disabled && canAddMore && (
          <CustomButton
            variant="unstyled"
            size="unstyled"
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-border/80 hover:border-primary/60 hover:bg-primary/5 flex flex-col items-center justify-center gap-1 transition-all text-muted-foreground hover:text-primary cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold">Add</span>
          </CustomButton>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
        disabled={disabled || isUploading}
      />
    </div>
  );
}
