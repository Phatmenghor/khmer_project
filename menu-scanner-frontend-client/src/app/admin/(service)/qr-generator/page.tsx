"use client";

import { useState, useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectBusinessName,
  selectBusinessLogo,
  selectBusinessSettings,
} from "@/features/business/store/selectors/business-settings-selector";
import { fetchBusinessSettingsThunk } from "@/features/business/store/thunks/business-settings-thunks";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { QRInputPanel } from "@/components/admin/qr-generator/qr-input-panel";
import { QRPreviewPanel } from "@/components/admin/qr-generator/qr-preview-panel";
import { QRSettingsPanel } from "@/components/admin/qr-generator/qr-settings-panel";
import {
  DEFAULT_CONFIG,
  DEFAULT_STYLE,
  type QRConfig,
  type QRStyle,
} from "@/components/admin/qr-generator/use-qr-generator";

export default function QRGeneratorPage() {
  const dispatch = useAppDispatch();
  const businessSettings = useAppSelector(selectBusinessSettings);
  const businessName = useAppSelector(selectBusinessName);
  const businessLogo = useAppSelector(selectBusinessLogo);

  const [config, setConfig] = useState<QRConfig>(DEFAULT_CONFIG);
  const [style, setStyle] = useState<QRStyle>(DEFAULT_STYLE);

  // Fetch business settings on mount if not loaded
  useEffect(() => {
    if (!businessSettings) {
      dispatch(fetchBusinessSettingsThunk());
    }
  }, [dispatch, businessSettings]);

  // Read pre-selected table parameter from URL if opened from Table Monitoring
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tableNum = params.get("tableNumber") || params.get("table") || params.get("tableId");
    if (tableNum) {
      const cleanNum = decodeURIComponent(tableNum).replace(/^table-?/i, "").trim();
      setConfig((prev) => ({
        ...prev,
        type: "table",
        tableNumber: cleanNum,
      }));
    }
  }, []);

  // Pre-fill cardTitle from businessName when business settings arrive
  useEffect(() => {
    if (businessName) {
      setConfig((prev) => ({
        ...prev,
        cardTitle: prev.cardTitle || businessName,
      }));
    }
  }, [businessName]);

  // Pre-fill logoDataUrl from businessLogo if available, else default to appImages.scanmekhLogo
  useEffect(() => {
    const logoUrl = typeof businessLogo === "string" ? businessLogo : (businessLogo as any)?.sm || (businessLogo as any)?.md;
    setStyle((prev) => ({
      ...prev,
      logoDataUrl: prev.logoDataUrl || logoUrl || appImages.scanmekhLogo,
    }));
  }, [businessLogo]);

  const updateConfig = useCallback((updates: Partial<QRConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateStyle = useCallback((updates: Partial<QRStyle>) => {
    setStyle((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 px-1 pb-6 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[320px_1fr_300px] gap-4 items-start">
        {/* Config — col 1 row 1 on tablet, col 1 on desktop */}
        <div className="md:col-start-1 md:row-start-1">
          <QRInputPanel
            config={config}
            onUpdate={updateConfig}
            businessNameFromSettings={businessName}
          />
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
