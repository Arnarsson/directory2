-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NULL DEFAULT timezone('utc'::text, now()),
  full_name TEXT, -- Made nullable since populated from user profiles
  email TEXT, -- Made nullable since populated from user profiles
  twitter_handle TEXT, -- Made nullable since populated from user profiles
  product_website TEXT NOT NULL,
  codename TEXT NOT NULL,
  punchline TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_src TEXT NULL,
  user_id UUID NOT NULL, -- Required for all products
  tags TEXT[] NULL,
  view_count INTEGER DEFAULT 0,
  approved BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  labels TEXT[] NULL,
  categories TEXT NULL,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_slug_key UNIQUE (codename),
  CONSTRAINT products_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
) TABLESPACE pg_default;

-- Create product_views table
CREATE TABLE public.product_views (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT product_views_pkey PRIMARY KEY (id),
  CONSTRAINT product_views_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products (id)
) TABLESPACE pg_default;

-- Create filter tables for product categorization
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

CREATE TABLE public.labels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT labels_pkey PRIMARY KEY (id)
);

CREATE TABLE public.tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT tags_pkey PRIMARY KEY (id)
);

-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  CONSTRAINT bookmarks_pkey PRIMARY KEY (id),
  CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT bookmarks_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products (id) ON DELETE CASCADE,
  CONSTRAINT bookmarks_unique_user_product UNIQUE (user_id, product_id)
) TABLESPACE pg_default;

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Function to increment product view count
CREATE OR REPLACE FUNCTION increment_product_view_count(product_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.product_views (product_id) VALUES (product_id);
END;
$$ LANGUAGE plpgsql;

-- Function to update product view count
CREATE OR REPLACE FUNCTION update_product_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET view_count = (
    SELECT COUNT(*) FROM public.product_views WHERE product_id = NEW.product_id
  )
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product view count
CREATE TRIGGER trigger_update_product_view_count
AFTER INSERT ON public.product_views
FOR EACH ROW
EXECUTE FUNCTION update_product_view_count();

-- Policies for row level security
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Can view own products') THEN
        DROP POLICY "Can view own products" ON public.products;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Can insert own products') THEN
        DROP POLICY "Can insert own products" ON public.products;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Can update own products') THEN
        DROP POLICY "Can update own products" ON public.products;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Can delete own products') THEN
        DROP POLICY "Can delete own products" ON public.products;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Public can view products') THEN
        DROP POLICY "Public can view products" ON public.products;
    END IF;
END
$$;

-- Drop existing product_views policies if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'product_views' AND policyname = 'Anyone can insert product views') THEN
        DROP POLICY "Anyone can insert product views" ON public.product_views;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'product_views' AND policyname = 'Anyone can view product views') THEN
        DROP POLICY "Anyone can view product views" ON public.product_views;
    END IF;
END
$$;

-- Create product_views policies
CREATE POLICY "Anyone can insert product views" ON public.product_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view product views" ON public.product_views FOR SELECT
  USING (true);

-- Create bookmarks policies
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Admin policies for bookmarks
CREATE POLICY "Admin select all bookmarks" ON public.bookmarks FOR SELECT
  USING (is_claims_admin());

CREATE POLICY "Admin insert all bookmarks" ON public.bookmarks FOR INSERT
  WITH CHECK (is_claims_admin());

CREATE POLICY "Admin update all bookmarks" ON public.bookmarks FOR UPDATE
  USING (is_claims_admin());

CREATE POLICY "Admin delete all bookmarks" ON public.bookmarks FOR DELETE
  USING (is_claims_admin());

-- Create products policies
CREATE POLICY "Public can view approved products" ON public.products FOR SELECT
  USING (approved = true OR auth.uid() = user_id OR is_claims_admin());

CREATE POLICY "Can view own products" ON public.products FOR SELECT
  USING (auth.uid() = user_id OR is_claims_admin());

CREATE POLICY "Can insert own products" ON public.products FOR INSERT
  WITH CHECK (auth.uid() = user_id OR is_claims_admin());

CREATE POLICY "Can update own products" ON public.products FOR UPDATE
  USING (auth.uid() = user_id OR is_claims_admin());

CREATE POLICY "Can delete own products" ON public.products FOR DELETE
  USING (auth.uid() = user_id OR is_claims_admin());

CREATE POLICY "Admin select all products" ON public.products FOR SELECT
  USING (is_claims_admin());

CREATE POLICY "Admin insert all products" ON public.products FOR INSERT
  WITH CHECK (is_claims_admin());

CREATE POLICY "Admin update all products" ON public.products FOR UPDATE
  USING (is_claims_admin());

CREATE POLICY "Admin delete all products" ON public.products FOR DELETE
  USING (is_claims_admin());

-- Indexes for performance improvement
CREATE INDEX idx_products_categories ON public.products (categories);
CREATE INDEX idx_products_tags ON public.products USING GIN (tags);
CREATE INDEX idx_products_labels ON public.products USING GIN (labels);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products (user_id);
CREATE INDEX idx_bookmarks_user_id ON public.bookmarks (user_id);
CREATE INDEX idx_bookmarks_product_id ON public.bookmarks (product_id);

-- Grant necessary permissions to the increment function
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.product_views TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_product_view_count(UUID) TO anon, authenticated;

-- Add function to get user's products count
CREATE OR REPLACE FUNCTION get_user_products_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM public.products 
    WHERE user_id = user_uuid AND approved = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get user's submitted products
CREATE OR REPLACE FUNCTION get_user_products(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  codename TEXT,
  punchline TEXT,
  description TEXT,
  logo_src TEXT,
  categories TEXT,
  approved BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.codename,
    p.punchline,
    p.description,
    p.logo_src,
    p.categories,
    p.approved,
    p.created_at
  FROM public.products p
  WHERE p.user_id = user_uuid
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bookmark-related functions
CREATE OR REPLACE FUNCTION is_product_bookmarked(product_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bookmarks 
    WHERE product_id = product_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_bookmark_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM public.bookmarks 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments to clarify the new behavior
COMMENT ON COLUMN public.products.full_name IS 'User full name - populated from user profile or auth metadata';
COMMENT ON COLUMN public.products.email IS 'User email - populated from user profile or auth metadata';
COMMENT ON COLUMN public.products.twitter_handle IS 'User Twitter handle - populated from user profile or auth metadata';
COMMENT ON COLUMN public.products.user_id IS 'References auth.users(id) - required for all products';
