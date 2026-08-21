import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CalendarEntryInput = {
  id?: string;
  scheduled_date: string;
  audience_id: string | null;
  pillar_id: string | null;
  topic: string | null;
  objective: string | null;
  format: string | null;
  status: string;
};

/** Weekly calendar: entries between two ISO dates plus pickable audiences and pillars. */
export const getCalendarWeek = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { start: string; end: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [entries, audiences, pillars] = await Promise.all([
      supabase
        .from("content_calendar")
        .select(
          "id, scheduled_date, audience_id, pillar_id, topic, objective, format, status, opportunity_id, draft_id, visual_prompt_id, audiences(name), content_pillars(name)",
        )
        .gte("scheduled_date", data.start)
        .lte("scheduled_date", data.end)
        .order("scheduled_date", { ascending: true }),
      supabase.from("audiences").select("id, name").order("name"),
      supabase.from("content_pillars").select("id, name").order("name"),
    ]);
    if (entries.error) throw new Error(entries.error.message);
    return {
      entries: entries.data ?? [],
      audiences: audiences.data ?? [],
      pillars: pillars.data ?? [],
    };
  });

/** Detail view: one calendar entry with its linked opportunity, draft and visual prompt. */
export const getCalendarEntry = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: entry, error } = await supabase
      .from("content_calendar")
      .select(
        "id, scheduled_date, audience_id, pillar_id, topic, objective, format, status, opportunity_id, draft_id, visual_prompt_id, audiences(name), content_pillars(name)",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!entry) return { entry: null, opportunity: null, draft: null, visual: null };

    const [opportunity, draft, visual] = await Promise.all([
      entry.opportunity_id
        ? supabase
            .from("content_opportunities")
            .select(
              "id, topic, why_it_matters, key_insight, suggested_angle, suggested_hook, recommended_format, overall_score, status",
            )
            .eq("id", entry.opportunity_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      entry.draft_id
        ? supabase
            .from("content_drafts")
            .select("id, title, hook, full_post, status, ai_model, updated_at")
            .eq("id", entry.draft_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      entry.visual_prompt_id
        ? supabase
            .from("visual_prompts")
            .select("id, visual_type, concept, style, aspect_ratio, status, gamma_generations(gamma_url, status)")
            .eq("id", entry.visual_prompt_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    return {
      entry,
      opportunity: opportunity?.data ?? null,
      draft: draft?.data ?? null,
      visual: visual?.data ?? null,
    };
  });

export const saveCalendarEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: CalendarEntryInput) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...rest } = data;
    const payload = { ...rest, user_id: userId };
    if (id) {
      const { error } = await supabase
        .from("content_calendar")
        .update(payload as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: inserted, error } = await supabase
      .from("content_calendar")
      .insert(payload as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (inserted as { id: string }).id };
  });

export const deleteCalendarEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("content_calendar").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
