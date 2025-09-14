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
  const [registrations, setRegistrations] = useState<SupportRegistration[]>([]);
  const [publicStats, setPublicStats] = useState<PublicRegistrationStats>({ total_count: 0, recent_names: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchPublicStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_public_registration_stats');

      if (error) throw error;
      
      // Parse the data since it comes as JSON
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      const stats: PublicRegistrationStats = {
        total_count: parsedData?.total_count || 0,
        recent_names: parsedData?.recent_names || []
      };
      
      setPublicStats(stats);
      
      // Create minimal registration objects for backward compatibility
      const fakeRegistrations = (stats.recent_names || []).map((name: string, index: number) => ({
        id: `fake-${index}`,
        full_name: name,
        email: '',
        whatsapp: '',
        participation_type: 'moral_support' as const,
        laps_count: null,
        motivation_message: '',
        registration_number: index + 1,
        created_at: new Date().toISOString()
      }));
      
      setRegistrations(fakeRegistrations);
    } catch (error) {
      console.error('Error fetching public stats:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
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

      // Refresh public stats after successful registration
      await fetchPublicStats();
      
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
    fetchPublicStats();
  }, []);

  return {
    registrations,
    publicStats,
    loading,
    submitting,
    createRegistration,
    refetch: fetchPublicStats
  };
}