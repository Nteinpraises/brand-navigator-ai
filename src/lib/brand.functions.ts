import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Json = string[] | Record<string, string>;

export type BrandProfileInput = {
  name: string | null;
  professional_title: string | null;
  positioning: string | null;
  bio: string | null;
  services: string[];
  expertise: string[];
  industries: string[];
  tone: string | null;
  writing_style: string | null;
  words_to_avoid: string[];
};

export type AudienceInput = {
  id?: string;
  name: string;
  description: string | null;
  pain_points: string[];
  goals: string[];
  industries: string[];
  preferred_topics: string[];
};

export type PillarInput = {
  id?: string;
  name: string;
  description: string | null;
  objectives: string[];
};

export type StoryInput = {
  id?: string;
  title: string | null;
  story: string | null;
  lesson: string | null;
  topics: string[];
  audiences: string[];
  pillars: string[];
};

export type CaseStudyInput = {
  id?: string;
  title: string | null;
  client_or_project: string | null;
  problem: string | null;
  solution: string | null;
  technologies: string[];
  results: string | null;
  metrics: Record<string, string>;
  lessons: string | null;
  industries: string[];
};

export const getBrandWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [profile, audiences, pillars, stories, caseStudies] = await Promise.all([
      supabase.from("brand_profiles").select("*").limit(1).maybeSingle(),
      supabase.from("audiences").select("*").order("created_at", { ascending: true }),
      supabase.from("content_pillars").select("*").order("created_at", { ascending: true }),
      supabase.from("personal_stories").select("*").order("created_at", { ascending: false }),
      supabase.from("case_studies").select("*").order("created_at", { ascending: false }),
    ]);

    return {
      profile: profile.data ?? null,
      audiences: audiences.data ?? [],
      pillars: pillars.data ?? [],
      stories: stories.data ?? [],
      caseStudies: caseStudies.data ?? [],
    };
  });

export const saveBrandProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: BrandProfileInput & { id?: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const payload = { ...data, user_id: userId } as Record<string, unknown>;
    if (data.id) {
      const { error } = await supabase.from("brand_profiles").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    delete payload['id'];
    const { data: inserted, error } = await supabase
      .from("brand_profiles")
      .insert(payload as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

function upsertFn<T extends { id?: string }>(table: "audiences" | "content_pillars" | "personal_stories" | "case_studies") {
  return createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .inputValidator((data: T) => data)
    .handler(async ({ data, context }) => {
      const { supabase, userId } = context;
      const payload = { ...(data as Record<string, unknown>), user_id: userId };
      const id = data.id;
      if (id) {
        delete payload['id'];
        const { error } = await supabase.from(table).update(payload as never).eq("id", id);
        if (error) throw new Error(error.message);
        return { id };
      }
      delete payload['id'];
      const { data: inserted, error } = await supabase
        .from(table)
        .insert(payload as never)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { id: (inserted as { id: string }).id };
    });
}

function deleteFn(table: "audiences" | "content_pillars" | "personal_stories" | "case_studies") {
  return createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .inputValidator((data: { id: string }) => data)
    .handler(async ({ data, context }) => {
      const { error } = await context.supabase.from(table).delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    });
}

export const saveAudience = upsertFn<AudienceInput>("audiences");
export const deleteAudience = deleteFn("audiences");
export const savePillar = upsertFn<PillarInput>("content_pillars");
export const deletePillar = deleteFn("content_pillars");
export const saveStory = upsertFn<StoryInput>("personal_stories");
export const deleteStory = deleteFn("personal_stories");
export const saveCaseStudy = upsertFn<CaseStudyInput>("case_studies");
export const deleteCaseStudy = deleteFn("case_studies");

const DEFAULT_AUDIENCES = [
  "Founders & SMB Owners",
  "Digital & Marketing Agencies",
  "SaaS Founders & Startup Teams",
  "High-Volume Service Businesses",
  "Coaches, Consultants & Personal Brands",
];

const DEFAULT_PILLARS = ["Teach", "Build in Public", "Business Problems", "Trends & Commentary"];

export const seedBrandDefaults = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { kind: "audiences" | "pillars" }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.kind === "audiences") {
      const { data: existing } = await supabase.from("audiences").select("name");
      const have = new Set((existing ?? []).map((r) => r.name));
      const rows = DEFAULT_AUDIENCES.filter((n) => !have.has(n)).map((name) => ({
        name,
        user_id: userId,
      }));
      if (rows.length) {
        const { error } = await supabase.from("audiences").insert(rows);
        if (error) throw new Error(error.message);
      }
      return { added: rows.length };
    }
    const { data: existing } = await supabase.from("content_pillars").select("name");
    const have = new Set((existing ?? []).map((r) => r.name));
    const rows = DEFAULT_PILLARS.filter((n) => !have.has(n)).map((name) => ({
      name,
      user_id: userId,
    }));
    if (rows.length) {
      const { error } = await supabase.from("content_pillars").insert(rows);
      if (error) throw new Error(error.message);
    }
    return { added: rows.length };
  });

export type { Json };
