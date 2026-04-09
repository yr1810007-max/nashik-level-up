
-- Course steps (micro-steps within lessons)
CREATE TABLE public.course_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  why_important TEXT,
  expected_output TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  step_type TEXT NOT NULL DEFAULT 'concept',
  code_snippet TEXT,
  video_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.course_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Steps viewable by everyone" ON public.course_steps FOR SELECT USING (true);

-- Course components (hardware parts with purchase info)
CREATE TABLE public.course_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_inr NUMERIC NOT NULL DEFAULT 0,
  purpose TEXT,
  image_url TEXT,
  amazon_link TEXT,
  flipkart_link TEXT,
  other_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.course_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Components viewable by everyone" ON public.course_components FOR SELECT USING (true);

-- Confidence assessment questions per course
CREATE TABLE public.confidence_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.confidence_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Confidence questions viewable by everyone" ON public.confidence_questions FOR SELECT USING (true);

-- User confidence scores (before & after)
CREATE TABLE public.confidence_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  score_before NUMERIC,
  score_after NUMERIC,
  answers_before JSONB DEFAULT '[]',
  answers_after JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);
ALTER TABLE public.confidence_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own confidence scores" ON public.confidence_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own confidence scores" ON public.confidence_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own confidence scores" ON public.confidence_scores FOR UPDATE USING (auth.uid() = user_id);

-- Step quizzes (questions after each step)
CREATE TABLE public.step_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_id UUID NOT NULL REFERENCES public.course_steps(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.step_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Step quizzes viewable by everyone" ON public.step_quizzes FOR SELECT USING (true);

-- User step progress
CREATE TABLE public.user_step_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  step_id UUID NOT NULL REFERENCES public.course_steps(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, step_id)
);
ALTER TABLE public.user_step_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own step progress" ON public.user_step_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own step progress" ON public.user_step_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own step progress" ON public.user_step_progress FOR UPDATE USING (auth.uid() = user_id);

-- User quiz results
CREATE TABLE public.user_quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.step_quizzes(id) ON DELETE CASCADE,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, quiz_id)
);
ALTER TABLE public.user_quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own quiz results" ON public.user_quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz results" ON public.user_quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quiz results" ON public.user_quiz_results FOR UPDATE USING (auth.uid() = user_id);
