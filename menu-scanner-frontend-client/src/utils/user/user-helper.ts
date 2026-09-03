import { ImageUrls } from "@/features/auth/store/models/request/users-request";

export interface ProfileImageHolder {
  profileImage?: string | ImageUrls | null;
  profileImageUrl?: string | null;
}

export interface UserProfileDto {
  roleName?: string;
  role?: string;
  roles?: string[];
  userType?: string;
  email?: string;
  ownerEmail?: string;
  businessEmail?: string;
  userIdentifier?: string;
}

/**
 * Safely extracts the profile image URL from a profile or user object.
 */
export function getProfileImageUrl(
  item?: ProfileImageHolder | null,
  size: "sm" | "md" | "o" = "sm"
): string {
  if (!item) return "";
  if (typeof item.profileImage === "string") {
    return item.profileImage;
  }
  if (item.profileImage && typeof item.profileImage === "object") {
    return (
      item.profileImage[size] ||
      item.profileImage.sm ||
      item.profileImage.md ||
      item.profileImage.o ||
      ""
    );
  }
  return item.profileImageUrl || "";
}

/**
 * Safely computes initial letters from a user's full name, first name, or fallback.
 */
export function getUserInitials(name?: string | null, fallback = "U"): string {
  if (!name || !name.trim()) return fallback;
  return name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Extracts raw role string directly from Backend UserResponse DTO.
 */
export function getRawUserRole(profile?: UserProfileDto | null): string {
  if (!profile) return "";
  return (
    profile.roleName ||
    profile.role ||
    (Array.isArray(profile.roles) && profile.roles.length > 0 ? profile.roles[0] : "") ||
    profile.userType ||
    ""
  );
}

/**
 * Cleanly gets and displays whatever role the Backend UserResponse DTO returns.
 * Purely follows API response without any manual conditional overrides.
 */
export function getUserDisplayRole(profile?: UserProfileDto | null): string {
  const rawRole = getRawUserRole(profile);
  if (!rawRole) return "";

  return String(rawRole)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Cleanly resolves the user's email address directly from Backend UserResponse DTO.
 */
export function getUserDisplayEmail(profile?: UserProfileDto | null): string {
  if (!profile) return "-";
  return (
    profile.email ||
    profile.ownerEmail ||
    profile.businessEmail ||
    (profile.userIdentifier?.includes("@") ? profile.userIdentifier : "") ||
    profile.userIdentifier ||
    "-"
  );
}
