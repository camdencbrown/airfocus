"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

interface BoardItem {
  id: string;
  title: string;
  description: string | null;
  status: { id: string; name: string; color: string; category: string } | null;
  itemType: { id: string; name: string; color: string } | null;
  assignee: { id: string; name: string; avatarUrl: string | null } | null;
}

interface Status {
  id: string;
  name: string;
  color: string;
  category: string;
  position: number;
}

interface BoardViewProps {
  items: BoardItem[];
  statuses: Status[];
  onUpdate: () => void;
}

export function BoardView({ items, statuses, onUpdate }: BoardViewProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const updateItem = trpc.item.update.useMutation({
    onSuccess: () => onUpdate(),
  });

  // Sort statuses by position, exclude archived
  const columns = statuses
    .filter((s) => s.category !== "archived")
    .sort((a, b) => a.position - b.position);

  // Group items by status
  const itemsByStatus = new Map<string, BoardItem[]>();
  for (const col of columns) {
    itemsByStatus.set(col.id, []);
  }
  // Items with no status go in first column
  const noStatusItems: BoardItem[] = [];
  for (const item of items) {
    if (item.status) {
      const existing = itemsByStatus.get(item.status.id);
      if (existing) {
        existing.push(item);
      }
    } else {
      noStatusItems.push(item);
    }
  }
  if (columns[0] && noStatusItems.length > 0) {
    const first = itemsByStatus.get(columns[0].id) ?? [];
    first.push(...noStatusItems);
  }

  function handleDragStart(e: React.DragEvent, itemId: string) {
    setDraggingId(itemId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", itemId);
  }

  function handleDragOver(e: React.DragEvent, statusId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(statusId);
  }

  function handleDragLeave() {
    setDragOverColumn(null);
  }

  function handleDrop(e: React.DragEvent, statusId: string) {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    setDraggingId(null);
    setDragOverColumn(null);

    if (itemId) {
      updateItem.mutate({
        id: itemId,
        data: { statusId },
      });
    }
  }

  if (columns.length === 0) {
    return <div className="text-muted-foreground text-sm">No statuses configured.</div>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const colItems = itemsByStatus.get(column.id) ?? [];
        const isOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className={cn(
              "flex-shrink-0 w-72 rounded-lg bg-muted/30 border border-transparent transition-colors",
              isOver && "border-primary/30 bg-primary/5"
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 px-3 py-3">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <span className="text-sm font-medium text-foreground">
                {column.name}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {colItems.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2 px-2 pb-2 min-h-[100px]">
              {colItems.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  className={cn(
                    "rounded-lg border border-border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
                    draggingId === item.id && "opacity-50"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    {item.itemType && (
                      <span
                        className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: item.itemType.color + "20",
                          color: item.itemType.color,
                        }}
                      >
                        {item.itemType.name}
                      </span>
                    )}
                    {item.assignee && (
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {item.assignee.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
