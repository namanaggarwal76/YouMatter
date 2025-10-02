-- Disable Row Level Security on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop the policies we created
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Remove the restrictive permissions (this will revert to default permissions)
-- Note: You might need to adjust these based on your original setup
REVOKE ALL ON public.users FROM authenticated;
REVOKE ALL ON public.users FROM anon;

-- Grant basic permissions that should work for your app
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO anon;