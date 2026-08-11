"use client";

import { MapPin, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { DisplayField } from "@/components/shared/form-field/display-field";
import {
  AddressType,
  ADDRESS_TYPE_OPTIONS,
} from "@/constants/status/user-enums";

interface AddressCardProps {
  control: any;
  errors: any;
  isEditing: boolean;
  fields: any[];
  onAppend: () => void;
  onRemove: (index: number) => void;
}

export function AddressCard({
  control,
  errors,
  isEditing,
  fields,
  onAppend,
  onRemove,
}: AddressCardProps) {
  if (!isEditing && fields.length === 0) return null;

  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-extrabold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span>Addresses</span>
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
              Add Address
            </CustomButton>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            No addresses added
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
                      Address #{index + 1}
                    </span>
                    {field?.addressType && (
                      <span className="px-2 py-0.5 rounded-md bg-background border border-border/60 text-muted-foreground text-[10px] font-bold uppercase">
                        {ADDRESS_TYPE_OPTIONS.find((o) => o.value === field?.addressType)?.label || field?.addressType}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <SelectField
                    control={control}
                    name={`addresses.${index}.addressType`}
                    label="Type"
                    placeholder="Type"
                    options={ADDRESS_TYPE_OPTIONS}
                    error={errors.addresses?.[index]?.addressType as any}
                  />
                  <TextField
                    control={control}
                    name={`addresses.${index}.houseNo`}
                    label="House No"
                    placeholder="No"
                    error={errors.addresses?.[index]?.houseNo as any}
                  />
                  <TextField
                    control={control}
                    name={`addresses.${index}.street`}
                    label="Street"
                    placeholder="Street"
                    error={errors.addresses?.[index]?.street as any}
                  />
                  <TextField
                    control={control}
                    name={`addresses.${index}.village`}
                    label="Village"
                    placeholder="Village"
                    error={errors.addresses?.[index]?.village as any}
                  />
                  <TextField
                    control={control}
                    name={`addresses.${index}.commune`}
                    label="Commune"
                    placeholder="Commune"
                    error={errors.addresses?.[index]?.commune as any}
                  />
                  <TextField
                    control={control}
                    name={`addresses.${index}.district`}
                    label="District"
                    placeholder="District"
                    error={errors.addresses?.[index]?.district as any}
                  />
                  <TextField
                    control={control}
                    name={`addresses.${index}.province`}
                    label="Province"
                    placeholder="Province"
                    error={errors.addresses?.[index]?.province as any}
                  />
                  <TextField
                    control={control}
                    name={`addresses.${index}.country`}
                    label="Country"
                    placeholder="Country"
                    error={errors.addresses?.[index]?.country as any}
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
                    Address #{index + 1}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <DisplayField
                    label="Type"
                    value={ADDRESS_TYPE_OPTIONS.find((o) => o.value === field?.addressType)?.label}
                  />
                  <DisplayField label="House No" value={field?.houseNo} />
                  <DisplayField label="Street" value={field?.street} />
                  <DisplayField label="Village" value={field?.village} />
                  <DisplayField label="Commune" value={field?.commune} />
                  <DisplayField label="District" value={field?.district} />
                  <DisplayField label="Province" value={field?.province} />
                  <DisplayField label="Country" value={field?.country} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
