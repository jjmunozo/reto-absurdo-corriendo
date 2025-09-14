-- Create a new RLS policy to allow public read access to non-sensitive fields
CREATE POLICY "Public can view registration data" 
ON public.support_registrations 
FOR SELECT 
USING (true);