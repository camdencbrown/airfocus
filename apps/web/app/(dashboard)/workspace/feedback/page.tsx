"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  MessageSquare,
  Plus,
  Loader2,
  ThumbsUp,
  Trash2,
  Mail,
  Globe,
  MessageCircle,
  Zap,
  User,
  Filter,
  ArrowUpDown,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-500" },
  reviewed: { label: "Reviewed", color: "bg-purple-500" },
  planned: { label: "Planned", color: "bg-indigo-500" },
  in_progress: { label: "In Progress", color: "bg-amber-500" },
  completed: { label: "Completed", color: "bg-emerald-500" },
  archived: { label: "Archived", color: "bg-gray-400" },
};

const sourceIcons: Record<string, typeof Mail> = {
  email: Mail,
  portal: Globe,
  slack: MessageCircle,
  intercom: Zap,
  manual: User,
  api: Zap,
};

export default function FeedbackPage() {
  const { selectedWorkspaceId } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [source, setSource] = useState("manual");
  const [tags, setTags] = useState("");

  const { data, isLoading, refetch } = trpc.feedback.list.useQuery(
    {
      workspaceId: selectedWorkspaceId ?? "",
      ...(statusFilter !== "all" ? { status: statusFilter as any } : {}),
    },
    { enabled: !!selectedWorkspaceId }
  );

  const createFeedback = trpc.feedback.create.useMutation({
    onSuccess: () => {
      resetForm();
      setCreateDialogOpen(false);
      refetch();
    },
    onError: (err) => alert(`Failed to create feedback: ${err.message}`),
  });

  const updateFeedback = trpc.feedback.update.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (err) => alert(`Failed to update feedback: ${err.message}`),
  });

  const voteFeedback = trpc.feedback.vote.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => alert(`Failed to vote: ${err.message}`),
  });

  const deleteFeedback = trpc.feedback.delete.useMutation({
    onSuccess: () => {
      setSelectedEntry(null);
      refetch();
    },
    onError: (err) => alert(`Failed to delete feedback: ${err.message}`),
  });

  function resetForm() {
    setTitle("");
    setDescription("");
    setSubmitterName("");
    setSubmitterEmail("");
    setSource("manual");
    setTags("");
  }

  if (!selectedWorkspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Select a workspace first.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const entries = data?.entries ?? [];

  // Summary stats
  const totalNew = entries.filter((e) => e.status === "new").length;
  const totalVotes = entries.reduce((sum, e) => sum + e.votes, 0);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Feedback</h2>
          <Badge variant="secondary" className="font-normal">
            {entries.length} entries
          </Badge>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add Feedback
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Feedback</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Feature request or feedback..."
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Submitter Name</Label>
                  <Input
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Submitter Email</Label>
                  <Input
                    value={submitterEmail}
                    onChange={(e) => setSubmitterEmail(e.target.value)}
                    placeholder="john@example.com"
                    type="email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="portal">Portal</SelectItem>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="intercom">Intercom</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="ux, mobile (comma-separated)"
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  if (title.trim()) {
                    createFeedback.mutate({
                      workspaceId: selectedWorkspaceId!,
                      title: title.trim(),
                      description: description || undefined,
                      submitterName: submitterName || undefined,
                      submitterEmail: submitterEmail || undefined,
                      source: source as any,
                      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
                    });
                  }
                }}
                disabled={!title.trim() || createFeedback.isPending}
                className="w-full"
              >
                {createFeedback.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Submit Feedback
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary + Filter bar */}
      <div className="flex items-center justify-between border-b border-border px-6 py-2">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{totalNew}</span> new
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{totalVotes}</span> total votes
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Feedback list */}
      <div className="flex-1 overflow-auto">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No feedback yet</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Collect feedback from users to understand what to build next.
            </p>
            <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add first feedback
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry) => {
              const stCfg = statusConfig[entry.status] ?? statusConfig.new;
              const SourceIcon = sourceIcons[entry.source] ?? User;

              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                >
                  {/* Vote button */}
                  <button
                    onClick={() => voteFeedback.mutate({ id: entry.id })}
                    className="flex flex-col items-center gap-0.5 pt-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-xs font-medium">{entry.votes}</span>
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium truncate">{entry.title}</h4>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        <span className={cn("h-1.5 w-1.5 rounded-full mr-1", stCfg.color)} />
                        {stCfg.label}
                      </Badge>
                    </div>
                    {entry.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {entry.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {entry.submitterName && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.submitterName}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <SourceIcon className="h-3 w-3" />
                        {entry.source}
                      </span>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex gap-1">
                          {entry.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-[9px] h-4 px-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Status update */}
                  <Select
                    value={entry.status}
                    onValueChange={(val) => {
                      updateFeedback.mutate({
                        id: entry.id,
                        data: { status: val as any },
                      });
                    }}
                  >
                    <SelectTrigger className="h-7 w-28 text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => {
                      if (confirm(`Delete feedback "${entry.title}"?`)) {
                        deleteFeedback.mutate({ id: entry.id });
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
