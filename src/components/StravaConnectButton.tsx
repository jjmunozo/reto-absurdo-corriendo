
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface StravaConnectButtonProps {
  onConnected?: () => void;
  className?: string;
  showDisconnectButton?: boolean;
}

const StravaConnectButton: React.FC<StravaConnectButtonProps> = ({ className }) => {
  return (
    <div className="space-y-2">
      <Alert className={className}>
        <Info className="w-4 h-4" />
        <AlertDescription>
          <strong>Sistema actualizado:</strong> Los datos de Strava ahora se cargan automáticamente 
          desde el backend. No es necesario conectar o autenticar cuentas.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default StravaConnectButton;
