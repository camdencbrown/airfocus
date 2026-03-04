"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

// All criteria use 1–10 integer scales for consistency
export const SCORING_FRAMEWORKS = {
  rice: {
    name: "RICE",
    description: "Reach, Impact, Confidence, Effort",
    criteria: [
      { id: "reach", name: "Reach", description: "How many users will this impact?", min: 1, max: 10 },
      { id: "impact", name: "Impact", description: "How much will it impact each user?", min: 1, max: 10 },
      { id: "confidence", name: "Confidence", description: "How confident are you in these estimates?", min: 1, max: 10 },
      { id: "effort", name: "Effort", description: "Person-months of effort required", min: 1, max: 10 },
    ],
    calculate: (scores: Record<string, number>) => {
      const r = scores.reach ?? 5;
      const i = scores.impact ?? 5;
      const c = scores.confidence ?? 5;
      const e = scores.effort ?? 5;
      return e > 0 ? Math.round(((r * i * c) / e) * 10) / 10 : 0;
    },
    xAxis: { id: "value", name: "Value", calc: (s: Record<string, number>) => ((s.reach ?? 5) * (s.impact ?? 5) * (s.confidence ?? 5)) / 50 },
    yAxis: { id: "effort", name: "Effort", calc: (s: Record<string, number>) => s.effort ?? 5 },
  },
  ice: {
    name: "ICE",
    description: "Impact, Confidence, Ease",
    criteria: [
      { id: "impact", name: "Impact", description: "How impactful is this?", min: 1, max: 10 },
      { id: "confidence", name: "Confidence", description: "How confident are you?", min: 1, max: 10 },
      { id: "ease", name: "Ease", description: "How easy is this to implement?", min: 1, max: 10 },
    ],
    calculate: (scores: Record<string, number>) => {
      return Math.round(((scores.impact ?? 5) * (scores.confidence ?? 5) * (scores.ease ?? 5)) / 10) / 10;
    },
    xAxis: { id: "value", name: "Impact", calc: (s: Record<string, number>) => (s.impact ?? 5) },
    yAxis: { id: "ease", name: "Ease", calc: (s: Record<string, number>) => s.ease ?? 5 },
  },
  value_effort: {
    name: "Value vs Effort",
    description: "Simple value and effort scoring",
    criteria: [
      { id: "value", name: "Value", description: "Business value of this item", min: 1, max: 10 },
      { id: "effort", name: "Effort", description: "Effort required to implement", min: 1, max: 10 },
    ],
    calculate: (scores: Record<string, number>) => {
      const v = scores.value ?? 5;
      const e = scores.effort ?? 5;
      return e > 0 ? Math.round((v / e) * 100) / 10 : 0;
    },
    xAxis: { id: "value", name: "Value", calc: (s: Record<string, number>) => s.value ?? 5 },
    yAxis: { id: "effort", name: "Effort", calc: (s: Record<string, number>) => s.effort ?? 5 },
  },
  moscow: {
    name: "MoSCoW",
    description: "Must, Should, Could, Won't",
    criteria: [
      { id: "priority", name: "Priority", description: "MoSCoW category", min: 1, max: 4, labels: { 1: "Won't Have", 2: "Could Have", 3: "Should Have", 4: "Must Have" } as Record<number, string> },
    ],
    calculate: (scores: Record<string, number>) => {
      return (scores.priority ?? 1) * 25;
    },
    xAxis: { id: "priority", name: "Priority", calc: (s: Record<string, number>) => s.priority ?? 1 },
    yAxis: { id: "priority", name: "Priority", calc: (s: Record<string, number>) => s.priority ?? 1 },
  },
} as const;

type FrameworkId = keyof typeof SCORING_FRAMEWORKS;

interface PriorityScoreProps {
  itemId: string;
  scores: Record<string, number>;
  framework?: FrameworkId;
  onUpdate: (scores: Record<string, number>) => void;
  compact?: boolean;
}

