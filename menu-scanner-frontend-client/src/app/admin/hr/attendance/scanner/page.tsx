"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { checkInAttendanceService, fetchAttendanceListService, fetchTodayAttendanceService } from "@/features/hr/store/thunks/hr-thunks";
import { useHRState } from "@/features/hr/store/state/hr-state";
import { selectUser } from "@/features/auth/store/selectors/auth-selectors";
import { showToast } from "@/components/shared/common/show-toast";
import { AppDefault } from "@/constants/app-resource/default/default";
import Link from "next/link";
import { ROUTES } from "@/constants/app-routes/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
import { ArrowLeft, Flashlight, SwitchCamera, QrCode, MapPin } from "lucide-react";
import { AttendanceModel } from "@/features/hr/store/models/hr-models";

// Dedicated Modular HR Components
import { AttendanceSuccessModal } from "@/features/hr/components/attendance-success-modal";
import { AttendanceErrorModal } from "@/features/hr/components/attendance-error-modal";
import { AttendanceViewfinder } from "@/features/hr/components/attendance-viewfinder";
import { AttendanceQuickActions } from "@/features/hr/components/attendance-quick-actions";
import { AttendanceRecentLogsPanel } from "@/features/hr/components/attendance-recent-logs-panel";

function AttendanceScannerPageInner() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);
  const { todayAttendanceList } = useHRState();

  const activeBusinessId = (currentUser as any)?.businessId || AppDefault.BUSINESS_ID;
  const currentUserId = (currentUser as any)?.userId || (currentUser as any)?.id;

  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraInitializing, setIsCameraInitializing] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Dynamic Loading States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<"scan" | "upload" | "quick" | null>(null);
  
  // Success & Error Modal Dialog States
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successResult, setSuccessResult] = useState<AttendanceModel | null>(null);
  const [lastScannedResult, setLastScannedResult] = useState<AttendanceModel | null>(null);

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Geolocation state
  const [locationStatus, setLocationStatus] = useState<"granted" | "denied" | "prompt">("prompt");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Clean error message parser helper
  const getCleanErrorMessage = (err: any): string => {
    if (typeof err === "string") return err;
    if (err?.message && typeof err.message === "string") return err.message;
    if (err?.response?.data?.message && typeof err.response.data.message === "string") {
      return err.response.data.message;
    }
    if (err?.data?.message && typeof err.data.message === "string") {
      return err.data.message;
    }
    return "Attendance check-in action could not be completed.";
  };

  const triggerErrorModal = (err: any, fallback: string) => {
    const msg = getCleanErrorMessage(err) || fallback;
    setErrorMessage(msg);
    setIsErrorModalOpen(true);
    showToast.error(msg);
  };

  // Silent Geolocation Request
  const requestLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Play audio chime beep sound on successful scan
  const playBeep = () => {
    try {
      const AudioCtx = window.location && (window.AudioContext || (window as any).webkitAudioContext);
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Ignore audio errors
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start camera stream with resilient fallback & loading state
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setIsCameraInitializing(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera API is not supported in this browser.");
        setIsCameraInitializing(false);
        return;
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        setIsCameraInitializing(false);
        scanFrame();
      }
    } catch {
      setIsCameraActive(false);
      setIsCameraInitializing(false);
      setCameraError("Click 'Enable Camera' to allow live scanning, or use Upload QR.");
    }
  };

  // Toggle Torch
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
      if (capabilities.torch) {
        const nextState = !isTorchOn;
        await track.applyConstraints({ advanced: [{ torch: nextState }] } as any);
        setIsTorchOn(nextState);
      } else {
        showToast.error("Flashlight torch is not supported on this camera.");
      }
    } catch {
      showToast.error("Could not toggle flashlight.");
    }
  };

  // Switch Facing Camera
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Frame scanner loop using BarcodeDetector API
  const scanFrame = async () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    try {
      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes && barcodes.length > 0) {
          const rawValue = barcodes[0].rawValue;
          if (rawValue) {
            handleQrPayload(rawValue);
            return;
          }
        }
      }
    } catch {
      // Frame scan pass
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const fetchTodayLogs = () => {
    dispatch(fetchTodayAttendanceService({ businessId: activeBusinessId }));
  };

  useEffect(() => {
    requestLocation();
    startCamera();
    fetchTodayLogs();
    return () => {
      stopCamera();
    };
  }, [facingMode, activeBusinessId]);

  // Handle uploaded image file
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingAction("upload");
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        const barcodes = await detector.detect(img);
        if (barcodes && barcodes.length > 0) {
          handleQrPayload(barcodes[0].rawValue);
          return;
        }
      }

      triggerErrorModal("Could not read QR code from image file.", "Could not read QR code from image file.");
    } catch (err: any) {
      triggerErrorModal(err, "Failed to process QR image file.");
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  };

  // Process decoded QR payload and trigger check-in API
  const handleQrPayload = async (rawValue: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setProcessingAction("scan");
    stopCamera();

    let userId = rawValue.trim();
    let scannedBusinessId: string | undefined = undefined;

    try {
      if (rawValue.startsWith("{")) {
        const parsed = JSON.parse(rawValue);
        if (parsed.userId) userId = parsed.userId;
        if (parsed.businessId) scannedBusinessId = parsed.businessId;
      }

      const res = await dispatch(
        checkInAttendanceService({
          userId: (userId && !userId.startsWith("{")) ? userId : currentUserId,
          businessId: scannedBusinessId || activeBusinessId,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          remarks: "Universal Smart Business QR Check-In",
        })
      ).unwrap();

      playBeep();
      setLastScannedResult(res);
      setSuccessResult(res);
      setIsSuccessModalOpen(true);

      showToast.success(`Check-In Recorded for ${res.userInfo?.firstName || "Staff Member"}!`);
      fetchTodayLogs();

      setTimeout(() => {
        setLastScannedResult(null);
        startCamera();
      }, 2500);
    } catch (err: any) {
      triggerErrorModal(err, "Check-in failed. Please verify staff QR code.");
      setTimeout(startCamera, 2000);
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  };

  // Quick Self Check-In Action
  const handleQuickCheckIn = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setProcessingAction("quick");
    try {
      const res = await dispatch(
        checkInAttendanceService({
          userId: currentUserId,
          businessId: activeBusinessId,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          remarks: "Quick Self Check-In",
        })
      ).unwrap();

      playBeep();
      setLastScannedResult(res);
      setSuccessResult(res);
      setIsSuccessModalOpen(true);

      showToast.success(`Self Check-In Recorded! (Status: ${res.status})`);
      fetchTodayLogs();

      setTimeout(() => {
        setLastScannedResult(null);
      }, 2500);
    } catch (err: any) {
      triggerErrorModal(err, "Quick Check-in failed.");
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 font-sans w-full max-w-[1400px] mx-auto">
      <Card className="border border-border shadow-2xs bg-card overflow-hidden w-full">
        {/* Full-width Card Header matching System Page Header */}
        <CardHeader className="pb-3.5 border-b border-border bg-muted/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href={ROUTES.ADMIN.HR_ATTENDANCE}>
                <CustomButton
                  variant="outline"
                  size="sm"
                  className="h-8.5 w-8.5 rounded-xl p-0 flex items-center justify-center cursor-pointer hover:bg-primary/10 transition-all"
                >
                  <ArrowLeft className="w-4 h-4 text-foreground" />
                </CustomButton>
              </Link>
              <div>
                <CardTitle className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-primary" />
                  <span>Attendance Station Scanner</span>
                </CardTitle>
                <p className="text-[11px] text-muted-foreground font-medium">Smart Auto-Sequence Attendance Check-In</p>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center gap-2">
              {/* Location Pill */}
              {locationStatus === "granted" && coords ? (
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shadow-2xs">
                  <MapPin className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span>GPS Active</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={requestLocation}
                  className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <MapPin className="w-3 h-3 text-amber-500" />
                  <span>Enable Location</span>
                </button>
              )}

              <CustomButton
                variant={isTorchOn ? "default" : "outline"}
                size="sm"
                onClick={toggleTorch}
                className="h-8.5 w-8.5 rounded-xl p-0 cursor-pointer"
                title="Toggle Torch"
              >
                <Flashlight className="w-4 h-4" />
              </CustomButton>

              <CustomButton
                variant="outline"
                size="sm"
                onClick={toggleCameraFacing}
                className="h-8.5 w-8.5 rounded-xl p-0 cursor-pointer"
                title="Switch Camera"
              >
                <SwitchCamera className="w-4 h-4" />
              </CustomButton>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {/* 2-Column Responsive Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN (7 cols): Viewfinder Camera Overlay Box */}
            <div className="lg:col-span-7 space-y-4">
              <AttendanceViewfinder
                videoRef={videoRef}
                isCameraActive={isCameraActive}
                isCameraInitializing={isCameraInitializing}
                cameraError={cameraError}
                lastScannedResult={lastScannedResult}
                onEnableCamera={startCamera}
              />
            </div>

            {/* RIGHT COLUMN (5 cols): Action Panel & Today's Attendance Activity */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Quick Actions Panel */}
              <AttendanceQuickActions
                isProcessing={isProcessing}
                processingAction={processingAction}
                onQuickCheckIn={handleQuickCheckIn}
                onImageUpload={handleImageUpload}
              />

              {/* Today's Attendance Activity Logs Panel */}
              <AttendanceRecentLogsPanel
                attendanceList={todayAttendanceList}
              />

            </div>
          </div>
        </CardContent>
      </Card>

      {/* POS-Style Order Success Custom Modal Component */}
      <AttendanceSuccessModal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        result={successResult}
        currentUser={currentUser}
      />

      {/* POS-Style Error Custom Modal Component */}
      <AttendanceErrorModal
        open={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorMessage}
      />
    </div>
  );
}

export default function AttendanceScannerPage() {
  return (
    <Suspense>
      <AttendanceScannerPageInner />
    </Suspense>
  );
}
