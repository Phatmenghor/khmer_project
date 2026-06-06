"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Monitor, Smartphone, Tablet, Globe, MapPin, Clock, Calendar, Wifi, CheckCircle2, XCircle, User, Shield, LogOut } from "lucide-react";
import { SessionResponseModel as SessionResponse } from "@/features/sessions/store/models/response/session-response";
import { format, formatDistanceToNow } from "date-fns";

interface AdminSessionDetailModalProps {
  session: SessionResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSessionDetailModal({
  session,
  isOpen,
  onClose,
}: AdminSessionDetailModalProps) {
  if (!session) return null;

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "MOBILE":
        return <Smartphone className="h-4 w-4" />;
      case "TABLET":
        return <Tablet className="h-4 w-4" />;
      case "DESKTOP":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <CheckCircle2 className="h-2 w-2 mr-1" />
            Active
          </Badge>
        );
      case "LOGGED_OUT":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            <XCircle className="h-2 w-2 mr-1" />
            Logged Out
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            <XCircle className="h-2 w-2 mr-1" />
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Session Details (Admin View)</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              User Information
            </h4>

            <div className="flex items-center gap-3 p-2 bg-muted/50 rounded">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {session.userFullName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {session.userIdentifier}
                </p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {session.userType}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
              {getDeviceIcon(session.deviceType)}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {session.deviceDisplayName || session.deviceName}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                {getStatusBadge(session.status)}
                {session.isCurrentSession && (
                  <Badge className="bg-blue-500">Current</Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">
              Device Information
            </h4>

            <DetailRow
              icon={<Globe className="h-3 w-3" />}
              label="Browser"
              value={session.browser}
            />
            <DetailRow
              icon={<Monitor className="h-3 w-3" />}
              label="Operating System"
              value={session.operatingSystem}
            />
            <DetailRow
              icon={<Smartphone className="h-3 w-3" />}
              label="Device Type"
              value={session.deviceType}
            />
            <DetailRow
              icon={<Shield className="h-3 w-3" />}
              label="Device ID"
              value={session.deviceId}
            />
          </div>

          <Separator />

          {}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">
              Location
            </h4>

            <DetailRow
              icon={<MapPin className="h-3 w-3" />}
              label="Location"
              value={session.location}
            />
            <DetailRow
              icon={<Wifi className="h-3 w-3" />}
              label="IP Address"
              value={session.ipAddress}
            />
          </div>

          <Separator />

          {}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">
              Session Timing
            </h4>

            <DetailRow
              icon={<Calendar className="h-3 w-3" />}
              label="Login Time"
              value={format(
                new Date(session.loginAt),
                "MMM d, yyyy 'at' h:mm a"
              )}
            />
            <DetailRow
              icon={<Clock className="h-3 w-3" />}
              label="Last Active"
              value={formatDistanceToNow(new Date(session.lastActiveAt), {
                addSuffix: true,
              })}
            />
            <DetailRow
              icon={<Calendar className="h-3 w-3" />}
              label="Expires"
              value={format(
                new Date(session.expiresAt),
                "MMM d, yyyy 'at' h:mm a"
              )}
            />
          </div>

          {}
          {session.loggedOutAt && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <LogOut className="h-3 w-3" />
                  Logout Information
                </h4>

                <DetailRow
                  icon={<Calendar className="h-3 w-3" />}
                  label="Logged Out At"
                  value={format(
                    new Date(session.loggedOutAt),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                />
                {session.logoutReason && (
                  <DetailRow
                    icon={<XCircle className="h-3 w-3" />}
                    label="Logout Reason"
                    value={session.logoutReason}
                  />
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs font-medium truncate max-w-[200px]" title={value}>
        {value}
      </span>
    </div>
  );
}
