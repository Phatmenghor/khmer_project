"use client";

import { useEffect, useRef, useCallback } from "react";
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

  useEffect(() => {
    onOrderEventRef.current = onOrderEvent;
  }, [onOrderEvent]);

  useEffect(() => {
    onStockEventRef.current = onStockEvent;
  }, [onStockEvent]);

  const connect = useCallback(() => {
    if (!businessId) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/${businessId}/orders`, (message) => {
          try {
            const event = JSON.parse(message.body);
            onOrderEventRef.current(event.type);
          } catch {
            // ignore malformed messages
          }
        });

        client.subscribe(`/topic/${businessId}/stock`, (message) => {
          try {
            const event = JSON.parse(message.body);
            onStockEventRef.current(event.type);
          } catch {
            // ignore malformed messages
          }
        });
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
    };
  }, [connect]);
}
