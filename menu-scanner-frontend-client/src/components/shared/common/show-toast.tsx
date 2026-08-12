import { toast } from "sonner";
import { TOAST_CONSTANTS } from "@/constants/ui-constants";

export const showToast = {
  success: (message: string) => {
    toast.success(message, { id: `success-${message}`, duration: TOAST_CONSTANTS.DURATION_MS });
  },

  error: (message: string) => {
    toast.error(message, { id: `error-${message}`, duration: TOAST_CONSTANTS.DURATION_MS });
  },

  warning: (message: string) => {
    toast.warning(message, { id: `warning-${message}`, duration: TOAST_CONSTANTS.DURATION_MS });
  },

  info: (message: string) => {
    toast.info(message, { id: `info-${message}`, duration: TOAST_CONSTANTS.DURATION_MS });
  },
};
