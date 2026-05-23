"use client";

import { useEffect, useRef, useCallback } from "react";
import { TelegramAuthData } from "@/features/auth/store/models/request/social-auth-request";

interface TelegramLoginWidgetProps {
  botName: string;
  onAuth: (data: TelegramAuthData) => void;
  buttonSize?: "large" | "medium" | "small";
  cornerRadius?: number;
  showUserPic?: boolean;
  requestAccess?: "write" | null;
  lang?: string;
  className?: string;
}


export function TelegramLoginWidget({
  botName,
  onAuth,
  buttonSize = "large",
  cornerRadius = 8,
  showUserPic = true,
  requestAccess = "write",
  lang = "en",
  className = "",
}: TelegramLoginWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);


  const handleTelegramAuth = useCallback(
    (data: TelegramAuthData) => {
      onAuth(data);
    },
    [onAuth]
  );

  useEffect(() => {

    const callbackName = `telegramCallback_${Date.now()}`;
    (window as any)[callbackName] = handleTelegramAuth;


    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", buttonSize);
    script.setAttribute("data-radius", cornerRadius.toString());
    script.setAttribute("data-onauth", `${callbackName}(user)`);
    script.setAttribute("data-userpic", showUserPic.toString());
    if (requestAccess) {
      script.setAttribute("data-request-access", requestAccess);
    }
    if (lang) {
      script.setAttribute("data-lang", lang);
    }


    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(script);
    }


    return () => {
      delete (window as any)[callbackName];
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [
    botName,
    buttonSize,
    cornerRadius,
    showUserPic,
    requestAccess,
    lang,
    handleTelegramAuth,
  ]);

  return <div ref={containerRef} className={className} />;
}


interface TelegramLoginButtonProps {
  botName: string;
  botId?: string;
  onAuth: (data: TelegramAuthData) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function TelegramLoginButton({
  botName,
  botId,
  onAuth,
  disabled = false,
  loading = false,
  className = "",
  children,
}: TelegramLoginButtonProps) {
  const handleClick = useCallback(() => {
    if (disabled || loading) return;

    const width = 550;
    const height = 470;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const telegramBotId = botId || botName;

    const authUrl = `https://oauth.telegram.org/auth?bot_id=${telegramBotId}&origin=${encodeURIComponent(
      window.location.origin
    )}&embed=1&request_access=write`;

    console.log("[TG DEBUG] Opening popup");
    console.log("[TG DEBUG] bot_id:", telegramBotId);
    console.log("[TG DEBUG] origin:", window.location.origin);
    console.log("[TG DEBUG] full auth URL:", authUrl);

    const popup = window.open(
      authUrl,
      "TelegramAuth",
      `width=${width},height=${height},left=${left},top=${top},status=no,location=no,menubar=no,toolbar=no`
    );

    if (!popup) {
      console.log("[TG DEBUG] Popup was blocked by browser");
      return;
    }

    console.log("[TG DEBUG] Popup opened successfully");

    let resolved = false;

    const onMessage = (event: MessageEvent) => {
      console.log("[TG DEBUG] postMessage received — origin:", event.origin, "data:", event.data);
      if (event.origin !== "https://oauth.telegram.org") {
        console.log("[TG DEBUG] Ignored message from unexpected origin:", event.origin);
        return;
      }

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        console.log("[TG DEBUG] Parsed message data:", data);

        if (data?.event === "auth_result" && data?.result) {
          console.log("[TG DEBUG] Auth result received:", data.result);
          resolved = true;
          cleanup();
          onAuth(data.result as TelegramAuthData);
        } else {
          console.log("[TG DEBUG] Message received but not auth_result:", data);
        }
      } catch (err) {
        console.log("[TG DEBUG] Failed to parse message data:", err);
      }
    };

    const checkPopup = setInterval(() => {
      if (!popup || popup.closed) {
        if (!resolved) {
          console.log("[TG DEBUG] Popup closed without completing auth");
        }
        cleanup();
        return;
      }

      try {
        const url = new URL(popup.location.href);
        const tgAuthResult = url.searchParams.get("tgAuthResult");
        if (tgAuthResult) {
          console.log("[TG DEBUG] tgAuthResult found in popup URL");
          resolved = true;
          cleanup();
          popup.close();
          const authData = JSON.parse(atob(tgAuthResult));
          console.log("[TG DEBUG] Auth data from URL:", authData);
          onAuth(authData as TelegramAuthData);
        }
      } catch (e) {
        // cross-origin access blocked — normal while popup is on oauth.telegram.org
      }
    }, 300);

    const cleanup = () => {
      console.log("[TG DEBUG] Cleanup called — resolved:", resolved);
      window.removeEventListener("message", onMessage);
      clearInterval(checkPopup);
    };

    window.addEventListener("message", onMessage);
    console.log("[TG DEBUG] Listening for postMessage from oauth.telegram.org");
  }, [botName, botId, onAuth, disabled, loading]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[#0088cc] px-4 py-2.5 text-white font-medium transition-all hover:bg-[#0077b3] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <TelegramIcon className="h-5 w-5" />
      )}
      {children || "Continue with Telegram"}
    </button>
  );
}


function TelegramIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export { TelegramIcon };
