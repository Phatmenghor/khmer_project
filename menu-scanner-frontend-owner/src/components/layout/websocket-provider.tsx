"use client";

import { usePlatformWebSocket } from "@/hooks/use-platform-websocket";
import type { ReactNode } from "react";

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  usePlatformWebSocket();
  return <>{children}</>;
}
