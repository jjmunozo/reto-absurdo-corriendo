
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';

const StravaConfigDiagnostic: React.FC = () => {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setTesting(true);
    setTestResult(null);
    setErrorDetails(null);
    
    try {
      console.log('🔧 Ejecutando diagnóstico...');
      
      const { getStravaRuns } = await import('@/services/stravaApiService');
      const runs = await getStravaRuns();
      
      setTestResult(`✅ Éxito: ${runs.length} carreras cargadas`);
      
      if (runs.length === 0) {
        setErrorDetails('Conexión exitosa pero 0 actividades. Posibles causas: 1) No hay carreras registradas en Strava, 2) Token sin permisos de lectura, 3) Configuración incorrecta.');
      }
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setTestResult(`❌ Error: ${errorMessage}`);
      
      if (errorMessage.includes('activity:read_permission')) {
        setErrorDetails('El token de acceso no tiene permisos para leer actividades. Necesitas generar un nuevo token con scope "read,activity:read_all".');
      } else if (errorMessage.includes('401')) {
        setErrorDetails('Token inválido o expirado. Verifica que las credenciales sean correctas.');
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Diagnóstico de Configuración Strava
        </CardTitle>
        <CardDescription>
          Verifica la conexión y permisos de Strava
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Estado:</strong> Las credenciales están en 
            <code className="bg-muted px-1 rounded ml-1">src/services/stravaApiService.ts</code>.
            Si ves "0 carreras cargadas", probablemente el token no tiene permisos de lectura.
          </AlertDescription>
        </Alert>
        
        <Button 
          onClick={runDiagnostic} 
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Probando conexión...' : 'Probar Conexión a Strava'}
        </Button>

        {testResult && (
          <Alert variant={testResult.startsWith('✅') ? 'default' : 'destructive'}>
            {testResult.startsWith('✅') ? 
              <CheckCircle2 className="h-4 w-4" /> : 
              <AlertCircle className="h-4 w-4" />
            }
            <AlertDescription>
              {testResult}
            </AlertDescription>
          </Alert>
        )}

        {errorDetails && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Detalles:</strong> {errorDetails}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <h4 className="font-medium">Solución al problema de permisos:</h4>
          
          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription>
              <strong>Paso 1:</strong> Ve a{' '}
              <a 
                href="https://www.strava.com/settings/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Strava API Settings
              </a>
            </AlertDescription>
          </Alert>
          
          <div className="bg-muted p-3 rounded text-sm space-y-1">
            <p><strong>Paso 2:</strong> Genera un nuevo token con estos scopes:</p>
            <code className="block bg-background p-2 rounded border">
              read,activity:read_all
            </code>
          </div>
          
          <div className="bg-muted p-3 rounded text-sm">
            <p><strong>Paso 3:</strong> Reemplaza el ACCESS_TOKEN en el código con el nuevo token</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StravaConfigDiagnostic;
