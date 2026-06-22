"use client";

import { useEffect, useRef, useCallback } from "react";
import { TelegramAuthData } from "@/redux/features/auth/store/models/request/social-auth-request";

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
  }, [botName, buttonSize, cornerRadius, showUserPic, requestAccess, lang, handleTelegramAuth]);

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
    const returnTo = `${window.location.origin}/`;
    const authUrl = `https://oauth.telegram.org/auth?bot_id=${telegramBotId}&origin=${encodeURIComponent(
      window.location.origin
    )}&return_to=${encodeURIComponent(returnTo)}&request_access=write`;

    const popup = window.open(
      authUrl,
      "TelegramAuth",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) return;

    let resolved = false;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://oauth.telegram.org") return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.event === "auth_result" && data?.result) {
          resolved = true;
          cleanup();
          onAuth(data.result as TelegramAuthData);
        }
      } catch {
        // ignore malformed messages
      }
    };

    const checkPopup = setInterval(() => {
      if (!popup || popup.closed) {
        cleanup();
        return;
      }
      try {
        const url = new URL(popup.location.href);
        const tgAuthResult = url.searchParams.get("tgAuthResult");
        if (tgAuthResult) {
          resolved = true;
          cleanup();
          popup.close();
          onAuth(JSON.parse(atob(tgAuthResult)) as TelegramAuthData);
        }
      } catch {
        // cross-origin access blocked while popup is on oauth.telegram.org — normal
      }
    }, 300);

    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      clearInterval(checkPopup);
    };

    window.addEventListener("message", onMessage);
  }, [botName, botId, onAuth, disabled, loading]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded bg-[#0088cc] px-3 font-medium text-white shadow-sm transition-all hover:bg-[#0077b3] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed h-[32px] md:h-[32px] text-xs py-0 ${className}`}
    >
      {loading ? (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
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
        <TelegramIcon className="h-3.5 w-3.5" />
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
      aria-hidden="true"
    >
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  );
}

export { TelegramIcon };
