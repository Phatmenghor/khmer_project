import {
  Home,
  Briefcase,
  ShoppingBag,
  Building2,
  Heart,
  MapPin,
} from "lucide-react";
import React from "react";

export interface LabelTheme {
  bg: string;
  text: string;
  accent: string;
  iconBg: string;
}

export const LABEL_THEME: Record<string, LabelTheme> = {
  home: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-600 dark:text-blue-400",
    accent: "bg-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
  },
  house: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-600 dark:text-blue-400",
    accent: "bg-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
  },
  office: {
    bg: "bg-violet-50 dark:bg-violet-950/20",
    text: "text-violet-600 dark:text-violet-400",
    accent: "bg-violet-500",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
  },
  work: {
    bg: "bg-violet-50 dark:bg-violet-950/20",
    text: "text-violet-600 dark:text-violet-400",
    accent: "bg-violet-500",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
  },
  shop: {
    bg: "bg-orange-50 dark:bg-orange-950/20",
    text: "text-orange-600 dark:text-orange-400",
    accent: "bg-orange-500",
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
  },
  store: {
    bg: "bg-orange-50 dark:bg-orange-950/20",
    text: "text-orange-600 dark:text-orange-400",
    accent: "bg-orange-500",
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
  },
  building: {
    bg: "bg-slate-50 dark:bg-slate-950/20",
    text: "text-slate-600 dark:text-slate-400",
    accent: "bg-slate-500",
    iconBg: "bg-slate-100 dark:bg-slate-900/40",
  },
  apartment: {
    bg: "bg-slate-50 dark:bg-slate-950/20",
    text: "text-slate-600 dark:text-slate-400",
    accent: "bg-slate-500",
    iconBg: "bg-slate-100 dark:bg-slate-900/40",
  },
  family: {
    bg: "bg-rose-50 dark:bg-rose-950/20",
    text: "text-rose-600 dark:text-rose-400",
    accent: "bg-rose-500",
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
  },
  love: {
    bg: "bg-rose-50 dark:bg-rose-950/20",
    text: "text-rose-600 dark:text-rose-400",
    accent: "bg-rose-500",
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
  },
};

export const LABEL_ICON_MAP: Record<string, React.ElementType> = {
  home: Home,
  house: Home,
  office: Briefcase,
  work: Briefcase,
  shop: ShoppingBag,
  store: ShoppingBag,
  building: Building2,
  apartment: Building2,
  love: Heart,
  family: Heart,
};

export function getLabelTheme(label?: string | null): LabelTheme | null {
  if (!label) return null;
  const lower = label.toLowerCase();
  for (const [key, t] of Object.entries(LABEL_THEME)) {
    if (lower.includes(key)) return t;
  }
  return null;
}

export function getLabelIcon(label?: string | null): React.ElementType {
  if (!label) return MapPin;
  const lower = label.toLowerCase();
  for (const [key, Icon] of Object.entries(LABEL_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return MapPin;
}
