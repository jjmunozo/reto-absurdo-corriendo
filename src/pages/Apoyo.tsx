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
import { Heart, Users, Trophy, ArrowLeft, MousePointer } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  const scrollToForm = () => {
    const formElement = document.getElementById('registration-form');
    if (formElement) {
      formElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header con navegación */}
      <div className="bg-white border-b border-brand-coral/10">
        <div className="container mx-auto px-4 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-brand-coral hover:text-brand-red transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al reto</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-brand-gray-purple mb-6">
            🏃‍♂️ Únete al Reto 🏃‍♂️
          </h1>
          <p className="text-xl text-brand-gray-purple leading-relaxed max-w-2xl mx-auto">
            ¿Quieres acompañarme en mi <strong className="text-brand-coral">misogi</strong> de 100km en 24 horas? 
            ¡Regístrate aquí para correr conmigo o darme apoyo moral!
          </p>
        </div>

        {/* Botón para scroll al formulario */}
        <div className="text-center mb-8">
          <Button
            onClick={scrollToForm}
            className="bg-brand-coral hover:bg-brand-red text-white text-xl py-6 px-8 rounded-lg font-bold transition-colors flex items-center gap-3 mx-auto"
          >
            <MousePointer className="w-6 h-6" />
            Apuntarme a apoyar a Juan
          </Button>
        </div>

        {/* Lista de personas registradas */}
        <Card className="border-brand-coral/20 shadow-lg mb-12">
          <CardHeader className="bg-brand-coral text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="w-6 h-6" />
              Personas que se han apuntado ({registrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-coral mx-auto mb-4"></div>
                <p className="text-brand-gray-purple">Cargando registros...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-brand-gray-purple text-lg">Aún no hay registros</p>
                <p className="text-brand-gray-purple/70 mt-2">¡Sé el primero en apuntarte!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {registrations.map((registration) => (
                  <div 
                    key={registration.id}
                    className="p-6 border border-brand-coral/20 rounded-lg hover:bg-brand-coral/5 transition-colors"
                  >
                    <p className="font-semibold text-lg text-brand-gray-purple mb-3">
                      {formatRegistrationText(registration)}
                    </p>
                    <p className="text-brand-gray-purple/80 italic text-lg">
                      "{registration.motivation_message}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulario de registro */}
        <Card id="registration-form" className="border-brand-coral/20 shadow-lg">
          <CardHeader className="bg-brand-coral text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Heart className="w-6 h-6" />
              Formulario de Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Tipo de participación */}
                <FormField
                  control={form.control}
                  name="participation_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-brand-gray-purple">
                        ¿Cómo quieres participar?
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            setParticipationType(value as 'run' | 'moral_support');
                          }}
                          value={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                          <div className="flex items-center space-x-3 p-6 border-2 border-brand-coral/20 rounded-lg hover:border-brand-coral/40 hover:bg-brand-coral/5 transition-all cursor-pointer">
                            <RadioGroupItem value="run" id="run" className="border-brand-coral" />
                            <label htmlFor="run" className="font-medium cursor-pointer flex items-center gap-3 text-brand-gray-purple">
                              <Trophy className="w-5 h-5 text-brand-coral" />
                              <span className="text-lg">Quiero correr con Juan</span>
                            </label>
                          </div>
                          <div className="flex items-center space-x-3 p-6 border-2 border-brand-coral/20 rounded-lg hover:border-brand-coral/40 hover:bg-brand-coral/5 transition-all cursor-pointer">
                            <RadioGroupItem value="moral_support" id="moral_support" className="border-brand-coral" />
                            <label htmlFor="moral_support" className="font-medium cursor-pointer flex items-center gap-3 text-brand-gray-purple">
                              <Heart className="w-5 h-5 text-brand-coral" />
                              <span className="text-lg">Quiero dar apoyo moral</span>
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
                        <FormLabel className="text-lg font-medium text-brand-gray-purple">
                          ¿Cuántas vueltas quieres correr?
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-lg p-6 border-brand-coral/30">
                              <SelectValue placeholder="Selecciona el número de vueltas" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unknown" className="text-lg">No sé / Ya veré</SelectItem>
                            {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
                              <SelectItem key={num} value={num.toString()} className="text-lg">
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
                      <FormLabel className="text-lg font-medium text-brand-gray-purple">
                        Nombre completo
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Tu nombre completo" 
                          {...field} 
                          className="text-lg p-6 border-brand-coral/30"
                        />
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
                      <FormLabel className="text-lg font-medium text-brand-gray-purple">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="tu@email.com" 
                          {...field} 
                          className="text-lg p-6 border-brand-coral/30"
                        />
                      </FormControl>
                      <FormDescription className="text-brand-gray-purple/70">
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
                      <FormLabel className="text-lg font-medium text-brand-gray-purple">
                        WhatsApp
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+506 1234 5678" 
                          {...field} 
                          className="text-lg p-6 border-brand-coral/30"
                        />
                      </FormControl>
                      <FormDescription className="text-brand-gray-purple/70">
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
                      <FormLabel className="text-lg font-medium text-brand-gray-purple">
                        Mensaje de motivación para Juan
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Escribe un mensaje motivacional para Juan durante lo que falta de su entrenamiento..."
                          rows={5}
                          {...field} 
                          className="text-lg p-6 border-brand-coral/30"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full text-xl py-8 bg-brand-coral hover:bg-brand-red text-white font-bold rounded-lg transition-colors"
                >
                  {submitting ? 'Registrando...' : '¡Registrarme para el Reto!'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-white py-6 px-4 mt-12 border-t border-brand-coral/10">
        <div className="container mx-auto text-center text-brand-gray-purple">
          <p className="text-sm">&copy; 2025 El reto más absurdo | ¡Únete al misogi!</p>
        </div>
      </footer>
    </div>
  );
}