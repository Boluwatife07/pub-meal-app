-- Fix infinite recursion in RLS policies
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- Create better policies that don't cause recursion
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Set your account to admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'timilehinadeboye62@gmail.com';

-- Create some test accounts for different roles
INSERT INTO public.profiles (user_id, email, role, full_name) VALUES
(gen_random_uuid(), 'kitchen@test.com', 'kitchen', 'Kitchen Staff'),
(gen_random_uuid(), 'bar@test.com', 'bar', 'Bar Staff')
ON CONFLICT (user_id) DO NOTHING;