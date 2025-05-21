
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { initiateStravaAuth, isAuthenticated, logout, getAthleteInfo } from '@/services/stravaService';
import { LogOut, LogIn, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface StravaConnectButtonProps {
  onConnected?: () => void;
  className?: string;
}

const StravaConnectButton: React.FC<StravaConnectButtonProps> = ({ onConnected, className }) => {
  const authenticated = isAuthenticated();
  const athlete = getAthleteInfo();
  const [showConnectionInfo, setShowConnectionInfo] = useState(false);

  const handleConnect = () => {
    if (authenticated) {
      logout();
      window.location.reload();
    } else {
      try {
        initiateStravaAuth();
      } catch (error) {
        console.error("Error al iniciar la autenticación de Strava:", error);
        setShowConnectionInfo(true);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button 
          onClick={handleConnect}
          className={`${authenticated ? "bg-red-500 hover:bg-red-600" : "bg-[#FC4C02] hover:bg-[#d13e00]"} ${className || ''}`}
        >
          {authenticated ? (
            <>
              <LogOut className="w-4 h-4 mr-2" />
              {athlete ? `Desconectar (${athlete.firstname})` : 'Desconectar Strava'}
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Conectar con Strava
            </>
          )}
        </Button>
        
        {!authenticated && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Info className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Información de conexión</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Información técnica</h3>
                  <div className="bg-muted p-3 rounded text-xs mt-2 font-mono">
                    <p>Dominio actual: <span className="text-blue-500">{window.location.host}</span></p>
                    <p>URI de redirección: <span className="text-blue-500">{window.location.origin}/auth/strava/callback</span></p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Configuración de la app de Strava</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Asegúrate de que en la configuración de tu app de Strava, el "Authorization Callback Domain" esté configurado como:
                  </p>
                  <div className="bg-muted p-3 rounded text-xs mt-2 font-mono">
                    <p>{window.location.host}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    No incluyas http://, https:// ni barras al final.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {showConnectionInfo && !authenticated && (
        <Alert variant="warning" className="mt-2">
          <AlertDescription>
            Si tienes problemas para conectar, asegúrate de:
            <ul className="list-disc ml-5 mt-2">
              <li>Tener una cuenta en Strava</li>
              <li>Que tu navegador permita popups</li>
              <li>Que tu conexión a internet esté funcionando correctamente</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default StravaConnectButton;
