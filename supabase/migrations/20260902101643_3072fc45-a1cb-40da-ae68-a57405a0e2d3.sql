ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_analytics TO authenticated;
GRANT ALL ON public.content_analytics TO service_role;
ALTER TABLE public.content_analytics ALTER COLUMN user_id SET DEFAULT auth.uid();
CREATE POLICY "Users manage own analytics" ON public.content_analytics FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.content_insights ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_insights TO authenticated;
GRANT ALL ON public.content_insights TO service_role;
ALTER TABLE public.content_insights ALTER COLUMN user_id SET DEFAULT auth.uid();
CREATE POLICY "Users manage own insights" ON public.content_insights FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);