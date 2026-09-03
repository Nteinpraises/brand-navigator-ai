import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AppShell } from "@/components/app-shell";
import { RecordTable } from "@/components/record-table";
import { getAnalytics } from "@/lib/data.functions";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics - Content Intelligence" },
      { name: "description", content: "Performance of published content: reach, engagement and leads." },
      { property: "og:title", content: "Analytics - Content Intelligence" },
      { property: "og:description", content: "Performance of published content: reach, engagement and leads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const fetchAnalytics = useServerFn(getAnalytics);
  const { data = [], isLoading, error } = useQuery({ queryKey: ["analytics"], queryFn: () => fetchAnalytics() });

  return (
    <AppShell title="Analytics" description="What your published content actually did.">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading analytics…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      ) : (
        <RecordTable
          rows={data}
          emptyTitle="No analytics yet"
          emptyHint="Post-performance rows synced from LinkedIn will appear here."
          columns={[
            { key: "content", header: "Content", render: (r) => r.content_drafts?.title ?? "-" },
            { key: "published", header: "Published", render: (r) => r.published_at?.slice(0, 10) ?? "-" },
            { key: "impressions", header: "Impressions", render: (r) => r.impressions ?? 0 },
            { key: "reactions", header: "Reactions", render: (r) => r.reactions ?? 0 },
            { key: "comments", header: "Comments", render: (r) => r.comments ?? 0 },
            { key: "reposts", header: "Reposts", render: (r) => r.reposts ?? 0 },
            { key: "leads", header: "Leads", render: (r) => r.leads ?? 0 },
            { key: "followers", header: "Followers", render: (r) => r.followers_gained ?? 0 },
          ]}
        />
      )}
    </AppShell>
  );
}
