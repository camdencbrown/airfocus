"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAppStore, type ViewMode } from "@/lib/store";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Loader2,
  Moon,
  Sun,
  Monitor,
  CalendarRange,
  Table2,
  List,
  LayoutGrid,
  MessageSquare,
  Target,
  TrendingUp,
  Eye,
} from "lucide-react";
import { useThemeStore } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function SavedViewsList({ workspaceId }: { workspaceId: string | null }) {
  const { data: views } = trpc.view.list.useQuery(
    { workspaceId: workspaceId ?? "" },
    { enabled: !!workspaceId }
  );

  if (!views || views.length === 0) return null;

  const viewIcons: Record<string, typeof Eye> = {
    board: LayoutGrid,
    table: Table2,
    list: List,
    timeline: CalendarRange,
  };

  return (
    <>
      <Separator className="my-2" />
      <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        Saved Views
      </div>
      {views.map((view: any) => {
        const Icon = viewIcons[view.viewType] ?? Eye;
        return (
          <Button
            key={view.id}
            variant="ghost"
            className="w-full justify-start h-8 px-2 text-sm"
          >
            <Icon className="mr-2 h-4 w-4" />
            {view.name}
          </Button>
        );
      })}
    </>
  );
}

function ThemeSubmenu() {
  const { theme, setTheme } = useThemeStore();
  return (
    <>
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        Theme
      </div>
      <DropdownMenuItem
        onClick={() => setTheme("light")}
        className={cn(theme === "light" && "bg-accent")}
      >
        <Sun className="mr-2 h-4 w-4" />
        Light
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => setTheme("dark")}
        className={cn(theme === "dark" && "bg-accent")}
      >
        <Moon className="mr-2 h-4 w-4" />
        Dark
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => setTheme("system")}
        className={cn(theme === "system" && "bg-accent")}
      >
        <Monitor className="mr-2 h-4 w-4" />
        System
      </DropdownMenuItem>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedWorkspaceId, setSelectedWorkspaceId, viewMode, setViewMode } = useAppStore();

  const { data: user, isLoading, isError } = trpc.auth.me.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      router.push("/login");
    }
  }, [isError, router]);

  const signOut = trpc.auth.signOut.useMutation({
    onSuccess: () => {
      setSelectedWorkspaceId(null);
      router.push("/login");
    },
  });

  const orgId = user?.defaultOrganizationId;

  const { data: workspaceList } = trpc.workspace.list.useQuery(
    { organizationId: orgId ?? "" },
    { enabled: !!orgId }
  );

  // Auto-select first workspace
  useEffect(() => {
    if (!selectedWorkspaceId && workspaceList && workspaceList.length > 0) {
      setSelectedWorkspaceId(workspaceList[0]!.id);
    }
  }, [workspaceList, selectedWorkspaceId, setSelectedWorkspaceId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-border bg-sidebar">
        {/* Logo + workspace */}
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
            F
          </div>
          <span className="text-sm font-semibold text-sidebar-foreground">
            Focus
          </span>
        </div>

        {/* Workspace selector */}
        <div className="px-3 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between h-9 px-2 text-sm font-medium"
              >
                <span className="truncate">
                  {workspaceList?.find((w) => w.id === selectedWorkspaceId)
                    ?.name ?? "Select workspace"}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {workspaceList?.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => setSelectedWorkspaceId(ws.id)}
                  className={cn(
                    selectedWorkspaceId === ws.id && "bg-accent"
                  )}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {ws.name}
                </DropdownMenuItem>
              ))}
              {workspaceList && workspaceList.length > 0 && (
                <DropdownMenuSeparator />
              )}
              <DropdownMenuItem
                onClick={() => router.push("/workspace/new")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-2">
          <nav className="space-y-1">
            <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Views
            </div>
            {([
              { mode: "board" as ViewMode, icon: LayoutGrid, label: "Board" },
              { mode: "table" as ViewMode, icon: Table2, label: "Table" },
              { mode: "timeline" as ViewMode, icon: CalendarRange, label: "Timeline" },
              { mode: "list" as ViewMode, icon: List, label: "List" },
            ]).map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-8 px-2 text-sm",
                  viewMode === mode && pathname === "/workspace" && "bg-accent text-accent-foreground"
                )}
                onClick={() => {
                  setViewMode(mode);
                  router.push("/workspace");
                }}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}

            <SavedViewsList workspaceId={selectedWorkspaceId} />

            <Separator className="my-2" />

            <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Apps
            </div>
            {([
              { path: "/workspace/prioritize", icon: TrendingUp, label: "Prioritization" },
              { path: "/workspace/objectives", icon: Target, label: "Objectives" },
              { path: "/workspace/feedback", icon: MessageSquare, label: "Feedback" },
            ]).map(({ path, icon: Icon, label }) => (
              <Button
                key={path}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-8 px-2 text-sm",
                  pathname === path && "bg-accent text-accent-foreground"
                )}
                onClick={() => router.push(path)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </nav>
        </ScrollArea>

        {/* User area */}
        <div className="border-t border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-9 px-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ThemeSubmenu />
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut.mutate()}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
