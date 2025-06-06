import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Plus } from 'lucide-react';

const PASSWORD_HASH = "reto2024"; // Cambiar por tu contraseña preferida

const AddRun = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    hours: '',
    minutes: '',
    distance: '',
    pace: '',
    elevation: '',
    hasPR: false,
    prType: '',
    prDescription: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculatePace = () => {
    const totalMinutes = parseInt(formData.hours || '0') * 60 + parseInt(formData.minutes || '0');
    const distance = parseFloat(formData.distance || '0');
    
    if (totalMinutes > 0 && distance > 0) {
      const paceMinutes = totalMinutes / distance;
      const paceMin = Math.floor(paceMinutes);
      const paceSec = Math.round((paceMinutes - paceMin) * 60);
      return paceMinutes; // devolver en decimal para la base de datos
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const totalMinutes = parseInt(formData.hours || '0') * 60 + parseInt(formData.minutes || '0');
      const distance = parseFloat(formData.distance);
      const avgPace = parseFloat(formData.pace) || calculatePace();
      
      // Combinar fecha y hora
      const startDateTime = new Date(`${formData.date}T${formData.time}`);

      const { error } = await supabase
        .from('manual_runs')
        .insert({
          title: formData.title,
          start_time: startDateTime.toISOString(),
          duration_minutes: totalMinutes,
          distance_km: distance,
          avg_pace: avgPace,
          total_elevation: parseInt(formData.elevation || '0'),
          has_pr: formData.hasPR,
          pr_type: formData.hasPR ? formData.prType : null,
          pr_description: formData.hasPR ? formData.prDescription : null
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Carrera agregada",
        description: "La carrera se guardó exitosamente",
      });

      // Limpiar formulario
      setFormData({
        title: '',
        date: '',
        time: '',
        hours: '',
        minutes: '',
        distance: '',
        pace: '',
        elevation: '',
        hasPR: false,
        prType: '',
        prDescription: ''
      });

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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Título de la carrera</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Carrera matutina por el parque"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Hora de inicio</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Tiempo total</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      value={formData.hours}
                      onChange={(e) => handleInputChange('hours', e.target.value)}
                      placeholder="Horas"
                      type="number"
                      min="0"
                    />
                  </div>
                  <div>
                    <Input
                      value={formData.minutes}
                      onChange={(e) => handleInputChange('minutes', e.target.value)}
                      placeholder="Minutos"
                      type="number"
                      min="0"
                      max="59"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="distance">Distancia (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    value={formData.distance}
                    onChange={(e) => handleInputChange('distance', e.target.value)}
                    placeholder="5.0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pace">Ritmo promedio (min/km)</Label>
                  <Input
                    id="pace"
                    type="number"
                    step="0.01"
                    value={formData.pace}
                    onChange={(e) => handleInputChange('pace', e.target.value)}
                    placeholder="Se calcula automáticamente"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="elevation">Elevación total (metros)</Label>
                <Input
                  id="elevation"
                  type="number"
                  value={formData.elevation}
                  onChange={(e) => handleInputChange('elevation', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPR"
                    checked={formData.hasPR}
                    onCheckedChange={(checked) => handleInputChange('hasPR', checked as boolean)}
                  />
                  <Label htmlFor="hasPR">¿Tuviste algún PR (récord personal)?</Label>
                </div>

                {formData.hasPR && (
                  <div className="space-y-4 pl-6 border-l-2 border-yellow-200 bg-yellow-50 p-4 rounded-r-lg">
                    <div>
                      <Label htmlFor="prType">Tipo de PR</Label>
                      <Input
                        id="prType"
                        value={formData.prType}
                        onChange={(e) => handleInputChange('prType', e.target.value)}
                        placeholder="Ej: Mejor tiempo en 5K, Mayor distancia recorrida, etc."
                        required={formData.hasPR}
                      />
                    </div>
                    <div>
                      <Label htmlFor="prDescription">Descripción</Label>
                      <Textarea
                        id="prDescription"
                        value={formData.prDescription}
                        onChange={(e) => handleInputChange('prDescription', e.target.value)}
                        placeholder="Describe los detalles de tu récord personal..."
                        rows={3}
                        required={formData.hasPR}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar Carrera'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddRun;
