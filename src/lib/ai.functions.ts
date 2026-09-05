import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { VOICE_PLAYBOOK, themeById, themeForDate, DAY_THEMES } from "@/lib/voice";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

type Generated = {
  title: string;
  hook: string;
  body: string;
  cta: string;
  closing: string;
  hashtags: string[];
};

function stripEmDash(value: string) {
  return value.replace(/\u2014/g, ",").replace(/\u2013/g, "-");
}

async function callModel(system: string, user: string): Promise<Generated> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("The AI service is not configured yet.");

  const response = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "write_post",
            description: "Return the finished LinkedIn post split into blocks.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Internal label, max 8 words." },
                hook: { type: "string", description: "The first two lines only." },
                body: { type: "string", description: "Context, body and the turn." },
                cta: { type: "string", description: "The closing encouragement lines." },
                closing: { type: "string", description: "The P.S. engagement question." },
                hashtags: { type: "array", items: { type: "string" }, maxItems: 3 },
              },
              required: ["title", "hook", "body", "cta", "closing", "hashtags"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "write_post" } },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 429) throw new Error("Too many requests right now. Try again shortly.");
    if (response.status === 402) throw new Error("AI credits are used up. Add credits to keep generating.");
    throw new Error(`Writing failed [${response.status}]: ${text}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { tool_calls?: Array<{ function?: { arguments?: string } }> } }>;
  };
  const args = payload.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("The writer returned nothing. Try again.");

  const parsed = JSON.parse(args) as Generated;
  return {
    title: stripEmDash(parsed.title ?? ""),
    hook: stripEmDash(parsed.hook ?? ""),
    body: stripEmDash(parsed.body ?? ""),
    cta: stripEmDash(parsed.cta ?? ""),
    closing: stripEmDash(parsed.closing ?? ""),
    hashtags: (parsed.hashtags ?? []).map((tag) => stripEmDash(tag.replace(/^#/, ""))).slice(0, 3),
  };
}

type BrandContext = {
  profile: Record<string, unknown> | null;
  stories: Array<Record<string, unknown>>;
  caseStudies: Array<Record<string, unknown>>;
};

function describeBrand(ctx: BrandContext) {
  const p = ctx.profile as
    | {
        name?: string | null;
        professional_title?: string | null;
        positioning?: string | null;
        bio?: string | null;
        services?: unknown;
        expertise?: unknown;
        tone?: string | null;
        writing_style?: string | null;
        words_to_avoid?: unknown;
      }
    | null;

  const lines: string[] = [];
  if (p) {
    lines.push(`Name: ${p.name ?? "Ntein Praises"}`);
    lines.push(`Title: ${p.professional_title ?? "AI Automation Engineer"}`);
    if (p.positioning) lines.push(`Positioning: ${p.positioning}`);
    if (p.bio) lines.push(`Bio: ${p.bio}`);
    if (Array.isArray(p.expertise) && p.expertise.length) lines.push(`Expertise: ${p.expertise.join(", ")}`);
    if (Array.isArray(p.services) && p.services.length) lines.push(`Services: ${p.services.join(", ")}`);
    if (p.tone) lines.push(`Tone: ${p.tone}`);
    if (p.writing_style) lines.push(`Writing style: ${p.writing_style}`);
    if (Array.isArray(p.words_to_avoid) && p.words_to_avoid.length)
      lines.push(`Never use these words: ${p.words_to_avoid.join(", ")}`);
  }

  if (ctx.stories.length) {
    lines.push("");
    lines.push("True personal stories you may draw from (use the real details, do not invent new facts):");
    for (const story of ctx.stories.slice(0, 8)) {
      const s = story as { title?: string | null; story?: string | null; lesson?: string | null };
      lines.push(`- ${s.title ?? "Story"}: ${(s.story ?? "").slice(0, 400)} | Lesson: ${s.lesson ?? ""}`);
    }
  }

  if (ctx.caseStudies.length) {
    lines.push("");
    lines.push("Real client work you may reference:");
    for (const cs of ctx.caseStudies.slice(0, 6)) {
      const c = cs as { title?: string | null; problem?: string | null; solution?: string | null; results?: string | null };
      lines.push(`- ${c.title ?? "Project"}: ${c.problem ?? ""} -> ${c.solution ?? ""} -> ${c.results ?? ""}`);
    }
  }

  return lines.join("\n");
}

async function loadBrand(supabase: {
  from: (table: string) => {
    select: (cols: string) => {
      limit: (n: number) => { maybeSingle: () => Promise<{ data: unknown }> };
      order: (col: string, opts: { ascending: boolean }) => { limit: (n: number) => Promise<{ data: unknown }> };
    };
  };
}): Promise<BrandContext> {
  const [profile, stories, caseStudies] = await Promise.all([
    supabase.from("brand_profiles").select("*").limit(1).maybeSingle(),
    supabase.from("personal_stories").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("case_studies").select("*").order("created_at", { ascending: false }).limit(8),
  ]);
  return {
    profile: (profile.data as Record<string, unknown> | null) ?? null,
    stories: (stories.data as Array<Record<string, unknown>>) ?? [],
    caseStudies: (caseStudies.data as Array<Record<string, unknown>>) ?? [],
  };
}

export const listDayThemes = createServerFn({ method: "GET" }).handler(async () => DAY_THEMES);

/** Write a brand new post in Ntein's voice and store it as a draft. */
export const generateDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      dayTheme?: string | undefined;
      topic?: string | undefined;
      notes?: string | undefined;
      scheduledDate?: string | undefined;
      calendarId?: string | undefined;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const theme = themeById(data.dayTheme) ?? themeForDate(data.scheduledDate ?? new Date());
    const brand = await loadBrand(supabase as never);

    const system = `${VOICE_PLAYBOOK}\n\nWHO YOU WRITE AS\n${describeBrand(brand)}`;
    const user = [
      `Today's post type: ${theme.label}.`,
      `What this type is: ${theme.description}`,
      `Hook approach: ${theme.hookStyle}`,
      data.topic ? `Topic to write about: ${data.topic}` : "Pick the topic yourself, based on his real experience.",
      data.notes ? `Extra direction from Ntein: ${data.notes}` : "",
      theme.id === "personal_story"
        ? "This is a storytelling day. Keep AI and code out of the spotlight. Lead with the human moment."
        : "",
      "Write one post now.",
    ]
      .filter(Boolean)
      .join("\n");

    const post = await callModel(system, user);

    const fullPost = [post.hook, post.body, post.cta, post.closing]
      .map((block) => block.trim())
      .filter(Boolean)
      .join("\n\n");

    const { data: inserted, error } = await supabase
      .from("content_drafts")
      .insert({
        user_id: userId,
        title: post.title,
        hook: post.hook,
        body: post.body,
        cta: post.cta,
        closing: post.closing,
        hashtags: post.hashtags,
        full_post: fullPost,
        status: "draft",
        ai_model: MODEL,
        day_theme: theme.id,
        ...(data.calendarId ? { calendar_id: data.calendarId } : {}),
      } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const draftId = (inserted as { id: string }).id;
    await supabase.from("content_versions").insert({
      user_id: userId,
      draft_id: draftId,
      version_number: 1,
      content: fullPost,
      change_reason: `Written in Ntein's voice (${theme.label})`,
    } as never);

    return { id: draftId };
  });

