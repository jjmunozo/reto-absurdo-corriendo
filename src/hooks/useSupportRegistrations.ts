import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SupportRegistration {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  participation_type: 'run' | 'moral_support';
  laps_count: number | null;
  motivation_message: string;
  registration_number: number;
  created_at: string;
}

export interface PublicRegistration {
  id: string;
  full_name: string;
  participation_type: 'run' | 'moral_support';
  laps_count: number | null;
  motivation_message: string;
  registration_number: number;
  created_at: string;
}

export interface NewRegistration {
  full_name: string;
  email: string;
  whatsapp: string;
  participation_type: 'run' | 'moral_support';
  laps_count: number | null;
  motivation_message: string;
}

export interface PublicRegistrationStats {
  total_count: number;
  recent_names: string[];
}

export function useSupportRegistrations() {
  const [registrations, setRegistrations] = useState<PublicRegistration[]>([]);
  const [publicStats, setPublicStats] = useState<PublicRegistrationStats>({ total_count: 0, recent_names: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchRegistrations = async () => {
    try {
      // Fetch all registrations with public data only (no personal info like email/whatsapp)
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('support_registrations')
        .select('id, full_name, participation_type, laps_count, motivation_message, registration_number, created_at')
        .order('created_at', { ascending: true });

      if (registrationsError) throw registrationsError;

      // Set registrations with full data
      setRegistrations(registrationsData as PublicRegistration[] || []);
      
      // Create public stats for backward compatibility
      const stats: PublicRegistrationStats = {
        total_count: registrationsData?.length || 0,
        recent_names: (registrationsData || [])
          .slice(-5)
          .reverse()
          .map(reg => reg.full_name)
      };
      
      setPublicStats(stats);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRegistration = async (newRegistration: NewRegistration) => {
    setSubmitting(true);
    try {
      // Obtener el siguiente número de registro
      const { data: nextNumber, error: numberError } = await supabase
        .rpc('get_next_registration_number');

      if (numberError) throw numberError;

      const { data, error } = await supabase
        .from('support_registrations')
        .insert([{
          ...newRegistration,
          registration_number: nextNumber
        }])
        .select()
        .single();

      if (error) throw error;

      // Refresh registrations after successful registration
      await fetchRegistrations();
      
      toast({
        title: "¡Registro exitoso!",
        description: `Gracias ${newRegistration.full_name}! Tu número de registro es ${nextNumber}.`,
      });

      return data;
    } catch (error) {
      console.error('Error creating registration:', error);
      toast({
        title: "Error",
        description: "No se pudo completar el registro. Inténtalo de nuevo.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  return {
    registrations,
    publicStats,
    loading,
    submitting,
    createRegistration,
    refetch: fetchRegistrations
  };
}