
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { initiateStravaAuth, isAuthenticated, logout, getAthleteInfo } from '@/services/stravaService';
import { LogOut, LogIn } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
