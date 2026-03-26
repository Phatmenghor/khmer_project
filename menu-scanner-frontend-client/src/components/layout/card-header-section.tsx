"use client";
// components/CardHeaderSection.tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { ActionButton } from "../shared/button/action-button";

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
        <CardContent className="py-3 sm:py-5">
          {/* Title Section with Back Button */}
          <div className="flex items-center gap-2 mb-3">
            {(back || isMobile) && (
              <ActionButton
                size="icon"
                icon={<ArrowLeft className="w-10 h-10" />}
                tooltip="Back"
                onClick={() => router.back()}
                variant="ghost"
              />
            )}
            {title && (
              <h1 className="text-base sm:text-lg font-bold">{title}</h1>
            )}
          </div>

          {/* Search, Filters, and Actions */}
          <div className="flex flex-wrap items-end gap-2">
            {/* Search input - stays left */}
            {onSearchChange && (
              <div className="w-full sm:w-auto sm:min-w-[370px] sm:max-w-[430px] flex-shrink-0">
                <div className="relative w-full group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    type="search"
                    placeholder={searchPlaceholder}
                    className="pl-10 w-full placeholder:text-gray-500 focus:border-pink-500 focus:ring-pink-500/20 hover:border-gray-600 transition-all duration-200"
                    value={searchValue}
                    onChange={onSearchChange}
                  />
                </div>
              </div>
            )}

            {/* Filters + Button - pushed to the right */}
            <div className="flex flex-wrap items-end gap-2 ml-auto">
              {/* Filters via customSelect */}
              {customSelect && (
                <div className="flex flex-wrap gap-2 items-end
                  [&>*]:w-auto [&>*]:flex-shrink-0
                  [&>*>label]:whitespace-nowrap [&>*>label]:text-xs [&>*>label]:font-medium">
                  {customSelect}
                </div>
              )}

              {/* Filters via children */}
              {children &&
                React.Children.map(children, (child) => (
                  <div className="w-auto flex-shrink-0
                    [&>.space-y-2]:!w-auto [&>.space-y-2]:!flex [&>.space-y-2]:!flex-col [&>.space-y-2]:!gap-1
                    [&_button[role=combobox]]:!w-auto [&_button[role=combobox]]:min-w-[140px]
                    [&_.w-full]:!w-auto">
                    {child}
                  </div>
                ))}

              {/* Action buttons */}
              {buttonText && buttonHref && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={buttonHref}>
                        <Button>
                          {buttonIcon && (
                            <span className="transition-transform duration-200 group-hover:scale-110">
                              {buttonIcon}
                            </span>
                          )}
                          {buttonText}
                        </Button>
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
                      <Button
                        variant="default"
                        className="text-white border-0 flex gap-2 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/25 group"
                        onClick={openModal}
                      >
                        {buttonIcon && (
                          <span className="transition-transform duration-200 group-hover:scale-110">
                            {buttonIcon}
                          </span>
                        )}
                        {buttonText}
                      </Button>
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

        {/* Tabs Section */}
        {tabs && (
          <div className="border-t border-gray-800 px-6 bg-gray-850">
            <div className="[&>*]:text-gray-300 [&>*:hover]:text-gray-100 [&>*[data-state=active]]:text-pink-400 [&>*[data-state=active]]:border-pink-400">
              {tabs}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
