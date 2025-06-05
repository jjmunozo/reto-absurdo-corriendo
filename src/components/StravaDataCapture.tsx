
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { 
  captureRealStravaData, 
  hasRealDataCaptured, 
  displayRealData,
  getRealAthleteData 
} from '@/services/stravaRealDataCapture';
import { isAuthenticated, getAthleteInfo } from '@/services/stravaService';
import { CheckCircle2, AlertCircle, Download } from 'lucide-react';

const StravaDataCapture: React.FC = () => {
  const [capturing, setCapturing] = useState(false);
  const [hasCapturedData, setHasCapturedData] = useState(hasRealDataCaptured());
  
  const authenticated = isAuthenticated();
  const currentAthlete = getAthleteInfo();
  const realAthlete = getRealAthleteData();
  
  const handleCaptureData = () => {
    if (!authenticated) {
      toast({
        title: "Error",
        description: "Necesitas estar conectado a Strava primero",
        variant: "destructive",
      });
      return;
    }
    
    setCapturing(true);
    
    try {
      const success = captureRealStravaData();
      
      if (success) {
        setHasCapturedData(true);
        displayRealData();
        toast({
          title: "Datos capturados exitosamente",
          description: "Tus datos reales de Strava han sido guardados para la conexión perpetua",
        });
      } else {
        toast({
          title: "Error capturando datos",
          description: "No se pudieron capturar los datos. Asegúrate de estar conectado correctamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error en captura:', error);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al capturar los datos",
        variant: "destructive",
      });
    } finally {
      setCapturing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Captura de Datos Reales
        </CardTitle>
        <CardDescription>
          Captura tus datos reales de Strava para la conexión perpetua
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado actual */}
        <div className="space-y-2">
          <h4 className="font-medium">Estado actual:</h4>
          {authenticated && currentAthlete ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Conectado como: <strong>{currentAthlete.firstname} {currentAthlete.lastname}</strong>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay conexión activa con Strava
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {/* Estado de datos capturados */}
        <div className="space-y-2">
          <h4 className="font-medium">Datos reales capturados:</h4>
          {hasCapturedData && realAthlete ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Datos capturados de: <strong>{realAthlete.firstname} {realAthlete.lastname}</strong>
                <br />
                <span className="text-sm text-muted-foreground">
                  ID: {realAthlete.id} | {realAthlete.city}, {realAthlete.country}
                </span>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay datos reales capturados. Se están usando datos de fallback.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {/* Botón de captura */}
        <div className="space-y-2">
          <Button 
            onClick={handleCaptureData}
            disabled={!authenticated || capturing}
            className="w-full"
          >
            {capturing ? 'Capturando...' : 'Capturar Mis Datos Reales'}
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Esto guardará tus tokens de acceso y datos de perfil para que todos los visitantes 
            vean tus estadísticas reales de Strava sin necesidad de autenticarse.
          </p>
        </div>
        
        {/* Instrucciones */}
        {!authenticated && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Pasos para capturar datos reales:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Conecta con Strava usando el botón "Conectar con Strava"</li>
                <li>Una vez conectado, haz clic en "Capturar Mis Datos Reales"</li>
                <li>Los visitantes verán automáticamente tus datos reales</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default StravaDataCapture;
