import { useState, useCallback } from "react";

export interface SocialMedia {
  name: string;
  imageUrl: string;
  linkUrl: string;
}

export interface BusinessSettings {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  businessId: string;
  businessName: string;
  taxPercentage: number | null;
  logoBusinessUrl: string;
  enableStock: "ENABLED" | "DISABLED";
  socialMedia: SocialMedia[];
}

export interface UpdateBusinessSettingsPayload {
  taxPercentage?: number | null;
  logoBusinessUrl?: string;
  enableStock?: "ENABLED" | "DISABLED";
  socialMedia?: SocialMedia[];
}

/**
 * Custom hook for managing business settings
 * Handles fetching and updating business settings
 */
export const useBusinessSettings = () => {
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch current business settings
   */
  const fetchBusinessSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/v1/business-settings/current");
      if (!response.ok) {
        throw new Error("Failed to fetch business settings");
      }

      const result = await response.json();
      const data = result.data || result;
      setBusinessSettings(data);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update business settings
   */
  const updateBusinessSettings = useCallback(
    async (payload: UpdateBusinessSettingsPayload): Promise<BusinessSettings> => {
      try {
        setIsSaving(true);
        setError(null);

        const response = await fetch("/api/v1/business-settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to update business settings");
        }

        const result = await response.json();
        const data = result.data || result;
        setBusinessSettings(data);

        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  /**
   * Reset error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    businessSettings,
    isLoading,
    isSaving,
    error,
    fetchBusinessSettings,
    updateBusinessSettings,
    clearError,
  };
};
