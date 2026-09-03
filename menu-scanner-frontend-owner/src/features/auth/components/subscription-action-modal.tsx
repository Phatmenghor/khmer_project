"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectField } from "@/components/shared/form-field/select-field";
import { TextField } from "@/components/shared/form-field/text-field";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { SubmitButton } from "@/components/shared/button/submit-button";
import Loading from "@/components/shared/common/loading";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { getFieldError } from "@/utils/common/get-field-error";
import { formatDate } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/store";
import { PAYMENT_METHOD_CREATE_UPDATE } from "@/constants/app-resource/status/create-update-status";
import { fetchAllSubscriptionPlanService } from "@/features/master-data/store/thunks/subscription-plan-thunks";
import { selectSubscriptionPlan } from "@/features/master-data/store/selectors/subscription-plan-selector";
import {
  updateBusinessOwnerChangePlanService,
  updateBusinessOwnerRenewService,
  updateBusinessOwnerCancelService,
} from "../store/thunks/business-owner-thunks";
import {
  renewSubscriptionSchema,
  changePlanSchema,
  cancelSubscriptionSchema,
  RenewSubscriptionData,
  ChangePlanData,
  CancelSubscriptionData,
} from "../store/models/schema/business-owner.schema";
import { BusinessOwnerResponseModel } from "../store/models/response/business-owner-response";
import { fetchAllSubscriptionsByBusinessIdService } from "@/features/subscription/store/thunks/subscription-history-thunks";
import { SubscriptionHistoryResponseModel } from "@/features/subscription/store/models/response/subscription-history-response";
import { Info, RefreshCw, ArrowRightLeft, XCircle, CreditCard } from "lucide-react";
import { CustomTabSwitcher, TabOption } from "@/components/shared/common/custom-tab-switcher";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";

const SUBSCRIPTION_ACTION_TABS: TabOption[] = [
  {
    value: "renew",
    label: "Renew Subscription",
    icon: <RefreshCw className="w-4 h-4 text-emerald-500" />,
  },
  {
    value: "change-plan",
    label: "Change Plan",
    icon: <ArrowRightLeft className="w-4 h-4 text-blue-500" />,
  },
  {
    value: "cancel",
    label: "Cancel Subscription",
    icon: <XCircle className="w-4 h-4 text-destructive" />,
  },
];
import { SubscriptionConfig } from "@/constants/app-resource/default/default";

import { cn } from "@/lib/utils";

