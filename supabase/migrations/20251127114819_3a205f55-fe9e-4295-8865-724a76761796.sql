-- Create journal_entries table
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  primary_emotion TEXT NOT NULL,
  intensity INTEGER NOT NULL DEFAULT 5,
  triggers TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table to track unlocked achievements
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_id TEXT NOT NULL UNIQUE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_stats table for storing persistent stats
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_points INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Allow public access (no auth required)
CREATE POLICY "Allow public read journal_entries" ON public.journal_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert journal_entries" ON public.journal_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update journal_entries" ON public.journal_entries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete journal_entries" ON public.journal_entries FOR DELETE USING (true);

CREATE POLICY "Allow public read user_achievements" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete user_achievements" ON public.user_achievements FOR DELETE USING (true);

CREATE POLICY "Allow public read user_stats" ON public.user_stats FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_stats" ON public.user_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update user_stats" ON public.user_stats FOR UPDATE USING (true);