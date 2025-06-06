
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const PASSWORD_HASH = "reto2024"; // Cambiar por tu contraseña preferida

const formSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(100, "El título no puede exceder 100 caracteres"),
  date: z.string().min(1, "La fecha es obligatoria"),
  time: z.string().min(1, "La hora es obligatoria"),
  hours: z.string().refine((val) => {
    const num = parseInt(val || '0');
    return num >= 0 && num <= 23;
  }, "Las horas deben estar entre 0 y 23"),
  minutes: z.string().refine((val) => {
    const num = parseInt(val || '0');
    return num >= 0 && num <= 59;
  }, "Los minutos deben estar entre 0 y 59").refine((val) => {
    return val !== '' && parseInt(val) >= 0;
  }, "Los minutos son obligatorios"),
  seconds: z.string().refine((val) => {
    const num = parseInt(val || '0');
    return num >= 0 && num <= 59;
  }, "Los segundos deben estar entre 0 y 59"),
  distance: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "La distancia debe ser un número mayor a 0"),
  pace: z.string().refine((val) => {
    // Validar formato min:ss (ej: 5:30)
    const paceRegex = /^\d{1,2}:\d{2}$/;
    if (!paceRegex.test(val)) {
      return false;
    }
    const [minutes, seconds] = val.split(':').map(Number);
    return minutes >= 0 && seconds >= 0 && seconds <= 59;
  }, "El ritmo debe tener formato min:ss (ej: 5:30)"),
  elevation: z.string().refine((val) => {
    const num = parseInt(val || '0');
    return num >= 0;
  }, "La elevación debe ser un número positivo"),
  hasPR: z.boolean(),
  prType: z.string().optional(),
  prDescription: z.string().optional(),
}).refine((data) => {
  if (data.hasPR) {
    return data.prType && data.prType.trim() !== '';
  }
  return true;
}, {
  message: "El tipo de PR es obligatorio cuando marcas que tuviste un PR",
  path: ["prType"]
}).refine((data) => {
  if (data.hasPR) {
    return data.prDescription && data.prDescription.trim() !== '';
  }
  return true;
}, {
  message: "La descripción del PR es obligatoria cuando marcas que tuviste un PR",
  path: ["prDescription"]
});

type FormData = z.infer<typeof formSchema>;

const AddRun = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      date: '',
      time: '',
      hours: '',
      minutes: '',
      seconds: '',
      distance: '',
      pace: '',
      elevation: '',
      hasPR: false,
      prType: '',
      prDescription: ''
    }
  });

  useEffect(() => {
    // Verificar si ya está autenticado en esta sesión
    const authenticated = sessionStorage.getItem('addrun_authenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD_HASH) {
      setIsAuthenticated(true);
      sessionStorage.setItem('addrun_authenticated', 'true');
      setPassword('');
      toast({
        title: "Acceso concedido",
        description: "Puedes agregar nuevas carreras",
      });
    } else {
      toast({
        title: "Contraseña incorrecta",
        description: "Inténtalo de nuevo",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('addrun_authenticated');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado la sesión correctamente",
    });
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Usar los valores directamente sin conversiones
      const durationHours = parseInt(data.hours || '0');
      const durationMinutes = parseInt(data.minutes || '0');
      const durationSeconds = parseInt(data.seconds || '0');
      const distance = parseFloat(data.distance);
      
      // Convertir pace de formato min:ss a decimal
      const [paceMinutes, paceSecondsTime] = data.pace.split(':').map(Number);
      const avgPace = paceMinutes + (paceSecondsTime / 60);
      
      // Combinar fecha y hora
      const startDateTime = new Date(`${data.date}T${data.time}`);

      console.log('Datos a insertar:', {
        title: data.title,
        start_time: startDateTime.toISOString(),
        duration_hours: durationHours,
        duration_minutes: durationMinutes,
        duration_seconds: durationSeconds,
        distance_km: distance,
        avg_pace: avgPace,
        total_elevation: parseInt(data.elevation || '0'),
        has_pr: data.hasPR,
        pr_type: data.hasPR ? data.prType : null,
        pr_description: data.hasPR ? data.prDescription : null
      });

      const { error } = await supabase
        .from('manual_runs')
        .insert({
          title: data.title,
          start_time: startDateTime.toISOString(),
          duration_hours: durationHours,
          duration_minutes: durationMinutes,
          duration_seconds: durationSeconds,
          distance_km: distance,
          avg_pace: avgPace,
          total_elevation: parseInt(data.elevation || '0'),
          has_pr: data.hasPR,
          pr_type: data.hasPR ? data.prType : null,
          pr_description: data.hasPR ? data.prDescription : null
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Carrera agregada",
        description: "La carrera se guardó exitosamente",
      });

      // Limpiar formulario
      form.reset();

    } catch (err: any) {
      console.error('Error saving run:', err);
      toast({
        title: "Error",
        description: err.message || "No se pudo guardar la carrera",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-running-primary rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Acceso Restringido</CardTitle>
            <CardDescription>
              Ingresa la contraseña para agregar carreras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Acceder
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-running-primary to-running-dark text-white py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Agregar Nueva Carrera</h1>
              <p className="opacity-90">Registra los datos de tu última carrera</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Datos de la Carrera
            </CardTitle>
            <CardDescription>
              Completa todos los campos con la información de tu carrera
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título de la carrera</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Carrera matutina por el parque"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de inicio</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <Label>Tiempo total</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <FormField
                      control={form.control}
                      name="hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Horas"
                              type="number"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="minutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Minutos"
                              type="number"
                              min="0"
                              max="59"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seconds"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Segundos"
                              type="number"
                              min="0"
                              max="59"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="distance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distancia (km)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="5.0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ritmo promedio (min:ss por km)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="5:30"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="elevation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Elevación total (metros)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="hasPR"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            ¿Tuviste algún PR (récord personal)?
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch('hasPR') && (
                    <div className="space-y-4 pl-6 border-l-2 border-yellow-200 bg-yellow-50 p-4 rounded-r-lg">
                      <FormField
                        control={form.control}
                        name="prType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de PR</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: Mejor tiempo en 5K, Mayor distancia recorrida, etc."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="prDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe los detalles de tu récord personal..."
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Carrera'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddRun;