interface SubscriptionActionModalProps {
  owner: BusinessOwnerResponseModel | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SubscriptionActionModal({
  owner,
  isOpen,
  onClose,
  onSuccess,
}: SubscriptionActionModalProps) {
  const dispatch = useAppDispatch();
  const allPlans = useAppSelector(selectSubscriptionPlan);
  const planOptions = (allPlans?.content ?? []).map((p) => ({
    value: p.id,
    label: `${p.name} — $${p.price} (${p.durationType})`,
  }));

  const [activeTab, setActiveTab] = useState("renew");
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryResponseModel[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // --- Renew form ---
  const renewForm = useForm<RenewSubscriptionData>({
    resolver: zodResolver(renewSubscriptionSchema),
    defaultValues: { newPlanId: "", paymentAmount: undefined, paymentMethod: "", paymentReference: "" },
  });

  // --- Change Plan form ---
  const changePlanForm = useForm<ChangePlanData>({
    resolver: zodResolver(changePlanSchema),
    defaultValues: { newPlanId: "", paymentAmount: undefined, paymentMethod: "", paymentReference: "" },
  });

  // --- Cancel form ---
  const cancelForm = useForm<CancelSubscriptionData>({
    resolver: zodResolver(cancelSubscriptionSchema),
    defaultValues: { reason: "", paymentAmount: undefined, paymentMethod: "", paymentReference: "" },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || owner?.currentPlanId) return;
    dispatch(fetchAllSubscriptionPlanService({ pageNo: 1, pageSize: 100 }));
  }, [isOpen, owner?.currentPlanId, dispatch]);

  useEffect(() => {
    if (!isOpen || !owner?.businessId) return;
    setIsLoadingHistory(true);
    dispatch(fetchAllSubscriptionsByBusinessIdService(owner.businessId))
      .unwrap()
      .then((data: SubscriptionHistoryResponseModel[]) => setSubscriptionHistory(data ?? []))
      .catch(console.error)
      .finally(() => setIsLoadingHistory(false));
  }, [isOpen, owner?.businessId, dispatch]);

  const handleClose = () => {
    renewForm.reset();
    changePlanForm.reset();
    cancelForm.reset();
    setActiveTab("renew");
    setSubscriptionHistory([]);
    onClose();
  };

  const onRenewSubmit = async (data: RenewSubscriptionData) => {
    if (!owner?.ownerId) return;
    setIsSubmitting(true);
    try {
      await dispatch(updateBusinessOwnerRenewService({
        ownerId: owner.ownerId,
        businessOwnerData: data,
      })).unwrap();
      showToast.success(`Subscription renewed for ${owner.businessName}`);
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "Failed to renew subscription"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChangePlanSubmit = async (data: ChangePlanData) => {
    if (!owner?.ownerId) return;
    setIsSubmitting(true);
    try {
      await dispatch(updateBusinessOwnerChangePlanService({
        ownerId: owner.ownerId,
        businessOwnerData: data,
      })).unwrap();
      showToast.success(`Plan changed for ${owner.businessName}`);
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "Failed to change plan"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCancelSubmit = async (data: CancelSubscriptionData) => {
    if (!owner?.ownerId) return;
    setIsSubmitting(true);
    try {
      await dispatch(updateBusinessOwnerCancelService({
        ownerId: owner.ownerId,
        businessOwnerData: data,
      })).unwrap();
      showToast.success(`Subscription cancelled for ${owner.businessName}`);
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "Failed to cancel subscription"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} size="7xl" disableScrollWrapper={true} title="Subscription Management">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-border/60 bg-muted/20 flex-shrink-0 space-y-2.5">
        {/* Row 1: logo + title */}
        <div className="flex items-center gap-3 pr-6">
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-primary/10 border border-primary/20 flex-shrink-0 flex items-center justify-center shadow-2xs">
            {owner?.logoBusinessUrl ? (
              <img src={owner.logoBusinessUrl} alt={owner.businessName || "Business"} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-primary">
                {owner?.businessName?.charAt(0)?.toUpperCase() || "B"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-foreground leading-tight">Subscription Management</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate">
              {owner?.businessName} — {owner?.currentPlanName || "No active plan"}
            </p>
          </div>
        </div>
        {/* Row 2: subscription snapshot chips */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          <div className="bg-card border border-border/60 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-2xs">
            <span className="text-muted-foreground text-[11px]">End Date:</span>
            <span className="font-semibold text-foreground text-xs">{formatDate(owner?.subscriptionEndDate)}</span>
          </div>
          <div className="bg-card border border-border/60 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-2xs">
            <span className="text-muted-foreground text-[11px]">Days Left:</span>
            <span className={`font-semibold text-xs ${(owner?.daysRemaining ?? 0) <= SubscriptionConfig.EXPIRY_CRITICAL_DAYS ? "text-red-600" : (owner?.daysRemaining ?? 0) <= SubscriptionConfig.EXPIRY_WARNING_DAYS ? "text-yellow-600" : "text-green-600"}`}>
              {owner?.daysRemaining ?? 0}d
            </span>
          </div>
          <div className="bg-card border border-border/60 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-2xs">
            <span className="text-muted-foreground text-[11px]">Status:</span>
            <span className={`font-semibold text-xs ${owner?.subscriptionStatus === "ACTIVE" ? "text-green-600" : owner?.subscriptionStatus === "EXPIRING_SOON" ? "text-yellow-600" : owner?.subscriptionStatus === "CANCELLED" ? "text-orange-500" : owner?.subscriptionStatus === "CHANGE_PLAN" ? "text-blue-600" : "text-red-500"}`}>
              {owner?.subscriptionStatus || "—"}
            </span>
          </div>
          {owner?.subscriptionCancellationReason && (
            <div className="bg-card border border-border/60 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-2xs">
              <span className="text-muted-foreground text-[11px]">Cancellation Reason:</span>
              <span className="font-semibold text-foreground text-xs">{owner.subscriptionCancellationReason}</span>
            </div>
          )}
          <div className="bg-card border border-border/60 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-2xs">
            <span className="text-muted-foreground text-[11px]">Price:</span>
            <span className="font-semibold text-foreground text-xs">
              {owner?.currentPlanPrice != null ? `$${owner.currentPlanPrice}` : "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CustomTabSwitcher
              tabs={SUBSCRIPTION_ACTION_TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="mb-4"
            />

            {/* --- RENEW TAB --- */}
            <TabsContent value="renew" className="mt-3">
              <Card className="rounded-xl border border-border/60 shadow-2xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold">Renew Subscription</CardTitle>
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-lg p-2 mt-1">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>New period starts from current end date <strong>{formatDate(owner?.subscriptionEndDate)}</strong></span>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={renewForm.handleSubmit(onRenewSubmit)} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <SelectField
                        control={renewForm.control}
                        name="newPlanId"
                        label="Plan"
                        placeholder="Select plan"
                        options={planOptions}
                        disabled={isSubmitting}
                        required
                        error={getFieldError(renewForm.formState.errors.newPlanId)}
                      />
                      <TextField
                        control={renewForm.control}
                        name="paymentAmount"
                        label="Payment Amount"
                        type="number"
                        placeholder="0.00"
                        disabled={isSubmitting}
                        error={getFieldError(renewForm.formState.errors.paymentAmount)}
                      />
                      <SelectField
                        control={renewForm.control}
                        name="paymentMethod"
                        label="Payment Method"
                        placeholder="Select method"
                        options={PAYMENT_METHOD_CREATE_UPDATE}
                        disabled={isSubmitting}
                        error={getFieldError(renewForm.formState.errors.paymentMethod)}
                      />
                      <TextField
                        control={renewForm.control}
                        name="paymentReference"
                        label="Reference No."
                        placeholder="Optional reference"
                        disabled={isSubmitting}
                        error={getFieldError(renewForm.formState.errors.paymentReference)}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <CancelButton onClick={handleClose} disabled={isSubmitting} />
                      <SubmitButton isSubmitting={isSubmitting} isDirty={renewForm.formState.isDirty} isCreate={true} createText="Renew" submittingCreateText="Renewing..." />
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- CHANGE PLAN TAB --- */}
            <TabsContent value="change-plan" className="mt-3">
              <Card className="rounded-xl border border-border/60 shadow-2xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold">Change Plan</CardTitle>
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-lg p-2 mt-1">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Plan changes take effect immediately. New period starts from today and end date is recalculated based on the new plan&apos;s duration.</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={changePlanForm.handleSubmit(onChangePlanSubmit)} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <SelectField
                        control={changePlanForm.control}
                        name="newPlanId"
                        label="New Plan"
                        placeholder="Select plan"
                        options={planOptions}
                        disabled={isSubmitting}
                        required
                        error={getFieldError(changePlanForm.formState.errors.newPlanId)}
                      />
                      <TextField
                        control={changePlanForm.control}
                        name="paymentAmount"
                        label="Payment Amount"
                        type="number"
                        placeholder="0.00"
                        disabled={isSubmitting}
                        error={getFieldError(changePlanForm.formState.errors.paymentAmount)}
                      />
                      <SelectField
                        control={changePlanForm.control}
                        name="paymentMethod"
                        label="Payment Method"
                        placeholder="Select method"
                        options={PAYMENT_METHOD_CREATE_UPDATE}
                        disabled={isSubmitting}
                        error={getFieldError(changePlanForm.formState.errors.paymentMethod)}
                      />
                      <TextField
                        control={changePlanForm.control}
                        name="paymentReference"
                        label="Reference No."
                        placeholder="Optional reference"
                        disabled={isSubmitting}
                        error={getFieldError(changePlanForm.formState.errors.paymentReference)}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <CancelButton onClick={handleClose} disabled={isSubmitting} />
                      <SubmitButton isSubmitting={isSubmitting} isDirty={changePlanForm.formState.isDirty} isCreate={true} createText="Change Plan" submittingCreateText="Changing..." />
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- CANCEL TAB --- */}
            <TabsContent value="cancel" className="mt-3">
              <Card className="rounded-xl border border-destructive/30 shadow-2xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-destructive">Cancel Subscription</CardTitle>
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/40 rounded-lg p-2 mt-1">
                    <Info className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>This will immediately cancel the subscription. Any refund amount specified will be recorded as a refund payment.</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={cancelForm.handleSubmit(onCancelSubmit)} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <TextField
                        control={cancelForm.control}
                        name="reason"
                        label="Reason"
                        placeholder="Cancellation reason"
                        required
                        disabled={isSubmitting}
                        error={getFieldError(cancelForm.formState.errors.reason)}
                      />
                      <TextField
                        control={cancelForm.control}
                        name="paymentAmount"
                        label="Payment Amount"
                        type="number"
                        placeholder="0.00"
                        disabled={isSubmitting}
                        error={getFieldError(cancelForm.formState.errors.paymentAmount)}
                      />
                      <SelectField
                        control={cancelForm.control}
                        name="paymentMethod"
                        label="Payment Method"
                        placeholder="Select method"
                        options={PAYMENT_METHOD_CREATE_UPDATE}
                        disabled={isSubmitting}
                        error={getFieldError(cancelForm.formState.errors.paymentMethod)}
                      />
                      <TextField
                        control={cancelForm.control}
                        name="paymentReference"
                        label="Reference No."
                        placeholder="Optional reference"
                        disabled={isSubmitting}
                        error={getFieldError(cancelForm.formState.errors.paymentReference)}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <CancelButton onClick={handleClose} disabled={isSubmitting} />
                      <SubmitButton isSubmitting={isSubmitting} isDirty={cancelForm.formState.isDirty} isCreate={true} createText="Cancel Subscription" submittingCreateText="Cancelling..." />
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Subscription History */}
          <Card className="rounded-xl border border-border/60 shadow-2xs overflow-hidden">
            <CardHeader className="py-3 px-4 bg-muted/10 border-b border-border/50">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-primary" />
                Subscription History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTableWithPagination
                data={subscriptionHistory}
                columns={[
                  {
                    key: "index",
                    label: "#",
                    minWidth: "40px",
                    maxWidth: "50px",
                    render: (_, idx) => <span className="text-xs text-muted-foreground">{idx + 1}</span>,
                  },
                  {
                    key: "planName",
                    label: "Plan",
                    minWidth: "100px",
                    render: (row) => <span className="text-xs font-semibold text-foreground">{row.planName || "—"}</span>,
                  },
                  {
                    key: "planDurationType",
                    label: "Duration",
                    minWidth: "90px",
                    render: (row) => <span className="text-xs text-muted-foreground">{row.planDurationType || "—"}</span>,
                  },
                  {
                    key: "planPrice",
                    label: "Price",
                    minWidth: "80px",
                    render: (row) => <span className="text-xs font-medium text-foreground tabular-nums">${row.planPrice?.toFixed(2) ?? "0.00"}</span>,
                  },
                  {
                    key: "startDate",
                    label: "Start Date",
                    minWidth: "100px",
                    render: (row) => <span className="text-xs text-muted-foreground">{formatDate(row.startDate)}</span>,
                  },
                  {
                    key: "endDate",
                    label: "End Date",
                    minWidth: "100px",
                    render: (row) => <span className="text-xs text-muted-foreground">{formatDate(row.endDate)}</span>,
                  },
                  {
                    key: "status",
                    label: "Status",
                    minWidth: "90px",
                    render: (row) => (
                      <span className={`text-xs font-semibold ${row.status === "ACTIVE" ? "text-emerald-600 dark:text-emerald-400" : row.status === "CANCELLED" ? "text-amber-600 dark:text-amber-400" : row.status === "CHANGE_PLAN" ? "text-blue-600 dark:text-blue-400" : "text-destructive"}`}>
                        {row.status || "—"}
                      </span>
                    ),
                  },
                  {
                    key: "paymentStatus",
                    label: "Payment",
                    minWidth: "100px",
                    render: (row) => (
                      <span className={`text-xs font-semibold ${row.paymentStatus === "PAID" ? "text-emerald-600 dark:text-emerald-400" : row.paymentStatus === "PENDING" || row.paymentStatus === "PARTIALLY_PAID" ? "text-amber-600 dark:text-amber-400" : "text-destructive"}`}>
                        {row.paymentStatus?.replace("_", " ") || "—"}
                      </span>
                    ),
                  },
                  {
                    key: "totalPaid",
                    label: "Total Paid",
                    minWidth: "90px",
                    render: (row) => <span className="text-xs font-medium text-foreground tabular-nums">${row.totalPaid?.toFixed(2) ?? "0.00"}</span>,
                  },
                ]}
                loading={isLoadingHistory}
                emptyMessage="No subscription history found"
                getRowKey={(row, idx) => `${row.subscriptionId}-${idx}`}
                showPagination={false}
                showPageSizeSelector={false}
                currentPage={1}
                totalPages={1}
                onPageChange={() => {}}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomModal>
  );
}
