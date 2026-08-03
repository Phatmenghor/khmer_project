"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>((({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-all duration-200",
      className
    )}
    {...props}
  />
)))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  closeButtonClassName?: string;
  disableScrollWrapper?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, closeButtonClassName = "", disableScrollWrapper = false, style, ...props }, ref) => {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const dragState = React.useRef({ startY: 0, dragging: false });
  const [dragY, setDragY] = React.useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) return;
    dragState.current = { startY: e.touches[0].clientY, dragging: true };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.current.dragging) return;
    const delta = e.touches[0].clientY - dragState.current.startY;
    if (delta > 0) setDragY(delta);
  };

  const handleTouchEnd = () => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    if (dragY > 100) {
      closeRef.current?.click();
    }
    setDragY(0);
  };

  return (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement)?.focus();
      }}
      style={{
        ...style,
        ...(dragY ? { transform: `translateY(${dragY}px)`, transition: "none" } : undefined),
      }}
      className={cn(
        // Default (md and up): standard centered dialog with iOS 26 rounded-[20px] and subtle shadow
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
        "border border-border/80 bg-background shadow-2xl rounded-[20px] outline-none overflow-hidden",
        "flex flex-col max-h-[85vh]",
        "md:duration-200 md:data-[state=open]:animate-in md:data-[state=closed]:animate-out",
        "md:data-[state=closed]:fade-out-0 md:data-[state=open]:fade-in-0",
        "md:data-[state=closed]:zoom-out-95 md:data-[state=open]:zoom-in-95",
        "md:data-[state=closed]:slide-out-to-left-1/2 md:data-[state=closed]:slide-out-to-top-[48%]",
        "md:data-[state=open]:slide-in-from-left-1/2 md:data-[state=open]:slide-in-from-top-[48%]",
        // <md: animated bottom sheet with rounded-t-[24px]
        "max-md:left-0 max-md:right-0 max-md:top-auto max-md:bottom-0 max-md:translate-x-0 max-md:translate-y-0",
        "max-md:max-w-none max-md:mx-0 max-md:max-h-[92dvh] max-md:pb-safe",
        "max-md:rounded-b-none max-md:rounded-t-[24px] max-md:border-t max-md:border-x-0 max-md:border-b-0",
        "max-md:data-[state=open]:animate-in max-md:data-[state=closed]:animate-out",
        "max-md:data-[state=open]:slide-in-from-bottom-full max-md:data-[state=closed]:slide-out-to-bottom-full",
        className
      )}
      {...props}
      aria-describedby={props["aria-describedby"] ?? undefined}
    >
      {/* Mobile drag handle — swipe down to dismiss; not shown in the centered desktop modal */}
      <div
        className="hidden max-md:block h-1 bg-muted rounded-full w-10 mx-auto mt-3 mb-1 shrink-0 touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Content scroll area */}
      {disableScrollWrapper ? (
        children
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar flex flex-col min-h-0">
          {children}
        </div>
      )}

      <DialogPrimitive.Close ref={closeRef} className={cn("absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none", closeButtonClassName)}>
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1 text-left shrink-0 pb-3 border-b border-border/40",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-2 pt-3 border-t mt-auto shrink-0 pb-safe",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-xs font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-xs text-muted-foreground mt-0.5", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
