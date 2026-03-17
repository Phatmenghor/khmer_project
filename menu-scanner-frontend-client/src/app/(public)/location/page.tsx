"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/common/page-header";
import { Loading } from "@/components/shared/common/loading";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { showToast } from "@/components/shared/common/show-toast";
import { PageContainer } from "@/components/shared/common/page-container";

import { useLocationState } from "@/redux/features/location/store/state/location-state";
import { LocationResponseModel } from "@/redux/features/location/store/models/response/location-response";
import LocationModal from "@/redux/features/location/components/location-modal";
import { LocationCard } from "@/redux/features/location/components/location-card";
import { LocationEmptyState } from "@/redux/features/location/components/location-empty-state";
import { LocationPrimaryBanner } from "@/redux/features/location/components/location-primary-banner";
import { isLocationPrimary } from "@/redux/features/location/utils/location-helpers";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function LocationPage() {
  const {
    locations,
    primaryLocation,
    locationCount,
    isLoading,
    operations,
    fetchAll,
    update,
    remove,
  } = useLocationState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<LocationResponseModel | null>(null);
  const [deletingLocation, setDeletingLocation] =
    useState<LocationResponseModel | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Grab user GPS coords once on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCurrentCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {}
    );
  }, []);

  // Fetch saved locations on mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleAddLocation = useCallback(() => {
    setEditingLocation(null);
    setIsModalOpen(true);
  }, []);

  const handleEditLocation = useCallback((location: LocationResponseModel) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingLocation(null);
  }, []);

  const handleDeleteLocation = async () => {
    if (!deletingLocation) return;
    try {
      await remove(deletingLocation.id).unwrap();
      showToast.success("Location deleted successfully");
      setDeletingLocation(null);
    } catch (error: any) {
      showToast.error(error?.message || "Failed to delete location");
    }
  };

  const handleSetPrimary = async (location: LocationResponseModel) => {
    if (isLocationPrimary(location)) return;
    setSettingPrimaryId(location.id);
    try {
      await update({
        locationId: location.id,
        locationData: {
          label: location.label ?? "",
          latitude: location.latitude ?? 0,
          longitude: location.longitude ?? 0,
          houseNumber: location.houseNumber || "",
          streetNumber: location.streetNumber || "",
          village: location.village || "",
          commune: location.commune || "",
          district: location.district || "",
          province: location.province || "",
          country: location.country || "",
          note: location.note || "",
          isPrimary: true,
          locationImages: location.locationImages ?? [],
        },
      }).unwrap();
      showToast.success("Primary location updated");
    } catch (error: any) {
      showToast.error(error?.message || "Failed to set primary location");
    } finally {
      setSettingPrimaryId(null);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageContainer className="py-8">
          <Loading />
        </PageContainer>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <PageContainer className="py-4 sm:py-6">
        <PageHeader
          title="My Locations"
          icon={MapPin}
          count={locationCount}
          subtitle="Manage your saved delivery addresses"
          actions={
            <div className="flex items-center gap-2">
              {primaryLocation && (
                <Badge
                  variant="outline"
                  className="hidden sm:flex items-center gap-1 text-xs py-1 px-2.5 border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-700"
                >
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  Primary set
                </Badge>
              )}
              <Button onClick={handleAddLocation} size="sm" className="shadow-sm gap-1.5 shrink-0 rounded-xl">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Location</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          }
        />
        {/* ── Primary location banner ── */}
        {primaryLocation && (
          <LocationPrimaryBanner location={primaryLocation} />
        )}

        {/* ── Content ── */}
        {locations.length === 0 ? (
          <div className="bg-background rounded-2xl border shadow-sm overflow-hidden">
            <LocationEmptyState onAdd={handleAddLocation} />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                settingPrimaryId={settingPrimaryId}
                onEdit={handleEditLocation}
                onDelete={setDeletingLocation}
                onSetPrimary={handleSetPrimary}
              />
            ))}
          </div>
        )}
      </PageContainer>

      {/* ── Add / Edit modal ── */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editData={editingLocation}
        initialCoords={currentCoords}
      />

      {/* ── Delete confirmation ── */}
      <DeleteConfirmationModal
        isOpen={!!deletingLocation}
        onClose={() => setDeletingLocation(null)}
        onDelete={handleDeleteLocation}
        title="Delete Location"
        description="Are you sure you want to delete this location? This action cannot be undone."
        itemName={deletingLocation?.label}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
