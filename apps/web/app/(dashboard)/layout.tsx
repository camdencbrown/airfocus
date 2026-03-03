"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    onError: () => {
      router.push("/login");
    },
  });

  const signOut = trpc.auth.signOut.useMutation({
    onSuccess: () => {
      router.push("/login");
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top navigation */}
      <header className="border-b border-border bg-card">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">Focus</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <button
              onClick={() => signOut.mutate()}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
