import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { TableImage } from "@/components/shared/table/table-image";
import {
  AllBannerResponseModel,
  BannerResponseModel,
} from "../store/models/response/banner-response";
import { ActionButton } from "@/components/shared/button/action-button";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
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
        <span className="text-xs text-muted-foreground">
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
          <TableImage
            src={banner.imageUrl}
            alt="Banner"
            fallbackText="B"
            className="w-44 h-24"
          />
        );
      },
    },
    {
      key: "description",
      label: "Description",
      minWidth: "300px",
      maxWidth: "500px",
      render: (banner) => (
        <h3 className="font-semibold text-xs text-foreground line-clamp-3">
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
        <div className="flex items-center gap-1">
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
        <span className="text-xs text-muted-foreground">
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
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="w-3 h-3" />}
            tooltip="View Details"
            onClick={() => handleBannerViewDetail(banner)}
          />
          <ActionButton
            icon={<Edit className="w-3 h-3" />}
            tooltip="Edit Banner"
            onClick={() => handleEditBanner(banner)}
          />
          <ActionButton
            icon={<Trash className="w-3 h-3" />}
            tooltip="Delete Banner"
            onClick={() => handleDeleteBanner(banner)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
