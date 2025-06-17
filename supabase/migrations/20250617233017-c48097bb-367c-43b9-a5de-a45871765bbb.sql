
-- Enable Row Level Security on strava_activities table
ALTER TABLE public.strava_activities ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on strava_connections table
ALTER TABLE public.strava_connections ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on manual_runs table (if not already enabled)
ALTER TABLE public.manual_runs ENABLE ROW LEVEL SECURITY;

-- Create public read-only policy for strava_activities (needed for the app to display data)
CREATE POLICY "Public can view strava activities" 
ON public.strava_activities 
FOR SELECT 
USING (true);

-- Create restrictive policies for strava_connections (sensitive data)
-- Only allow system/service operations (no public access)
CREATE POLICY "Only system can access strava connections" 
ON public.strava_connections 
FOR ALL 
USING (false);

-- Create public read-only policy for manual_runs (needed for the app to display data)
CREATE POLICY "Public can view manual runs" 
ON public.manual_runs 
FOR SELECT 
USING (true);

-- Restrict write operations on manual_runs to prevent unauthorized modifications
-- (You can adjust this later if you need authenticated users to add runs)
CREATE POLICY "No public insert on manual runs" 
ON public.manual_runs 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "No public update on manual runs" 
ON public.manual_runs 
FOR UPDATE 
USING (false);

CREATE POLICY "No public delete on manual runs" 
ON public.manual_runs 
FOR DELETE 
USING (false);
