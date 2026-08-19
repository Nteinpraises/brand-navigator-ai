import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboard } from "@/lib/data.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Content Intelligence" },
      { name: "description", content: "Today's content plan, research signals and automation runs." },
      { property: "og:title", content: "Dashboard — Content Intelligence" },
      { property: "og:description", content: "Today's content plan, research signals and automation runs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const fetchDashboard = useServerFn(getDashboard);
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboard(),
  });

  return (
    <AppShell title="Dashboard" description="Your content command center for today.">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading today's signal…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Opportunities", value: data.counts.opportunities },
              { label: "Drafts", value: data.counts.drafts },
              { label: "Visual prompts", value: data.counts.visuals },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 font-display text-3xl font-semibold">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Today's content · {data.today}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {data.calendar ? (
                  <>
                    <p className="font-display text-lg font-semibold">{data.calendar.topic}</p>
                    <p className="text-muted-foreground">{data.calendar.objective ?? "No objective set."}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={data.calendar.status} />
                      <span className="text-xs text-muted-foreground">
                        Audience: {data.calendar.audiences?.name ?? "—"} · Pillar:{" "}
                        {data.calendar.content_pillars?.name ?? "—"} · Format:{" "}
                        {data.calendar.format ?? "—"}
                      </span>
                    </div>
                    {data.opportunity ? (
                      <p className="text-muted-foreground">
                        Hook: {data.opportunity.suggested_hook ?? "—"}
                      </p>
                    ) : null}
                    {data.draft ? (
                      <p className="text-muted-foreground">
                        Draft: {data.draft.title} ({data.draft.status})
                      </p>
                    ) : null}
                    {data.visual ? (
                      <p className="text-muted-foreground">
                        Visual: {data.visual.visual_type} ({data.visual.status})
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Nothing scheduled for today. Add an entry to the content calendar or let your n8n
                    workflow populate it.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Latest research</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {data.research.length === 0 ? (
                  <p className="text-muted-foreground">No research items yet.</p>
                ) : (
                  data.research.map((item) => (
                    <div key={item.id} className="border-b border-border pb-2 last:border-0 last:pb-0">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.source_name ?? "Unknown source"} · {item.category ?? "general"} · score{" "}
                        {item.relevance_score ?? "—"}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Automation runs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {data.runs.length === 0 ? (
                <p className="text-muted-foreground">No automation runs recorded yet.</p>
              ) : (
                data.runs.map((run) => (
                  <div
                    key={run.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{run.workflow_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {run.run_date ?? "—"} {run.error_message ? `· ${run.error_message}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={run.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </AppShell>
  );
}
