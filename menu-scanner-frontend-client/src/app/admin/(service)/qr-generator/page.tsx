"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
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
  type QRType,
  type CardTemplate,
} from "@/components/admin/qr-generator/use-qr-generator";
import { getTemplateConfig } from "@/components/admin/qr-generator/card-templates";
import { AppDefault } from "@/constants/app-resource/default/default";

function QRGeneratorPageInner() {
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

  // Read configuration & template parameters from URL search params on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);

    const typeParam = params.get("type") as QRType | null;
    const tableNum = params.get("tableNumber") || params.get("table") || params.get("tableId");
    const titleParam = params.get("title");
    const subtitleParam = params.get("subtitle");
    const scanTextParam = params.get("scanText");
    const templateParam = params.get("template") as CardTemplate | null;

    if (typeParam || tableNum || titleParam || subtitleParam || scanTextParam) {
      setConfig((prev) => ({
        ...prev,
        type: typeParam || prev.type,
        tableNumber: tableNum ? decodeURIComponent(tableNum).replace(/^table-?/i, "").trim() : prev.tableNumber,
        cardTitle: titleParam ? decodeURIComponent(titleParam) : prev.cardTitle,
        cardSubtitle: subtitleParam ? decodeURIComponent(subtitleParam) : prev.cardSubtitle,
        scanText: scanTextParam ? decodeURIComponent(scanTextParam) : prev.scanText,
      }));
    }

    if (templateParam) {
      const tpl = getTemplateConfig(templateParam);
      setStyle((prev) => ({
        ...prev,
        template: templateParam,
        cardGradientFrom: tpl.gradientFrom,
        cardGradientTo: tpl.gradientTo,
        primaryColor: tpl.qrPrimaryColor,
      }));
    }
  }, []);

  // Pre-fill cardTitle & businessId from businessName/businessSettings when business settings arrive
  useEffect(() => {
    const bId = (businessSettings as any)?.id || AppDefault.BUSINESS_ID;
    setConfig((prev) => ({
      ...prev,
      businessId: bId,
      cardTitle: prev.cardTitle || businessName || "",
    }));
  }, [businessName, businessSettings]);

  // Pre-fill logoDataUrl & system --primary theme color for primary-theme template on mount
  useEffect(() => {
    const logoUrl = typeof businessLogo === "string" ? businessLogo : (businessLogo as any)?.sm || (businessLogo as any)?.md;
    const tpl = getTemplateConfig(style.template);
    setStyle((prev) => ({
      ...prev,
      cardGradientFrom: prev.template === "custom" ? prev.cardGradientFrom : tpl.gradientFrom,
      cardGradientTo: prev.template === "custom" ? prev.cardGradientTo : tpl.gradientTo,
      primaryColor: prev.template === "custom" ? prev.primaryColor : tpl.qrPrimaryColor,
      logoDataUrl: prev.logoDataUrl || logoUrl || appImages.scanmekhLogo,
    }));
  }, [businessLogo]);

  // Safely sync state to URL search parameters AFTER render (fixes React Router setState warning)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (config.type) params.set("type", config.type);
    if (config.tableNumber && config.type === "table") params.set("tableNumber", config.tableNumber);
    if (config.cardTitle) params.set("title", config.cardTitle);
    if (config.cardSubtitle) params.set("subtitle", config.cardSubtitle);
    if (config.scanText) params.set("scanText", config.scanText);
    if (style.template) params.set("template", style.template);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [config.type, config.tableNumber, config.cardTitle, config.cardSubtitle, config.scanText, style.template]);

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

export default function QRGeneratorPage() {
  return (
    <Suspense>
      <QRGeneratorPageInner />
    </Suspense>
  );
}
