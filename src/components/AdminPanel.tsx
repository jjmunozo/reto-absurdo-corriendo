
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useStravaRuns } from '@/hooks/useStravaRuns';

const AdminPanel: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { runs, isLoading, isError, refresh } = useStravaRuns();
  
  const handleAdminLogin = () => {
    if (password === 'admin123') {
      setShowAdminPanel(true);
      toast({
        title: "Modo administrador activado",
        description: "Panel de administración del nuevo sistema Strava",
      });
    } else {
      toast({
        title: "Contraseña incorrecta",
        description: "Por favor intenta de nuevo",
        variant: "destructive",
      });
    }
  };

  const handleBackToMain = () => {
    window.location.hash = '';
    window.location.reload();
  };
  
  if (!showAdminPanel) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Acceso Administrativo</CardTitle>
          <CardDescription>Ingresa la contraseña para ver el panel de administración</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdminLogin();
                }}
              />
            </div>
            <Button onClick={handleAdminLogin} className="w-full">
              Acceder
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Panel de Administración - Sistema Nuevo</CardTitle>
          <CardDescription>
            El sistema ahora usa una API backend para obtener datos de Strava automáticamente
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Estado del Sistema</h3>
                  <div className="space-y-2">
                    <p><strong>Estado:</strong> {isLoading ? 'Cargando...' : isError ? 'Error' : 'Conectado'}</p>
                    <p><strong>Actividades cargadas:</strong> {runs.length}</p>
                    <p><strong>Última actualización:</strong> {new Date().toLocaleString()}</p>
                    <p><strong>Tipo de sistema:</strong> API Backend (sin autenticación de usuarios)</p>
                  </div>
                  
                  <Button 
                    onClick={() => refresh()}
                    disabled={isLoading}
                    className="mt-4"
                  >
                    {isLoading ? 'Actualizando...' : 'Refrescar Datos'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Información del Sistema</h3>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1">
                    <p>• Los datos se actualizan automáticamente cada 6 horas</p>
                    <p>• No se requiere autenticación de usuarios</p>
                    <p>• Los tokens se refrescan automáticamente</p>
                    <p>• Cache inteligente con SWR (refresco cada 10 min)</p>
                    <p>• Obtiene TODAS las actividades históricas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="outline"
                  onClick={handleBackToMain}
                >
                  ← Volver a la página principal
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowAdminPanel(false);
                    toast({
                      title: "Sesión cerrada",
                      description: "Has salido del panel de administración",
                    });
                  }}
                >
                  Cerrar sesión de administrador
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
