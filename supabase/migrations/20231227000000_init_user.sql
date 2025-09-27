-- Create users table with comprehensive profile fields
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  twitter_handle TEXT,
  github_handle TEXT,
  linkedin_handle TEXT,
  role TEXT,
  company TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'senior', 'expert')),
  primary_interests TEXT[],
  favorite_tools TEXT[],
  profile_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  billing_address JSONB,
  payment_method JSONB,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
) TABLESPACE pg_default;

-- Claims management function (needed for RLS policies)
CREATE OR REPLACE FUNCTION is_claims_admin() RETURNS BOOLEAN
LANGUAGE plpgsql AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'claims_admin' = 'true';
END;
$$;

-- Create the bucket for user avatars
DO $$
BEGIN
    -- Check if bucket already exists
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'avatars'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('avatars', 'avatars', true);
        RAISE NOTICE 'Created storage bucket: avatars';
    ELSE
        RAISE NOTICE 'Storage bucket avatars already exists, skipping creation';
    END IF;
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'Could not create storage bucket - insufficient privileges. This may need to be done manually in the Supabase dashboard.';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating storage bucket: %', SQLERRM;
END
$$;

-- Create the bucket for product logos
DO $$
BEGIN
    -- Check if bucket already exists
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'product-logos'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('product-logos', 'product-logos', true);
        RAISE NOTICE 'Created storage bucket: product-logos';
    ELSE
        RAISE NOTICE 'Storage bucket product-logos already exists, skipping creation';
    END IF;
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'Could not create storage bucket - insufficient privileges. This may need to be done manually in the Supabase dashboard.';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating storage bucket: %', SQLERRM;
END
$$;

-- Enable Row Level Security for storage.objects table if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on storage.objects table';
    ELSE
        RAISE NOTICE 'RLS already enabled on storage.objects table';
    END IF;
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'Could not enable RLS on storage.objects - insufficient privileges. This may need to be done manually.';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error enabling RLS on storage.objects: %', SQLERRM;
END
$$;

-- Create storage policies for the avatars bucket with public access
DO $$
BEGIN
    -- Allow public read access to all avatars
    CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
        FOR SELECT TO public USING (bucket_id = 'avatars');
    
    -- Allow anyone to upload avatars (public upload for sign-up)
    CREATE POLICY "Anyone can upload an avatar" ON storage.objects
        FOR INSERT TO public WITH CHECK (bucket_id = 'avatars');
    
    -- Allow anyone to update avatars (public update)
    CREATE POLICY "Anyone can update avatars" ON storage.objects
        FOR UPDATE TO public USING (bucket_id = 'avatars');
    
    -- Allow anyone to delete avatars (public delete)
    CREATE POLICY "Anyone can delete avatars" ON storage.objects
        FOR DELETE TO public USING (bucket_id = 'avatars');
        
    RAISE NOTICE 'Created storage policies for avatars bucket';
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'Could not create storage policies - insufficient privileges. These may need to be created manually.';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating storage policies: %', SQLERRM;
END
$$;

-- Create storage policies for the product-logos bucket
DO $$
BEGIN
    -- Drop existing policies for product-logos bucket if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'select product product-logos') THEN
        DROP POLICY "select product product-logos" ON storage.objects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'insert product product-logos') THEN
        DROP POLICY "insert product product-logos" ON storage.objects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'update product product-logos') THEN
        DROP POLICY "update product product-logos" ON storage.objects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'delete product product-logos') THEN
        DROP POLICY "delete product product-logos" ON storage.objects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'public read product-logos') THEN
        DROP POLICY "public read product-logos" ON storage.objects;
    END IF;
    
    -- Create new policies for the product-logos bucket
    CREATE POLICY "select product product-logos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'product-logos');
    CREATE POLICY "insert product product-logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-logos');
    CREATE POLICY "update product product-logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-logos');
    CREATE POLICY "delete product product-logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-logos');
    CREATE POLICY "public read product-logos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'product-logos');
    
    RAISE NOTICE 'Created storage policies for product-logos bucket';
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'Could not create storage policies - insufficient privileges. These may need to be created manually.';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating storage policies: %', SQLERRM;
END
$$;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Remove existing policies if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Can view own user data') THEN
        DROP POLICY "Can view own user data" ON public.users;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Can update own user data') THEN
        DROP POLICY "Can update own user data" ON public.users;
    END IF;
