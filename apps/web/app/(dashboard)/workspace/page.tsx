"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAppStore, type ViewMode } from "@/lib/store";
import { BoardView } from "@/components/views/board-view";
import { TimelineView } from "@/components/views/timeline-view";
import { ItemDetailSheet } from "@/components/item-detail-sheet";
import { SearchFilter } from "@/components/search-filter";
import { PriorityScore, ScoreBar } from "@/components/priority-score";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LayoutGrid,
  Table2,
  List,
  CalendarRange,
  Plus,
  Loader2,
  FolderOpen,
  TrendingUp,
  Save,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function WorkspacePage() {
  const router = useRouter();
  const { selectedWorkspaceId, selectedItemId, setSelectedItemId, viewMode, setViewMode } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTypeId, setNewTypeId] = useState("");
  const [newStatusId, setNewStatusId] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    statusIds: [] as string[],
    typeIds: [] as string[],
    assigneeIds: [] as string[],
  });
  const [sortField, setSortField] = useState("position");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const { data: user } = trpc.auth.me.useQuery();

  const { data: workspace, isLoading: wsLoading } = trpc.workspace.getById.useQuery(
    { id: selectedWorkspaceId ?? "" },
    { enabled: !!selectedWorkspaceId }
  );

  const {
    data: itemsData,
    isLoading: itemsLoading,
    refetch: refetchItems,
  } = trpc.item.list.useQuery(
    { workspaceId: selectedWorkspaceId ?? "" },
    { enabled: !!selectedWorkspaceId }
  );

  const createItem = trpc.item.create.useMutation({
    onSuccess: () => {
      setNewTitle("");
      setNewDescription("");
      setNewStartDate("");
      setNewEndDate("");
      setIsCreating(false);
      setCreateDialogOpen(false);
      refetchItems();
    },
    onError: (err) => alert(`Failed to create item: ${err.message}`),
  });

  const updateItem = trpc.item.update.useMutation({
    onSuccess: () => refetchItems(),
    onError: (err) => alert(`Failed to update item: ${err.message}`),
  });

  // Filter and sort items
  const items = useMemo(() => {
    let result = itemsData?.items ?? [];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      );
    }

    // Filter by status
    if (activeFilters.statusIds.length > 0) {
      result = result.filter(
        (item) => item.status && activeFilters.statusIds.includes(item.status.id)
      );
    }

    // Filter by type
    if (activeFilters.typeIds.length > 0) {
      result = result.filter(
        (item) => item.itemType && activeFilters.typeIds.includes(item.itemType.id)
      );
    }

    // Filter by assignee
    if (activeFilters.assigneeIds.length > 0) {
      result = result.filter(
        (item) =>
          item.assignee && activeFilters.assigneeIds.includes(item.assignee.id)
      );
    }

    // Sort
    if (sortField !== "position") {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        switch (sortField) {
          case "title":
            cmp = a.title.localeCompare(b.title);
            break;
          case "createdAt":
            cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case "updatedAt":
            cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            break;
          case "status":
            cmp = (a.status?.name ?? "").localeCompare(b.status?.name ?? "");
            break;
          case "priority": {
            const scoreA = (a.customFields as any)?.priorityScore ?? 0;
            const scoreB = (b.customFields as any)?.priorityScore ?? 0;
            cmp = scoreA - scoreB;
            break;
          }
        }
        return sortDirection === "desc" ? -cmp : cmp;
      });
    }

    return result;
  }, [itemsData?.items, searchQuery, activeFilters, sortField, sortDirection]);

  const statuses = workspace?.statuses ?? [];
  const defaultItemType = workspace?.itemTypes?.[1] ?? workspace?.itemTypes?.[0];
  const defaultStatus = statuses.find((s) => s.category === "not_started");

  // Filter options
  const statusOptions = statuses
    .filter((s) => s.category !== "archived")
    .map((s) => ({ id: s.id, label: s.name, color: s.color }));
  const typeOptions = (workspace?.itemTypes ?? []).map((t) => ({
    id: t.id,
    label: t.name,
    color: t.color ?? undefined,
  }));
  const assigneeOptions = useMemo(() => {
    const seen = new Map<string, { id: string; label: string }>();
    for (const item of itemsData?.items ?? []) {
      if (item.assignee && !seen.has(item.assignee.id)) {
        seen.set(item.assignee.id, {
          id: item.assignee.id,
          label: item.assignee.name,
        });
      }
    }
    return Array.from(seen.values());
  }, [itemsData?.items]);

  // No workspace selected
  if (!selectedWorkspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold">No workspace selected</h2>
          <p className="text-sm text-muted-foreground">
            Select a workspace from the sidebar or create a new one to get started.
          </p>
          <Button onClick={() => router.push("/workspace/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create workspace
          </Button>
        </div>
      </div>
    );
  }

  if (wsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  function handleQuickCreate() {
    if (newTitle.trim()) {
      createItem.mutate({
        workspaceId: selectedWorkspaceId!,
        title: newTitle.trim(),
        itemTypeId: defaultItemType?.id ?? "",
        statusId: defaultStatus?.id ?? null,
      });
    }
  }

  function handleDialogCreate() {
    if (newTitle.trim()) {
      createItem.mutate({
        workspaceId: selectedWorkspaceId!,
        title: newTitle.trim(),
        description: newDescription || null,
        itemTypeId: newTypeId || defaultItemType?.id || "",
        statusId: newStatusId || defaultStatus?.id || null,
        startDate: newStartDate ? new Date(newStartDate).toISOString() : undefined,
        endDate: newEndDate ? new Date(newEndDate).toISOString() : undefined,
      });
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{workspace?.name}</h2>
          <Badge variant="secondary" className="font-normal">
            {items.length} items
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
            {(
              [
                { mode: "board" as const, icon: LayoutGrid, label: "Board" },
                { mode: "table" as const, icon: Table2, label: "Table" },
                { mode: "list" as const, icon: List, label: "List" },
                { mode: "timeline" as const, icon: CalendarRange, label: "Timeline" },
              ] as const
            ).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  viewMode === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Create item */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Item title..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleDialogCreate();
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Optional description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={newTypeId || defaultItemType?.id || ""}
                      onValueChange={setNewTypeId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {workspace?.itemTypes?.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: t.color ?? "#888" }}
                              />
                              {t.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newStatusId || defaultStatus?.id || ""}
                      onValueChange={setNewStatusId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses
                          .filter((s) => s.category !== "archived")
                          .map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: s.color }}
                                />
                                {s.name}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleDialogCreate}
                  disabled={!newTitle.trim() || createItem.isPending}
                  className="w-full"
                >
                  {createItem.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  Create Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="border-b border-border px-6 py-2">
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusOptions={statusOptions}
          typeOptions={typeOptions}
          assigneeOptions={assigneeOptions}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={(field, dir) => {
            setSortField(field);
            setSortDirection(dir);
          }}
        />
      </div>

      {/* View content */}
      <div className="flex-1 overflow-auto p-6">
        {itemsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 && !searchQuery && activeFilters.statusIds.length === 0 ? (
          <EmptyState onAddItem={() => setCreateDialogOpen(true)} />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-muted-foreground">No items match your filters.</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => {
                setSearchQuery("");
                setActiveFilters({ statusIds: [], typeIds: [], assigneeIds: [] });
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : viewMode === "board" ? (
          <BoardView
            items={items}
            statuses={statuses}
            onUpdate={() => refetchItems()}
            onItemClick={(id) => setSelectedItemId(id)}
          />
        ) : viewMode === "timeline" ? (
          <TimelineView
            items={items as any}
            onUpdate={() => refetchItems()}
            onItemClick={(id) => setSelectedItemId(id)}
          />
        ) : viewMode === "table" ? (
          <TableView
            items={items}
            onItemClick={(id) => setSelectedItemId(id)}
            onUpdateScore={(itemId, scores) => {
              updateItem.mutate({
                id: itemId,
                data: { customFields: { priorityScores: scores } },
              });
            }}
          />
        ) : (
          <ListView
            items={items}
            onItemClick={(id) => setSelectedItemId(id)}
          />
        )}
      </div>

      {/* Item detail sheet */}
      <ItemDetailSheet
        itemId={selectedItemId}
        open={!!selectedItemId}
        onClose={() => setSelectedItemId(null)}
        onUpdate={() => refetchItems()}
      />
    </div>
  );
}

function EmptyState({ onAddItem }: { onAddItem: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <LayoutGrid className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No items yet</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        Start building your roadmap by adding items to this workspace.
      </p>
      <Button className="mt-4" onClick={onAddItem}>
        <Plus className="mr-2 h-4 w-4" />
        Add your first item
      </Button>
    </div>
  );
}

function TableView({
  items,
  onItemClick,
  onUpdateScore,
}: {
  items: any[];
  onItemClick: (id: string) => void;
  onUpdateScore: (itemId: string, scores: Record<string, number>) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
              Title
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
              Type
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
              Assignee
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground w-28">
              Priority
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
              Dates
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
              Created
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const scores = (item.customFields as any)?.priorityScores ?? {};
            return (
              <tr
                key={item.id}
                onClick={() => onItemClick(item.id)}
                className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {item.title}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: (item.itemType?.color ?? "#888") + "40",
                      color: item.itemType?.color ?? "#888",
                    }}
                  >
                    {item.itemType?.name ?? "\u2014"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.status?.color ?? "#888" }}
                    />
                    <span className="text-sm">
                      {item.status?.name ?? "No status"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {item.assignee?.name ?? "\u2014"}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <PriorityScore
                    itemId={item.id}
                    scores={scores}
                    compact
                    onUpdate={(newScores) => onUpdateScore(item.id, newScores)}
                  />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {item.startDate
                    ? new Date(item.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                  {item.startDate && item.endDate ? " \u2013 " : ""}
                  {item.endDate
                    ? new Date(item.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                  {!item.startDate && !item.endDate ? "\u2014" : ""}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ListView({
  items,
  onItemClick,
}: {
  items: any[];
  onItemClick: (id: string) => void;
}) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer"
        >
          <span
            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.status?.color ?? "#888" }}
          />
          <span className="text-sm text-foreground flex-1 font-medium">
            {item.title}
          </span>
          {item.itemType && (
            <Badge
              variant="outline"
              className="text-[10px]"
              style={{
                borderColor: (item.itemType.color ?? "#888") + "40",
                color: item.itemType.color ?? "#888",
              }}
            >
              {item.itemType.name}
            </Badge>
          )}
          {item.startDate && (
            <span className="text-[10px] text-muted-foreground">
              {new Date(item.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
          {item.assignee && (
            <span className="text-xs text-muted-foreground">
              {item.assignee.name}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
