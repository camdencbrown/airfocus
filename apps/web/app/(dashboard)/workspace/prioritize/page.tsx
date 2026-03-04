"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  PriorityScore,
  ScoreBar,
  SCORING_FRAMEWORKS,
  FrameworkSelector,
} from "@/components/priority-score";
import { ItemDetailSheet } from "@/components/item-detail-sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  TrendingUp,
  ArrowUpDown,
  FolderOpen,
  BarChart3,
  LayoutList,
} from "lucide-react";

type FrameworkId = keyof typeof SCORING_FRAMEWORKS;
type ViewStyle = "ranked" | "matrix";

export default function PrioritizePage() {
  const { selectedWorkspaceId, selectedItemId, setSelectedItemId } = useAppStore();
  const [framework, setFramework] = useState<FrameworkId>("rice");
  const [viewStyle, setViewStyle] = useState<ViewStyle>("ranked");

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

  const updateItem = trpc.item.update.useMutation({
    onSuccess: () => refetchItems(),
  });

  const fw = SCORING_FRAMEWORKS[framework];

  // Calculate scores and sort items by priority
  const rankedItems = useMemo(() => {
    const items = itemsData?.items ?? [];
    return items
      .map((item) => {
        const scores = (item.customFields as any)?.priorityScores ?? {};
        const totalScore = fw.calculate(scores);
        return { ...item, scores, totalScore };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [itemsData?.items, fw]);

  const maxScore = useMemo(
    () => Math.max(...rankedItems.map((i) => i.totalScore), 1),
    [rankedItems]
  );

  if (!selectedWorkspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold">No workspace selected</h2>
          <p className="text-sm text-muted-foreground">
            Select a workspace from the sidebar to prioritize items.
          </p>
        </div>
      </div>
    );
  }

  if (wsLoading || itemsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  function handleScoreUpdate(itemId: string, newScores: Record<string, number>) {
    updateItem.mutate({
      id: itemId,
      data: { customFields: { priorityScores: newScores } },
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Prioritization</h2>
          <Badge variant="secondary" className="font-normal">
            {rankedItems.length} items
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* View style toggle */}
          <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
            <button
              onClick={() => setViewStyle("ranked")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                viewStyle === "ranked"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
              Ranked
            </button>
            <button
              onClick={() => setViewStyle("matrix")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                viewStyle === "matrix"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Matrix
            </button>
          </div>

          {/* Framework selector */}
          <Select
            value={framework}
            onValueChange={(v) => setFramework(v as FrameworkId)}
          >
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(SCORING_FRAMEWORKS) as [FrameworkId, typeof SCORING_FRAMEWORKS[FrameworkId]][]).map(
                ([id, f]) => (
                  <SelectItem key={id} value={id}>
                    <span className="font-medium">{f.name}</span>
                    <span className="text-muted-foreground ml-1.5">
                      — {f.description}
                    </span>
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {rankedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <TrendingUp className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="text-base font-semibold">No items to prioritize</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add items to your workspace first, then come here to prioritize them.
            </p>
          </div>
        ) : viewStyle === "ranked" ? (
          <RankedView
            items={rankedItems}
            framework={framework}
            maxScore={maxScore}
            onItemClick={(id) => setSelectedItemId(id)}
            onScoreUpdate={handleScoreUpdate}
          />
        ) : (
          <MatrixView
            items={rankedItems}
            framework={framework}
            onItemClick={(id) => setSelectedItemId(id)}
            onScoreUpdate={handleScoreUpdate}
          />
        )}
      </div>

      <ItemDetailSheet
        itemId={selectedItemId}
        open={!!selectedItemId}
        onClose={() => setSelectedItemId(null)}
        onUpdate={() => refetchItems()}
      />
    </div>
  );
}

function RankedView({
  items,
  framework,
  maxScore,
  onItemClick,
  onScoreUpdate,
}: {
  items: any[];
  framework: FrameworkId;
  maxScore: number;
  onItemClick: (id: string) => void;
  onScoreUpdate: (itemId: string, scores: Record<string, number>) => void;
}) {
  const fw = SCORING_FRAMEWORKS[framework];

  return (
    <div className="space-y-1">
      {/* Header row */}
      <div className="flex items-center gap-4 px-4 py-2 text-xs font-medium text-muted-foreground">
        <span className="w-8 text-center">#</span>
        <span className="flex-1">Item</span>
        {fw.criteria.map((c) => (
          <span key={c.id} className="w-20 text-center">
            {c.name}
          </span>
        ))}
        <span className="w-32 text-center">Score</span>
      </div>

      {items.map((item, idx) => (
        <div
          key={item.id}
          className="flex items-center gap-4 rounded-lg border border-border px-4 py-3 hover:bg-muted/30 transition-colors group"
        >
          {/* Rank */}
          <span
            className={cn(
              "w-8 text-center text-sm font-bold",
              idx === 0
                ? "text-yellow-500"
                : idx === 1
                ? "text-slate-400"
                : idx === 2
                ? "text-amber-600"
                : "text-muted-foreground"
            )}
          >
            {idx + 1}
          </span>

          {/* Item info */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onItemClick(item.id)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">
                {item.title}
              </span>
              {item.itemType && (
                <Badge
                  variant="outline"
                  className="text-[10px] flex-shrink-0"
                  style={{
                    borderColor: (item.itemType.color ?? "#888") + "40",
                    color: item.itemType.color ?? "#888",
                  }}
                >
                  {item.itemType.name}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {item.status && (
                <div className="flex items-center gap-1">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: item.status.color }}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {item.status.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Criteria scores */}
          {fw.criteria.map((criterion) => {
            const value = item.scores[criterion.id] ?? criterion.min;
            const labels = "labels" in criterion ? (criterion as any).labels as Record<number, string> : undefined;
            return (
              <div key={criterion.id} className="w-20 text-center text-xs text-muted-foreground">
                {labels?.[value] ?? value}
              </div>
            );
          })}

          {/* Total score with popover to edit */}
          <div className="w-32" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1.5">
              <PriorityScore
                itemId={item.id}
                scores={item.scores}
                framework={framework}
                compact
                onUpdate={(newScores) => onScoreUpdate(item.id, newScores)}
              />
              <div className="flex-1">
                <ScoreBar score={item.totalScore} max={maxScore} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MatrixView({
  items,
  framework,
  onItemClick,
  onScoreUpdate,
}: {
  items: any[];
  framework: FrameworkId;
  onItemClick: (id: string) => void;
  onScoreUpdate: (itemId: string, scores: Record<string, number>) => void;
}) {
  const fw = SCORING_FRAMEWORKS[framework];
  const xAxis = fw.xAxis;
  const yAxis = fw.yAxis;

  const matrixSize = 400;

  // Compute axis values for all items to determine range
  const axisData = useMemo(() => {
    return items.map((item) => ({
      x: xAxis.calc(item.scores),
      y: yAxis.calc(item.scores),
    }));
  }, [items, xAxis, yAxis]);

  const xMin = Math.min(...axisData.map((d) => d.x), 0);
  const xMax = Math.max(...axisData.map((d) => d.x), 10);
  const yMin = Math.min(...axisData.map((d) => d.y), 0);
  const yMax = Math.max(...axisData.map((d) => d.y), 10);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-sm text-muted-foreground">
        <span className="font-medium">{xAxis.name}</span> (x-axis) vs{" "}
        <span className="font-medium">{yAxis.name}</span> (y-axis)
      </div>

      <div className="relative" style={{ width: matrixSize + 60, height: matrixSize + 60 }}>
        {/* Quadrant labels */}
        <div className="absolute text-[10px] text-muted-foreground/60 font-medium" style={{ left: matrixSize * 0.25 + 30, top: 8 }}>
          Low {xAxis.name} / High {yAxis.name}
        </div>
        <div className="absolute text-[10px] text-muted-foreground/60 font-medium" style={{ right: 0, top: 8 }}>
          High {xAxis.name} / High {yAxis.name}
        </div>

        {/* Grid */}
        <div
          className="absolute border border-border rounded-lg bg-muted/20"
          style={{ left: 40, top: 30, width: matrixSize, height: matrixSize }}
        >
          {/* Quadrant lines */}
          <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-border/50" />
          <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-border/50" />

          {/* Quadrant backgrounds */}
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-green-500/5 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-red-500/5 rounded-bl-lg" />

          {/* Plot items */}
          {items.map((item, i) => {
            const { x, y } = axisData[i]!;

            const xRange = xMax - xMin;
            const yRange = yMax - yMin;

            const xPct = xRange > 0 ? ((x - xMin) / xRange) * 100 : 50;
            const yPct = yRange > 0 ? ((y - yMin) / yRange) * 100 : 50;

            const color = item.status?.color ?? item.itemType?.color ?? "#6b7280";

            return (
              <button
                key={item.id}
                className="absolute -translate-x-1/2 translate-y-1/2 z-10 group"
                style={{
                  left: `${Math.max(5, Math.min(95, xPct))}%`,
                  bottom: `${Math.max(5, Math.min(95, yPct))}%`,
                }}
                onClick={() => onItemClick(item.id)}
                title={item.title}
              >
                <div
                  className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-800 shadow-md transition-transform hover:scale-125"
                  style={{ backgroundColor: color }}
                />
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap bg-popover text-popover-foreground text-[10px] px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-border">
                  {item.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Y-axis label */}
        <div
          className="absolute text-[11px] font-medium text-muted-foreground"
          style={{
            left: 0,
            top: matrixSize / 2 + 30,
            transform: "rotate(-90deg) translateX(-50%)",
            transformOrigin: "left center",
          }}
        >
          {yAxis.name}
        </div>

        {/* X-axis label */}
        <div
          className="absolute text-[11px] font-medium text-muted-foreground"
          style={{
            left: matrixSize / 2 + 40,
            bottom: 0,
            transform: "translateX(-50%)",
          }}
        >
          {xAxis.name}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {items.slice(0, 10).map((item) => {
          const color = item.status?.color ?? item.itemType?.color ?? "#6b7280";
          return (
            <button
              key={item.id}
              className="flex items-center gap-1.5 text-xs hover:underline"
              onClick={() => onItemClick(item.id)}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-muted-foreground max-w-[120px] truncate">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
