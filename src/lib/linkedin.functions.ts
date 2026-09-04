import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://connector-gateway.lovable.dev/linkedin";

function gatewayHeaders() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const linkedInKey = process.env["LINKEDIN_API_KEY"];
  if (!lovableKey || !linkedInKey) {
    throw new Error("LinkedIn is not connected to this app yet.");
  }
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": linkedInKey,
    "Content-Type": "application/json",
  };
}

async function gatewayJson(path: string, init?: RequestInit) {
  const response = await fetch(`${GATEWAY}${path}`, { ...init, headers: gatewayHeaders() });
  const text = await response.text();
  if (!response.ok) {
    console.error(`LinkedIn request failed [${response.status}]: ${text}`);
    throw new Error(`LinkedIn refused the request [${response.status}]: ${text}`);
  }
  return text ? (JSON.parse(text) as Record<string, unknown>) : {};
}

/** Who the app will post as. */
export const getLinkedInIdentity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const info = (await gatewayJson("/v2/userinfo")) as {
      sub?: string;
      name?: string;
      picture?: string;
      email?: string;
    };
    return {
      personId: info.sub ?? null,
      name: info.name ?? null,
      picture: info.picture ?? null,
      email: info.email ?? null,
    };
  });

async function uploadImage(personUrn: string, bytes: ArrayBuffer, contentType: string) {
  const registered = (await gatewayJson("/v2/assets?action=registerUpload", {
    method: "POST",
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
        owner: personUrn,
        serviceRelationships: [
          { relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" },
        ],
      },
    }),
  })) as {
    value?: {
      asset?: string;
      uploadMechanism?: Record<string, { uploadUrl?: string }>;
    };
  };

  const asset = registered.value?.asset;
  const mechanism = registered.value?.uploadMechanism ?? {};
  const uploadUrl = Object.values(mechanism)[0]?.uploadUrl;
  if (!asset || !uploadUrl) throw new Error("LinkedIn did not accept the image upload request.");

  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: bytes,
  });
  if (!put.ok) {
    const text = await put.text();
    console.error(`LinkedIn image upload failed [${put.status}]: ${text}`);
    throw new Error(`The image could not be uploaded to LinkedIn [${put.status}].`);
  }

  return asset;
}

/** Publish a draft (text, optionally with the uploaded image) to LinkedIn. */
export const publishDraftToLinkedIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: draft, error } = await supabase
      .from("content_drafts")
      .select("id, title, full_post, hook, body, cta, closing, hashtags, image_path, linkedin_post_id")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    if (draft.linkedin_post_id) throw new Error("This draft has already been posted to LinkedIn.");

    const hashtags = Array.isArray(draft.hashtags) ? (draft.hashtags as string[]) : [];
    const tagLine = hashtags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)).join(" ");
    const base =
      draft.full_post?.trim() ||
      [draft.hook, draft.body, draft.cta, draft.closing].filter(Boolean).join("\n\n");
    const commentary = [base, tagLine].filter(Boolean).join("\n\n").trim();
    if (!commentary) throw new Error("There is nothing written in this draft yet.");

    const identity = (await gatewayJson("/v2/userinfo")) as { sub?: string };
    if (!identity.sub) throw new Error("Could not read your LinkedIn profile.");
    const personUrn = `urn:li:person:${identity.sub}`;

    let asset: string | null = null;
    if (draft.image_path) {
      const file = await supabase.storage.from("post-images").download(draft.image_path);
      if (file.error || !file.data) throw new Error("The attached image could not be read.");
      const bytes = await file.data.arrayBuffer();
      asset = await uploadImage(personUrn, bytes, file.data.type || "image/png");
    }

    const posted = (await gatewayJson("/v2/ugcPosts", {
      method: "POST",
      body: JSON.stringify({
        author: personUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: commentary },
            shareMediaCategory: asset ? "IMAGE" : "NONE",
            ...(asset
              ? {
                  media: [
                    {
                      status: "READY",
                      media: asset,
                      ...(draft.title ? { title: { text: draft.title.slice(0, 200) } } : {}),
                    },
                  ],
                }
              : {}),
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    })) as { id?: string };

    const postId = posted.id ?? null;
    const publishedAt = new Date().toISOString();

    await supabase
      .from("content_drafts")
      .update({
        status: "published",
        linkedin_post_id: postId,
        linkedin_published_at: publishedAt,
        published_at: publishedAt,
      } as never)
      .eq("id", data.id);

    return {
      postId,
      url: postId ? `https://www.linkedin.com/feed/update/${postId}/` : null,
    };
  });
