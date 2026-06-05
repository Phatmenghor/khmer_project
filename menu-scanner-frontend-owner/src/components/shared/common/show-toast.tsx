import { toast } from "sonner";

const DURATION_MS = 4000;

export const showToast = {
  success: (message: string) => {
    toast.success(message, { duration: DURATION_MS });
  },

  error: (message: string) => {
    toast.error(message, { duration: DURATION_MS });
  },

  warning: (message: string) => {
    toast.warning(message, { duration: DURATION_MS });
  },

  info: (message: string) => {
    toast.info(message, { duration: DURATION_MS });
  },
};
