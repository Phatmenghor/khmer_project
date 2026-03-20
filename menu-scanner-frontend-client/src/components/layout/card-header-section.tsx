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
        <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
          {/* Breadcrumb Section */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((item, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {item.href ? (
                          <BreadcrumbLink
                            href={item.href}
                            className="text-xs sm:text-sm text-gray-600 hover:text-gray-500 transition-colors duration-200"
                          >
                            {item.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage className="text-xs sm:text-sm text-gray-400 font-medium">
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

          {/* Title Section with Back Button */}
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            {(back || isMobile) && (
              <ActionButton
                size="sm"
                icon={<ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
                tooltip="Back"
                onClick={() => router.back()}
                variant="ghost"
              />
            )}
            {title && (
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate">
                {title}
              </h1>
            )}
          </div>

          {/* Search and Actions Section - Responsive Grid */}
          <div className="space-y-3 sm:space-y-4">
            {/* Row 1: Search + Select (on desktop they stay together) */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
              {/* Search input */}
              {onSearchChange && (
                <div className="flex-1 min-w-0">
                  <div className="relative w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none flex-shrink-0" />
                    <Input
                      type="search"
                      placeholder={searchPlaceholder}
                      className="pl-10 w-full text-sm placeholder:text-gray-500 focus:border-pink-500 focus:ring-pink-500/20 hover:border-gray-600 transition-all duration-200"
                      value={searchValue}
                      onChange={onSearchChange}
                    />
                  </div>
                </div>
              )}

              {/* Filters/Select on same row as search on desktop */}
              {customSelect && (
                <div className="w-full sm:w-auto flex-shrink-0 [&>*]:bg-gray-800 [&>*]:border-gray-700 [&>*]:text-gray-200 [&>*]:text-sm">
                  {customSelect}
                </div>
              )}
            </div>

            {/* Row 2: Action buttons - Responsive layout */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {/* Children (filter buttons etc) */}
              {children && (
                <div className="w-full order-first sm:order-none flex flex-wrap gap-2 sm:gap-3">
                  {children}
                </div>
              )}

              {/* Custom add button */}
              {customAddNewButton && (
                <div className="w-full sm:w-auto">{customAddNewButton}</div>
              )}

              {/* Link button */}
              {buttonText && buttonHref && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={buttonHref} className="flex-1 sm:flex-none">
                        <Button className="w-full sm:w-auto text-sm">
                          {buttonIcon && (
                            <span className="transition-transform duration-200 group-hover:scale-110">
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

              {/* Modal button - Primary */}
              {buttonText && openModal && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="default"
                        className="flex-1 sm:flex-none gap-2 font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/25 group"
                        onClick={openModal}
                      >
                        {buttonIcon && (
                          <span className="transition-transform duration-200 group-hover:scale-110">
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

            {/* Filters/Actions row */}
            {children1 && (
              <div className="pt-2 sm:pt-3 [&>*]:text-gray-200 [&>*]:text-sm">
                {children1}
              </div>
            )}
          </div>
        </CardContent>

        {/* Tabs Section */}
        {tabs && (
          <div className="border-t border-gray-800 px-3 sm:px-4 md:px-5 lg:px-6 py-3 bg-gray-850">
            <div className="overflow-x-auto [&>*]:text-gray-300 [&>*:hover]:text-gray-100 [&>*[data-state=active]]:text-pink-400 [&>*[data-state=active]]:border-pink-400">
              {tabs}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
