import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBrandProfile } from "@/lib/data.functions";

export const Route = createFileRoute("/_authenticated/brand-profile")({
  head: () => ({
    meta: [
      { title: "Brand Profile — Content Intelligence" },
      { name: "description", content: "Positioning, audiences and content pillars driving every draft." },
      { property: "og:title", content: "Brand Profile — Content Intelligence" },
      { property: "og:description", content: "Positioning, audiences and content pillars driving every draft." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrandProfilePage,
});

function BrandProfilePage() {
  const fetchBrandProfile = useServerFn(getBrandProfile);
  const { data, isLoading } = useQuery({
    queryKey: ["brand-profile"],
    queryFn: () => fetchBrandProfile(),
  });

  return (
    <AppShell title="Brand Profile" description="The source of truth for tone, audience and pillars.">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading brand profile…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Positioning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {data?.profile ? (
                <>
                  <p className="font-display text-lg font-semibold">
                    {data.profile.name ?? "Untitled profile"}
                  </p>
                  <p className="text-muted-foreground">{data.profile.positioning ?? "—"}</p>
                  <p className="text-muted-foreground">Tone: {data.profile.tone ?? "—"}</p>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No brand profile yet. Insert a row in brand_profiles to define positioning and tone.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Audiences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {data?.audiences.length ? (
                data.audiences.map((a) => (
                  <div key={a.id}>
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.description ?? "—"}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No audiences defined.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content pillars</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {data?.pillars.length ? (
                data.pillars.map((p) => (
                  <div key={p.id}>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.description ?? "—"}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No pillars defined.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
