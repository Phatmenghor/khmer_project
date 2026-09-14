"use client";

import { useEffect } from "react";
import { RefreshCw, ShieldCheck, Zap, Database, Mail, Clock, Key } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchMonitoringStatusThunk } from "@/features/bakong/store/thunks/bakong-thunks";
import {
  selectBakongStatus,
  selectIsBakongStatusLoading,
} from "@/features/bakong/store/selectors/bakong-selectors";
import { CustomButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";

export default function BakongStatusPage() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectBakongStatus);
  const isLoading = useAppSelector(selectIsBakongStatusLoading);

  const loadStatus = async () => {
    try {
      await dispatch(fetchMonitoringStatusThunk()).unwrap();
    } catch (err: any) {
      showToast.error(err || "Failed to load Bakong status");
    }
  };

  useEffect(() => {
    loadStatus();
  }, [dispatch]);

  const quota = status?.quota;
  const token = status?.token;

  return (
    <div className="flex flex-1 flex-col gap-4 px-1 pb-6">
      {/* Header Panel */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/60 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Bakong Upstream Status & Quota Monitoring
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time daily rate limits, active configuration email, and NBC JWT token health status
          </p>
        </div>
        <CustomButton
          variant="outline"
          size="sm"
          onClick={loadStatus}
          disabled={isLoading}
          className="gap-2 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
          Refresh Status
        </CustomButton>
      </div>

      {/* Main Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Quota Overview Card */}
        <div className="p-4 rounded-xl bg-card border border-border/60 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-blue-500" />
              Active Configuration
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
              {quota?.activeEmail || "N/A"}
            </span>
          </div>

          <div className="pt-2">
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>Daily Quota Usage</span>
              <span className="font-bold text-foreground">
                {quota?.usedCount ?? 0} / {quota?.maxLimit ?? 0} ({quota?.usagePercentage ?? 0}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, quota?.usagePercentage ?? 0)}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
            <span>Remaining Quota: <strong className="text-foreground">{quota?.remainingQuota ?? 0}</strong></span>
            <span>Reset Timezone: <strong className="text-foreground">{quota?.resetTimezone || "Midnight"}</strong></span>
          </div>
        </div>

        {/* Token Status Card */}
        <div className="p-4 rounded-xl bg-card border border-border/60 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Key className="h-4 w-4 text-emerald-500" />
              JWT Token Health
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                token?.active
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              }`}
            >
              {token?.active ? "ACTIVE & VALID" : "INACTIVE / EXPIRED"}
            </span>
          </div>

          <div className="space-y-1.5 text-xs pt-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Token Source:</span>
              <span className="font-medium text-foreground flex items-center gap-1">
                <Database className="h-3 w-3 text-muted-foreground" />
                {token?.tokenSource || "MEMORY"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expires At:</span>
              <span className="font-medium text-foreground">
                {token?.expiresAt ? new Date(token.expiresAt).toLocaleString() : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time Remaining:</span>
              <span className="font-semibold text-primary flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {token?.remainingSeconds
                  ? `${Math.floor(token.remainingSeconds / 86400)}d ${Math.floor(
                      (token.remainingSeconds % 86400) / 3600
                    )}h ${Math.floor((token.remainingSeconds % 3600) / 60)}m`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Status Protection Card */}
        <div className="p-4 rounded-xl bg-card border border-border/60 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-purple-500" />
              Auto-Failover System
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
              OPERATIONAL
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Automatic failover triggers when daily quota (100 req/day per account) is exhausted. Requests seamlessly route to secondary configurations.
          </p>
        </div>
      </div>

      {/* Upstream Config Accounts Breakdown Table */}
      <div className="p-4 rounded-xl bg-card border border-border/60 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-foreground">Registered Upstream Accounts Quotas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-semibold">
              <tr>
                <th className="px-3 py-2">Config Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Used / Limit</th>
                <th className="px-3 py-2">Remaining</th>
                <th className="px-3 py-2">Usage %</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {quota?.accounts && quota.accounts.length > 0 ? (
                quota.accounts.map((acc) => (
                  <tr key={acc.configName} className="hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2.5 font-bold text-foreground">{acc.configName}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{acc.email}</td>
                    <td className="px-3 py-2.5 font-medium">{acc.usedCount} / {acc.maxLimit}</td>
                    <td className="px-3 py-2.5 font-semibold text-emerald-600">{acc.remainingQuota}</td>
                    <td className="px-3 py-2.5">{acc.usagePercentage}%</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          acc.active
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {acc.active ? "ACTIVE" : "STANDBY"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-muted-foreground">
                    No account details available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
