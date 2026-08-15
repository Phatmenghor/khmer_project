"use client";

import { FileText, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomImagePreview } from "@/components/shared/image/custom-image-preview";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { DisplayField } from "@/components/shared/form-field/display-field";
import {
  DocumentType,
  DOCUMENT_TYPE_OPTIONS,
} from "@/constants/status/user-enums";
import { AppDefault } from "@/constants/app-resource/default/default";

interface DocumentsCardProps {
  control: any;
  errors: any;
  isEditing: boolean;
  fields: any[];
  documentUploads: any;
  businessId?: string;
  watch: (name: any) => any;
  setValue: (name: any, value: any, options?: any) => void;
  onAppend: () => void;
  onRemove: (index: number) => void;
}

export function DocumentsCard({
  control,
  errors,
  isEditing,
  fields,
  documentUploads,
  businessId,
  watch,
  setValue,
  onAppend,
  onRemove,
}: DocumentsCardProps) {
  if (!isEditing && fields.length === 0) return null;

  const resolvedBusinessId = businessId || AppDefault.BUSINESS_ID;

  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-extrabold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <span>Documents</span>
          </CardTitle>
          {isEditing && (
            <CustomButton
              type="button"
              size="sm"
              variant="outline"
              onClick={onAppend}
              className="gap-1 font-bold text-xs h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Document
            </CustomButton>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            No documents added
          </p>
        ) : isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fields.map((field: any, index) => (
              <div
                key={field.id}
                className="border border-border/80 rounded-xl p-4 bg-muted/20 hover:bg-muted/30 transition-all space-y-3"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold border border-primary/20">
                      {index + 1}
                    </span>
                    <span className="text-xs font-extrabold text-foreground">
                      Document #{index + 1}
                    </span>
                    {field?.type && (
                      <span className="px-2 py-0.5 rounded-md bg-background border border-border/60 text-muted-foreground text-[10px] font-bold uppercase">
                        {DOCUMENT_TYPE_OPTIONS.find((o) => o.value === field?.type)?.label || field?.type}
                      </span>
                    )}
                  </div>
                  <CustomButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:bg-red-500/10 h-7 px-2 font-bold text-xs gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </CustomButton>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <SelectField
                      control={control}
                      name={`documents.${index}.type`}
                      label="Type"
                      placeholder="Type"
                      options={DOCUMENT_TYPE_OPTIONS}
                      error={errors.documents?.[index]?.type as any}
                    />
                    <TextField
                      control={control}
                      name={`documents.${index}.number`}
                      label="Number"
                      placeholder="Number"
                      error={errors.documents?.[index]?.number as any}
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <SpacesImageUpload
                      deferred
                      label="File"
                      businessId={resolvedBusinessId}
                      value={
                        documentUploads.getPreview(index) ||
                        watch(`documents.${index}.fileUrl`) ||
                        ""
                      }
                      aspectRatio="1:1"
                      height="h-28 w-28"
                      onFileSelected={(file) => {
                        documentUploads.setPending(index, file);
                        if (file) {
                          setValue(
                            `documents.${index}.fileUrl`,
                            URL.createObjectURL(file),
                            { shouldDirty: true }
                          );
                        } else {
                          setValue(`documents.${index}.fileUrl`, "", { shouldDirty: true });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fields.map((field: any, index) => (
              <div key={field.id} className="border border-border/80 rounded-xl p-4 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold border border-primary/20">
                      {index + 1}
                    </span>
                    <span className="text-xs font-extrabold text-foreground">
                      Document #{index + 1}
                    </span>
                  </div>
                  {field?.type && (
                    <span className="px-2 py-0.5 rounded-md bg-background border border-border/60 text-muted-foreground text-[10px] font-bold uppercase">
                      {DOCUMENT_TYPE_OPTIONS.find((o) => o.value === field?.type)?.label || field?.type}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <DisplayField
                      label="Type"
                      value={DOCUMENT_TYPE_OPTIONS.find((o) => o.value === field?.type)?.label}
                    />
                    <DisplayField label="Number" value={field?.number} />
                  </div>
                  {field?.fileUrl && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">
                        File Attachment (1x1)
                      </label>
                      <CustomImagePreview
                        src={field.fileUrl}
                        alt={`${field?.number || "Document"} Attachment`}
                        aspectRatio="1x1"
                        className="h-24 w-24 rounded-xl border border-border/80 shadow-2xs cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
