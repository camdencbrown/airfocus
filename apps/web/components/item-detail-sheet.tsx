"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  MessageSquare,
  Clock,
  Send,
  X,
  Trash2,
  Calendar,
} from "lucide-react";

interface ItemDetailSheetProps {
  itemId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ItemDetailSheet({
  itemId,
  open,
  onClose,
  onUpdate,
}: ItemDetailSheetProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "comments" | "activity">(
    "details"
  );

  const { data: item, isLoading, refetch } = trpc.item.getById.useQuery(
    { id: itemId ?? "" },
    { enabled: !!itemId && open }
  );

  const { data: workspace } = trpc.workspace.getById.useQuery(
    { id: item?.workspaceId ?? "" },
    { enabled: !!item?.workspaceId }
  );

  const updateItem = trpc.item.update.useMutation({
    onSuccess: () => {
      refetch();
      onUpdate();
    },
    onError: (err) => alert(`Failed to update item: ${err.message}`),
  });

  const deleteItem = trpc.item.delete.useMutation({
    onSuccess: () => {
      onClose();
      onUpdate();
    },
    onError: (err) => alert(`Failed to delete item: ${err.message}`),
  });

  const addComment = trpc.item.addComment.useMutation({
    onSuccess: () => {
      setComment("");
      refetch();
    },
    onError: (err) => alert(`Failed to add comment: ${err.message}`),
  });

  const { data: activity } = trpc.item.getActivity.useQuery(
    { itemId: itemId ?? "" },
    { enabled: !!itemId && open && activeTab === "activity" }
  );

  // Sync local state with server
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description ?? "");
    }
  }, [item]);

  if (!open) return null;

  const statuses = workspace?.statuses ?? [];
  const itemTypes = workspace?.itemTypes ?? [];
  const members = workspace?.members ?? [];

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        {isLoading || !item ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <SheetHeader className="px-6 pt-6 pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Item type badge */}
                  <div className="mb-2">
                    <Badge
                      variant="outline"
                      style={{
                        borderColor:
                          (item.itemType?.color ?? "#888") + "40",
                        color: item.itemType?.color ?? "#888",
                      }}
                    >
                      {item.itemType?.name ?? "Item"}
                    </Badge>
                  </div>

                  {/* Title */}
                  {editingTitle ? (
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={() => {
                        setEditingTitle(false);
                        if (title.trim() && title !== item.title) {
                          updateItem.mutate({
                            id: item.id,
                            data: { title: title.trim() },
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setEditingTitle(false);
                          if (title.trim() && title !== item.title) {
                            updateItem.mutate({
                              id: item.id,
                              data: { title: title.trim() },
                            });
                          }
                        }
                        if (e.key === "Escape") {
                          setEditingTitle(false);
                          setTitle(item.title);
                        }
                      }}
                      autoFocus
                      className="text-lg font-semibold"
                    />
                  ) : (
                    <SheetTitle
                      onClick={() => setEditingTitle(true)}
                      className="cursor-pointer hover:text-primary transition-colors text-left"
                    >
                      {item.title}
                    </SheetTitle>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>

            {/* Properties */}
            <div className="px-6 py-4 space-y-3">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-20 shrink-0">
                  Status
                </span>
                <Select
                  value={item.statusId ?? "none"}
                  onValueChange={(value) => {
                    updateItem.mutate({
                      id: item.id,
                      data: { statusId: value === "none" ? null : value },
                    });
                  }}
                >
                  <SelectTrigger className="h-8 w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No status</SelectItem>
                    {statuses.map((s) => (
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

              {/* Item Type */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-20 shrink-0">
                  Type
                </span>
                <Select
                  value={item.itemTypeId}
                  onValueChange={(value) => {
                    updateItem.mutate({
                      id: item.id,
                      data: { itemTypeId: value },
                    });
                  }}
                >
                  <SelectTrigger className="h-8 w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-20 shrink-0">
                  Assignee
                </span>
                <Select
                  value={item.assigneeId ?? "none"}
                  onValueChange={(value) => {
                    updateItem.mutate({
                      id: item.id,
                      data: { assigneeId: value === "none" ? null : value },
                    });
                  }}
                >
                  <SelectTrigger className="h-8 w-48">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.user.id} value={m.user.id}>
                        {m.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-20 shrink-0">
                  Start
                </span>
                <Input
                  type="date"
                  className="h-8 w-48"
                  defaultValue={item.startDate ? new Date(item.startDate).toISOString().split("T")[0] : ""}
                  onBlur={(e) => {
                    const newVal = e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null;
                    const oldVal = item.startDate ?? null;
                    if (newVal !== oldVal) {
                      updateItem.mutate({
                        id: item.id,
                        data: { startDate: newVal },
                      });
                    }
                  }}
                />
              </div>

              {/* End Date */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-20 shrink-0">
                  End
                </span>
                <Input
                  type="date"
                  className="h-8 w-48"
                  defaultValue={item.endDate ? new Date(item.endDate).toISOString().split("T")[0] : ""}
                  onBlur={(e) => {
                    const newVal = e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null;
                    const oldVal = item.endDate ?? null;
                    if (newVal !== oldVal) {
                      updateItem.mutate({
                        id: item.id,
                        data: { endDate: newVal },
                      });
                    }
                  }}
                />
              </div>
            </div>

            <Separator />

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-2">
              {(
                [
                  { id: "details" as const, label: "Details" },
                  { id: "comments" as const, label: `Comments (${item.comments?.length ?? 0})` },
                  { id: "activity" as const, label: "Activity" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <ScrollArea className="flex-1 px-6 py-4">
              {activeTab === "details" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Description
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onBlur={() => {
                        if (description !== (item.description ?? "")) {
                          updateItem.mutate({
                            id: item.id,
                            data: {
                              description:
                                description.trim() || null,
                            },
                          });
                        }
                      }}
                      placeholder="Add a description..."
                      className="mt-1.5 min-h-[120px] resize-none"
                    />
                  </div>

                  {/* Children items */}
                  {item.children && item.children.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Sub-items ({item.children.length})
                      </label>
                      <div className="mt-1.5 space-y-1">
                        {item.children.map((child: any) => (
                          <div
                            key={child.id}
                            className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: child.status?.color ?? "#888",
                              }}
                            />
                            <span>{child.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Created</span>
                      <span>
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Updated</span>
                      <span>
                        {new Date(item.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    {item.creator && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Created by</span>
                        <span>{item.creator.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <Separator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm("Delete this item?")) {
                        deleteItem.mutate({ id: item.id });
                      }
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete item
                  </Button>
                </div>
              )}

              {activeTab === "comments" && (
                <div className="space-y-4">
                  {/* Comment list */}
                  {item.comments && item.comments.length > 0 ? (
                    <div className="space-y-3">
                      {item.comments.map((c: any) => (
                        <div key={c.id} className="flex gap-3">
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarFallback className="text-[10px]">
                              {c.author?.name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2) ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {c.author?.name ?? "Unknown"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(c.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">
                              {c.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-8 text-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No comments yet
                      </p>
                    </div>
                  )}

                  {/* Add comment */}
                  <div className="flex gap-2">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="min-h-[80px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          if (comment.trim()) {
                            addComment.mutate({
                              itemId: item.id,
                              content: comment.trim(),
                            });
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Ctrl+Enter to send
                    </span>
                    <Button
                      size="sm"
                      disabled={!comment.trim() || addComment.isPending}
                      onClick={() => {
                        if (comment.trim()) {
                          addComment.mutate({
                            itemId: item.id,
                            content: comment.trim(),
                          });
                        }
                      }}
                    >
                      {addComment.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="mr-1 h-3 w-3" />
                          Comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "activity" && (
                <div className="space-y-3">
                  {activity && activity.length > 0 ? (
                    activity.map((entry: any) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 text-sm"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="text-foreground">
                            {formatActivityAction(entry.action)}
                          </span>
                          {entry.changes && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {Object.entries(
                                entry.changes as Record<string, { old: any; new: any }>
                              ).map(([field, change]) => (
                                <div key={field}>
                                  {field}:{" "}
                                  <span className="line-through">
                                    {String(change.old ?? "none")}
                                  </span>{" "}
                                  &rarr; {String(change.new ?? "none")}
                                </div>
                              ))}
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center py-8 text-center">
                      <Clock className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No activity yet
                      </p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function formatActivityAction(action: string): string {
  switch (action) {
    case "created":
      return "Item created";
    case "updated":
      return "Item updated";
    case "deleted":
      return "Item deleted";
    case "status_changed":
      return "Status changed";
    case "commented":
      return "Comment added";
    case "assigned":
      return "Item assigned";
    default:
      return action;
  }
}
