-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create user_flows table for saved diagrams
CREATE TABLE public.user_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  query TEXT NOT NULL,
  data JSONB NOT NULL,
  breadcrumbs JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{"theme": "default", "nodeAlign": "justify", "linkOpacity": 0.5}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT false,
  share_slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_flows
ALTER TABLE public.user_flows ENABLE ROW LEVEL SECURITY;

-- Users can view their own flows
CREATE POLICY "Users can view their own flows" 
ON public.user_flows FOR SELECT 
USING (auth.uid() = user_id);

-- Public flows are viewable by anyone
CREATE POLICY "Public flows are viewable by anyone" 
ON public.user_flows FOR SELECT 
USING (is_public = true);

-- Users can insert their own flows
CREATE POLICY "Users can insert their own flows" 
ON public.user_flows FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own flows
CREATE POLICY "Users can update their own flows" 
ON public.user_flows FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own flows
CREATE POLICY "Users can delete their own flows" 
ON public.user_flows FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_flows_updated_at
BEFORE UPDATE ON public.user_flows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Create index for share_slug lookups
CREATE INDEX idx_user_flows_share_slug ON public.user_flows(share_slug) WHERE share_slug IS NOT NULL;
CREATE INDEX idx_user_flows_user_id ON public.user_flows(user_id);