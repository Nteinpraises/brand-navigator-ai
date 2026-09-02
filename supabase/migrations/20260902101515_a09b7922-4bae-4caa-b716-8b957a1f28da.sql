CREATE TABLE public.personal_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text,
  story text,
  lesson text,
  topics jsonb not null default '[]'::jsonb,
  audiences jsonb not null default '[]'::jsonb,
  pillars jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_stories TO authenticated;
GRANT ALL ON public.personal_stories TO service_role;
ALTER TABLE public.personal_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own stories" ON public.personal_stories FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX personal_stories_user_id_idx ON public.personal_stories(user_id);

CREATE TABLE public.case_studies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text,
  client_or_project text,
  problem text,
  solution text,
  technologies jsonb not null default '[]'::jsonb,
  results text,
  metrics jsonb not null default '{}'::jsonb,
  lessons text,
  industries jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_studies TO authenticated;
GRANT ALL ON public.case_studies TO service_role;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own case studies" ON public.case_studies FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX case_studies_user_id_idx ON public.case_studies(user_id);

CREATE TABLE public.content_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  draft_id uuid not null references public.content_drafts(id) on delete cascade,
  version_number integer not null default 1,
  content text,
  change_reason text,
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_versions TO authenticated;
GRANT ALL ON public.content_versions TO service_role;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own versions" ON public.content_versions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX content_versions_draft_id_idx ON public.content_versions(draft_id);
CREATE UNIQUE INDEX content_versions_draft_version_idx ON public.content_versions(draft_id, version_number);

CREATE TABLE public.gamma_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  visual_prompt_id uuid references public.visual_prompts(id) on delete cascade,
  calendar_id uuid references public.content_calendar(id) on delete set null,
  gamma_url text,
  export_url text,
  status text not null default 'pending',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gamma_generations TO authenticated;
GRANT ALL ON public.gamma_generations TO service_role;
ALTER TABLE public.gamma_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gamma generations" ON public.gamma_generations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX gamma_generations_visual_prompt_id_idx ON public.gamma_generations(visual_prompt_id);

ALTER TABLE public.content_analytics ADD COLUMN IF NOT EXISTS published_at timestamptz;
CREATE INDEX IF NOT EXISTS content_analytics_published_at_idx ON public.content_analytics(published_at);

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER personal_stories_set_updated_at BEFORE UPDATE ON public.personal_stories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER case_studies_set_updated_at BEFORE UPDATE ON public.case_studies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER gamma_generations_set_updated_at BEFORE UPDATE ON public.gamma_generations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();