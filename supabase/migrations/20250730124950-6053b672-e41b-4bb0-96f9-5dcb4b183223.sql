-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Profile owner access" 
ON public.profiles FOR ALL 
USING (auth.uid() = user_id);

-- Set your account to admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'timilehinadeboye62@gmail.com';