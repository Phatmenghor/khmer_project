"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useCallback, useRef, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Loader2 } from "lucide-react";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { showToast } from "@/components/shared/common/show-toast";
import { PageContainer } from "@/components/shared/common/page-container";
import { PageHeader } from "@/components/shared/common/page-header";

import { useLocationState } from "@/features/location/store/state/location-state";
import { LocationResponseModel } from "@/features/location/store/models/response/location-response";
import LocationModal from "@/features/location/components/location-modal";
import { LocationCard } from "@/features/location/components/location-card";
import { PageState } from "@/components/shared/page-state";
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

  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<LocationResponseModel | null>(null);
  const [deletingLocation, setDeletingLocation] =
    useState<LocationResponseModel | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [skeletonCount, setSkeletonCount] = useState(3);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const calculateSkeletonCount = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) setSkeletonCount(1);
    else if (width < 1024) setSkeletonCount(2);
    else setSkeletonCount(3);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    calculateSkeletonCount();
    window.addEventListener("resize", calculateSkeletonCount);
    return () => window.removeEventListener("resize", calculateSkeletonCount);
  }, [calculateSkeletonCount]);

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
    !mounted ||
    (locations.length === 0 && !locationPagination.isInitialLoaded);

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

  useEffect(() => {
    if (!locationPagination.isInitialLoaded && !isLoading.fetch) {
      const pageSize = getPageSize();
      fetchAllWithPagination({ pageNo: 1, pageSize });
    }
  }, [locationPagination.isInitialLoaded, isLoading.fetch, fetchAllWithPagination, getPageSize]);

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

  const { handleLoadMore: debouncedLoadMore } = usePaginationLoadMore(
    handleLoadMore,
    locationPagination.hasMore && !isLoading.fetch,
    [locationPagination.hasMore, isLoading.fetch, handleLoadMore]
  );

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
      showToast.success(Messages.location.deleted);
      setDeletingLocation(null);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.location.deleteFailed);
    }
  };

  const handleSetPrimary = async (locationId: string) => {
    try {
      setSettingPrimaryId(locationId);
      const location = locations.find((l) => l.id === locationId);
      if (location) {
        const updatedLocation = { ...location, isPrimary: true };
        await update({ locationId, locationData: updatedLocation }).unwrap();
        showToast.success(Messages.location.setPrimary);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.location.setPrimaryFailed);
    } finally {
      setSettingPrimaryId(null);
    }
  };

  if (isInitialLoading) {
    return (
      <PageContainer className="min-h-screen flex flex-col py-3 sm:py-5">
        <div className="h-5 w-32 bg-muted rounded mb-4 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 rounded" />
          ))}
        </div>
      </PageContainer>
    );
  }

  if (locations.length === 0) {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <PageState
            type="empty"
            title="No Saved Locations"
            description="Save your favourite delivery spots to make checkout faster."
            actionLabel="Add Your First Location"
            onAction={handleAddLocation}
            size="lg"
          />
        </div>

        <LocationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          editData={editingLocation}
          initialCoords={currentCoords}
        />
      </>
    );
  }

  return (
    <PageContainer className="min-h-screen flex flex-col py-3 sm:py-5">
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
            className="gap-1 h-6 rounded"
          >
            <Plus className="h-3 w-3" />
            <span className="hidden sm:inline">Add Location</span>
          </Button>
        }
      />

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {locations.map((location, index) => {
          const uniqueKey = `location-${location.id}-${index}`;
          return (
          <LocationCard
            key={uniqueKey}
            location={location}
            settingPrimaryId={settingPrimaryId}
            onEdit={handleEditLocation}
            onDelete={(loc) => setDeletingLocation(loc)}
            onSetPrimary={(loc) => handleSetPrimary(loc.id)}
          />
          );
        })}
      </div>

      {}
      {locationPagination.hasMore && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded" />
            ))}
          </div>

          {}
          <div className="flex flex-col items-center justify-center mt-4 py-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary mb-1" />
            <p className="text-xs sm:text-xs text-muted-foreground">
              Loading more locations...
            </p>
          </div>
        </>
      )}

      {}
      {locationPagination.hasMore && !isLoading.fetch && (
        <div ref={sentinelRef} className="h-7 w-full mt-3" />
      )}

      <LocationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editData={editingLocation}
        initialCoords={currentCoords}
      />
      <DeleteConfirmationModal
        isOpen={!!deletingLocation}
        onClose={() => setDeletingLocation(null)}
        onDelete={handleDeleteLocation}
        title="Delete Location"
        description="Are you sure you want to delete this location? This action cannot be undone."
        variant="critical"
      />
    </PageContainer>
  );
}
