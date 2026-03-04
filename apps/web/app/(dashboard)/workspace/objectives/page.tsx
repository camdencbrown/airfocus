"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Target,
  Plus,
  Loader2,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

const statusConfig = {
  on_track: { label: "On Track", color: "bg-emerald-500", icon: TrendingUp },
  at_risk: { label: "At Risk", color: "bg-amber-500", icon: AlertTriangle },
  behind: { label: "Behind", color: "bg-red-500", icon: Clock },
  completed: { label: "Completed", color: "bg-blue-500", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-gray-400", icon: XCircle },
} as const;

export default function ObjectivesPage() {
  const { selectedWorkspaceId } = useAppStore();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [krDialogObjId, setKrDialogObjId] = useState<string | null>(null);
  const [editingObjective, setEditingObjective] = useState<any | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState("");
  const [status, setStatus] = useState<string>("on_track");

  // KR form state
  const [krTitle, setKrTitle] = useState("");
  const [krTarget, setKrTarget] = useState("100");
  const [krUnit, setKrUnit] = useState("%");

  const { data: objectives, isLoading, refetch } = trpc.objective.list.useQuery(
    { workspaceId: selectedWorkspaceId ?? "" },
    { enabled: !!selectedWorkspaceId }
  );

  const createObjective = trpc.objective.create.useMutation({
    onSuccess: () => {
      resetForm();
      setCreateDialogOpen(false);
      refetch();
    },
    onError: (err) => alert(`Failed to create objective: ${err.message}`),
  });

  const updateObjective = trpc.objective.update.useMutation({
    onSuccess: () => {
      setEditingObjective(null);
      refetch();
    },
    onError: (err) => alert(`Failed to update objective: ${err.message}`),
  });

  const deleteObjective = trpc.objective.delete.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => alert(`Failed to delete objective: ${err.message}`),
  });

  const createKeyResult = trpc.objective.createKeyResult.useMutation({
    onSuccess: () => {
      setKrTitle("");
      setKrTarget("100");
      setKrUnit("%");
      setKrDialogObjId(null);
      refetch();
    },
    onError: (err) => alert(`Failed to create key result: ${err.message}`),
  });

  const updateKeyResult = trpc.objective.updateKeyResult.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => alert(`Failed to update key result: ${err.message}`),
  });

  const deleteKeyResult = trpc.objective.deleteKeyResult.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => alert(`Failed to delete key result: ${err.message}`),
  });

  function resetForm() {
    setTitle("");
    setDescription("");
    setPeriod("");
    setStatus("on_track");
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  // Summary stats
  const total = objectives?.length ?? 0;
  const completed = objectives?.filter((o) => o.status === "completed").length ?? 0;
  const atRisk = objectives?.filter((o) => o.status === "at_risk" || o.status === "behind").length ?? 0;
  const avgProgress = total > 0
    ? Math.round((objectives?.reduce((sum, o) => sum + o.progress, 0) ?? 0) / total)
    : 0;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Objectives & Key Results</h2>
          <Badge variant="secondary" className="font-normal">
            {total} objectives
          </Badge>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add Objective
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Objective</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Increase user retention"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does success look like?"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Period</Label>
                  <Input
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="e.g., Q2 2026"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>
                          {cfg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => {
                  if (title.trim()) {
                    createObjective.mutate({
                      workspaceId: selectedWorkspaceId!,
                      title: title.trim(),
                      description: description || undefined,
                      period: period || undefined,
                      status: status as any,
                    });
                  }
                }}
                disabled={!title.trim() || createObjective.isPending}
                className="w-full"
              >
                {createObjective.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Create Objective
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-border">
        <div className="rounded-lg border border-border p-3">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-xs text-muted-foreground">Total Objectives</div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-2xl font-bold text-emerald-600">{completed}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-2xl font-bold text-amber-600">{atRisk}</div>
          <div className="text-xs text-muted-foreground">At Risk / Behind</div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-2xl font-bold">{avgProgress}%</div>
          <div className="text-xs text-muted-foreground">Avg Progress</div>
        </div>
      </div>

      {/* Objectives list */}
      <div className="flex-1 overflow-auto p-6">
        {(!objectives || objectives.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No objectives yet</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Define your objectives and key results to track progress toward your goals.
            </p>
            <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first objective
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {objectives.map((obj) => {
              const expanded = expandedIds.has(obj.id);
              const cfg = statusConfig[obj.status as keyof typeof statusConfig] ?? statusConfig.on_track;
              const StatusIcon = cfg.icon;
              const krCount = obj.keyResults?.length ?? 0;

              return (
                <div key={obj.id} className="rounded-lg border border-border bg-card">
                  {/* Objective header */}
                  <div className="flex items-center gap-3 p-4">
                    <button
                      onClick={() => toggleExpanded(obj.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {expanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{obj.title}</h3>
                        {obj.period && (
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {obj.period}
                          </Badge>
                        )}
                      </div>
                      {obj.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {obj.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Status badge */}
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] gap-1",
                          obj.status === "completed" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                          obj.status === "at_risk" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                          obj.status === "behind" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </Badge>

                      {/* Progress */}
                      <div className="flex items-center gap-2 w-32">
                        <Progress value={obj.progress} className="h-2" />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {Math.round(obj.progress)}%
                        </span>
                      </div>

                      {/* KR count */}
                      <span className="text-xs text-muted-foreground">
                        {krCount} KR{krCount !== 1 ? "s" : ""}
                      </span>

                      {/* Actions */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          if (confirm(`Delete "${obj.title}" and all its key results?`)) {
                            deleteObjective.mutate({ id: obj.id });
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded: Key Results */}
                  {expanded && (
                    <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-2">
                      {obj.keyResults?.map((kr: any) => {
                        const progress = kr.targetValue > 0
                          ? Math.round(((kr.currentValue - kr.startValue) / (kr.targetValue - kr.startValue)) * 100)
                          : 0;
                        const krCfg = statusConfig[kr.status as keyof typeof statusConfig] ?? statusConfig.on_track;

                        return (
                          <div
                            key={kr.id}
                            className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">{kr.title}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  {krCfg.label}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {kr.currentValue} / {kr.targetValue} {kr.unit}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-28">
                              <Progress value={Math.max(0, Math.min(100, progress))} className="h-1.5" />
                              <span className="text-[10px] text-muted-foreground w-8 text-right">
                                {Math.max(0, Math.min(100, progress))}%
                              </span>
                            </div>

                            {/* Quick update current value */}
                            <Input
                              type="number"
                              className="w-20 h-7 text-xs"
                              defaultValue={kr.currentValue}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && val !== kr.currentValue) {
                                  updateKeyResult.mutate({
                                    id: kr.id,
                                    data: { currentValue: val },
                                  });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                              }}
                            />

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                if (confirm(`Delete key result "${kr.title}"?`)) {
                                  deleteKeyResult.mutate({ id: kr.id });
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        );
                      })}

                      {/* Add Key Result */}
                      <Dialog
                        open={krDialogObjId === obj.id}
                        onOpenChange={(open) => {
                          setKrDialogObjId(open ? obj.id : null);
                          if (!open) {
                            setKrTitle("");
                            setKrTarget("100");
                            setKrUnit("%");
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full mt-1">
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add Key Result
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Key Result</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Title</Label>
                              <Input
                                value={krTitle}
                                onChange={(e) => setKrTitle(e.target.value)}
                                placeholder="e.g., Reduce churn rate to 5%"
                                autoFocus
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Target Value</Label>
                                <Input
                                  type="number"
                                  value={krTarget}
                                  onChange={(e) => setKrTarget(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Unit</Label>
                                <Input
                                  value={krUnit}
                                  onChange={(e) => setKrUnit(e.target.value)}
                                  placeholder="%, count, $, etc."
                                />
                              </div>
                            </div>
                            <Button
                              onClick={() => {
                                if (krTitle.trim()) {
                                  createKeyResult.mutate({
                                    objectiveId: obj.id,
                                    title: krTitle.trim(),
                                    targetValue: parseFloat(krTarget) || 100,
                                    unit: krUnit || "%",
                                  });
                                }
                              }}
                              disabled={!krTitle.trim() || createKeyResult.isPending}
                              className="w-full"
                            >
                              {createKeyResult.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                              Add Key Result
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
