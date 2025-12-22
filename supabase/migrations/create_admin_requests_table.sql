-- ============================================================================
-- Admin Requests Migration
-- Run this in Supabase SQL Editor
-- ============================================================================

-- STEP 1: Update the users role constraint to allow 'super_admin'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('student', 'admin', 'super_admin'));

-- STEP 2: Create the admin_requests table
CREATE TABLE IF NOT EXISTS admin_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    college TEXT,
    mobile TEXT,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT
);

-- STEP 3: Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON admin_requests(status);
CREATE INDEX IF NOT EXISTS idx_admin_requests_user_id ON admin_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_requests_email ON admin_requests(email);

-- STEP 4: Promote your email to super_admin (CHANGE THIS TO YOUR EMAIL!)
UPDATE users SET role = 'super_admin' WHERE email = 'aravindlalwork@gmail.com';

-- Verify it worked:
-- SELECT email, role FROM users WHERE email = 'aravindlalwork@gmail.com';
