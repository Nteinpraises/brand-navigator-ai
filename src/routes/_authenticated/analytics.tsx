import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecordTable } from "@/components/record-table";
import {
  getAnalyticsOverview,
  saveAnalyticsEntry,
  type AnalyticsRow,
} from "@/lib/analytics.functions";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics - Content Intelligence" },
      {
        name: "description",
        content: "Performance of published content: reach, engagement and leads.",
      },
      { property: "og:title", content: "Analytics - Content Intelligence" },
      {
        property: "og:description",
        content: "Performance of published content: reach, engagement and leads.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

const FIELDS = [
  { key: "impressions", label: "Impressions" },
  { key: "reactions", label: "Reactions" },
  { key: "comments", label: "Comments" },
  { key: "reposts", label: "Reposts" },
  { key: "profileVisits", label: "Profile visits" },
  { key: "followersGained", label: "Followers gained" },
  { key: "leads", label: "Leads" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

function AnalyticsPage() {
  const queryClient = useQueryClient();
  const fetchOverview = useServerFn(getAnalyticsOverview);
  const saveFn = useServerFn(saveAnalyticsEntry);

  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => fetchOverview(),
  });

  useEffect(() => {
    if (error) toast.error((error as Error).message);
  }, [error]);

  const [editing, setEditing] = useState<AnalyticsRow | null>(null);
  const [values, setValues] = useState<Record<FieldKey, string>>({
    impressions: "0",
    reactions: "0",
    comments: "0",
    reposts: "0",
    profileVisits: "0",
    followersGained: "0",
    leads: "0",
  });

  function openEditor(row: AnalyticsRow) {
    setEditing(row);
    setValues({
      impressions: String(row.impressions),
      reactions: String(row.reactions),
      comments: String(row.comments),
      reposts: String(row.reposts),
      profileVisits: String(row.profileVisits),
      followersGained: String(row.followersGained),
      leads: String(row.leads),
    });
  }

  const save = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          draftId: editing!.draftId,
          analyticsId: editing!.analyticsId,
          publishedAt: editing!.publishedAt,
          impressions: Number(values.impressions) || 0,
          reactions: Number(values.reactions) || 0,
          comments: Number(values.comments) || 0,
          reposts: Number(values.reposts) || 0,
          profileVisits: Number(values.profileVisits) || 0,
          followersGained: Number(values.followersGained) || 0,
          leads: Number(values.leads) || 0,
        },
      }),
    onSuccess: () => {
      toast.success("Numbers saved");
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["analytics-overview"] });
    },
    onError: (saveError: Error) => toast.error(saveError.message),
  });

  const rows = data?.rows ?? [];
  const totals = data?.totals;

  return (
    <AppShell title="Analytics" description="What your published content actually did.">
      <div className="mb-6 grid gap-3 sm:grid-cols-5">
        <Stat label="Published posts" value={totals?.posts ?? 0} />
        <Stat label="Impressions" value={totals?.impressions ?? 0} />
        <Stat label="Reactions" value={totals?.reactions ?? 0} />
        <Stat label="Comments" value={totals?.comments ?? 0} />
        <Stat label="Leads" value={totals?.leads ?? 0} />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading analytics…</p>
      ) : (
        <RecordTable
          rows={rows.map((row) => ({ ...row, id: row.draftId }))}
          emptyTitle="No published posts yet"
          emptyHint="Post something from Content Studio and its numbers show up here."
          columns={[
            {
              key: "content",
              header: "Post",
              render: (row) =>
                row.linkedinUrl ? (
                  <a
                    href={row.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {row.title}
                  </a>
                ) : (
                  row.title
                ),
            },
            {
              key: "published",
              header: "Published",
              render: (row) => row.publishedAt?.slice(0, 10) ?? "-",
            },
            { key: "impressions", header: "Impressions", render: (row) => row.impressions },
            { key: "reactions", header: "Reactions", render: (row) => row.reactions },
            { key: "comments", header: "Comments", render: (row) => row.comments },
            { key: "reposts", header: "Reposts", render: (row) => row.reposts },
            { key: "leads", header: "Leads", render: (row) => row.leads },
            {
              key: "actions",
              header: "",
              render: (row) => (
                <Button size="sm" variant="outline" onClick={() => openEditor(row)}>
                  Update numbers
                </Button>
              ),
            },
          ]}
        />
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => (open ? null : setEditing(null))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.title}</DialogTitle>
            <DialogDescription>
Copy the numbers from the post stats on LinkedIn. LinkedIn does not let this app read
              them automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <Input
                  type="number"
                  min={0}
                  value={values[field.key]}
                  onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-semibold">{value.toLocaleString()}</p>
    </Card>
  );
}
