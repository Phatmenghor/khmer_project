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
  const [telegramStatus, setTelegramStatus] = useState<{
    isLinked: boolean;
    chatId?: string;
  } | null>(null);

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
      const response = await fetch(
        `/api/v1/telegram/status/${businessId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTelegramStatus(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch Telegram status:", error);
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
      const response = await fetch(
        `/api/v1/telegram/test/${businessId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        showToast.success("Test message sent to Telegram group!");
      } else {
        showToast.error("Failed to send test message");
      }
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
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
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
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Linked
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Link your Telegram group to receive automatic order notifications,
            staff alerts, and subscription updates.
          </AlertDescription>
        </Alert>

        {/* Current Status */}
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              Current Group Chat ID
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={currentChatId}
                onChange={(e) => onChatIdChange?.(e.target.value)}
                placeholder="Group chat ID will appear here after linking"
                className="flex-1 text-sm"
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
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-sm text-blue-900">
            How to Link Your Group
          </h4>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Create a Telegram group or select an existing one</li>
            <li>Add our bot (@{process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "YourBotName"}) as admin to the group</li>
            <li>Copy the link command below</li>
            <li>Paste and send in the group: {businessId ? `/link ${businessId}` : "/link <business-id>"}</li>
            <li>Bot will confirm the link and you'll receive notifications</li>
          </ol>
        </div>

        {/* Copy Command */}
        {businessId && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Link Command</Label>
            <div className="flex gap-2">
              <code className="flex-1 p-3 bg-muted rounded-lg font-mono text-xs overflow-auto">
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
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
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
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-sm text-emerald-800 font-medium">
              ✅ Your group is successfully linked. You'll receive notifications
              for orders, staff changes, and subscription updates.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800 font-medium">
              ⏳ Not linked yet. Follow the steps above to link your group.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
