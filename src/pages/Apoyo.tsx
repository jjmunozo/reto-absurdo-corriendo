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
import { Heart, Users, Trophy, ArrowLeft, MousePointer, Footprints } from 'lucide-react';
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
  const {
    registrations,
    loading,
    submitting,
    createRegistration
  } = useSupportRegistrations();
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

  const scrollToList = () => {
    const listElement = document.getElementById('registration-list');
    if (listElement) {
      listElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  return <div className="min-h-screen bg-brand-cream">
      {/* Header con navegación */}
      <div className="bg-white border-b border-brand-coral/10">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-brand-coral hover:text-brand-red transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al reto</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-brand-gray-purple mb-6">
            ¡Apóyenme en el Reto Más Absurdo Que Me He Puesto En La Vida!
          </h1>

          {/* Botones para scroll */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button onClick={scrollToForm} className="bg-brand-coral hover:bg-brand-red text-white text-xl py-6 px-8 rounded-lg font-bold transition-colors flex items-center gap-3">
                <MousePointer className="w-6 h-6" />
                Apuntarme a apoyar a Juan
              </Button>
              <Button onClick={scrollToList} variant="outline" className="border-brand-coral text-brand-coral hover:bg-brand-coral hover:text-white text-xl py-6 px-8 rounded-lg font-bold transition-colors flex items-center gap-3">
                <Users className="w-6 h-6" />
                Ver lista de apoyo
              </Button>
            </div>
          </div>
          <div className="text-lg text-brand-gray-purple leading-relaxed max-w-4xl mx-auto space-y-4">
            <p>
              El 6 de diciembre 2025 voy a hacer un reto que me da miedo — un <strong className="text-brand-coral">misogi</strong>: correr 100km en un tiempo de 24hrs.
            </p>
            
            <p>
              No voy a correr 24hrs continuas, voy a hacerlo en estilo "Back Yard Ultra" o "Last Man Standing", pero solo yo.
            </p>

            <div className="bg-white/50 p-6 rounded-lg border border-brand-coral/20 space-y-2">
              <p>🏃‍♂️ Voy a correr una vuelta de 4.5 - 5km cada hora por 24 horas.</p>
              <p>🕐 Tengo máximo 1 hora para terminar cada vuelta.</p>
              <p>🔁 Cada hora empieza otra vuelta.</p>
              <p>💆‍♂️ Si termino antes de que se cumpla la hora, puedo descansar hasta que empiece la próxima vuelta.</p>
              <p>🚫 Si no termino la vuelta dentro de 1 hora o no empiezo la vuelta a tiempo, termina mi reto.</p>
              <p>🥇 La meta es terminar 24hrs.</p>
            </div>

            <p>
              La verdad me encantaría tener <strong className="text-brand-coral">apoyo moral humano</strong>. No es una carrera, entonces no va a haber público y quiero crear una atmósfera chiva de hacer cosas difíciles.
            </p>

            <p>
              Va a ser en <strong className="text-brand-coral">Santa Ana</strong>. Pueden llegar a ver y aplaudir en cualquier punto de las 24hrs — hasta pueden llegar a tomarse una birra tardeada (o a media noche) o a verme alucinar a las 3am por no dormir 👻😂
            </p>

            <p className="text-xl font-semibold text-brand-coral">
              ¡Pero también se pueden apuntar a correr algunos tramos conmigo!
            </p>

            <p className="text-2xl font-bold text-brand-gray-purple">¿Quién se apunta?</p>
          </div>
        </div>


        
        {/* Links de texto para navegación */}
        <div className="text-center mb-8">
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={scrollToForm} 
              className="text-brand-coral hover:text-brand-red text-lg font-medium underline transition-colors"
            >
              Ir a apuntarme para apoyar a Juan
            </button>
            <button 
              onClick={scrollToList} 
              className="text-brand-coral hover:text-brand-red text-lg font-medium underline transition-colors"
            >
              Ver la lista de apoyo
            </button>
          </div>
        </div>

        {/* Lista de personas registradas */}
        <Card id="registration-list" className="border-brand-coral/20 shadow-lg mb-12">
          <CardHeader className="bg-brand-coral text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="w-6 h-6" />
              Personas que se han apuntado ({registrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            {loading ? <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-coral mx-auto mb-4"></div>
                <p className="text-brand-gray-purple">Cargando registros...</p>
              </div> : registrations.length === 0 ? <div className="text-center py-12">
                <p className="text-brand-gray-purple text-lg">Aún no hay registros</p>
                <p className="text-brand-gray-purple/70 mt-2">¡Sé el primero en apuntarte!</p>
              </div> : <div className="space-y-4">
                {registrations.map(registration => <div key={registration.id} className="relative p-4 border border-brand-coral/20 rounded-lg hover:bg-brand-coral/5 transition-colors">
                    {/* Emoji en esquina superior derecha */}
                    <div className="absolute top-3 right-3 text-xl">
                      {registration.participation_type === 'run' ? '🏃‍♂️' : '❤️'}
                    </div>
                    
                    <p className="font-semibold text-base text-brand-gray-purple mb-2 pr-10">
                      {formatRegistrationText(registration)}
                    </p>
                    <p className="text-brand-gray-purple/80 italic text-sm pr-10">
                      "{registration.motivation_message}"
                    </p>
                  </div>)}
              </div>}
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
                <FormField control={form.control} name="participation_type" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-lg font-semibold text-brand-gray-purple">
                        ¿Cómo quieres participar?
                      </FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={value => {
                    field.onChange(value);
                    setParticipationType(value as 'run' | 'moral_support');
                  }} value={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center space-x-3 p-6 border-2 border-brand-coral/20 rounded-lg hover:border-brand-coral/40 hover:bg-brand-coral/5 transition-all cursor-pointer">
                            <RadioGroupItem value="run" id="run" className="border-brand-coral" />
                            <label htmlFor="run" className="font-medium cursor-pointer flex items-center gap-3 text-brand-gray-purple">
                              <Footprints className="w-5 h-5 text-brand-coral" />
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
                    </FormItem>} />

                {/* Campo condicional para vueltas */}
                {participationType === 'run' && <FormField control={form.control} name="laps_count" render={({
                field
              }) => <FormItem>
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
                            {Array.from({
                      length: 24
                    }, (_, i) => i + 1).map(num => <SelectItem key={num} value={num.toString()} className="text-lg">
                                {num} {num === 1 ? 'vuelta' : 'vueltas'}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>} />}

                {/* Nombre completo */}
                <FormField control={form.control} name="full_name" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-lg font-medium text-brand-gray-purple">
                        Nombre completo
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre completo" {...field} className="text-lg p-6 border-brand-coral/30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                {/* Email */}
                <FormField control={form.control} name="email" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-lg font-medium text-brand-gray-purple">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@email.com" {...field} className="text-lg p-6 border-brand-coral/30" />
                      </FormControl>
                      <FormDescription className="text-brand-gray-purple/70">
                        Solo para mantenerte informado sobre la logística antes del evento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>} />

                {/* WhatsApp */}
                <FormField control={form.control} name="whatsapp" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-lg font-medium text-brand-gray-purple">
                        WhatsApp
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+506 1234 5678" {...field} className="text-lg p-6 border-brand-coral/30" />
                      </FormControl>
                      <FormDescription className="text-brand-gray-purple/70">
                        Solo para mantenerte informado sobre la logística antes del evento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>} />

                {/* Mensaje de motivación */}
                <FormField control={form.control} name="motivation_message" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-lg font-medium text-brand-gray-purple">
                        Mensaje de motivación para Juan
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Escribe un mensaje motivacional para Juan durante lo que falta de su entrenamiento..." rows={5} {...field} className="text-lg p-6 border-brand-coral/30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <Button type="submit" disabled={submitting} className="w-full text-xl py-8 bg-brand-coral hover:bg-brand-red text-white font-bold rounded-lg transition-colors">
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
    </div>;
}