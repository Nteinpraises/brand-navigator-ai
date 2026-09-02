import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Dashboard: today's plan plus recent research and automation activity. */
export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const today = new Date().toISOString().slice(0, 10);

    const { data: calendar, error: calendarError } = await supabase
      .from("content_calendar")
      .select(
        "id, scheduled_date, topic, objective, format, status, opportunity_id, draft_id, visual_prompt_id, audiences(name), content_pillars(name)",
      )
      .eq("scheduled_date", today)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (calendarError) throw new Error(calendarError.message);

    const [opportunity, draft, visual] = await Promise.all([
      calendar?.opportunity_id
        ? supabase
            .from("content_opportunities")
            .select("id, topic, overall_score, status, suggested_hook")
            .eq("id", calendar.opportunity_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      calendar?.draft_id
        ? supabase
            .from("content_drafts")
            .select("id, title, status, ai_model, updated_at")
            .eq("id", calendar.draft_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      calendar?.visual_prompt_id
        ? supabase
            .from("visual_prompts")
            .select("id, visual_type, status, concept")
            .eq("id", calendar.visual_prompt_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const { data: research } = await supabase
      .from("research_items")
      .select("id, title, source_name, url, category, relevance_score, published_at, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: runs } = await supabase
      .from("automation_runs")
      .select("id, workflow_name, run_date, status, started_at, completed_at, error_message")
      .order("created_at", { ascending: false })
      .limit(5);

    const [{ count: opportunityCount }, { count: draftCount }, { count: visualCount }] =
      await Promise.all([
        supabase.from("content_opportunities").select("id", { count: "exact", head: true }),
        supabase.from("content_drafts").select("id", { count: "exact", head: true }),
        supabase.from("visual_prompts").select("id", { count: "exact", head: true }),
      ]);

    return {
      today,
      calendar: calendar ?? null,
      opportunity: opportunity?.data ?? null,
      draft: draft?.data ?? null,
      visual: visual?.data ?? null,
      research: research ?? [],
      runs: runs ?? [],
      counts: {
        opportunities: opportunityCount ?? 0,
        drafts: draftCount ?? 0,
        visuals: visualCount ?? 0,
      },
    };
  });

export const getCalendar = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("content_calendar")
      .select("id, scheduled_date, topic, objective, format, status, audiences(name), content_pillars(name)")
      .order("scheduled_date", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getResearch = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("research_items")
      .select("id, title, source_name, source_type, url, category, relevance_score, credibility_score, published_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getOpportunities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("content_opportunities")
      .select("id, topic, suggested_angle, recommended_format, overall_score, status, created_at, audiences(name), content_pillars(name)")
      .order("overall_score", { ascending: false, nullsFirst: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getDrafts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("content_drafts")
      .select("id, title, hook, status, ai_model, updated_at")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getVisuals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("visual_prompts")
      .select(
        "id, visual_type, concept, layout, visual_text, style, aspect_ratio, status, image_prompt, gamma_prompt, image_url, created_at, draft_id, content_drafts(title), gamma_generations(gamma_url, export_url, status)",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });


export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("content_analytics")
      .select("id, published_at, impressions, reactions, comments, reposts, leads, followers_gained, content_drafts(title)")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getBrandProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profile, audiences, pillars] = await Promise.all([
      context.supabase.from("brand_profiles").select("*").limit(1).maybeSingle(),
      context.supabase.from("audiences").select("id, name, description").order("name"),
      context.supabase.from("content_pillars").select("id, name, description").order("name"),
    ]);
    return {
      profile: profile.data ?? null,
      audiences: audiences.data ?? [],
      pillars: pillars.data ?? [],
    };
  });

export const getAutomationRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("automation_runs")
      .select("id, workflow_name, run_date, status, started_at, completed_at, error_message")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
