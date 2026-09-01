import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-[12px] border border-border bg-muted/50 px-3.5 py-2.5 text-base md:text-sm text-foreground leading-relaxed shadow-2xs transition-all duration-200 ease-out hover:bg-muted/65 hover:border-border focus:outline-none focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/20 resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
