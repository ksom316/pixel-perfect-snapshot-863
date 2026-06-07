CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

GRANT SELECT, INSERT, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments_select_own" ON public.enrollments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "enrollments_insert_own" ON public.enrollments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "enrollments_delete_own" ON public.enrollments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);