function scoreColor(score: number, max: number) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 70) return "text-green-600 dark:text-green-400";
  if (pct >= 40) return "text-yellow-600 dark:text-yellow-400";
  if (pct >= 15) return "text-orange-600 dark:text-orange-400";
  return "text-muted-foreground";
}

function scoreBadgeColor(score: number, max: number) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 70) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (pct >= 40) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  if (pct >= 15) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  return "";
}

export function PriorityScore({
  itemId,
  scores,
  framework = "rice",
  onUpdate,
  compact = false,
}: PriorityScoreProps) {
  const fw = SCORING_FRAMEWORKS[framework];
  const totalScore = fw.calculate(scores);

  if (compact) {
    return (
      <PriorityScorePopover scores={scores} framework={framework} onUpdate={onUpdate}>
        <button className="flex items-center gap-1 text-xs hover:bg-muted rounded px-1.5 py-0.5 transition-colors">
          <TrendingUp className="h-3 w-3 text-muted-foreground" />
          <span className={cn("font-medium", scoreColor(totalScore, 100))}>
            {totalScore > 0 ? totalScore.toFixed(1) : "—"}
          </span>
        </button>
      </PriorityScorePopover>
    );
  }

  return (
    <PriorityScorePopover scores={scores} framework={framework} onUpdate={onUpdate}>
      <Button variant="outline" size="sm" className="gap-1.5">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>Priority: </span>
        <span className={cn("font-semibold", scoreColor(totalScore, 100))}>
          {totalScore > 0 ? totalScore.toFixed(1) : "Not scored"}
        </span>
      </Button>
    </PriorityScorePopover>
  );
}

function PriorityScorePopover({
  children,
  scores,
  framework,
  onUpdate,
}: {
  children: React.ReactNode;
  scores: Record<string, number>;
  framework: FrameworkId;
  onUpdate: (scores: Record<string, number>) => void;
}) {
  const [localScores, setLocalScores] = useState<Record<string, number>>({ ...scores });
  const fw = SCORING_FRAMEWORKS[framework];
  const totalScore = fw.calculate(localScores);

  function handleChange(criterionId: string, value: number) {
    const next = { ...localScores, [criterionId]: value };
    setLocalScores(next);
    onUpdate(next);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold">{fw.name} Score</h4>
              <p className="text-[11px] text-muted-foreground">{fw.description}</p>
            </div>
            <Badge variant="secondary" className={cn("text-sm font-bold", scoreBadgeColor(totalScore, 100))}>
              {totalScore.toFixed(1)}
            </Badge>
          </div>
        </div>

        <div className="p-3 space-y-3">
          {fw.criteria.map((criterion) => {
            const value = localScores[criterion.id] ?? criterion.min;
            const labels = "labels" in criterion ? (criterion as any).labels as Record<number, string> : undefined;

            return (
              <div key={criterion.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">{criterion.name}</label>
                  <span className="text-xs font-semibold text-foreground">
                    {labels?.[value] ?? value}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{criterion.description}</p>
                <input
                  type="range"
                  min={criterion.min}
                  max={criterion.max}
                  step={1}
                  value={value}
                  onChange={(e) => handleChange(criterion.id, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{labels?.[criterion.min] ?? criterion.min}</span>
                  <span>{labels?.[criterion.max] ?? criterion.max}</span>
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.min(100, max > 0 ? (score / max) * 100 : 0);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 70 ? "bg-green-500" :
            pct >= 40 ? "bg-yellow-500" :
            pct >= 15 ? "bg-orange-500" :
            "bg-muted-foreground/30"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-medium text-muted-foreground w-6 text-right">
        {score > 0 ? Math.round(score) : "—"}
      </span>
    </div>
  );
}

export function FrameworkSelector({
  value,
  onChange,
}: {
  value: FrameworkId;
  onChange: (fw: FrameworkId) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(Object.entries(SCORING_FRAMEWORKS) as [FrameworkId, typeof SCORING_FRAMEWORKS[FrameworkId]][]).map(
        ([id, fw]) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors",
              value === id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="text-sm font-medium">{fw.name}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {fw.description}
            </div>
          </button>
        )
      )}
    </div>
  );
}
