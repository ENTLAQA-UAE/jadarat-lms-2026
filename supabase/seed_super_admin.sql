-- ============================================
-- Seed Super Admin: m.ibrahem@entlaqa.com
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Step 1: Create a platform-level organization (for super admin only)
INSERT INTO public.organization (domain)
VALUES ('platform.jadarat.com')
ON CONFLICT (domain) DO NOTHING;

-- Step 2: Create the auth user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'm.ibrahem@entlaqa.com',
  crypt('Entlaqa@456#Z', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Mohammad Ibrahem"}',
  now(),
  now(),
  '',
  ''
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Step 3: Create the public.users record (super admin under platform org)
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  is_active,
  organization_id,
  organization_domain
)
SELECT
  au.id,
  'm.ibrahem@entlaqa.com',
  'Mohammad Ibrahem',
  'superAdmin',
  true,
  o.id,
  'platform.jadarat.com'
FROM auth.users au
CROSS JOIN public.organization o
WHERE au.email = 'm.ibrahem@entlaqa.com'
  AND o.domain = 'platform.jadarat.com'
ON CONFLICT (id) DO NOTHING;

-- Step 4: Create identities record (required for email/password login)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  au.id,
  au.id,
  au.email,
  jsonb_build_object('sub', au.id::text, 'email', au.email),
  'email',
  now(),
  now(),
  now()
FROM auth.users au
WHERE au.email = 'm.ibrahem@entlaqa.com'
ON CONFLICT (provider_id, provider) DO NOTHING;

-- Verify
SELECT 'Auth user created' AS step, au.id, au.email
FROM auth.users au WHERE au.email = 'm.ibrahem@entlaqa.com'
UNION ALL
SELECT 'Public user created', u.id, u.email
FROM public.users u WHERE u.email = 'm.ibrahem@entlaqa.com';
