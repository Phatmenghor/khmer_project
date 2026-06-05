"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

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
        console.error("[WS] STOMP error:", frame);
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
