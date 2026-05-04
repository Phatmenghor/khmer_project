import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import {
  AllBannerResponseModel,
  BannerResponseModel,
} from "../store/models/response/banner-response";
import { ActionButton } from "@/components/shared/button/action-button";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface BannerTableHandlers {
  handleEditBanner: (banner: BannerResponseModel) => void;
  handleBannerViewDetail: (banner: BannerResponseModel) => void;
  handleDeleteBanner: (banner: BannerResponseModel) => void;
  handleToggleBannerStatus: (banner: BannerResponseModel) => void;
}

interface BannerTableOptions {
  data: AllBannerResponseModel | null;
  handlers: BannerTableHandlers;
}

export const bannerTableColumns = ({
  data,
  handlers,
}: BannerTableOptions): TableColumn<BannerResponseModel>[] => {
  const { handleEditBanner, handleBannerViewDetail, handleDeleteBanner, handleToggleBannerStatus } =
    handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 15, index + 1)}
        </span>
      ),
    },
    {
      key: "imageUrl",
      label: "Banner Image",
      minWidth: "200px",
      maxWidth: "280px",
      render: (banner) => {
        return (
          <div className="flex-shrink-0 w-64 h-32 rounded-lg overflow-hidden bg-muted border border-border shadow-sm">
            <img
              src={banner.imageUrl}
              alt="Banner"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/assets/image/no-image.png";
              }}
            />
          </div>
        );
      },
    },
    {
      key: "description",
      label: "Description",
      minWidth: "300px",
      maxWidth: "500px",
      render: (banner) => (
        <h3 className="font-semibold text-sm text-foreground line-clamp-3">
          {banner.description || "---"}
        </h3>
      ),
    },
    {
      key: "status",
      label: "Status",
      minWidth: "120px",
      maxWidth: "180px",
      render: (banner) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={banner?.status === "ACTIVE"}
            onCheckedChange={() => handleToggleBannerStatus(banner)}
          />
          <span className="text-xs text-muted-foreground">
            {banner?.status === "ACTIVE" ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (banner) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(banner?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (banner) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleBannerViewDetail(banner)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Banner"
            onClick={() => handleEditBanner(banner)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Banner"
            onClick={() => handleDeleteBanner(banner)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
