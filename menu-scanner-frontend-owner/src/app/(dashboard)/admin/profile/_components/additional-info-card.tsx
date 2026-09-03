"use client";

import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { DisplayField } from "@/components/shared/form-field/display-field";

interface AdditionalInfoCardProps {
  control: any;
  errors: any;
  isEditing: boolean;
  watch: (name: string) => any;
}

export function AdditionalInfoCard({
  control,
  errors,
  isEditing,
  watch,
}: AdditionalInfoCardProps) {
  if (!isEditing && !watch("remark")) return null;

  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-extrabold flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary shrink-0" />
          <span>Additional Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <TextareaField
            control={control}
            name="remark"
            label="Remarks"
            placeholder="Enter remarks or additional information"
            rows={4}
            error={errors.remark}
          />
        ) : (
          <DisplayField label="Remarks" value={watch("remark")} />
        )}
      </CardContent>
    </Card>
  );
}
