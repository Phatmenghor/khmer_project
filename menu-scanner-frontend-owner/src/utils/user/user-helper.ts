import { ImageUrls } from "@/features/auth/store/models/request/users-request";

export interface ProfileImageHolder {
  profileImage?: string | ImageUrls | null;
  profileImageUrl?: string | null;
}

/**
 * Safely extracts the profile image URL from a profile or user object.
 * Handles string URLs, ImageUrls objects ({ sm, md, o }), and legacy profileImageUrl fields.
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
