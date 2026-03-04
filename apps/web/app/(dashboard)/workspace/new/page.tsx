"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewWorkspacePage() {
  const router = useRouter();
  const { setSelectedWorkspaceId } = useAppStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: user } = trpc.auth.me.useQuery();

  const createWorkspace = trpc.workspace.create.useMutation({
    onSuccess: (workspace) => {
      setSelectedWorkspaceId(workspace.id);
      router.push("/workspace");
    },
  });

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 mb-2"
            onClick={() => router.push("/workspace")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <CardTitle>Create a new workspace</CardTitle>
          <CardDescription>
            Workspaces help you organize different products, projects, or teams.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim() && user?.defaultOrganizationId) {
                createWorkspace.mutate({
                  name: name.trim(),
                  description: description.trim() || null,
                  organizationId: user.defaultOrganizationId,
                });
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Workspace name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Mobile App, Q1 Roadmap"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this workspace for?"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={!name.trim() || createWorkspace.isPending}
                className="flex-1"
              >
                {createWorkspace.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create workspace
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
