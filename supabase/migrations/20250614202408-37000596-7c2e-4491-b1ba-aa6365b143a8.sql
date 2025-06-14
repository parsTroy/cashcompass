
-- Enable RLS on existing tables (ignore if already enabled)
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own budget categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Users can create their own budget categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Users can update their own budget categories" ON public.budget_categories;
DROP POLICY IF EXISTS "Users can delete their own budget categories" ON public.budget_categories;

DROP POLICY IF EXISTS "Users can view their own user settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own user settings" ON public.user_settings;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create RLS policies for budget_categories
CREATE POLICY "Users can view their own budget categories" 
  ON public.budget_categories 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget categories" 
  ON public.budget_categories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget categories" 
  ON public.budget_categories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget categories" 
  ON public.budget_categories 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own user settings" 
  ON public.user_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own user settings" 
  ON public.user_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);
