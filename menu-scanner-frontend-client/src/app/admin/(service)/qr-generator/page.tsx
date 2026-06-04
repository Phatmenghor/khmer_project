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
  const [style,  setStyle]  = useState<QRStyle>(DEFAULT_STYLE);

  // Set domain from actual window origin on mount
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
    <div className="flex flex-1 flex-col gap-3 px-1.5 pb-5">
      <CardHeaderSection title="QR Generator" />

      {/*
        Responsive grid:
        • Mobile  (< md):  single column — config → preview → settings
        • Tablet  (md):    2 cols: [config top-left / settings bottom-left] | [preview right, spans both rows]
        • Desktop (lg):    3 cols: config | preview | settings
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[300px_1fr_280px] gap-3 items-start">

        {/* Config — col 1 row 1 on tablet, col 1 on desktop */}
        <div className="md:col-start-1 md:row-start-1">
          <QRInputPanel config={config} onUpdate={updateConfig} />
        </div>

        {/* Preview — col 2 spans rows 1+2 on tablet, col 2 on desktop */}
        <div className="md:col-start-2 md:row-start-1 md:row-span-2 lg:row-span-1">
          <QRPreviewPanel config={config} style={style} />
        </div>

        {/* Settings — col 1 row 2 on tablet, col 3 on desktop */}
        <div className="md:col-start-1 md:row-start-2 lg:col-start-3 lg:row-start-1">
          <QRSettingsPanel style={style} onUpdate={updateStyle} />
        </div>

      </div>
    </div>
  );
}
