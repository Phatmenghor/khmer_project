import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";

import { ActionButton } from "@/components/shared/button/action-button";
import {
  AllSessionsResponseModel,
  SessionResponseModel,
} from "../store/models/response/session-response";

interface SessionTableHandlers {
  handleSessionViewDetail: (session: SessionResponseModel) => void;
  handleDeleteSession: (session: SessionResponseModel) => void;
}

interface SessionTableOptions {
  data: AllSessionsResponseModel | null;
  handlers: SessionTableHandlers;
}

export const sessionTableColumns = ({
  data,
  handlers,
}: SessionTableOptions): TableColumn<SessionResponseModel>[] => {
  const { handleSessionViewDetail, handleDeleteSession } = handlers;

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
      key: "userIdentifier",
      label: "User Identifier",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (session) => (
        <span className="text-xs text-muted-foreground">
          {session?.userIdentifier || "---"}
        </span>
      ),
    },

    {
      key: "userFullName",
      label: "User Full Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (session) => (
        <span className="text-xs text-muted-foreground">
          {session?.userFullName || "---"}
        </span>
      ),
    },

    {
      key: "deviceDisplayName",
      label: "Device Display Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (session) => (
        <span className="text-xs text-muted-foreground">
          {session?.deviceDisplayName || "---"}
        </span>
      ),
    },

    {
      key: "deviceType",
      label: "Device Type",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (session) => (
        <span className="text-xs text-muted-foreground">
          {session?.deviceType || "---"}
        </span>
      ),
    },

    {
      key: "ipAddress",
      label: "IP Address",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (session) => (
        <span className="text-xs text-muted-foreground">
          {session?.ipAddress || "---"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (session) => (
        <span className="text-xs text-muted-foreground">
          {session?.status || "---"}
        </span>
      ),
    },

    {
      key: "lastActiveAt",
      label: "Last Active At",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (session) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(session?.lastActiveAt)}
        </span>
      ),
    },

    {
      key: "loggedOutAt",
      label: "Logged Out At",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (session) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(session?.loggedOutAt)}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (session) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(session?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (session) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleSessionViewDetail(session)}
          />

          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Session"
            onClick={() => handleDeleteSession(session)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
