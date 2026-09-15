"use client";

import React, { useEffect, useState } from "react";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import { bakongApiService } from "../services/bakong-api-service";
import { BakongConfigModel } from "../models/bakong-models";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface BakongConfigDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  configId: string | null;
}

export function BakongConfigDetailModal({
  isOpen,
  onClose,
  configId,
}: BakongConfigDetailModalProps) {
  const [config, setConfig] = useState<BakongConfigModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (configId && isOpen) {
      setIsLoading(true);
      bakongApiService
        .getConfigById(configId)
        .then((res) => {
          setConfig(res);
        })
        .catch(() => {
          setConfig(null);
        })
        .finally(() => setIsLoading(false));
    } else if (!isOpen) {
      setConfig(null);
    }
  }, [configId, isOpen]);

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      isLoading={isLoading}
      isEmpty={!isLoading && !config}
      emptyMessage="Configuration detail not found"
      title="Bakong Configuration Detail"
      description="Detailed upstream developer credentials and daily rate limit information"
      size="5xl"
    >
      {config && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
          <SectionTitle>Configuration Information</SectionTitle>
          <InfoRow label="Config Name" value={config.configName || "-"} />
          <InfoRow
            label="Status"
            value={
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border inline-flex items-center gap-1 ${
                  config.enabled
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }`}
              >
                {config.enabled ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> ENABLED
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" /> DISABLED
                  </>
                )}
              </span>
            }
          />
          <InfoRow label="Developer Email" value={config.email || "-"} />
          <InfoRow label="Daily Rate Limit" value={config.dailyRateLimit != null ? `${config.dailyRateLimit} Requests / Day` : "-"} />
          <InfoRow
            label="API Base URL"
            value={
              <span className="font-mono text-xs bg-muted/40 px-2 py-1 rounded border border-border/40 block overflow-x-auto">
                {config.apiUrl || "-"}
              </span>
            }
            fullWidth
          />

          <SectionTitle>Daily Quota & Usage Statistics</SectionTitle>
          <InfoRow
            label="Used Count"
            value={
              config.usedCount != null
                ? `${config.usedCount} / ${config.dailyRateLimit ?? 100} Requests`
                : "-"
            }
          />
          <InfoRow
            label="Remaining Quota"
            value={
              config.remainingQuota != null
                ? `${config.remainingQuota} Requests Remaining`
                : "-"
            }
          />
          <InfoRow
            label="Usage Percentage"
            value={
              config.usagePercentage != null
                ? `${config.usagePercentage}%`
                : "-"
            }
          />
          <InfoRow
            label="Quota Limit Status"
            value={
              config.limitReached != null ? (
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border inline-flex items-center gap-1 ${
                    config.limitReached
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  }`}
                >
                  {config.limitReached ? (
                    <>
                      <AlertTriangle className="h-3 w-3" /> LIMIT REACHED
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3 w-3" /> WITHIN LIMIT
                    </>
                  )}
                </span>
              ) : (
                "-"
              )
            }
          />

          <SectionTitle>Audit & System Info</SectionTitle>
          <InfoRow label="Config ID" value={config.id || "-"} />
          <InfoRow label="Created At" value={dateTimeFormat(config.createdAt)} />
          <InfoRow label="Last Updated" value={dateTimeFormat(config.updatedAt)} />
        </div>
      )}
    </DetailModal>
  );
}
