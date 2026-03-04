"use client";

import { useMemo, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface TimelineItem {
  id: string;
  title: string;
  description: string | null;
  status: { id: string; name: string; color: string; category: string } | null;
  itemType: { id: string; name: string; color: string | null } | null;
  assignee: { id: string; name: string; avatarUrl: string | null } | null;
  startDate: string | null;
  endDate: string | null;
}

interface TimelineViewProps {
  items: TimelineItem[];
  onItemClick?: (id: string) => void;
  onUpdate: () => void;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function TimelineView({ items, onItemClick, onUpdate }: TimelineViewProps) {
  const today = useMemo(() => new Date(), []);
  const [viewStart, setViewStart] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 14);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const totalDays = 90; // Show 90 days
  const dayWidth = 28; // px per day
  const rowHeight = 44;
  const headerHeight = 60;
  const scrollRef = useRef<HTMLDivElement>(null);

  const viewEnd = addDays(viewStart, totalDays);

  // Filter items that have dates
  const timelineItems = useMemo(() => {
    return items.filter((item) => item.startDate || item.endDate);
  }, [items]);

  const noDateItems = useMemo(() => {
    return items.filter((item) => !item.startDate && !item.endDate);
  }, [items]);

  // Generate month headers
  const months = useMemo(() => {
    const result: { label: string; startDay: number; width: number }[] = [];
    let current = new Date(viewStart);
    current.setDate(1);

    while (current < viewEnd) {
      const monthStart = current < viewStart ? viewStart : new Date(current);
      const nextMonth = new Date(current);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      const monthEnd = nextMonth < viewEnd ? nextMonth : viewEnd;

      const startDay = Math.max(0, daysBetween(viewStart, monthStart));
      const endDay = daysBetween(viewStart, monthEnd);
      const width = endDay - startDay;

      if (width > 0) {
        result.push({
          label: formatMonth(monthStart),
          startDay,
          width,
        });
      }

      current = nextMonth;
    }
    return result;
  }, [viewStart, viewEnd]);

  // Generate week markers
  const weeks = useMemo(() => {
    const result: number[] = [];
    let ws = startOfWeek(viewStart);
    while (ws < viewEnd) {
      const day = daysBetween(viewStart, ws);
      if (day >= 0 && day < totalDays) {
        result.push(day);
      }
      ws = addDays(ws, 7);
    }
    return result;
  }, [viewStart, viewEnd, totalDays]);

  const todayOffset = daysBetween(viewStart, today);

  function navigate(direction: "prev" | "next") {
    setViewStart((prev) => addDays(prev, direction === "next" ? 30 : -30));
  }

  function goToToday() {
    const d = new Date(today);
    d.setDate(d.getDate() - 14);
    d.setHours(0, 0, 0, 0);
    setViewStart(d);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Timeline toolbar */}
      <div className="flex items-center gap-2 mb-3">
        <Button variant="outline" size="sm" onClick={() => navigate("prev")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate("next")}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground ml-2">
          {viewStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} &mdash;{" "}
          {viewEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      {timelineItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-semibold">No items with dates</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Add start and end dates to items to see them on the timeline.
          </p>
          {noDateItems.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {noDateItems.length} items without dates
            </p>
          )}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="overflow-auto rounded-lg border border-border flex-1"
        >
          <div
            className="relative"
            style={{
              width: totalDays * dayWidth,
              minHeight: headerHeight + timelineItems.length * rowHeight + 20,
            }}
          >
            {/* Month headers */}
            <div
              className="sticky top-0 z-20 bg-muted/80 backdrop-blur border-b border-border"
              style={{ height: headerHeight }}
            >
              {/* Month row */}
              <div className="flex h-8 border-b border-border/50">
                {months.map((m) => (
                  <div
                    key={m.label}
                    className="text-xs font-medium text-muted-foreground px-2 flex items-center border-r border-border/30"
                    style={{
                      left: m.startDay * dayWidth,
                      width: m.width * dayWidth,
                    }}
                  >
                    {m.label}
                  </div>
                ))}
              </div>
              {/* Day numbers row */}
              <div className="flex h-7 relative">
                {Array.from({ length: totalDays }, (_, i) => {
                  const d = addDays(viewStart, i);
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "text-[10px] text-center flex items-center justify-center border-r border-border/20",
                        isWeekend && "bg-muted/50 text-muted-foreground/50"
                      )}
                      style={{ width: dayWidth, minWidth: dayWidth }}
                    >
                      {d.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid lines */}
            {weeks.map((day) => (
              <div
                key={day}
                className="absolute top-0 bottom-0 border-l border-border/20"
                style={{ left: day * dayWidth }}
              />
            ))}

            {/* Today line */}
            {todayOffset >= 0 && todayOffset < totalDays && (
              <div
                className="absolute z-10 w-0.5 bg-red-500"
                style={{
                  left: todayOffset * dayWidth + dayWidth / 2,
                  top: headerHeight,
                  bottom: 0,
                }}
              />
            )}

            {/* Item bars */}
            {timelineItems.map((item, idx) => {
              const start = item.startDate ? new Date(item.startDate) : null;
              const end = item.endDate ? new Date(item.endDate) : null;
              const barStart = start ? daysBetween(viewStart, start) : (end ? daysBetween(viewStart, end) - 7 : 0);
              const barEnd = end ? daysBetween(viewStart, end) : (start ? daysBetween(viewStart, start) + 7 : 7);
              const barWidth = Math.max(barEnd - barStart, 1);

              const isVisible = barEnd >= 0 && barStart < totalDays;
              if (!isVisible) return null;

              const clampedStart = Math.max(0, barStart);
              const clampedWidth = Math.min(barEnd, totalDays) - clampedStart;

              const color = item.status?.color ?? item.itemType?.color ?? "#6b7280";

              return (
                <div
                  key={item.id}
                  className="absolute flex items-center group"
                  style={{
                    top: headerHeight + idx * rowHeight + 6,
                    left: clampedStart * dayWidth,
                    width: clampedWidth * dayWidth,
                    height: rowHeight - 12,
                  }}
                >
                  <div
                    className="h-full w-full rounded-md cursor-pointer shadow-sm hover:shadow-md transition-shadow flex items-center px-2 gap-1.5 overflow-hidden"
                    style={{
                      backgroundColor: color + "20",
                      border: `1px solid ${color}40`,
                    }}
                    onClick={() => onItemClick?.(item.id)}
                  >
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-medium text-foreground truncate">
                      {item.title}
                    </span>
                    {item.assignee && (
                      <span className="ml-auto text-[10px] text-muted-foreground flex-shrink-0">
                        {item.assignee.name.split(" ")[0]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
