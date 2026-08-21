import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AppShell } from "@/components/app-shell";
import { RecordTable } from "@/components/record-table";
import { StatusBadge } from "@/components/status-badge";
import { getDrafts } from "@/lib/data.functions";

export const Route = createFileRoute("/_authenticated/drafts")({
  head: () => ({
    meta: [
      { title: "Drafts - Content Intelligence" },
      { name: "description", content: "AI-generated content drafts and their review status." },
      { property: "og:title", content: "Drafts - Content Intelligence" },
      { property: "og:description", content: "AI-generated content drafts and their review status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DraftsPage,
});

function DraftsPage() {
  const fetchDrafts = useServerFn(getDrafts);
  const { data = [], isLoading } = useQuery({ queryKey: ["drafts"], queryFn: () => fetchDrafts() });

  return (
    <AppShell title="Drafts" description="Every draft, newest edits first.">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading drafts…</p>
      ) : (
        <RecordTable
          rows={data}
          emptyTitle="No drafts yet"
          emptyHint="Drafts written by your generation workflow will be listed here."
          columns={[
            { key: "title", header: "Title", render: (r) => r.title },
            { key: "hook", header: "Hook", render: (r) => r.hook ?? "-" },
            { key: "model", header: "Model", render: (r) => r.ai_model ?? "-" },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "updated", header: "Updated", render: (r) => r.updated_at?.slice(0, 10) ?? "-" },
          ]}
        />
      )}
    </AppShell>
  );
}
