-- Supabase rpc function to check if user has email. 
create or replace function get_user_id_by_email(user_email text) returns uuid
as $$
  declare
  user_id uuid;
begin
  select id 
  from auth.users 
  where email = user_email 
  into user_id;

  return user_id;
end;
$$ language plpgsql security invoker;

-- Analytics functions for metrics
CREATE OR REPLACE FUNCTION public.get_tag_metrics()
RETURNS TABLE(month TEXT, total BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT TO_CHAR(created_at, 'Mon') AS month, COUNT(*) AS total
  FROM tags
  GROUP BY TO_CHAR(created_at, 'Mon')
  ORDER BY TO_CHAR(created_at, 'Mon');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_label_metrics()
RETURNS TABLE(month TEXT, total BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT TO_CHAR(created_at, 'Mon') AS month, COUNT(*) AS total
  FROM labels
  GROUP BY TO_CHAR(created_at, 'Mon')
  ORDER BY TO_CHAR(created_at, 'Mon');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_category_metrics()
RETURNS TABLE(month TEXT, total BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT TO_CHAR(created_at, 'Mon') AS month, COUNT(*) AS total
  FROM categories
  GROUP BY TO_CHAR(created_at, 'Mon')
  ORDER BY TO_CHAR(created_at, 'Mon');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_product_metrics()
RETURNS TABLE(month TEXT, total BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT TO_CHAR(created_at, 'Mon') AS month, COUNT(*) AS total
  FROM products
  GROUP BY TO_CHAR(created_at, 'Mon')
  ORDER BY TO_CHAR(created_at, 'Mon');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_user_metrics()
RETURNS TABLE(month TEXT, total BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT TO_CHAR(created_at, 'Mon') AS month, COUNT(*) AS total
  FROM users
  GROUP BY TO_CHAR(created_at, 'Mon')
  ORDER BY TO_CHAR(created_at, 'Mon');
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON auth.users TO service_role;

-- Grant execute permissions for functions
DO
$$
DECLARE
    pg_role record;
BEGIN
  FOR pg_role IN SELECT rolname FROM pg_roles
  LOOP 
    EXECUTE 'REVOKE ALL ON FUNCTION "public"."get_user_id_by_email" FROM ' || quote_ident(pg_role.rolname);
  END LOOP;
  GRANT EXECUTE ON FUNCTION "public"."get_user_id_by_email" TO service_role;
END
$$;

