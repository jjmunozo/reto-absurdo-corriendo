
import React from 'react';
import { Button } from '@/components/ui/button';
import { initiateStravaAuth, isAuthenticated, logout } from '@/services/stravaService';

interface StravaConnectButtonProps {
  onConnected?: () => void;
}

const StravaConnectButton: React.FC<StravaConnectButtonProps> = ({ onConnected }) => {
  const authenticated = isAuthenticated();

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
      className={authenticated ? "bg-red-500 hover:bg-red-600" : "bg-[#FC4C02] hover:bg-[#d13e00]"}
    >
      {authenticated ? 'Desconectar Strava' : 'Conectar con Strava'}
    </Button>
  );
};

export default StravaConnectButton;
