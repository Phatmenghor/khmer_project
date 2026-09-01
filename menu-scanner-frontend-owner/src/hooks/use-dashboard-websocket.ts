"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAdminToken, getToken } from "@/utils/local-storage/token";

interface UseDashboardWebSocketOptions {
  businessId: string | null | undefined;
  onOrderEvent: (type: string) => void;
  onStockEvent: (type: string) => void;
}

export function useDashboardWebSocket({
  businessId,
  onOrderEvent,
  onStockEvent,
}: UseDashboardWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const onOrderEventRef = useRef(onOrderEvent);
  const onStockEventRef = useRef(onStockEvent);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    onOrderEventRef.current = onOrderEvent;
  }, [onOrderEvent]);

  useEffect(() => {
    onStockEventRef.current = onStockEvent;
  }, [onStockEvent]);

  const connect = useCallback(() => {
    if (!businessId) return;

    // The backend's STOMP endpoint lives on the API origin, not the
    // frontend's own origin (they differ in both dev and prod).
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    const wsUrl = `${apiBase || window.location.origin}/ws`;

    const devLog = (...args: unknown[]) => {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log(...args);
      }
    };

    const token =
      (typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin")
        ? getAdminToken()
        : getToken()) || "";

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        devLog("[WS] Connected to /ws — subscribing to business topics:", businessId);

        client.subscribe(`/topic/${businessId}/orders`, (message) => {
          try {
            const event = JSON.parse(message.body);
            devLog("[WS] Order event received:", event);
            onOrderEventRef.current(event.type);
          } catch {
            // ignore malformed messages
          }
        });

        client.subscribe(`/topic/${businessId}/stock`, (message) => {
          try {
            const event = JSON.parse(message.body);
            devLog("[WS] Stock event received:", event);
            onStockEventRef.current(event.type);
          } catch {
            // ignore malformed messages
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        devLog("[WS] Disconnected");
      },
      onStompError: (frame) => {
        setIsConnected(false);
        // Skip empty frames so the 5s reconnect loop doesn't spam the
        // console. Surface real protocol errors via devLog only.
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
        devLog("[WS] socket error — /ws unreachable, will retry");
      },
    });

    client.activate();
    clientRef.current = client;
  }, [businessId]);

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
