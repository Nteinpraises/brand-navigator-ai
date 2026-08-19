import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAutomationRuns } from "@/lib/data.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Content Intelligence" },
      { name: "description", content: "Automation run history and workspace configuration." },
      { property: "og:title", content: "Settings — Content Intelligence" },
      { property: "og:description", content: "Automation run history and workspace configuration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const fetchRuns = useServerFn(getAutomationRuns);
  const { data = [], isLoading } = useQuery({
    queryKey: ["automation-runs"],
    queryFn: () => fetchRuns(),
  });

  return (
    <AppShell title="Settings" description="Automation health and workspace details.">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Automation runs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {isLoading ? (
            <p className="text-muted-foreground">Loading runs…</p>
          ) : data.length === 0 ? (
            <p className="text-muted-foreground">
              No automation runs yet. Your n8n workflows can log into automation_runs.
            </p>
          ) : (
            data.map((run) => (
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
    </AppShell>
  );
}
