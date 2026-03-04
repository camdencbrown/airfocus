"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const signIn = trpc.auth.signIn.useMutation({
    onSuccess: () => {
      router.push("/workspace");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    signIn.mutate({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(var(--primary)/0.8)_100%)]" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm font-bold">
              F
            </div>
            <span className="text-lg font-semibold">Focus</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Product decisions,
              <br />
              made clear.
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Prioritize what matters, align your team, and ship the right features with confidence.
            </p>
          </div>
          <div className="flex items-center gap-8 text-sm text-primary-foreground/60">
            <div>
              <div className="text-2xl font-bold text-primary-foreground">10k+</div>
              <div>Teams</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-foreground">50k+</div>
              <div>Products shipped</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-foreground">99.9%</div>
              <div>Uptime</div>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute -right-10 -bottom-10 h-60 w-60 rounded-full bg-white/5" />
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                F
              </div>
              <span className="text-lg font-semibold">Focus</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="jane@company.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              disabled={signIn.isPending}
              className="w-full"
              size="lg"
            >
              {signIn.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                New to Focus?
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
