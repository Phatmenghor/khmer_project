"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch } from "@/store";
import { checkInAttendanceService, fetchAttendanceListService } from "@/features/hr/store/thunks/hr-thunks";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton, SubmitButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { AppDefault } from "@/constants/app-resource/default/default";
import { Camera, Upload, QrCode, AlertCircle, RefreshCw, Zap, MapPin } from "lucide-react";

interface AttendanceQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AttendanceQrScannerModal({
  isOpen,
  onClose,
  onSuccess,
}: AttendanceQrScannerModalProps) {
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<"camera" | "upload" | "manual">("camera");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualCode, setManualCode] = useState("");

  // Geolocation state
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"granted" | "denied" | "prompt">("prompt");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Request location on modal open
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

  // Stop camera stream on unmount or tab change
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

  // Start camera stream when camera tab is selected
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera API is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        scanFrame();
      }
    } catch (err: any) {
      setCameraError("Unable to access camera. Please grant camera permissions or use Image Upload.");
      setIsCameraActive(false);
    }
  };

  // Continuous frame scanning logic using BarcodeDetector API if available
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
            handleDecodedQr(rawValue);
            return;
          }
        }
      }
    } catch (err) {
      // Ignore frame scan errors
    }

    if (isOpen && activeTab === "camera") {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
  };

  useEffect(() => {
    if (isOpen) {
      requestLocation();
      if (activeTab === "camera") {
        startCamera();
      }
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  // Decode uploaded image file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
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
          handleDecodedQr(barcodes[0].rawValue);
          return;
        }
      }

      showToast.error("QR Code could not be read from image. Please ensure the QR code is clear or try manual entry.");
    } catch (err) {
      showToast.error("Failed to process QR image file.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Process decoded QR payload and trigger check-in API with auto-sequence detection & GPS
  const handleDecodedQr = async (rawValue: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
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
          userId: (userId && !userId.startsWith("{")) ? userId : undefined,
          businessId: scannedBusinessId || AppDefault.BUSINESS_ID,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          remarks: "Universal Smart Business QR Check-In",
        })
      ).unwrap();

      showToast.success(`Check-In Recorded Successfully for ${res.userInfo?.firstName || "Staff Member"} (Status: ${res.status})!`);
      dispatch(fetchAttendanceListService({ businessId: AppDefault.BUSINESS_ID }));
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast.error(err?.message || "Failed to record attendance from QR Code.");
      if (activeTab === "camera") {
        setTimeout(startCamera, 2000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      showToast.error("Please enter a valid User ID or QR Code payload.");
      return;
    }
    handleDecodedQr(manualCode);
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="xl">
      <FormHeader
        title="Attendance Scanner"
        description="Scan staff QR code via live camera, upload image, or enter code to record attendance"
        isCreate={true}
      />
      <FormBody className="space-y-4">
        {/* Banner Header with Location Badge */}
        <div className="flex flex-wrap items-center justify-between p-3 rounded-xl border border-primary/25 bg-primary/5 gap-2">
          <span className="text-xs font-extrabold text-primary flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-primary shrink-0" />
            <span>Auto-Sequence Check-In</span>
          </span>
          <div className="flex items-center gap-2">
            {locationStatus === "granted" && coords ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-500" /> GPS Verified
              </span>
            ) : (
              <button
                type="button"
                onClick={requestLocation}
                className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-amber-500" /> Enable GPS
              </button>
            )}
          </div>
        </div>

        {/* Custom Tab Bar */}
        <div className="w-full">
          <div className="grid grid-cols-3 w-full bg-muted/60 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("camera")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "camera" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Camera
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "upload" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("manual")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "manual" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" /> Manual
            </button>
          </div>

          {/* ── Camera Scanner Tab ── */}
          {activeTab === "camera" && (
            <div className="space-y-3 pt-3">
              {cameraError ? (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">{cameraError}</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Camera Access
                  </button>
                </div>
              ) : (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-border shadow-inner flex items-center justify-center">
                  <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

                  {/* Target overlay reticle */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-56 h-56 border-2 border-primary/80 rounded-2xl relative flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                      <div className="w-full h-0.5 bg-emerald-400 animate-pulse shadow-sm" />
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-bold text-white border border-white/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Align QR code inside scanner frame</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Upload Image Tab ── */}
          {activeTab === "upload" && (
            <div className="space-y-3 pt-3">
              <div className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl p-8 text-center bg-card transition-all cursor-pointer relative flex flex-col items-center justify-center space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-foreground">Click or Drag & Drop QR Image File</p>
                  <p className="text-[11px] text-muted-foreground">Supports PNG, JPG, JPEG, WEBP files</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Manual Input Tab ── */}
          {activeTab === "manual" && (
            <div className="space-y-3 pt-3">
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">Enter Staff User ID / QR Payload</label>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Paste or enter staff UUID or QR payload..."
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <SubmitButton
                  isSubmitting={isProcessing}
                  createText="Record Attendance Check-In"
                  className="w-full"
                />
              </form>
            </div>
          )}
        </div>
      </FormBody>
      <FormFooter isSubmitting={isProcessing} isDirty={false} isCreate={true}>
        <CancelButton onClick={onClose} disabled={isProcessing} />
      </FormFooter>
    </CustomModal>
  );
}
