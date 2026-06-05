"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Copy, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { showToast } from "@/components/shared/common/show-toast";
import { axiosClientWithAuth } from "@/utils/axios";

interface TelegramStatus {
  isLinked: boolean;
  chatId?: string;
}

interface TelegramBusinessLinkCardProps {
  businessId?: string;
  currentChatId?: string;
  onChatIdChange?: (chatId: string) => void;
}

export function TelegramBusinessLinkCard({
  businessId = "",
  currentChatId = "",
  onChatIdChange,
}: TelegramBusinessLinkCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus | null>(
    null
  );

  const isLinked = currentChatId && currentChatId.trim() !== "";

  useEffect(() => {
    if (businessId) {
      fetchTelegramStatus();
    }
  }, [businessId]);

  const fetchTelegramStatus = async () => {
    if (!businessId) return;
    try {
      setIsLoading(true);
      const response = await axiosClientWithAuth.get<{ data: TelegramStatus }>(
        `/api/v1/telegram/status/${businessId}`
      );
      setTelegramStatus(response.data.data);
    } catch {
      // Status fetch is best-effort; the UI degrades to "not linked".
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!businessId || !isLinked) {
      showToast.error(
        "Business must be linked to Telegram group before sending test message"
      );
      return;
    }

    try {
      setIsTesting(true);
      await axiosClientWithAuth.post(`/api/v1/telegram/test/${businessId}`);
      showToast.success("Test message sent to Telegram group!");
    } catch (error) {
      showToast.error(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsTesting(false);
    }
  };

  const copyLinkCommand = () => {
    const command = `${businessId ? `/link ${businessId}` : "/link <business-id>"}`;
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast.success("Command copied to clipboard!");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Telegram Group Linking</span>
          {isLinked && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-1 py-1 rounded-full">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              Linked
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-3 w-3" />
          <AlertDescription>
            Link your Telegram group to receive automatic order notifications,
            staff alerts, and subscription updates.
          </AlertDescription>
        </Alert>

        {/* Current Status */}
        <div className="space-y-2">
          <div>
            <Label className="text-xs font-semibold mb-1 block">
              Current Group Chat ID
            </Label>
            <div className="flex gap-1">
              <Input
                type="text"
                value={currentChatId}
                onChange={(e) => onChatIdChange?.(e.target.value)}
                placeholder="Group chat ID will appear here after linking"
                className="flex-1 text-xs"
                readOnly
              />
              {isLinked && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyLinkCommand}
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="space-y-2 p-3 bg-blue-50 rounded border border-blue-200">
          <h4 className="font-semibold text-xs text-blue-900">
            How to Link Your Group
          </h4>
          <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
            <li>Create a Telegram group or select an existing one</li>
            <li>Add our bot (@{process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "YourBotName"}) as admin to the group</li>
            <li>Copy the link command below</li>
            <li>Paste and send in the group: {businessId ? `/link ${businessId}` : "/link <business-id>"}</li>
            <li>Bot will confirm the link and you'll receive notifications</li>
          </ol>
        </div>

        {/* Copy Command */}
        {businessId && (
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Link Command</Label>
            <div className="flex gap-1">
              <code className="flex-1 p-2 bg-muted rounded font-mono text-xs overflow-auto">
                /link {businessId}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyLinkCommand}
                className="flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Test Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleSendTestMessage}
          disabled={!isLinked || isTesting}
          className="w-full"
        >
          {isTesting ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Sending Test Message...
            </>
          ) : (
            <>
              Send Test Message
            </>
          )}
        </Button>

        {/* Status */}
        {isLinked ? (
          <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-xs text-emerald-800 font-medium">
              ✅ Your group is successfully linked. You'll receive notifications
              for orders, staff changes, and subscription updates.
            </p>
          </div>
        ) : (
          <div className="p-2 bg-amber-50 rounded border border-amber-200">
            <p className="text-xs text-amber-800 font-medium">
              ⏳ Not linked yet. Follow the steps above to link your group.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
