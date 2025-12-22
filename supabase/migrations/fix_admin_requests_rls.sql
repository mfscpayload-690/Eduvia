-- ============================================================================
-- FIX: Enable RLS on admin_requests table
-- Run this in Supabase SQL Editor to fix the security warning
-- ============================================================================

-- Step 1: Enable Row Level Security
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;

-- Step 2: Create policies

-- Policy 1: Users can view their OWN requests only
CREATE POLICY "Users can view own requests"
ON public.admin_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Users can create requests for themselves only  
CREATE POLICY "Users can create own requests"
ON public.admin_requests
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy 3: Service role (used by your app) bypasses all RLS automatically
-- No policy needed - service role key has full access by default

-- ============================================================================
-- IMPORTANT NOTE:
-- Your application uses SUPABASE_SERVICE_ROLE_KEY which BYPASSES RLS.
-- These policies protect against direct API access using the anon key.
-- The super admin check happens in your application code, not in RLS.
-- ============================================================================

-- Verify RLS is enabled (run this to check):
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_requests';
