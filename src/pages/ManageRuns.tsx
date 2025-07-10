import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, ListFilter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useManualRunData } from '@/hooks/useManualRunData';

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

const ManageRuns = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activities, isLoading, updateManualRun, deleteManualRun, syncActivities } = useManualRunData();
  
  const [editingRun, setEditingRun] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteRunId, setDeleteRunId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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
    // Verificar que llegó desde AddRun Y está autenticado
    if (!location.state?.fromAddRun || !sessionStorage.getItem('addrun_authenticated')) {
      navigate('/add-run');
      return;
    }
  }, [location, navigate]);

  const handleEditRun = (run: any) => {
    // Convertir los datos de la carrera al formato del formulario
    const dateTimeStr = run.startTimeLocal;
    const date = dateTimeStr.substring(0, 10); // YYYY-MM-DD
    const time = dateTimeStr.substring(11, 16); // HH:MM
    
    // Convertir minutos totales a horas, minutos y segundos
    const totalMinutes = run.duration;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const seconds = Math.round((totalMinutes % 1) * 60);
    
    // Convertir pace decimal a formato min:ss
    const paceMinutes = Math.floor(run.avgPace);
    const paceSeconds = Math.round((run.avgPace - paceMinutes) * 60);
    const paceStr = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;

    form.reset({
      title: run.location,
      date: date,
      time: time,
      hours: hours.toString(),
      minutes: minutes.toString(),
      seconds: seconds.toString(),
      distance: run.distance.toString(),
      pace: paceStr,
      elevation: run.elevation.toString(),
      hasPR: run.hasPR || false,
      prType: run.prType || '',
      prDescription: run.prDescription || ''
    });

    setEditingRun(run);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRun = async (data: FormData) => {
    if (!editingRun) return;
    
    setIsUpdating(true);

    try {
      const durationHours = parseInt(data.hours || '0');
      const durationMinutes = parseInt(data.minutes || '0');
      const durationSeconds = parseInt(data.seconds || '0');
      const distance = parseFloat(data.distance);
      
      const [paceMinutes, paceSecondsTime] = data.pace.split(':').map(Number);
      const avgPace = paceMinutes + (paceSecondsTime / 60);
      
      const localDateTimeString = `${data.date}T${data.time}:00`;

      await updateManualRun(editingRun.originalId || editingRun.id, {
        title: data.title,
        start_time: localDateTimeString,
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

      toast({
        title: "Carrera actualizada",
        description: "Los cambios se guardaron exitosamente",
      });

      setIsEditDialogOpen(false);
      setEditingRun(null);
      form.reset();
      
      // Refrescar datos
      await syncActivities();

    } catch (err: any) {
      console.error('Error updating run:', err);
      toast({
        title: "Error",
        description: err.message || "No se pudo actualizar la carrera",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRun = async () => {
    if (!deleteRunId) return;
    
    setIsDeleting(true);

    try {
      await deleteManualRun(deleteRunId);
      
      toast({
        title: "Carrera eliminada",
        description: "La carrera se eliminó correctamente",
      });

      setDeleteRunId(null);
      
      // Refrescar datos
      await syncActivities();

    } catch (err: any) {
      console.error('Error deleting run:', err);
      toast({
        title: "Error",
        description: err.message || "No se pudo eliminar la carrera",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES');
  };

  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!sessionStorage.getItem('addrun_authenticated')) {
    return null; // useEffect ya redirige
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-running-primary to-running-dark text-white py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gestionar Carreras</h1>
              <p className="opacity-90">Edita o elimina tus carreras registradas</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/add-run')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Agregar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListFilter className="w-5 h-5 mr-2" />
              Carreras Registradas
            </CardTitle>
            <CardDescription>
              {activities.length} carreras encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Cargando carreras...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay carreras registradas aún.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Distancia</TableHead>
                    <TableHead>Pace</TableHead>
                    <TableHead>PR</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell>{formatDate(run.date)}</TableCell>
                      <TableCell className="font-medium">{run.location}</TableCell>
                      <TableCell>{run.distance} km</TableCell>
                      <TableCell>{formatPace(run.avgPace)} /km</TableCell>
                      <TableCell>
                        {run.hasPR && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            PR
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRun(run)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteRunId(run.originalId || run.id.toString())}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialog de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Carrera</DialogTitle>
            <DialogDescription>
              Modifica los datos de la carrera seleccionada
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateRun)} className="space-y-4">
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de confirmación de borrado */}
      <AlertDialog open={!!deleteRunId} onOpenChange={() => setDeleteRunId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar carrera?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La carrera será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRun}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageRuns;