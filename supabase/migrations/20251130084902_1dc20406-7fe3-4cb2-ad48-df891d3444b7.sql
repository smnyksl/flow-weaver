-- Add user_id to journal_entries
ALTER TABLE public.journal_entries 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Drop old permissive journal_entries policies
DROP POLICY IF EXISTS "Allow public read journal_entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Allow public insert journal_entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Allow public update journal_entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Allow public delete journal_entries" ON public.journal_entries;

-- Create user-specific journal_entries policies
CREATE POLICY "Users can view their own entries" 
ON public.journal_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries" 
ON public.journal_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" 
ON public.journal_entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" 
ON public.journal_entries FOR DELETE 
USING (auth.uid() = user_id);

-- Add user_id to user_stats
ALTER TABLE public.user_stats 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE;

-- Drop old user_stats policies
DROP POLICY IF EXISTS "Allow public read user_stats" ON public.user_stats;
DROP POLICY IF EXISTS "Allow public insert user_stats" ON public.user_stats;
DROP POLICY IF EXISTS "Allow public update user_stats" ON public.user_stats;

-- Create user-specific user_stats policies
CREATE POLICY "Users can view their own stats" 
ON public.user_stats FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" 
ON public.user_stats FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
ON public.user_stats FOR UPDATE 
USING (auth.uid() = user_id);

-- Add user_id to user_achievements
ALTER TABLE public.user_achievements 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old user_achievements policies
DROP POLICY IF EXISTS "Allow public read user_achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Allow public insert user_achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Allow public delete user_achievements" ON public.user_achievements;

-- Create user-specific user_achievements policies
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own achievements" 
ON public.user_achievements FOR DELETE 
USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();