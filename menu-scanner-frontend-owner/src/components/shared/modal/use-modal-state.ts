"use client";

import { useCallback, useState } from "react";

export interface ModalState<T = undefined> {
  isOpen: boolean;
  data: T | undefined;
  open: (data?: T) => void;
  close: () => void;
  setData: (data: T | undefined) => void;
}

export function useModalState<T = undefined>(
  initialOpen = false
): ModalState<T> {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [data, setData] = useState<T | undefined>(undefined);

  const open = useCallback((next?: T) => {
    setData(next);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, data, open, close, setData };
}