/** Rewrite an existing draft so it follows the playbook. */
export const rewriteDraftInVoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; dayTheme?: string | undefined; instruction?: string | undefined }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: draft, error: readError } = await supabase
      .from("content_drafts")
      .select("id, title, hook, body, cta, closing, hashtags, full_post, day_theme")
      .eq("id", data.id)
      .single();
    if (readError) throw new Error(readError.message);

    const theme = themeById(data.dayTheme ?? draft.day_theme) ?? themeForDate(new Date());
    const brand = await loadBrand(supabase as never);

    const existing =
      draft.full_post ??
      [draft.hook, draft.body, draft.cta, draft.closing].filter(Boolean).join("\n\n");

    const system = `${VOICE_PLAYBOOK}\n\nWHO YOU WRITE AS\n${describeBrand(brand)}`;
    const user = [
      `Rewrite this post so it follows the playbook exactly. Keep the true facts, change the shape and the voice.`,
      `Post type: ${theme.label}. ${theme.description}`,
      data.instruction ? `Direction from Ntein: ${data.instruction}` : "",
      theme.id === "personal_story"
        ? "This is a storytelling day. Strip out the AI talk and lead with the human moment."
        : "It should read like a person, not a report. Cut anything that sounds machine written.",
      "",
      "CURRENT POST:",
      existing || "(empty)",
    ]
      .filter(Boolean)
      .join("\n");

    const post = await callModel(system, user);
    const fullPost = [post.hook, post.body, post.cta, post.closing]
      .map((block) => block.trim())
      .filter(Boolean)
      .join("\n\n");

    const { data: updated, error } = await supabase
      .from("content_drafts")
      .update({
        title: post.title,
        hook: post.hook,
        body: post.body,
        cta: post.cta,
        closing: post.closing,
        hashtags: post.hashtags,
        full_post: fullPost,
        day_theme: theme.id,
        ai_model: MODEL,
      } as never)
      .eq("id", data.id)
      .select("id")
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
      content: fullPost,
      change_reason: `Rewritten in Ntein's voice (${theme.label})`,
    } as never);

    return updated;
  });