END
$$;

-- Create new policies for users table
CREATE POLICY "Can view own user data" ON public.users FOR SELECT
  USING (auth.uid() = id OR is_claims_admin());

CREATE POLICY "Can update own user data" ON public.users FOR UPDATE
  USING (auth.uid() = id OR is_claims_admin());

CREATE POLICY "Admin select all users" ON public.users FOR SELECT
  USING (is_claims_admin());

CREATE POLICY "Admin insert all users" ON public.users FOR INSERT
  WITH CHECK (is_claims_admin());

CREATE POLICY "Admin update all users" ON public.users FOR UPDATE
  USING (is_claims_admin());

CREATE POLICY "Admin delete all users" ON public.users FOR DELETE
  USING (is_claims_admin());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_experience_level ON public.users (experience_level);
CREATE INDEX IF NOT EXISTS idx_users_primary_interests ON public.users USING GIN (primary_interests);
CREATE INDEX IF NOT EXISTS idx_users_favorite_tools ON public.users USING GIN (favorite_tools);
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON public.users (profile_completed);

-- Function to check if there are any existing admin users
CREATE OR REPLACE FUNCTION public.has_admin_users()
RETURNS BOOLEAN AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM auth.users
  WHERE raw_app_meta_data->>'claims_admin' = 'true';
  
  RETURN admin_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function and trigger for handling new user with auto-admin logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into public.users table with all profile fields
  INSERT INTO public.users (
    id, 
    full_name, 
    avatar_url,
    bio,
    location,
    website,
    twitter_handle,
    github_handle,
    linkedin_handle,
    role,
    company,
    experience_level,
    primary_interests,
    favorite_tools,
    profile_completed
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'bio',
    NEW.raw_user_meta_data->>'location',
    NEW.raw_user_meta_data->>'website',
    NEW.raw_user_meta_data->>'twitter_handle',
    NEW.raw_user_meta_data->>'github_handle',
    NEW.raw_user_meta_data->>'linkedin_handle',
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'company',
    NEW.raw_user_meta_data->>'experience_level',
    CASE 
      WHEN NEW.raw_user_meta_data->>'primary_interests' IS NOT NULL 
      THEN string_to_array(NEW.raw_user_meta_data->>'primary_interests', ',')
      ELSE NULL
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'favorite_tools' IS NOT NULL 
      THEN string_to_array(NEW.raw_user_meta_data->>'favorite_tools', ',')
      ELSE NULL
    END,
    COALESCE((NEW.raw_user_meta_data->>'profile_completed')::boolean, false)
  );
  
  -- Auto-promote first user to admin if no admin users exist
  IF NOT public.has_admin_users() THEN
    -- Update the user's metadata to include admin claim
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('claims_admin', 'true')
    WHERE id = NEW.id;
    
    -- Log that we've promoted the first user
    RAISE NOTICE 'Auto-promoted first user % to admin', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set admin role for a user (sets claims_admin in app_metadata)
