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

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
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
      onDisconnect: () => setIsConnected(false),
      onStompError: () => setIsConnected(false),
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
