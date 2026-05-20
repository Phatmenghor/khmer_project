"use client";

import { useState, useCallback, useEffect } from "react";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { QRInputPanel } from "./_components/qr-input-panel";
import { QRPreviewPanel } from "./_components/qr-preview-panel";
import { QRSettingsPanel } from "./_components/qr-settings-panel";
import {
  DEFAULT_CONFIG,
  DEFAULT_STYLE,
  type QRConfig,
  type QRStyle,
} from "./_components/use-qr-generator";

export default function QRGeneratorPage() {
  const [config, setConfig] = useState<QRConfig>(DEFAULT_CONFIG);
  const [style, setStyle] = useState<QRStyle>(DEFAULT_STYLE);

  useEffect(() => {
    setConfig((prev) => ({ ...prev, domain: window.location.origin }));
  }, []);

  const updateConfig = useCallback((updates: Partial<QRConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateStyle = useCallback((updates: Partial<QRStyle>) => {
    setStyle((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <CardHeaderSection title="QR Generator" />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_280px] gap-4 items-start">
        <QRInputPanel config={config} onUpdate={updateConfig} />
        <QRPreviewPanel config={config} style={style} />
        <QRSettingsPanel style={style} onUpdate={updateStyle} />
      </div>
    </div>
  );
}
