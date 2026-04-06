"use client";

import React, { useEffect, useCallback, useRef, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, CheckCircle2, Loader2 } from "lucide-react";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { showToast } from "@/components/shared/common/show-toast";
import { PageContainer } from "@/components/shared/common/page-container";
import { useAppSelector } from "@/redux/store";
import { selectBusinessColors } from "@/redux/features/business/store/selectors/business-settings-selector";
import { PageHeader } from "@/components/shared/common/page-header";

import { useLocationState } from "@/redux/features/location/store/state/location-state";
import { LocationResponseModel } from "@/redux/features/location/store/models/response/location-response";
import LocationModal from "@/redux/features/location/components/location-modal";
import { LocationCard } from "@/redux/features/location/components/location-card";
import { LocationEmptyState } from "@/redux/features/location/components/location-empty-state";
import { usePaginationLoadMore } from "@/hooks/use-pagination-load-more";
import { Skeleton } from "@/components/ui/skeleton";

export default function LocationPage() {
  const {
    locations,
    primaryLocation,
    locationCount,
    isLoading,
    locationPagination,
    update,
    remove,
    fetchAllWithPagination,
  } = useLocationState();

  const colors = useAppSelector(selectBusinessColors);
  const primaryColor = colors.primary;

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingLocation, setEditingLocation] =
    React.useState<LocationResponseModel | null>(null);
  const [deletingLocation, setDeleteingLocation] =
    React.useState<LocationResponseModel | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = React.useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [skeletonCount, setSkeletonCount] = useState(3);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Calculate responsive skeleton count based on screen width
  const calculateSkeletonCount = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) setSkeletonCount(1);
    else if (width < 1024) setSkeletonCount(2);
    else setSkeletonCount(3);
  }, []);

  // Handle window resize for skeleton count
  useEffect(() => {
    calculateSkeletonCount();
    window.addEventListener("resize", calculateSkeletonCount);
    return () => window.removeEventListener("resize", calculateSkeletonCount);
  }, [calculateSkeletonCount]);

  // Calculate responsive page size
  const getPageSize = useMemo(() => {
    return () => {
      if (typeof window === "undefined") return 6;
      const width = window.innerWidth;
      if (width >= 1024) return 12;
      if (width >= 640) return 9;
      return 6;
    };
  }, []);

  const isInitialLoading =
    isLoading.fetch &&
    locations.length === 0 &&
    !locationPagination.isInitialLoaded;

  // Get user GPS coords on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCurrentCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {},
    );
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!locationPagination.isInitialLoaded && !isLoading.fetch) {
      const pageSize = getPageSize();
      fetchAllWithPagination({ pageNo: 1, pageSize });
    }
  }, [locationPagination.isInitialLoaded, isLoading.fetch, fetchAllWithPagination, getPageSize]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (
      locationPagination.hasMore &&
      !isLoading.fetch &&
      locations.length > 0
    ) {
      const nextPage = locationPagination.currentPage + 1;
      const pageSize = getPageSize();
      fetchAllWithPagination({ pageNo: nextPage, pageSize });
    }
  }, [
    locationPagination.hasMore,
    locationPagination.currentPage,
    isLoading.fetch,
    locations.length,
    fetchAllWithPagination,
    getPageSize,
  ]);

  // Smart pagination with debounce
  const { handleLoadMore: debouncedLoadMore } = usePaginationLoadMore(
    handleLoadMore,
    locationPagination.hasMore && !isLoading.fetch,
    [locationPagination.hasMore, isLoading.fetch, handleLoadMore]
  );

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!locationPagination.hasMore || !sentinelRef.current) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          debouncedLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observerRef.current = observer;
    observer.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [locationPagination.hasMore, debouncedLoadMore]);

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
    } catch (error: any) {
      showToast.error(error?.message || "Failed to delete location");
    }
  };

  const handleSetPrimary = async (locationId: string) => {
    try {
      setSettingPrimaryId(locationId);
      const location = locations.find((l) => l.id === locationId);
      if (location) {
        const updatedLocation = { ...location, isPrimary: true };
        await update({ locationId, locationData: updatedLocation }).unwrap();
        showToast.success("Location set as primary");
      }
    } catch (error: any) {
      showToast.error(error?.message || "Failed to set primary location");
    } finally {
      setSettingPrimaryId(null);
    }
  };

  // Loading skeleton
  if (isInitialLoading) {
    return (
      <PageContainer className="py-4 sm:py-8">
        <div className="h-8 w-48 bg-muted rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </PageContainer>
    );
  }

  // Empty state
  if (locations.length === 0) {
    return <LocationEmptyState onAddNew={handleAddLocation} />;
  }

  // Locations grid with infinite scroll
  return (
    <PageContainer className="py-4 sm:py-8">
      <PageHeader
        title="My Locations"
        icon={MapPin}
        count={locationCount}
        countLabel={locationCount === 1 ? "location" : "locations"}
        subtitle="Manage your saved addresses"
        actions={
          <Button
            onClick={handleAddLocation}
            size="sm"
            className="gap-2 h-9 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Location</span>
          </Button>
        }
      />

      {/* Locations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location, index) => {
          const uniqueKey = `location-${location.id}-${index}`;
          return (
          <LocationCard
            key={uniqueKey}
            location={location}
            isPrimary={primaryLocation?.id === location.id}
            onEdit={() => handleEditLocation(location)}
            onDelete={() => setDeleteingLocation(location)}
            onSetPrimary={() => handleSetPrimary(location.id)}
            isSettingPrimary={settingPrimaryId === location.id}
            currentCoords={currentCoords}
            primaryColor={primaryColor}
          />
          );
        })}
      </div>

      {/* Skeleton loaders ALWAYS show while hasMore: true */}
      {locationPagination.hasMore && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {Array.from({ length: skeletonCount }).map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>

          {/* Loading spinner */}
          <div className="flex flex-col items-center justify-center mt-6 py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              Loading more locations...
            </p>
          </div>
        </>
      )}

      {/* Sentinel element for scroll detection */}
      {locationPagination.hasMore && !isLoading.fetch && (
        <div ref={sentinelRef} className="h-10 w-full mt-4" />
      )}

      {/* End of locations message */}
      {!locationPagination.hasMore && locations.length > 0 && (
        <div className="flex flex-col items-center justify-center mt-12 py-8 px-4">
          <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-4">
            <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-center">
            All locations loaded!
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-md">
            You've loaded all your saved locations. Add a new one to expand your coverage.
          </p>
        </div>
      )}

      {/* Location Modal */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editData={editingLocation}
        initialCoords={currentCoords}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingLocation}
        onClose={() => setDeleteingLocation(null)}
        onDelete={handleDeleteLocation}
        title="Delete Location"
        description="Are you sure you want to delete this location? This action cannot be undone."
        variant="critical"
      />
    </PageContainer>
  );
}
