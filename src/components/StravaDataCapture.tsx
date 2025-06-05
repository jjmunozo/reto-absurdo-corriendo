
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Info } from 'lucide-react';
import { useStravaRuns } from '@/hooks/useStravaRuns';

const StravaDataCapture: React.FC = () => {
  const { runs, isLoading, isError } = useStravaRuns();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Estado de Datos de Strava
        </CardTitle>
        <CardDescription>
          El sistema ahora obtiene datos automáticamente desde el backend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Estado actual del sistema:</h4>
          {isLoading ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Cargando datos de Strava...
              </AlertDescription>
            </Alert>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                Error cargando datos. El sistema intentará reconectar automáticamente.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Sistema funcionando correctamente. <strong>{runs.length} actividades</strong> cargadas automáticamente.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">Características del nuevo sistema:</h4>
          <div className="bg-muted p-3 rounded text-sm space-y-1">
            <p>✅ Datos reales de Juan cargados automáticamente</p>
            <p>✅ No requiere autenticación de usuarios</p>
            <p>✅ Actualización automática cada 6 horas</p>
            <p>✅ Cache inteligente para mejor rendimiento</p>
            <p>✅ Obtiene todas las actividades históricas</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StravaDataCapture;
