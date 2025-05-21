import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { 
  exportRunningData, 
  formatLastUpdateTime, 
  setupAutoUpdater, 
  stopAutoUpdater, 
  isAdminMode,
  setAdminMode
} from '@/services/dataExportService';
import { 
  isAuthenticated, 
  initiateStravaAuth, 
  logout, 
  getAthleteInfo 
} from '@/services/stravaService';
import StravaConnectButton from '@/components/StravaConnectButton';

const AdminPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(formatLastUpdateTime());
  const athlete = getAthleteInfo();
  const authenticated = isAuthenticated();
  
  // Verificar si ya estamos en modo admin
  useEffect(() => {
    setShowAdminPanel(isAdminMode());
    
    // Configurar actualizador automático
    if (isAdminMode() && isAuthenticated()) {
      setupAutoUpdater();
    }
    
    // Efecto de limpieza
    return () => {
      stopAutoUpdater();
    };
  }, []);
  
  // Actualizar lastUpdateTime cada 30 segundos
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastUpdateTime(formatLastUpdateTime());
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleAdminLogin = () => {
    // En un entorno real, esto debería validarse en el servidor
    // Para esta implementación, usaremos una clave simple codificada
    if (password === 'admin123') {
      setAdminMode(true);
      setShowAdminPanel(true);
      toast({
        title: "Modo administrador activado",
        description: "Ahora puedes gestionar los datos de Strava",
      });
      
      // Iniciar actualizador automático si hay autenticación
      if (isAuthenticated()) {
        setupAutoUpdater();
      }
    } else {
      toast({
        title: "Contraseña incorrecta",
        description: "Por favor intenta de nuevo",
        variant: "destructive",
      });
    }
  };
  
  const handleExportData = async () => {
    if (!isAuthenticated()) {
      toast({
        title: "Error",
        description: "Necesitas conectar con Strava primero",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const data = await exportRunningData();
      setLastUpdateTime(formatLastUpdateTime());
      toast({
        title: "Datos exportados",
        description: `Se exportaron ${data.length} actividades correctamente`,
      });
    } catch (error) {
      console.error("Error exportando datos:", error);
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleConnect = () => {
    try {
      initiateStravaAuth();
    } catch (error) {
      console.error("Error iniciando autenticación:", error);
      toast({
        title: "Error",
        description: "No se pudo conectar con Strava",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = () => {
    logout();
    stopAutoUpdater(); // Detener actualizaciones automáticas
    toast({
      title: "Desconectado",
      description: "Se ha cerrado la sesión de Strava",
    });
    window.location.reload();
  };
  
  // Si no estamos en modo admin y no es la URL de admin, mostrar el formulario de acceso
  if (!showAdminPanel) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Acceso Administrativo</CardTitle>
          <CardDescription>Ingresa la contraseña para gestionar los datos de Strava</CardDescription>
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
  
  // Panel de administración
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Panel de Administración de Strava</CardTitle>
        <CardDescription>
          Gestiona la sincronización de datos con Strava
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Estado de conexión */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Estado de conexión</h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${authenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{authenticated ? 'Conectado' : 'Desconectado'}</span>
              {authenticated && athlete && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({athlete.firstname} {athlete.lastname})
                </span>
              )}
            </div>
            
            {/* Botón de conexión/desconexión usando el componente StravaConnectButton */}
            <StravaConnectButton showDisconnectButton={true} />
          </div>
          
          {/* Estado de actualización */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Estado de actualización</h3>
            <div>
              <span className="text-sm text-muted-foreground">
                Última actualización: {lastUpdateTime}
              </span>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={handleExportData} 
                disabled={!authenticated || loading}
              >
                {loading ? 'Actualizando...' : 'Actualizar datos manualmente'}
              </Button>
              <div className="text-sm text-muted-foreground">
                <p>La actualización automática ocurre cada 6 horas</p>
              </div>
            </div>
          </div>
          
          {/* Opciones adicionales */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Opciones</h3>
            <Button 
              variant="outline"
              onClick={() => {
                setAdminMode(false);
                setShowAdminPanel(false);
                stopAutoUpdater();
                toast({
                  title: "Modo administrador desactivado",
                  description: "Has salido del modo de administración",
                });
              }}
            >
              Salir del modo administrador
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPanel;
