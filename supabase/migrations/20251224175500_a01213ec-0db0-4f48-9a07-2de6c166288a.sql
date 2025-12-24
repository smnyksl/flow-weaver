-- Create table for storing AI analyses
CREATE TABLE public.ai_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  emotional_journey TEXT NOT NULL,
  trigger_analysis TEXT NOT NULL,
  pattern_insights TEXT NOT NULL,
  weekly_narrative TEXT NOT NULL,
  wellbeing_summary TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own analyses" 
ON public.ai_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses" 
ON public.ai_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" 
ON public.ai_analyses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_ai_analyses_user_id ON public.ai_analyses(user_id);
CREATE INDEX idx_ai_analyses_created_at ON public.ai_analyses(created_at DESC);