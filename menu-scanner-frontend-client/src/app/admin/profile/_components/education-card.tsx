"use client";

import { GraduationCap, Plus, Trash2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomImagePreview } from "@/components/shared/image/custom-image-preview";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { DisplayField } from "@/components/shared/form-field/display-field";
import {
  EducationLevel,
  EDUCATION_LEVEL_OPTIONS,
} from "@/constants/status/user-enums";
import { AppDefault } from "@/constants/app-resource/default/default";

interface EducationCardProps {
  control: any;
  errors: any;
  isEditing: boolean;
  fields: any[];
  educationUploads: any;
  businessId?: string;
  watch: (name: string) => any;
  setValue: (name: string, value: any, options?: any) => void;
  onAppend: () => void;
  onRemove: (index: number) => void;
}

export function EducationCard({
  control,
  errors,
  isEditing,
  fields,
  educationUploads,
  businessId,
  watch,
  setValue,
  onAppend,
  onRemove,
}: EducationCardProps) {
  if (!isEditing && fields.length === 0) return null;

  const resolvedBusinessId = businessId || AppDefault.BUSINESS_ID;

  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-extrabold flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary shrink-0" />
            <span>Education</span>
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
              Add Education
            </CustomButton>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            No education added
          </p>
        ) : isEditing ? (
          <div className="space-y-3">
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
                      Education #{index + 1}
                    </span>
                    {field?.level && (
                      <span className="px-2 py-0.5 rounded-md bg-background border border-border/60 text-muted-foreground text-[10px] font-bold uppercase">
                        {EDUCATION_LEVEL_OPTIONS.find((o) => o.value === field?.level)?.label || field?.level}
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
                      name={`educations.${index}.level`}
                      label="Level"
                      placeholder="Education level"
                      options={EDUCATION_LEVEL_OPTIONS}
                      error={errors.educations?.[index]?.level as any}
                    />
                    <TextField
                      control={control}
                      name={`educations.${index}.schoolName`}
                      label="School Name"
                      placeholder="School name"
                      error={errors.educations?.[index]?.schoolName as any}
                    />
                    <TextField
                      control={control}
                      name={`educations.${index}.fieldOfStudy`}
                      label="Field of Study"
                      placeholder="Field of study"
                      error={errors.educations?.[index]?.fieldOfStudy as any}
                    />
                    <SelectField
                      control={control}
                      name={`educations.${index}.isGraduated`}
                      label="Graduated"
                      placeholder="Graduated?"
                      options={[
                        { value: "true", label: "Yes" },
                        { value: "false", label: "No" },
                      ]}
                      error={errors.educations?.[index]?.isGraduated as any}
                    />
                    <TextField
                      control={control}
                      name={`educations.${index}.startYear`}
                      label="Start Year"
                      placeholder="Start year"
                      error={errors.educations?.[index]?.startYear as any}
                    />
                    <TextField
                      control={control}
                      name={`educations.${index}.endYear`}
                      label="End Year"
                      placeholder="End year"
                      error={errors.educations?.[index]?.endYear as any}
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <SpacesImageUpload
                      deferred
                      label="Certificate"
                      businessId={resolvedBusinessId}
                      value={
                        educationUploads.getPreview(index) ||
                        watch(`educations.${index}.certificateUrl`) ||
                        ""
                      }
                      aspectRatio="1:1"
                      height="h-28 w-28"
                      onFileSelected={(file) => {
                        educationUploads.setPending(index, file);
                        if (file) {
                          setValue(
                            `educations.${index}.certificateUrl`,
                            URL.createObjectURL(file),
                            { shouldDirty: true }
                          );
                        } else {
                          setValue(`educations.${index}.certificateUrl`, "", { shouldDirty: true });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field: any, index) => (
              <div key={field.id} className="border border-border/80 rounded-xl p-4 bg-muted/20 space-y-3">
                <div className="flex items-center gap-2 pb-2.5 border-b border-border/60">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold border border-primary/20">
                    {index + 1}
                  </span>
                  <span className="text-xs font-extrabold text-foreground">
                    Education #{index + 1}
                  </span>
                  {field?.level && (
                    <span className="px-2 py-0.5 rounded-md bg-background border border-border/60 text-muted-foreground text-[10px] font-bold uppercase">
                      {EDUCATION_LEVEL_OPTIONS.find((o) => o.value === field?.level)?.label || field?.level}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <DisplayField
                    label="Level"
                    value={EDUCATION_LEVEL_OPTIONS.find((o) => o.value === field?.level)?.label}
                  />
                  <DisplayField label="School Name" value={field?.schoolName} />
                  <DisplayField label="Field of Study" value={field?.fieldOfStudy} />
                  <DisplayField
                    label="Graduated"
                    value={
                      field?.isGraduated === true || field?.isGraduated === "true"
                        ? "Yes"
                        : "No"
                    }
                  />
                  <DisplayField label="Start Year" value={field?.startYear} />
                  <DisplayField label="End Year" value={field?.endYear} />
                  {field?.certificateUrl && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">
                        Certificate (1x1)
                      </label>
                      <CustomImagePreview
                        src={field.certificateUrl}
                        alt={`${field?.schoolName || "Education"} Certificate`}
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
