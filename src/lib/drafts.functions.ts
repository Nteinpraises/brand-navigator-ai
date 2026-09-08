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
  "id, title, hook, body, cta, closing, hashtags, full_post, status, ai_model, calendar_id, opportunity_id, image_path, image_paths, image_url, day_theme, linkedin_post_id, linkedin_published_at, created_at, updated_at, content_calendar!content_drafts_calendar_id_fkey(format, scheduled_date, topic)";

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
  hook?: string | null | undefined;
  body?: string | null | undefined;
  cta?: string | null | undefined;
  closing?: string | null | undefined;
  hashtags?: string[] | undefined;
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

function isVideoPath(path: string) {
  return /\.(mp4|mov|webm|m4v)$/i.test(path);
}

/** Replace the media list attached to a draft. Files stay in the library for reuse. */
export const setDraftMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; paths: string[] }) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const firstImage = data.paths.find((path) => !isVideoPath(path)) ?? null;

    const { error } = await supabase
      .from("content_drafts")
      .update({ image_paths: data.paths, image_path: firstImage, image_url: null } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Short lived links so the app can show the attached images and videos. */
export const getDraftMediaLinks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { paths: string[] }) => data)
  .handler(async ({ data, context }) => {
    if (data.paths.length === 0) return [] as { path: string; url: string; kind: "image" | "video" }[];
    const { data: signed, error } = await context.supabase.storage
      .from("post-images")
      .createSignedUrls(data.paths, 60 * 60);
    if (error) throw new Error(error.message);
    return (signed ?? [])
      .filter((item) => item.signedUrl && item.path)
      .map((item) => ({
        path: item.path as string,
        url: item.signedUrl as string,
        kind: isVideoPath(item.path as string) ? ("video" as const) : ("image" as const),
      }));
  });

/** Every file this user has ever uploaded, newest first, ready to reuse. */
export const getMediaLibrary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: files, error } = await supabase.storage.from("post-images").list(userId, {
      limit: 200,
      sortBy: { column: "created_at", order: "desc" },
    });
    if (error) throw new Error(error.message);

    const paths = (files ?? [])
      .filter((file) => file.id)
      .map((file) => `${userId}/${file.name}`);
    if (paths.length === 0) return [] as { path: string; url: string; kind: "image" | "video" }[];

    const { data: signed, error: signError } = await supabase.storage
      .from("post-images")
      .createSignedUrls(paths, 60 * 60);
    if (signError) throw new Error(signError.message);

    return (signed ?? [])
      .filter((item) => item.signedUrl && item.path)
      .map((item) => ({
        path: item.path as string,
        url: item.signedUrl as string,
        kind: isVideoPath(item.path as string) ? ("video" as const) : ("image" as const),
      }));
  });

/** Permanently remove a rejected draft, its versions and its uploaded media. */
export const deleteDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: draft, error } = await supabase
      .from("content_drafts")
      .select("id, status, image_path, image_paths, linkedin_post_id")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    if (draft.linkedin_post_id) throw new Error("A post that is already live on LinkedIn cannot be deleted here.");
    if ((draft.status ?? "").toLowerCase() !== "rejected") {
      throw new Error("Only rejected drafts can be deleted.");
    }

    const media = new Set<string>([
      ...(Array.isArray(draft.image_paths) ? (draft.image_paths as string[]) : []),
      ...(draft.image_path ? [draft.image_path] : []),
    ]);
    if (media.size) await supabase.storage.from("post-images").remove([...media]);

    await supabase.from("content_versions").delete().eq("draft_id", data.id);
    await supabase.from("content_analytics").delete().eq("draft_id", data.id);
    await supabase.from("visual_prompts").update({ draft_id: null }).eq("draft_id", data.id);
    await supabase.from("content_calendar").update({ draft_id: null }).eq("draft_id", data.id);

    const { error: deleteError } = await supabase.from("content_drafts").delete().eq("id", data.id);
    if (deleteError) throw new Error(deleteError.message);
    return { ok: true };
  });
