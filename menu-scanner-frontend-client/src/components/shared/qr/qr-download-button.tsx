"use client";

import { memo } from "react";
import { Download, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <Button
          size="sm"
          className="gap-1"
          onClick={onDownload}
          disabled={downloading || !link}
        >
          <Download className="w-2.5 h-2.5" />
          {downloading ? "Saving…" : "Download"}
        </Button>
      )}
      {showCopy && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={onCopyUrl}
          disabled={!link}
        >
          {copied ? (
            <Check className="w-2.5 h-2.5 text-green-500" />
          ) : (
            <Copy className="w-2.5 h-2.5" />
          )}
          {copied ? "Copied!" : "Copy URL"}
        </Button>
      )}
      {showShare && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={onShare}
          disabled={!link}
        >
          <Share2 className="w-2.5 h-2.5" />
          Share
        </Button>
      )}
    </div>
  );
}

export const QRDownloadButton = memo(QRDownloadButtonComponent);
