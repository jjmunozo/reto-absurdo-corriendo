
import React from 'react';
import { Button } from '@/components/ui/button';
import { initiateStravaAuth, isAuthenticated, logout, getAthleteInfo } from '@/services/stravaService';
import { LogOut, LogIn } from 'lucide-react';

interface StravaConnectButtonProps {
  onConnected?: () => void;
  className?: string;
}

const StravaConnectButton: React.FC<StravaConnectButtonProps> = ({ onConnected, className }) => {
  const authenticated = isAuthenticated();
  const athlete = getAthleteInfo();

  const handleConnect = () => {
    if (authenticated) {
      logout();
      window.location.reload();
    } else {
      initiateStravaAuth();
    }
  };

  return (
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
  );
};

export default StravaConnectButton;
