"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAppDispatch } from "@/redux/store";
import { bumpVersion, WebSocketResource } from "@/redux/store/slices/websocket-slice";

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
              // Bump version - pages will use this to decide if they should refresh
              dispatch(bumpVersion(resource));
              console.log(`[WS] Platform event: ${event.type} → bumped ${resource}`);
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
  }, [dispatch]);

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
