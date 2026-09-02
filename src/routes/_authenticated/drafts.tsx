import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Check, History, RefreshCw, Save, X } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { TagInput } from "@/components/tag-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getStudioDrafts,
  getDraftVersions,
  saveDraft,
  setDraftStatus,
  regenerateFullPost,
  restoreDraftVersion,
  composeFullPost,
} from "@/lib/drafts.functions";

export const Route = createFileRoute("/_authenticated/drafts")({
  head: () => ({
    meta: [
      { title: "Content Studio - Content Intelligence" },
      {
        name: "description",
        content: "Edit, approve and version LinkedIn drafts with a live post preview.",
      },
      { property: "og:title", content: "Content Studio - Content Intelligence" },
      {
        property: "og:description",
        content: "Edit, approve and version LinkedIn drafts with a live post preview.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudioPage,
});

type StudioDraft = Awaited<ReturnType<typeof getStudioDrafts>>[number];

function calendarOf(draft: StudioDraft) {
  const value = draft.content_calendar as
    | { format?: string | null; scheduled_date?: string | null; topic?: string | null }
    | Array<{ format?: string | null; scheduled_date?: string | null; topic?: string | null }>
    | null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function tagsOf(draft: StudioDraft): string[] {
  return Array.isArray(draft.hashtags) ? (draft.hashtags as string[]) : [];
}

function StudioPage() {
  const queryClient = useQueryClient();
  const fetchDrafts = useServerFn(getStudioDrafts);
  const saveFn = useServerFn(saveDraft);
  const statusFn = useServerFn(setDraftStatus);
  const regenerateFn = useServerFn(regenerateFullPost);

  const { data: drafts = [], isLoading, error } = useQuery({
    queryKey: ["studio-drafts"],
    queryFn: () => fetchDrafts(),
  });

  useEffect(() => {
    if (error) toast.error((error as Error).message);
  }, [error]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    hook: "",
    body: "",
    cta: "",
    closing: "",
    hashtags: [] as string[],
  });

  const selected = useMemo(
    () => drafts.find((draft) => draft.id === selectedId) ?? drafts[0] ?? null,
    [drafts, selectedId],
  );

  useEffect(() => {
    if (!selected) return;
    setForm({
      title: selected.title ?? "",
      hook: selected.hook ?? "",
      body: selected.body ?? "",
      cta: selected.cta ?? "",
      closing: selected.closing ?? "",
      hashtags: tagsOf(selected),
    });
    setEditing(false);
  }, [selected?.id]);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["studio-drafts"] });
    if (selected) queryClient.invalidateQueries({ queryKey: ["draft-versions", selected.id] });
  }

  const save = useMutation({
    mutationFn: () => saveFn({ data: { id: selected!.id, ...form } }),
    onSuccess: () => {
      toast.success("Draft saved as a new version");
      setEditing(false);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const changeStatus = useMutation({
    mutationFn: (status: string) => statusFn({ data: { id: selected!.id, status } }),
    onSuccess: (_data, status) => {
      toast.success(`Draft ${status}`);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const regenerate = useMutation({
    mutationFn: () => regenerateFn({ data: { id: selected!.id } }),
    onSuccess: () => {
      toast.success("Full post rebuilt from the draft blocks");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const previewText = editing
    ? composeFullPost(form)
    : (selected?.full_post ?? composeFullPost(form));

  return (
    <AppShell
      title="Content Studio"
      description="Review, edit and approve drafts with a live LinkedIn preview."
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading drafts…</p>
      ) : drafts.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <p className="font-display text-base font-semibold">No drafts yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Drafts written into content_drafts will show up here, ready to edit, approve and version.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            {drafts.map((draft) => {
              const calendar = calendarOf(draft);
              const active = selected?.id === draft.id;
              return (
                <button
                  key={draft.id}
                  type="button"
                  onClick={() => setSelectedId(draft.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    active ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <p className="truncate text-sm font-medium">{draft.title ?? "Untitled draft"}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {draft.hook ?? calendar?.topic ?? "No hook yet"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={draft.status} />
                    {calendar?.format ? (
                      <span className="font-mono text-[11px] uppercase text-muted-foreground">
                        {calendar.format}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          {selected ? (
            <div className="space-y-6">
              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold">
                      {selected.title ?? "Untitled draft"}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <StatusBadge status={selected.status} />
                      <span>Format: {calendarOf(selected)?.format ?? "-"}</span>
                      <span>Model: {selected.ai_model ?? "-"}</span>
                      <span>Updated: {selected.updated_at?.slice(0, 10) ?? "-"}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editing ? (
                      <>
                        <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
                          <Save className="size-4" /> Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                        Edit
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => changeStatus.mutate("approved")}
                      disabled={changeStatus.isPending}
                    >
                      <Check className="size-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => changeStatus.mutate("rejected")}
                      disabled={changeStatus.isPending}
                    >
                      <X className="size-4" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => regenerate.mutate()}
                      disabled={regenerate.isPending}
                    >
                      <RefreshCw className="size-4" /> Regenerate
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setHistoryOpen(true)}>
                      <History className="size-4" /> Versions
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card className="space-y-4 p-5">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Draft blocks
                  </h3>
                  {editing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Hook</Label>
                        <Textarea
                          rows={2}
                          value={form.hook}
                          onChange={(e) => setForm({ ...form, hook: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Body</Label>
                        <Textarea
                          rows={10}
                          value={form.body}
                          onChange={(e) => setForm({ ...form, body: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CTA</Label>
                        <Textarea
                          rows={2}
                          value={form.cta}
                          onChange={(e) => setForm({ ...form, cta: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Closing</Label>
                        <Textarea
                          rows={2}
                          value={form.closing}
                          onChange={(e) => setForm({ ...form, closing: e.target.value })}
                        />
                      </div>
                      <TagInput
                        label="Hashtags"
                        value={form.hashtags}
                        onChange={(hashtags) => setForm({ ...form, hashtags })}
                        placeholder="Add a hashtag and press Enter"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4 text-sm">
                      <Block label="Hook" value={selected.hook} />
                      <Block label="Body" value={selected.body} />
                      <Block label="CTA" value={selected.cta} />
                      <Block label="Closing" value={selected.closing} />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Hashtags
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {tagsOf(selected).length ? (
                            tagsOf(selected).map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag.startsWith("#") ? tag : `#${tag}`}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                <Card className="space-y-4 p-5">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    LinkedIn preview
                  </h3>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-semibold text-primary">
                        NP
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Ntein Praises</p>
                        <p className="text-xs text-muted-foreground">AI Automation Engineer</p>
                        <p className="text-xs text-muted-foreground">Now · Public</p>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {previewText || "Nothing to preview yet."}
                    </p>
                    <Separator className="my-4" />
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                      <span>Like</span>
                      <span>Comment</span>
                      <span>Repost</span>
                      <span>Send</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {selected ? (
        <VersionHistory
          draftId={selected.id}
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          onRestored={invalidate}
        />
      ) : null}
    </AppShell>
  );
}

function Block({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-wrap">{value?.trim() ? value : "-"}</p>
    </div>
  );
}

function VersionHistory({
  draftId,
  open,
  onOpenChange,
  onRestored,
}: {
  draftId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestored: () => void;
}) {
  const fetchVersions = useServerFn(getDraftVersions);
  const restoreFn = useServerFn(restoreDraftVersion);
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ["draft-versions", draftId],
    queryFn: () => fetchVersions({ data: { draftId } }),
    enabled: open,
  });

  const restore = useMutation({
    mutationFn: (versionId: string) => restoreFn({ data: { draftId, versionId } }),
    onSuccess: () => {
      toast.success("Version restored as the newest version");
      onRestored();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Version history</DialogTitle>
          <DialogDescription>
            Every save adds a version. Nothing is ever deleted.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading versions…</p>
        ) : versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No versions recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <Card key={version.id} className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Version {version.version_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {version.change_reason ?? "No reason recorded"} ·{" "}
                      {version.created_at?.slice(0, 16).replace("T", " ")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => restore.mutate(version.id)}
                    disabled={restore.isPending}
                  >
                    Restore
                  </Button>
                </div>
                <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-xs">
                  {version.content ?? ""}
                </p>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
