// src/lib/utils.ts

/**
 * A basic, zero-dependency version of the `cn` utility function.
 * Filters out falsy values and joins strings with spaces.
 * This is a temporary fallback for `clsx` and `tailwind-merge` until `npm install` is run.
 */
export function cn(...inputs: any[]) {
  const classes: string[] = [];

  const flatten = (arr: any[]) => {
    for (const item of arr) {
      if (!item) continue;
      if (typeof item === "string") {
        classes.push(item);
      } else if (Array.isArray(item)) {
        flatten(item);
      } else if (typeof item === "object") {
        for (const [key, value] of Object.entries(item)) {
          if (value) classes.push(key);
        }
      }
    }
  };

  flatten(inputs);
  return classes.filter(Boolean).join(" ").trim();
}

export type ClassValue = string | number | boolean | undefined | null | { [key: string]: any } | ClassValue[];

export const RELEVANCE_CONFIG = {
  high: {
    label: "Exam Critical",
    color: "crimson",
    bg: "rgba(244,63,94,0.15)",
    border: "rgba(244,63,94,0.3)",
  },
  medium: {
    label: "Important",
    color: "gold",
    bg: "rgba(245,168,0,0.15)",
    border: "rgba(245,168,0,0.3)",
  },
  low: {
    label: "Information",
    color: "blue",
    bg: "rgba(74,114,212,0.15)",
    border: "rgba(74,114,212,0.3)",
  },
};

export const CATEGORY_CONFIG: Record<string, { label: string; emoji: string }> = {
  banking: { label: "Banking & Finance", emoji: "🏦" },
  economy: { label: "Economy Highlights", emoji: "📈" },
  government: { label: "Government Schemes", emoji: "🏛️" },
  international: { label: "International News", emoji: "🌐" },
  "science-tech": { label: "Science & Technology", emoji: "🛸" },
  awards: { label: "Awards & Recognition", emoji: "🏆" },
  sports: { label: "Sports News", emoji: "🏏" },
  appointments: { label: "Appointments", emoji: "👤" },
  general: { label: "General News", emoji: "📋" },
};export const CATEGORY_LABELS: Record<string, string> = Object.entries(CATEGORY_CONFIG).reduce((acc, [key, val]) => ({
  ...acc,
  [key]: val.label
}), {});


export function timeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.abs(now.getTime() - then.getTime()) / 1000;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return then.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
