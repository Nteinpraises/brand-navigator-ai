import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["visuals"],
    queryFn: () => fetchVisuals(),
  });

  return (
    <AppShell title="Visuals" description="Prompts, styles and generated assets.">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading visuals…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      ) : data.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <p className="font-display text-base font-semibold">No visual prompts yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Visual prompts and their generated assets will show up here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((visual) => (
            <Card key={visual.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-base">{visual.visual_type ?? "Visual"}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {visual.content_drafts?.title ?? "Unlinked draft"} · {visual.aspect_ratio ?? "-"}
                  </p>
                </div>
                <StatusBadge status={visual.status} />
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {visual.image_url ? (
                  <img
                    src={visual.image_url}
                    alt={visual.concept ?? "Generated visual"}
                    loading="lazy"
                    className="w-full rounded-md border border-border object-cover"
                  />
                ) : null}
                {visual.concept ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Concept</p>
                    <p className="mt-1">{visual.concept}</p>
                  </div>
                ) : null}
                {visual.visual_text ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">On-image text</p>
                    <p className="mt-1 whitespace-pre-wrap">{visual.visual_text}</p>
                  </div>
                ) : null}
                {visual.layout ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Layout</p>
                    <p className="mt-1">{visual.layout}</p>
                  </div>
                ) : null}
                {visual.style ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Style</p>
                    <p className="mt-1 text-muted-foreground">{visual.style}</p>
                  </div>
                ) : null}
                {visual.image_prompt || visual.gamma_prompt ? (
                  <details className="rounded-md border border-border p-3">
                    <summary className="cursor-pointer text-xs uppercase tracking-wide text-muted-foreground">
                      Generation prompt
                    </summary>
                    <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                      {visual.image_prompt ?? visual.gamma_prompt}
                    </p>
                  </details>
                ) : null}
                {visual.gamma_generations?.[0]?.gamma_url ? (
                  <a
                    href={visual.gamma_generations[0].gamma_url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-primary hover:underline"
                  >
                    Open in Gamma
                  </a>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
