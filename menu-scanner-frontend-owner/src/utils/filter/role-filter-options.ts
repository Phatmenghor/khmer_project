import { convertEnumOrString } from "@/utils/common/enum-convert";

export interface FilterOptionItem {
  value: string;
  label: string;
}

/**
 * Builds reusable role filter options for custom select filters across admin pages.
 */
export function buildRoleFilterOptions(rolesList: Array<{ name: string }>): FilterOptionItem[] {
  return [
    { value: "ALL", label: "All Roles" },
    ...(rolesList || []).map((role) => ({
      value: role.name,
      label: convertEnumOrString(role.name),
    })),
  ];
}
