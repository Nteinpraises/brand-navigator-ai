import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ResearchFilters = {
  audienceId?: string | null;
  pillarId?: string | null;
  category?: string | null;
  from?: string | null;
  to?: string | null;
  minScore?: number | null;
};

/** Research Intelligence: research items, scored opportunities and filter options. */
export const getResearchIntelligence = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: ResearchFilters) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    let researchQuery = supabase
      .from("research_items")
      .select(
        "id, title, source_name, source_type, url, summary, category, relevance_score, credibility_score, published_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (data.category) researchQuery = researchQuery.eq("category", data.category);
    if (data.from) researchQuery = researchQuery.gte("published_at", `${data.from}T00:00:00Z`);
    if (data.to) researchQuery = researchQuery.lte("published_at", `${data.to}T23:59:59Z`);
    if (data.minScore) researchQuery = researchQuery.gte("relevance_score", data.minScore);

    let opportunityQuery = supabase
      .from("content_opportunities")
      .select(
        "id, topic, why_it_matters, key_insight, suggested_angle, suggested_hook, recommended_format, overall_score, relevance_score, timeliness_score, business_value_score, originality_score, evidence_score, status, created_at, research_item_id, audience_id, pillar_id, audiences(name), content_pillars(name)",
      )
      .order("overall_score", { ascending: false, nullsFirst: false })
      .limit(200);

    if (data.audienceId) opportunityQuery = opportunityQuery.eq("audience_id", data.audienceId);
    if (data.pillarId) opportunityQuery = opportunityQuery.eq("pillar_id", data.pillarId);
    if (data.minScore) opportunityQuery = opportunityQuery.gte("overall_score", data.minScore);
    if (data.from) opportunityQuery = opportunityQuery.gte("created_at", `${data.from}T00:00:00Z`);
    if (data.to) opportunityQuery = opportunityQuery.lte("created_at", `${data.to}T23:59:59Z`);

    const [research, opportunities, audiences, pillars, categories] = await Promise.all([
      researchQuery,
      opportunityQuery,
      supabase.from("audiences").select("id, name").order("name"),
      supabase.from("content_pillars").select("id, name").order("name"),
      supabase.from("research_items").select("category").not("category", "is", null).limit(500),
    ]);

    if (research.error) throw new Error(research.error.message);
    if (opportunities.error) throw new Error(opportunities.error.message);

    const categoryList = Array.from(
      new Set((categories.data ?? []).map((row) => row.category).filter(Boolean) as string[]),
    ).sort();

    return {
      research: research.data ?? [],
      opportunities: opportunities.data ?? [],
      audiences: audiences.data ?? [],
      pillars: pillars.data ?? [],
      categories: categoryList,
    };
  });

/** One opportunity plus every research item supporting it. */
export const getOpportunityDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: opportunity, error } = await supabase
      .from("content_opportunities")
      .select(
        "id, topic, why_it_matters, key_insight, suggested_angle, suggested_hook, recommended_format, supporting_evidence, statistics, business_implication, overall_score, relevance_score, timeliness_score, business_value_score, originality_score, evidence_score, status, created_at, research_item_id, audiences(name), content_pillars(name)",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!opportunity) return { opportunity: null, research: [] };

    const ids = new Set<string>();
    if (opportunity.research_item_id) ids.add(opportunity.research_item_id);
    for (const item of (opportunity.supporting_evidence as unknown[]) ?? []) {
      if (typeof item === "string" && /^[0-9a-f-]{36}$/i.test(item)) ids.add(item);
      else if (item && typeof item === "object") {
        const candidate = (item as { research_item_id?: string }).research_item_id;
        if (candidate) ids.add(candidate);
      }
    }

    let research: unknown[] = [];
    if (ids.size > 0) {
      const { data: rows } = await supabase
        .from("research_items")
        .select(
          "id, title, source_name, source_type, url, summary, category, relevance_score, credibility_score, published_at, extracted_facts",
        )
        .in("id", Array.from(ids));
      research = rows ?? [];
    }

    return { opportunity, research: research as Array<Record<string, unknown>> };
  });
