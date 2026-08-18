CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT,
  professional_title TEXT,
  positioning TEXT,
  bio TEXT,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  expertise JSONB NOT NULL DEFAULT '[]'::jsonb,
  industries JSONB NOT NULL DEFAULT '[]'::jsonb,
  tone TEXT,
  writing_style TEXT,
  words_to_avoid JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  description TEXT,
  pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  industries JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferred_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.content_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name TEXT NOT NULL,
  description TEXT,
  objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.research_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  source_name TEXT,
  source_type TEXT,
  url TEXT,
  title TEXT,
  published_at TIMESTAMPTZ,
  summary TEXT,
  content TEXT,
  category TEXT,
  extracted_facts JSONB NOT NULL DEFAULT '[]'::jsonb,
  relevance_score NUMERIC,
  credibility_score NUMERIC,
  hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.content_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  research_item_id UUID REFERENCES public.research_items(id) ON DELETE SET NULL,
  audience_id UUID REFERENCES public.audiences(id) ON DELETE SET NULL,
  pillar_id UUID REFERENCES public.content_pillars(id) ON DELETE SET NULL,
  topic TEXT,
  why_it_matters TEXT,
  key_insight TEXT,
  supporting_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  statistics JSONB NOT NULL DEFAULT '[]'::jsonb,
  business_implication TEXT,
  suggested_angle TEXT,
  suggested_hook TEXT,
  recommended_format TEXT,
  relevance_score NUMERIC,
  timeliness_score NUMERIC,
  business_value_score NUMERIC,
  originality_score NUMERIC,
  evidence_score NUMERIC,
  overall_score NUMERIC,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  audience_id UUID REFERENCES public.audiences(id) ON DELETE SET NULL,
  pillar_id UUID REFERENCES public.content_pillars(id) ON DELETE SET NULL,
  topic TEXT,
  objective TEXT,
  format TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  opportunity_id UUID REFERENCES public.content_opportunities(id) ON DELETE SET NULL,
  draft_id UUID,
  visual_prompt_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  calendar_id UUID REFERENCES public.content_calendar(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES public.content_opportunities(id) ON DELETE SET NULL,
  title TEXT,
  hook TEXT,
  body TEXT,
  cta TEXT,
  closing TEXT,
  hashtags JSONB NOT NULL DEFAULT '[]'::jsonb,
  full_post TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  ai_model TEXT,
  generation_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  draft_id UUID NOT NULL REFERENCES public.content_drafts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  content TEXT,
  change_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.visual_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  draft_id UUID REFERENCES public.content_drafts(id) ON DELETE CASCADE,
  visual_type TEXT,
  concept TEXT,
  layout TEXT,
  required_elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  visual_text TEXT,
  style TEXT,
  aspect_ratio TEXT,
  gamma_prompt TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.gamma_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  visual_prompt_id UUID NOT NULL REFERENCES public.visual_prompts(id) ON DELETE CASCADE,
  gamma_generation_id TEXT,
  gamma_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  response JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.personal_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  title TEXT,
  story TEXT,
  lesson TEXT,
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  audiences JSONB NOT NULL DEFAULT '[]'::jsonb,
  pillars JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  title TEXT,
  client_or_project TEXT,
  problem TEXT,
  solution TEXT,
  technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
  results TEXT,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  lessons TEXT,
  industries JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.content_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  draft_id UUID NOT NULL REFERENCES public.content_drafts(id) ON DELETE CASCADE,
  published_at TIMESTAMPTZ,
  impressions INTEGER NOT NULL DEFAULT 0,
  reactions INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  reposts INTEGER NOT NULL DEFAULT 0,
  saves INTEGER NOT NULL DEFAULT 0,
  profile_visits INTEGER NOT NULL DEFAULT 0,
  followers_gained INTEGER NOT NULL DEFAULT 0,
  leads INTEGER NOT NULL DEFAULT 0,
  meetings_booked INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  workflow_name TEXT NOT NULL,
  run_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_calendar ADD CONSTRAINT content_calendar_draft_id_fkey FOREIGN KEY (draft_id) REFERENCES public.content_drafts(id) ON DELETE SET NULL;
ALTER TABLE public.content_calendar ADD CONSTRAINT content_calendar_visual_prompt_id_fkey FOREIGN KEY (visual_prompt_id) REFERENCES public.visual_prompts(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX research_items_user_hash_key ON public.research_items(user_id, hash) WHERE hash IS NOT NULL;
CREATE INDEX research_items_user_published_idx ON public.research_items(user_id, published_at DESC);
CREATE INDEX content_calendar_user_date_idx ON public.content_calendar(user_id, scheduled_date, status);
CREATE INDEX content_calendar_audience_idx ON public.content_calendar(audience_id);
CREATE INDEX content_calendar_pillar_idx ON public.content_calendar(pillar_id);
CREATE INDEX content_calendar_opportunity_idx ON public.content_calendar(opportunity_id);
CREATE INDEX content_calendar_draft_idx ON public.content_calendar(draft_id);
CREATE INDEX content_calendar_visual_idx ON public.content_calendar(visual_prompt_id);
CREATE INDEX content_opportunities_user_status_idx ON public.content_opportunities(user_id, status, overall_score DESC);
CREATE INDEX content_opportunities_research_idx ON public.content_opportunities(research_item_id);
CREATE INDEX content_drafts_user_status_idx ON public.content_drafts(user_id, status);
CREATE INDEX content_drafts_calendar_idx ON public.content_drafts(calendar_id);
CREATE INDEX content_drafts_opportunity_idx ON public.content_drafts(opportunity_id);
CREATE INDEX content_versions_draft_idx ON public.content_versions(draft_id, version_number);
CREATE INDEX visual_prompts_draft_idx ON public.visual_prompts(draft_id);
CREATE INDEX gamma_generations_visual_idx ON public.gamma_generations(visual_prompt_id);
CREATE INDEX content_analytics_draft_idx ON public.content_analytics(draft_id);
CREATE INDEX automation_runs_user_date_idx ON public.automation_runs(user_id, run_date DESC);

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['brand_profiles','audiences','content_pillars','content_calendar','research_items','content_opportunities','content_drafts','content_versions','visual_prompts','gamma_generations','personal_stories','case_studies','content_analytics','automation_runs'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated;', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role;', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('CREATE POLICY "Users manage own %1$s" ON public.%1$I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['brand_profiles','audiences','content_pillars','content_calendar','content_drafts','gamma_generations','personal_stories','case_studies'] LOOP
    EXECUTE format('CREATE TRIGGER set_%1$s_updated_at BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t);
  END LOOP;
END $$;