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

    const devLog = (...args: unknown[]) => {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log(...args);
      }
    };

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        devLog("[WS] Platform WebSocket connected — subscribing to /topic/platform");

        client.subscribe("/topic/platform", (message) => {
          try {
            const event = JSON.parse(message.body);
            const resource = EVENT_TYPE_MAP[event.type];
            if (resource) {
              // Bump version - pages will use this to decide if they should refresh
              dispatch(bumpVersion(resource));
              devLog(`[WS] Platform event: ${event.type} → bumped ${resource}`);
            }
          } catch {
            // ignore malformed messages
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        devLog("[WS] Platform WebSocket disconnected");
      },
      onStompError: (frame) => {
        setIsConnected(false);
        // STOMP frames don't serialize cleanly with console.error (logs as '{}').
        // Pull the meaningful parts and skip empty frames entirely so the
        // 5s reconnect loop doesn't spam the console.
        const message = frame?.headers?.message;
        const body = frame?.body;
        if (!message && !body) return;
        devLog(
          "[WS] STOMP error:",
          message || "(no message)",
          body || "",
        );
      },
      onWebSocketError: () => {
        setIsConnected(false);
        // SockJS surfaces a transport error every reconnect when the backend
        // /ws endpoint isn't reachable — devLog only so production stays quiet.
        devLog("[WS] socket error — /ws unreachable, will retry");
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
