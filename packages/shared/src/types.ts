// ============================================================
// Core Domain Types — shared between frontend and backend
// ============================================================

// --- Organization ---

export type OrgRole = "owner" | "admin" | "member";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  plan: "trial" | "professional" | "enterprise";
  createdAt: Date;
  updatedAt: Date;
}

export interface OrgMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrgRole;
  createdAt: Date;
}

// --- User ---

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// --- Workspace ---

export type WorkspaceRole = "editor" | "contributor" | "viewer";

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettings {
  enabledApps: AppId[];
  timezone: string;
  dateFormat: string;
}

export type AppId =
  | "roadmap"
  | "priority_ratings"
  | "priority_poker"
  | "feedback"
  | "objectives"
  | "capacity_planning"
  | "item_mirror"
  | "check_ins"
  | "portal";

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: Date;
}

// --- Item Types (Hierarchy Definition) ---

export interface ItemType {
  id: string;
  workspaceId: string;
  name: string;
  icon: string | null;
  color: string | null;
  level: number;
  parentTypeId: string | null;
  position: number;
  createdAt: Date;
}

// --- Items ---

export interface Item {
  id: string;
  workspaceId: string;
  itemTypeId: string;
  title: string;
  description: string | null;
  statusId: string | null;
  assigneeId: string | null;
  parentId: string | null;
  position: number;
  customFields: Record<string, unknown>;
  startDate: string | null;
  endDate: string | null;
  archivedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- Custom Fields ---

export type FieldType =
  | "text"
  | "rich_text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "date_range"
  | "person"
  | "multi_person"
  | "url"
  | "email"
  | "checkbox"
  | "rating"
  | "formula"
  | "relation"
  | "team";

export interface FieldOption {
  id: string;
  label: string;
  color: string | null;
}

export interface CustomFieldDefinition {
  id: string;
  workspaceId: string;
  name: string;
  type: FieldType;
  description: string | null;
  required: boolean;
  defaultValue: unknown;
  options: FieldOption[] | null;
  config: Record<string, unknown>;
  scope: string[] | null; // item type IDs this field applies to, null = all
  position: number;
  createdAt: Date;
}

export interface CustomFieldValue {
  id: string;
  itemId: string;
  fieldId: string;
  value: unknown;
}

// --- Statuses ---

export type StatusCategory = "not_started" | "in_progress" | "done" | "archived";

export interface Status {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  category: StatusCategory;
  position: number;
}

// --- Relationships ---

export type RelationType =
  | "parent"
  | "blocks"
  | "blocked_by"
  | "related"
  | "mirror"
  | "feedback_link"
  | "okr_link";

export interface ItemRelation {
  id: string;
  sourceItemId: string;
  targetItemId: string;
  relationType: RelationType;
  createdAt: Date;
}

// --- Comments ---

export interface Comment {
  id: string;
  itemId: string;
  authorId: string;
  content: string;
  parentCommentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// --- Activity Log ---

export type ActivityAction = "created" | "updated" | "deleted" | "status_changed" | "commented" | "assigned";

export interface ActivityEntry {
  id: string;
  workspaceId: string;
  itemId: string | null;
  userId: string;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  changes: Record<string, { old: unknown; new: unknown }> | null;
  createdAt: Date;
}

// --- Views ---

export type ViewType =
  | "board"
  | "table"
  | "list"
  | "timeline"
  | "gantt"
  | "chart"
  | "document"
  | "inbox";

export type FilterOperator =
  | "eq"
  | "neq"
  | "contains"
  | "not_contains"
  | "is_empty"
  | "is_not_empty"
  | "gt"
  | "lt"
  | "between"
  | "in";

export interface FilterCondition {
  fieldId: string;
  operator: FilterOperator;
  value: unknown;
}

export interface FilterGroup {
  combinator: "and" | "or";
  conditions: (FilterCondition | FilterGroup)[];
}

export interface SortRule {
  fieldId: string;
  direction: "asc" | "desc";
}

export interface ViewConfig {
  filters: FilterGroup | null;
  sort: SortRule[];
  groupBy: string | null;
  subGroupBy: string | null;
  visibleFields: string[];
  fieldWidths: Record<string, number>;
  colorBy: string | null;
  collapsedGroups: string[];
  cardFields: string[];
}

export interface View {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  icon: string | null;
  viewType: ViewType;
  config: ViewConfig;
  isPrivate: boolean;
  createdBy: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

// --- Notifications ---

export type NotificationType =
  | "mention"
  | "assignment"
  | "status_change"
  | "comment"
  | "feedback_linked";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  itemId: string | null;
  workspaceId: string | null;
  read: boolean;
  createdAt: Date;
}
