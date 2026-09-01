"use client";

import { memo } from "react";
import { Download, Share2, Copy, Check } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";

interface QRDownloadButtonProps {
  downloading: boolean;
  copied: boolean;
  link: string;
  showDownload?: boolean;
  showCopy?: boolean;
  showShare?: boolean;
  onDownload: () => void;
  onCopyUrl: () => void;
  onShare: () => void;
}

function QRDownloadButtonComponent({
  downloading,
  copied,
  link,
  showDownload = true,
  showCopy = true,
  showShare = true,
  onDownload,
  onCopyUrl,
  onShare,
}: QRDownloadButtonProps) {
  return (
    <div className="flex gap-1 w-full flex-wrap justify-center">
      {showDownload && (
        <CustomButton
          size="sm"
          className="gap-1"
          onClick={onDownload}
          disabled={downloading || !link}
          isLoading={downloading}
          icon={!downloading ? <Download className="w-2.5 h-2.5" /> : undefined}
        >
          {downloading ? "Saving…" : "Download"}
        </CustomButton>
      )}
      {showCopy && (
        <CustomButton
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={onCopyUrl}
          disabled={!link}
          icon={copied ? <Check className="w-2.5 h-2.5 text-green-500" /> : <Copy className="w-2.5 h-2.5" />}
        >
          {copied ? "Copied!" : "Copy URL"}
        </CustomButton>
      )}
      {showShare && (
        <CustomButton
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={onShare}
          disabled={!link}
          icon={<Share2 className="w-2.5 h-2.5" />}
        >
          Share
        </CustomButton>
      )}
    </div>
  );
}

export const QRDownloadButton = memo(QRDownloadButtonComponent);
