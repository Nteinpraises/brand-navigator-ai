import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DraftInput = {
  id: string;
  title?: string | null;
  hook?: string | null;
  body?: string | null;
  cta?: string | null;
  closing?: string | null;
  hashtags?: string[];
  full_post?: string | null;
  status?: string | null;
  changeReason?: string | null;
};

const DRAFT_SELECT =
  "id, title, hook, body, cta, closing, hashtags, full_post, status, ai_model, calendar_id, opportunity_id, created_at, updated_at, content_calendar(format, scheduled_date, topic)";

/** Content Studio: every draft with its calendar format. */
export const getStudioDrafts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("content_drafts")
      .select(DRAFT_SELECT)
      .order("updated_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** Full version history for a draft, newest first. */
export const getDraftVersions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { draftId: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("content_versions")
      .select("id, version_number, content, change_reason, created_at")
      .eq("draft_id", data.draftId)
      .order("version_number", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export function composeFullPost(parts: {
  hook?: string | null;
  body?: string | null;
  cta?: string | null;
  closing?: string | null;
  hashtags?: string[];
}) {
  const blocks = [parts.hook, parts.body, parts.cta, parts.closing]
    .map((block) => (block ?? "").trim())
    .filter(Boolean);
  const tags = (parts.hashtags ?? [])
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .join(" ");
  if (tags) blocks.push(tags);
  return blocks.join("\n\n");
}

/** Save an edited draft and append an immutable version row. */
export const saveDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: DraftInput) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const hashtags = data.hashtags ?? [];
    const fullPost =
      data.full_post && data.full_post.trim().length > 0
        ? data.full_post
        : composeFullPost({
            hook: data.hook,
            body: data.body,
            cta: data.cta,
            closing: data.closing,
            hashtags,
          });

    const { data: updated, error } = await supabase
      .from("content_drafts")
      .update({
        title: data.title ?? null,
        hook: data.hook ?? null,
        body: data.body ?? null,
        cta: data.cta ?? null,
        closing: data.closing ?? null,
        hashtags,
        full_post: fullPost,
        ...(data.status ? { status: data.status } : {}),
      })
      .eq("id", data.id)
      .select(DRAFT_SELECT)
      .single();
    if (error) throw new Error(error.message);

    const { data: last } = await supabase
      .from("content_versions")
      .select("version_number")
      .eq("draft_id", data.id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error: versionError } = await supabase.from("content_versions").insert({
      user_id: userId,
      draft_id: data.id,
      version_number: (last?.version_number ?? 0) + 1,
      content: fullPost,
      change_reason: data.changeReason ?? "Manual edit",
    });
    if (versionError) throw new Error(versionError.message);

    return updated;
  });

/** Approve / reject / any other status transition, recorded as a version note. */
export const setDraftStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string; note?: string | null }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: updated, error } = await supabase
      .from("content_drafts")
      .update({ status: data.status })
      .eq("id", data.id)
      .select(DRAFT_SELECT)
      .single();
    if (error) throw new Error(error.message);

    const { data: last } = await supabase
      .from("content_versions")
      .select("version_number")
      .eq("draft_id", data.id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    await supabase.from("content_versions").insert({
      user_id: userId,
      draft_id: data.id,
      version_number: (last?.version_number ?? 0) + 1,
      content: updated.full_post ?? "",
      change_reason: data.note ?? `Status set to ${data.status}`,
    });

    return updated;
  });

/** Rebuild the full post from its blocks and store it as a new version. */
export const regenerateFullPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: draft, error } = await supabase
      .from("content_drafts")
      .select("id, hook, body, cta, closing, hashtags")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);

    const hashtags = Array.isArray(draft.hashtags) ? (draft.hashtags as string[]) : [];
    const fullPost = composeFullPost({ ...draft, hashtags });

    const { data: updated, error: updateError } = await supabase
      .from("content_drafts")
      .update({ full_post: fullPost })
      .eq("id", data.id)
      .select(DRAFT_SELECT)
      .single();
    if (updateError) throw new Error(updateError.message);

    const { data: last } = await supabase
      .from("content_versions")
      .select("version_number")
      .eq("draft_id", data.id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    await supabase.from("content_versions").insert({
      user_id: userId,
      draft_id: data.id,
      version_number: (last?.version_number ?? 0) + 1,
      content: fullPost,
      change_reason: "Regenerated from draft blocks",
    });

    return updated;
  });

/** Restore an older version into the live draft as a new version. */
export const restoreDraftVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { draftId: string; versionId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: version, error } = await supabase
      .from("content_versions")
      .select("content, version_number")
      .eq("id", data.versionId)
      .single();
    if (error) throw new Error(error.message);

    const { data: updated, error: updateError } = await supabase
      .from("content_drafts")
      .update({ full_post: version.content })
      .eq("id", data.draftId)
      .select(DRAFT_SELECT)
      .single();
    if (updateError) throw new Error(updateError.message);

    const { data: last } = await supabase
      .from("content_versions")
      .select("version_number")
      .eq("draft_id", data.draftId)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    await supabase.from("content_versions").insert({
      user_id: userId,
      draft_id: data.draftId,
      version_number: (last?.version_number ?? 0) + 1,
      content: version.content,
      change_reason: `Restored version ${version.version_number}`,
    });

    return updated;
  });
