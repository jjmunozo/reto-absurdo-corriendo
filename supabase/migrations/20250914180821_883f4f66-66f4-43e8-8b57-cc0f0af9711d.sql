-- Fix security vulnerability: Restrict access to support_registrations table
-- Remove public read access and create secure public functions for necessary data

-- 1. Drop the existing public read policy
DROP POLICY IF EXISTS "Anyone can view support registrations" ON public.support_registrations;

-- 2. Create a secure function to get public registration stats (count + recent names only)
CREATE OR REPLACE FUNCTION public.get_public_registration_stats()
RETURNS JSON AS $$
DECLARE
  total_count INTEGER;
  recent_names TEXT[];
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total_count FROM public.support_registrations;
  
  -- Get last 5 supporter names only (no personal info)
  SELECT ARRAY(
    SELECT full_name 
    FROM public.support_registrations 
    ORDER BY created_at DESC 
    LIMIT 5
  ) INTO recent_names;
  
  -- Return as JSON object
  RETURN json_build_object(
    'total_count', total_count,
    'recent_names', recent_names
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Create admin-only policy for full access (for future admin functionality)
CREATE POLICY "Admins can view all registrations" ON public.support_registrations
FOR SELECT USING (false); -- Will be updated when admin roles are implemented

-- 4. Keep the insert policy for new registrations
-- (The existing "Anyone can create support registrations" policy remains active)

-- 5. Grant execute permission on the public function
GRANT EXECUTE ON FUNCTION public.get_public_registration_stats() TO authenticated, anon;