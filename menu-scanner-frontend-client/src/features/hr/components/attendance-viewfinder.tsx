"use client";

import React, { RefObject } from "react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Camera, CheckCircle2, RefreshCw, Loader2 } from "lucide-react";
import { AttendanceModel } from "@/features/hr/store/models/hr-models";

interface AttendanceViewfinderProps {
  videoRef: any;
  isCameraActive: boolean;
  isCameraInitializing: boolean;
  cameraError: string | null;
  lastScannedResult: AttendanceModel | null;
  onEnableCamera: () => void;
}

export function AttendanceViewfinder({
  videoRef,
  isCameraActive,
  isCameraInitializing,
  cameraError,
  lastScannedResult,
  onEnableCamera,
}: AttendanceViewfinderProps) {
  return (
    <div className="relative w-full aspect-[4/3] max-h-[460px] rounded-2xl overflow-hidden bg-[#021329] border border-cyan-500/30 shadow-lg flex items-center justify-center">
      <video ref={videoRef} className="w-full h-full object-cover rounded-2xl" playsInline muted />

      {/* Viewfinder ABA-Style Reticle Overlay (Cyan & Glowing Scanline) */}
      {isCameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 bg-radial from-transparent via-cyan-950/20 to-[#021329]/80">
          <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-3xl border-2 border-cyan-400/90 shadow-[0_0_50px_rgba(6,182,212,0.4)] flex items-center justify-center">
            {/* Cyan Laser Scanning Line */}
            <div className="absolute inset-x-3 h-0.5 bg-gradient-to-r from-cyan-500 via-teal-300 to-cyan-500 rounded-full shadow-[0_0_15px_#06b6d4] animate-pulse" />

            {/* Glowing Corner Brackets */}
            <div className="absolute -top-1 -left-1 w-7 h-7 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-7 h-7 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-4 border-r-4 border-cyan-400 rounded-br-xl" />
          </div>

          <div className="mt-4 px-3.5 py-1 rounded-full bg-[#021a38]/85 backdrop-blur-md border border-cyan-500/30 text-[11px] font-extrabold text-cyan-300 flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Align Staff QR Code within frame</span>
          </div>
        </div>
      )}

      {/* Camera Initializing Loading State */}
      {isCameraInitializing && (
        <div className="absolute inset-0 bg-[#021329]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs font-extrabold text-cyan-200">Initializing Live Camera Stream...</p>
        </div>
      )}

      {/* Camera Enable Overlay */}
      {!isCameraActive && !isCameraInitializing && (
        <div className="absolute inset-0 bg-[#021329]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="p-4 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-pulse">
            <Camera className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-white">Live Camera Scanner</h3>
            <p className="text-xs text-cyan-200/70 max-w-sm">
              {cameraError || "Click below to enable live camera scanning for staff check-in."}
            </p>
          </div>
          <CustomButton
            variant="default"
            size="sm"
            onClick={onEnableCamera}
            disabled={isCameraInitializing}
            className="h-9 px-4 rounded-xl text-xs font-extrabold gap-1.5 cursor-pointer shadow-md bg-cyan-600 hover:bg-cyan-700 text-white border border-cyan-400/40"
          >
            {isCameraInitializing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Enable Camera Scanner</span>
              </>
            )}
          </CustomButton>
        </div>
      )}

      {/* Success Overlay Banner */}
      {lastScannedResult && (
        <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center space-y-3 animate-in fade-in zoom-in duration-200">
          <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-bounce" />
          <div className="space-y-1">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">
              Check-In Recorded Successfully
            </span>
            <h2 className="text-lg font-black text-white">
              {lastScannedResult.userInfo?.firstName || "Staff Member"} {lastScannedResult.userInfo?.lastName || ""}
            </h2>
            <p className="text-xs text-slate-300 font-semibold">
              Shift Status: <span className="text-emerald-400 font-bold">{lastScannedResult.status}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
