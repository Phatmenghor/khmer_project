"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAdminToken, getToken } from "@/utils/local-storage/token";
import { TableMonitoringItem } from "@/features/business/store/models/type/table-monitoring-type";

interface TableWebSocketEvent {
  type: "TABLE_STATUS_UPDATED" | "NEW_TABLE_ORDER" | "TABLE_BILL_PAID" | "TABLE_RESET";
  tableId?: string;
  tableNumber?: string;
  status?: string;
  tableData?: TableMonitoringItem;
}

interface UseTableWebSocketOptions {
  businessId: string | null | undefined;
  onTableEvent: (event: TableWebSocketEvent) => void;
}

export function useTableWebSocket({
  businessId,
  onTableEvent,
}: UseTableWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const onTableEventRef = useRef(onTableEvent);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    onTableEventRef.current = onTableEvent;
  }, [onTableEvent]);

  const connect = useCallback(() => {
    if (!businessId) return;

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    const wsUrl = `${apiBase || window.location.origin}/ws`;

    const devLog = (...args: unknown[]) => {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log(...args);
      }
    };

    const token =
      (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")
        ? getAdminToken()
        : getToken()) || "";

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        devLog("[Table WS] Connected to /ws — subscribing to table topics:", businessId);

        client.subscribe(`/topic/${businessId}/tables`, (message) => {
          try {
            const event: TableWebSocketEvent = JSON.parse(message.body);
            devLog("[Table WS] Table event received:", event);
            onTableEventRef.current(event);
          } catch {
            // ignore malformed messages
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        devLog("[Table WS] Disconnected");
      },
      onStompError: (frame) => {
        setIsConnected(false);
        const message = frame?.headers?.message;
        const body = frame?.body;
        if (!message && !body) return;
        devLog("[Table WS] STOMP error:", message || "(no message)", body || "");
      },
      onWebSocketError: () => {
        setIsConnected(false);
        devLog("[Table WS] socket error — /ws unreachable, retrying...");
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
