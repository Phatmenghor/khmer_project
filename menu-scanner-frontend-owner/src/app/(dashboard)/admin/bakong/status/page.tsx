"use client";

import { useEffect, useMemo } from "react";
import { RefreshCw, ShieldCheck, Zap, Mail, Clock, Key, Plus, CheckCircle2, XCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchMonitoringStatusThunk,
  fetchAllConfigsThunk,
  deleteConfigThunk,
} from "@/features/bakong/store/thunks/bakong-thunks";
import {
  selectBakongStatus,
  selectIsBakongStatusLoading,
  selectIsBakongConfigsLoading,
  selectBakongConfigsList,
} from "@/features/bakong/store/selectors/bakong-selectors";
import { updateConfigLocal, setStatus } from "@/features/bakong/store/slice/bakong-slice";
import { bakongApiService } from "@/features/bakong/services/bakong-api-service";
import { CustomButton, TableActionButtons } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat, formatRemainingSeconds } from "@/utils/date/date-time-format";
import { useDebouncedItemCallback } from "@/utils/debounce/debounce";
import { BakongConfigModel } from "@/features/bakong/models/bakong-models";
import { BakongConfigModal } from "@/features/bakong/components/bakong-config-modal";
import { BakongConfigDetailModal } from "@/features/bakong/components/bakong-config-detail-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { BakongStatusSkeleton } from "@/components/shared/skeletons/bakong-status-skeleton";
import { StatusCardSkeleton } from "@/components/shared/skeletons/status-card-skeleton";
import { Switch } from "@/components/ui/switch";
import { useActionRouting } from "@/hooks/use-action-routing";

