import { ReactNode } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ActionButtonProps extends Omit<ButtonProps, "children" | "onClick"> {
  icon: ReactNode;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const ActionButton = ({
  icon,
  tooltip,
  onClick,
  variant = "outline",
  size = "sm",
  disabled = false,
  loading = false,
  className = "",
  ...rest
}: ActionButtonProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || loading}
          className={cn(
            "h-[18px] w-[18px] p-0",
            variant === "outline" &&
              "hover:bg-primary/10 hover:border-primary hover:text-primary",
            variant === "secondary" &&
              "bg-primary/10 border-primary text-primary hover:bg-primary/20",
            className
          )}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          {...rest}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            icon
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);


export const ConditionalActionButton = ({
  icon,
  tooltip,
  onClick,
  variant = "outline",
  size = "sm",
  disabled = false,
  loading = false,
  className = "",
  ...rest
}: ActionButtonProps & { tooltip?: string }) => {
  const buttonElement = (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={cn(
        variant === "outline" &&
          "hover:bg-primary/10 hover:border-primary hover:text-primary",
        variant === "secondary" &&
          "bg-primary/10 border-primary text-primary hover:bg-primary/20",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        icon
      )}
    </Button>
  );

  if (!tooltip) {
    return buttonElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
