-- Update handle_new_user trigger to validate display_name input
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  safe_display_name TEXT;
BEGIN
  -- Extract and sanitize display name
  safe_display_name := TRIM(COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    ''
  ));
  
  -- Enforce length limit (max 100 characters)
  IF LENGTH(safe_display_name) > 100 THEN
    safe_display_name := SUBSTRING(safe_display_name, 1, 100);
  END IF;
  
  -- Remove control characters (ASCII 0-31 and 127)
  safe_display_name := REGEXP_REPLACE(
    safe_display_name,
    '[\x00-\x1F\x7F]',
    '',
    'g'
  );
  
  -- Set default if empty after sanitization
  IF safe_display_name = '' THEN
    safe_display_name := NULL;
  END IF;
  
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, safe_display_name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add column constraint for display_name length
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'display_name_length_check'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT display_name_length_check 
    CHECK (display_name IS NULL OR LENGTH(display_name) <= 100);
  END IF;
END $$;