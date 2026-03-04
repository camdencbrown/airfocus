"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAppStore } from "@/lib/store";
import { useThemeStore } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Building2,
  Palette,
  LayoutDashboard,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Loader2,
  Sun,
  Moon,
  Monitor,
  Check,
} from "lucide-react";
import { FrameworkSelector, SCORING_FRAMEWORKS } from "@/components/priority-score";

export default function SettingsPage() {
  const { selectedWorkspaceId } = useAppStore();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-3">
        <h2 className="text-lg font-semibold">Settings</h2>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl p-6 space-y-6">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="gap-1.5">
                <User className="h-3.5 w-3.5" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="workspace" className="gap-1.5">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Workspace
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="organization" className="gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Organization
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-6">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="workspace" className="space-y-4 mt-6">
              {selectedWorkspaceId ? (
                <WorkspaceSettings workspaceId={selectedWorkspaceId} />
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Select a workspace to manage its settings.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4 mt-6">
              <AppearanceSettings />
            </TabsContent>

            <TabsContent value="organization" className="space-y-4 mt-6">
              <OrgSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const { data: user } = trpc.auth.me.useQuery();
  const [name, setName] = useState(user?.name ?? "");

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Information</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name || user?.name || ""}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled className="bg-muted" />
            <p className="text-[11px] text-muted-foreground">
              Email cannot be changed.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Manage your account settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" size="sm">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

function WorkspaceSettings({ workspaceId }: { workspaceId: string }) {
  const { data: workspace, isLoading } = trpc.workspace.getById.useQuery(
    { id: workspaceId }
  );

  const updateWorkspace = trpc.workspace.update.useMutation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [addStatusOpen, setAddStatusOpen] = useState(false);
  const [addTypeOpen, setAddTypeOpen] = useState(false);

  // Sync state when data loads
  if (workspace && !name) {
    setName(workspace.name);
    setDescription(workspace.description ?? "");
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workspace) return null;

  return (
    <>
      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>Workspace name and description.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button
            size="sm"
            onClick={() =>
              updateWorkspace.mutate({
                id: workspaceId,
                data: { name, description },
              })
            }
            disabled={updateWorkspace.isPending}
          >
            {updateWorkspace.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save
          </Button>
        </CardContent>
      </Card>

      {/* Statuses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Statuses</CardTitle>
              <CardDescription>
                Configure workflow statuses for items.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {workspace.statuses
              .sort((a, b) => a.position - b.position)
              .map((status) => (
                <div
                  key={status.id}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-sm font-medium flex-1">{status.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {status.category.replace("_", " ")}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Item Types */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Item Types</CardTitle>
              <CardDescription>
                Define item hierarchy (e.g., Initiative &gt; Feature &gt; Story).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {workspace.itemTypes
              .sort((a, b) => a.position - b.position)
              .map((type) => (
                <div
                  key={type.id}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: type.color ?? "#888" }}
                  />
                  <span className="text-sm font-medium flex-1">{type.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    Level {type.level}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Members</CardTitle>
              <CardDescription>
                People who have access to this workspace.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Invite
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {workspace.members?.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
              >
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  {member.user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) ?? "?"}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{member.user?.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {member.user?.email}
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Fields */}
      <CustomFieldsSettings workspaceId={workspaceId} />

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Workspace
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

function CustomFieldsSettings({ workspaceId }: { workspaceId: string }) {
  const { data: fields } = trpc.field.list.useQuery({ workspaceId });
  const createField = trpc.field.create.useMutation();
  const deleteField = trpc.field.delete.useMutation();
  const utils = trpc.useUtils();
  const [addOpen, setAddOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");

  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "select", label: "Select" },
    { value: "multi_select", label: "Multi Select" },
    { value: "date", label: "Date" },
    { value: "checkbox", label: "Checkbox" },
    { value: "url", label: "URL" },
    { value: "email", label: "Email" },
    { value: "rating", label: "Rating" },
    { value: "person", label: "Person" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Custom Fields</CardTitle>
            <CardDescription>
              Add custom fields to organize and track information.
            </CardDescription>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Field
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Field</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="Field name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newFieldType} onValueChange={setNewFieldType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypes.map((ft) => (
                        <SelectItem key={ft.value} value={ft.value}>
                          {ft.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => {
                    if (newFieldName.trim()) {
                      createField.mutate(
                        {
                          workspaceId,
                          name: newFieldName.trim(),
                          type: newFieldType as any,
                        },
                        {
                          onSuccess: () => {
                            setNewFieldName("");
                            setNewFieldType("text");
                            setAddOpen(false);
                            utils.field.list.invalidate();
                          },
                        }
                      );
                    }
                  }}
                  disabled={!newFieldName.trim() || createField.isPending}
                  className="w-full"
                >
                  {createField.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  Create Field
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!fields || fields.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No custom fields yet. Add one to start tracking more information.
          </p>
        ) : (
          <div className="space-y-2">
            {fields.map((field: any) => (
              <div
                key={field.id}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                <span className="text-sm font-medium flex-1">{field.name}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {field.type}
                </Badge>
                <button
                  onClick={() => {
                    deleteField.mutate(
                      { id: field.id },
                      { onSuccess: () => utils.field.list.invalidate() }
                    );
                  }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AppearanceSettings() {
  const { theme, setTheme } = useThemeStore();

  const themes = [
    { id: "light" as const, label: "Light", icon: Sun, description: "Light background with dark text" },
    { id: "dark" as const, label: "Dark", icon: Moon, description: "Dark background with light text" },
    { id: "system" as const, label: "System", icon: Monitor, description: "Follow your system preference" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Theme</CardTitle>
        <CardDescription>Select your preferred color scheme.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "relative rounded-lg border p-4 text-left transition-colors",
                theme === t.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              {theme === t.id && (
                <div className="absolute top-2 right-2">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
              <t.icon className="h-6 w-6 mb-2 text-foreground" />
              <div className="text-sm font-medium">{t.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {t.description}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function OrgSettings() {
  const { data: user } = trpc.auth.me.useQuery();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Organization</CardTitle>
        <CardDescription>Manage your organization settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Organization Name</Label>
          <Input
            value={user?.organizations?.[0]?.name ?? ""}
            disabled
            className="bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label>Plan</Label>
          <div>
            <Badge variant="secondary">
              {user?.organizations?.[0]?.role ?? "member"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
