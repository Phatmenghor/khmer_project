"use client";

import { Input } from "@/components/ui/input";
import { CustomButton, ActionButton } from "@/components/shared/button/custom-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/redux/store/use-mobile";

interface CardHeaderSectionProps {
  title?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonTooltip?: string;
  customAddNewButton?: React.ReactNode;
  buttonHref?: string;
  back?: boolean;
  openModal?: () => void;
  customSelect?: React.ReactNode;
  tabs?: React.ReactNode;
  children?: React.ReactNode;
  children1?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href: string }>;
}

export const CardHeaderSection: React.FC<CardHeaderSectionProps> = ({
  title,
  searchPlaceholder = "Search...",
  searchValue,
  customAddNewButton,
  onSearchChange,
  buttonText,
  buttonTooltip,
  children1,
  buttonIcon,
  children,
  back,
  buttonHref,
  openModal,
  customSelect,
  tabs,
}) => {
  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <div>
      <Card>
        <CardContent className="py-2 sm:py-3">
          <div className="flex items-center gap-1 mb-2">
            {(back || isMobile) && (
              <ActionButton
                size="icon"
                icon={<ArrowLeft className="w-4 h-4" />}
                tooltip="Back"
                onClick={() => router.back()}
                variant="ghost"
              />
            )}
            {title && (
              <h1 className="text-xs sm:text-xs font-bold text-foreground">{title}</h1>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-1.5">
            {onSearchChange && (
              <div className="w-full sm:w-auto sm:min-w-[370px] sm:max-w-[430px] flex-shrink-0">
                <div className="relative w-full group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder={searchPlaceholder}
                    className="pl-8 w-full placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-200"
                    value={searchValue}
                    onChange={onSearchChange}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-end gap-1.5 ml-auto">
              {customSelect && (
                <div className="flex flex-wrap gap-1 items-end
                  [&>*]:w-auto [&>*]:flex-shrink-0
                  [&>*>label]:whitespace-nowrap [&>*>label]:text-xs [&>*>label]:font-medium">
                  {customSelect}
                </div>
              )}

              {children &&
                React.Children.map(children, (child) => (
                  <div className="w-auto flex-shrink-0
                    [&>.space-y-1]:!w-auto [&>.space-y-1]:!flex [&>.space-y-1]:!flex-col [&>.space-y-1]:!gap-1
                    [&_button[role=combobox]]:!w-auto [&_button[role=combobox]]:min-w-[140px]
                    [&_.w-full]:!w-auto">
                    {child}
                  </div>
                ))}

              {buttonText && buttonHref && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={buttonHref}>
                        <CustomButton icon={buttonIcon}>
                          {buttonText}
                        </CustomButton>
                      </Link>
                    </TooltipTrigger>
                    {buttonTooltip && (
                      <TooltipContent>
                        <p>{buttonTooltip}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}

              {customAddNewButton && <div>{customAddNewButton}</div>}

              {buttonText && openModal && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CustomButton
                        variant="default"
                        icon={buttonIcon}
                        onClick={openModal}
                      >
                        {buttonText}
                      </CustomButton>
                    </TooltipTrigger>
                    {buttonTooltip && (
                      <TooltipContent>
                        <p>{buttonTooltip}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {children1 && (
            <div className="px-0 pb-0 mt-2">{children1}</div>
          )}
        </CardContent>

        {tabs && (
          <div className="border-t border-border px-4 bg-muted/20">
            {tabs}
          </div>
        )}
      </Card>
    </div>
  );
};
