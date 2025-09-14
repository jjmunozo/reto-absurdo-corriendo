-- Enable real-time updates for support_registrations table
ALTER TABLE public.support_registrations REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_registrations;