
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Info, ExternalLink, Copy } from 'lucide-react';

const StravaConfigDiagnostic: React.FC = () => {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const authUrl = `https://www.strava.com/oauth/authorize?client_id=160774&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=read,activity:read_all`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

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
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Problema detectado:</strong> Tu token actual solo tiene scope "read" pero necesitas "activity:read_all" para acceder a las carreras.
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

        <div className="space-y-4">
          <h4 className="font-medium text-lg">🔧 Cómo generar un nuevo token con permisos correctos:</h4>
          
          <div className="space-y-3">
            <Alert>
              <div className="font-medium">Paso 1: Autorizar con scopes correctos</div>
              <p className="text-sm mt-2 mb-3">
                Haz clic en este enlace para autorizar tu aplicación con los permisos correctos:
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(authUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Autorizar en Strava
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(authUrl)}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copiado!' : 'Copiar URL'}
                </Button>
              </div>
            </Alert>
            
            <Alert>
              <div className="font-medium">Paso 2: Obtener el código</div>
              <p className="text-sm mt-2">
                Después de autorizar, serás redirigido a una URL como:
              </p>
              <code className="block bg-muted p-2 rounded text-xs mt-2">
                http://localhost/?state=&code=XXXXXX&scope=read,activity:read_all
              </code>
              <p className="text-sm mt-2">
                <strong>Copia el valor del parámetro "code"</strong> (las X del ejemplo)
              </p>
            </Alert>
            
            <Alert>
              <div className="font-medium">Paso 3: Intercambiar código por token</div>
              <p className="text-sm mt-2 mb-3">
                Usa este comando curl para obtener el nuevo token:
              </p>
              <div className="bg-muted p-3 rounded">
                <code className="text-xs block">
                  curl -X POST https://www.strava.com/oauth/token \<br/>
                  -F client_id=160774 \<br/>
                  -F client_secret=5836512c42bdd300ac801e4b2d81bdff5228d281 \<br/>
                  -F code=TU_CODIGO_AQUI \<br/>
                  -F grant_type=authorization_code
                </code>
              </div>
              <p className="text-sm mt-2">
                Reemplaza "TU_CODIGO_AQUI" con el código del paso 2
              </p>
            </Alert>
            
            <Alert>
              <div className="font-medium">Paso 4: Actualizar el código</div>
              <p className="text-sm mt-2">
                El comando curl te dará una respuesta JSON con el nuevo <code>access_token</code>. 
                Copia ese token y reemplázalo en:
              </p>
              <code className="block bg-muted p-2 rounded text-xs mt-2">
                src/services/stravaApiService.ts → ACCESS_TOKEN
              </code>
            </Alert>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Nota:</strong> Una vez que tengas el nuevo token con scope "activity:read_all", 
            el diagnóstico debería mostrar las carreras cargadas correctamente.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default StravaConfigDiagnostic;
