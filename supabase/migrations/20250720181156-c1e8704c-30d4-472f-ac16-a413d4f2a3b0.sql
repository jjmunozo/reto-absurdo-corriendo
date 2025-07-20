
-- Crear enum para tipo de participación
CREATE TYPE public.participation_type AS ENUM ('run', 'moral_support');

-- Crear tabla para registraciones de apoyo
CREATE TABLE public.support_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  participation_type participation_type NOT NULL,
  laps_count INTEGER, -- NULL para "no sé"
  motivation_message TEXT NOT NULL,
  registration_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índice único para el número de registro
CREATE UNIQUE INDEX support_registrations_number_idx ON public.support_registrations(registration_number);

-- Habilitar RLS
ALTER TABLE public.support_registrations ENABLE ROW LEVEL SECURITY;

-- Política para que todos puedan ver las registraciones (solo datos públicos)
CREATE POLICY "Anyone can view support registrations" 
ON public.support_registrations 
FOR SELECT 
USING (true);

-- Política para que todos puedan insertar registraciones
CREATE POLICY "Anyone can create support registrations" 
ON public.support_registrations 
FOR INSERT 
WITH CHECK (true);

-- Insertar los registros predeterminados de Juan y Antonia
INSERT INTO public.support_registrations (
  full_name, 
  email, 
  whatsapp, 
  participation_type, 
  laps_count, 
  motivation_message, 
  registration_number
) VALUES 
(
  'Juan J. Muñoz', 
  'juan@example.com', 
  '+1234567890', 
  'run', 
  24, 
  '¡Épicooooooooooo!', 
  1
),
(
  'Antonia Muñoz', 
  'antonia@example.com', 
  '+1234567891', 
  'moral_support', 
  NULL, 
  '¡Epicooooooooooooo!', 
  2
);

-- Función para obtener el siguiente número de registro
CREATE OR REPLACE FUNCTION public.get_next_registration_number()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(registration_number), 2) + 1 
  INTO next_number 
  FROM public.support_registrations;
  
  RETURN next_number;
END;
$$;
