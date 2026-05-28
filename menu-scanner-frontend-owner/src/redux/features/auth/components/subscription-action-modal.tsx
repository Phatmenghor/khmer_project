"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectField } from "@/components/shared/form-field/select-field";
import { TextField } from "@/components/shared/form-field/text-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import Loading from "@/components/shared/common/loading";
import { showToast } from "@/components/shared/common/show-toast";
import { getFieldError } from "@/utils/common/get-field-error";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { PAYMENT_METHOD_CREATE_UPDATE } from "@/constants/app-resource/status/create-update-status";
import { fetchAllSubscriptionPlanService } from "@/redux/features/master-data/store/thunks/subscription-plan-thunks";
import { selectSubscriptionPlan } from "@/redux/features/master-data/store/selectors/subscription-plan-selector";
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
import { fetchAllSubscriptionsByBusinessIdService } from "@/redux/features/subscription/store/thunks/subscription-history-thunks";
import { SubscriptionHistoryResponseModel } from "@/redux/features/subscription/store/models/response/subscription-history-response";
import { Info, RefreshCw, ArrowRightLeft, XCircle } from "lucide-react";
import { SubscriptionConfig } from "@/constants/app-resource/default/default";

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
    defaultValues: { newPlanId: "", paymentAmount: undefined, paymentMethod: "", paymentReference: "", paymentNotes: "" },
  });

  // --- Change Plan form ---
  const changePlanForm = useForm<ChangePlanData>({
    resolver: zodResolver(changePlanSchema),
    defaultValues: { newPlanId: "", paymentAmount: undefined, paymentMethod: "", paymentReference: "", paymentNotes: "" },
  });

  // --- Cancel form ---
  const cancelForm = useForm<CancelSubscriptionData>({
    resolver: zodResolver(cancelSubscriptionSchema),
    defaultValues: { reason: "" },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    dispatch(fetchAllSubscriptionPlanService({ pageNo: 1, pageSize: 100 }));
  }, [isOpen, dispatch]);

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
    } catch (error: any) {
      showToast.error(error || "Failed to renew subscription");
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
    } catch (error: any) {
      showToast.error(error || "Failed to change plan");
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
    } catch (error: any) {
      showToast.error(error || "Failed to cancel subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentFields = (control: any, errors: any, disabled: boolean) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
      <TextField
        control={control}
        name="paymentAmount"
        label="Payment Amount (Optional)"
        type="number"
        placeholder="0.00"
        disabled={disabled}
        error={getFieldError(errors.paymentAmount)}
      />
      <SelectField
        control={control}
        name="paymentMethod"
        label="Payment Method (Optional)"
        placeholder="Select method"
        options={PAYMENT_METHOD_CREATE_UPDATE}
        disabled={disabled}
        error={getFieldError(errors.paymentMethod)}
      />
      <TextField
        control={control}
        name="paymentReference"
        label="Reference No."
        placeholder="Optional reference"
        disabled={disabled}
        error={getFieldError(errors.paymentReference)}
      />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Subscription Management</DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0 space-y-3">
          {/* Row 1: logo + title */}
          <div className="flex items-center gap-4 pr-8">
            <div className="h-14 w-14 rounded-lg overflow-hidden bg-primary/10 border border-border flex-shrink-0 flex items-center justify-center">
              {owner?.logoBusinessUrl ? (
                <img src={owner.logoBusinessUrl} alt={owner.businessName || "Business"} className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-semibold text-primary">
                  {owner?.businessName?.charAt(0)?.toUpperCase() || "B"}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground">Subscription Management</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {owner?.businessName} — {owner?.currentPlanName || "No active plan"}
              </p>
            </div>
          </div>
          {/* Row 2: subscription snapshot chips */}
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="bg-background border border-border rounded-md px-3 py-1.5 flex items-center gap-2">
              <span className="text-muted-foreground">End Date</span>
              <span className="font-semibold text-foreground">{owner?.subscriptionEndDate || "---"}</span>
            </div>
            <div className="bg-background border border-border rounded-md px-3 py-1.5 flex items-center gap-2">
              <span className="text-muted-foreground">Days Left</span>
              <span className={`font-semibold ${(owner?.daysRemaining ?? 0) <= SubscriptionConfig.EXPIRY_CRITICAL_DAYS ? "text-red-600" : (owner?.daysRemaining ?? 0) <= SubscriptionConfig.EXPIRY_WARNING_DAYS ? "text-yellow-600" : "text-green-600"}`}>
                {owner?.daysRemaining ?? 0}d
              </span>
            </div>
            <div className="bg-background border border-border rounded-md px-3 py-1.5 flex items-center gap-2">
              <span className="text-muted-foreground">Status</span>
              <span className={`font-semibold ${owner?.subscriptionStatus === "ACTIVE" ? "text-green-600" : owner?.subscriptionStatus === "EXPIRING_SOON" ? "text-yellow-600" : owner?.subscriptionStatus === "CANCELLED" ? "text-orange-500" : owner?.subscriptionStatus === "CHANGE_PLAN" ? "text-blue-600" : "text-red-500"}`}>
                {owner?.subscriptionStatus || "---"}
              </span>
            </div>
            {owner?.subscriptionCancellationReason && (
              <div className="bg-background border border-border rounded-md px-3 py-1.5 flex items-center gap-2">
                <span className="text-muted-foreground">Cancellation Reason</span>
                <span className="font-semibold text-foreground">{owner.subscriptionCancellationReason}</span>
              </div>
            )}
            <div className="bg-background border border-border rounded-md px-3 py-1.5 flex items-center gap-2">
              <span className="text-muted-foreground">Price</span>
              <span className="font-semibold text-foreground">
                {owner?.currentPlanPrice != null ? `$${owner.currentPlanPrice}` : "---"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="renew" className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Renew
                </TabsTrigger>
                <TabsTrigger value="change-plan" className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  Change Plan
                </TabsTrigger>
                <TabsTrigger value="cancel" className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Cancel
                </TabsTrigger>
              </TabsList>

              {/* --- RENEW TAB --- */}
              <TabsContent value="renew" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Renew Subscription</CardTitle>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-md p-2.5">
                      <Info className="w-3.5 h-3.5 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span>New period starts from current end date <strong>{owner?.subscriptionEndDate || "---"}</strong></span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={renewForm.handleSubmit(onRenewSubmit)} className="space-y-4">
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
                      {paymentFields(renewForm.control, renewForm.formState.errors, isSubmitting)}
                      <div className="flex justify-end gap-3 pt-2">
                        <CancelButton onClick={handleClose} disabled={isSubmitting} />
                        <SubmitButton isSubmitting={isSubmitting} isDirty={renewForm.formState.isDirty} isCreate={true} createText="Renew" submittingCreateText="Renewing..." />
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* --- CHANGE PLAN TAB --- */}
              <TabsContent value="change-plan" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Change Plan</CardTitle>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-md p-2.5">
                      <Info className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" />
                      <span>Plan changes take effect immediately. New period starts from today and end date is recalculated based on the new plan&apos;s duration.</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={changePlanForm.handleSubmit(onChangePlanSubmit)} className="space-y-4">
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
                      {paymentFields(changePlanForm.control, changePlanForm.formState.errors, isSubmitting)}
                      <div className="flex justify-end gap-3 pt-2">
                        <CancelButton onClick={handleClose} disabled={isSubmitting} />
                        <SubmitButton isSubmitting={isSubmitting} isDirty={changePlanForm.formState.isDirty} isCreate={true} createText="Change Plan" submittingCreateText="Changing..." />
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* --- CANCEL TAB --- */}
              <TabsContent value="cancel" className="mt-4">
                <Card className="border-destructive/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-destructive">Cancel Subscription</CardTitle>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-red-50 border border-red-200 rounded-md p-2.5">
                      <Info className="w-3.5 h-3.5 mt-0.5 text-red-500 flex-shrink-0" />
                      <span>This will immediately cancel the subscription. Any refund amount specified will be recorded as a refund payment.</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={cancelForm.handleSubmit(onCancelSubmit)} className="space-y-4">
                      <TextField
                        control={cancelForm.control}
                        name="reason"
                        label="Reason"
                        placeholder="Cancellation reason"
                        required
                        disabled={isSubmitting}
                        error={getFieldError(cancelForm.formState.errors.reason)}
                      />
                      <div className="flex justify-end gap-3 pt-2">
                        <CancelButton onClick={handleClose} disabled={isSubmitting} />
                        <SubmitButton isSubmitting={isSubmitting} isDirty={cancelForm.formState.isDirty} isCreate={true} createText="Cancel Subscription" submittingCreateText="Cancelling..." />
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Subscription History */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-8"><Loading /></div>
                ) : subscriptionHistory.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">No subscription history found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">#</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Plan</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Duration</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Price</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Start Date</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">End Date</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Payment</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Total Paid</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptionHistory.map((row, idx) => (
                          <tr key={`${row.subscriptionId}-${idx}`} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 text-xs text-muted-foreground">{idx + 1}</td>
                            <td className="px-4 py-3 text-xs font-medium">{row.planName || "---"}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{row.planDurationType || "---"}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">${row.planPrice?.toFixed(2) ?? "0.00"}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{row.startDate || "---"}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{row.endDate || "---"}</td>
                            <td className="px-4 py-3 text-xs">
                              <span className={row.status === "ACTIVE" ? "text-green-600 font-medium" : row.status === "CANCELLED" ? "text-orange-500 font-medium" : row.status === "CHANGE_PLAN" ? "text-blue-600 font-medium" : "text-red-500"}>{row.status || "---"}</span>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <span className={row.paymentStatus === "PAID" ? "text-green-600 font-medium" : row.paymentStatus === "PENDING" || row.paymentStatus === "PARTIALLY_PAID" ? "text-yellow-600 font-medium" : "text-red-500"}>
                                {row.paymentStatus?.replace("_", " ") || "---"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">${row.totalPaid?.toFixed(2) ?? "0.00"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
