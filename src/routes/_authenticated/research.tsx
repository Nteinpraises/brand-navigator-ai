import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AppShell } from "@/components/app-shell";
import { RecordTable } from "@/components/record-table";
import { getResearch } from "@/lib/data.functions";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({
    meta: [
      { title: "Research - Content Intelligence" },
      { name: "description", content: "Collected AI industry signals scored for relevance and credibility." },
      { property: "og:title", content: "Research - Content Intelligence" },
      { property: "og:description", content: "Collected AI industry signals scored for relevance and credibility." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const fetchResearch = useServerFn(getResearch);
  const { data = [], isLoading } = useQuery({ queryKey: ["research"], queryFn: () => fetchResearch() });

  return (
    <AppShell title="Research" description="Signals harvested from your sources.">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading research…</p>
      ) : (
        <RecordTable
          rows={data}
          emptyTitle="No research yet"
          emptyHint="Your n8n research workflow can insert rows into research_items to fill this view."
          columns={[
            {
              key: "title",
              header: "Title",
              render: (r) =>
                r.url ? (
                  <a href={r.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {r.title}
                  </a>
                ) : (
                  r.title
                ),
            },
            { key: "source", header: "Source", render: (r) => r.source_name ?? "-" },
            { key: "category", header: "Category", render: (r) => r.category ?? "-" },
            { key: "relevance", header: "Relevance", render: (r) => r.relevance_score ?? "-" },
            { key: "credibility", header: "Credibility", render: (r) => r.credibility_score ?? "-" },
            { key: "published", header: "Published", render: (r) => r.published_at?.slice(0, 10) ?? "-" },
          ]}
        />
      )}
    </AppShell>
  );
}
