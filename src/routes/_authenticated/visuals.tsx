import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AppShell } from "@/components/app-shell";
import { RecordTable } from "@/components/record-table";
import { StatusBadge } from "@/components/status-badge";
import { getVisuals } from "@/lib/data.functions";

export const Route = createFileRoute("/_authenticated/visuals")({
  head: () => ({
    meta: [
      { title: "Visuals - Content Intelligence" },
      { name: "description", content: "Visual prompts and Gamma generations for each piece of content." },
      { property: "og:title", content: "Visuals - Content Intelligence" },
      { property: "og:description", content: "Visual prompts and Gamma generations for each piece of content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VisualsPage,
});

function VisualsPage() {
  const fetchVisuals = useServerFn(getVisuals);
  const { data = [], isLoading } = useQuery({ queryKey: ["visuals"], queryFn: () => fetchVisuals() });

  return (
    <AppShell title="Visuals" description="Prompts, styles and generated assets.">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading visuals…</p>
      ) : (
        <RecordTable
          rows={data}
          emptyTitle="No visual prompts yet"
          emptyHint="Visual prompts and their Gamma generations will show up here."
          columns={[
            { key: "type", header: "Type", render: (r) => r.visual_type ?? "-" },
            { key: "concept", header: "Concept", render: (r) => r.concept ?? "-" },
            { key: "style", header: "Style", render: (r) => r.style ?? "-" },
            { key: "ratio", header: "Ratio", render: (r) => r.aspect_ratio ?? "-" },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            {
              key: "gamma",
              header: "Gamma",
              render: (r) => {
                const url = r.gamma_generations?.[0]?.gamma_url;
                return url ? (
                  <a href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    Open
                  </a>
                ) : (
                  "-"
                );
              },
            },
          ]}
        />
      )}
    </AppShell>
  );
}
