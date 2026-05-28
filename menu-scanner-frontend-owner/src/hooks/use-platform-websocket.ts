"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { bumpVersion, WebSocketResource } from "@/redux/store/slices/websocket-slice";
import { updateBusinessOwnerDataSilently } from "@/redux/features/auth/store/slice/business-owner-slice";
import { axiosClientWithAuth } from "@/utils/axios";

const EVENT_TYPE_MAP: Record<string, WebSocketResource> = {
  BUSINESS_OWNER_CHANGED: "businessOwner",
  USER_CHANGED: "user",
  SUBSCRIPTION_CHANGED: "subscription",
  SUBSCRIPTION_PLAN_CHANGED: "subscriptionPlan",
  LOCATION_CHANGED: "location",
  ROLE_CHANGED: "role",
  DASHBOARD_CHANGED: "dashboard",
};

export function usePlatformWebSocket() {
  const dispatch = useAppDispatch();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleBusinessOwnerUpdate = useCallback(async (event: any) => {
    try {
      // Silently fetch updated business owner data
      const response = await axiosClientWithAuth.post("/api/v1/business-owners/all", {
        pageNo: 1,
        pageSize: 100,
        subscriptionStatuses: [],
      });
      // Update Redux silently (no loading indicator)
      dispatch(updateBusinessOwnerDataSilently(response.data.data));
      console.log("[WS] Business owner data updated globally");
    } catch (error) {
      console.error("[WS] Failed to update business owner data:", error);
    }
  }, [dispatch]);

  const connect = useCallback(() => {
    const wsUrl = `${window.location.origin}/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        console.log("[WS] Platform WebSocket connected — subscribing to /topic/platform");

        client.subscribe("/topic/platform", (message) => {
          try {
            const event = JSON.parse(message.body);
            const resource = EVENT_TYPE_MAP[event.type];

            if (resource) {
              console.log(`[WS] Platform event: ${event.type}`);

              // Handle specific resource updates with silent data refresh
              if (event.type === "BUSINESS_OWNER_CHANGED") {
                handleBusinessOwnerUpdate(event);
              } else {
                // For other events, just bump version (existing behavior)
                dispatch(bumpVersion(resource));
              }
            }
          } catch {
            // ignore malformed messages
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        console.log("[WS] Platform WebSocket disconnected");
      },
      onStompError: (frame) => {
        setIsConnected(false);
        console.error("[WS] STOMP error:", frame);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [dispatch, handleBusinessOwnerUpdate]);

  useEffect(() => {
    connect();
    return () => {
      clientRef.current?.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [connect]);

  return { isConnected };
}
