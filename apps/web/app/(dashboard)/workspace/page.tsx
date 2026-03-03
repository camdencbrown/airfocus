"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { BoardView } from "@/components/views/board-view";
import { cn } from "@/lib/utils";

type ViewMode = "board" | "table" | "list";

export default function WorkspacePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);

  // For now, we'll use a simpler approach: get workspaces via a direct query
  // In production, we'd get the org ID from context/URL
  const { data: workspaceData, isLoading: wsLoading } = trpc.workspace.list.useQuery(
    { organizationId: "" },
    { enabled: false } // disabled until we have org ID
  );

  // Direct items query using the workspace ID from the URL or first available
  const { data: itemsData, isLoading: itemsLoading, refetch: refetchItems } = trpc.item.list.useQuery(
    { workspaceId: selectedWorkspaceId ?? "" },
    { enabled: !!selectedWorkspaceId }
  );

  const { data: workspace } = trpc.workspace.getById.useQuery(
    { id: selectedWorkspaceId ?? "" },
    { enabled: !!selectedWorkspaceId }
  );

  // Auto-discover workspace from DB
  const { data: discoveredWorkspace } = trpc.workspace.list.useQuery(
    { organizationId: "discover" },
    {
      enabled: !selectedWorkspaceId,
      retry: false,
    }
  );

  // Simple workspace discovery: query the first available item to get workspace ID
  const { data: anyItems } = trpc.item.list.useQuery(
    { workspaceId: "discover" },
    { enabled: false }
  );

  // If no workspace selected, show workspace selector
  if (!selectedWorkspaceId) {
    return (
      <WorkspaceSelector onSelect={setSelectedWorkspaceId} />
    );
  }

  const items = itemsData?.items ?? [];
  const statuses = workspace?.statuses ?? [];

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-card p-4">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground">
            {workspace?.name ?? "Workspace"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {items.length} items
          </p>
        </div>

        <nav className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Views
          </div>
          {(["board", "table", "list"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                viewMode === mode
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <ViewIcon mode={mode} />
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">
              All Items
            </h3>
            <span className="text-xs text-muted-foreground">
              {items.length} items
            </span>
          </div>
          <AddItemButton
            workspaceId={selectedWorkspaceId}
            workspace={workspace}
            onCreated={() => refetchItems()}
          />
        </div>

        {/* View content */}
        <div className="p-6">
          {itemsLoading ? (
            <div className="text-muted-foreground text-sm">Loading items...</div>
          ) : viewMode === "board" ? (
            <BoardView items={items} statuses={statuses} onUpdate={() => refetchItems()} />
          ) : viewMode === "table" ? (
            <TableView items={items} />
          ) : (
            <ListView items={items} />
          )}
        </div>
      </div>
    </div>
  );
}

function ViewIcon({ mode }: { mode: ViewMode }) {
  if (mode === "board") {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }
  if (mode === "table") {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M3 10h18M3 14h18M3 6h18M3 18h18" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function WorkspaceSelector({ onSelect }: { onSelect: (id: string) => void }) {
  const [wsId, setWsId] = useState("");

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="max-w-md w-full px-4 space-y-4 text-center">
        <h2 className="text-2xl font-bold">Select a Workspace</h2>
        <p className="text-muted-foreground text-sm">
          Enter a workspace ID to get started. Check your database for existing workspaces.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={wsId}
            onChange={(e) => setWsId(e.target.value)}
            placeholder="Workspace ID"
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={() => wsId && onSelect(wsId)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
}

function AddItemButton({
  workspaceId,
  workspace,
  onCreated,
}: {
  workspaceId: string;
  workspace: any;
  onCreated: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");

  const createItem = trpc.item.create.useMutation({
    onSuccess: () => {
      setTitle("");
      setIsOpen(false);
      onCreated();
    },
  });

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        + Add item
      </button>
    );
  }

  const defaultItemType = workspace?.itemTypes?.[1] ?? workspace?.itemTypes?.[0];
  const defaultStatus = workspace?.statuses?.find((s: any) => s.category === "not_started");

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Item title..."
        autoFocus
        className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm w-64"
        onKeyDown={(e) => {
          if (e.key === "Enter" && title.trim()) {
            createItem.mutate({
              workspaceId,
              title: title.trim(),
              itemTypeId: defaultItemType?.id ?? "",
              statusId: defaultStatus?.id ?? null,
            });
          }
          if (e.key === "Escape") setIsOpen(false);
        }}
      />
      <button
        onClick={() => {
          if (title.trim()) {
            createItem.mutate({
              workspaceId,
              title: title.trim(),
              itemTypeId: defaultItemType?.id ?? "",
              statusId: defaultStatus?.id ?? null,
            });
          }
        }}
        disabled={!title.trim() || createItem.isPending}
        className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {createItem.isPending ? "..." : "Add"}
      </button>
      <button
        onClick={() => setIsOpen(false)}
        className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
      >
        Cancel
      </button>
    </div>
  );
}

function TableView({ items }: { items: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Title</th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Type</th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Created</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">{item.title}</td>
              <td className="px-4 py-3">
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: (item.itemType?.color ?? "#888") + "20", color: item.itemType?.color ?? "#888" }}
                >
                  {item.itemType?.name ?? "—"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className="inline-flex items-center gap-1.5 text-xs"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.status?.color ?? "#888" }}
                  />
                  {item.status?.name ?? "No status"}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs">
                {new Date(item.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListView({ items }: { items: any[] }) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
        >
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.status?.color ?? "#888" }}
          />
          <span className="text-sm text-foreground flex-1">{item.title}</span>
          <span className="text-xs text-muted-foreground">{item.itemType?.name}</span>
        </div>
      ))}
    </div>
  );
}
