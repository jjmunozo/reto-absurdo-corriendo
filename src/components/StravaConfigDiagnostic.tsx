
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const StravaConfigDiagnostic: React.FC = () => {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const runDiagnostic = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      console.log('🔧 Ejecutando diagnóstico de configuración...');
      
      // Importar dinámicamente para poder acceder a las credenciales
      const { getStravaRuns } = await import('@/services/stravaApiService');
      
      const runs = await getStravaRuns();
      setTestResult(`✅ Éxito: ${runs.length} carreras cargadas`);
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
          Verifica que las credenciales de Strava estén correctamente configuradas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Las credenciales de Strava están hardcodeadas en 
            <code className="bg-muted px-1 rounded">src/services/stravaApiService.ts</code>.
            Necesitas actualizar los valores reales de ACCESS_TOKEN, CLIENT_SECRET y REFRESH_TOKEN.
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

        <div className="space-y-2">
          <h4 className="font-medium">Pasos para configurar:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Abre <code className="bg-muted px-1 rounded">src/services/stravaApiService.ts</code></li>
            <li>Reemplaza los valores de <code className="bg-muted px-1 rounded">STRAVA_CONFIG</code></li>
            <li>Usa las credenciales reales de la cuenta de Juan</li>
            <li>Ejecuta este diagnóstico para verificar</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default StravaConfigDiagnostic;
