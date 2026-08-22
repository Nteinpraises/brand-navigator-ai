import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getResearchIntelligence, getOpportunityDetail } from "@/lib/research.functions";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({
    meta: [
      { title: "Research Intelligence - Content Intelligence" },
      {
        name: "description",
        content:
          "Scored AI industry research and content opportunities with audience, pillar and category filters.",
      },
      { property: "og:title", content: "Research Intelligence - Content Intelligence" },
      {
        property: "og:description",
        content:
          "Scored AI industry research and content opportunities with audience, pillar and category filters.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

const ANY = "any";

type ResearchRow = {
  id: string;
  title: string | null;
  source_name: string | null;
  source_type?: string | null;
  url: string | null;
  summary: string | null;
  category: string | null;
  relevance_score: number | null;
  credibility_score?: number | null;
  published_at: string | null;
};

function Score({ label, value }: { label: string; value: number | null | undefined }) {
  if (value === null || value === undefined) return null;
  return (
    <Badge variant="outline" className="font-mono text-[11px]">
      {label} {value}
    </Badge>
  );
}

function ResearchCard({ item }: { item: ResearchRow }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{item.source_name ?? "Unknown source"}</span>
          <span>·</span>
          <span>{item.published_at?.slice(0, 10) ?? "No date"}</span>
          {item.category ? (
            <Badge variant="secondary" className="text-[11px]">
              {item.category}
            </Badge>
          ) : null}
        </div>
        <CardTitle className="text-base leading-snug">{item.title ?? "Untitled"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <p className="text-sm text-muted-foreground">{item.summary ?? "No summary captured."}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Score label="Relevance" value={item.relevance_score} />
          <Score label="Credibility" value={item.credibility_score} />
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Source <ExternalLink className="size-3" />
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function ResearchPage() {
  const fetchIntel = useServerFn(getResearchIntelligence);
  const fetchDetail = useServerFn(getOpportunityDetail);

  const [audienceId, setAudienceId] = useState(ANY);
  const [pillarId, setPillarId] = useState(ANY);
  const [category, setCategory] = useState(ANY);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minScore, setMinScore] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filters = {
    audienceId: audienceId === ANY ? null : audienceId,
    pillarId: pillarId === ANY ? null : pillarId,
    category: category === ANY ? null : category,
    from: from || null,
    to: to || null,
    minScore: minScore ? Number(minScore) : null,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["research-intelligence", filters],
    queryFn: () => fetchIntel({ data: filters }),
  });

  const detail = useQuery({
    queryKey: ["opportunity-detail", openId],
    queryFn: () => fetchDetail({ data: { id: openId as string } }),
    enabled: Boolean(openId),
  });

  const research = data?.research ?? [];
  const opportunities = data?.opportunities ?? [];

  function resetFilters() {
    setAudienceId(ANY);
    setPillarId(ANY);
    setCategory(ANY);
    setFrom("");
    setTo("");
    setMinScore("");
  }

  return (
    <AppShell
      title="Research Intelligence"
      description="Signals from your sources and the scored opportunities they produce."
    >
      <Card className="mb-6">
        <CardContent className="grid gap-4 pt-6 md:grid-cols-3 xl:grid-cols-6">
          <div className="space-y-2">
            <Label>Audience</Label>
            <Select value={audienceId} onValueChange={setAudienceId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All audiences</SelectItem>
                {(data?.audiences ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Pillar</Label>
            <Select value={pillarId} onValueChange={setPillarId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All pillars</SelectItem>
                {(data?.pillars ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All categories</SelectItem>
                {(data?.categories ?? []).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="score">Min score</Label>
            <Input
              id="score"
              type="number"
              step="0.1"
              placeholder="e.g. 7"
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
            />
          </div>
          <div className="xl:col-span-6">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="opportunities">
        <TabsList>
          <TabsTrigger value="opportunities">Opportunities ({opportunities.length})</TabsTrigger>
          <TabsTrigger value="research">Research ({research.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="mt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading opportunities...</p>
          ) : opportunities.length === 0 ? (
            <Card className="border-dashed p-10 text-center">
              <p className="font-display text-base font-semibold">No opportunities match</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Scored ideas from your automation land here. Loosen the filters if you expect rows.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {opportunities.map((o) => (
                <Card key={o.id} className="flex h-full flex-col">
                  <CardHeader className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {o.audiences?.name ? <Badge variant="secondary">{o.audiences.name}</Badge> : null}
                      {o.content_pillars?.name ? (
                        <Badge variant="outline">{o.content_pillars.name}</Badge>
                      ) : null}
                      <StatusBadge status={o.status} />
                      <span className="ml-auto font-mono text-sm text-primary">
                        {o.overall_score ?? "-"}
                      </span>
                    </div>
                    <CardTitle className="text-base leading-snug">{o.topic ?? "Untitled"}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-3 text-sm">
                    <Field label="Why it matters" value={o.why_it_matters} />
                    <Field label="Key insight" value={o.key_insight} />
                    <Field label="Suggested angle" value={o.suggested_angle} />
                    <Field label="Suggested hook" value={o.suggested_hook} />
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        Format: {o.recommended_format ?? "-"}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => setOpenId(o.id)}>
                        View supporting research
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="research" className="mt-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading research...</p>
          ) : research.length === 0 ? (
            <Card className="border-dashed p-10 text-center">
              <p className="font-display text-base font-semibold">No research matches</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Your n8n research workflow inserts rows into research_items to fill this view.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {research.map((item) => (
                <ResearchCard key={item.id} item={item as ResearchRow} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(openId)} onOpenChange={(open) => !open && setOpenId(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail.data?.opportunity?.topic ?? "Opportunity"}</DialogTitle>
            <DialogDescription>
              Supporting research behind this opportunity.
            </DialogDescription>
          </DialogHeader>

          {detail.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading detail...</p>
          ) : detail.data?.opportunity ? (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Score label="Overall" value={detail.data.opportunity.overall_score} />
                <Score label="Relevance" value={detail.data.opportunity.relevance_score} />
                <Score label="Timeliness" value={detail.data.opportunity.timeliness_score} />
                <Score label="Business" value={detail.data.opportunity.business_value_score} />
                <Score label="Originality" value={detail.data.opportunity.originality_score} />
                <Score label="Evidence" value={detail.data.opportunity.evidence_score} />
              </div>
              <div className="grid gap-3 text-sm">
                <Field label="Why it matters" value={detail.data.opportunity.why_it_matters} />
                <Field label="Key insight" value={detail.data.opportunity.key_insight} />
                <Field label="Suggested angle" value={detail.data.opportunity.suggested_angle} />
                <Field label="Suggested hook" value={detail.data.opportunity.suggested_hook} />
                <Field
                  label="Business implication"
                  value={detail.data.opportunity.business_implication}
                />
                <Field
                  label="Recommended format"
                  value={detail.data.opportunity.recommended_format}
                />
              </div>

              <div>
                <p className="mb-3 font-display text-sm font-semibold">Supporting research</p>
                {detail.data.research.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No research items are linked to this opportunity yet.
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {detail.data.research.map((item) => (
                      <ResearchCard key={String(item['id'])} item={item as unknown as ResearchRow} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Opportunity not found.</p>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
