"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { TextField } from "@/components/shared/form-field/text-field";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { SubmitButton } from "@/components/shared/button/submit-button";
import { PasswordField } from "@/components/shared/form-field/password-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { useAppDispatch, useAppSelector } from "@/store";
import { showToast } from "@/components/shared/common/show-toast";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { getFieldError } from "@/utils/common/get-field-error";
import {
  selectError,
  selectOperations,
} from "../store/selectors/business-owner-selectors";
import { clearError } from "../store/slice/business-owner-slice";
import {
  CreateBusinessOwnerData,
  createBusinessOwnerSchema,
} from "../store/models/schema/business-owner.schema";
import { createBusinessOwnerService } from "../store/thunks/business-owner-thunks";
import {
  selectSubscriptionPlan,
} from "@/features/master-data/store/selectors/subscription-plan-selector";
import { fetchAllSubscriptionPlanService } from "@/features/master-data/store/thunks/subscription-plan-thunks";
import { axiosClientWithAuth } from "@/utils/axios";

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

type SubdomainStatus = "idle" | "checking" | "available" | "taken";
const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateBusinessOwnerModal({ isOpen, onClose }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [subdomainStatus, setSubdomainStatus] = useState<SubdomainStatus>("idle");
  const lastAutoSlugRef = useRef("");
  const subdomainDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const reduxError = useAppSelector(selectError);
  const { isCreating } = operations;

  const allPlans = useAppSelector(selectSubscriptionPlan);
  const planOptions = (allPlans?.content ?? []).map((p) => ({
    value: p.id,
    label: `${p.name} — $${p.price}`,
  }));

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreateBusinessOwnerData>({
    resolver: zodResolver(createBusinessOwnerSchema),
    defaultValues: {
      userIdentifier: "",
      ownerEmail: "",
      ownerPassword: "",
      ownerFullName: "",
      ownerPhone: "",
      businessName: "",
      subdomain: "",
      businessEmail: "",
      businessPhone: "",
      businessAddress: "",
      planId: "",
      paymentAmount: undefined,
      paymentMethod: "",
      paymentReference: "",
      paymentNotes: "",
    },
    mode: "onChange",
  });

  const businessName = watch("businessName");
  const subdomainValue = watch("subdomain");

  // Auto-fill subdomain from business name
  useEffect(() => {
    if (!businessName) return;
    const autoSlug = slugify(businessName);
    if (subdomainValue === lastAutoSlugRef.current || subdomainValue === "") {
      lastAutoSlugRef.current = autoSlug;
      setValue("subdomain", autoSlug, { shouldValidate: false, shouldDirty: false });
    }
  }, [businessName, setValue]);

  // Debounced subdomain availability check
  useEffect(() => {
    if (subdomainDebounceRef.current) clearTimeout(subdomainDebounceRef.current);
    const val = subdomainValue ?? "";
    if (!val || val.length < 1 || !subdomainRegex.test(val)) {
      setSubdomainStatus("idle");
      return;
    }
    setSubdomainStatus("checking");
    subdomainDebounceRef.current = setTimeout(async () => {
      try {
        const res = await axiosClientWithAuth.get<{ data: boolean }>(
          `/api/v1/public/businesses/check-subdomain?subdomain=${encodeURIComponent(val)}`
        );
        setSubdomainStatus(res.data.data ? "available" : "taken");
      } catch {
        setSubdomainStatus("idle");
      }
    }, 500);
    return () => { if (subdomainDebounceRef.current) clearTimeout(subdomainDebounceRef.current); };
  }, [subdomainValue]);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
      reset();
      setSubdomainStatus("idle");
      lastAutoSlugRef.current = "";
      dispatch(fetchAllSubscriptionPlanService({ pageNo: 1, pageSize: 100 }));
    }
  }, [isOpen, dispatch, reset]);

  const onSubmit = async (data: CreateBusinessOwnerData) => {
    try {
      const result = await dispatch(
        createBusinessOwnerService({
          userIdentifier: data.userIdentifier,
          ownerEmail: data.ownerEmail,
          ownerPassword: data.ownerPassword,
          ownerFullName: data.ownerFullName,
          ownerPhone: data.ownerPhone,
          businessName: data.businessName,
          subdomain: data.subdomain,
          businessEmail: data.businessEmail,
          businessPhone: data.businessPhone,
          businessAddress: data.businessAddress,
          planId: data.planId || undefined,
          paymentAmount: data.paymentAmount,
          paymentMethod: data.paymentMethod || undefined,
          paymentReference: data.paymentReference || undefined,
          paymentNotes: data.paymentNotes || undefined,
        })
      ).unwrap();

      showToast.success(
        `Business owner "${result.businessName}" created successfully`
      );
      handleClose();
    } catch (error: any) {
      showToast.error(error || "Failed to create business owner");
    }
  };

  const handleClose = () => {
    reset();
    setSubdomainStatus("idle");
    lastAutoSlugRef.current = "";
    dispatch(clearError());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 flex flex-col">
        <DialogTitle className="sr-only">Create New Business Owner</DialogTitle>
        <FormHeader
          title="Create New Business Owner"
          description="Fill out the form to register a new business owner account"
          avatarName={businessName}
          showAvatar={true}
          isCreate={true}
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <FormBody>
            {reduxError && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded">
                <p className="text-xs text-destructive font-medium">
                  {reduxError}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {/* Account Credentials */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold">
                  Account Credentials <span className="text-destructive">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextField
                    control={control}
                    name="userIdentifier"
                    label="User Identifier"
                    placeholder="Enter user identifier"
                    required
                    disabled={isCreating}
                    error={getFieldError(errors.userIdentifier)}
                  />
                  <TextField
                    control={control}
                    name="ownerEmail"
                    label="Email"
                    type="email"
                    placeholder="Enter email address"
                    required
                    disabled={isCreating}
                    error={getFieldError(errors.ownerEmail)}
                  />
                  <PasswordField
                    control={control}
                    name="ownerPassword"
                    label="Password"
                    placeholder="Enter password"
                    required
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    disabled={isCreating}
                    error={getFieldError(errors.ownerPassword)}
                  />
                </div>
              </div>

              {/* Owner Information */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold">
                  Owner Information <span className="text-destructive">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextField
                    control={control}
                    name="ownerFullName"
                    label="Full Name"
                    placeholder="Enter owner full name"
                    required
                    disabled={isCreating}
                    error={getFieldError(errors.ownerFullName)}
                  />
                  <TextField
                    control={control}
                    name="ownerPhone"
                    label="Phone"
                    placeholder="Enter phone number"
                    required
                    disabled={isCreating}
                    error={getFieldError(errors.ownerPhone)}
                  />
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold">
                  Business Information <span className="text-destructive">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextField
                    control={control}
                    name="businessName"
                    label="Business Name"
                    placeholder="Enter business name"
                    required
                    disabled={isCreating}
                    error={getFieldError(errors.businessName)}
                  />
                  <div className="flex flex-col gap-1 w-full">
                    <div className="relative">
                      <TextField
                        control={control}
                        name="subdomain"
                        label="Subdomain"
                        placeholder="e.g. my-business"
                        required
                        disabled={isCreating}
                        error={getFieldError(errors.subdomain)}
                      />
                      {subdomainStatus !== "idle" && (
                        <span className={`absolute right-0 top-0 flex items-center gap-1 text-[10px] font-medium ${
                          subdomainStatus === "checking" ? "text-muted-foreground" :
                          subdomainStatus === "available" ? "text-emerald-600" : "text-rose-500"
                        }`}>
                          {subdomainStatus === "checking" && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                          {subdomainStatus === "available" && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {subdomainStatus === "taken" && <XCircle className="w-2.5 h-2.5" />}
                          {subdomainStatus === "checking" ? "Checking..." :
                           subdomainStatus === "available" ? "Available" : "Already taken"}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Menu URL:{" "}
                      <span className="font-medium text-foreground">
                        {subdomainValue || "your-business"}.emenu-cambodia.com
                      </span>
                    </p>
                  </div>
                  <TextField
                    control={control}
                    name="businessEmail"
                    label="Business Email"
                    type="email"
                    placeholder="Enter business email"
                    required
                    disabled={isCreating}
                    error={getFieldError(errors.businessEmail)}
                  />
                  <TextField
                    control={control}
                    name="businessPhone"
                    label="Business Phone"
                    placeholder="Enter business phone"
                    required
                    disabled={isCreating}
                    error={getFieldError(errors.businessPhone)}
                  />
                  <TextField
                    control={control}
                    name="businessAddress"
                    label="Business Address"
                    placeholder="Enter business address"
                    required
                    disabled={isCreating}
                    error={getFieldError(errors.businessAddress)}
                  />
                </div>
              </div>

              {/* Subscription Plan (optional) */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold">Subscription Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <SelectField
                    control={control}
                    name="planId"
                    label="Subscription Plan"
                    placeholder="Select a plan (optional)"
                    options={planOptions}
                    disabled={isCreating}
                    error={getFieldError(errors.planId)}
                  />
                </div>
              </div>
            </div>
          </FormBody>

          <FormFooter
            isSubmitting={isCreating}
            isDirty={isDirty}
            isCreate={true}
            createMessage="Creating business owner..."
          >
            <CancelButton onClick={handleClose} disabled={isCreating} />
            <SubmitButton
              isSubmitting={isCreating}
              isDirty={isDirty}
              isCreate={true}
              createText="Create Business Owner"
              submittingCreateText="Creating..."
            />
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
