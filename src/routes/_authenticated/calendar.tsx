import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addDays,
  CALENDAR_FORMATS,
  CALENDAR_STATUSES,
  formatDayLabel,
  formatRange,
  startOfWeek,
  toISODate,
  weekDays,
} from "@/lib/week";
import {
  deleteCalendarEntry,
  getCalendarEntry,
  getCalendarWeek,
  saveCalendarEntry,
  type CalendarEntryInput,
} from "@/lib/calendar.functions";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Content Calendar - Content Intelligence" },
      { name: "description", content: "Plan your week: audience, pillar, topic, objective, format and status for every scheduled post." },
      { property: "og:title", content: "Content Calendar - Content Intelligence" },
      { property: "og:description", content: "Plan your week: audience, pillar, topic, objective, format and status for every scheduled post." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarPage,
});

const NONE = "__none__";

type FormState = CalendarEntryInput;

function emptyForm(date: string): FormState {
  return {
    scheduled_date: date,
    audience_id: null,
    pillar_id: null,
    topic: "",
    objective: "",
    format: null,
    status: "planned",
  };
}

function CalendarPage() {
  const queryClient = useQueryClient();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [form, setForm] = useState<FormState | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const start = toISODate(weekStart);
  const end = toISODate(addDays(weekStart, 6));
  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const today = toISODate(new Date());

  const fetchWeek = useServerFn(getCalendarWeek);
  const fetchEntry = useServerFn(getCalendarEntry);
  const saveEntry = useServerFn(saveCalendarEntry);
  const removeEntry = useServerFn(deleteCalendarEntry);

  const { data, isLoading, error } = useQuery({
    queryKey: ["calendar-week", start],
    queryFn: () => fetchWeek({ data: { start, end } }),
  });


  const detail = useQuery({
    queryKey: ["calendar-entry", detailId],
    queryFn: () => fetchEntry({ data: { id: detailId as string } }),
    enabled: Boolean(detailId),
  });

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["calendar-week"] });
    void queryClient.invalidateQueries({ queryKey: ["calendar-entry"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  const save = useMutation({
    mutationFn: (input: FormState) => saveEntry({ data: input }),
    onSuccess: () => {
      toast.success("Content plan saved");
      setForm(null);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => removeEntry({ data: { id } }),
    onSuccess: () => {
      toast.success("Content plan deleted");
      setForm(null);
      setDetailId(null);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const audiences = data?.audiences ?? [];
  const pillars = data?.pillars ?? [];
  const entries = data?.entries ?? [];

  return (
    <AppShell title="Content Calendar" description="A week at a glance - plan, edit and track every post.">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Previous week" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Next week" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            <ChevronRight className="size-4" />
          </Button>
          <div className="ml-2">
            <p className="font-display text-base font-semibold">{formatRange(weekStart, addDays(weekStart, 6))}</p>
            <p className="text-xs text-muted-foreground">{entries.length} planned this week</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            This week
          </Button>
        </div>
        <Button onClick={() => setForm(emptyForm(today))}>
          <Plus className="mr-2 size-4" /> New content plan
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading week…</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {days.map((day) => {
            const iso = toISODate(day);
            const dayEntries = entries.filter((e) => e.scheduled_date === iso);
            return (
              <Card
                key={iso}
                className={`flex min-h-44 flex-col gap-2 p-3 ${iso === today ? "border-primary/60" : ""}`}
              >
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="font-mono text-[11px] uppercase text-muted-foreground">{formatDayLabel(day)}</p>
                    <p className="font-display text-lg font-semibold">{day.getDate()}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Add plan for ${iso}`}
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setForm(emptyForm(iso))}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                {dayEntries.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No plan</p>
                ) : (
                  dayEntries.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setDetailId(entry.id)}
                      className="rounded-md border border-border bg-secondary/40 p-2 text-left transition hover:border-primary/50"
                    >
                      <p className="text-sm font-medium leading-snug">{entry.topic ?? "Untitled topic"}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {entry.audiences?.name ?? "No audience"} · {entry.content_pillars?.name ?? "No pillar"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{entry.format ?? "No format"}</p>
                      <div className="mt-2">
                        <StatusBadge status={entry.status} />
                      </div>
                    </button>
                  ))
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / edit */}
      <Dialog open={Boolean(form)} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit content plan" : "New content plan"}</DialogTitle>
            <DialogDescription>Saved directly to your content calendar.</DialogDescription>
          </DialogHeader>
          {form ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Scheduled date</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Target audience</Label>
                  <Select
                    value={form.audience_id ?? NONE}
                    onValueChange={(v) => setForm({ ...form, audience_id: v === NONE ? null : v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select audience" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Unassigned</SelectItem>
                      {audiences.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Content pillar</Label>
                  <Select
                    value={form.pillar_id ?? NONE}
                    onValueChange={(v) => setForm({ ...form, pillar_id: v === NONE ? null : v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select pillar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Unassigned</SelectItem>
                      {pillars.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={form.topic ?? ""}
                  placeholder="What is this post about?"
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objective</Label>
                <Textarea
                  id="objective"
                  rows={3}
                  value={form.objective ?? ""}
                  placeholder="What should this post achieve?"
                  onChange={(e) => setForm({ ...form, objective: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select
                    value={form.format ?? NONE}
                    onValueChange={(v) => setForm({ ...form, format: v === NONE ? null : v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Unset</SelectItem>
                      {CALENDAR_FORMATS.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CALENDAR_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:justify-between">
            {form?.id ? (
              <Button variant="outline" onClick={() => del.mutate(form.id as string)} disabled={del.isPending}>
                <Trash2 className="mr-2 size-4" /> Delete
              </Button>
            ) : <span />}
            <Button onClick={() => form && save.mutate(form)} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail */}
      <Dialog open={Boolean(detailId)} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detail.data?.entry?.topic ?? "Content plan"}</DialogTitle>
            <DialogDescription>
              {detail.data?.entry?.scheduled_date ?? ""} · {detail.data?.entry?.format ?? "no format"}
            </DialogDescription>
          </DialogHeader>

          {detail.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading details…</p>
          ) : detail.data?.entry ? (
            <div className="space-y-5 text-sm">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={detail.data.entry.status} />
                <span className="text-xs text-muted-foreground">
                  Audience: {detail.data.entry.audiences?.name ?? "-"} · Pillar:{" "}
                  {detail.data.entry.content_pillars?.name ?? "-"}
                </span>
              </div>

              <div>
                <p className="font-display text-sm font-semibold">Objective</p>
                <p className="text-muted-foreground">{detail.data.entry.objective ?? "No objective set."}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="space-y-2 p-4">
                  <p className="font-display text-sm font-semibold">Research opportunity</p>
                  {detail.data.opportunity ? (
                    <>
                      <StatusBadge status={detail.data.opportunity.status} />
                      <p className="text-xs text-muted-foreground">
                        Score {detail.data.opportunity.overall_score ?? "-"}
                      </p>
                      <p className="text-xs">{detail.data.opportunity.key_insight ?? detail.data.opportunity.why_it_matters ?? "-"}</p>
                      <p className="text-xs text-muted-foreground">
                        Hook: {detail.data.opportunity.suggested_hook ?? "-"}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not linked yet.</p>
                  )}
                </Card>

                <Card className="space-y-2 p-4">
                  <p className="font-display text-sm font-semibold">Draft</p>
                  {detail.data.draft ? (
                    <>
                      <StatusBadge status={detail.data.draft.status} />
                      <p className="text-xs font-medium">{detail.data.draft.title ?? "Untitled draft"}</p>
                      <p className="text-xs text-muted-foreground">{detail.data.draft.hook ?? "-"}</p>
                      <p className="text-xs text-muted-foreground">Model: {detail.data.draft.ai_model ?? "-"}</p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">No draft yet.</p>
                  )}
                </Card>

                <Card className="space-y-2 p-4">
                  <p className="font-display text-sm font-semibold">Visual</p>
                  {detail.data.visual ? (
                    <>
                      <StatusBadge status={detail.data.visual.status} />
                      <p className="text-xs">{detail.data.visual.visual_type ?? "-"}</p>
                      <p className="text-xs text-muted-foreground">{detail.data.visual.concept ?? "-"}</p>
                      {detail.data.visual.gamma_generations?.[0]?.gamma_url ? (
                        <a
                          href={detail.data.visual.gamma_generations[0].gamma_url as string}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary underline"
                        >
                          Open in Gamma
                        </a>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">No visual prompt yet.</p>
                  )}
                </Card>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">This plan no longer exists.</p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                const entry = detail.data?.entry;
                if (!entry) return;
                setForm({
                  id: entry.id,
                  scheduled_date: entry.scheduled_date,
                  audience_id: entry.audience_id,
                  pillar_id: entry.pillar_id,
                  topic: entry.topic,
                  objective: entry.objective,
                  format: entry.format,
                  status: entry.status,
                });
                setDetailId(null);
              }}
            >
              Edit plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
