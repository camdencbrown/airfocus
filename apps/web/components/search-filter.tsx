"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Filter, SortAsc, SortDesc, X, ChevronDown, ArrowUpDown } from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
  color?: string;
}

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // Filters
  statusOptions: FilterOption[];
  typeOptions: FilterOption[];
  assigneeOptions: FilterOption[];
  activeFilters: {
    statusIds: string[];
    typeIds: string[];
    assigneeIds: string[];
  };
  onFilterChange: (filters: {
    statusIds: string[];
    typeIds: string[];
    assigneeIds: string[];
  }) => void;
  // Sort
  sortField: string;
  sortDirection: "asc" | "desc";
  onSortChange: (field: string, direction: "asc" | "desc") => void;
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  statusOptions,
  typeOptions,
  assigneeOptions,
  activeFilters,
  onFilterChange,
  sortField,
  sortDirection,
  onSortChange,
}: SearchFilterProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const activeFilterCount =
    activeFilters.statusIds.length +
    activeFilters.typeIds.length +
    activeFilters.assigneeIds.length;

  const sortOptions = [
    { id: "position", label: "Manual" },
    { id: "title", label: "Title" },
    { id: "createdAt", label: "Created" },
    { id: "updatedAt", label: "Updated" },
    { id: "status", label: "Status" },
    { id: "priority", label: "Priority Score" },
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Search */}
      <div className={cn("relative transition-all", searchOpen ? "w-64" : "w-auto")}>
        {searchOpen ? (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search items..."
              className="h-8 pl-8 pr-8 text-sm"
              autoFocus
            />
            <button
              onClick={() => {
                setSearchOpen(false);
                onSearchChange("");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
            <Filter className="h-3.5 w-3.5" />
            <span className="text-xs">Filter</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <div className="p-3 space-y-3">
            {/* Status filter */}
            <FilterSection
              title="Status"
              options={statusOptions}
              selected={activeFilters.statusIds}
              onChange={(ids) =>
                onFilterChange({ ...activeFilters, statusIds: ids })
              }
            />

            {/* Type filter */}
            <FilterSection
              title="Type"
              options={typeOptions}
              selected={activeFilters.typeIds}
              onChange={(ids) =>
                onFilterChange({ ...activeFilters, typeIds: ids })
              }
            />

            {/* Assignee filter */}
            <FilterSection
              title="Assignee"
              options={assigneeOptions}
              selected={activeFilters.assigneeIds}
              onChange={(ids) =>
                onFilterChange({ ...activeFilters, assigneeIds: ids })
              }
            />
          </div>

          {activeFilterCount > 0 && (
            <>
              <div className="border-t border-border" />
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-xs text-muted-foreground"
                  onClick={() =>
                    onFilterChange({ statusIds: [], typeIds: [], assigneeIds: [] })
                  }
                >
                  Clear all filters
                </Button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="text-xs">Sort</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {sortOptions.map((opt) => (
            <DropdownMenuItem
              key={opt.id}
              onClick={() => {
                if (sortField === opt.id) {
                  onSortChange(opt.id, sortDirection === "asc" ? "desc" : "asc");
                } else {
                  onSortChange(opt.id, "asc");
                }
              }}
              className={cn(sortField === opt.id && "bg-accent")}
            >
              <span className="flex-1">{opt.label}</span>
              {sortField === opt.id && (
                sortDirection === "asc" ? (
                  <SortAsc className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <SortDesc className="h-3.5 w-3.5 text-muted-foreground" />
                )
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-1 ml-1">
          {activeFilters.statusIds.map((id) => {
            const opt = statusOptions.find((o) => o.id === id);
            return opt ? (
              <Badge
                key={id}
                variant="secondary"
                className="text-[10px] gap-1 pr-1"
              >
                {opt.label}
                <button
                  onClick={() =>
                    onFilterChange({
                      ...activeFilters,
                      statusIds: activeFilters.statusIds.filter((s) => s !== id),
                    })
                  }
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ) : null;
          })}
          {activeFilters.typeIds.map((id) => {
            const opt = typeOptions.find((o) => o.id === id);
            return opt ? (
              <Badge
                key={id}
                variant="secondary"
                className="text-[10px] gap-1 pr-1"
              >
                {opt.label}
                <button
                  onClick={() =>
                    onFilterChange({
                      ...activeFilters,
                      typeIds: activeFilters.typeIds.filter((t) => t !== id),
                    })
                  }
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

function FilterSection({
  title,
  options,
  selected,
  onChange,
}: {
  title: string;
  options: FilterOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-1.5">{title}</div>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const isActive = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => {
                if (isActive) {
                  onChange(selected.filter((id) => id !== opt.id));
                } else {
                  onChange([...selected, opt.id]);
                }
              }}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors border",
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.color && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: opt.color }}
                />
              )}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
