"use client";
// components/CardHeaderSection.tsx
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
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

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface CardHeaderSectionProps {
  breadcrumbs?: BreadcrumbItemType[];
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
  breadcrumbs,
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
        <CardContent className="p-3 sm:p-4 md:p-5">
          {/* Breadcrumb - Compact */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="mb-2.5">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((item, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {item.href ? (
                          <BreadcrumbLink
                            href={item.href}
                            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                          >
                            {item.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage className="text-xs text-gray-500 font-medium">
                            {item.label}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator className="text-gray-600" />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}

          {/* Header Row: Title (Left) + Add Button (Right) */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            {/* Back button + Title */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {(back || isMobile) && (
                <ActionButton
                  size="sm"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  tooltip="Back"
                  onClick={() => router.back()}
                  variant="ghost"
                />
              )}
              {title && (
                <h1 className="text-lg sm:text-xl font-semibold truncate">
                  {title}
                </h1>
              )}
            </div>

            {/* Primary Action Button (Top Right) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {customAddNewButton && customAddNewButton}
              {buttonText && openModal && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-1.5 font-medium text-xs sm:text-sm h-9"
                        onClick={openModal}
                      >
                        {buttonIcon && (
                          <span className="flex-shrink-0">
                            {buttonIcon}
                          </span>
                        )}
                        <span className="hidden sm:inline">{buttonText}</span>
                        <span className="sm:hidden">{buttonText?.split(" ")[0]}</span>
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

          {/* Controls Row: Search + Filters (Same Row) */}
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            {/* Search Input - Compact width */}
            {onSearchChange && (
              <div className="relative w-full sm:w-60 group shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
                <Input
                  type="search"
                  placeholder={searchPlaceholder}
                  className="pl-9 h-9 text-sm placeholder:text-gray-600 focus:border-pink-500 focus:ring-pink-500/20 hover:border-gray-600 transition-all"
                  value={searchValue}
                  onChange={onSearchChange}
                />
              </div>
            )}

            {/* Filters - Same row, compact */}
            <div className="flex gap-2 items-end flex-wrap flex-1">
              {customSelect && (
                <div className="[&>*]:h-9 [&>*]:text-sm [&>*]:bg-gray-800 [&>*]:border-gray-700 [&>*]:text-gray-200">
                  {customSelect}
                </div>
              )}
              {children && (
                <div className="flex gap-2 items-end flex-wrap">
                  {children}
                </div>
              )}

              {/* Secondary Action Button */}
              {buttonText && buttonHref && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={buttonHref}>
                        <Button variant="outline" size="sm" className="h-9 text-xs sm:text-sm gap-1.5 ml-auto sm:ml-0">
                          {buttonIcon && (
                            <span className="flex-shrink-0">
                              {buttonIcon}
                            </span>
                          )}
                          <span className="hidden sm:inline">{buttonText}</span>
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
            </div>
          </div>

          {/* Advanced Filters Row (Optional) */}
          {children1 && (
            <div className="flex flex-wrap gap-2 mt-2 [&>*]:text-gray-200 [&>*]:text-sm">
              {children1}
            </div>
          )}
        </CardContent>

        {/* Tabs Section */}
        {tabs && (
          <div className="border-t border-gray-800 px-3 sm:px-4 md:px-5 py-2.5 bg-gray-850">
            <div className="overflow-x-auto [&>*]:text-gray-300 [&>*:hover]:text-gray-100 [&>*[data-state=active]]:text-pink-400 [&>*[data-state=active]]:border-pink-400">
              {tabs}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
