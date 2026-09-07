import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AnalyticsRow = {
  draftId: string;
  title: string;
  publishedAt: string | null;
  linkedinPostId: string | null;
  linkedinUrl: string | null;
  analyticsId: string | null;
  impressions: number;
  reactions: number;
  comments: number;
  reposts: number;
  profileVisits: number;
  followersGained: number;
  leads: number;
};

/** Every published post with the numbers recorded for it so far. */
export const getAnalyticsOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const { data: drafts, error } = await supabase
      .from("content_drafts")
      .select("id, title, published_at, linkedin_post_id, linkedin_published_at, status")
      .or("status.eq.published,linkedin_post_id.not.is.null")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(200);
    if (error) throw new Error(error.message);

    const { data: metrics, error: metricsError } = await supabase
      .from("content_analytics")
      .select(
        "id, draft_id, impressions, reactions, comments, reposts, profile_visits, followers_gained, leads, published_at",
      );
    if (metricsError) throw new Error(metricsError.message);

    const byDraft = new Map((metrics ?? []).map((row) => [row.draft_id, row]));

    const rows: AnalyticsRow[] = (drafts ?? []).map((draft) => {
      const metric = byDraft.get(draft.id);
      return {
        draftId: draft.id,
        title: draft.title ?? "Untitled post",
        publishedAt: draft.published_at ?? draft.linkedin_published_at ?? null,
        linkedinPostId: draft.linkedin_post_id ?? null,
        linkedinUrl: draft.linkedin_post_id
          ? `https://www.linkedin.com/feed/update/${draft.linkedin_post_id}/`
          : null,
        analyticsId: metric?.id ?? null,
        impressions: Number(metric?.impressions ?? 0),
        reactions: Number(metric?.reactions ?? 0),
        comments: Number(metric?.comments ?? 0),
        reposts: Number(metric?.reposts ?? 0),
        profileVisits: Number(metric?.profile_visits ?? 0),
        followersGained: Number(metric?.followers_gained ?? 0),
        leads: Number(metric?.leads ?? 0),
      };
    });

    const totals = rows.reduce(
      (acc, row) => ({
        posts: acc.posts + 1,
        impressions: acc.impressions + row.impressions,
        reactions: acc.reactions + row.reactions,
        comments: acc.comments + row.comments,
        leads: acc.leads + row.leads,
      }),
      { posts: 0, impressions: 0, reactions: 0, comments: 0, leads: 0 },
    );

    return { rows, totals };
  });

export type AnalyticsInput = {
  draftId: string;
  analyticsId?: string | null;
  publishedAt?: string | null;
  impressions: number;
  reactions: number;
  comments: number;
  reposts: number;
  profileVisits: number;
  followersGained: number;
  leads: number;
};

/** Record or update the numbers for one published post. */
export const saveAnalyticsEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: AnalyticsInput) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const values = {
      user_id: userId,
      draft_id: data.draftId,
      published_at: data.publishedAt ?? null,
      impressions: data.impressions,
      reactions: data.reactions,
      comments: data.comments,
      reposts: data.reposts,
      profile_visits: data.profileVisits,
      followers_gained: data.followersGained,
      leads: data.leads,
    };

    if (data.analyticsId) {
      const { error } = await supabase
        .from("content_analytics")
        .update(values)
        .eq("id", data.analyticsId);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    const { error } = await supabase.from("content_analytics").insert(values);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
