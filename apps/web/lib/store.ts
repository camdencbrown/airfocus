"use client";

import { create } from "zustand";

export type ViewMode = "board" | "table" | "list" | "timeline";

interface AppState {
  selectedWorkspaceId: string | null;
  selectedItemId: string | null;
  viewMode: ViewMode;
  setSelectedWorkspaceId: (id: string | null) => void;
  setSelectedItemId: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedWorkspaceId: null,
  selectedItemId: null,
  viewMode: "board",
  setSelectedWorkspaceId: (id) => set({ selectedWorkspaceId: id }),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
