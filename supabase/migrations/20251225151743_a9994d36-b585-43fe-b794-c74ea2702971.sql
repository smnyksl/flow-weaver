-- Add theme_color column to user_preferences
ALTER TABLE public.user_preferences 
ADD COLUMN theme_color text DEFAULT 'purple';