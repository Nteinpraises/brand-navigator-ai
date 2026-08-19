import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AppShell } from "@/components/app-shell";
import { RecordTable } from "@/components/record-table";
import { StatusBadge } from "@/components/status-badge";
import { getCalendar } from "@/lib/data.functions";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Content Calendar — Content Intelligence" },
      { name: "description", content: "Plan and track scheduled content across audiences and pillars." },
      { property: "og:title", content: "Content Calendar — Content Intelligence" },
      { property: "og:description", content: "Plan and track scheduled content across audiences and pillars." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const fetchCalendar = useServerFn(getCalendar);
  const { data = [], isLoading } = useQuery({ queryKey: ["calendar"], queryFn: () => fetchCalendar() });

  return (
    <AppShell title="Content Calendar" description="Everything scheduled, in order.">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading calendar…</p>
      ) : (
        <RecordTable
          rows={data}
          emptyTitle="No scheduled content"
          emptyHint="Entries created here or by your n8n workflow will appear in this calendar."
          columns={[
            { key: "date", header: "Date", render: (r) => r.scheduled_date ?? "—" },
            { key: "topic", header: "Topic", render: (r) => r.topic },
            { key: "audience", header: "Audience", render: (r) => r.audiences?.name ?? "—" },
            { key: "pillar", header: "Pillar", render: (r) => r.content_pillars?.name ?? "—" },
            { key: "format", header: "Format", render: (r) => r.format ?? "—" },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          ]}
        />
      )}
    </AppShell>
  );
}