CREATE OR REPLACE FUNCTION public.set_user_admin(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = 
    raw_app_meta_data || 
    jsonb_build_object('claims_admin', 'true')
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove admin role from a user
CREATE OR REPLACE FUNCTION public.remove_user_admin(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data - 'claims_admin'
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT (raw_app_meta_data->>'claims_admin')::BOOLEAN INTO is_admin
  FROM auth.users
  WHERE id = user_id;
  
  RETURN COALESCE(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION get_profile_completion_percentage(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  completion_count INTEGER := 0;
  total_fields INTEGER := 12; -- Total number of profile fields we're tracking
BEGIN
  SELECT 
    (CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 1 ELSE 0 END) +
    (CASE WHEN avatar_url IS NOT NULL AND avatar_url != '' THEN 1 ELSE 0 END) +
    (CASE WHEN bio IS NOT NULL AND bio != '' THEN 1 ELSE 0 END) +
    (CASE WHEN location IS NOT NULL AND location != '' THEN 1 ELSE 0 END) +
    (CASE WHEN website IS NOT NULL AND website != '' THEN 1 ELSE 0 END) +
    (CASE WHEN twitter_handle IS NOT NULL AND twitter_handle != '' THEN 1 ELSE 0 END) +
    (CASE WHEN github_handle IS NOT NULL AND github_handle != '' THEN 1 ELSE 0 END) +
    (CASE WHEN linkedin_handle IS NOT NULL AND linkedin_handle != '' THEN 1 ELSE 0 END) +
    (CASE WHEN role IS NOT NULL AND role != '' THEN 1 ELSE 0 END) +
    (CASE WHEN company IS NOT NULL AND company != '' THEN 1 ELSE 0 END) +
    (CASE WHEN experience_level IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN primary_interests IS NOT NULL AND array_length(primary_interests, 1) > 0 THEN 1 ELSE 0 END)
  INTO completion_count
  FROM public.users 
  WHERE id = user_id;
  
  RETURN ROUND((completion_count::FLOAT / total_fields::FLOAT) * 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark profile as completed when user fills in required fields
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if profile has minimum required fields completed
  IF NEW.full_name IS NOT NULL 
     AND NEW.avatar_url IS NOT NULL 
     AND NEW.bio IS NOT NULL 
     AND NEW.role IS NOT NULL 
     AND NEW.experience_level IS NOT NULL THEN
    NEW.profile_completed = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's submitted products count
CREATE OR REPLACE FUNCTION get_user_products_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM public.products 
    WHERE user_id = user_uuid AND approved = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update trigger for users updated_at field
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER trigger_update_profile_completion
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_profile_completion();

CREATE TRIGGER trigger_update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.has_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin(UUID) TO authenticated;

-- Claims management functions
CREATE OR REPLACE FUNCTION set_claim(uid UUID, claim TEXT, value JSONB) RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT is_claims_admin() THEN
      RETURN 'error: access denied';
  ELSE        
    UPDATE auth.users SET raw_app_meta_data = 
      raw_app_meta_data || 
        json_build_object(claim, value)::jsonb WHERE id = uid;
    RETURN 'OK';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION get_claims(uid UUID) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE retval JSONB;
BEGIN
  IF NOT is_claims_admin() THEN
      RETURN '{"error":"access denied"}'::jsonb;
  ELSE
    SELECT raw_app_meta_data FROM auth.users INTO retval WHERE id = uid::uuid;
    RETURN retval;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION delete_claim(uid UUID, claim TEXT) RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT is_claims_admin() THEN
      RETURN 'error: access denied';
  ELSE        
    UPDATE auth.users SET raw_app_meta_data = 
      raw_app_meta_data - claim WHERE id = uid;
    RETURN 'OK';
  END IF;
END;
$$;

-- Create admin role and grant privileges
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
        CREATE ROLE admin;
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO admin;

-- Add comments for clarity
COMMENT ON COLUMN public.users.experience_level IS 'User experience level: beginner, intermediate, senior, expert';
COMMENT ON COLUMN public.users.primary_interests IS 'Array of user primary interests/areas of focus';
COMMENT ON COLUMN public.users.favorite_tools IS 'Array of user favorite tools and technologies';
COMMENT ON COLUMN public.users.profile_completed IS 'Whether user has completed minimum profile requirements';
COMMENT ON COLUMN public.users.onboarding_completed IS 'Whether user has completed the onboarding flow';
COMMENT ON FUNCTION public.handle_new_user() IS 
'Handles new user creation and automatically promotes the first registered user to admin. This eliminates the need for manual admin setup during initial deployment.';
COMMENT ON FUNCTION public.has_admin_users() IS 
'Checks if there are any existing admin users in the system. Used by auto-promotion logic.';
