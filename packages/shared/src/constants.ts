import type { AppId, StatusCategory } from "./types";

export const ALL_APPS: AppId[] = [
  "roadmap",
  "priority_ratings",
  "priority_poker",
  "feedback",
  "objectives",
  "capacity_planning",
  "item_mirror",
  "check_ins",
  "portal",
];

export const DEFAULT_APPS: AppId[] = ["roadmap"];

export const STATUS_CATEGORY_ORDER: StatusCategory[] = [
  "not_started",
  "in_progress",
  "done",
  "archived",
];

export const DEFAULT_STATUSES: { name: string; color: string; category: StatusCategory }[] = [
  { name: "Backlog", color: "#94a3b8", category: "not_started" },
  { name: "To Do", color: "#60a5fa", category: "not_started" },
  { name: "In Progress", color: "#fbbf24", category: "in_progress" },
  { name: "In Review", color: "#a78bfa", category: "in_progress" },
  { name: "Done", color: "#34d399", category: "done" },
  { name: "Archived", color: "#6b7280", category: "archived" },
];

export const DEFAULT_ITEM_TYPES = [
  { name: "Initiative", icon: "rocket", color: "#8b5cf6", level: 0 },
  { name: "Feature", icon: "puzzle", color: "#3b82f6", level: 1 },
  { name: "Story", icon: "document", color: "#10b981", level: 2 },
];

export const MAX_HIERARCHY_LEVELS = {
  professional: 3,
  enterprise: Infinity,
  trial: 3,
} as const;

export const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  rich_text: "Rich Text",
  number: "Number",
  select: "Select",
  multi_select: "Multi Select",
  date: "Date",
  date_range: "Date Range",
  person: "Person",
  multi_person: "Multi Person",
  url: "URL",
  email: "Email",
  checkbox: "Checkbox",
  rating: "Rating",
  formula: "Formula",
  relation: "Relation",
  team: "Team",
};
