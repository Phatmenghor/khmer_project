import type { ReactNode } from "react";

export type ModalSize = "sm" | "default" | "lg" | "xl" | "2xl" | "full";

export type SubmitVariant =
  | "default"
  | "destructive"
  | "secondary"
  | "outline"
  | "ghost";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: ModalSize;
  hideCloseButton?: boolean;
  contentClassName?: string;
  bodyClassName?: string;
  headerSlot?: ReactNode;
  children: ReactNode;
}

export interface FormDialogProps extends BaseModalProps {
  onSubmit?: (e?: React.FormEvent) => void | Promise<void>;
  isLoading?: boolean;
  submitText?: string;
  cancelText?: string;
  submitVariant?: SubmitVariant;
  showActions?: boolean;
  customFooter?: ReactNode;
  noForm?: boolean;
  submitDisabled?: boolean;
  hideTitle?: boolean;
}
