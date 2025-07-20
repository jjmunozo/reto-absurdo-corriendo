import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupportRegistrations, type NewRegistration } from '@/hooks/useSupportRegistrations';
import { Separator } from '@/components/ui/separator';
import { Heart, Users, Trophy } from 'lucide-react';

const formSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  whatsapp: z.string().min(8, 'WhatsApp debe tener al menos 8 caracteres'),
  participation_type: z.enum(['run', 'moral_support'], {
    required_error: 'Selecciona una opción'
  }),
  laps_count: z.string().optional(),
  motivation_message: z.string().min(5, 'El mensaje debe tener al menos 5 caracteres')
});

type FormData = z.infer<typeof formSchema>;

export default function Apoyo() {
  const { registrations, loading, submitting, createRegistration } = useSupportRegistrations();
  const [participationType, setParticipationType] = useState<'run' | 'moral_support' | ''>('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      whatsapp: '',
      participation_type: undefined,
      laps_count: '',
      motivation_message: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      let lapsCount: number | null = null;
      
      if (data.participation_type === 'run' && data.laps_count) {
        if (data.laps_count === 'unknown') {
          lapsCount = null;
        } else {
          lapsCount = parseInt(data.laps_count);
        }
      }

      const newRegistration: NewRegistration = {
        full_name: data.full_name,
        email: data.email,
        whatsapp: data.whatsapp,
        participation_type: data.participation_type,
        laps_count: lapsCount,
        motivation_message: data.motivation_message
      };

      await createRegistration(newRegistration);
      form.reset();
      setParticipationType('');
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const formatRegistrationText = (reg: any) => {
    const number = reg.registration_number.toString().padStart(3, '0');
    
    if (reg.participation_type === 'run') {
      const laps = reg.laps_count ? `${reg.laps_count}` : '?';
      return `${number}. ${reg.full_name}. Voy a correr ${laps} vueltas con Juan.`;
    } else {
      return `${number}. ${reg.full_name}. Voy a llegar a darle apoyo moral a Juan.`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            🏃‍♂️ Únete al Reto de Juan 🏃‍♂️
          </h1>
          <p className="text-lg text-muted-foreground">
            ¿Quieres acompañarme en este increíble desafío? ¡Regístrate aquí!
          </p>
        </div>

        {/* Formulario de registro */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Heart className="w-5 h-5 text-primary" />
              Formulario de Registro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Tipo de participación */}
                <FormField
                  control={form.control}
                  name="participation_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">¿Cómo quieres participar?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            setParticipationType(value as 'run' | 'moral_support');
                          }}
                          value={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                            <RadioGroupItem value="run" id="run" />
                            <label htmlFor="run" className="font-medium cursor-pointer flex items-center gap-2">
                              <Trophy className="w-4 h-4" />
                              Quiero correr con Juan
                            </label>
                          </div>
                          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                            <RadioGroupItem value="moral_support" id="moral_support" />
                            <label htmlFor="moral_support" className="font-medium cursor-pointer flex items-center gap-2">
                              <Heart className="w-4 h-4" />
                              Quiero dar apoyo moral
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo condicional para vueltas */}
                {participationType === 'run' && (
                  <FormField
                    control={form.control}
                    name="laps_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Cuántas vueltas quieres correr?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el número de vueltas" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unknown">No sé / Ya veré</SelectItem>
                            {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'vuelta' : 'vueltas'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Nombre completo */}
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@email.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Solo para mantenerte informado sobre la logística antes del evento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* WhatsApp */}
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="+506 1234 5678" {...field} />
                      </FormControl>
                      <FormDescription>
                        Solo para mantenerte informado sobre la logística antes del evento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mensaje de motivación */}
                <FormField
                  control={form.control}
                  name="motivation_message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensaje de motivación para Juan</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Escribe un mensaje motivacional para Juan durante lo que falta de su entrenamiento..."
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full text-lg py-6"
                >
                  {submitting ? 'Registrando...' : '¡Registrarme!'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Lista de personas registradas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5 text-primary" />
              Personas que se han apuntado ({registrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando registros...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aún no hay registros</p>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((registration) => (
                  <div 
                    key={registration.id}
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <p className="font-medium text-foreground">
                      {formatRegistrationText(registration)}
                    </p>
                    <p className="text-muted-foreground italic mt-2">
                      "{registration.motivation_message}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}