"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAppDispatch, useAppSelector } from "@/store";
import { bumpVersion, WebSocketResource } from "@/store/slices/websocket-slice";
import { getToken } from "@/utils/local-storage/token";
import { selectAccessToken } from "@/features/auth/store/selectors/auth-selectors";

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
  const accessToken = useAppSelector(selectAccessToken);
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

    const token = accessToken || getToken();
    if (!token) {
      devLog("[Realtime] Waiting for user sign-in to connect live updates");
      return;
    }

    const client = new Client({
      webSocketFactory: () => {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const nativeWsUrl = `${protocol}//${window.location.host}/ws/websocket`;
        try {
          return new WebSocket(nativeWsUrl);
        } catch {
          return new SockJS(wsUrl, null, {
            transports: ["websocket", "xhr-streaming"],
          });
        }
      },
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        devLog("[Realtime] Connected successfully — listening for live owner dashboard updates");

        client.subscribe("/topic/platform", (message) => {
          try {
            const event = JSON.parse(message.body);
            const resource = EVENT_TYPE_MAP[event.type];
            if (resource) {
              dispatch(bumpVersion(resource));
              devLog(`[Realtime] Event received: ${event.type} -> Refreshing ${resource}`);
            }
          } catch {
            // ignore malformed messages
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        devLog("[Realtime] Connection closed — waiting to reconnect");
      },
      onStompError: (frame) => {
        setIsConnected(false);
        const message = frame?.headers?.message;
        const body = frame?.body;
        if (!message && !body) return;
        devLog("[Realtime] Connection protocol notice:", message || "(no message)", body || "");
      },
      onWebSocketError: () => {
        setIsConnected(false);
        devLog("[Realtime] Reconnecting live updates in 5s...");
      },
    });

    client.activate();
    clientRef.current = client;
  }, [dispatch, accessToken]);

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
