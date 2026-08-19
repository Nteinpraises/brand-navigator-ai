import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEFAULT_AUDIENCES, DEFAULT_PILLARS } from "@/lib/brand-defaults";

export type BrandProfileInput = {
  id?: string;
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
  .inputValidator((data: BrandProfileInput) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...rest } = data;
    const payload = { ...rest, user_id: userId };
    if (id) {
      const { error } = await supabase
        .from("brand_profiles")
        .update(payload as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: inserted, error } = await supabase
      .from("brand_profiles")
      .insert(payload as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (inserted as { id: string }).id };
  });

export const saveAudience = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: AudienceInput) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...rest } = data;
    const payload = { ...rest, user_id: userId };
    if (id) {
      const { error } = await supabase
        .from("audiences")
        .update(payload as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: inserted, error } = await supabase
      .from("audiences")
      .insert(payload as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (inserted as { id: string }).id };
  });

export const savePillar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: PillarInput) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...rest } = data;
    const payload = { ...rest, user_id: userId };
    if (id) {
      const { error } = await supabase
        .from("content_pillars")
        .update(payload as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: inserted, error } = await supabase
      .from("content_pillars")
      .insert(payload as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (inserted as { id: string }).id };
  });

export const saveStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: StoryInput) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...rest } = data;
    const payload = { ...rest, user_id: userId };
    if (id) {
      const { error } = await supabase
        .from("personal_stories")
        .update(payload as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: inserted, error } = await supabase
      .from("personal_stories")
      .insert(payload as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (inserted as { id: string }).id };
  });

export const saveCaseStudy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: CaseStudyInput) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...rest } = data;
    const payload = { ...rest, user_id: userId };
    if (id) {
      const { error } = await supabase
        .from("case_studies")
        .update(payload as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: inserted, error } = await supabase
      .from("case_studies")
      .insert(payload as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (inserted as { id: string }).id };
  });

export const deleteBrandRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id: string;
      table: "audiences" | "content_pillars" | "personal_stories" | "case_studies";
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const seedBrandDefaults = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { kind: "audiences" | "pillars" }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const table = data.kind === "audiences" ? "audiences" : "content_pillars";
    const names = data.kind === "audiences" ? DEFAULT_AUDIENCES : DEFAULT_PILLARS;

    const { data: existing } = await supabase.from(table).select("name");
    const have = new Set((existing ?? []).map((row) => row.name));
    const rows = names.filter((name) => !have.has(name)).map((name) => ({ name, user_id: userId }));
    if (rows.length) {
      const { error } = await supabase.from(table).insert(rows as never);
      if (error) throw new Error(error.message);
    }
    return { added: rows.length };
  });
