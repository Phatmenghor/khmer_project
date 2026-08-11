"use client";

import { PhoneCall, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
import { TextField } from "@/components/shared/form-field/text-field";
import { DisplayField } from "@/components/shared/form-field/display-field";

interface EmergencyContactCardProps {
  control: any;
  errors: any;
  isEditing: boolean;
  fields: any[];
  onAppend: () => void;
  onRemove: (index: number) => void;
}

export function EmergencyContactCard({
  control,
  errors,
  isEditing,
  fields,
  onAppend,
  onRemove,
}: EmergencyContactCardProps) {
  if (!isEditing && fields.length === 0) return null;

  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-extrabold flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-primary shrink-0" />
            <span>Emergency Contacts</span>
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
              Add Contact
            </CustomButton>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            No emergency contacts added
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
                      Contact #{index + 1}
                    </span>
                    {field?.name && (
                      <span className="px-2 py-0.5 rounded-md bg-background border border-border/60 text-muted-foreground text-[10px] font-bold">
                        {field?.name}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <TextField
                    control={control}
                    name={`emergencyContacts.${index}.name`}
                    label="Name"
                    placeholder="Name"
                    error={errors.emergencyContacts?.[index]?.name as any}
                  />
                  <TextField
                    control={control}
                    name={`emergencyContacts.${index}.phone`}
                    label="Phone"
                    placeholder="Phone"
                    error={errors.emergencyContacts?.[index]?.phone as any}
                  />
                  <TextField
                    control={control}
                    name={`emergencyContacts.${index}.relationship`}
                    label="Relationship"
                    placeholder="Relationship"
                    error={errors.emergencyContacts?.[index]?.relationship as any}
                  />
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
                    Contact #{index + 1}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <DisplayField label="Name" value={field?.name} />
                  <DisplayField label="Phone" value={field?.phone} />
                  <DisplayField label="Relationship" value={field?.relationship} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
