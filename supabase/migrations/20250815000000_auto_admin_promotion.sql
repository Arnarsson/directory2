-- Migration: Auto-admin promotion and user admin status view
-- This migration adds the missing user_admin_status view that the seeding script requires

-- Create the user_admin_status view that shows all users with their admin status
CREATE OR REPLACE VIEW public.user_admin_status AS
SELECT 
    u.id,
    u.email,
    u.created_at,
    COALESCE(
        (u.raw_app_meta_data->>'claims_admin')::boolean, 
        false
    ) as is_admin,
    ROW_NUMBER() OVER (ORDER BY u.created_at) as user_number
FROM auth.users u
ORDER BY u.created_at;

-- Grant access to the view
GRANT SELECT ON public.user_admin_status TO authenticated;

-- Add comment for clarity
COMMENT ON VIEW public.user_admin_status IS 
'View showing all users with their admin status and registration order. Used by the seeding script to find admin users.';

-- Ensure the view is accessible
ALTER VIEW public.user_admin_status SET (security_invoker = false);
