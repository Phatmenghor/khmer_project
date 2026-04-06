"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Loading } from "@/components/shared/common/loading";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { showToast } from "@/components/shared/common/show-toast";
import { PageContainer } from "@/components/shared/common/page-container";
import { useAppSelector } from "@/redux/store";
import { selectBusinessColors } from "@/redux/features/business/store/selectors/business-settings-selector";

import { useLocationState } from "@/redux/features/location/store/state/location-state";
import { LocationResponseModel } from "@/redux/features/location/store/models/response/location-response";
import LocationModal from "@/redux/features/location/components/location-modal";
import { LocationCard } from "@/redux/features/location/components/location-card";
import { LocationEmptyState } from "@/redux/features/location/components/location-empty-state";
import { isLocationPrimary } from "@/redux/features/location/utils/location-helpers";

const ITEMS_PER_PAGE = 6;

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

  const colors = useAppSelector(selectBusinessColors);
  const primaryColor = colors.primary;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationResponseModel | null>(null);
  const [deletingLocation, setDeleteingLocation] = useState<LocationResponseModel | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Get user GPS coords on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  // Fetch locations on mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Pagination logic
  const paginatedLocations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return locations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [locations, currentPage]);

  const totalPages = Math.ceil(locations.length / ITEMS_PER_PAGE);

  // Handlers
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
      setDeleteingLocation(null);
      if (paginatedLocations.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
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

  if (isLoading && locations.length === 0) {
    return (
      <PageContainer className="max-w-6xl">
        <div className="py-8">
          <Loading />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-6xl">
      <div className="flex flex-1 flex-col gap-4 py-4">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-foreground">My Locations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your saved delivery addresses for faster checkout
          </p>
        </div>

        {/* Premium Header Card */}
        <Card className="mb-6 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-xl"
                  style={{
                    backgroundColor: primaryColor ? `${primaryColor}15` : "hsl(var(--primary) / 0.1)",
                  }}
                >
                  <MapPin
                    className="h-6 w-6"
                    style={{ color: primaryColor || "hsl(var(--primary))" }}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {locationCount} {locationCount === 1 ? "Location" : "Locations"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {primaryLocation ? "Primary location set" : "Set a primary location"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {primaryLocation && (
                  <Badge
                    className="hidden sm:flex items-center gap-1 text-xs py-1 px-3"
                    style={{
                      backgroundColor: `${primaryColor}20` || "hsl(var(--primary) / 0.2)",
                      color: primaryColor || "hsl(var(--primary))",
                      borderColor: `${primaryColor}40` || "hsl(var(--primary) / 0.4)",
                    }}
                    variant="outline"
                  >
                    <Star className="h-3 w-3 fill-current" />
                    Primary Set
                  </Badge>
                )}
                <Button
                  onClick={handleAddLocation}
                  size="sm"
                  className="gap-2 rounded-xl h-10"
                  style={{
                    backgroundColor: primaryColor || "hsl(var(--primary))",
                  }}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Location</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {locations.length === 0 ? (
          <div className="bg-background rounded-2xl border shadow-sm overflow-hidden">
            <LocationEmptyState onAdd={handleAddLocation} />
          </div>
        ) : (
          <>
            {/* Locations Grid */}
            <div className="grid gap-3">
              {paginatedLocations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  settingPrimaryId={settingPrimaryId}
                  onEdit={handleEditLocation}
                  onDelete={setDeleteingLocation}
                  onSetPrimary={handleSetPrimary}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min(currentPage * ITEMS_PER_PAGE, locations.length)} of {locationCount} locations
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg"
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                        className="h-8 w-8 p-0 rounded-lg"
                        style={
                          currentPage === i + 1
                            ? { backgroundColor: primaryColor || "hsl(var(--primary))" }
                            : {}
                        }
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editData={editingLocation}
        initialCoords={currentCoords}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmationModal
        isOpen={!!deletingLocation}
        onClose={() => setDeleteingLocation(null)}
        onDelete={handleDeleteLocation}
        title="Delete Location"
        description="Are you sure you want to delete this location? This action cannot be undone."
        itemName={deletingLocation?.label || deletingLocation?.fullAddress}
        isSubmitting={operations.isDeleting}
      />
    </PageContainer>
  );
}
