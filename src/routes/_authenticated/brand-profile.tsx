import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { TagInput } from "@/components/tag-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getBrandWorkspace,
  saveBrandProfile,
  saveAudience,
  savePillar,
  saveStory,
  saveCaseStudy,
  deleteBrandRecord,
  seedBrandDefaults,
} from "@/lib/brand.functions";

export const Route = createFileRoute("/_authenticated/brand-profile")({
  head: () => ({
    meta: [
      { title: "Brand Profile — Content Intelligence" },
      {
        name: "description",
        content: "Manage positioning, audiences, pillars, stories and case studies.",
      },
      { property: "og:title", content: "Brand Profile — Content Intelligence" },
      {
        property: "og:description",
        content: "Manage positioning, audiences, pillars, stories and case studies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrandProfilePage,
});

type Row = Record<string, any>;

function arr(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

function BrandProfilePage() {
  const queryClient = useQueryClient();
  const fetchWorkspace = useServerFn(getBrandWorkspace);
  const { data, isLoading } = useQuery({
    queryKey: ["brand-workspace"],
    queryFn: () => fetchWorkspace(),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["brand-workspace"] });

  return (
    <AppShell
      title="Brand Profile"
      description="The source of truth for tone, audience, pillars and proof."
    >
      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">Loading brand workspace…</p>
      ) : (
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="audiences">Audiences</TabsTrigger>
            <TabsTrigger value="pillars">Pillars</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="cases">Case studies</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileForm profile={data.profile} onSaved={refresh} />
          </TabsContent>
          <TabsContent value="audiences">
            <AudienceSection rows={data.audiences} onSaved={refresh} />
          </TabsContent>
          <TabsContent value="pillars">
            <PillarSection rows={data.pillars} onSaved={refresh} />
          </TabsContent>
          <TabsContent value="stories">
            <StorySection rows={data.stories} onSaved={refresh} />
          </TabsContent>
          <TabsContent value="cases">
            <CaseStudySection rows={data.caseStudies} onSaved={refresh} />
          </TabsContent>
        </Tabs>
      )}
    </AppShell>
  );
}

function ProfileForm({ profile, onSaved }: { profile: Row | null; onSaved: () => void }) {
  const save = useServerFn(saveBrandProfile);
  const [form, setForm] = useState(() => ({
    name: profile?.name ?? "",
    professional_title: profile?.professional_title ?? "",
    positioning: profile?.positioning ?? "",
    bio: profile?.bio ?? "",
    tone: profile?.tone ?? "",
    writing_style: profile?.writing_style ?? "",
    services: arr(profile?.services),
    expertise: arr(profile?.expertise),
    industries: arr(profile?.industries),
    words_to_avoid: arr(profile?.words_to_avoid),
  }));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name ?? "",
      professional_title: profile.professional_title ?? "",
      positioning: profile.positioning ?? "",
      bio: profile.bio ?? "",
      tone: profile.tone ?? "",
      writing_style: profile.writing_style ?? "",
      services: arr(profile.services),
      expertise: arr(profile.expertise),
      industries: arr(profile.industries),
      words_to_avoid: arr(profile.words_to_avoid),
    });
  }, [profile]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await save({
        data: {
          id: profile?.id,
          name: form.name || null,
          professional_title: form.professional_title || null,
          positioning: form.positioning || null,
          bio: form.bio || null,
          tone: form.tone || null,
          writing_style: form.writing_style || null,
          services: form.services,
          expertise: form.expertise,
          industries: form.industries,
          words_to_avoid: form.words_to_avoid,
        },
      });
      toast.success("Brand profile saved.");
      onSaved();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Positioning & voice</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ntein Praises"
              />
            </div>
            <div className="space-y-2">
              <Label>Professional title</Label>
              <Input
                value={form.professional_title}
                onChange={(e) => setForm({ ...form, professional_title: e.target.value })}
                placeholder="AI Automation Engineer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Positioning</Label>
            <Textarea
              rows={3}
              value={form.positioning}
              onChange={(e) => setForm({ ...form, positioning: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              rows={4}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Input
                value={form.tone}
                onChange={(e) => setForm({ ...form, tone: e.target.value })}
                placeholder="Direct, practical, technical"
              />
            </div>
            <div className="space-y-2">
              <Label>Writing style</Label>
              <Input
                value={form.writing_style}
                onChange={(e) => setForm({ ...form, writing_style: e.target.value })}
                placeholder="Short lines, concrete examples, no fluff"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TagInput
              label="Services"
              value={form.services}
              onChange={(services) => setForm({ ...form, services })}
            />
            <TagInput
              label="Expertise"
              value={form.expertise}
              onChange={(expertise) => setForm({ ...form, expertise })}
            />
            <TagInput
              label="Industries"
              value={form.industries}
              onChange={(industries) => setForm({ ...form, industries })}
            />
            <TagInput
              label="Words to avoid"
              value={form.words_to_avoid}
              onChange={(words_to_avoid) => setForm({ ...form, words_to_avoid })}
            />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="flex gap-2">{action}</div>
    </div>
  );
}

function DeleteButton({
  id,
  table,
  onSaved,
}: {
  id: string;
  table: "audiences" | "content_pillars" | "personal_stories" | "case_studies";
  onSaved: () => void;
}) {
  const remove = useServerFn(deleteBrandRecord);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Delete"
      onClick={async () => {
        try {
          await remove({ data: { id, table } });
          toast.success("Deleted.");
          onSaved();
        } catch (error) {
          toast.error((error as Error).message);
        }
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

function AudienceSection({ rows, onSaved }: { rows: Row[]; onSaved: () => void }) {
  const save = useServerFn(saveAudience);
  const seed = useServerFn(seedBrandDefaults);
  const [items, setItems] = useState<Row[]>(rows);

  useEffect(() => setItems(rows), [rows]);

  function update(index: number, patch: Row) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Audiences"
        action={
          <>
            <Button
              variant="outline"
              onClick={async () => {
                const res = await seed({ data: { kind: "audiences" } });
                toast.success(`Added ${res.added} default audiences.`);
                onSaved();
              }}
            >
              Load defaults
            </Button>
            <Button
              onClick={() =>
                setItems([
                  ...items,
                  {
                    id: `new-${Date.now()}`,
                    isNew: true,
                    name: "",
                    description: "",
                    pain_points: [],
                    goals: [],
                    industries: [],
                    preferred_topics: [],
                  },
                ])
              }
            >
              <Plus className="size-4" /> Add audience
            </Button>
          </>
        }
      />

      {items.length === 0 ? (
        <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
          No audiences yet. Load the defaults or add one.
        </Card>
      ) : (
        items.map((row, index) => (
          <Card key={row.id}>
            <CardContent className="space-y-4 pt-6">
              <div className="flex gap-2">
                <Input
                  className="font-medium"
                  value={row.name ?? ""}
                  placeholder="Audience name"
                  onChange={(e) => update(index, { name: e.target.value })}
                />
                {!row.isNew && (
                  <DeleteButton id={row.id} table="audiences" onSaved={onSaved} />
                )}
              </div>
              <Textarea
                rows={2}
                placeholder="Description"
                value={row.description ?? ""}
                onChange={(e) => update(index, { description: e.target.value })}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <TagInput
                  label="Pain points"
                  value={arr(row.pain_points)}
                  onChange={(pain_points) => update(index, { pain_points })}
                />
                <TagInput
                  label="Goals"
                  value={arr(row.goals)}
                  onChange={(goals) => update(index, { goals })}
                />
                <TagInput
                  label="Industries"
                  value={arr(row.industries)}
                  onChange={(industries) => update(index, { industries })}
                />
                <TagInput
                  label="Preferred topics"
                  value={arr(row.preferred_topics)}
                  onChange={(preferred_topics) => update(index, { preferred_topics })}
                />
              </div>
              <Button
                onClick={async () => {
                  if (!row.name?.trim()) return toast.error("Name is required.");
                  try {
                    await save({
                      data: {
                        id: row.isNew ? undefined : row.id,
                        name: row.name,
                        description: row.description || null,
                        pain_points: arr(row.pain_points),
                        goals: arr(row.goals),
                        industries: arr(row.industries),
                        preferred_topics: arr(row.preferred_topics),
                      },
                    });
                    toast.success("Audience saved.");
                    onSaved();
                  } catch (error) {
                    toast.error((error as Error).message);
                  }
                }}
              >
                Save
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function PillarSection({ rows, onSaved }: { rows: Row[]; onSaved: () => void }) {
  const save = useServerFn(savePillar);
  const seed = useServerFn(seedBrandDefaults);
  const [items, setItems] = useState<Row[]>(rows);

  useEffect(() => setItems(rows), [rows]);

  function update(index: number, patch: Row) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Content pillars"
        action={
          <>
            <Button
              variant="outline"
              onClick={async () => {
                const res = await seed({ data: { kind: "pillars" } });
                toast.success(`Added ${res.added} default pillars.`);
                onSaved();
              }}
            >
              Load defaults
            </Button>
            <Button
              onClick={() =>
                setItems([
                  ...items,
                  { id: `new-${Date.now()}`, isNew: true, name: "", description: "", objectives: [] },
                ])
              }
            >
              <Plus className="size-4" /> Add pillar
            </Button>
          </>
        }
      />

      {items.length === 0 ? (
        <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
          No pillars yet. Load the defaults or add one.
        </Card>
      ) : (
        items.map((row, index) => (
          <Card key={row.id}>
            <CardContent className="space-y-4 pt-6">
              <div className="flex gap-2">
                <Input
                  value={row.name ?? ""}
                  placeholder="Pillar name"
                  onChange={(e) => update(index, { name: e.target.value })}
                />
                {!row.isNew && (
                  <DeleteButton id={row.id} table="content_pillars" onSaved={onSaved} />
                )}
              </div>
              <Textarea
                rows={2}
                placeholder="Description"
                value={row.description ?? ""}
                onChange={(e) => update(index, { description: e.target.value })}
              />
              <TagInput
                label="Objectives"
                value={arr(row.objectives)}
                onChange={(objectives) => update(index, { objectives })}
              />
              <Button
                onClick={async () => {
                  if (!row.name?.trim()) return toast.error("Name is required.");
                  try {
                    await save({
                      data: {
                        id: row.isNew ? undefined : row.id,
                        name: row.name,
                        description: row.description || null,
                        objectives: arr(row.objectives),
                      },
                    });
                    toast.success("Pillar saved.");
                    onSaved();
                  } catch (error) {
                    toast.error((error as Error).message);
                  }
                }}
              >
                Save
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function StorySection({ rows, onSaved }: { rows: Row[]; onSaved: () => void }) {
  const save = useServerFn(saveStory);
  const [items, setItems] = useState<Row[]>(rows);

  useEffect(() => setItems(rows), [rows]);

  function update(index: number, patch: Row) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Personal stories"
        action={
          <Button
            onClick={() =>
              setItems([
                {
                  id: `new-${Date.now()}`,
                  isNew: true,
                  title: "",
                  story: "",
                  lesson: "",
                  topics: [],
                  audiences: [],
                  pillars: [],
                },
                ...items,
              ])
            }
          >
            <Plus className="size-4" /> Add story
          </Button>
        }
      />

      {items.length === 0 ? (
        <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
          No stories yet. Stories give drafts first-hand credibility.
        </Card>
      ) : (
        items.map((row, index) => (
          <Card key={row.id}>
            <CardContent className="space-y-4 pt-6">
              <div className="flex gap-2">
                <Input
                  value={row.title ?? ""}
                  placeholder="Story title"
                  onChange={(e) => update(index, { title: e.target.value })}
                />
                {!row.isNew && (
                  <DeleteButton id={row.id} table="personal_stories" onSaved={onSaved} />
                )}
              </div>
              <Textarea
                rows={5}
                placeholder="What happened?"
                value={row.story ?? ""}
                onChange={(e) => update(index, { story: e.target.value })}
              />
              <Textarea
                rows={2}
                placeholder="Lesson"
                value={row.lesson ?? ""}
                onChange={(e) => update(index, { lesson: e.target.value })}
              />
              <div className="grid gap-4 md:grid-cols-3">
                <TagInput
                  label="Topics"
                  value={arr(row.topics)}
                  onChange={(topics) => update(index, { topics })}
                />
                <TagInput
                  label="Relevant audiences"
                  value={arr(row.audiences)}
                  onChange={(audiences) => update(index, { audiences })}
                />
                <TagInput
                  label="Relevant pillars"
                  value={arr(row.pillars)}
                  onChange={(pillars) => update(index, { pillars })}
                />
              </div>
              <Button
                onClick={async () => {
                  try {
                    await save({
                      data: {
                        id: row.isNew ? undefined : row.id,
                        title: row.title || null,
                        story: row.story || null,
                        lesson: row.lesson || null,
                        topics: arr(row.topics),
                        audiences: arr(row.audiences),
                        pillars: arr(row.pillars),
                      },
                    });
                    toast.success("Story saved.");
                    onSaved();
                  } catch (error) {
                    toast.error((error as Error).message);
                  }
                }}
              >
                Save
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function CaseStudySection({ rows, onSaved }: { rows: Row[]; onSaved: () => void }) {
  const save = useServerFn(saveCaseStudy);
  const [items, setItems] = useState<Row[]>(rows);

  useEffect(() => setItems(rows), [rows]);

  function update(index: number, patch: Row) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Case studies"
        action={
          <Button
            onClick={() =>
              setItems([
                {
                  id: `new-${Date.now()}`,
                  isNew: true,
                  title: "",
                  client_or_project: "",
                  problem: "",
                  solution: "",
                  technologies: [],
                  results: "",
                  metrics: {},
                  lessons: "",
                  industries: [],
                },
                ...items,
              ])
            }
          >
            <Plus className="size-4" /> Add case study
          </Button>
        }
      />

      {items.length === 0 ? (
        <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
          No case studies yet. These become your proof-driven posts.
        </Card>
      ) : (
        items.map((row, index) => (
          <Card key={row.id}>
            <CardContent className="space-y-4 pt-6">
              <div className="flex gap-2">
                <Input
                  value={row.title ?? ""}
                  placeholder="Case study title"
                  onChange={(e) => update(index, { title: e.target.value })}
                />
                {!row.isNew && (
                  <DeleteButton id={row.id} table="case_studies" onSaved={onSaved} />
                )}
              </div>
              <Input
                value={row.client_or_project ?? ""}
                placeholder="Client or project"
                onChange={(e) => update(index, { client_or_project: e.target.value })}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Textarea
                  rows={4}
                  placeholder="Problem"
                  value={row.problem ?? ""}
                  onChange={(e) => update(index, { problem: e.target.value })}
                />
                <Textarea
                  rows={4}
                  placeholder="Solution"
                  value={row.solution ?? ""}
                  onChange={(e) => update(index, { solution: e.target.value })}
                />
              </div>
              <Textarea
                rows={3}
                placeholder="Results"
                value={row.results ?? ""}
                onChange={(e) => update(index, { results: e.target.value })}
              />
              <Textarea
                rows={2}
                placeholder="Lessons"
                value={row.lessons ?? ""}
                onChange={(e) => update(index, { lessons: e.target.value })}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <TagInput
                  label="Technologies"
                  value={arr(row.technologies)}
                  onChange={(technologies) => update(index, { technologies })}
                />
                <TagInput
                  label="Industries"
                  value={arr(row.industries)}
                  onChange={(industries) => update(index, { industries })}
                />
              </div>
              <MetricsEditor
                value={(row.metrics ?? {}) as Record<string, string>}
                onChange={(metrics) => update(index, { metrics })}
              />
              <Button
                onClick={async () => {
                  try {
                    await save({
                      data: {
                        id: row.isNew ? undefined : row.id,
                        title: row.title || null,
                        client_or_project: row.client_or_project || null,
                        problem: row.problem || null,
                        solution: row.solution || null,
                        technologies: arr(row.technologies),
                        results: row.results || null,
                        metrics: (row.metrics ?? {}) as Record<string, string>,
                        lessons: row.lessons || null,
                        industries: arr(row.industries),
                      },
                    });
                    toast.success("Case study saved.");
                    onSaved();
                  } catch (error) {
                    toast.error((error as Error).message);
                  }
                }}
              >
                Save
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function MetricsEditor({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  const [key, setKey] = useState("");
  const [val, setVal] = useState("");
  const entries = Object.entries(value ?? {});

  return (
    <div className="space-y-2">
      <Label>Metrics</Label>
      {entries.length > 0 && (
        <div className="space-y-1">
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span className="text-muted-foreground">{k}</span>
              <span className="flex items-center gap-2 font-mono">
                {v}
                <button
                  type="button"
                  aria-label={`Remove ${k}`}
                  onClick={() => {
                    const next = { ...value };
                    delete next[k];
                    onChange(next);
                  }}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input placeholder="Metric" value={key} onChange={(e) => setKey(e.target.value)} />
        <Input placeholder="Value" value={val} onChange={(e) => setVal(e.target.value)} />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (!key.trim()) return;
            onChange({ ...value, [key.trim()]: val });
            setKey("");
            setVal("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
