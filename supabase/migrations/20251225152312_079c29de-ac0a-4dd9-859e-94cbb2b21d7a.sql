-- Add language column to user_preferences
ALTER TABLE public.user_preferences 
ADD COLUMN language text DEFAULT 'tr';