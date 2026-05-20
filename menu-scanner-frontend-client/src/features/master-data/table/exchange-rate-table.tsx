import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import {
  AllExchangeRateResponseModel,
  ExchangeRateResponseModel,
} from "../store/models/response/exchange-rate-response";
import { ActionButton } from "@/components/shared/button/action-button";
import { Switch } from "@/components/ui/switch";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import {
  formatKhrRate,
  formatCnyRate,
  formatVndRate,
} from "@/utils/format/exchange-rate-formatter";

interface HandlersTableHandlers {
  handleEditRate: (param: ExchangeRateResponseModel) => void;
  handleViewRateDetail: (param: ExchangeRateResponseModel) => void;
  handleDeleteRate: (param: ExchangeRateResponseModel) => void;
  handleToggleExchangeRateStatus: (param: ExchangeRateResponseModel) => void;
}

interface TableOptions {
  data: AllExchangeRateResponseModel | null;
  handlers: HandlersTableHandlers;
}

export const exchangeRateTableColumns = ({
  data,
  handlers,
}: TableOptions): TableColumn<ExchangeRateResponseModel>[] => {
  const { handleEditRate, handleViewRateDetail, handleDeleteRate, handleToggleExchangeRateStatus } = handlers;


  const totalRatesCount = data?.content?.length || 0;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo, data?.pageSize, index + 1)}
        </span>
      ),
    },

    {
      key: "usdToKhrRate",
      label: "USD To KHR",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (parameter) => (
        <span className="text-xs text-muted-foreground font-medium">
          {formatKhrRate(parameter?.usdToKhrRate)}
        </span>
      ),
    },
    {
      key: "usdToCnyRate",
      label: "USD To CNY",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (parameter) => (
        <span className="text-xs text-muted-foreground">
          {formatCnyRate(parameter?.usdToCnyRate)}
        </span>
      ),
    },
    {
      key: "usdToVndRate",
      label: "USD To VND",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (parameter) => (
        <span className="text-xs text-muted-foreground">
          {formatVndRate(parameter?.usdToVndRate)}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (parameter) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={parameter?.status === "ACTIVE"}
            onCheckedChange={() => handleToggleExchangeRateStatus(parameter)}
          />
          <span className="text-xs text-muted-foreground">
            {parameter?.status ? formatEnumValue(parameter.status) : "---"}
          </span>
        </div>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (parameter) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(parameter?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (parameter) => {
        const isOnlyRate = totalRatesCount === 1;

        return (
          <div className="flex items-center gap-2">
            <ActionButton
              icon={<Eye className="w-4 h-4" />}
              tooltip="View Details"
              onClick={() => handleViewRateDetail(parameter)}
            />
            <ActionButton
              icon={<Edit className="w-4 h-4" />}
              tooltip="Edit Rate"
              onClick={() => handleEditRate(parameter)}
            />
            <ActionButton
              icon={<Trash className="w-4 h-4" />}
              tooltip={
                isOnlyRate
                  ? "Cannot delete the only exchange rate"
                  : "Delete Rate"
              }
              onClick={() => handleDeleteRate(parameter)}
              variant="destructive"
              disabled={isOnlyRate}
            />
          </div>
        );
      },
    },
  ];
};
