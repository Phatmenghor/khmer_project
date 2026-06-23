"use client";

import { Input } from "@/components/ui/input";
import { CustomButton } from "@/components/shared/button/custom-button";
import { ActionButton } from "../shared/button/custom-button";
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
          {}
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
              <h1 className="text-xs sm:text-xs font-bold">{title}</h1>
            )}
          </div>

          {}
          <div className="flex flex-wrap items-end gap-1">
            {}
            {onSearchChange && (
              <div className="w-full sm:w-auto sm:min-w-[370px] sm:max-w-[430px] flex-shrink-0">
                <div className="relative w-full group">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                  <Input
                    type="search"
                    placeholder={searchPlaceholder}
                    className="pl-7 w-full placeholder:text-gray-500 focus:border-pink-500 focus:ring-pink-500/20 hover:border-gray-600 transition-all duration-200"
                    value={searchValue}
                    onChange={onSearchChange}
                  />
                </div>
              </div>
            )}

            {}
            <div className="flex flex-wrap items-end gap-1 ml-auto">
              {}
              {customSelect && (
                <div className="flex flex-wrap gap-1 items-end
                  [&>*]:w-auto [&>*]:flex-shrink-0
                  [&>*>label]:whitespace-nowrap [&>*>label]:text-xs [&>*>label]:font-medium">
                  {customSelect}
                </div>
              )}

              {}
              {children &&
                React.Children.map(children, (child) => (
                  <div className="w-auto flex-shrink-0
                    [&>.space-y-1]:!w-auto [&>.space-y-1]:!flex [&>.space-y-1]:!flex-col [&>.space-y-1]:!gap-1
                    [&_button[role=combobox]]:!w-auto [&_button[role=combobox]]:min-w-[140px]
                    [&_.w-full]:!w-auto">
                    {child}
                  </div>
                ))}

              {}
              {buttonText && buttonHref && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={buttonHref}>
                        <CustomButton>
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

              {customAddNewButton && <div>{customAddNewButton}</div>}

              {buttonText && openModal && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CustomButton
                        variant="default"
                        className="h-[26px] px-3 text-white border-0 flex gap-1 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/25 group"
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

        {}
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
