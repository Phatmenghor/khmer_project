import { Loader2 } from "lucide-react";

export const Loading = () => (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="h-5 w-5 animate-spin text-primary" />
  </div>
);

export const LoadingPagination = () => (
  <div className="flex items-center justify-center py-5">
    <Loader2 className="h-5 w-5 animate-spin text-primary" />
  </div>
);
