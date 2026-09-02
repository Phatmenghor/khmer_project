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
import { useIsMobile } from "@/hooks/use-mobile";

interface CardHeaderSectionProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href: string }>;
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
          {/* Title bar */}
          <div className="flex items-center gap-1 mb-2">
            {(back || isMobile) && (
              <ActionButton
                size="icon"
                icon={<ArrowLeft className="w-7 h-7" />}
                tooltip="Back"
                onClick={() => router.back()}
                variant="ghost"
              />
            )}
            {title && (
              <h1 className="text-sm sm:text-base lg:text-lg font-bold text-foreground tracking-tight">{title}</h1>
            )}
          </div>

          {/* Search & Actions bar */}
          <div className="flex flex-wrap items-end gap-2">
            {/* Search Input */}
            {onSearchChange && (
              <div className="w-full sm:w-auto sm:min-w-[370px] sm:max-w-[430px] flex-shrink-0">
                <div className="relative w-full group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70 pointer-events-none" />
                  <Input
                    type="search"
                    placeholder={searchPlaceholder}
                    className="pl-8 h-[36px] w-full text-xs rounded-[12px] placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-border transition-all duration-200"
                    value={searchValue}
                    onChange={onSearchChange}
                  />
                </div>
              </div>
            )}

            {/* Actions & Filters */}
            <div className="flex flex-wrap items-end gap-2 ml-auto">
              {/* Custom Selects */}
              {customSelect && (
                <div className="flex flex-wrap gap-2 items-end
                  [&>*]:w-auto [&>*]:flex-shrink-0
                  [&_*[role=combobox]]:h-[36px] [&_*[role=combobox]]:rounded-[12px]
                  [&>*>label]:whitespace-nowrap [&>*>label]:text-xs [&>*>label]:font-semibold">
                  {customSelect}
                </div>
              )}

              {/* Children (Filters/Selects) */}
              {children &&
                React.Children.map(children, (child) => (
                  <div className="w-auto flex-shrink-0
                    [&_.space-y-1]:!w-auto [&_.space-y-1]:!flex [&_.space-y-1]:!flex-col [&_.space-y-1]:!gap-1
                    [&_button[role=combobox]]:!h-[36px] [&_button[role=combobox]]:!rounded-[12px] [&_button[role=combobox]]:!w-auto [&_button[role=combobox]]:min-w-[140px]
                    [&_.w-full]:!w-auto">
                    {child}
                  </div>
                ))}

              {/* Action Button with Link */}
              {buttonText && buttonHref && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={buttonHref}>
                        <CustomButton
                          variant="default"
                          className="h-[36px] px-3.5 text-xs font-semibold rounded-[12px] flex items-center gap-1.5 transition-all shadow-xs group"
                        >
                          {buttonIcon && (
                            <span className="transition-transform duration-200 group-hover:scale-110">
                              {buttonIcon}
                            </span>
                          )}
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

              {customAddNewButton && <div className="flex items-end">{customAddNewButton}</div>}

              {/* Action Button with Modal Trigger */}
              {buttonText && openModal && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CustomButton
                        variant="default"
                        className="h-[36px] px-3.5 text-xs font-semibold rounded-[12px] flex items-center gap-1.5 transition-all shadow-xs group"
                        onClick={openModal}
                      >
                        {buttonIcon && (
                          <span className="transition-transform duration-200 group-hover:scale-110">
                            {buttonIcon}
                          </span>
                        )}
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
            <div className="px-0 pb-0 [&>*]:text-gray-200">{children1}</div>
          )}
        </CardContent>

        {/* Tabs Bar */}
        {tabs && (
          <div className="border-t border-gray-800 px-4 bg-gray-850">
            <div className="[&>*]:text-gray-300 [&>*:hover]:text-gray-100 [&>*[data-state=active]]:text-pink-400 [&>*[data-state=active]]:border-pink-400">
              {tabs}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
