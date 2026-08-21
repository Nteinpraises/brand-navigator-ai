import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AppShell } from "@/components/app-shell";
import { RecordTable } from "@/components/record-table";
import { StatusBadge } from "@/components/status-badge";
import { getOpportunities } from "@/lib/data.functions";

export const Route = createFileRoute("/_authenticated/opportunities")({
  head: () => ({
    meta: [
      { title: "Content Opportunities - Content Intelligence" },
      { name: "description", content: "Scored content ideas ranked by opportunity strength." },
      { property: "og:title", content: "Content Opportunities - Content Intelligence" },
      { property: "og:description", content: "Scored content ideas ranked by opportunity strength." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const fetchOpportunities = useServerFn(getOpportunities);
  const { data = [], isLoading } = useQuery({
    queryKey: ["opportunities"],
    queryFn: () => fetchOpportunities(),
  });

  return (
    <AppShell title="Content Opportunities" description="Ranked ideas ready to become drafts.">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading opportunities…</p>
      ) : (
        <RecordTable
          rows={data}
          emptyTitle="No opportunities yet"
          emptyHint="Scored ideas from your automation will appear here, highest score first."
          columns={[
            { key: "topic", header: "Topic", render: (r) => r.topic },
            { key: "angle", header: "Angle", render: (r) => r.suggested_angle ?? "-" },
            { key: "audience", header: "Audience", render: (r) => r.audiences?.name ?? "-" },
            { key: "pillar", header: "Pillar", render: (r) => r.content_pillars?.name ?? "-" },
            { key: "format", header: "Format", render: (r) => r.recommended_format ?? "-" },
            { key: "score", header: "Score", render: (r) => r.overall_score ?? "-" },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          ]}
        />
      )}
    </AppShell>
  );
}
