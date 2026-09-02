"use client";

import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { DatePickerField } from "@/components/shared/form-field/date-picker-field";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { GENDER_OPTIONS } from "@/constants/app-resource/status/create-update-status";
import { dateTimeFormat, formatDate } from "@/utils/date/date-time-format";

interface PersonalInfoCardProps {
  control: any;
  errors: any;
  isEditing: boolean;
  watch: (name: string) => any;
  userProfile: any;
}

export function PersonalInfoCard({
  control,
  errors,
  isEditing,
  watch,
  userProfile,
}: PersonalInfoCardProps) {
  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-extrabold flex items-center gap-2">
          <User className="w-4 h-4 text-primary shrink-0" />
          <span>Personal Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {isEditing ? (
            <>
              <TextField
                control={control}
                name="firstName"
                label="First Name"
                placeholder="First name"
                error={errors.firstName}
              />
              <TextField
                control={control}
                name="lastName"
                label="Last Name"
                placeholder="Last name"
                error={errors.lastName}
              />
              <TextField
                control={control}
                name="nickname"
                label="Nickname"
                placeholder="Nickname"
                error={errors.nickname}
              />
              <TextField
                control={control}
                name="email"
                label="Email"
                placeholder="Email"
                type="email"
                error={errors.email}
              />
              <TextField
                control={control}
                name="phoneNumber"
                label="Phone Number"
                placeholder="Phone"
                error={errors.phoneNumber}
              />
              <SelectField
                control={control}
                name="gender"
                label="Gender"
                placeholder="Select gender"
                options={GENDER_OPTIONS}
                error={errors.gender}
              />
              <DatePickerField
                control={control}
                name="dateOfBirth"
                label="Date of Birth"
                placeholder="Date of birth"
                error={errors.dateOfBirth}
              />
            </>
          ) : (
            <>
              <DisplayField label="First Name" value={watch("firstName")} />
              <DisplayField label="Last Name" value={watch("lastName")} />
              <DisplayField label="Nickname" value={watch("nickname")} />
              <DisplayField label="Email" value={watch("email")} />
              <DisplayField label="Phone Number" value={watch("phoneNumber")} />
              <DisplayField
                label="Gender"
                value={GENDER_OPTIONS.find((o) => o.value === watch("gender"))?.label}
              />
              <DisplayField label="Date of Birth" value={formatDate(watch("dateOfBirth"))} />
              <DisplayField label="Telegram ID" value={userProfile?.telegramId} />
              <DisplayField label="Telegram Username" value={userProfile?.telegramUsername} />
              <DisplayField label="Telegram First Name" value={userProfile?.telegramFirstName} />
              <DisplayField label="Telegram Last Name" value={userProfile?.telegramLastName} />
              <DisplayField
                label="Telegram Synced At"
                value={dateTimeFormat(userProfile?.telegramSyncedAt)}
              />
              <DisplayField
                label="Telegram Synced"
                value={userProfile?.telegramSynced ? "Yes" : "No"}
              />
              <DisplayField
                label="Role"
                value={
                  userProfile?.roles && userProfile.roles.length > 0
                    ? userProfile.roles.join(", ")
                    : "-"
                }
              />
              <DisplayField
                label="Account Status"
                value={userProfile?.accountStatus || "-"}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
