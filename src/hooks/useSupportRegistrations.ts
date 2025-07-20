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

export function useSupportRegistrations() {
  const [registrations, setRegistrations] = useState<SupportRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('support_registrations')
        .select('*')
        .order('registration_number', { ascending: true });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las registraciones",
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

      // Actualizar la lista local
      setRegistrations(prev => [...prev, data].sort((a, b) => a.registration_number - b.registration_number));
      
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
    loading,
    submitting,
    createRegistration,
    refetch: fetchRegistrations
  };
}