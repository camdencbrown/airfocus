"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, TrendingUp } from "lucide-react";

// Built-in scoring frameworks
export const SCORING_FRAMEWORKS = {
  rice: {
    name: "RICE",
    description: "Reach, Impact, Confidence, Effort",
    criteria: [
      { id: "reach", name: "Reach", description: "How many users will this impact?", min: 0, max: 10, weight: 1 },
      { id: "impact", name: "Impact", description: "How much will it impact users?", min: 0, max: 3, weight: 1, labels: { 0: "Minimal", 1: "Low", 2: "High", 3: "Massive" } },
      { id: "confidence", name: "Confidence", description: "How confident are you?", min: 0, max: 100, weight: 1, suffix: "%" },
      { id: "effort", name: "Effort", description: "Person-months of effort", min: 0.5, max: 10, weight: -1, step: 0.5 },
    ],
    calculate: (scores: Record<string, number>) => {
      const reach = scores.reach ?? 0;
      const impact = scores.impact ?? 0;
      const confidence = (scores.confidence ?? 100) / 100;
      const effort = scores.effort ?? 1;
      return effort > 0 ? (reach * impact * confidence) / effort : 0;
    },
  },
  ice: {
    name: "ICE",
    description: "Impact, Confidence, Ease",
    criteria: [
      { id: "impact", name: "Impact", description: "How impactful is this?", min: 1, max: 10, weight: 1 },
      { id: "confidence", name: "Confidence", description: "How confident are you?", min: 1, max: 10, weight: 1 },
      { id: "ease", name: "Ease", description: "How easy is this to implement?", min: 1, max: 10, weight: 1 },
    ],
    calculate: (scores: Record<string, number>) => {
      return ((scores.impact ?? 1) * (scores.confidence ?? 1) * (scores.ease ?? 1)) / 10;
    },
  },
  value_effort: {
    name: "Value vs Effort",
    description: "Simple value and effort scoring",
    criteria: [
      { id: "value", name: "Value", description: "Business value of this item", min: 1, max: 10, weight: 1 },
      { id: "effort", name: "Effort", description: "Effort required to implement", min: 1, max: 10, weight: -1 },
    ],
    calculate: (scores: Record<string, number>) => {
      const value = scores.value ?? 5;
      const effort = scores.effort ?? 5;
      return effort > 0 ? (value / effort) * 10 : 0;
    },
  },
  moscow: {
    name: "MoSCoW",
    description: "Must, Should, Could, Won't",
    criteria: [
      { id: "priority", name: "Priority", description: "MoSCoW category", min: 1, max: 4, weight: 1, labels: { 1: "Won't Have", 2: "Could Have", 3: "Should Have", 4: "Must Have" } },
    ],
    calculate: (scores: Record<string, number>) => {
      return (scores.priority ?? 1) * 25;
    },
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
      <PriorityScorePopover
        scores={scores}
        framework={framework}
        onUpdate={onUpdate}
      >
        <button className="flex items-center gap-1 text-xs hover:bg-muted rounded px-1.5 py-0.5 transition-colors">
          <TrendingUp className="h-3 w-3 text-muted-foreground" />
          <span className={cn(
            "font-medium",
            totalScore >= 70 ? "text-green-600 dark:text-green-400" :
            totalScore >= 40 ? "text-yellow-600 dark:text-yellow-400" :
            totalScore >= 10 ? "text-orange-600 dark:text-orange-400" :
            "text-muted-foreground"
          )}>
            {totalScore > 0 ? totalScore.toFixed(1) : "—"}
          </span>
        </button>
      </PriorityScorePopover>
    );
  }

  return (
    <PriorityScorePopover
      scores={scores}
      framework={framework}
      onUpdate={onUpdate}
    >
      <Button variant="outline" size="sm" className="gap-1.5">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>Priority: </span>
        <span className={cn(
          "font-semibold",
          totalScore >= 70 ? "text-green-600 dark:text-green-400" :
          totalScore >= 40 ? "text-yellow-600 dark:text-yellow-400" :
          totalScore >= 10 ? "text-orange-600 dark:text-orange-400" :
          "text-muted-foreground"
        )}>
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
            <Badge
              variant="secondary"
              className={cn(
                "text-sm font-bold",
                totalScore >= 70 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                totalScore >= 40 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                totalScore >= 10 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                ""
              )}
            >
              {totalScore.toFixed(1)}
            </Badge>
          </div>
        </div>

        <div className="p-3 space-y-3">
          {fw.criteria.map((criterion) => {
            const value = localScores[criterion.id] ?? criterion.min;
            const labels = "labels" in criterion ? (criterion.labels as Record<number, string>) : undefined;
            const step = "step" in criterion ? (criterion.step as number) : 1;
            const suffix = "suffix" in criterion ? (criterion.suffix as string) : "";

            return (
              <div key={criterion.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">{criterion.name}</label>
                  <span className="text-xs font-semibold text-foreground">
                    {labels?.[value] ?? `${value}${suffix}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={criterion.min}
                  max={criterion.max}
                  step={step}
                  value={value}
                  onChange={(e) => handleChange(criterion.id, parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{labels?.[criterion.min] ?? criterion.min}{suffix}</span>
                  <span>{labels?.[criterion.max] ?? criterion.max}{suffix}</span>
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Score display bar for board cards
export function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.min(100, (score / max) * 100);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 70 ? "bg-green-500" :
            pct >= 40 ? "bg-yellow-500" :
            pct >= 10 ? "bg-orange-500" :
            "bg-muted-foreground/30"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-medium text-muted-foreground w-6 text-right">
        {score > 0 ? score.toFixed(0) : "—"}
      </span>
    </div>
  );
}

// Framework selector for workspace settings
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