export default function BakongStatusPage() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectBakongStatus);
  const isStatusLoading = useAppSelector(selectIsBakongStatusLoading);
  const isConfigsLoading = useAppSelector(selectIsBakongConfigsLoading);
  const configs = useAppSelector(selectBakongConfigsList);

  const { viewId, editId, deleteId, createMode, openView, openEdit, openDelete, openCreate, closeModal } = useActionRouting();

  const deleteConfig = useMemo(
    () => configs.find((c) => c.id === deleteId || c.configName === deleteId) || null,
    [configs, deleteId]
  );

  const loadStatus = async () => {
    try {
      await Promise.all([
        dispatch(fetchMonitoringStatusThunk()).unwrap(),
        dispatch(fetchAllConfigsThunk()).unwrap(),
      ]);
    } catch (err: any) {
      showToast.error(getErrorMessage(err, "Failed to load Bakong status"));
    }
  };

  useEffect(() => {
    loadStatus();
  }, [dispatch]);

  // Debounce background API request per config ID (400ms) while allowing optimistic 0ms UI update
  const debouncedApiUpdate = useDebouncedItemCallback(
    async (configId: string, item: BakongConfigModel, newEnabled: boolean) => {
      try {
        await bakongApiService.updateConfig(configId, {
          configName: item.configName,
          apiUrl: item.apiUrl,
          email: item.email,
          dailyRateLimit: item.dailyRateLimit,
          enabled: newEnabled,
        });
        showToast.success(`Config "${item.configName}" ${newEnabled ? "enabled" : "disabled"}`);

        // Update monitoring status metrics silently in background
        bakongApiService
          .getMonitoringStatus()
          .then((statusRes) => {
            if (statusRes) dispatch(setStatus(statusRes));
          })
          .catch(() => {});
      } catch (err: any) {
        // Revert local state on API error
        dispatch(updateConfigLocal({ id: configId, enabled: !newEnabled }));
        showToast.error(getErrorMessage(err, "Failed to update configuration status"));
      }
    },
    400
  );

  const handleToggleStatus = (item: BakongConfigModel, newEnabled: boolean) => {
    // 1. Instant optimistic local UI state update (0ms lag, no loading spinner)
    dispatch(updateConfigLocal({ id: item.id, enabled: newEnabled }));
    // 2. Debounced background API call
    debouncedApiUpdate(item.id, item, newEnabled);
  };

  const handleDeleteConfirm = async () => {
    const targetId = deleteConfig?.id || deleteId;
    if (!targetId) {
      showToast.error("Configuration ID not found");
      return;
    }
    try {
      await dispatch(deleteConfigThunk(targetId)).unwrap();
      showToast.success(`Config "${deleteConfig?.configName || targetId}" deleted successfully`);
      closeModal();
      loadStatus();
    } catch (err: any) {
      showToast.error(getErrorMessage(err, "Failed to delete configuration"));
    }
  };

  const columns: TableColumn<BakongConfigModel>[] = useMemo(
    () => [
      {
        key: "index",
        label: "#",
        minWidth: "10px",
        maxWidth: "400px",
        render: (_, index) => (
          <span className="text-xs font-semibold text-muted-foreground">
            {indexDisplay(1, 10, index + 1)}
          </span>
        ),
      },
      {
        key: "configName",
        label: "Config Name",
        render: (item: BakongConfigModel) => (
          <span className="font-bold text-foreground">{item.configName || "-"}</span>
        ),
      },
      {
        key: "email",
        label: "Email",
        render: (item: BakongConfigModel) => (
          <span className="text-muted-foreground">{item.email || "-"}</span>
        ),
      },
      {
        key: "usedCount",
        label: "Used / Limit",
        render: (item: BakongConfigModel) => (
          <span className="font-semibold text-foreground">
            {item.usedCount ?? 0} / {item.dailyRateLimit ?? 100} Requests
          </span>
        ),
      },
      {
        key: "remainingQuota",
        label: "Remaining",
        render: (item: BakongConfigModel) => (
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {item.remainingQuota ?? Math.max(0, (item.dailyRateLimit ?? 100) - (item.usedCount ?? 0))} Requests
          </span>
        ),
      },
      {
        key: "usagePercentage",
        label: "Usage",
        render: (item: BakongConfigModel) => (
          <span className="font-medium text-foreground">{item.usagePercentage ?? 0}%</span>
        ),
      },
      {
        key: "enabled",
        label: "Status",
        render: (item: BakongConfigModel) => (
          <div className="flex items-center gap-2">
            <Switch
              checked={item.enabled}
              onCheckedChange={(checked) => handleToggleStatus(item, checked)}
            />
            <span
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border inline-flex items-center gap-1 ${
                item.enabled
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              }`}
            >
              {item.enabled ? (
                <>
                  <CheckCircle2 className="h-3 w-3" /> ENABLED
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" /> DISABLED
                </>
              )}
            </span>
          </div>
        ),
      },
      {
        key: "createdAt",
        label: "Created At",
        render: (item: BakongConfigModel) => (
          <span className="text-xs text-muted-foreground">{dateTimeFormat(item.createdAt)}</span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (item: BakongConfigModel) => (
          <TableActionButtons
            onView={() => openView(item.id)}
            onEdit={() => openEdit(item.id)}
            onDelete={() => openDelete(item.id)}
            viewTooltip="View Details"
            editTooltip="Edit Config"
            deleteTooltip="Delete Config"
          />
        ),
      },
    ],
    [openView, openEdit, openDelete, dispatch]
  );

  const quota = status?.quota;
  const token = status?.token;

  const isInitialLoading = (isStatusLoading || isConfigsLoading) && !status && configs.length === 0;

  if (isInitialLoading) {
    return <BakongStatusSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-1 pb-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-card border border-border/60 shadow-2xs gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Bakong Upstream Status
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time rate limits & token health
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <CustomButton
            variant="outline"
            size="sm"
            onClick={loadStatus}
            disabled={isStatusLoading}
            className="gap-2 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isStatusLoading ? "animate-spin text-primary" : ""}`} />
            Refresh
          </CustomButton>
          <CustomButton
            variant="default"
            size="sm"
            onClick={openCreate}
            className="gap-2 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New Config
          </CustomButton>
        </div>
      </div>

      {/* Main Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Configuration Card */}
        <div className="p-4 rounded-xl bg-card border border-border/60 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 truncate max-w-[200px]"
              title={quota?.activeEmail || ""}
            >
              {quota?.activeEmail || "-"}
            </span>
          </div>

          <div className="pt-1">
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>Quota Usage</span>
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
            <span>Remaining: <strong className="text-foreground">{quota?.remainingQuota ?? 0}</strong></span>
            <span>Reset: <strong className="text-foreground">{quota?.resetTimezone || "Midnight"}</strong></span>
          </div>
        </div>

        {/* Token Status Card */}
        <div className="p-4 rounded-xl bg-card border border-border/60 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
              <Key className="h-5 w-5" />
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                token?.active
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              }`}
            >
              {token?.active ? "VALID" : "EXPIRED"}
            </span>
          </div>

          <div className="space-y-1.5 text-xs pt-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expires At:</span>
              <span className="font-medium text-foreground">
                {token?.expiresAt ? dateTimeFormat(token.expiresAt) : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining Time:</span>
              <span className="font-semibold text-primary flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRemainingSeconds(token?.remainingSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Auto Failover Card */}
        <div className="p-4 rounded-xl bg-card border border-border/60 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
              OPERATIONAL
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
            Automatic failover seamlessly routes to standby accounts when daily quota is exhausted.
          </p>
        </div>
      </div>

      {/* Upstream Config Accounts Breakdown Table */}
      <div>
        <DataTableWithPagination
          columns={columns}
          data={configs}
          loading={isConfigsLoading}
          getRowKey={(item: BakongConfigModel) => item.id}
          emptyMessage="No upstream account details available"
          showPagination={false}
        />
      </div>

      {/* Detail Modal */}
      <BakongConfigDetailModal
        isOpen={Boolean(viewId)}
        onClose={closeModal}
        configId={viewId}
      />

      {/* Create / Edit Modal */}
      <BakongConfigModal
        isOpen={createMode || Boolean(editId)}
        onClose={closeModal}
        configId={editId}
        onSuccess={loadStatus}
      />

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(deleteId)}
        onClose={closeModal}
        onDelete={handleDeleteConfirm}
        title="Delete Bakong Configuration"
        description={`Are you sure you want to delete configuration "${deleteConfig?.configName || deleteId}"?`}
        itemName={deleteConfig?.configName || deleteId || ""}
      />
    </div>
  );
}


